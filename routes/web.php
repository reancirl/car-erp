<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;

// redirect to login
Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    // Role and Permission Management Routes with middleware protection
    // Create & Store must come first
    Route::middleware(['permission:users.create'])->group(function () {
        Route::get('roles/create', [RoleController::class, 'create'])
             ->name('roles.create');
        Route::post('roles',       [RoleController::class, 'store'])
             ->name('roles.store');
        Route::get('permissions/create', [PermissionController::class, 'create'])
             ->name('permissions.create');
        Route::post('permissions', [PermissionController::class, 'store'])
             ->name('permissions.store');
    });

    // View (index + show)
    Route::middleware(['permission:users.view'])->group(function () {
        Route::get('roles',         [RoleController::class, 'index'])
             ->name('roles.index');
        Route::get('roles/{role}',  [RoleController::class, 'show'])
             ->name('roles.show');
        Route::get('permissions',   [PermissionController::class, 'index'])
             ->name('permissions.index');
        Route::get('permissions/{permission}', [PermissionController::class, 'show'])
             ->name('permissions.show');
    });

    // Edit & Update
    Route::middleware(['permission:users.edit'])->group(function () {
        Route::get('roles/{role}/edit', [RoleController::class, 'edit'])
             ->name('roles.edit');
        Route::match(['put','patch'],'roles/{role}', [RoleController::class, 'update'])
             ->name('roles.update');
        Route::get('permissions/{permission}/edit', [PermissionController::class, 'edit'])
             ->name('permissions.edit');
        Route::match(['put','patch'],'permissions/{permission}', [PermissionController::class, 'update'])
             ->name('permissions.update');
    });

    // Delete (with MFA protection for sensitive actions)
    Route::middleware(['permission:users.delete', 'mfa:delete_role'])->group(function () {
        Route::delete('roles/{role}', [RoleController::class, 'destroy'])
             ->name('roles.destroy');
    });
    
    Route::middleware(['permission:users.delete', 'mfa:delete_permission'])->group(function () {
        Route::delete('permissions/{permission}', [PermissionController::class, 'destroy'])
             ->name('permissions.destroy');
    });

});

// Activity & Audit Routes
Route::middleware(['auth', 'verified', 'permission:audit.view'])->group(function () {
    Route::get('audit/activity-logs', function () {
        return Inertia::render('audit/activity-logs');
    })->name('audit.activity-logs');
    
    Route::get('audit/time-tracking', function () {
        return Inertia::render('audit/time-tracking');
    })->name('audit.time-tracking');
    
    Route::get('audit/supervisor-approvals', function () {
        return Inertia::render('audit/supervisor-approvals');
    })->name('audit.supervisor-approvals')->middleware('permission:audit.supervisor_override');
});

// Compliance Routes
Route::middleware(['auth', 'verified', 'permission:compliance.view'])->group(function () {
    Route::get('compliance/checklists', function () {
        return Inertia::render('compliance/checklists');
    })->name('compliance.checklists');
    
    Route::get('compliance/reminders', function () {
        return Inertia::render('compliance/reminders');
    })->name('compliance.reminders');
});

// Service & Parts Management Routes
Route::middleware(['auth', 'verified'])->prefix('service')->name('service.')->group(function () {
    Route::get('/pms-work-orders', function () {
        return Inertia::render('service/pms-work-orders');
    })->name('pms-work-orders')->middleware('permission:pms.view');
    
    Route::get('/warranty-claims', function () {
        return Inertia::render('service/warranty-claims');
    })->name('warranty-claims');
    
    Route::get('/parts-inventory', function () {
        return Inertia::render('service/parts-inventory');
    })->name('parts-inventory');
});

// Sales & Customer Lifecycle Routes
Route::middleware(['auth', 'verified', 'permission:sales.view'])->prefix('sales')->name('sales.')->group(function () {
    // Lead Management Routes (Resource Controller)
    Route::get('/lead-management', [\App\Http\Controllers\LeadController::class, 'index'])->name('lead-management');
    Route::get('/lead-management/create', [\App\Http\Controllers\LeadController::class, 'create'])->name('lead-management.create')->middleware('permission:sales.create');
    Route::post('/lead-management', [\App\Http\Controllers\LeadController::class, 'store'])->name('lead-management.store')->middleware('permission:sales.create');
    Route::get('/lead-management/{lead}', [\App\Http\Controllers\LeadController::class, 'show'])->name('lead-management.show');
    Route::get('/lead-management/{lead}/edit', [\App\Http\Controllers\LeadController::class, 'edit'])->name('lead-management.edit')->middleware('permission:sales.edit');
    Route::put('/lead-management/{lead}', [\App\Http\Controllers\LeadController::class, 'update'])->name('lead-management.update')->middleware('permission:sales.edit');
    Route::delete('/lead-management/{lead}', [\App\Http\Controllers\LeadController::class, 'destroy'])->name('lead-management.destroy')->middleware('permission:sales.delete');
    
    // Test Drives Routes
    Route::get('/test-drives', function () {
        return Inertia::render('sales/test-drives');
    })->name('test-drives');
    
    Route::get('/test-drives/create', function () {
        return Inertia::render('sales/test-drive-create');
    })->name('test-drives.create');
    
    Route::get('/test-drives/{id}/edit', function ($id) {
        return Inertia::render('sales/test-drive-edit', ['id' => $id]);
    })->name('test-drives.edit');
    
    Route::get('/test-drives/{id}', function ($id) {
        return Inertia::render('sales/test-drive-view', ['id' => $id]);
    })->name('test-drives.show');
    
    // Pipeline Routes
    Route::get('/pipeline', function () {
        return Inertia::render('sales/pipeline');
    })->name('pipeline');
    
    Route::get('/pipeline/create', function () {
        return Inertia::render('sales/pipeline-create');
    })->name('pipeline.create');
    
    Route::get('/pipeline/{id}/edit', function ($id) {
        return Inertia::render('sales/pipeline-edit', ['id' => $id]);
    })->name('pipeline.edit');
    
    Route::get('/pipeline/{id}', function ($id) {
        return Inertia::render('sales/pipeline-view', ['id' => $id]);
    })->name('pipeline.show');
    
    Route::get('/performance-metrics', function () {
        return Inertia::render('sales/performance-metrics');
    })->name('performance-metrics')->middleware('permission:reports.view');
});

// Customer Experience Routes - Separate from sales (uses customer.view permission)
Route::middleware(['auth', 'verified', 'permission:customer.view'])->prefix('sales')->name('sales.')->group(function () {
    // Customer Experience CRUD routes
    Route::get('/customer-experience', function () {
        return Inertia::render('sales/customer-experience');
    })->name('customer-experience.index');
    
    Route::get('/customer-experience/create', function () {
        return Inertia::render('sales/customer-experience-create');
    })->name('customer-experience.create');
    
    Route::get('/customer-experience/{id}', function ($id) {
        return Inertia::render('sales/customer-experience-view', ['id' => $id]);
    })->name('customer-experience.show');
    
    Route::get('/customer-experience/{id}/edit', function ($id) {
        return Inertia::render('sales/customer-experience-edit', ['id' => $id]);
    })->name('customer-experience.edit');
    
    // Customer Experience Task CRUD routes
    Route::get('/customer-experience/task/{id}', function ($id) {
        return Inertia::render('sales/customer-experience-task-view', ['id' => $id]);
    })->name('customer-experience.task.show');
    
    Route::get('/customer-experience/task/{id}/edit', function ($id) {
        return Inertia::render('sales/customer-experience-task-edit', ['id' => $id]);
    })->name('customer-experience.task.edit');
});

// Administration Routes
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    // User Management Routes - using UserController
    Route::resource('user-management', App\Http\Controllers\UserController::class)->parameters([
        'user-management' => 'user'
    ])->middleware('permission:users.view');
    
    // Branch Management Routes - using BranchController
    Route::resource('branch-management', App\Http\Controllers\BranchController::class)->parameters([
        'branch-management' => 'branch'
    ]);
});

// PMS Work Orders Routes
Route::middleware(['auth', 'verified'])->prefix('pms')->name('pms.')->group(function () {
    Route::get('/work-orders', function () {
        return Inertia::render('pms/work-orders');
    })->name('work-orders');
    
    Route::get('/work-orders/create', function () {
        return Inertia::render('pms/work-order-create');
    })->name('work-orders.create');
    
    Route::get('/work-orders/{id}/edit', function ($id) {
        return Inertia::render('pms/work-order-edit', ['workOrderId' => $id]);
    })->name('work-orders.edit');
    
    Route::get('/work-orders/{id}', function ($id) {
        return Inertia::render('pms/work-order-view', ['workOrderId' => $id]);
    })->name('work-orders.view');
});

// Service & Parts Routes
Route::middleware(['auth', 'verified'])->prefix('service')->name('service.')->group(function () {
    // Service Types Routes
    Route::get('/service-types', function () {
        return Inertia::render('service/service-types');
    })->name('service-types');
    
    Route::get('/service-types/create', function () {
        return Inertia::render('service/service-type-create');
    })->name('service-types.create');
    
    Route::get('/service-types/{id}/edit', function ($id) {
        return Inertia::render('service/service-type-edit', ['serviceTypeId' => $id]);
    })->name('service-types.edit');
    
    Route::get('/service-types/{id}', function ($id) {
        return Inertia::render('service/service-type-view', ['serviceTypeId' => $id]);
    })->name('service-types.view');
    
    // Common Services Routes
    Route::get('/common-services', function () {
        return Inertia::render('service/common-services');
    })->name('common-services');
    
    Route::get('/common-services/create', function () {
        return Inertia::render('service/common-service-create');
    })->name('common-services.create');
    
    Route::get('/common-services/{id}/edit', function ($id) {
        return Inertia::render('service/common-service-edit', ['serviceId' => $id]);
    })->name('common-services.edit');
    Route::get('/common-services/{id}', function ($id) {
        return Inertia::render('service/common-service-view', ['serviceId' => $id]);
    })->name('common-services.view');
    
    // Warranty Claims Management
    Route::get('/warranty-claims', function () {
        return Inertia::render('service/warranty-claims');
    })->name('service.warranty-claims.index');

    Route::get('/warranty-claims/create', function () {
        return Inertia::render('service/warranty-claim-create');
    })->name('service.warranty-claims.create');

    Route::get('/warranty-claims/{id}/edit', function ($id) {
        return Inertia::render('service/warranty-claim-edit', ['id' => $id]);
    })->name('service.warranty-claims.edit');

    Route::get('/warranty-claims/{id}', function ($id) {
        return Inertia::render('service/warranty-claim-view', ['id' => $id]);
    })->name('service.warranty-claims.show');
});

// Vehicle Inventory Management Routes
Route::middleware(['auth', 'verified'])->prefix('inventory')->group(function () {
    // Vehicle Inventory
    Route::get('/vehicles', function () {
        return Inertia::render('inventory/vehicles');
    })->name('inventory.vehicles.index');

    Route::get('/vehicles/create', function () {
        return Inertia::render('inventory/vehicle-create');
    })->name('inventory.vehicles.create');

    Route::get('/vehicles/{id}/edit', function ($id) {
        return Inertia::render('inventory/vehicle-edit', ['id' => $id]);
    })->name('inventory.vehicles.edit');

    Route::get('/vehicles/{id}', function ($id) {
        return Inertia::render('inventory/vehicle-view', ['id' => $id]);
    })->name('inventory.vehicles.show');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/mfa.php';
