import { defineConfig, devices } from '@playwright/test';

const laravelPort = Number.parseInt(process.env.PLAYWRIGHT_APP_PORT ?? '8081', 10);
const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${laravelPort}`;
const shouldStartWebServer = process.env.PLAYWRIGHT_SKIP_WEB_SERVER === 'true' ? false : true;

export default defineConfig({
    testDir: './playwright/tests',
    timeout: 60_000,
    expect: {
        timeout: 5_000,
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        baseURL: baseUrl,
        trace: 'retain-on-failure',
    },
    globalSetup: './playwright/global-setup.ts',
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: shouldStartWebServer
        ? [
              {
                  command: `php artisan serve --host=127.0.0.1 --port=${laravelPort}`,
                  url: `${baseUrl}/login`,
                  reuseExistingServer: !process.env.CI,
                  timeout: 120_000,
                  cwd: process.env.PLAYWRIGHT_LARAVEL_ROOT ?? '.',
                  env: {
                      ...process.env,
                      APP_ENV: process.env.PLAYWRIGHT_APP_ENV ?? 'testing',
                      APP_DEBUG: 'false',
                  },
              },
          ]
        : undefined,
});
