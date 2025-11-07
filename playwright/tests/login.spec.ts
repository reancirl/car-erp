import { test, expect } from '@playwright/test';
import { loginAsPlaywrightUser } from '../utils/auth';

const loginEmail = process.env.PLAYWRIGHT_LOGIN_EMAIL ?? 'playwright.login.tester@car-erp.test';

test.describe('Authentication / Login', () => {
    test('allows a user with valid credentials to reach the dashboard', async ({ page }) => {
        await loginAsPlaywrightUser(page);
        await expect(page).toHaveURL(/\/dashboard$/);
        await expect(page).toHaveTitle(/Dashboard/i);
    });

    test('shows an error when credentials are incorrect', async ({ page }) => {
        await page.goto('/login');

        await page.getByLabel('Email address').fill(loginEmail);
        await page.getByLabel('Password', { exact: true }).fill('not-the-right-password');
        await page.getByRole('button', { name: 'Log in' }).click();

        await expect(
            page.getByText(/These credentials do not match our records/i)
        ).toBeVisible();
        await expect(page).toHaveURL(/\/login$/);
    });
});
