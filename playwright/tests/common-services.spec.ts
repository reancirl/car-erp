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

test.describe('Service / Common Services', () => {
    test('admin can create, view, update, filter, delete, and restore a common service', async ({ page }) => {
        const timestamp = Date.now();
        const serviceName = `Playwright Common Service ${timestamp}`;
        const updatedServiceName = `${serviceName} - Updated`;
        const serviceCode = `PWCS-${timestamp.toString().slice(-6)}`;
        const description = 'Common service created through Playwright automation.';
        const updatedDescription = 'Common service updated to verify edit capabilities.';
        const updatedDuration = '3.75';
        const updatedPrice = '2750';

        const rowForService = () =>
            page.locator('table tbody tr').filter({ hasText: serviceCode });

        await loginAsPlaywrightUser(page);

        await page.goto('/service/common-services');
        await expect(page.getByRole('heading', { name: 'Common Services' })).toBeVisible();

        const openCreateForm = async () => {
            await Promise.all([
                page.waitForURL('**/service/common-services/create'),
                page.getByRole('link', { name: 'New Common Service' }).first().click(),
            ]);
            await expect(page.getByRole('heading', { name: 'Create Common Service' })).toBeVisible();
        };

        await openCreateForm();

        await Promise.all([
            page.waitForURL(/\/service\/common-services(\?.*)?$/),
            page.getByRole('link', { name: 'Cancel' }).first().click(),
        ]);

        await openCreateForm();

        const branchTrigger = selectTriggerByLabel(page, 'Branch *');
        if ((await branchTrigger.count()) > 0) {
            await chooseSelectOption(page, branchTrigger, 'Headquarters (HQ)');
        }

        await page.getByLabel('Service Name *').fill(serviceName);
        await page.getByLabel('Service Code').fill(serviceCode);
        await page.getByLabel('Description').fill(description);

        const categoryTrigger = selectTriggerByLabel(page, 'Category *');
        await chooseSelectOption(page, categoryTrigger, 'Maintenance');

        await page.getByLabel('Estimated Duration (hours) *').fill('2.50');
        await page.getByLabel('Standard Price *').fill('1950');

        const activeSwitch = page.getByRole('switch').first();
        await setSwitchState(activeSwitch, true);

        await Promise.all([
            page.waitForURL(/\/service\/common-services(\?.*)?$/),
            page.getByRole('button', { name: 'Create Service' }).click(),
        ]);

        await expect(page.getByRole('alert').first()).toContainText('Common service created');

        const searchInput = page.getByPlaceholder('Search by service name or code');
        const applyFiltersButton = page.getByRole('button', { name: 'Apply Filters' });

        await searchInput.fill(serviceCode);
        await applyFiltersButton.click();

        const createdRow = rowForService();
        await expect(createdRow).toHaveCount(1);
        await expect(createdRow.first()).toContainText(serviceName);
        await expect(createdRow.first()).toContainText('Maintenance');
        await expect(createdRow.first()).toContainText('Active');

        const actionCell = createdRow.first().locator('td').last();
        await Promise.all([
            page.waitForURL(/\/service\/common-services\/\d+$/),
            actionCell.locator('a').first().click(),
        ]);

        await expect(page.getByRole('heading', { name: serviceName })).toBeVisible();
        await expect(page.getByText(serviceCode)).toBeVisible();

        await Promise.all([
            page.waitForURL(/\/service\/common-services(\?.*)?$/),
            page.getByRole('link', { name: 'Back to Common Services' }).first().click(),
        ]);

        await searchInput.fill(serviceCode);
        await applyFiltersButton.click();

        const rowAfterBack = rowForService();
        await expect(rowAfterBack).toHaveCount(1);

        await Promise.all([
            page.waitForURL(/\/service\/common-services\/\d+\/edit$/),
            rowAfterBack
                .first()
                .locator('a[href*="/service/common-services/"][href$="/edit"]')
                .first()
                .click(),
        ]);

        await expect(page.getByRole('heading', { name: 'Edit Common Service' })).toBeVisible();

        await page.getByLabel('Service Name *').fill(updatedServiceName);
        await page.getByLabel('Description').fill(updatedDescription);
        const editCategoryTrigger = selectTriggerByLabel(page, 'Category *');
        await chooseSelectOption(page, editCategoryTrigger, 'Repair');
        await page.getByLabel('Estimated Duration (hours) *').fill(updatedDuration);
        await page.getByLabel('Standard Price *').fill(updatedPrice);
        const editSwitch = page.getByRole('switch').first();
        await setSwitchState(editSwitch, false);

        await Promise.all([
            page.waitForURL(/\/service\/common-services(\?.*)?$/),
            page.getByRole('button', { name: 'Save Changes' }).click(),
        ]);

        await expect(page.getByRole('alert').first()).toContainText('Common service updated');

        await searchInput.fill(serviceCode);
        await applyFiltersButton.click();

        const updatedRow = rowForService();
        await expect(updatedRow).toHaveCount(1);
        await expect(updatedRow.first()).toContainText(updatedServiceName);
        await expect(updatedRow.first()).toContainText('Repair');
        await expect(updatedRow.first()).toContainText('Inactive');

        const filterForm = page.locator('form', { has: searchInput }).first();
        const filterComboboxes = filterForm.getByRole('combobox');
        const categoryFilter = filterComboboxes.nth(0);
        const statusFilter = filterComboboxes.nth(1);
        const branchFilter = (await filterComboboxes.count()) > 2 ? filterComboboxes.nth(2) : null;
        const includeDeletedCheckbox = filterForm.locator('[data-slot="checkbox"]').first();

        await chooseSelectOption(page, categoryFilter, 'Repair');
        await applyFiltersButton.click();
        await expect(rowForService()).toHaveCount(1);

        await chooseSelectOption(page, categoryFilter, 'Maintenance');
        await applyFiltersButton.click();
        await expect(rowForService()).toHaveCount(0);

        await chooseSelectOption(page, categoryFilter, 'All categories');
        await applyFiltersButton.click();
        await expect(rowForService()).toHaveCount(1);

        await chooseSelectOption(page, statusFilter, 'Inactive');
        await applyFiltersButton.click();
        await expect(rowForService()).toHaveCount(1);

        await chooseSelectOption(page, statusFilter, 'Active');
        await applyFiltersButton.click();
        await expect(rowForService()).toHaveCount(0);

        await chooseSelectOption(page, statusFilter, 'All statuses');
        await applyFiltersButton.click();
        await expect(rowForService()).toHaveCount(1);

        if (branchFilter) {
            await chooseSelectOption(page, branchFilter, 'Headquarters (HQ)', 'All branches');
            await applyFiltersButton.click();
            await expect(rowForService()).toHaveCount(1);

            await chooseSelectOption(page, branchFilter, 'All branches');
            await applyFiltersButton.click();
            await expect(rowForService()).toHaveCount(1);
        }

        const rowBeforeDelete = rowForService();
        await rowBeforeDelete.first().locator('button').last().click();

        const deleteDialog = page.getByRole('dialog');
        await expect(deleteDialog.getByText(updatedServiceName)).toBeVisible();
        await deleteDialog.getByRole('button', { name: 'Delete' }).click();

        await expect(page.getByRole('alert').first()).toContainText('Common service deleted');
        await expect(rowForService()).toHaveCount(0);

        await setCheckboxState(includeDeletedCheckbox, true);
        await applyFiltersButton.click();
        const deletedRow = rowForService();
        await expect(deletedRow).toHaveCount(1);

        await deletedRow.first().locator('button').last().click();
        await expect(page.getByRole('alert').first()).toContainText('Common service restored');

        await setCheckboxState(includeDeletedCheckbox, false);
        await applyFiltersButton.click();
        await expect(rowForService()).toHaveCount(1);
    });
});
