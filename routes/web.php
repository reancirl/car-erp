<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;

// redirect to login
Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified', 'mfa.login'])->group(function () {
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
Route::middleware(['auth', 'verified', 'mfa.login'])->group(function () {
    Route::get('audit/activity-logs', function () {
        return Inertia::render('audit/activity-logs');
    })->name('audit.activity-logs');
    
    Route::get('audit/time-tracking', function () {
        return Inertia::render('audit/time-tracking');
    })->name('audit.time-tracking');
    
    Route::get('audit/supervisor-approvals', function () {
        return Inertia::render('audit/supervisor-approvals');
    })->name('audit.supervisor-approvals');
});

// Compliance Routes
Route::middleware(['auth', 'verified', 'mfa.login'])->group(function () {
    Route::get('compliance/checklists', function () {
        return Inertia::render('compliance/checklists');
    })->name('compliance.checklists');
    
    Route::get('compliance/reminders', function () {
        return Inertia::render('compliance/reminders');
    })->name('compliance.reminders');
});

// Service & Parts Management Routes
Route::middleware(['auth', 'verified', 'mfa.login'])->prefix('service')->name('service.')->group(function () {
    Route::get('/pms-work-orders', function () {
        return Inertia::render('service/pms-work-orders');
    })->name('pms-work-orders');
    
    Route::get('/warranty-claims', function () {
        return Inertia::render('service/warranty-claims');
    })->name('warranty-claims');
    
    Route::get('/parts-inventory', function () {
        return Inertia::render('service/parts-inventory');
    })->name('parts-inventory');
});

// Sales & Customer Lifecycle Routes
Route::middleware(['auth', 'verified', 'mfa.login'])->prefix('sales')->name('sales.')->group(function () {
    Route::get('/lead-management', function () {
        return Inertia::render('sales/lead-management');
    })->name('lead-management');
    
    Route::get('/test-drives', function () {
        return Inertia::render('sales/test-drives');
    })->name('test-drives');
    
    Route::get('/pipeline', function () {
        return Inertia::render('sales/pipeline');
    })->name('pipeline');
    
    Route::get('/customer-experience', function () {
        return Inertia::render('sales/customer-experience');
    })->name('customer-experience');
    
    Route::get('/performance-metrics', function () {
        return Inertia::render('sales/performance-metrics');
    })->name('performance-metrics');
});

// Administration Routes
Route::middleware(['auth', 'verified', 'mfa.login'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/user-management', function () {
        return Inertia::render('admin/user-management');
    })->name('user-management');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/mfa.php';
