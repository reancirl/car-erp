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

test.describe('Service / Service Types', () => {
    test('admin can create, view, update, filter, delete, and restore a service type', async ({ page }) => {
        const timestamp = Date.now();
        const serviceName = `Playwright Service Type ${timestamp}`;
        const updatedServiceName = `${serviceName} Rev 2`;
        const serviceCode = `PWST-${timestamp.toString().slice(-5)}`;
        const description = 'Service type drafted via Playwright automation.';
        const updatedDescription = 'Service type updated to validate edit and filters.';
        const mileageInterval = '5000';
        const timeInterval = '6';
        const basePrice = '2450';
        const updatedBasePrice = '3250';

        const rowForServiceType = () =>
            page.locator('table tbody tr').filter({ hasText: serviceCode });

        await loginAsPlaywrightUser(page);

        await page.goto('/service/service-types');
        await expect(page.getByRole('heading', { name: 'Service Types' })).toBeVisible();

        const openCreateForm = async () => {
            await Promise.all([
                page.waitForURL('**/service/service-types/create'),
                page.getByRole('link', { name: 'New Service Type' }).first().click(),
            ]);
            await expect(page.getByRole('heading', { name: 'Create Service Type' })).toBeVisible();
        };

        await openCreateForm();

        await Promise.all([
            page.waitForURL(/\/service\/service-types(\?.*)?$/),
            page.getByRole('link', { name: 'Back to Service Types' }).first().click(),
        ]);

        await openCreateForm();

        const branchTrigger = selectTriggerByLabel(page, 'Branch *');
        if ((await branchTrigger.count()) > 0) {
            await chooseSelectOption(page, branchTrigger, 'Headquarters (HQ)');
        }

        const serviceNameLabel = 'Service Type Name *';

        await page.getByLabel(serviceNameLabel).fill(serviceName);
        await page.getByLabel('Service Code').fill(serviceCode);
        await page.getByLabel('Description').fill(description);

        const categoryTrigger = selectTriggerByLabel(page, 'Service Category *');
        await chooseSelectOption(page, categoryTrigger, 'Maintenance');

        const intervalTypeTrigger = selectTriggerByLabel(page, 'Interval Type *');
        await chooseSelectOption(page, intervalTypeTrigger, 'Mileage-Based');

        await page.getByLabel('Mileage Interval (km) *').fill(mileageInterval);
        await page.getByLabel('Estimated Duration (hours)').fill('2.5');
        await page.getByLabel('Base Price *').fill(basePrice);

        const statusTrigger = selectTriggerByLabel(page, 'Status *');
        await chooseSelectOption(page, statusTrigger, 'Active');

        await setSwitchState(page.locator('#is_available').first(), true);

        const firstCommonServiceLabel = page.locator('label[for^="service-"]').first();
        if (await firstCommonServiceLabel.count()) {
            const checkboxId = await firstCommonServiceLabel.getAttribute('for');
            if (checkboxId) {
                await setCheckboxState(page.locator(`#${checkboxId}`), true);
            }
        }

        await Promise.all([
            page.waitForURL(/\/service\/service-types(\?.*)?$/),
            page.getByRole('button', { name: 'Create Service Type' }).click(),
        ]);

        await expect(page.getByRole('alert').first()).toContainText('Service type created');

        const searchInput = page.getByPlaceholder('Search by name, code, or description...');
        const filterForm = page.locator('form', { has: searchInput }).first();
        const applyFiltersButton = filterForm.getByRole('button', { name: 'Apply' });

        await searchInput.fill(serviceCode);
        await applyFiltersButton.click();

        const createdRow = rowForServiceType();
        await expect(createdRow).toHaveCount(1);
        await expect(createdRow.first()).toContainText(serviceName);
        await expect(createdRow.first()).toContainText('Maintenance');
        await expect(createdRow.first()).toContainText('Active');

        await Promise.all([
            page.waitForURL(/\/service\/service-types\/\d+$/),
            createdRow.first().locator('a').first().click(),
        ]);

        await expect(page.getByRole('heading', { name: serviceName })).toBeVisible();
        await expect(page.getByText(serviceCode)).toBeVisible();

        await Promise.all([
            page.waitForURL(/\/service\/service-types(\?.*)?$/),
            page.getByRole('link', { name: 'Back to Service Types' }).click(),
        ]);

        await searchInput.fill(serviceCode);
        await applyFiltersButton.click();

        const rowAfterViewing = rowForServiceType();
        await Promise.all([
            page.waitForURL(/\/service\/service-types\/\d+\/edit$/),
            rowAfterViewing
                .first()
                .locator('a[href*="/service/service-types/"][href$="/edit"]')
                .first()
                .click(),
        ]);

        await expect(page.getByRole('heading', { name: 'Edit Service Type' })).toBeVisible();

        await page.getByLabel(serviceNameLabel).fill(updatedServiceName);
        await page.getByLabel('Description').fill(updatedDescription);

        const editCategoryTrigger = selectTriggerByLabel(page, 'Service Category *');
        await chooseSelectOption(page, editCategoryTrigger, 'Repair');

        const editIntervalTrigger = selectTriggerByLabel(page, 'Interval Type *');
        await chooseSelectOption(page, editIntervalTrigger, 'Time-Based');
        await page.getByLabel('Time Interval (months) *').fill(timeInterval);

        await page.getByLabel('Estimated Duration (hours)').fill('3.5');
        await page.getByLabel('Base Price *').fill(updatedBasePrice);

        const editStatusTrigger = selectTriggerByLabel(page, 'Status *');
        await chooseSelectOption(page, editStatusTrigger, 'Inactive');
        await setSwitchState(page.locator('#is_available').first(), false);

        await Promise.all([
            page.waitForURL(/\/service\/service-types(\?.*)?$/),
            page.getByRole('button', { name: 'Save Changes' }).click(),
        ]);

        await expect(page.getByRole('alert').first()).toContainText('Service type updated');

        await searchInput.fill(serviceCode);
        await applyFiltersButton.click();

        const updatedRow = rowForServiceType();
        await expect(updatedRow).toHaveCount(1);
        await expect(updatedRow.first()).toContainText(updatedServiceName);
        await expect(updatedRow.first()).toContainText('Repair');
        await expect(updatedRow.first()).toContainText('Inactive');

        const filterComboboxes = filterForm.getByRole('combobox');
        const comboCount = await filterComboboxes.count();
        let comboIndex = 0;
        const branchFilter = comboCount > 3 ? filterComboboxes.nth(comboIndex++) : null;
        const categoryFilter = filterComboboxes.nth(comboIndex++);
        const statusFilter = filterComboboxes.nth(comboIndex++);
        const intervalFilter = filterComboboxes.nth(comboIndex++);
        const includeDeletedCheckbox = filterForm.locator('[data-slot="checkbox"]').first();

        if (branchFilter) {
            await chooseSelectOption(page, branchFilter, 'Headquarters (HQ)', 'All Branches');
            await applyFiltersButton.click();
            await expect(rowForServiceType()).toHaveCount(1);

            await chooseSelectOption(page, branchFilter, 'All Branches');
            await applyFiltersButton.click();
            await expect(rowForServiceType()).toHaveCount(1);
        }

        await chooseSelectOption(page, categoryFilter, 'Repair');
        await applyFiltersButton.click();
        await expect(rowForServiceType()).toHaveCount(1);

        await chooseSelectOption(page, categoryFilter, 'Maintenance');
        await applyFiltersButton.click();
        await expect(rowForServiceType()).toHaveCount(0);

        await chooseSelectOption(page, categoryFilter, 'All Categories');
        await applyFiltersButton.click();
        await expect(rowForServiceType()).toHaveCount(1);

        await chooseSelectOption(page, statusFilter, 'Inactive');
        await applyFiltersButton.click();
        await expect(rowForServiceType()).toHaveCount(1);

        await chooseSelectOption(page, statusFilter, 'Active');
        await applyFiltersButton.click();
        await expect(rowForServiceType()).toHaveCount(0);

        await chooseSelectOption(page, statusFilter, 'All Status');
        await applyFiltersButton.click();
        await expect(rowForServiceType()).toHaveCount(1);

        await chooseSelectOption(page, intervalFilter, 'Time Based');
        await applyFiltersButton.click();
        await expect(rowForServiceType()).toHaveCount(1);

        await chooseSelectOption(page, intervalFilter, 'Mileage Based');
        await applyFiltersButton.click();
        await expect(rowForServiceType()).toHaveCount(0);

        await chooseSelectOption(page, intervalFilter, 'All Intervals');
        await applyFiltersButton.click();
        await expect(rowForServiceType()).toHaveCount(1);

        await setCheckboxState(includeDeletedCheckbox, false);
        await applyFiltersButton.click();

        const rowBeforeDelete = rowForServiceType();
        await rowBeforeDelete.first().locator('button').last().click();

        const deleteDialog = page.getByRole('dialog');
        await expect(deleteDialog).toContainText(updatedServiceName);
        await deleteDialog.getByRole('button', { name: 'Delete' }).click();

        await expect(page.getByRole('alert').first()).toContainText('Service type deleted');
        await expect(rowForServiceType()).toHaveCount(0);

        await setCheckboxState(includeDeletedCheckbox, true);
        await applyFiltersButton.click();
        const deletedRow = rowForServiceType();
        await expect(deletedRow).toHaveCount(1);

        await deletedRow.first().locator('button').last().click();
        await expect(page.getByRole('alert').first()).toContainText('Service type restored');

        await setCheckboxState(includeDeletedCheckbox, false);
        await applyFiltersButton.click();
        await expect(rowForServiceType()).toHaveCount(1);
    });
});
