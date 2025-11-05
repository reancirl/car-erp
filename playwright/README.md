# Playwright End-to-End Tests

The Playwright suite exercises key user journeys against the Inertia-powered UI.  
It lives in `playwright/tests` and is configured via `playwright.config.ts`.

## Prerequisites
- Install dependencies: `npm install`
- Install the Chromium browser binary once: `npx playwright install chromium`
- Ensure Laravel dependencies are installed and that a test database is configured
  (the default configuration runs `php artisan migrate --force` against your current `.env`).

> **Tip:** Point `DB_DATABASE` to a disposable database (for example SQLite) before running the suite to avoid polluting development data.

## Running the login flow check
```sh
npm run test:e2e
```

## Available scenarios
- `playwright/tests/login.spec.ts` – Validates the primary login happy path and a failure case.
- `playwright/tests/branch-management.spec.ts` – Covers creating, updating, and soft deleting branch records from the admin console.
- `playwright/AUTOMATION_PLAYBOOK.md` – Patterns and checklist for extending the suite to additional modules.

The global setup will:
1. Build front-end assets if `public/build/manifest.json` is missing (toggle with `PLAYWRIGHT_SKIP_BUILD=true` or force with `PLAYWRIGHT_BUILD_ASSETS=true`).
2. Run `php artisan migrate --force`.
3. Create a deterministic login account via `php artisan playwright:ensure-login-user`.

## Helpful environment variables
- `PLAYWRIGHT_LOGIN_EMAIL` / `PLAYWRIGHT_LOGIN_PASSWORD` – override the default credentials.
- `PLAYWRIGHT_APP_PORT` – change the Laravel dev server port (defaults to `8081`).
- `PLAYWRIGHT_APP_ENV` – set the Laravel `APP_ENV` for the spawned server (defaults to `testing`).
- `PLAYWRIGHT_SKIP_WEB_SERVER=true` – skip launching `php artisan serve` if you are running the app yourself.
- `PLAYWRIGHT_SKIP_SETUP=true` – bypass the global setup (migrations, asset build, test user creation).

When `PLAYWRIGHT_SKIP_WEB_SERVER=true`, start your own server before running the tests and point `PLAYWRIGHT_BASE_URL` to it.

## Troubleshooting
- If the Playwright server command cannot bind to the configured port, pick a different value via `PLAYWRIGHT_APP_PORT`.
- Asset compilation adds a noticeable delay the first time; subsequent runs reuse the built manifest.
- To rerun a single test during development: `npx playwright test playwright/tests/login.spec.ts --debug`.
