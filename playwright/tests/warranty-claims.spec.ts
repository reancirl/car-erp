import { expect, test, type Locator, type Page, type Response } from '@playwright/test';
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
    const openDropdown = page.locator('[data-slot="select-content"][data-state="open"]').last();
    await expect(openDropdown).toBeVisible();
    const optionLocator =
        typeof optionLabel === 'string'
            ? openDropdown.getByRole('option', { name: optionLabel, exact: true })
            : openDropdown.getByRole('option', { name: optionLabel });

    if (await optionLocator.count()) {
        await optionLocator.first().click();
        return;
    }

    if (fallbackLabel) {
        const fallbackOption = openDropdown.getByRole('option', { name: fallbackLabel, exact: true });
        if (await fallbackOption.count()) {
            await fallbackOption.first().click();
            return;
        }
    }

    await openDropdown.getByRole('option').first().click();
};

const assertSuccessfulResponse = async (response: Response, context: string) => {
    if (response.status() < 400) {
        return;
    }

    let responseDetails = '';
    try {
        responseDetails = await response.text();
    } catch (error) {
        responseDetails = `<body unavailable: ${(error as Error).message}>`;
    }

    throw new Error(`${context}: ${response.status()} ${responseDetails}`);
};

const ensureWarrantyCustomer = async (page: Page) => {
    const timestamp = Date.now();
    const firstName = `Warranty Customer ${timestamp}`;
    const lastName = 'Playwright';
    const email = `warranty-${timestamp}@car-erp.test`;
    const phone = `09${timestamp.toString().slice(-9).padStart(9, '0')}`;

    await page.goto('/sales/customer-experience/create');
    await expect(page.getByRole('heading', { name: 'Create New Customer' })).toBeVisible();

    const branchSelect = selectTriggerByLabel(page, 'Branch *');
    if (await branchSelect.count()) {
        await chooseSelectOption(page, branchSelect, 'Headquarters (HQ)');
    }

    const customerTypeSelect = selectTriggerByLabel(page, 'Customer Type *');
    await chooseSelectOption(page, customerTypeSelect, 'Individual');

    await page.getByLabel('First Name *').fill(firstName);
    await page.getByLabel('Last Name *').fill(lastName);
    await page.getByLabel('Email *').fill(email);
    await page.getByLabel('Phone *').fill(phone);

    const statusSelect = selectTriggerByLabel(page, 'Status *');
    await chooseSelectOption(page, statusSelect, 'Active');

    const createResponsePromise = page.waitForResponse(
        (response) =>
            response.url().includes('/sales/customer-experience') && response.request().method() === 'POST'
    );

    await page.getByRole('button', { name: 'Create Customer' }).click();
    const createResponse = await createResponsePromise;
    await assertSuccessfulResponse(createResponse, 'Failed to create warranty customer');

    await page.goto('/sales/customer-experience');
    await expect(page.getByRole('heading', { name: 'Customer Experience' })).toBeVisible();

    const searchInput = page.getByPlaceholder('Name, email, phone, ID...');
    const filterForm = page.locator('form', { has: searchInput }).first();
    const applyFiltersButton = filterForm.getByRole('button', { name: 'Apply Filters' });
    await searchInput.fill(email);
    await applyFiltersButton.click();

    const customerRow = page.locator('table tbody tr').filter({ hasText: email }).first();
    await expect(customerRow).toHaveCount(1);
    const rowText = (await customerRow.textContent()) ?? `${firstName} ${lastName}`;
    const codeMatch = rowText.match(/CUS-\d{4}-\d+/i);

    return {
        name: `${firstName} ${lastName}`,
        customerCode: codeMatch ? codeMatch[0] : `${firstName} ${lastName}`,
    };
};

const setCheckboxState = async (checkbox: Locator, shouldBeChecked: boolean) => {
    if ((await checkbox.count()) === 0) return;
    const state = await checkbox.getAttribute('data-state');
    const isChecked = state === 'checked';
    if (isChecked !== shouldBeChecked) {
        await checkbox.click();
    }
};

const formatDate = (offsetDays = 0) => {
    const date = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
    return date.toISOString().split('T')[0];
};

test.describe('Service / Warranty Claims', () => {
    test('admin can create, view, update, filter, delete, and restore a warranty claim', async ({ page }) => {
        const timestamp = Date.now();
        const initialFailureDescription = `Playwright warranty failure ${timestamp}`;
        const updatedFailureDescription = `${initialFailureDescription} - updated`;
        const warrantyProvider = `Playwright Provider ${timestamp}`;
        const updatedWarrantyProvider = `${warrantyProvider} Intl`;
        const warrantyNumber = `PW-WC-${timestamp}`;
        const notes = 'Claim recorded via Playwright automation.';
        const updatedNotes = 'Claim updated through Playwright automation.';
        const claimDate = formatDate();
        const incidentDate = claimDate;
        const warrantyStartDate = formatDate(-7);
        const warrantyEndDate = formatDate(-5);

        await loginAsPlaywrightUser(page);
        const customerContext = await ensureWarrantyCustomer(page);

        await page.goto('/service/warranty-claims');
        await expect(page.getByRole('heading', { level: 1, name: 'Warranty Claims' })).toBeVisible();

        const openCreateForm = async () => {
            await Promise.all([
                page.waitForURL('**/service/warranty-claims/create'),
                page.getByRole('link', { name: 'New Claim' }).click(),
            ]);
            await expect(page.getByRole('heading', { name: 'Create Warranty Claim' })).toBeVisible();
        };

        await openCreateForm();

        await Promise.all([
            page.waitForURL('**/service/warranty-claims'),
            page.getByRole('button', { name: 'Back to Claims' }).click(),
        ]);

        await openCreateForm();

        const claimTypeSelect = selectTriggerByLabel(page, 'Claim Type *');
        await chooseSelectOption(page, claimTypeSelect, 'Parts & Labor');

        await page.getByLabel('Claim Date *').fill(claimDate);
        await page.getByLabel('Incident Date').fill(incidentDate);

        const statusSelect = selectTriggerByLabel(page, 'Status *');
        await chooseSelectOption(page, statusSelect, 'Draft');

        await page.getByLabel('Failure Description *').fill(initialFailureDescription);

        const customerSelect = selectTriggerByLabel(page, 'Customer');
        await chooseSelectOption(page, customerSelect, new RegExp(customerContext.customerCode));
        await expect(customerSelect).toContainText(customerContext.customerCode);

        const vehicleSelect = selectTriggerByLabel(page, 'Vehicle');
        await chooseSelectOption(page, vehicleSelect, /Vios.*789001/);

        await page.getByLabel('Odometer Reading (km)').fill('12345');

        await page.getByLabel('Warranty Type').fill('Manufacturer');
        await page.getByLabel('Warranty Provider').fill(warrantyProvider);
        await page.getByLabel('Warranty Number').fill(warrantyNumber);
        await page.getByLabel('Warranty Start Date').fill(warrantyStartDate);
        await page.getByLabel('Warranty End Date').fill(warrantyEndDate);

        const branchSelect = selectTriggerByLabel(page, 'Branch *');
        if (await branchSelect.count()) {
            await chooseSelectOption(page, branchSelect, 'Headquarters (HQ)');
        }

        const assigneeSelect = selectTriggerByLabel(page, 'Assigned To');
        await chooseSelectOption(page, assigneeSelect, 'Unassigned', undefined);

        const notesTextarea = page.getByPlaceholder('Any additional notes or comments...');
        if (await notesTextarea.count()) {
            await notesTextarea.fill(notes);
        }

        const claimResponsePromise = page.waitForResponse(
            (response) =>
                response.url().includes('/service/warranty-claims') && response.request().method() === 'POST'
        );
        await page.getByRole('button', { name: 'Create Warranty Claim' }).click();
        const claimResponse = await claimResponsePromise;

        await assertSuccessfulResponse(claimResponse, 'Failed to create warranty claim');

        await page.waitForURL(/\/service\/warranty-claims(\?.*)?$/);

        const alert = page.getByRole('alert').first();
        await expect(alert).toContainText('Warranty claim');
        const alertText = (await alert.textContent()) ?? '';
        const claimIdMatch = alertText.match(/claim\s+([A-Z0-9\-]+)/i);
        const claimIdentifier = claimIdMatch ? claimIdMatch[1] : warrantyNumber;

        const searchInput = page.getByPlaceholder('Search by claim ID, customer, or VIN...');
        const applyFiltersButton = page.getByRole('button', { name: 'Apply' });
        const filterRow = searchInput.locator('..').locator('..').locator('..');
        const filterComboboxes = filterRow.locator('[data-slot="select-trigger"]');
        const comboCount = await filterComboboxes.count();
        const statusFilter = filterComboboxes.nth(0);
        const claimTypeFilter = filterComboboxes.nth(1);
        const warrantyTypeFilter = filterComboboxes.nth(2);
        const branchFilter = comboCount > 3 ? filterComboboxes.nth(3) : null;
        const includeDeletedCheckbox = page.getByLabel('Include deleted claims');

        const rowForClaim = () =>
            page.locator('table tbody tr').filter({ hasText: claimIdentifier });

        await searchInput.fill(claimIdentifier);
        await applyFiltersButton.click();

        await expect(rowForClaim()).toHaveCount(1);
        await expect(rowForClaim()).toContainText(initialFailureDescription);
        await expect(rowForClaim()).toContainText('Parts & Labor');

        await Promise.all([
            page.waitForURL(/\/service\/warranty-claims\/\d+$/),
            rowForClaim().first().locator('a[href*="/service/warranty-claims/"]').first().click(),
        ]);
        await expect(page.getByRole('heading', { name: 'Warranty Claim' })).toBeVisible();

        await Promise.all([
            page.waitForURL('**/service/warranty-claims'),
            page.getByRole('button', { name: 'Back to Claims' }).click(),
        ]);

        await searchInput.fill(claimIdentifier);
        await applyFiltersButton.click();

        await Promise.all([
            page.waitForURL(/\/service\/warranty-claims\/\d+\/edit$/),
            rowForClaim().first().locator('a[href$="/edit"]').click(),
        ]);
        await expect(page.getByRole('heading', { name: 'Edit Warranty Claim' })).toBeVisible();

        await page.getByLabel('Failure Description *').fill(updatedFailureDescription);
        await page.getByLabel('Warranty Provider').fill(updatedWarrantyProvider);
        await page.getByPlaceholder('Any additional notes or comments...').fill(updatedNotes);

        const editClaimTypeSelect = selectTriggerByLabel(page, 'Claim Type *');
        await chooseSelectOption(page, editClaimTypeSelect, 'Labor Only');

        await Promise.all([
            page.waitForURL('**/service/warranty-claims'),
            page.getByRole('button', { name: 'Update Warranty Claim' }).click(),
        ]);

        await expect(page.getByRole('alert').first()).toContainText('updated');

        await searchInput.fill(claimIdentifier);
        await applyFiltersButton.click();

        await expect(rowForClaim()).toHaveCount(1);
        await expect(rowForClaim()).toContainText(updatedFailureDescription);
        await expect(rowForClaim()).toContainText('Labor Only');

        await chooseSelectOption(page, claimTypeFilter, 'Labor Only');
        await searchInput.fill(claimIdentifier);
        await applyFiltersButton.click();
        await expect(rowForClaim()).toHaveCount(1);

        await chooseSelectOption(page, claimTypeFilter, 'Parts Only');
        await searchInput.fill(claimIdentifier);
        await applyFiltersButton.click();
        await expect(rowForClaim()).toHaveCount(0);

        await chooseSelectOption(page, claimTypeFilter, 'All Types');
        await searchInput.fill(claimIdentifier);
        await applyFiltersButton.click();
        await expect(rowForClaim()).toHaveCount(1);

        await chooseSelectOption(page, statusFilter, 'Draft');
        await searchInput.fill(claimIdentifier);
        await applyFiltersButton.click();
        await expect(rowForClaim()).toHaveCount(1);

        await chooseSelectOption(page, statusFilter, 'Submitted');
        await searchInput.fill(claimIdentifier);
        await applyFiltersButton.click();
        await expect(rowForClaim()).toHaveCount(0);

        await chooseSelectOption(page, statusFilter, 'All Status');
        await searchInput.fill(claimIdentifier);
        await applyFiltersButton.click();
        await expect(rowForClaim()).toHaveCount(1);

        await chooseSelectOption(page, warrantyTypeFilter, 'Manufacturer');
        await searchInput.fill(claimIdentifier);
        await applyFiltersButton.click();
        await expect(rowForClaim()).toHaveCount(1);

        await chooseSelectOption(page, warrantyTypeFilter, 'Dealer');
        await searchInput.fill(claimIdentifier);
        await applyFiltersButton.click();
        await expect(rowForClaim()).toHaveCount(0);

        await chooseSelectOption(page, warrantyTypeFilter, 'All Warranties');
        await searchInput.fill(claimIdentifier);
        await applyFiltersButton.click();
        await expect(rowForClaim()).toHaveCount(1);

        if (branchFilter) {
            await chooseSelectOption(page, branchFilter, 'Headquarters (HQ)', 'All Branches');
            await searchInput.fill(claimIdentifier);
            await applyFiltersButton.click();
            await expect(rowForClaim()).toHaveCount(1);

            await chooseSelectOption(page, branchFilter, 'All Branches');
            await searchInput.fill(claimIdentifier);
            await applyFiltersButton.click();
            await expect(rowForClaim()).toHaveCount(1);
        }

        const actionButtons = rowForClaim().first().locator('button');
        const buttonCount = await actionButtons.count();
        await actionButtons.nth(buttonCount - 1).click();

        const deleteDialog = page.getByRole('dialog', { name: 'Delete Warranty Claim' });
        await deleteDialog.getByRole('button', { name: 'Delete' }).click();

        await expect(page.getByRole('alert').first()).toContainText('deleted');
        await expect(rowForClaim()).toHaveCount(0);

        await setCheckboxState(includeDeletedCheckbox, true);
        await searchInput.fill(claimIdentifier);
        await applyFiltersButton.click();
        await expect(rowForClaim()).toHaveCount(1);

        await rowForClaim().first().locator('button').first().click();
        await expect(page.getByRole('alert').first()).toContainText('restored');

        await setCheckboxState(includeDeletedCheckbox, false);
        await searchInput.fill(claimIdentifier);
        await applyFiltersButton.click();
        await expect(rowForClaim()).toHaveCount(1);
    });
});
