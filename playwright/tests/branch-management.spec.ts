import { expect, test } from '@playwright/test';
import { loginAsPlaywrightUser } from '../utils/auth';

test.describe('Administration / Branch Management', () => {
    test('admin can create, update, and soft delete a branch', async ({ page }) => {
        const timestamp = Date.now();
        const branchName = `Playwright Branch ${timestamp}`;
        const branchCode = `PW${timestamp.toString().slice(-4).toUpperCase()}`;
        const branchEmail = `branch-${timestamp}@gmail.com`;
        const primaryPhoneSuffix = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0');
        const secondaryPhoneSuffix = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0');
        const branchPhone = `+63-2-${primaryPhoneSuffix}-${secondaryPhoneSuffix}`;

        await loginAsPlaywrightUser(page);

        await page.goto('/admin/branch-management');
        await expect(page.getByRole('heading', { name: 'Branch Management' })).toBeVisible();

        await page.getByRole('link', { name: 'Create Branch' }).click();
        await page.waitForURL('**/admin/branch-management/create');
        await expect(page.getByRole('heading', { name: 'Create New Branch' })).toBeVisible();

        await page.getByLabel('Branch Name').fill(branchName);
        await page.getByLabel('Branch Code').fill(branchCode);
        await page.locator('[data-slot="select-trigger"]', { hasText: 'Select region' }).click();
        await page.getByRole('option', { name: 'Central Visayas (Region VII)' }).click();
        await page.getByLabel('Province').fill('Cebu');
        await page.getByLabel('City/Municipality').fill('Cebu City');
        await page.getByLabel('Postal Code').fill('6000');
        await page.getByLabel('Country').fill('Philippines');
        await page.getByLabel('Complete Address').fill('123 Playwright Street, Barangay Sample, Cebu City');
        await page.getByLabel('Phone Number').fill(branchPhone);
        await page.getByLabel('Email Address').fill(branchEmail);
        await page.getByLabel('Notes').fill('Branch created through Playwright automation.');

        await Promise.all([
            page.waitForURL('**/admin/branch-management'),
            page.getByRole('button', { name: 'Create Branch' }).click(),
        ]);

        await expect(page.getByRole('alert').first()).toContainText('Branch created successfully');

        const searchInput = page.getByPlaceholder('Search by name, code, city...');
        await searchInput.fill(branchCode);

        const branchRows = page.locator('table tbody tr');
        await expect(branchRows).toHaveCount(1);
        await expect(branchRows.first()).toContainText(branchName);
        await expect(branchRows.first()).toContainText(branchCode);
        await expect(branchRows.first()).toContainText('Active');

        await branchRows.first().locator('a[href$="/edit"]').click();
        await page.waitForURL(/\/admin\/branch-management\/\d+\/edit$/);
        await expect(page.getByRole('heading', { name: new RegExp(`Edit ${branchName}`) })).toBeVisible();

        const statusTrigger = page.locator('[data-slot="select-trigger"]', { hasText: /Active/i });
        await statusTrigger.click();
        await page.getByRole('option', { name: 'Inactive' }).click();

        const updatedPhoneSuffix = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0');
        await page.getByLabel('Phone Number').fill(`+63-2-${primaryPhoneSuffix}-${updatedPhoneSuffix}`);
        await page.getByLabel('Notes').fill('Branch updated to inactive status via Playwright.');

        await Promise.all([
            page.waitForURL('**/admin/branch-management'),
            page.getByRole('button', { name: 'Save Changes' }).click(),
        ]);

        await expect(page.getByRole('alert').first()).toContainText('Branch updated successfully');

        await searchInput.fill(branchCode);
        await expect(branchRows).toHaveCount(1);
        const updatedRow = branchRows.first();
        await expect(updatedRow).toContainText('Inactive');
        await expect(updatedRow).toContainText(branchCode);

        await searchInput.fill('');
        await expect(searchInput).toHaveValue('');

        const statusSelect = page.locator('[data-slot="select-trigger"]').filter({
            hasText: /All Status|Inactive|Active/,
        }).first();
        await statusSelect.click();
        await page.getByRole('option', { name: 'Inactive', exact: true }).click();
        await expect(branchRows.filter({ hasText: branchCode })).toHaveCount(1);

        await statusSelect.click();
        await page.getByRole('option', { name: 'Active', exact: true }).click();
        await expect(branchRows.filter({ hasText: branchCode })).toHaveCount(0);

        await statusSelect.click();
        await page.getByRole('option', { name: 'All Status', exact: true }).click();
        await expect(branchRows.filter({ hasText: branchCode })).toHaveCount(1);

        await searchInput.fill(branchCode);
        await expect(branchRows).toHaveCount(1);

        page.once('dialog', (dialog) => dialog.accept());
        await updatedRow.locator('button').last().click();

        await expect(page.getByRole('alert').first()).toContainText('Branch deleted successfully');
        await searchInput.fill('');
        await searchInput.fill(branchCode);
        await expect(branchRows.filter({ hasText: branchCode })).toHaveCount(0);
    });
});
