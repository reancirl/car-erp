# Pipeline Auto-Logging Implementation

## Overview
Implemented automated pipeline stage progression with intelligent rules to automatically advance opportunities through the sales funnel based on system events and customer interactions.

## Features Implemented

### 1. **Lead → Qualified Auto-Advancement**
- **Trigger**: When a Lead's status changes to 'qualified' AND lead_score ≥ 70
- **Action**: Automatically creates a new Pipeline entry in the "Qualified" stage
- **Implementation**: `Lead` model observer in `app/Models/Lead.php`
- **Data Transferred**:
  - Customer information (name, phone, email)
  - Branch and sales rep assignment
  - Vehicle interest
  - Lead score and priority

### 2. **Qualified → Quote Sent Auto-Advancement**
- **Trigger**: When a quote is generated for a qualified pipeline
- **Action**: Automatically advances pipeline to "Quote Sent" stage
- **Implementation**: `PipelineAutoProgressionService::advanceToQuoteSent()`
- **Probability Update**: Increases to 60%
- **Note**: To be integrated with Quote generation system when implemented

### 3. **Test Drive → Reservation Auto-Advancement**
- **Trigger**: When a test drive status changes from 'pending_signature' to 'confirmed'
- **Action**: 
  - If pipeline exists: Advances to "Reservation Made" stage
  - If no pipeline exists: Creates new pipeline directly in "Reservation Made" stage
- **Implementation**: `TestDrive` model observer in `app/Models/TestDrive.php`
- **Probability Update**: Sets to 85%
- **Priority**: Sets to 'high' for new pipelines
- **Matching**: Links via customer phone or email
- **Data Transferred**: Customer info, vehicle details, sales rep, branch
- **Note**: Triggers when customer signs and confirms the test drive, indicating serious purchase intent. Handles both scenarios - customers who went through earlier pipeline stages and walk-in customers who started with test drive

### 4. **Auto-Loss Detection**
- **Trigger**: Manual button click (no cron job)
- **Criteria**: Pipelines inactive for 7+ days
- **Action**: Marks pipelines as "Lost" with 0% probability
- **Implementation**: 
  - Service method: `PipelineAutoProgressionService::detectAndMarkInactivePipelines()`
  - Controller endpoint: `PipelineController::runAutoLossDetection()`
  - Route: `POST /sales/pipeline-auto-loss-detection`
- **Permissions**: Admin and Sales Manager only

## Files Created/Modified

### New Files
1. **`app/Services/PipelineAutoProgressionService.php`**
   - Core service handling all auto-progression logic
   - Methods:
     - `createPipelineFromQualifiedLead()` - Create pipeline from qualified lead
     - `advanceToQuoteSent()` - Advance to quote sent stage
     - `advanceToReservation()` - Advance to reservation stage
     - `advanceToTestDriveScheduled()` - Advance to test drive scheduled
     - `detectAndMarkInactivePipelines()` - Mark inactive pipelines as lost
     - `getAutoLoggingStats()` - Get auto-logging statistics

### Modified Files
1. **`app/Models/Lead.php`**
   - Added `updated` observer to detect status change to 'qualified'
   - Auto-creates pipeline when lead_score ≥ 70

2. **`app/Models/TestDrive.php`**
   - Added `created` observer for test drive scheduling
   - Added `updated` observer for reservation creation
   - Links to pipeline via customer phone/email

3. **`app/Http/Controllers/PipelineController.php`**
   - Added `runAutoLossDetection()` method
   - Includes activity logging and permission checks

4. **`routes/web.php`**
   - Added route: `POST /sales/pipeline-auto-loss-detection`

5. **`resources/js/pages/sales/pipeline.tsx`**
   - Added "Stage Transition Rules" card showing all active rules
   - Added "Run Now" button for Auto-Loss Detection
   - Visual indicators for each auto-progression rule
   - Added icons: `AlertTriangle`, `Play`

## Stage Transition Rules UI

The Pipeline page now displays a dedicated "Stage Transition Rules" section showing:

1. **Lead → Qualified** (Active)
   - Auto-advance when lead score ≥ 70

2. **Qualified → Quote Sent** (Active)
   - Auto-advance when quote is generated

3. **Test Drive → Reservation** (Active)
   - Auto-advance when reservation is created

4. **Auto-Loss Detection** (Monitoring)
   - Mark as lost after 7 days of inactivity
   - Manual trigger button with confirmation dialog

## Auto-Logging Behavior

### Stage Log Creation
All auto-progressions create detailed stage logs with:
- **Trigger Type**: `auto`
- **Trigger System**: Source system (e.g., "Lead Management", "Test Drive System")
- **Trigger Event**: Specific event description
- **Trigger User**: Associated user (if applicable)
- **Properties**: Additional context data (lead_id, quote_amount, etc.)

### Event Counting
- Each auto-progression increments `auto_logged_events_count`
- Tracked separately from manual stage changes
- Visible in pipeline stats dashboard

### Activity Tracking
- All auto-progressions update `last_activity_at` timestamp
- Used for inactivity detection
- Prevents false positives in auto-loss detection

## Usage Examples

### Example 1: Lead Qualification
```php
// When a lead is updated with high score
$lead = Lead::find(1);
$lead->update([
    'status' => 'qualified',
    'lead_score' => 75
]);
// → Automatically creates Pipeline in "Qualified" stage
```

### Example 2: Test Drive Reservation
```php
// When a test drive is created
$testDrive = TestDrive::create([
    'customer_phone' => '09171234567',
    'status' => 'confirmed',
    // ... other fields
]);
// → Automatically advances matching Pipeline to "Test Drive Scheduled"

// When reservation type changes
$testDrive->update(['reservation_type' => 'reservation']);
// → Automatically advances Pipeline to "Reservation Made"
```

### Example 3: Auto-Loss Detection
```php
// Via button click in UI (calls this endpoint)
POST /sales/pipeline-auto-loss-detection

// Or programmatically
$service = app(PipelineAutoProgressionService::class);
$result = $service->detectAndMarkInactivePipelines();
// Returns: ['count' => 5, 'pipelines' => [...]]
```

## Integration Points

### Future Quote System Integration
When implementing the Quote system, call:
```php
$service = app(PipelineAutoProgressionService::class);
$service->advanceToQuoteSent($pipeline, [
    'quote_amount' => $quote->amount,
    'quote_id' => $quote->id,
]);
```

### Customer Matching
Currently matches Pipeline to TestDrive via:
- Customer phone (primary)
- Customer email (fallback)

Consider adding direct foreign key relationship in future migration.

## Permissions & Security

- **Auto-Loss Detection**: Requires `sales.edit` permission
- **Role Restrictions**: Admin and Sales Manager only
- **Activity Logging**: All auto-progressions logged to audit trail
- **Branch Scoping**: Respects branch-based access control

## Statistics & Monitoring

The service provides comprehensive stats via `getAutoLoggingStats()`:
- Total auto events
- Auto events today/this week/this month
- Pipelines with auto-progression enabled
- Pipelines with auto-loss enabled
- Count of inactive pipelines (7+ days)

## Testing Recommendations

1. **Test Lead Qualification**
   - Create lead with score < 70 → No pipeline created
   - Update lead to score ≥ 70 and status 'qualified' → Pipeline created

2. **Test Test Drive Progression**
   - Create test drive with matching customer → Pipeline advances
   - Update to reservation type → Pipeline advances to reservation

3. **Test Auto-Loss Detection**
   - Create pipeline with old `last_activity_at`
   - Run detection → Pipeline marked as lost
   - Verify stage log created

4. **Test Permissions**
   - Try auto-loss detection as non-admin → Should fail
   - Verify activity logs created

## Notes

- No cron jobs required - all triggers are event-based except auto-loss detection
- Auto-loss detection is manual to give control to sales managers
- All auto-progressions can be disabled per-pipeline via `auto_progression_enabled` flag
- Stage logs provide complete audit trail of all transitions
- System respects existing pipeline stages (won't regress or skip stages inappropriately)
