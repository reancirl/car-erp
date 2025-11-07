import { expect, test } from '@playwright/test';
import { loginAsPlaywrightUser } from '../utils/auth';

test.describe('Sales / Customer Experience', () => {
    test('admin can create, update, filter, delete, and restore a customer record', async ({ page }) => {
        const timestamp = Date.now();
        const firstName = `Playwright CX ${timestamp}`;
        const lastName = `Customer ${timestamp}`;
        const updatedLastName = `${lastName} VIP`;
        const email = `pw-cx-${timestamp}@gmail.com`;
        const phone = `09${timestamp.toString().slice(-9).padStart(9, '0')}`;
        const notes = 'Customer captured via Playwright automation.';
        const updatedNotes = 'Customer updated to VIP via Playwright.';

        const rowForCustomer = (value: string) =>
            page.locator('table tbody tr').filter({ hasText: value });

        const selectTriggerByLabel = (labelText: string) =>
            page.locator('label', { hasText: labelText }).first()
                .locator('..')
                .locator('[data-slot="select-trigger"]')
                .first();

        const selectTriggerWithin = (container: ReturnType<typeof page.locator>, labelText: string) =>
            container.locator('label', { hasText: labelText }).first()
                .locator('..')
                .locator('[data-slot="select-trigger"]')
                .first();

        await loginAsPlaywrightUser(page);

        await page.goto('/sales/customer-experience');
        await expect(page.getByRole('heading', { name: 'Customer Experience' })).toBeVisible();

        await page.getByRole('link', { name: 'Add Customer' }).first().click();
        await page.waitForURL('**/sales/customer-experience/create');
        await expect(page.getByRole('heading', { name: 'Create New Customer' })).toBeVisible();

        const branchSelect = selectTriggerByLabel('Branch *');
        if (await branchSelect.count()) {
            await branchSelect.click();
            await page.getByRole('option', { name: 'Headquarters (HQ)', exact: true }).click();
        }

        await page.getByLabel('First Name *').fill(firstName);
        await page.getByLabel('Last Name *').fill(lastName);
        await page.getByLabel('Email *').fill(email);
        await page.getByLabel('Phone *').fill(phone);
        await page.getByLabel('Notes').fill(notes);

        const statusSelect = selectTriggerByLabel('Status *');
        await statusSelect.click();
        await page.getByRole('option', { name: 'Active', exact: true }).click();

        const managerSelect = selectTriggerByLabel('Assigned Manager');
        await managerSelect.click();
        const managerOption = page.getByRole('option', { name: /Sales Rep Demo/i }).first();
        if (await managerOption.count()) {
            await managerOption.click();
        } else {
            await page.getByRole('option', { name: 'Unassigned', exact: true }).click();
        }

        await page.getByRole('button', { name: 'Create Customer' }).click();
        await expect(page.getByRole('alert').first()).toContainText('Customer');
        await expect(page).toHaveURL(/\/sales\/customer-experience(\?.*)?$/);

        const searchInput = page.getByPlaceholder('Name, email, phone, ID...');
        const applyFiltersButton = page.getByRole('button', { name: 'Apply Filters' });
        const filterForm = page.locator('form', { has: searchInput }).first();

        await searchInput.fill(email);
        await applyFiltersButton.click();

        const createdRow = rowForCustomer(email);
        await expect(createdRow).toHaveCount(1);
        await expect(createdRow.first()).toContainText(`${firstName} ${lastName}`);
        await expect(createdRow.first()).toContainText('Active');
        await expect(createdRow.first()).toContainText('Individual');

        await createdRow.first().getByRole('button', { name: 'View' }).click();
        await page.waitForURL(/\/sales\/customer-experience\/\d+$/);
        await expect(page.getByRole('heading', { name: `${firstName} ${lastName}` })).toBeVisible();

        await page.getByRole('button', { name: 'Back to Customers' }).click();
        await expect(page).toHaveURL(/\/sales\/customer-experience(\?.*)?$/);

        await searchInput.fill(email);
        await applyFiltersButton.click();

        await createdRow.first().getByRole('button', { name: 'Edit' }).click();
        await page.waitForURL(/\/sales\/customer-experience\/\d+\/edit$/);
        await expect(page.getByRole('heading', { name: /Edit Customer/ })).toBeVisible();

        await page.getByLabel('Last Name *').fill(updatedLastName);
        await page.getByLabel('Notes').fill(updatedNotes);

        const editStatusSelect = selectTriggerByLabel('Status *');
        await editStatusSelect.click();
        await page.getByRole('option', { name: 'VIP', exact: true }).click();

        await page.getByRole('button', { name: 'Update Customer' }).click();
        await expect(page.getByRole('alert').first()).toContainText('Customer');
        await expect(page).toHaveURL(/\/sales\/customer-experience(\?.*)?$/);

        await searchInput.fill(email);
        await applyFiltersButton.click();

        const updatedRow = rowForCustomer(email);
        await expect(updatedRow).toHaveCount(1);
        await expect(updatedRow.first()).toContainText(updatedLastName);
        await expect(updatedRow.first()).toContainText('VIP');

        const statusFilter = selectTriggerWithin(filterForm, 'Status');
        await statusFilter.click();
        await page.getByRole('option', { name: 'VIP', exact: true }).click();
        await applyFiltersButton.click();
        await expect(updatedRow).toHaveCount(1);

        await statusFilter.click();
        await page.getByRole('option', { name: 'Inactive', exact: true }).click();
        await applyFiltersButton.click();
        await expect(rowForCustomer(email)).toHaveCount(0);

        await statusFilter.click();
        await page.getByRole('option', { name: 'All Statuses', exact: true }).click();
        await applyFiltersButton.click();
        await expect(updatedRow).toHaveCount(1);

        const typeFilter = selectTriggerWithin(filterForm, 'Customer Type');
        await typeFilter.click();
        await page.getByRole('option', { name: 'Individual', exact: true }).click();
        await applyFiltersButton.click();
        await expect(updatedRow).toHaveCount(1);

        await typeFilter.click();
        await page.getByRole('option', { name: 'Corporate', exact: true }).click();
        await applyFiltersButton.click();
        await expect(rowForCustomer(email)).toHaveCount(0);

        await typeFilter.click();
        await page.getByRole('option', { name: 'All Types', exact: true }).click();
        await applyFiltersButton.click();
        await expect(updatedRow).toHaveCount(1);

        const satisfactionFilter = selectTriggerWithin(filterForm, 'Satisfaction');
        await satisfactionFilter.click();
        await page.getByRole('option', { name: 'Very Satisfied', exact: true }).click();
        await applyFiltersButton.click();
        await expect(rowForCustomer(email)).toHaveCount(0);

        await satisfactionFilter.click();
        await page.getByRole('option', { name: 'All Ratings', exact: true }).click();
        await applyFiltersButton.click();
        await expect(updatedRow).toHaveCount(1);

        const branchFilter = selectTriggerWithin(filterForm, 'Branch');
        await branchFilter.click();
        await page.getByRole('option', { name: 'Headquarters (HQ)', exact: true }).click();
        await applyFiltersButton.click();
        await expect(updatedRow).toHaveCount(1);

        await branchFilter.click();
        await page.getByRole('option', { name: 'Cebu Branch (CEB)', exact: true }).click();
        await applyFiltersButton.click();
        await expect(rowForCustomer(email)).toHaveCount(0);

        await branchFilter.click();
        await page.getByRole('option', { name: 'All Branches', exact: true }).click();
        await applyFiltersButton.click();
        await expect(updatedRow).toHaveCount(1);

        await updatedRow.first().getByRole('button', { name: 'View' }).click();
        await page.waitForURL(/\/sales\/customer-experience\/\d+$/);
        await expect(page.getByRole('heading', { name: `${firstName} ${updatedLastName}` })).toBeVisible();

        page.once('dialog', (dialog) => dialog.accept());
        await page.getByRole('button', { name: 'Delete' }).click();
        await expect(page.getByRole('alert').first()).toContainText('Customer');
        await expect(page).toHaveURL(/\/sales\/customer-experience(\?.*)?$/);

        await searchInput.fill(email);
        await applyFiltersButton.click();
        await expect(rowForCustomer(email)).toHaveCount(0);

        const includeDeletedCheckbox = page.getByLabel('Show deleted customers');
        await includeDeletedCheckbox.check();
        await applyFiltersButton.click();
        await expect(rowForCustomer(email)).toHaveCount(1);
    });
});
