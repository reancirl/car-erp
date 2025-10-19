# Activity Log Implementation Guide

## Overview
Successfully implemented a comprehensive activity logging system that automatically tracks all create, update, and delete operations across the Branch, User, and Lead modules.

## Architecture

### 1. Database Schema (`activity_logs` table)
- **id**: Primary key
- **log_name**: Category/module name (e.g., 'sales', 'branch', 'users')
- **description**: Human-readable description of the action
- **subject_type** & **subject_id**: Polymorphic relation to the affected model
- **event**: Type of event (created, updated, deleted)
- **causer_type** & **causer_id**: Polymorphic relation to the user who performed the action
- **properties**: JSON field storing additional metadata
- **action**: Standardized action identifier (e.g., 'sales.create', 'branch.update')
- **module**: Display module name (e.g., 'Sales', 'Branch', 'Users')
- **status**: Enum (success, failed, flagged)
- **ip_address**: User's IP address
- **user_agent**: User's browser information
- **created_at** & **updated_at**: Timestamps

### 2. Core Components

#### ActivityLog Model (`app/Models/ActivityLog.php`)
- Eloquent model with polymorphic relationships
- Scopes for filtering by module, status, causer, and date range
- Relationships to `causer` (User) and `subject` (any model)

#### LogsActivity Trait (`app/Traits/LogsActivity.php`)
Provides convenient methods for logging:
- `logCreated()` - Logs creation events
- `logUpdated()` - Logs update events with change tracking
- `logDeleted()` - Logs deletion events
- `logActivity()` - Low-level logging method

**Usage Example:**
```php
use App\Traits\LogsActivity;

class YourController extends Controller
{
    use LogsActivity;

    public function store(Request $request)
    {
        $model = YourModel::create($data);
        
        $this->logCreated(
            module: 'ModuleName',
            subject: $model,
            description: "Created record {$model->name}",
            properties: ['key' => 'value']
        );
    }
}
```

#### ActivityLogController (`app/Http/Controllers/ActivityLogController.php`)
- `index()`: Display paginated activity logs with filtering
- `export()`: Export logs to CSV
- `getStatistics()`: Calculate real-time statistics

### 3. Integrated Modules

#### ✅ Branch Management
- **Create**: Logs branch creation with code, city, and status
- **Update**: Tracks all field changes
- **Delete**: Records deleted branch information

#### ✅ User Management
- **Create**: Logs user creation with role assignment
- **Update**: Tracks changes including role changes and password updates
- **Delete**: Records user deletion with role information

#### ✅ Lead Management
- **Create**: Logs lead creation with scoring information
- **Update**: Tracks all changes with old/new values
- **Delete**: Records lead deletion with contact information

### 4. Frontend Implementation

#### Activity Logs Page (`/audit/activity-logs`)
**Features:**
- Real-time statistics dashboard showing:
  - Total events today with percentage change
  - Active users who performed actions today
  - Failed actions requiring attention
  - Flagged events in the last 7 days
  
- **Filtering & Search:**
  - Search by description or action
  - Filter by module (Sales, Branch, Users, etc.)
  - Filter by status (success, failed, flagged)
  
- **Activity Table:**
  - Timestamp, user, action, module, status, IP address
  - Descriptive details of each action
  - Color-coded badges for modules and status
  
- **Pagination:**
  - 50 logs per page
  - Previous/Next navigation
  - Page number selection
  
- **Export:**
  - CSV export with applied filters
  - Up to 1000 records per export

## Routes

```php
Route::middleware(['auth', 'verified', 'permission:audit.view'])->group(function () {
    Route::get('audit/activity-logs', [ActivityLogController::class, 'index'])
        ->name('audit.activity-logs');
    
    Route::get('audit/activity-logs-export', [ActivityLogController::class, 'export'])
        ->name('audit.activity-logs.export')
        ->middleware('permission:audit.export');
});
```

## How to Add Logging to New Controllers

1. **Add the trait:**
```php
use App\Traits\LogsActivity;

class YourController extends Controller
{
    use LogsActivity;
}
```

2. **Log creation:**
```php
$this->logCreated(
    module: 'YourModule',
    subject: $model,
    description: "Created {$model->name}",
    properties: [
        'field1' => $model->field1,
        'field2' => $model->field2,
    ]
);
```

3. **Log updates with change tracking:**
```php
// Track changes
$changes = [];
foreach ($data as $key => $value) {
    if ($model->{$key} != $value) {
        $changes[$key] = [
            'old' => $model->{$key},
            'new' => $value,
        ];
    }
}

$model->update($data);

$this->logUpdated(
    module: 'YourModule',
    subject: $model,
    description: "Updated {$model->name}",
    properties: ['changes' => $changes]
);
```

4. **Log deletion:**
```php
$this->logDeleted(
    module: 'YourModule',
    subject: $model,
    description: "Deleted {$model->name}",
    properties: [
        'important_field' => $model->important_field,
    ]
);

$model->delete();
```

## Testing the Implementation

1. **Access the activity logs page:**
   - Navigate to: `http://127.0.0.1:8000/audit/activity-logs`
   - Requires `audit.view` permission

2. **Generate activity logs:**
   - Create a new branch
   - Update an existing user
   - Delete a lead
   - Check the activity logs page to see the recorded activities

3. **Test filtering:**
   - Use the search box to find specific actions
   - Filter by module (Sales, Branch, Users)
   - Filter by status (success, failed, flagged)

4. **Test export:**
   - Click "Export Logs" button
   - CSV file will download with filtered results

## Statistics Calculation

The system automatically calculates:
- **Total Events Today**: Count of all logs created today with percentage change from yesterday
- **Active Users**: Distinct count of users who performed actions today
- **Failed Actions**: Count of failed status logs today
- **Flagged Events**: Count of flagged status logs in the last 7 days

## Future Enhancements

Consider adding logging to:
- [ ] PMS (Preventive Maintenance Service) operations
- [ ] Inventory management operations
- [ ] Warranty claim processing
- [ ] Test drive scheduling
- [ ] Customer interactions
- [ ] Role and permission changes
- [ ] System settings modifications
- [ ] Login/logout events (separate session logging)

## Notes

- All activity logs are **immutable** - they cannot be edited or deleted through the UI
- Logs automatically capture user context (who performed the action)
- IP address and user agent are recorded for security auditing
- The system is designed to handle high-volume logging with indexed database columns
- Statistics are calculated in real-time on page load

## Database Indexes

The following indexes are created for optimal query performance:
- `log_name`
- `subject_type` + `subject_id` (composite)
- `causer_type` + `causer_id` (composite)
- `action`
- `module`
- `status`
- `created_at`

This ensures fast filtering and searching even with millions of log entries.
