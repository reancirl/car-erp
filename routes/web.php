<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ActivityLogController;

// redirect to login
Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

// Public Survey Routes (No Authentication Required)
Route::prefix('survey')->name('survey.')->group(function () {
    Route::get('/{token}', [\App\Http\Controllers\PublicSurveyController::class, 'show'])->name('show');
    Route::post('/{token}', [\App\Http\Controllers\PublicSurveyController::class, 'submit'])->name('submit');
});

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
    Route::get('audit/activity-logs', [ActivityLogController::class, 'index'])->name('audit.activity-logs');
    Route::get('audit/activity-logs-export', [ActivityLogController::class, 'export'])->name('audit.activity-logs.export')->middleware('permission:audit.export');
    
    Route::get('audit/time-tracking', [\App\Http\Controllers\TimeTrackingController::class, 'index'])->name('audit.time-tracking');
    Route::post('audit/time-tracking/update-idle', [\App\Http\Controllers\TimeTrackingController::class, 'updateIdleTimes'])->name('audit.time-tracking.update-idle');
    Route::post('audit/time-tracking/{session}/force-logout', [\App\Http\Controllers\TimeTrackingController::class, 'forceLogout'])->name('audit.time-tracking.force-logout')->middleware('permission:audit.supervisor_override');
    Route::post('audit/time-tracking/settings', [\App\Http\Controllers\TimeTrackingController::class, 'saveSettings'])->name('audit.time-tracking.save-settings')->middleware('permission:audit.supervisor_override');
    
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
    Route::post('/lead-management/{id}/restore', [\App\Http\Controllers\LeadController::class, 'restore'])->name('lead-management.restore')->middleware('permission:sales.create');
    
    // Test Drives Routes (Resource Controller)
    Route::get('/test-drives', [\App\Http\Controllers\TestDriveController::class, 'index'])->name('test-drives');
    Route::get('/test-drives/calendar', [\App\Http\Controllers\TestDriveController::class, 'calendar'])->name('test-drives.calendar');
    Route::get('/test-drives/create', [\App\Http\Controllers\TestDriveController::class, 'create'])->name('test-drives.create')->middleware('permission:sales.create');
    Route::post('/test-drives', [\App\Http\Controllers\TestDriveController::class, 'store'])->name('test-drives.store')->middleware('permission:sales.create');
    Route::get('/test-drives/{testDrive}', [\App\Http\Controllers\TestDriveController::class, 'show'])->name('test-drives.show');
    Route::get('/test-drives/{testDrive}/edit', [\App\Http\Controllers\TestDriveController::class, 'edit'])->name('test-drives.edit')->middleware('permission:sales.edit');
    Route::put('/test-drives/{testDrive}', [\App\Http\Controllers\TestDriveController::class, 'update'])->name('test-drives.update')->middleware('permission:sales.edit');
    Route::delete('/test-drives/{testDrive}', [\App\Http\Controllers\TestDriveController::class, 'destroy'])->name('test-drives.destroy')->middleware('permission:sales.delete');
    Route::post('/test-drives/{id}/restore', [\App\Http\Controllers\TestDriveController::class, 'restore'])->name('test-drives.restore')->middleware('permission:sales.create');
    Route::post('/test-drives/{testDrive}/signature', [\App\Http\Controllers\TestDriveController::class, 'saveSignature'])->name('test-drives.signature')->middleware('permission:sales.edit');
    Route::get('/test-drives-export', [\App\Http\Controllers\TestDriveController::class, 'export'])->name('test-drives.export')->middleware('permission:sales.view');
    
    // Pipeline Routes (Resource Controller)
    Route::get('/pipeline', [\App\Http\Controllers\PipelineController::class, 'index'])->name('pipeline');
    Route::get('/pipeline/create', [\App\Http\Controllers\PipelineController::class, 'create'])->name('pipeline.create')->middleware('permission:sales.create');
    Route::post('/pipeline', [\App\Http\Controllers\PipelineController::class, 'store'])->name('pipeline.store')->middleware('permission:sales.create');
    Route::get('/pipeline/{pipeline}', [\App\Http\Controllers\PipelineController::class, 'show'])->name('pipeline.show');
    Route::get('/pipeline/{pipeline}/edit', [\App\Http\Controllers\PipelineController::class, 'edit'])->name('pipeline.edit')->middleware('permission:sales.edit');
    Route::put('/pipeline/{pipeline}', [\App\Http\Controllers\PipelineController::class, 'update'])->name('pipeline.update')->middleware('permission:sales.edit');
    Route::delete('/pipeline/{pipeline}', [\App\Http\Controllers\PipelineController::class, 'destroy'])->name('pipeline.destroy')->middleware('permission:sales.delete');
    Route::post('/pipeline/{id}/restore', [\App\Http\Controllers\PipelineController::class, 'restore'])->name('pipeline.restore')->middleware('permission:sales.create');
    Route::get('/pipeline-export', [\App\Http\Controllers\PipelineController::class, 'export'])->name('pipeline.export')->middleware('permission:sales.view');
    Route::post('/pipeline-auto-loss-detection', [\App\Http\Controllers\PipelineController::class, 'runAutoLossDetection'])->name('pipeline.auto-loss-detection')->middleware('permission:sales.edit');
    
    Route::get('/performance-metrics', [\App\Http\Controllers\PerformanceMetricsController::class, 'index'])->name('performance-metrics')->middleware('permission:reports.view');
});

// Customer Experience Routes - Separate from sales (uses customer.view permission)
Route::middleware(['auth', 'verified', 'permission:customer.view'])->prefix('sales')->name('sales.')->group(function () {
    // Customer Experience CRUD routes (Resource Controller)
    Route::get('/customer-experience', [\App\Http\Controllers\CustomerController::class, 'index'])->name('customer-experience.index');
    Route::get('/customer-experience/create', [\App\Http\Controllers\CustomerController::class, 'create'])->name('customer-experience.create')->middleware('permission:customer.create');
    Route::post('/customer-experience', [\App\Http\Controllers\CustomerController::class, 'store'])->name('customer-experience.store')->middleware('permission:customer.create');
    Route::get('/customer-experience/{customer}', [\App\Http\Controllers\CustomerController::class, 'show'])->name('customer-experience.show');
    Route::get('/customer-experience/{customer}/edit', [\App\Http\Controllers\CustomerController::class, 'edit'])->name('customer-experience.edit')->middleware('permission:customer.edit');
    Route::put('/customer-experience/{customer}', [\App\Http\Controllers\CustomerController::class, 'update'])->name('customer-experience.update')->middleware('permission:customer.edit');
    Route::delete('/customer-experience/{customer}', [\App\Http\Controllers\CustomerController::class, 'destroy'])->name('customer-experience.destroy')->middleware('permission:customer.delete');
    Route::post('/customer-experience/{id}/restore', [\App\Http\Controllers\CustomerController::class, 'restore'])->name('customer-experience.restore')->middleware('permission:customer.create');
    Route::post('/customer-experience/{customer}/generate-survey', [\App\Http\Controllers\CustomerController::class, 'generateSurvey'])->name('customer-experience.generate-survey')->middleware('permission:customer.send_survey');
    Route::post('/customer-experience/{customer}/survey/{customerSurvey}/send-email', [\App\Http\Controllers\CustomerController::class, 'sendSurveyEmail'])->name('customer-experience.send-survey-email')->middleware('permission:customer.send_survey');
});

// Administration Routes
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    // User Management Routes - using UserController
    Route::resource('user-management', App\Http\Controllers\UserController::class)->parameters([
        'user-management' => 'user'
    ])->middleware('permission:users.view');
    Route::post('user-management/{id}/restore', [App\Http\Controllers\UserController::class, 'restore'])
        ->name('user-management.restore')
        ->middleware('permission:users.create');
    
    // Branch Management Routes - using BranchController
    Route::resource('branch-management', App\Http\Controllers\BranchController::class)->parameters([
        'branch-management' => 'branch'
    ]);
    Route::post('branch-management/{id}/restore', [App\Http\Controllers\BranchController::class, 'restore'])
        ->name('branch-management.restore');
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
    // Parts & Accessories Inventory
    Route::get('/parts-inventory', function () {
        return Inertia::render('inventory/parts-inventory');
    })->name('inventory.parts-inventory')->middleware('permission:inventory.view');
    
    // Vehicle Models (Master Data) - Inertia Routes
    Route::get('/models', [\App\Http\Controllers\VehicleModelController::class, 'indexPage'])->name('inventory.models.index')->middleware('permission:vehicle_model.view');
    Route::get('/models/create', [\App\Http\Controllers\VehicleModelController::class, 'create'])->name('inventory.models.create')->middleware('permission:vehicle_model.create');
    Route::post('/models', [\App\Http\Controllers\VehicleModelController::class, 'store'])->name('inventory.models.store')->middleware('permission:vehicle_model.create');
    Route::get('/models/{vehicleModel}/edit', [\App\Http\Controllers\VehicleModelController::class, 'edit'])->name('inventory.models.edit')->middleware('permission:vehicle_model.edit');
    Route::match(['put', 'patch'], '/models/{vehicleModel}', [\App\Http\Controllers\VehicleModelController::class, 'update'])->name('inventory.models.update')->middleware('permission:vehicle_model.edit');
    Route::delete('/models/{vehicleModel}', [\App\Http\Controllers\VehicleModelController::class, 'destroy'])->name('inventory.models.destroy')->middleware('permission:vehicle_model.delete');
    Route::post('/models/{id}/restore', [\App\Http\Controllers\VehicleModelController::class, 'restore'])->name('inventory.models.restore')->middleware('permission:vehicle_model.create');
    
    // Vehicle Models - API Routes (for AJAX calls if needed)
    Route::middleware(['permission:vehicle_model.view'])->group(function () {
        Route::get('/api/models', [\App\Http\Controllers\VehicleModelController::class, 'index'])->name('inventory.models.api.index');
        Route::get('/api/models/{vehicleModel}', [\App\Http\Controllers\VehicleModelController::class, 'show'])->name('inventory.models.api.show');
    });

    // Vehicle Inventory (existing UI route - connects to units API)
    Route::get('/vehicles', [\App\Http\Controllers\VehicleUnitController::class, 'indexPage'])->name('inventory.vehicles.index')->middleware('permission:inventory.view');

    Route::get('/vehicles/create', [\App\Http\Controllers\VehicleUnitController::class, 'create'])->name('inventory.vehicles.create')->middleware('permission:inventory.create');

    Route::get('/vehicles/{id}/edit', [\App\Http\Controllers\VehicleUnitController::class, 'edit'])->name('inventory.vehicles.edit')->middleware('permission:inventory.edit');

    Route::get('/vehicles/{id}', [\App\Http\Controllers\VehicleUnitController::class, 'showPage'])->name('inventory.vehicles.show')->middleware('permission:inventory.view');
    
    // Vehicle Masters API Routes
    Route::middleware(['permission:inventory.view'])->group(function () {
        Route::get('/masters', [\App\Http\Controllers\VehicleMasterController::class, 'index'])->name('inventory.masters.index');
        Route::get('/masters/{master}', [\App\Http\Controllers\VehicleMasterController::class, 'show'])->name('inventory.masters.show');
    });
    
    Route::middleware(['permission:inventory.create'])->group(function () {
        Route::post('/masters', [\App\Http\Controllers\VehicleMasterController::class, 'store'])->name('inventory.masters.store');
        Route::post('/masters/{id}/restore', [\App\Http\Controllers\VehicleMasterController::class, 'restore'])->name('inventory.masters.restore');
    });
    
    Route::middleware(['permission:inventory.edit'])->group(function () {
        Route::match(['put', 'patch'], '/masters/{master}', [\App\Http\Controllers\VehicleMasterController::class, 'update'])->name('inventory.masters.update');
    });
    
    Route::middleware(['permission:inventory.delete'])->group(function () {
        Route::delete('/masters/{master}', [\App\Http\Controllers\VehicleMasterController::class, 'destroy'])->name('inventory.masters.destroy');
    });
    
    // Vehicle Units API Routes
    Route::middleware(['permission:inventory.view'])->group(function () {
        Route::get('/units', [\App\Http\Controllers\VehicleUnitController::class, 'index'])->name('inventory.units.index');
        Route::get('/units/{unit}', [\App\Http\Controllers\VehicleUnitController::class, 'show'])->name('inventory.units.show');
        Route::get('/units/{unit}/movements', [\App\Http\Controllers\VehicleUnitController::class, 'movements'])->name('inventory.units.movements');
    });
    
    Route::middleware(['permission:inventory.create'])->group(function () {
        Route::post('/units', [\App\Http\Controllers\VehicleUnitController::class, 'store'])->name('inventory.units.store');
        Route::post('/units/{id}/restore', [\App\Http\Controllers\VehicleUnitController::class, 'restore'])->name('inventory.units.restore');
    });
    
    Route::middleware(['permission:inventory.edit'])->group(function () {
        Route::match(['put', 'patch'], '/units/{unit}', [\App\Http\Controllers\VehicleUnitController::class, 'update'])->name('inventory.units.update');
        Route::post('/units/{unit}/transfer', [\App\Http\Controllers\VehicleUnitController::class, 'transfer'])->name('inventory.units.transfer');
        Route::post('/units/{unit}/status', [\App\Http\Controllers\VehicleUnitController::class, 'updateStatus'])->name('inventory.units.status');
    });
    
    Route::middleware(['permission:inventory.delete'])->group(function () {
        Route::delete('/units/{unit}', [\App\Http\Controllers\VehicleUnitController::class, 'destroy'])->name('inventory.units.destroy');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/mfa.php';
