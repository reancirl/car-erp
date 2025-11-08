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

const futureDateInput = (hoursAhead: number) =>
    new Date(Date.now() + hoursAhead * 60 * 60 * 1000).toISOString().slice(0, 16);

test.describe('Compliance / Reminders', () => {
    test('admin can create, filter, edit, archive, and restore a compliance reminder', async ({ page }) => {
        const timestamp = Date.now();
        const reminderTitle = `Playwright Compliance Reminder ${timestamp}`;
        const updatedTitle = `${reminderTitle} Updated`;
        const description = 'Reminder generated from Playwright to verify compliance reminder workflows.';
        const updatedDescription = 'Reminder updated through Playwright automation.';
        const remindAt = futureDateInput(2);
        const dueAt = futureDateInput(5);
        const escalateAt = futureDateInput(6);
        const updatedRemindAt = futureDateInput(9);
        const updatedDueAt = futureDateInput(12);
        const updatedEscalateAt = futureDateInput(14);

        const rowForReminder = (value: string) => page.locator('table tbody tr').filter({ hasText: value });

        await loginAsPlaywrightUser(page);

        await page.goto('/compliance/reminders');
        const pageHeading = page.getByRole('heading', { name: 'Compliance Reminders' });
        await expect(pageHeading).toBeVisible();

        const refreshButton = page.getByRole('button', { name: 'Refresh' });
        await refreshButton.click();
        await expect(pageHeading).toBeVisible();

        const openCreateForm = async () => {
            await Promise.all([
                page.waitForURL('**/compliance/reminders/create'),
                page.getByRole('button', { name: 'New Reminder' }).first().click(),
            ]);
            await expect(page.getByRole('heading', { name: 'New Compliance Reminder' })).toBeVisible();
        };

        await openCreateForm();

        await Promise.all([
            page.waitForURL(/\/compliance\/reminders(\?.*)?$/),
            page.getByRole('button', { name: 'Cancel' }).click(),
        ]);

        await openCreateForm();

        const branchTrigger = selectTriggerByLabel(page, 'Branch *');
        if ((await branchTrigger.count()) > 0) {
            await chooseSelectOption(page, branchTrigger, /Headquarters/i);
        }

        await page.getByLabel('Title *', { exact: true }).fill(reminderTitle);
        await page.getByLabel('Description').fill(description);

        await chooseSelectOption(page, selectTriggerByLabel(page, 'Type *'), 'Checklist Due');
        await chooseSelectOption(page, selectTriggerByLabel(page, 'Priority *'), 'High');
        await chooseSelectOption(page, selectTriggerByLabel(page, 'Status *'), 'Scheduled');

        await page.getByLabel('Remind At *', { exact: true }).fill(remindAt);
        await page.getByLabel('Due At').fill(dueAt);

        await chooseSelectOption(page, selectTriggerByLabel(page, 'Primary Channel *'), 'SMS');

        const pushCheckbox = page.locator('label', { hasText: 'PUSH' }).locator('[data-slot="checkbox"]').first();
        await setCheckboxState(pushCheckbox, true);

        const assignedUserTrigger = selectTriggerByLabel(page, 'Assigned User');
        await chooseSelectOption(page, assignedUserTrigger, 'Unassigned');
        await page.getByLabel('Assigned Role').fill('branch_compliance_lead');

        const autoEscalateSwitch = page.getByRole('switch').first();
        await setSwitchState(autoEscalateSwitch, true);

        const escalateUserTrigger = selectTriggerByLabel(page, 'Escalate To User');
        await chooseSelectOption(page, escalateUserTrigger, 'No user');
        await page.getByLabel('Escalate To Role').fill('regional_auditor');
        await page.getByLabel('Escalate After').fill(escalateAt);

        await Promise.all([
            page.waitForURL(/\/compliance\/reminders(\?.*)?$/),
            page.getByRole('button', { name: 'Save Reminder' }).click(),
        ]);

        await expect(page.getByRole('alert').first()).toContainText('Reminder created successfully');

        const searchInput = page.getByLabel('Search');
        const applyFiltersButton = page.getByRole('button', { name: 'Apply Filters' });
        const resetFiltersButton = page.getByRole('button', { name: 'Reset' });
        const includeArchivedCheckbox = page.locator('#include_deleted');

        await searchInput.fill(reminderTitle);
        await applyFiltersButton.click();

        const createdRow = rowForReminder(reminderTitle);
        await expect(createdRow).toHaveCount(1);
        await expect(createdRow.first()).toContainText('Checklist Due');
        await expect(createdRow.first()).toContainText('Priority: high');
        await expect(createdRow.first()).toContainText('Auto Escalate');
        await expect(createdRow.first()).toContainText('branch_compliance_lead');

        await Promise.all([
            page.waitForURL(/\/compliance\/reminders(\?.*)?$/),
            resetFiltersButton.click(),
        ]);
        await expect(searchInput).toHaveValue('');

        await searchInput.fill(reminderTitle);
        await applyFiltersButton.click();
        await expect(rowForReminder(reminderTitle)).toHaveCount(1);

        const statusFilterTrigger = selectTriggerByLabel(page, 'Status');

        await chooseSelectOption(page, statusFilterTrigger, 'Sent');
        await applyFiltersButton.click();
        await expect(rowForReminder(reminderTitle)).toHaveCount(0);

        await chooseSelectOption(page, statusFilterTrigger, 'All Statuses');
        await applyFiltersButton.click();

        await searchInput.fill(reminderTitle);
        await applyFiltersButton.click();
        await expect(rowForReminder(reminderTitle)).toHaveCount(1);

        const viewLink = rowForReminder(reminderTitle)
            .first()
            .locator('a[href^="/compliance/reminders/"]')
            .first();

        await viewLink.click();
        await expect(page).toHaveURL(/\/compliance\/reminders\/\d+$/);

        await expect(page.getByRole('heading', { name: reminderTitle })).toBeVisible();
        await expect(page.getByText(description)).toBeVisible();

        await Promise.all([
            page.waitForURL(/\/compliance\/reminders\/\d+\/edit$/),
            page.getByRole('button', { name: 'Edit' }).click(),
        ]);

        await expect(page.getByRole('heading', { name: 'Edit Reminder' })).toBeVisible();

        await page.getByLabel('Title *', { exact: true }).fill(updatedTitle);
        await page.getByLabel('Description').fill(updatedDescription);
        await chooseSelectOption(page, selectTriggerByLabel(page, 'Type *'), 'Escalation');
        await chooseSelectOption(page, selectTriggerByLabel(page, 'Priority *'), 'Critical');
        await chooseSelectOption(page, selectTriggerByLabel(page, 'Status *'), 'Pending');

        await page.getByLabel('Remind At *', { exact: true }).fill(updatedRemindAt);
        await page.getByLabel('Due At').fill(updatedDueAt);
        await chooseSelectOption(page, selectTriggerByLabel(page, 'Primary Channel *'), 'EMAIL');

        const pushCheckboxInEdit = page.locator('label', { hasText: 'PUSH' }).locator('[data-slot="checkbox"]').first();
        await setCheckboxState(pushCheckboxInEdit, false);
        const inAppCheckbox = page.locator('label', { hasText: 'IN_APP' }).locator('[data-slot="checkbox"]').first();
        await setCheckboxState(inAppCheckbox, true);

        const editAutoEscalateSwitch = page.getByRole('switch').first();
        await setSwitchState(editAutoEscalateSwitch, true);
        await page.getByLabel('Escalate To Role').fill('regional_director');
        await page.getByLabel('Escalate After').fill(updatedEscalateAt);

        await Promise.all([
            page.waitForURL(/\/compliance\/reminders\/\d+$/),
            page.getByRole('button', { name: 'Save Changes' }).click(),
        ]);

        await expect(page.getByRole('alert').first()).toContainText('Reminder updated successfully');
        await expect(page.getByRole('heading', { name: updatedTitle })).toBeVisible();

        await Promise.all([
            page.waitForURL(/\/compliance\/reminders(\?.*)?$/),
            page.getByRole('link', { name: 'Back to list' }).click(),
        ]);

        await searchInput.fill(updatedTitle);
        await applyFiltersButton.click();

        const updatedRow = rowForReminder(updatedTitle);
        await expect(updatedRow).toHaveCount(1);
        await expect(updatedRow.first()).toContainText('Escalation');
        await expect(updatedRow.first()).toContainText('Priority: critical');
        await expect(updatedRow.first()).toContainText('EMAIL');

        const actionButtons = updatedRow.first().locator('button');
        page.once('dialog', (dialog) => dialog.accept());
        await actionButtons.last().click();

        await expect(page.getByRole('alert').first()).toContainText('Reminder archived successfully');

        await expect(rowForReminder(updatedTitle)).toHaveCount(0);

        await setCheckboxState(includeArchivedCheckbox, true);
        await applyFiltersButton.click();

        const archivedRow = rowForReminder(updatedTitle);
        await expect(archivedRow).toHaveCount(1);
        await expect(archivedRow.first()).toContainText('Archived');
    });
});
