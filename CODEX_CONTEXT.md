# Codex Context Snapshot (Feb 8, 2026)

## Recently Implemented (keep across sessions)
- P1.9 CSV Exports: shared `CsvExportService` (streamed, capped by `config/exports.php` max_rows=1000) and endpoints/UI for Leads, Warranty Claims, Parts Inventory, and PMS Work Orders. Filters/branch scoping respected; CSV headers are human-readable, dates ISO.
- P1.6 Branch Reassignment: Admin/`leads.reassign_branch` only; audit logged; lead/pipeline edit pages show branch select for authorized, read-only otherwise.
- P1.5 Phone normalization to `+63` with validation; tests added.
- P1.4 Warranty end auto-compute; configurable term in `config/warranty.php`; respects manual override.
- P1.3 Release checklist + approval (admin/permission) with `release_approved_at`, checklist config, activity log, optional OR/CR check.
- P1.2 Sales attachments integrated into Documents system (types include `proof_of_payment`, `or_cr_scan`); UI section on vehicle unit view.
- P1.1 Documents foundation: `documents` table (polymorphic), upload/list/delete for vehicle units, allowed types in `config/documents.php`, admin-only delete; UI upload widget and grouped list.
- P0.3 Roles/permissions tightened for inventory/sales vs accounting; inventory restricted to status/location/sub_status; sales cannot edit cost; accounting role added.
- P0.2 GPS/insurance payload stored as structured JSON; validation aligned.
- P0.1 Sold-state requires owner_id; auto-link from reservation; lock consistency preserved.

## Key Files
- Export helper: `app/Services/CsvExportService.php`, config `config/exports.php`.
- Export routes: `routes/web.php` (`lead-management-export`, `warranty-claims-export`, `parts-inventory-export`, `pms-work-orders-export`).
- UI export buttons: `resources/js/Pages/sales/lead-management.tsx`, `service/warranty-claims.tsx`, `inventory/parts-inventory.tsx`, `service/pms-work-orders/index.tsx`.
- Branch reassignment logic: `app/Http/Requests/UpdateLeadRequest.php`, `UpdatePipelineRequest.php`, controllers `LeadController.php`, `PipelineController.php`.
- Documents: `documents` migration/model, controller endpoints, config `config/documents.php`, UI `resources/js/Pages/inventory/vehicle-view.tsx`.
- Release approval: `config/release.php`, migration adding `release_approved_at`, controller action `approveRelease`.
- Warranty term: `config/warranty.php`, applied in `VehicleUnitController`.
- Phone normalization: request validators and tests `tests/Feature/CRM/PhoneNormalizationTest.php`.

## Tests
- Full suite: `php artisan test` (2 registration tests skipped by design).
- Export-specific: part of full suite; max rows capped; branch scoping verified.

## Notes / Gotchas
- Export responses are streamed CSV; content-type includes charset per framework.
- Documents delete is admin-only; other roles may upload/view with unit access.
- Branch changes require admin or `leads.reassign_branch`; otherwise 403.
- Inventory role cannot persist financial fields; enforced in requests/controllers and covered by tests.

## Handy CURL examples
- Leads: `curl -L "http://app.test/sales/lead-management-export?search=Juan&status=hot"`
- Warranty: `curl -L "http://app.test/service/warranty-claims-export?status=approved"`
- Parts: `curl -L "http://app.test/inventory/parts-inventory-export?stock_status=low_stock"`
- Work Orders: `curl -L "http://app.test/service/pms-work-orders-export?status=completed&branch_id=1"`
