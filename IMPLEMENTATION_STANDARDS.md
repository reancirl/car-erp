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

## 5. Form Request Validation (Laravel)

### Overview
Use dedicated Form Request classes for validation instead of inline validation in controllers. This provides better organization, reusability, and separation of concerns.

### Implementation Pattern

**5.1 Create Form Request Classes**
- Store: `app/Http/Requests/Store[Model]Request.php`
- Update: `app/Http/Requests/Update[Model]Request.php`

**5.2 Structure**
```php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeadRequest extends FormRequest
{
    /**
     * Authorization check
     */
    public function authorize(): bool {
        return $this->user()->can('module.create');
    }

    /**
     * Prepare data before validation
     */
    protected function prepareForValidation(): void {
        // Auto-assign branch for non-admin
        if (!auth()->user()->hasRole('admin')) {
            $this->merge(['branch_id' => auth()->user()->branch_id]);
        }
        
        // Transform data (e.g., 'unassigned' -> null)
        if ($this->field === 'unassigned') {
            $this->merge(['field' => null]);
        }
    }

    /**
     * Validation rules
     */
    public function rules(): array {
        $rules = [
            'name' => 'required|string|min:2|max:255',
            'email' => 'required|email:rfc,dns|max:255',
            'phone' => 'required|string|min:10|max:20',
            'status' => 'required|in:new,active,inactive',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
        ];

        // Conditional rules based on role
        if ($this->user()->hasRole('admin')) {
            $rules['branch_id'] = 'required|exists:branches,id';
        }

        return $rules;
    }

    /**
     * Custom error messages
     */
    public function messages(): array {
        return [
            'name.required' => 'Name is required.',
            'name.min' => 'Name must be at least 2 characters.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'branch_id.required' => 'Branch is required.',
            'branch_id.exists' => 'Selected branch does not exist.',
        ];
    }
}
```

**5.3 Update Request Pattern**
```php
class UpdateLeadRequest extends FormRequest
{
    public function authorize(): bool {
        $model = $this->route('model');
        
        // Check permission
        if (!$this->user()->can('module.edit')) {
            return false;
        }

        // Branch-level authorization
        if (!$this->user()->hasRole('admin') && $model->branch_id !== $this->user()->branch_id) {
            return false;
        }

        return true;
    }

    public function rules(): array {
        return [
            // Same as Store, but branch_id is NOT updatable
            'name' => 'required|string|min:2|max:255',
            // ... other fields
        ];
    }
}
```

**5.4 Controller Usage**
```php
public function store(StoreLeadRequest $request): RedirectResponse {
    $data = $request->validated(); // Already validated and authorized
    $model = Model::create($data);
    // ... log activity
    return redirect()->route('route.name')->with('success', 'Created!');
}

public function update(UpdateLeadRequest $request, Model $model): RedirectResponse {
    $data = $request->validated();
    $model->update($data);
    // ... log activity
    return redirect()->route('route.name')->with('success', 'Updated!');
}
```

**Key Features:**
- Authorization in `authorize()` method
- Data transformation in `prepareForValidation()`
- Conditional rules based on user role
- Custom error messages
- Auto-merge branch_id for non-admin users
- Route model binding authorization

---

## 6. UI Validation Error Display

### Overview
Consistent validation error display across all forms with prominent error banner and inline field errors.

### Implementation Pattern

**6.1 Validation Error Banner**
Display at the top of the form when errors exist:

```tsx
{Object.keys(errors).length > 0 && (
    <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                    <h3 className="font-semibold text-red-900">Validation Error</h3>
                    <p className="text-sm text-red-800 mt-1">
                        Please correct the following errors before submitting:
                    </p>
                    <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                        {Object.entries(errors).map(([field, message]) => (
                            <li key={field}>
                                <strong className="capitalize">
                                    {field.replace(/_/g, ' ')}
                                </strong>: {message}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </CardContent>
    </Card>
)}
```

**6.2 Inline Field Errors**
Show errors below each field:

```tsx
<div className="space-y-2">
    <Label htmlFor="email">Email *</Label>
    <Input
        id="email"
        type="email"
        value={data.email}
        onChange={(e) => setData('email', e.target.value)}
        className={errors.email ? 'border-red-500' : ''}
        required
    />
    {errors.email && (
        <p className="text-sm text-red-600">{errors.email}</p>
    )}
</div>
```

**6.3 Select Field Errors**
```tsx
<Select 
    value={data.status} 
    onValueChange={(value) => setData('status', value)}
    required
>
    <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
        <SelectValue placeholder="Select status" />
    </SelectTrigger>
    <SelectContent>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="inactive">Inactive</SelectItem>
    </SelectContent>
</Select>
{errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
```

**6.4 Form Submit Button State**
```tsx
<Button type="submit" disabled={processing}>
    <Save className="h-4 w-4 mr-2" />
    {processing ? 'Creating...' : 'Create Record'}
</Button>
```

**Key Features:**
- Prominent error banner at top of form
- List all validation errors with field names
- Red border on invalid fields (`border-red-500`)
- Inline error messages below fields
- Disabled submit button during processing
- Loading state text change

---

## 7. Complete CRUD Implementation Pattern

### Overview
Standardized CRUD implementation based on Lead Management (the best reference implementation).

### 7.1 Model Implementation

**Required Elements:**
```php
class Lead extends Model {
    use HasFactory, SoftDeletes;

    // 1. Fillable fields
    protected $fillable = [
        'branch_id',
        'name',
        'email',
        // ... all editable fields
    ];

    // 2. Casts for type safety
    protected $casts = [
        'tags' => 'array',
        'created_at' => 'datetime',
        'amount' => 'decimal:2',
        'count' => 'integer',
    ];

    // 3. Relationships
    public function branch() {
        return $this->belongsTo(Branch::class);
    }

    public function assignedUser() {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // 4. Query Scopes for branch filtering
    public function scopeForBranch($query, $branchId) {
        return $query->where('branch_id', $branchId);
    }

    public function scopeForUserBranch($query, User $user) {
        return $query->where('branch_id', $user->branch_id);
    }

    // 5. Boot method for auto-generation and observers
    protected static function boot() {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->model_id) {
                $model->model_id = self::generateModelId();
            }
        });
    }

    // 6. Helper methods
    private static function generateModelId(): string {
        $year = date('Y');
        $lastRecord = self::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();
        $number = $lastRecord ? intval(substr($lastRecord->model_id, -3)) + 1 : 1;
        return sprintf('PREFIX-%s-%03d', $year, $number);
    }

    // 7. Accessor for formatted data
    public function getFormattedFieldAttribute(): ?string {
        return $this->field ? number_format($this->field, 2) : null;
    }
}
```

### 7.2 Controller Implementation

**Complete CRUD Controller:**
```php
class LeadController extends Controller {
    use LogsActivity;

    /**
     * Index - List with filtering
     */
    public function index(Request $request): Response {
        $user = $request->user();

        // Base query with relationships
        $query = Model::with(['branch', 'assignedUser'])
            ->when($request->include_deleted, fn($q) => $q->withTrashed())
            ->when(!$user->hasRole('admin'), fn($q) => $q->forUserBranch($user))
            ->when($request->branch_id && $user->hasRole('admin'), 
                fn($q) => $q->where('branch_id', $request->branch_id))
            ->when($request->search, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('model_id', 'like', "%{$search}%");
                });
            })
            ->when($request->status, fn($q, $status) => $q->where('status', $status));

        $records = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Calculate stats
        $statsQuery = clone $query;
        $stats = [
            'total' => $statsQuery->count(),
            'active' => (clone $statsQuery)->where('status', 'active')->count(),
            // ... other stats
        ];

        return Inertia::render('module/index', [
            'records' => $records,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'branch_id', 'include_deleted']),
            'branches' => $user->hasRole('admin') ? Branch::where('status', 'active')->get() : null,
        ]);
    }

    /**
     * Create - Show form
     */
    public function create(Request $request): Response {
        $user = $request->user();

        return Inertia::render('module/create', [
            'branches' => $user->hasRole('admin') ? Branch::where('status', 'active')->get() : null,
            // ... other related data
        ]);
    }

    /**
     * Store - Create new record
     */
    public function store(StoreRequest $request): RedirectResponse {
        $data = $request->validated();

        // Business logic (calculations, transformations)
        $data['calculated_field'] = $this->calculateSomething($data);

        $model = Model::create($data);

        // Log activity
        $this->logCreated(
            module: 'ModuleName',
            subject: $model,
            description: "Created {$model->name}",
            properties: ['key' => 'value']
        );

        return redirect()
            ->route('route.index')
            ->with('success', 'Created successfully!');
    }

    /**
     * Show - Display single record
     */
    public function show(Request $request, Model $model): Response {
        // Authorization
        if (!$request->user()->hasRole('admin') && 
            $model->branch_id !== $request->user()->branch_id) {
            abort(403, 'You can only view records from your branch.');
        }

        $model->load(['branch', 'assignedUser']);

        return Inertia::render('module/view', [
            'record' => $model,
            'can' => [
                'edit' => $request->user()->can('module.edit'),
                'delete' => $request->user()->can('module.delete'),
            ],
        ]);
    }

    /**
     * Edit - Show edit form
     */
    public function edit(Request $request, Model $model): Response {
        // Authorization
        if (!$request->user()->hasRole('admin') && 
            $model->branch_id !== $request->user()->branch_id) {
            abort(403, 'You can only edit records from your branch.');
        }

        $model->load(['branch', 'assignedUser']);

        return Inertia::render('module/edit', [
            'record' => $model,
            // ... related data
        ]);
    }

    /**
     * Update - Save changes
     */
    public function update(UpdateRequest $request, Model $model): RedirectResponse {
        $data = $request->validated();

        // Recalculate if needed
        if (isset($data['relevant_field'])) {
            $data['calculated'] = $this->calculate(array_merge($model->toArray(), $data));
        }

        // Track changes
        $changes = [];
        foreach ($data as $key => $value) {
            if ($model->{$key} != $value) {
                $changes[$key] = ['old' => $model->{$key}, 'new' => $value];
            }
        }

        $model->update($data);

        // Log activity
        $this->logUpdated(
            module: 'ModuleName',
            subject: $model,
            description: "Updated {$model->name}",
            properties: ['changes' => $changes]
        );

        return redirect()
            ->route('route.index')
            ->with('success', 'Updated successfully!');
    }

    /**
     * Destroy - Soft delete
     */
    public function destroy(Request $request, Model $model): RedirectResponse {
        // Authorization
        if (!$request->user()->hasRole('admin') && 
            $model->branch_id !== $request->user()->branch_id) {
            abort(403, 'You can only delete records from your branch.');
        }

        $name = $model->name;

        // Log before deletion
        $this->logDeleted(
            module: 'ModuleName',
            subject: $model,
            description: "Deleted {$name}",
            properties: ['name' => $name]
        );

        $model->delete();

        return redirect()
            ->route('route.index')
            ->with('success', 'Deleted successfully!');
    }

    /**
     * Restore - Restore soft-deleted
     */
    public function restore(Request $request, $id): RedirectResponse {
        try {
            $model = Model::withTrashed()->findOrFail($id);
            
            // Authorization
            if (!$request->user()->hasRole('admin') && 
                $model->branch_id !== $request->user()->branch_id) {
                abort(403, 'You can only restore records from your branch.');
            }
            
            if (!$model->trashed()) {
                return redirect()->back()->with('error', 'Record is not deleted.');
            }
            
            $name = $model->name;
            $model->restore();

            // Log activity
            $this->logRestored(
                module: 'ModuleName',
                subject: $model,
                description: "Restored {$name}",
                properties: ['name' => $name]
            );

            return redirect()
                ->route('route.index')
                ->with('success', 'Restored successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to restore. Please try again.');
        }
    }
}
```

**Key Patterns:**
- Use Form Requests for validation
- Branch filtering in all queries
- Authorization checks in show/edit/destroy/restore
- Track changes in update method
- Log all CRUD operations
- Include relationships with `->with()`
- Clone query for stats calculation
- Preserve query string in pagination
- Try-catch in restore method

---

## 8. Implementation Checklist

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
- [ ] Create `StoreRequest` class with authorization and rules
- [ ] Create `UpdateRequest` class with route model authorization
- [ ] Implement `prepareForValidation()` for data transformation
- [ ] Add conditional rules based on user role
- [ ] Define custom error messages in `messages()` method
- [ ] Auto-merge branch_id for non-admin users

### Frontend (React/TypeScript)

**TypeScript Interfaces:**
- [ ] Define interface for main model
- [ ] Define Props interface for each page
- [ ] Define filter state types

**Pages:**
- [ ] **Index** (`module-name.tsx`):
  - [ ] Page header with title and create button
  - [ ] Stats cards (4 metrics with icons)
  - [ ] Filter section with search and selects
  - [ ] Data table with actions (View, Edit, Delete)
  - [ ] Badge components for status display
  - [ ] Pagination links
  - [ ] Empty state message
  - [ ] Delete confirmation dialog
- [ ] **Create** (`module-name-create.tsx`):
  - [ ] **Validation error banner at top** (red card with all errors)
  - [ ] Form with Inertia useForm hook
  - [ ] Grid layout (2/3 main + 1/3 sidebar)
  - [ ] Branch selection for admin (required)
  - [ ] Inline field validation errors (red border + message)
  - [ ] Loading states on submit button
  - [ ] Cancel and Submit buttons with icons
  - [ ] Required field indicators (*)
- [ ] **Edit** (`module-name-edit.tsx`):
  - [ ] Same validation error banner as create
  - [ ] Similar to create, with pre-filled data
  - [ ] Handle existing relationships
  - [ ] Branch field disabled (not editable)
  - [ ] Inline validation errors
- [ ] **View** (`module-name-view.tsx`):
  - [ ] Display-only layout
  - [ ] Show all relevant data with proper formatting
  - [ ] Action buttons (Edit, Delete) based on permissions
  - [ ] Badge components for status/categories

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
