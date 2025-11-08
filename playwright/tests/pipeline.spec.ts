import { expect, test } from '@playwright/test';
import { loginAsPlaywrightUser } from '../utils/auth';

test.describe('Sales / Pipeline Auto-Logging', () => {
    test('admin can create, update, filter, run automation, and delete a pipeline opportunity', async ({ page }) => {
        const timestamp = Date.now();
        const customerName = `Pipeline Customer ${timestamp}`;
        const updatedCustomer = `${customerName} Updated`;
        const formatPhone = (seed: number) => {
            const digits = `${seed}`.padStart(8, '0').slice(-8);
            return `+63-91-${digits.slice(0, 4)}-${digits.slice(4)}`;
        };

        const basePhone = formatPhone(timestamp);
        const updatedPhone = formatPhone(timestamp + 54321);
        const customerEmail = `pipeline-${timestamp}@gmail.com`;
        const updatedEmail = `pipeline-${timestamp}-upd@gmail.com`;
        const quoteAmount = '950000';
        const updatedQuote = '980000';
        const nextAction = 'Send revised quote';
        const updatedNextAction = 'Schedule test drive';
        const followUp = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 16);

        const rowForCustomer = (value: string) =>
            page.locator('table tbody tr').filter({ hasText: value });

        const selectTriggerByLabel = (labelText: string) =>
            page.locator('label', { hasText: labelText }).first()
                .locator('..')
                .locator('[data-slot="select-trigger"]')
                .first();

        await loginAsPlaywrightUser(page);

        await page.goto('/sales/pipeline');
        await expect(page.getByRole('heading', { name: 'Pipeline Auto-Logging' })).toBeVisible();

        const exportButton = page.getByRole('button', { name: 'Export Pipeline' });
        await expect(exportButton).toBeEnabled();

        await page.getByRole('link', { name: 'Manual Entry' }).first().click();
        await page.waitForURL('**/sales/pipeline/create');
        await expect(page.getByRole('heading', { name: 'Create Pipeline Opportunity' })).toBeVisible();

        const branchLabel = page.locator('label', { hasText: 'Branch *' }).first();
        if (await branchLabel.count()) {
            const branchSelect = branchLabel.locator('..').locator('[data-slot="select-trigger"]').first();
            await branchSelect.click();
            await page.getByRole('option', { name: 'Headquarters (HQ)', exact: true }).click();
        }

        await page.getByLabel('Customer Name *', { exact: true }).fill(customerName);
        await page.getByLabel('Phone Number *', { exact: true }).fill(basePhone);
        await page.getByLabel('Email Address').fill(customerEmail);

        const salesRepSelect = selectTriggerByLabel('Assign Sales Rep');
        await salesRepSelect.click();
        const salesRepOption = page.getByRole('option', { name: /Demo/i }).first();
        if (await salesRepOption.isVisible()) {
            await salesRepOption.click();
        } else {
            await page.getByRole('option', { name: /Unassigned/i }).click();
        }

        const stageSelect = selectTriggerByLabel('Current Stage *');
        await stageSelect.click();
        await page.getByRole('option', { name: 'Lead', exact: true }).click();

        const prioritySelect = selectTriggerByLabel('Priority *');
        await prioritySelect.click();
        await page.getByRole('option', { name: 'High', exact: true }).click();

        await page.getByLabel('Quote Amount (₱)').fill(quoteAmount);
        await page.getByLabel('Probability (%) *').fill('75');
        await page.getByLabel('Next Action', { exact: true }).fill(nextAction);
        await page.getByLabel('Next Action Due Date').fill(followUp);
        await page.getByPlaceholder('Enter any additional notes...').fill('Initial pipeline created via Playwright.');

        const followUpSelect = selectTriggerByLabel('Follow-up Frequency');
        await followUpSelect.click();
        await page.getByRole('option', { name: 'Weekly', exact: true }).click();

        await page.getByRole('button', { name: 'Create Opportunity' }).click();
        await expect(page).toHaveURL(/\/sales\/pipeline(\?.*)?$/, { timeout: 15_000 });

        const searchInput = page.getByPlaceholder('Search by customer name, pipeline ID, or vehicle...');
        const applyFiltersButton = page.getByRole('button', { name: 'Apply' });
        const filterForm = page.locator('form', { has: searchInput }).first();
        const filterSelects = filterForm.locator('[data-slot="select-trigger"]');
        const branchFilter = filterSelects.nth(0);
        const stageFilter = filterSelects.nth(1);
        const salesRepFilter = filterSelects.nth(2);
        const probabilityFilter = filterSelects.nth(3);

        await searchInput.fill(customerName);
        await applyFiltersButton.click();

        const createdRow = rowForCustomer(customerName);
        await expect(createdRow).toHaveCount(1);
        await expect(createdRow.first()).toContainText('Lead');
        await expect(createdRow.first()).toContainText('Medium (75%)');

        await createdRow.first().locator('a[href$="/edit"]').click();
        await page.waitForURL(/\/sales\/pipeline\/\d+\/edit$/);
        await expect(page.getByRole('heading', { name: /Edit Pipeline/ })).toBeVisible();

        await page.getByLabel('Customer Name *', { exact: true }).fill(updatedCustomer);
        await page.getByLabel('Phone Number *', { exact: true }).fill(updatedPhone);
        await page.getByLabel('Email Address').fill(updatedEmail);
        await page.getByLabel('Quote Amount (₱)').fill(updatedQuote);
        await page.getByLabel('Probability (%) *').fill('82');

        const editStageSelect = selectTriggerByLabel('Current Stage *');
        await editStageSelect.click();
        await page.getByRole('option', { name: 'Qualified', exact: true }).click();

        const editPrioritySelect = selectTriggerByLabel('Priority *');
        await editPrioritySelect.click();
        await page.getByRole('option', { name: 'Urgent', exact: true }).click();

        await page.getByLabel('Next Action', { exact: true }).fill(updatedNextAction);
        await page.getByPlaceholder('Enter any additional notes...').fill('Pipeline updated via Playwright automation.');

        await page.getByRole('button', { name: 'Update Opportunity' }).click();
        await expect(page.getByRole('alert').first()).toContainText('Pipeline opportunity');
        await expect(page).toHaveURL(/\/sales\/pipeline(\?.*)?$/, { timeout: 15_000 });

        await searchInput.fill(updatedCustomer);
        await applyFiltersButton.click();

        const updatedRow = rowForCustomer(updatedCustomer);
        await expect(updatedRow).toHaveCount(1);
        await expect(updatedRow.first()).toContainText(updatedCustomer);
        await expect(updatedRow.first()).toContainText('Qualified');
        await expect(updatedRow.first()).toContainText('High (82%)');

        await branchFilter.click();
        await page.getByRole('option', { name: 'Headquarters', exact: true }).click();
        await applyFiltersButton.click();
        await expect(updatedRow).toHaveCount(1);

        await branchFilter.click();
        await page.getByRole('option', { name: 'All Branches', exact: true }).click();
        await applyFiltersButton.click();
        await expect(updatedRow).toHaveCount(1);

        await stageFilter.click();
        await page.getByRole('option', { name: 'Qualified', exact: true }).click();
        await applyFiltersButton.click();
        await expect(updatedRow).toHaveCount(1);

        await stageFilter.click();
        await page.getByRole('option', { name: 'Lead', exact: true }).click();
        await applyFiltersButton.click();
        await expect(updatedRow).toHaveCount(0);

        await stageFilter.click();
        await page.getByRole('option', { name: 'All Stages', exact: true }).click();
        await applyFiltersButton.click();
        await expect(updatedRow).toHaveCount(1);

        await salesRepFilter.click();
        await page.getByRole('option', { name: 'All Sales Reps', exact: true }).click();
        await applyFiltersButton.click();
        await expect(updatedRow).toHaveCount(1);

        await probabilityFilter.click();
        await page.getByRole('option', { name: 'High (80%+)', exact: true }).click();
        await applyFiltersButton.click();
        await expect(updatedRow).toHaveCount(1);

        await probabilityFilter.click();
        await page.getByRole('option', { name: 'Low (<50%)', exact: true }).click();
        await applyFiltersButton.click();
        await expect(updatedRow).toHaveCount(0);

        await probabilityFilter.click();
        await page.getByRole('option', { name: 'All Probabilities', exact: true }).click();
        await applyFiltersButton.click();
        await expect(updatedRow).toHaveCount(1);

        const rulesSection = page.getByRole('heading', { name: 'Stage Transition Rules' }).locator('..').locator('..');
        const autoLossButton = rulesSection.getByRole('button', { name: 'Run Now' }).first();
        if (await autoLossButton.isVisible()) {
            page.once('dialog', (dialog) => dialog.accept());
            await autoLossButton.click();
            await expect(page).toHaveURL(/\/sales\/pipeline(\?.*)?$/, { timeout: 15_000 });
        }

        const tableActions = updatedRow.first().locator('button');
        page.once('dialog', (dialog) => dialog.accept());
        await tableActions.last().click();
        await expect(page.getByRole('alert').first()).toContainText('Pipeline opportunity');

        await searchInput.fill(updatedCustomer);
        await applyFiltersButton.click();
        await expect(rowForCustomer(updatedCustomer)).toHaveCount(0);
    });
});
