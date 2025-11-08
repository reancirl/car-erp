import { expect, test, type Locator, type Page } from '@playwright/test';
import { loginAsPlaywrightUser } from '../utils/auth';

const selectTriggerByLabel = (page: Page, labelText: string) =>
    page
        .locator('label', { hasText: labelText })
        .first()
        .locator('..')
        .locator('[data-slot="select-trigger"]')
        .first();

const chooseSelectOption = async (
    page: Page,
    trigger: Locator,
    optionLabel: string | RegExp,
    fallbackLabel?: string
) => {
    if ((await trigger.count()) === 0) return;

    try {
        await page.keyboard.press('Escape');
    } catch {
        // ignore if nothing focused
    }

    await trigger.click();

    const optionLocator =
        typeof optionLabel === 'string'
            ? page.getByRole('option', { name: optionLabel, exact: true })
            : page.getByRole('option', { name: optionLabel });

    if (await optionLocator.count()) {
        await optionLocator.first().click();
        return;
    }

    if (fallbackLabel) {
        const fallbackOption = page.getByRole('option', { name: fallbackLabel, exact: true });
        if (await fallbackOption.count()) {
            await fallbackOption.first().click();
            return;
        }
    }

    await page.getByRole('option').first().click();
};

const setCheckboxState = async (checkbox: Locator, shouldBeChecked: boolean) => {
    if ((await checkbox.count()) === 0) return;
    const state = await checkbox.getAttribute('data-state');
    const isChecked = state === 'checked';

    if (isChecked !== shouldBeChecked) {
        await checkbox.click();
    }
};

const setSwitchState = async (toggle: Locator, shouldBeOn: boolean) => {
    if ((await toggle.count()) === 0) return;
    const state = await toggle.getAttribute('data-state');
    const isOn = state === 'checked';

    if (isOn !== shouldBeOn) {
        await toggle.click();
    }
};

const futureDate = (daysAhead: number) =>
    new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

test.describe('Compliance / Checklists', () => {
    test('admin can create, view, update, filter, and archive a compliance checklist', async ({ page }) => {
        const timestamp = Date.now();
        const checklistTitle = `Playwright Compliance Checklist ${timestamp}`;
        const updatedChecklistTitle = `${checklistTitle} Updated`;
        const checklistCode = `PCC-${timestamp.toString().slice(-6)}`;
        const updatedChecklistCode = `${checklistCode}-UPD`;
        const checklistDescription =
            'Checklist generated via Playwright to validate the compliance checklist workflow.';
        const updatedChecklistDescription = 'Checklist updated through automated test coverage.';
        const itemTitle = `Inspect emergency exits ${timestamp}`;
        const updatedItemTitle = `${itemTitle} - Updated`;
        const startDate = futureDate(2);
        const updatedStartDate = futureDate(5);
        const dueTime = '10:30';
        const updatedDueTime = '15:00';

        const rowForChecklist = (value: string) =>
            page.locator('table tbody tr').filter({ hasText: value });

        await loginAsPlaywrightUser(page);

        await page.goto('/compliance/checklists');
        const heading = page.getByRole('heading', { name: 'Compliance Checklists' });
        await expect(heading).toBeVisible();

        const filterForm = page
            .locator('form')
            .filter({ has: page.getByPlaceholder('Search by title, code, or category') })
            .first();
        const applyFiltersButton = filterForm.getByRole('button', { name: 'Apply Filters' });
        const filterSelects = filterForm.locator('[data-slot="select-trigger"]');
        const statusFilterTrigger = filterSelects.nth(0);
        const frequencyFilterTrigger = filterSelects.nth(1);
        const assignedFilterTrigger = filterSelects.nth(2);
        const branchFilterTrigger = filterSelects.nth(3);
        const searchInput = page.getByPlaceholder('Search by title, code, or category');
        const includeArchivedCheckbox = page.locator('#include_deleted');

        await Promise.all([
            page.waitForURL('**/compliance/checklists/create'),
            page.getByRole('link', { name: 'New Checklist' }).click(),
        ]);
        await expect(page.getByRole('heading', { name: 'Create Compliance Checklist' })).toBeVisible();

        const branchSelect = page
            .locator('[data-slot="select-trigger"]')
            .filter({ hasText: 'Select branch' })
            .first();
        if (await branchSelect.count()) {
            await branchSelect.click();
            await page.getByRole('option', { name: 'Headquarters (HQ)', exact: true }).click();
        }

        await page.getByPlaceholder('e.g., Monthly Fire Safety Inspection').fill(checklistTitle);
        await page.getByPlaceholder('Optional code').fill(checklistCode);
        await page
            .getByPlaceholder('Outline the scope, checkpoints, and references for this checklist.')
            .fill(checklistDescription);

        await chooseSelectOption(page, selectTriggerByLabel(page, 'Category'), 'Data Protection');
        await chooseSelectOption(page, selectTriggerByLabel(page, 'Status'), 'Active');
        await setSwitchState(page.locator('#requires_acknowledgement'), true);

        await chooseSelectOption(page, selectTriggerByLabel(page, 'Frequency'), 'Monthly');
        await page
            .locator('label', { hasText: 'Interval' })
            .first()
            .locator('..')
            .locator('input')
            .first()
            .fill('1');

        await page
            .locator('label', { hasText: 'Start Date' })
            .first()
            .locator('..')
            .locator('input[type="date"]')
            .first()
            .fill(startDate);

        await page
            .locator('label', { hasText: 'Due Time' })
            .first()
            .locator('..')
            .locator('input[type="time"]')
            .first()
            .fill(dueTime);

        await setSwitchState(page.locator('#allow_partial_completion'), false);

        await page.getByPlaceholder('Checklist item title').first().fill(itemTitle);
        await page
            .getByPlaceholder('Describe what needs to be verified or captured.')
            .first()
            .fill('Verify the condition of all safety equipment in the showroom.');

        await page.getByPlaceholder('e.g., 24').fill('24');
        await page.getByRole('button', { name: /^Add$/ }).click();

        await chooseSelectOption(page, selectTriggerByLabel(page, 'Assigned User'), 'Playwright Login Tester');
        await chooseSelectOption(page, selectTriggerByLabel(page, 'Assigned Role'), 'admin');

        await Promise.all([
            page.waitForURL(/\/compliance\/checklists(\?.*)?$/),
            page.getByRole('button', { name: 'Save Checklist' }).click(),
        ]);
        await expect(page.getByRole('alert').first()).toContainText('Compliance checklist created successfully');

        await searchInput.fill(checklistTitle);
        await applyFiltersButton.click();

        const createdRow = rowForChecklist(checklistTitle);
        await expect(createdRow).toHaveCount(1);
        await expect(createdRow.first()).toContainText('Headquarters');
        await expect(createdRow.first()).toContainText('Monthly');
        await expect(createdRow.first()).toContainText('Active');

        await Promise.all([
            page.waitForURL(/\/compliance\/checklists\/\d+$/),
            createdRow
                .first()
                .locator('a[href^="/compliance/checklists/"]')
                .first()
                .click(),
        ]);

        await expect(page.getByRole('heading', { name: checklistTitle })).toBeVisible();
        await expect(page.getByText(`Reference Code: ${checklistCode}`)).toBeVisible();

        await Promise.all([
            page.waitForURL(/\/compliance\/checklists\/\d+\/edit$/),
            page.getByRole('button', { name: 'Edit Checklist' }).click(),
        ]);
        await expect(page.getByRole('heading', { name: 'Edit Checklist' })).toBeVisible();

        await page.getByPlaceholder('Checklist title').fill(updatedChecklistTitle);
        await page.getByPlaceholder('Optional code').fill(updatedChecklistCode);
        await page
            .locator('label', { hasText: 'Description' })
            .first()
            .locator('..')
            .locator('textarea')
            .first()
            .fill(updatedChecklistDescription);

        await chooseSelectOption(page, selectTriggerByLabel(page, 'Category'), 'Quality Assurance');
        await chooseSelectOption(page, selectTriggerByLabel(page, 'Status'), 'Inactive');

        await chooseSelectOption(page, selectTriggerByLabel(page, 'Frequency'), 'Weekly');
        await page
            .locator('label', { hasText: 'Interval' })
            .first()
            .locator('..')
            .locator('input')
            .first()
            .fill('2');
        await page
            .locator('label', { hasText: 'Start Date' })
            .first()
            .locator('..')
            .locator('input[type="date"]')
            .first()
            .fill(updatedStartDate);
        await page
            .locator('label', { hasText: 'Due Time' })
            .first()
            .locator('..')
            .locator('input[type="time"]')
            .first()
            .fill(updatedDueTime);
        await setSwitchState(page.locator('#allow_partial_completion'), true);

        const firstItemCard = page
            .locator('div.border.rounded-lg')
            .filter({ has: page.locator('span', { hasText: /^Item 1/ }) })
            .first();
        await firstItemCard.locator('input').first().fill(updatedItemTitle);
        await firstItemCard.locator('textarea').first().fill('Updated checklist item notes for regression coverage.');

        await chooseSelectOption(page, selectTriggerByLabel(page, 'Assigned User'), 'Admin User');
        await chooseSelectOption(page, selectTriggerByLabel(page, 'Assigned Role'), 'auditor');

        await page.getByPlaceholder('e.g., 24').fill('12');
        await page.getByRole('button', { name: /^Add$/ }).click();

        await Promise.all([
            page.waitForURL(/\/compliance\/checklists\/\d+\/edit$/),
            page.getByRole('button', { name: 'Save Changes' }).click(),
        ]);
        await expect(page.getByRole('alert').first()).toContainText('Compliance checklist updated successfully');

        await Promise.all([
            page.waitForURL(/\/compliance\/checklists(\?.*)?$/),
            page.getByRole('button', { name: 'Back to Checklists' }).click(),
        ]);

        await searchInput.fill(updatedChecklistTitle);
        await applyFiltersButton.click();

        const updatedRow = rowForChecklist(updatedChecklistTitle);
        await expect(updatedRow).toHaveCount(1);
        await expect(updatedRow.first()).toContainText('Quality Assurance');
        await expect(updatedRow.first()).toContainText('Weekly');
        await expect(updatedRow.first()).toContainText('Inactive');

        await chooseSelectOption(page, statusFilterTrigger, 'Inactive');
        await applyFiltersButton.click();
        await expect(updatedRow).toHaveCount(1);

        await chooseSelectOption(page, statusFilterTrigger, 'Active');
        await applyFiltersButton.click();
        await expect(rowForChecklist(updatedChecklistTitle)).toHaveCount(0);

        await chooseSelectOption(page, statusFilterTrigger, 'All Statuses');
        await applyFiltersButton.click();

        await chooseSelectOption(page, frequencyFilterTrigger, 'Weekly');
        await applyFiltersButton.click();
        await expect(rowForChecklist(updatedChecklistTitle)).toHaveCount(1);

        await chooseSelectOption(page, frequencyFilterTrigger, 'Monthly');
        await applyFiltersButton.click();
        await expect(rowForChecklist(updatedChecklistTitle)).toHaveCount(0);

        await chooseSelectOption(page, frequencyFilterTrigger, 'All Frequencies');
        await applyFiltersButton.click();

        await chooseSelectOption(page, assignedFilterTrigger, 'Admin User');
        await applyFiltersButton.click();
        await expect(rowForChecklist(updatedChecklistTitle)).toHaveCount(1);

        await chooseSelectOption(page, assignedFilterTrigger, 'All Assignees');
        await applyFiltersButton.click();

        await chooseSelectOption(page, branchFilterTrigger, 'Headquarters (HQ)');
        await applyFiltersButton.click();
        await expect(rowForChecklist(updatedChecklistTitle)).toHaveCount(1);

        await chooseSelectOption(page, branchFilterTrigger, 'Cebu Branch (CEB)');
        await applyFiltersButton.click();
        await expect(rowForChecklist(updatedChecklistTitle)).toHaveCount(0);

        await chooseSelectOption(page, branchFilterTrigger, 'All Branches');
        await applyFiltersButton.click();

        const deleteButton = rowForChecklist(updatedChecklistTitle).first().locator('button').last();

        page.once('dialog', (dialog) => dialog.accept());
        await deleteButton.click();
        await expect(page.getByRole('alert').first()).toContainText('Checklist moved to archive successfully.');

        await expect(rowForChecklist(updatedChecklistTitle)).toHaveCount(0);

        await setCheckboxState(includeArchivedCheckbox, true);
        await applyFiltersButton.click();

        const archivedRow = rowForChecklist(updatedChecklistTitle);
        await expect(archivedRow).toHaveCount(1);
        await expect(archivedRow.first()).toContainText('Archived');
    });
});
