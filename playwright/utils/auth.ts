import type { Page } from '@playwright/test';

const defaultEmail = process.env.PLAYWRIGHT_LOGIN_EMAIL ?? 'playwright.login.tester@car-erp.test';
const defaultPassword = process.env.PLAYWRIGHT_LOGIN_PASSWORD ?? 'password';

export async function loginAsPlaywrightUser(
    page: Page,
    overrides?: { email?: string; password?: string }
) {
    const email = overrides?.email ?? defaultEmail;
    const password = overrides?.password ?? defaultPassword;

    await page.goto('/login');
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);

    const loginResponse = page.waitForResponse(
        (response) => response.url().includes('/login') && response.request().method() === 'POST'
    );

    await page.getByRole('button', { name: 'Log in' }).click();
    await loginResponse.catch(() => undefined);
    await page.waitForLoadState('networkidle');

    if ((await page.url()).includes('/login')) {
        const alertLocator = page.getByRole('alert').first();
        if (await alertLocator.count()) {
            const errorMessage = (await alertLocator.textContent())?.trim();
            if (errorMessage) {
                throw new Error(`Login failed: ${errorMessage}`);
            }
        }
    }
}
