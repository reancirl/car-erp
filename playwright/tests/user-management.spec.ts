import { expect, test } from '@playwright/test';
import { loginAsPlaywrightUser } from '../utils/auth';

test.describe('Administration / User Management', () => {
    test('admin can create, update, filter, and soft delete a user', async ({ page }) => {
        const timestamp = Date.now();
        const initialName = `Playwright User ${timestamp}`;
        const updatedName = `${initialName} Updated`;
        const initialEmail = `pw-user-${timestamp}@gmail.com`;
        const updatedEmail = `pw-user-${timestamp}-edited@gmail.com`;
        const password = `PwTest!${timestamp}`;
        const initialBranchSelectOption = 'Headquarters (HQ)';
        const updatedBranchSelectOption = 'Cebu Branch (CEB)';
        const initialBranchFilterOption = 'Headquarters';
        const updatedBranchFilterOption = 'Cebu Branch';
        const initialRoleOption = 'Sales Rep';
        const updatedRoleOption = 'Sales Manager';
        const alternateRoleOption = 'Technician';

        const rowForEmail = (value: string) =>
            page.locator('table tbody tr').filter({ hasText: value });

        await loginAsPlaywrightUser(page);

        await page.goto('/admin/user-management');
        await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();

        await page.getByRole('link', { name: 'Create User' }).click();
        await page.waitForURL('**/admin/user-management/create');
        await expect(page.getByRole('heading', { name: 'Create New User' })).toBeVisible();

        await page.getByLabel('Full Name *', { exact: true }).fill(initialName);
        await page.getByLabel('Email Address *', { exact: true }).fill(initialEmail);
        await page.getByLabel('Password *', { exact: true }).fill(password);
        await page.getByLabel('Confirm Password *', { exact: true }).fill(password);

        await page.locator('[data-slot="select-trigger"]').filter({ hasText: 'Select branch' }).click();
        await page.getByRole('option', { name: initialBranchSelectOption, exact: true }).click();

        await page.locator('[data-slot="select-trigger"]').filter({ hasText: 'Select role' }).click();
        await page.getByRole('option', { name: initialRoleOption, exact: true }).click();

        await page.getByRole('button', { name: 'Create User' }).click();
        await expect(page.getByRole('alert').first()).toContainText('User created successfully');
        await expect(page).toHaveURL(/\/admin\/user-management(\?.*)?$/);

        const searchInput = page.getByPlaceholder('Search by name or email...');
        const applyFilters = async () => {
            await searchInput.press('Enter');
        };
        const branchFilter = page.locator('[data-slot="select-trigger"]').first();
        const roleFilter = page.locator('[data-slot="select-trigger"]').nth(1);

        await searchInput.fill(initialEmail);
        await applyFilters();

        const createdRow = rowForEmail(initialEmail);
        await expect(createdRow).toHaveCount(1);
        await expect(createdRow.first()).toContainText(initialName);
        await expect(createdRow.first()).toContainText('Headquarters');
        await expect(createdRow.first()).toContainText(initialRoleOption);

        await createdRow.first().locator('a[href$="/edit"]').click();
        await page.waitForURL(/\/admin\/user-management\/\d+\/edit$/);
        await expect(page.getByRole('heading', { name: 'Edit User' })).toBeVisible();

        await page.getByLabel('Full Name *', { exact: true }).fill(updatedName);
        await page.getByLabel('Email Address *', { exact: true }).fill(updatedEmail);

        const editSelects = page.locator('[data-slot="select-trigger"]');
        await editSelects.nth(0).click();
        await page.getByRole('option', { name: updatedBranchSelectOption, exact: true }).click();

        await editSelects.nth(1).click();
        await page.getByRole('option', { name: updatedRoleOption, exact: true }).click();

        await page.getByRole('button', { name: 'Save Changes' }).click();
        await expect(page.getByRole('alert').first()).toContainText('User updated successfully');
        await expect(page).toHaveURL(/\/admin\/user-management(\?.*)?$/);

        await searchInput.fill(updatedEmail);
        await applyFilters();

        const updatedRow = rowForEmail(updatedEmail);
        await expect(updatedRow).toHaveCount(1);
        await expect(updatedRow.first()).toContainText(updatedName);
        await expect(updatedRow.first()).toContainText('Cebu Branch');
        await expect(updatedRow.first()).toContainText(updatedRoleOption);

        await branchFilter.click();
        await page.getByRole('option', { name: updatedBranchFilterOption, exact: true }).click();
        await applyFilters();
        await expect(rowForEmail(updatedEmail)).toHaveCount(1);

        await branchFilter.click();
        await page.getByRole('option', { name: initialBranchFilterOption, exact: true }).click();
        await applyFilters();
        await expect(rowForEmail(updatedEmail)).toHaveCount(0);

        await branchFilter.click();
        await page.getByRole('option', { name: 'All Branches', exact: true }).click();
        await applyFilters();
        await expect(rowForEmail(updatedEmail)).toHaveCount(1);

        await roleFilter.click();
        await page.getByRole('option', { name: updatedRoleOption, exact: true }).click();
        await applyFilters();
        await expect(rowForEmail(updatedEmail)).toHaveCount(1);

        await roleFilter.click();
        await page.getByRole('option', { name: alternateRoleOption, exact: true }).click();
        await applyFilters();
        await expect(rowForEmail(updatedEmail)).toHaveCount(0);

        await roleFilter.click();
        await page.getByRole('option', { name: 'All Roles', exact: true }).click();
        await applyFilters();
        await expect(rowForEmail(updatedEmail)).toHaveCount(1);

        await searchInput.fill(updatedEmail);
        await applyFilters();

        const rowForDeletion = rowForEmail(updatedEmail);
        await expect(rowForDeletion).toHaveCount(1);

        page.once('dialog', (dialog) => dialog.accept());
        await rowForDeletion.first().locator('button').last().click();

        await expect(page.getByRole('alert').first()).toContainText('User deleted successfully');

        await searchInput.fill(updatedEmail);
        await applyFilters();
        await expect(rowForEmail(updatedEmail)).toHaveCount(0);
    });
});
