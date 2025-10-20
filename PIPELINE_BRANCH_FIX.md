# Pipeline Branch ID Fix

## Issue
Pipeline table's `branch_id` was sometimes different from its corresponding Lead's `branch_id`, causing data inconsistency.

## Solution
Removed manual branch selection from Pipeline create/edit forms and implemented automatic branch assignment based on:
1. **From Lead**: If a lead is selected, pipeline inherits the lead's `branch_id`
2. **From User**: If no lead is selected, pipeline uses the user's `branch_id`

## Changes Made

### Backend Changes

**1. `app/Http/Requests/StorePipelineRequest.php`**
- Updated `prepareForValidation()` to auto-fill `branch_id`:
  - If `lead_id` is provided → get `branch_id` from the lead
  - Otherwise → use authenticated user's `branch_id`
- Removed `branch_id` validation rule (no longer manually selected)
- This ensures pipeline and lead always have matching branches

### Frontend Changes

**1. `resources/js/pages/sales/pipeline-create.tsx`**
- Removed "Branch Selection" card (lines 180-208)
- Updated Lead interface to include `branch_id`
- Updated `handleLeadSelect()` to auto-fill `branch_id` from selected lead
- Updated description: "Select an existing lead to auto-fill customer information and branch"

**2. `resources/js/pages/sales/pipeline-edit.tsx`**
- No changes needed - edit form never had branch selection

### Existing Code (Already Correct)

**1. `app/Services/PipelineAutoProgressionService.php`**
- Already uses `$lead->branch_id` when auto-creating pipelines from qualified leads (line 30)

**2. `app/Http/Controllers/PipelineController.php`**
- Already includes `branch_id` in leads query (line 135)

## Behavior

### Creating Pipeline with Lead
1. User selects a lead from dropdown
2. Frontend auto-fills `branch_id` from lead
3. Backend validates and uses lead's `branch_id`
4. **Result**: Pipeline and Lead have matching `branch_id`

### Creating Pipeline without Lead (Manual Entry)
1. User enters customer information manually
2. Backend auto-fills `branch_id` from user's branch
3. **Result**: Pipeline uses user's `branch_id`

### Auto-Created Pipelines (from Qualified Leads)
1. Lead status changes to 'qualified' with score ≥ 70
2. Service creates pipeline with `branch_id` from lead
3. **Result**: Pipeline and Lead have matching `branch_id`

## Data Consistency

This fix ensures:
- ✅ Pipeline and Lead always have matching `branch_id` when linked
- ✅ No manual branch selection to cause mismatches
- ✅ Branch assignment is automatic and consistent
- ✅ Existing `branch_id` column preserved for future use
- ✅ Branch-based filtering and permissions still work correctly

## Migration Note

**No database migration needed** - the `branch_id` column remains in the pipelines table. Existing data is not modified. Future pipeline creations will automatically use the correct branch_id.

If you need to fix existing mismatched data, run this SQL:
```sql
UPDATE pipelines p
INNER JOIN leads l ON p.lead_id = l.id
SET p.branch_id = l.branch_id
WHERE p.lead_id IS NOT NULL AND p.branch_id != l.branch_id;
```

## Testing Checklist

- [ ] Create pipeline with lead selection → branch_id matches lead
- [ ] Create pipeline without lead → branch_id matches user's branch
- [ ] Lead qualification auto-creates pipeline → branch_id matches lead
- [ ] Test drive auto-progression → pipeline branch_id unchanged
- [ ] Admin users can create pipelines → uses their branch_id
- [ ] Non-admin users can create pipelines → uses their branch_id
- [ ] Edit pipeline → branch_id cannot be changed
