# Playwright Automation Playbook

Use this guide when adding end-to-end coverage to new Car ERP modules. It captures
the patterns established while automating the authentication and branch management
flows so future scenarios stay consistent and maintainable.

---

## 1. Project structure recap

- `playwright.config.ts` – global configuration (Chromium project only, optional
  Laravel web server bootstrap, global setup).
- `playwright/global-setup.ts` – builds assets when necessary, runs migrations,
  ensures the deterministic login user (`playwright:ensure-login-user`).
- `playwright/utils/auth.ts` – helper that signs in using the seeded Playwright
  account.
- `playwright/tests/*.spec.ts` – scenario files (currently login + branch
  management coverage).
- `playwright/README.md` – quick-start instructions and scenario index.

Keep new helpers inside `playwright/utils/` and new specs under
`playwright/tests/` to stay aligned with existing imports and TypeScript
settings (`tsconfig.json` includes the folder).

---

## 2. Baseline test recipe

1. **Sign in once**  
   ```ts
   import { loginAsPlaywrightUser } from '../utils/auth';
   await loginAsPlaywrightUser(page);
   ```
   The helper navigates to `/login`, fills the seeded credentials, and waits for
   the dashboard redirect.

2. **Navigate through the sidebar**  
   Use accessible selectors instead of brittle CSS chains:
   ```ts
   await page.getByRole('link', { name: 'Branch Management' }).click();
   ```

3. **Interact via labels and roles**  
   Prioritise `getByLabel`, `getByRole`, or `getByPlaceholder` to mirror how
   users experience the UI and to keep tests resilient to layout changes.

4. **Generate unique data**  
   Use `Date.now()` (as shown in `branch-management.spec.ts`) or UUIDs to avoid
   collisions with existing seed data.
   ```ts
   const stamp = Date.now();
   const name = `Automated Branch ${stamp}`;
   ```

5. **Assert with business signals**  
   - Toast messages (`Toast` component) confirm backend success.
   - Table rows, badges, and filters verify UI state.
   - After destructive actions, re-query (search/filter) to confirm records are
     gone rather than relying on “empty state” copy that may not surface when
     seed data exists.

6. **Wrap in a `test.describe` block**  
   Group related specs so shared setup reads cleanly:
   ```ts
   test.describe('Administration / Branch Management', () => { /* tests */ });
   ```

---

## 3. Designing new scenarios

When planning coverage for another module:

- **Identify the happy path** – e.g., create → edit → archive. Mirror the way
  branch management covers create/update/delete.
- **List the supporting UI elements** – forms, filters, tabs. Ensure each step
  has deterministic selectors (labels, text, roles).
- **Consider preconditions** – if the module depends on data, seed it via
  Laravel factories or create it within the test using unique identifiers.
- **Check for guardrails** – MFA, permissions, or branch scoping. Reuse seeded
  roles or extend `playwright:ensure-login-user` if the module requires a
  different permission set.
- **Capture key assertions** – success toasts, table contents, KPI numbers,
  export buttons, etc. Aim to assert meaningful business outcomes instead of
  only DOM state.

Document scenario goals directly in the spec using inline comments sparingly to
explain non-obvious waits or data workarounds.

---

## 4. Common utilities & patterns

| Need | Pattern |
| --- | --- |
| Reusable sign-in | `loginAsPlaywrightUser(page)` |
| Generate deterministic strings | ``const code = `PW${Date.now().toString().slice(-4)}`;`` |
| Wait for Toast feedback | `await expect(page.getByRole('alert').first()).toContainText('...');` |
| Filter results | Use `locator('[data-slot="select-trigger"]')` and exact option names to avoid strict-mode issues (`exact: true`). |
| Clean up after actions | Re-run searches or toggle filters and assert absence/presence as required. |

If a new module requires additional helpers (e.g., API shortcuts, local storage
stubs), add them under `playwright/utils/` and export them with clear JSDoc
comments for discoverability.

---

## 5. Extending the Laravel setup

- **Test data** – prefer creating data through the UI to mirror user flows.
  When backend seeding is required, add idempotent Artisan commands similar to
  `playwright:ensure-login-user`.
- **Permissions** – if the Playwright user needs extra roles, adjust the command
  to assign multiple roles (`$user->syncRoles([...])`).
- **Environment toggles** – see `playwright/README.md` for variables such as
  `PLAYWRIGHT_SKIP_WEB_SERVER` or `PLAYWRIGHT_BUILD_ASSETS`.

---

## 6. Example skeleton for a new module

```ts
import { expect, test } from '@playwright/test';
import { loginAsPlaywrightUser } from '../utils/auth';

test.describe('Module / Feature', () => {
    test('scenario outline', async ({ page }) => {
        const stamp = Date.now();
        await loginAsPlaywrightUser(page);

        await page.goto('/module/path');
        await page.getByRole('button', { name: 'Create' }).click();

        await page.getByLabel('Name').fill(`Automated ${stamp}`);
        // ...additional field interactions...

        await Promise.all([
            page.waitForURL('**/module/path'),
            page.getByRole('button', { name: 'Save' }).click(),
        ]);

        await expect(page.getByRole('alert')).toContainText('Created successfully');
        await expect(page.getByRole('row', { name: new RegExp(`Automated ${stamp}`) })).toBeVisible();
    });
});
```

Use this template as a starting point, adapting the route, selectors, and
assertions to match the module under test.

---

## 7. Checklist before submitting a new spec

- [ ] Scenario data is unique and cleaned up (or filtered out) during the test.
- [ ] Selectors rely on accessible labels/text/roles.
- [ ] Success/failure signals are asserted (toasts, badges, counts).
- [ ] Any new helpers/utilities are documented within this playbook or inline.
- [ ] `npm run test:e2e` passes locally (CI will also install browsers and run).

Following this checklist keeps the suite reliable and makes future expansions
straightforward.
