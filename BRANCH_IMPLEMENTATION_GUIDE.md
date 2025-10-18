# Branch Management Implementation Guide

## Overview

This guide documents the complete branch isolation architecture implemented in the Car ERP system. The system supports multi-branch dealership operations with automatic data filtering and role-based access control.

---

## Architecture Components

### 1. Database Schema

**Branches Table** (`branches`)
- Already exists with comprehensive fields
- Stores branch information (name, code, address, contact, business hours, coordinates)

**Users Table** (`users`)
- Added `branch_id` foreign key
- Each user belongs to one primary branch
- Nullable to support system-level accounts

**Pattern for All Business Entities:**
```php
$table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
$table->index('branch_id');
```

---

### 2. Models & Traits

**BranchScoped Trait** (`App\Models\Concerns\BranchScoped`)

Provides automatic branch filtering for all business entities.

**Features:**
- ✅ Auto-assigns current user's branch when creating records
- ✅ Global scope for automatic filtering
- ✅ Admin/auditor roles bypass filtering
- ✅ Helper methods for manual filtering
- ✅ Branch relationship included

**Usage in Models:**
```php
use App\Models\Concerns\BranchScoped;

class Vehicle extends Model
{
    use BranchScoped;
    
    protected $fillable = ['branch_id', 'vin', 'model', ...];
}
```

**Available Methods:**
```php
// Automatic filtering (applies to non-admin users)
Vehicle::all(); // Only current user's branch

// Manual filtering
Vehicle::forBranch($branchId)->get();
Vehicle::forBranches([1, 2, 3])->get();

// Admin/auditor - bypass filtering
Vehicle::withoutBranchScope()->get();

// Check branch ownership
$vehicle->belongsToBranch($branchId);
$vehicle->belongsToUserBranch();
```

---

### 3. Middleware

**SetBranchContext** (`App\Http\Middleware\SetBranchContext`)

Sets branch context for authenticated users.

**Features:**
- Shares branch info with all Inertia views
- Stores branch ID in session
- Available in all frontend components

**Frontend Access:**
```tsx
// In React/TypeScript components
const { currentBranch } = usePage().props;

// Access:
currentBranch.id
currentBranch.name
currentBranch.code
```

**To Register Middleware:**
Add to `bootstrap/app.php`:
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->web(append: [
        \App\Http\Middleware\SetBranchContext::class,
    ]);
})
```

---

## Implementation Steps

### Step 1: Run Migration
```bash
php artisan migrate
```

This will:
- Add `branch_id` to users table
- Create foreign key constraint to branches table

### Step 2: Seed Branches
```bash
php artisan db:seed --class=BranchSeeder
```

Creates 5 branches:
- HQ (Makati City) - Main headquarters
- QC (Quezon City) - Northern Metro Manila
- CEB (Cebu) - Visayas regional HQ
- DVO (Davao) - Mindanao regional HQ
- PAM (Pampanga) - Central Luzon

### Step 3: Assign Users to Branches

Update your user seeder or manually assign:
```php
User::find(1)->update(['branch_id' => 1]); // HQ
User::find(2)->update(['branch_id' => 2]); // QC
```

### Step 4: Create Branch-Scoped Models

For each business entity, create migration with `branch_id`:

```bash
php artisan make:migration create_vehicles_table
```

```php
Schema::create('vehicles', function (Blueprint $table) {
    $table->id();
    $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
    $table->string('vin')->unique();
    $table->string('model');
    // ... other fields
    $table->timestamps();
    
    $table->index('branch_id');
});
```

Then create model:
```bash
php artisan make:model Vehicle
```

```php
<?php

namespace App\Models;

use App\Models\Concerns\BranchScoped;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use BranchScoped;
    
    protected $fillable = [
        'branch_id',
        'vin',
        'model',
        // ... other fields
    ];
}
```

---

## Entities Requiring branch_id

### Priority 1 - Core Operations
- [ ] `vehicles` - Inventory tracking
- [ ] `work_orders` - Service operations
- [ ] `parts` - Parts inventory
- [ ] `warranty_claims` - Warranty management

### Priority 2 - Sales & Customer
- [ ] `leads` - Sales opportunities
- [ ] `test_drives` - Test drive scheduling
- [ ] `sales` - Sales transactions
- [ ] `customers` (see special considerations)

### Priority 3 - Audit & Compliance
- [ ] `activity_logs` - Audit trail
- [ ] `supervisor_approvals` - Approval workflow
- [ ] `compliance_checklists` - Compliance tracking
- [ ] `time_tracking` - Time/attendance

---

## Special Considerations

### Customer Management Strategy

**Option A: Shared Customers** (Recommended)
- `customers` table has NO `branch_id`
- Customers are shared across all branches
- Track interactions via junction table:

```php
// customers - no branch_id
// customer_interactions
Schema::create('customer_interactions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('customer_id')->constrained();
    $table->foreignId('branch_id')->constrained();
    $table->foreignId('user_id')->constrained();
    $table->string('type'); // visit, purchase, service, etc.
    $table->timestamps();
});
```

**Option B: Branch-Specific Customers**
- Add `branch_id` to customers table
- Strict data isolation per branch
- Customer can't be shared across branches

**Decision Point:** Discuss with stakeholders based on business needs.

---

## Role-Based Access

### Single-Branch Users
**Roles:** Sales Rep, Service Technician, Parts Clerk
- See only their branch data
- Automatic filtering via BranchScoped trait
- Cannot create records for other branches

### Multi-Branch Users
**Roles:** Admin, Auditor
- Can access all branches
- Global scope automatically bypassed
- Can view/edit any branch data

### Implementation in Controller
```php
// Automatic (no code needed for single-branch users)
$vehicles = Vehicle::all();

// Admin viewing specific branch
$branchVehicles = Vehicle::forBranch($branchId)->get();

// Admin viewing all
$allVehicles = Vehicle::withoutBranchScope()->get();

// Aggregate report across branches
$summary = Vehicle::withoutBranchScope()
    ->selectRaw('branch_id, count(*) as total')
    ->groupBy('branch_id')
    ->get();
```

---

## Frontend Integration

### Display Branch Badge
```tsx
import { usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';

export default function MyComponent() {
    const { currentBranch } = usePage().props;
    
    return (
        <div>
            <Badge variant="outline">
                {currentBranch.code} - {currentBranch.name}
            </Badge>
        </div>
    );
}
```

### Branch Selector (Admin Only)
```tsx
import { Select } from '@/components/ui/select';

// Fetch all branches
const branches = usePage().props.branches;

<Select onValueChange={setBranchId}>
    <SelectTrigger>
        <SelectValue placeholder="Select Branch" />
    </SelectTrigger>
    <SelectContent>
        {branches.map(branch => (
            <SelectItem key={branch.id} value={branch.id}>
                {branch.code} - {branch.name}
            </SelectItem>
        ))}
    </SelectContent>
</Select>
```

---

## Testing Strategy

### Unit Tests
Test branch isolation per model:
```php
public function test_user_sees_only_their_branch_vehicles()
{
    $branch1 = Branch::factory()->create();
    $branch2 = Branch::factory()->create();
    
    $user = User::factory()->create(['branch_id' => $branch1->id]);
    
    $vehicle1 = Vehicle::factory()->create(['branch_id' => $branch1->id]);
    $vehicle2 = Vehicle::factory()->create(['branch_id' => $branch2->id]);
    
    $this->actingAs($user);
    
    $vehicles = Vehicle::all();
    
    $this->assertTrue($vehicles->contains($vehicle1));
    $this->assertFalse($vehicles->contains($vehicle2));
}
```

### Feature Tests
Test cross-branch access:
```php
public function test_admin_can_view_all_branches()
{
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    
    $vehicles = Vehicle::factory()->count(5)->create();
    
    $this->actingAs($admin);
    
    $response = $this->get('/inventory/vehicles');
    
    $response->assertOk();
    // Should see all 5 vehicles
}
```

---

## Migration Checklist

When creating a new branch-scoped entity:

- [ ] Create migration with `branch_id` foreign key
- [ ] Add index on `branch_id`
- [ ] Create model with `BranchScoped` trait
- [ ] Add `branch_id` to `$fillable`
- [ ] Create factory with branch assignment
- [ ] Write tests for branch isolation
- [ ] Update controller if needed
- [ ] Update frontend to display branch context

---

## Troubleshooting

### Issue: Records not auto-filtering
**Solution:** Check if user has `branch_id` set and is authenticated

### Issue: Admin can't see all branches
**Solution:** Verify admin role is correctly assigned: `$user->hasRole('admin')`

### Issue: Foreign key constraint error
**Solution:** Ensure branches table is seeded before creating branch-scoped records

### Issue: Frontend branch context not available
**Solution:** Check middleware is registered and user is authenticated

---

## Next Steps

1. **Review migration plan** in `database/migrations/.MIGRATION_PLAN.md`
2. **Decide on customer strategy** (shared vs branch-specific)
3. **Create migrations** for priority entities
4. **Update controllers** to pass branch data to views
5. **Implement branch selector** for admin users
6. **Write comprehensive tests**
7. **Update documentation** as needed

---

## Resources

- **Migration Plan:** `database/migrations/.MIGRATION_PLAN.md`
- **BranchScoped Trait:** `app/Models/Concerns/BranchScoped.php`
- **SetBranchContext Middleware:** `app/Http/Middleware/SetBranchContext.php`
- **Branch Model:** `app/Models/Branch.php`
- **Branch Controller:** `app/Http/Controllers/BranchController.php`
- **Branch Seeder:** `database/seeders/BranchSeeder.php`

---

## Support

For questions or issues, refer to Laravel documentation:
- [Eloquent Global Scopes](https://laravel.com/docs/eloquent#global-scopes)
- [Relationships](https://laravel.com/docs/eloquent-relationships)
- [Middleware](https://laravel.com/docs/middleware)
