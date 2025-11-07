import { expect, test } from '@playwright/test';
import { loginAsPlaywrightUser } from '../utils/auth';

test.describe('Sales / Lead Management', () => {
    test('admin can create, update, filter, and delete a lead', async ({ page }) => {
        const timestamp = Date.now();
        const initialLeadName = `Playwright Lead ${timestamp}`;
        const updatedLeadName = `${initialLeadName} Updated`;
        const initialEmail = `pw-lead-${timestamp}@gmail.com`;
        const updatedEmail = `pw-lead-${timestamp}-updated@gmail.com`;
        const formatPhone = (seed: number) => {
            const digits = `${seed}`.padStart(10, '0').slice(-10);
            return `+63-${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
        };

        const initialPhone = formatPhone(timestamp);
        const updatedPhone = formatPhone(timestamp + 987654);
        const followUpDate = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);
        const branchSelectOption = 'Headquarters (HQ)';
        const branchFilterMatch = 'Headquarters';
        const alternateBranchFilter = 'Cebu Branch';
        const locationOption = 'Region VII - Central Visayas';

        const rowForEmail = (value: string) =>
            page.locator('table tbody tr').filter({ hasText: value });

        const selectTriggerByLabel = (labelText: string) =>
            page.locator('label', { hasText: labelText }).first()
                .locator('..')
                .locator('[data-slot="select-trigger"]')
                .first();

        await loginAsPlaywrightUser(page);

        await page.goto('/sales/lead-management');
        await expect(page.getByRole('heading', { name: 'Lead Management' })).toBeVisible();

        await page.getByRole('link', { name: 'Add Lead' }).first().click();
        await page.waitForURL('**/sales/lead-management/create');
        await expect(page.getByRole('heading', { name: 'Create New Lead' })).toBeVisible();

        const branchSelect = selectTriggerByLabel('Branch *');
        await branchSelect.click();
        await page.getByRole('option', { name: branchSelectOption, exact: true }).click();

        await page.getByLabel('Full Name *', { exact: true }).fill(initialLeadName);
        await page.getByLabel('Email Address *', { exact: true }).fill(initialEmail);
        await page.getByLabel('Phone Number *', { exact: true }).fill(initialPhone);

        const locationSelect = selectTriggerByLabel('Location / Region');
        await locationSelect.click();
        await page.getByRole('option', { name: locationOption, exact: true }).click();

        const sourceSelect = selectTriggerByLabel('Lead Source *');
        await sourceSelect.click();
        await page.getByRole('option', { name: 'Walk-in', exact: true }).click();

        const statusSelect = selectTriggerByLabel('Initial Status');
        await statusSelect.click();
        await page.getByRole('option', { name: 'Hot', exact: true }).click();

        const prioritySelect = selectTriggerByLabel('Priority');
        await prioritySelect.click();
        await page.getByRole('option', { name: 'Urgent', exact: true }).click();

        await page.getByRole('button', { name: 'Create Lead' }).click();
        await expect(page).toHaveURL(/\/sales\/lead-management(\?.*)?$/);

        const searchInput = page.getByPlaceholder('Search by name, email, phone, or lead ID...');
        const applyFiltersButton = page.getByRole('button', { name: 'Apply Filters' });
        const filterForm = page.locator('form', { has: searchInput }).first();
        const filterSelects = filterForm.locator('[data-slot="select-trigger"]');
        const branchFilter = filterSelects.nth(0);
        const sourceFilter = filterSelects.nth(1);
        const statusFilter = filterSelects.nth(2);
        const leadScoreFilter = filterSelects.nth(3);

        await searchInput.fill(initialEmail);
        await applyFiltersButton.click();

        const createdRow = rowForEmail(initialEmail);
        await expect(createdRow).toHaveCount(1);
        await expect(createdRow.first()).toContainText(initialLeadName);
        await expect(createdRow.first()).toContainText(branchFilterMatch);
        await expect(createdRow.first()).toContainText('Hot');

        await createdRow.first().locator('a[href$="/edit"]').click();
        await page.waitForURL(/\/sales\/lead-management\/\d+\/edit$/);
        await expect(page.getByRole('heading', { name: /Edit Lead/ })).toBeVisible();

        await page.getByLabel('Full Name *', { exact: true }).fill(updatedLeadName);
        await page.getByLabel('Email Address *', { exact: true }).fill(updatedEmail);
        await page.getByLabel('Phone Number *', { exact: true }).fill(updatedPhone);

        const editStatusSelect = selectTriggerByLabel('Lead Status');
        await editStatusSelect.click();
        await page.getByRole('option', { name: 'Qualified', exact: true }).click();

        const editPrioritySelect = selectTriggerByLabel('Priority');
        await editPrioritySelect.click();
        await page.getByRole('option', { name: 'Urgent', exact: true }).click();

        await page.getByLabel('Next Follow-up Date & Time').fill(followUpDate);

        const contactMethodSelect = selectTriggerByLabel('Preferred Contact Method');
        await contactMethodSelect.click();
        await page.getByRole('option', { name: 'Email', exact: true }).click();

        await page.getByLabel('Notes').fill('Lead updated via Playwright automation.');

        await page.getByRole('button', { name: 'Save Changes' }).click();
        await expect(page.getByRole('alert').first()).toContainText('Lead');
        await expect(page).toHaveURL(/\/sales\/lead-management(\?.*)?$/);

        await searchInput.fill(updatedEmail);
        await applyFiltersButton.click();

        const updatedRow = rowForEmail(updatedEmail);
        await expect(updatedRow).toHaveCount(1);
        await expect(updatedRow.first()).toContainText(updatedLeadName);
        await expect(updatedRow.first()).toContainText('Qualified');

        const branchMatchRow = updatedRow;

        await branchFilter.click();
        await page.getByRole('option', { name: branchFilterMatch, exact: true }).click();
        await applyFiltersButton.click();
        await expect(branchMatchRow).toHaveCount(1);

        await branchFilter.click();
        await page.getByRole('option', { name: alternateBranchFilter, exact: true }).click();
        await applyFiltersButton.click();
        await expect(branchMatchRow).toHaveCount(0);

        await branchFilter.click();
        await page.getByRole('option', { name: 'All Branches', exact: true }).click();
        await applyFiltersButton.click();
        await expect(branchMatchRow).toHaveCount(1);

        await statusFilter.click();
        await page.getByRole('option', { name: 'Qualified', exact: true }).click();
        await applyFiltersButton.click();
        await expect(branchMatchRow).toHaveCount(1);

        await statusFilter.click();
        await page.getByRole('option', { name: 'Hot', exact: true }).click();
        await applyFiltersButton.click();
        await expect(branchMatchRow).toHaveCount(0);

        await statusFilter.click();
        await page.getByRole('option', { name: 'All Status', exact: true }).click();
        await applyFiltersButton.click();
        await expect(branchMatchRow).toHaveCount(1);

        await sourceFilter.click();
        await page.getByRole('option', { name: 'Walk-in', exact: true }).click();
        await applyFiltersButton.click();
        await expect(branchMatchRow).toHaveCount(1);

        await sourceFilter.click();
        await page.getByRole('option', { name: 'Phone', exact: true }).click();
        await applyFiltersButton.click();
        await expect(branchMatchRow).toHaveCount(0);

        await sourceFilter.click();
        await page.getByRole('option', { name: 'All Sources', exact: true }).click();
        await applyFiltersButton.click();
        await expect(branchMatchRow).toHaveCount(1);

        await leadScoreFilter.click();
        await page.getByRole('option', { name: 'High (80+)', exact: true }).click();
        await applyFiltersButton.click();
        await expect(branchMatchRow).toHaveCount(1);

        await leadScoreFilter.click();
        await page.getByRole('option', { name: 'Medium (60-79)', exact: true }).click();
        await applyFiltersButton.click();
        await expect(branchMatchRow).toHaveCount(0);

        await leadScoreFilter.click();
        await page.getByRole('option', { name: 'All Scores', exact: true }).click();
        await applyFiltersButton.click();
        await expect(branchMatchRow).toHaveCount(1);

        page.once('dialog', (dialog) => dialog.accept());
        await branchMatchRow.first().locator('button').last().click();
        await expect(page.getByRole('alert').first()).toContainText('Lead');

        await searchInput.fill(updatedEmail);
        await applyFiltersButton.click();
        await expect(rowForEmail(updatedEmail)).toHaveCount(0);
    });
});
