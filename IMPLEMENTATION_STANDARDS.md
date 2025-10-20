# Implementation Standards & Patterns

This document outlines the standardized implementation patterns used across the Car ERP system. Use this as a reference when implementing new modules.

---

## Table of Contents
1. [Branch Management System](#1-branch-management-system)
2. [Soft Deletes Implementation](#2-soft-deletes-implementation)
3. [Activity Logs System](#3-activity-logs-system)
4. [UI Standards (User CRUD)](#4-ui-standards-user-crud)
5. [Implementation Checklist](#5-implementation-checklist)

---

## 1. Branch Management System

### Overview
Multi-branch data isolation with role-based access control. Admin and auditor roles can see all branches; other roles see only their branch data.

### Key Components

**1.1 Database Structure**
- Migration: `create_branches_table.php`
- Key fields: `id`, `name`, `code` (unique), `address`, `city`, `state`, `postal_code`, `status`, `business_hours` (JSON), `deleted_at`
- Add `branch_id` foreign key to models that need branch isolation

**1.2 Branch Model** (`app/Models/Branch.php`)
- Uses `SoftDeletes` trait
- Relationships: `hasMany(User::class)`
- Scopes: `active()`, `inactive()`
- Helper: `isActive()`, `getFullAddressAttribute()`

**1.3 BranchScoped Trait** (`app/Models/Concerns/BranchScoped.php`)
- Auto-assigns `branch_id` on create
- Global scope filters by user's branch (except admin/auditor)
- Scopes: `forBranch($id)`, `forBranches($ids)`, `withoutBranchScope()`
- Relationship: `belongsTo(Branch::class)`
- Helpers: `belongsToBranch($id)`, `belongsToUserBranch()`

**Usage:**
```php
class Lead extends Model {
    use BranchScoped, SoftDeletes;
    protected $fillable = ['branch_id', /* other fields */];
}
```

**1.4 SetBranchContext Middleware** (`app/Http/Middleware/SetBranchContext.php`)
- Shares current branch with Inertia views
- Stores `current_branch_id` in session

**1.5 Controller Pattern**
- Filter queries by branch for non-admin users
- Include branch in queries: `->with(['branch'])`
- Branch filtering: `->when(!$user->hasRole('admin'), fn($q) => $q->where('branch_id', $user->branch_id))`

---

## 2. Soft Deletes Implementation

### Overview
Records are marked deleted with `deleted_at` timestamp but remain in database for recovery.

### Implementation Steps

**2.1 Database Migration**
```php
// add_soft_deletes_to_[table]_table.php
Schema::table('table_name', function (Blueprint $table) {
    $table->softDeletes();
});
```

**2.2 Model**
```php
use Illuminate\Database\Eloquent\SoftDeletes;

class YourModel extends Model {
    use SoftDeletes;
}
```

**2.3 Query Patterns**
- Normal: `Model::all()` (excludes soft-deleted)
- Include deleted: `Model::withTrashed()->get()`
- Only deleted: `Model::onlyTrashed()->get()`
- Check: `$model->trashed()`
- Restore: `$model->restore()`
- Force delete: `$model->forceDelete()`

**2.4 Controller Methods**

**Delete (Soft):**
```php
public function destroy(Model $model): RedirectResponse {
    $name = $model->name;
    $this->logDeleted('Module', $model, "Deleted {$name}", []);
    $model->delete();
    return redirect()->back()->with('success', 'Deleted successfully!');
}
```

**Restore:**
```php
public function restore(Request $request, $id): RedirectResponse {
    $model = Model::withTrashed()->findOrFail($id);
    if (!$model->trashed()) {
        return redirect()->back()->with('error', 'Not deleted.');
    }
    $model->restore();
    $this->logRestored('Module', $model, "Restored {$model->name}", []);
    return redirect()->back()->with('success', 'Restored successfully!');
}
```

**2.5 Routes**
```php
Route::resource('items', ItemController::class);
Route::post('items/{id}/restore', [ItemController::class, 'restore'])->name('items.restore');
```

**2.6 UI Pattern**
- Add `include_deleted` filter checkbox
- Query: `->when(request('include_deleted'), fn($q) => $q->withTrashed())`
- Show restore button for deleted records
- Indicate deleted status with badge/styling

---

## 3. Activity Logs System

### Overview
Comprehensive audit trail tracking all CRUD operations with user, branch, IP, and metadata.

### Key Components

**3.1 Database Schema** (`create_activity_logs_table.php`)
- Fields: `id`, `log_name`, `description`, `subject_type`, `subject_id`, `event`, `causer_type`, `causer_id`, `branch_id`, `properties` (JSON), `action`, `module`, `status`, `ip_address`, `user_agent`, `created_at`
- Indexes on: `log_name`, `subject`, `causer`, `action`, `module`, `status`, `created_at`

**3.2 ActivityLog Model** (`app/Models/ActivityLog.php`)
- Relationships: `morphTo()` for subject and causer, `belongsTo(Branch::class)`
- Scopes: `forBranch($id)`, `forModule($name)`, `withStatus($status)`, `byCauser($userId)`, `recent($days)`
- Casts: `properties` => `array`

**3.3 LogsActivity Trait** (`app/Traits/LogsActivity.php`)
- Use in controllers: `use LogsActivity;`
- Methods: `logCreated()`, `logUpdated()`, `logDeleted()`, `logRestored()`
- Auto-captures: user, branch, IP, user agent, timestamp

**Usage:**
```php
class YourController extends Controller {
    use LogsActivity;

    public function store(Request $request) {
        $model = Model::create($validated);
        $this->logCreated(
            module: 'ModuleName',
            subject: $model,
            description: "Created {$model->name}",
            properties: ['key' => 'value']
        );
        return redirect()->back();
    }

    public function update(Request $request, Model $model) {
        // Track changes
        $changes = [];
        foreach ($validated as $key => $value) {
            if ($model->{$key} != $value) {
                $changes[$key] = ['old' => $model->{$key}, 'new' => $value];
            }
        }
        $model->update($validated);
        $this->logUpdated('Module', $model, "Updated {$model->name}", ['changes' => $changes]);
    }
}
```

**3.4 ActivityLog Controller**
- Branch filtering for non-admin users
- Filters: module, status, search, branch_id
- Statistics: total events, active users, failed actions
- Export to CSV functionality
- Check if subject is soft-deleted when displaying

---

## 4. UI Standards (User CRUD)

### Overview
Reference: `resources/js/pages/admin/user-management.tsx` and related files.

### Page Structure

**4.1 Index/List Page** (`user-management.tsx`)
1. **Page Header**: Icon + Title + "Create" button
2. **Stats Cards**: 4 cards with key metrics (grid-cols-4)
3. **Filter Section**: Card with search input + select filters
4. **Data Table**: Card with table displaying records

**4.2 Create/Edit Form** (`user-create.tsx`, `user-edit.tsx`)
- Layout: `grid grid-cols-1 lg:grid-cols-3` (2/3 main, 1/3 sidebar)
- **Main Column**: Basic Info, Security sections
- **Sidebar**: Assignment (Branch, Role)
- Form handling: Inertia `useForm` hook
- Submit with loading state indicator

**4.3 View Page** (`user-view.tsx`)
- Display-only version of form
- Show all details in organized sections
- Action buttons: Edit, Delete

### Component Patterns

**Filter Implementation:**
```tsx
const [search, setSearch] = useState(filters.search || '');

const handleSearch = (value: string) => {
    setSearch(value);
    router.get('/route', { search: value, ...otherFilters }, { 
        preserveState: true, 
        replace: true 
    });
};
```

**Table with Actions:**
```tsx
<Table>
    <TableHeader>
        <TableRow>
            <TableHead>Column 1</TableHead>
            <TableHead>Actions</TableHead>
        </TableRow>
    </TableHeader>
    <TableBody>
        {items.data.map((item) => (
            <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                    <div className="flex space-x-1">
                        <Link href={`/route/${item.id}`}>
                            <Button variant="ghost" size="sm"><Eye /></Button>
                        </Link>
                        <Link href={`/route/${item.id}/edit`}>
                            <Button variant="ghost" size="sm"><Edit /></Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                            <Trash2 />
                        </Button>
                    </div>
                </TableCell>
            </TableRow>
        ))}
    </TableBody>
</Table>
```

**Badge Usage:**
```tsx
const getStatusBadge = (status: string) => {
    switch (status) {
        case 'active':
            return <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />Active
            </Badge>;
        case 'inactive':
            return <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />Inactive
            </Badge>;
    }
};
```

### UI Component Standards
- **Icons**: From `lucide-react`
- **Components**: shadcn/ui (Card, Button, Input, Select, Table, Badge, Dialog)
- **Layout**: AppLayout with breadcrumbs
- **Spacing**: `space-y-6` for vertical sections, `gap-4` for grids
- **Responsiveness**: `md:` breakpoints for desktop layouts

---

## 5. Implementation Checklist

### Backend (Laravel/PHP)

**Database:**
- [ ] Create migration for main table
- [ ] Add `branch_id` column if branch-scoped
- [ ] Add `deleted_at` column (soft deletes)
- [ ] Add necessary indexes

**Model:**
- [ ] Create model with proper namespace
- [ ] Add `use SoftDeletes;` trait
- [ ] Add `use BranchScoped;` trait (if branch-isolated)
- [ ] Define `$fillable` array
- [ ] Define `$casts` array
- [ ] Add relationships (belongsTo, hasMany, etc.)
- [ ] Add query scopes
- [ ] Add helper methods

**Controller:**
- [ ] Create controller with `use LogsActivity;`
- [ ] `index()`: List with filters, pagination, branch filtering
- [ ] `create()`: Show form with related data
- [ ] `store()`: Validate, create, log activity, redirect
- [ ] `show()`: Display single record
- [ ] `edit()`: Show form with existing data
- [ ] `update()`: Validate, track changes, update, log, redirect
- [ ] `destroy()`: Log, soft delete, redirect
- [ ] `restore()`: Restore soft-deleted, log, redirect

**Routes:**
- [ ] Resource routes: `Route::resource('name', Controller::class)`
- [ ] Restore route: `Route::post('name/{id}/restore', [Controller::class, 'restore'])`
- [ ] Apply middleware: `auth`, `verified`, permissions
- [ ] Group by prefix if needed

**Validation:**
- [ ] Create Form Request classes (optional but recommended)
- [ ] Define validation rules
- [ ] Add custom error messages

### Frontend (React/TypeScript)

**TypeScript Interfaces:**
- [ ] Define interface for main model
- [ ] Define Props interface for each page
- [ ] Define filter state types

**Pages:**
- [ ] **Index** (`module-name.tsx`):
  - [ ] Page header with title and create button
  - [ ] Stats cards (4 metrics)
  - [ ] Filter section with search and selects
  - [ ] Data table with actions
  - [ ] Pagination links
  - [ ] Empty state message
- [ ] **Create** (`module-name-create.tsx`):
  - [ ] Form with Inertia useForm
  - [ ] Grid layout (2/3 + 1/3)
  - [ ] Validation error display
  - [ ] Loading states
  - [ ] Cancel and Submit buttons
- [ ] **Edit** (`module-name-edit.tsx`):
  - [ ] Similar to create, with pre-filled data
  - [ ] Handle existing relationships
- [ ] **View** (`module-name-view.tsx`):
  - [ ] Display-only layout
  - [ ] Show all relevant data
  - [ ] Action buttons (Edit, Delete)

**State Management:**
- [ ] Local state for filters
- [ ] Handle filter changes with router.get
- [ ] Preserve state with `preserveState: true`

**UI Polish:**
- [ ] Consistent icon usage
- [ ] Proper badge colors and variants
- [ ] Responsive design
- [ ] Loading indicators
- [ ] Success/error messages
- [ ] Confirmation dialogs for destructive actions

### Testing
- [ ] Test CRUD operations
- [ ] Test branch filtering
- [ ] Test soft delete and restore
- [ ] Test activity logging
- [ ] Test permissions
- [ ] Test UI filters and search

---

## Key Files Reference

### Backend
- **Models**: `app/Models/[ModelName].php`
- **Controllers**: `app/Http/Controllers/[ControllerName].php`
- **Traits**: `app/Traits/LogsActivity.php`, `app/Models/Concerns/BranchScoped.php`
- **Migrations**: `database/migrations/[timestamp]_create_[table]_table.php`
- **Routes**: `routes/web.php`

### Frontend
- **Pages**: `resources/js/pages/[module]/[page-name].tsx`
- **Components**: `resources/js/components/ui/[component].tsx`
- **Layout**: `resources/js/layouts/app-layout.tsx`
- **Types**: `resources/js/types/index.d.ts`

### Documentation
- **RBAC**: `RBAC_IMPLEMENTATION.md`
- **Activity Log**: `ACTIVITY_LOG_IMPLEMENTATION.md`
- **Branch Setup**: `BRANCH_SETUP_SUMMARY.md`
- **Branch Implementation**: `BRANCH_IMPLEMENTATION_GUIDE.md`

---

## Best Practices

1. **Always log activities** for audit trail
2. **Use soft deletes** unless data must be permanently removed
3. **Apply branch scoping** for multi-location data isolation
4. **Follow UI patterns** from User CRUD for consistency
5. **Validate inputs** on both frontend and backend
6. **Handle errors gracefully** with try-catch blocks
7. **Provide user feedback** with success/error messages
8. **Use TypeScript** for type safety in frontend
9. **Apply permissions** to routes and actions
10. **Test thoroughly** including edge cases

---

## Example Module Implementation

See these files for complete examples:
- **User Management**: Backend (`UserController.php`, `User.php`) + Frontend (`user-management.tsx`)
- **Branch Management**: Backend (`BranchController.php`, `Branch.php`) + Frontend (`branch-management.tsx`)
- **Lead Management**: Backend (`LeadController.php`, `Lead.php`) + Frontend (`lead-management.tsx`)

These serve as templates for new modules.
