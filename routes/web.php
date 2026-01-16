<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\ChecklistReminderCenterController;
use App\Http\Controllers\ComplianceChecklistController;
use App\Http\Controllers\ComplianceChecklistAssignmentController;
use App\Http\Controllers\ComplianceReminderController;
use App\Http\Controllers\DashboardController;

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
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::post(
        'dashboard/checklist-assignments/{assignment}/items/{assignmentItem}/toggle',
        [ComplianceChecklistAssignmentController::class, 'toggleItem']
    )->name('dashboard.checklists.items.toggle');
    
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

    Route::get('checklists-reminders', ChecklistReminderCenterController::class)
        ->name('checklists-reminders');
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
Route::middleware(['auth', 'verified'])->prefix('compliance')->name('compliance.')->group(function () {
    // Compliance Checklists - manage_checklists permission (specific routes first)
    Route::middleware('permission:compliance.manage_checklists')->group(function () {
        Route::get('checklists/create', [ComplianceChecklistController::class, 'create'])
            ->name('checklists.create');
        Route::post('checklists', [ComplianceChecklistController::class, 'store'])
            ->name('checklists.store');
        Route::get('checklists/{checklist}/edit', [ComplianceChecklistController::class, 'edit'])
            ->name('checklists.edit');
        Route::put('checklists/{checklist}', [ComplianceChecklistController::class, 'update'])
            ->name('checklists.update');
        Route::delete('checklists/{checklist}', [ComplianceChecklistController::class, 'destroy'])
            ->name('checklists.destroy');
        Route::post('checklists/{id}/restore', [ComplianceChecklistController::class, 'restore'])
            ->name('checklists.restore');
    });

    // Compliance Reminders - manage_reminders permission (specific routes first)
    Route::middleware('permission:compliance.manage_reminders')->group(function () {
        Route::get('reminders/create', [ComplianceReminderController::class, 'create'])
            ->name('reminders.create');
        Route::post('reminders', [ComplianceReminderController::class, 'store'])
            ->name('reminders.store');
        Route::get('reminders/{reminder}/edit', [ComplianceReminderController::class, 'edit'])
            ->name('reminders.edit');
        Route::put('reminders/{reminder}', [ComplianceReminderController::class, 'update'])
            ->name('reminders.update');
        Route::delete('reminders/{reminder}', [ComplianceReminderController::class, 'destroy'])
            ->name('reminders.destroy');
        Route::post('reminders/{id}/restore', [ComplianceReminderController::class, 'restore'])
            ->name('reminders.restore');
    });

    // Compliance - view permission (these must come AFTER specific routes like /create)
    Route::middleware('permission:compliance.view')->group(function () {
        Route::get('checklists', [ComplianceChecklistController::class, 'index'])
            ->name('checklists.index');
        Route::get('checklists/{checklist}', [ComplianceChecklistController::class, 'show'])
            ->name('checklists.show');
        Route::get('reminders', [ComplianceReminderController::class, 'index'])
            ->name('reminders.index');
        Route::get('reminders/{reminder}', [ComplianceReminderController::class, 'show'])
            ->name('reminders.show');
    });
});

// Service & Parts Management Routes
Route::middleware(['auth', 'verified'])->prefix('service')->name('service.')->group(function () {
    // PMS Work Orders - Full CRUD with photo upload and fraud prevention
    // IMPORTANT: Specific routes (create, edit) must come BEFORE dynamic routes ({id})

    // Index (list all)
    Route::get('/pms-work-orders', [\App\Http\Controllers\WorkOrderController::class, 'index'])
        ->name('pms-work-orders.index')
        ->middleware('permission:pms-work-orders.view');

    // Create (show form)
    Route::get('/pms-work-orders/create', [\App\Http\Controllers\WorkOrderController::class, 'create'])
        ->name('pms-work-orders.create')
        ->middleware('permission:pms-work-orders.create');

    // Store (save new)
    Route::post('/pms-work-orders', [\App\Http\Controllers\WorkOrderController::class, 'store'])
        ->name('pms-work-orders.store')
        ->middleware('permission:pms-work-orders.create');

    // Show (view single) - comes after /create
    Route::get('/pms-work-orders/{pms_work_order}', [\App\Http\Controllers\WorkOrderController::class, 'show'])
        ->name('pms-work-orders.show')
        ->middleware('permission:pms-work-orders.view');

    // Edit (show form)
    Route::get('/pms-work-orders/{pms_work_order}/edit', [\App\Http\Controllers\WorkOrderController::class, 'edit'])
        ->name('pms-work-orders.edit')
        ->middleware('permission:pms-work-orders.edit');

    // Update (save changes)
    Route::match(['put', 'patch'], '/pms-work-orders/{pms_work_order}', [\App\Http\Controllers\WorkOrderController::class, 'update'])
        ->name('pms-work-orders.update')
        ->middleware('permission:pms-work-orders.edit');

    // Delete (soft delete)
    Route::delete('/pms-work-orders/{pms_work_order}', [\App\Http\Controllers\WorkOrderController::class, 'destroy'])
        ->name('pms-work-orders.destroy')
        ->middleware('permission:pms-work-orders.delete');

    // Restore (from soft delete)
    Route::post('/pms-work-orders/{id}/restore', [\App\Http\Controllers\WorkOrderController::class, 'restore'])
        ->name('pms-work-orders.restore')
        ->middleware('permission:pms-work-orders.create');

    // Photo upload
    Route::post('/pms-work-orders/{pms_work_order}/photos', [\App\Http\Controllers\WorkOrderController::class, 'uploadPhotos'])
        ->name('pms-work-orders.upload-photos')
        ->middleware('permission:pms-work-orders.edit');

    // Photo delete
    Route::delete('/pms-work-orders/{pms_work_order}/photos/{photo}', [\App\Http\Controllers\WorkOrderController::class, 'deletePhoto'])
        ->name('pms-work-orders.delete-photo')
        ->middleware('permission:pms-work-orders.edit');

    // Odometer validation API endpoint (available to all authenticated users)
    Route::post('/validate-odometer', [\App\Http\Controllers\WorkOrderController::class, 'validateOdometer'])
        ->name('validate-odometer');

    // Warranty Claims - Full CRUD with photo upload
    // IMPORTANT: Specific routes (create, edit) must come BEFORE dynamic routes ({id})

    // Index (list all)
    Route::get('/warranty-claims', [\App\Http\Controllers\WarrantyClaimController::class, 'index'])
        ->name('warranty-claims.index')
        ->middleware('permission:warranty.view');

    // Create (show form)
    Route::get('/warranty-claims/create', [\App\Http\Controllers\WarrantyClaimController::class, 'create'])
        ->name('warranty-claims.create')
        ->middleware('permission:warranty.create');

    // Store (save new)
    Route::post('/warranty-claims', [\App\Http\Controllers\WarrantyClaimController::class, 'store'])
        ->name('warranty-claims.store')
        ->middleware('permission:warranty.create');

    // Show (view single) - comes after /create
    Route::get('/warranty-claims/{warranty_claim}', [\App\Http\Controllers\WarrantyClaimController::class, 'show'])
        ->name('warranty-claims.show')
        ->middleware('permission:warranty.view');

    // Edit (show form)
    Route::get('/warranty-claims/{warranty_claim}/edit', [\App\Http\Controllers\WarrantyClaimController::class, 'edit'])
        ->name('warranty-claims.edit')
        ->middleware('permission:warranty.edit');

    // Update (save changes)
    Route::match(['put', 'patch'], '/warranty-claims/{warranty_claim}', [\App\Http\Controllers\WarrantyClaimController::class, 'update'])
        ->name('warranty-claims.update')
        ->middleware('permission:warranty.edit');

    // Delete (soft delete)
    Route::delete('/warranty-claims/{warranty_claim}', [\App\Http\Controllers\WarrantyClaimController::class, 'destroy'])
        ->name('warranty-claims.destroy')
        ->middleware('permission:warranty.delete');

    // Restore (from soft delete)
    Route::post('/warranty-claims/{id}/restore', [\App\Http\Controllers\WarrantyClaimController::class, 'restore'])
        ->name('warranty-claims.restore')
        ->middleware('permission:warranty.create');

    // Photo upload
    Route::post('/warranty-claims/{warranty_claim}/photos', [\App\Http\Controllers\WarrantyClaimController::class, 'uploadPhotos'])
        ->name('warranty-claims.upload-photos')
        ->middleware('permission:warranty.edit');

    // Photo delete
    Route::delete('/warranty-claims/{warranty_claim}/photos/{photo}', [\App\Http\Controllers\WarrantyClaimController::class, 'deletePhoto'])
        ->name('warranty-claims.delete-photo')
        ->middleware('permission:warranty.edit');

    // Aftersales Reports
    Route::get('/aftersales-reports', [\App\Http\Controllers\AftersalesReportController::class, 'index'])
        ->name('aftersales-reports')
        ->middleware('permission:pms.view|reports.view|users.view');
});

// Sales & Customer Lifecycle Routes
Route::middleware(['auth', 'verified', 'permission:sales.view'])->prefix('sales')->name('sales.')->group(function () {
    // Lead Management Routes (Resource Controller)
    Route::get('/lead-management', [\App\Http\Controllers\LeadController::class, 'index'])->name('lead-management');
    Route::get('/lead-management/create', [\App\Http\Controllers\LeadController::class, 'create'])->name('lead-management.create')->middleware('permission:sales.create');
    Route::post('/lead-management', [\App\Http\Controllers\LeadController::class, 'store'])->name('lead-management.store')->middleware('permission:sales.create');
    Route::get('/lead-management/import-template', [\App\Http\Controllers\LeadController::class, 'downloadTemplate'])->name('lead-management.import-template')->middleware('permission:sales.create');
    Route::post('/lead-management/import', [\App\Http\Controllers\LeadController::class, 'import'])->name('lead-management.import')->middleware('permission:sales.create');
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

    // Reservations Module
    Route::get('/reservations', [\App\Http\Controllers\VehicleReservationController::class, 'index'])
        ->name('reservations.index');
    Route::get('/reservations/create', [\App\Http\Controllers\VehicleReservationController::class, 'create'])
        ->name('reservations.create')
        ->middleware('permission:sales.create');
    Route::post('/reservations', [\App\Http\Controllers\VehicleReservationController::class, 'store'])
        ->name('reservations.store')
        ->middleware('permission:sales.create');
    Route::patch('/reservations/{reservation}', [\App\Http\Controllers\VehicleReservationController::class, 'update'])
        ->name('reservations.update')
        ->middleware('permission:sales.edit');
    
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
Route::middleware(['auth', 'verified'])->prefix('service')->group(function () {
    // Service Types CRUD Routes (RESTful resource routes)
    Route::get('/service-types', [\App\Http\Controllers\ServiceTypeController::class, 'index'])
        ->name('service-types.index')
        ->middleware('permission:service-types.view');

    Route::get('/service-types/create', [\App\Http\Controllers\ServiceTypeController::class, 'create'])
        ->name('service-types.create')
        ->middleware('permission:service-types.create');

    Route::post('/service-types', [\App\Http\Controllers\ServiceTypeController::class, 'store'])
        ->name('service-types.store')
        ->middleware('permission:service-types.create');

    Route::get('/service-types/{service_type}', [\App\Http\Controllers\ServiceTypeController::class, 'show'])
        ->name('service-types.show')
        ->middleware('permission:service-types.view');

    Route::get('/service-types/{service_type}/edit', [\App\Http\Controllers\ServiceTypeController::class, 'edit'])
        ->name('service-types.edit')
        ->middleware('permission:service-types.edit');

    Route::match(['put', 'patch'], '/service-types/{service_type}', [\App\Http\Controllers\ServiceTypeController::class, 'update'])
        ->name('service-types.update')
        ->middleware('permission:service-types.edit');

    Route::delete('/service-types/{service_type}', [\App\Http\Controllers\ServiceTypeController::class, 'destroy'])
        ->name('service-types.destroy')
        ->middleware('permission:service-types.delete');

    Route::post('/service-types/{id}/restore', [\App\Http\Controllers\ServiceTypeController::class, 'restore'])
        ->name('service-types.restore')
        ->middleware('permission:service-types.create');
    
    // Common Services Routes
    Route::get('/common-services', [\App\Http\Controllers\CommonServiceController::class, 'index'])
        ->name('common-services.index')
        ->middleware('permission:common-services.view');

    Route::get('/common-services/create', [\App\Http\Controllers\CommonServiceController::class, 'create'])
        ->name('common-services.create')
        ->middleware('permission:common-services.create');

    Route::post('/common-services', [\App\Http\Controllers\CommonServiceController::class, 'store'])
        ->name('common-services.store')
        ->middleware('permission:common-services.create');

    Route::get('/common-services/{common_service}', [\App\Http\Controllers\CommonServiceController::class, 'show'])
        ->name('common-services.show')
        ->middleware('permission:common-services.view');

    Route::get('/common-services/{common_service}/edit', [\App\Http\Controllers\CommonServiceController::class, 'edit'])
        ->name('common-services.edit')
        ->middleware('permission:common-services.edit');

    Route::match(['put', 'patch'], '/common-services/{common_service}', [\App\Http\Controllers\CommonServiceController::class, 'update'])
        ->name('common-services.update')
        ->middleware('permission:common-services.edit');

    Route::delete('/common-services/{common_service}', [\App\Http\Controllers\CommonServiceController::class, 'destroy'])
        ->name('common-services.destroy')
        ->middleware('permission:common-services.delete');

    Route::post('/common-services/{id}/restore', [\App\Http\Controllers\CommonServiceController::class, 'restore'])
        ->name('common-services.restore')
        ->middleware('permission:common-services.create');
});

// Vehicle Inventory Management Routes
Route::middleware(['auth', 'verified'])->prefix('inventory')->group(function () {
    // Parts Inventory CRUD Routes (order matters: specific routes before parameterized routes)
    Route::get('/parts-inventory', [\App\Http\Controllers\PartInventoryController::class, 'index'])
        ->name('parts-inventory.index')
        ->middleware('permission:inventory.view');
    
    Route::get('/parts-inventory/create', [\App\Http\Controllers\PartInventoryController::class, 'create'])
        ->name('parts-inventory.create')
        ->middleware('permission:inventory.create');

    Route::get('/parts-inventory/scanner', [\App\Http\Controllers\PartInventoryController::class, 'scanner'])
        ->name('parts-inventory.scanner')
        ->middleware('permission:inventory.view');

    Route::post('/parts-inventory/scan', [\App\Http\Controllers\PartInventoryController::class, 'scan'])
        ->name('parts-inventory.scan')
        ->middleware('permission:inventory.view');

    Route::post('/parts-inventory', [\App\Http\Controllers\PartInventoryController::class, 'store'])
        ->name('parts-inventory.store')
        ->middleware('permission:inventory.create');
    
    Route::get('/parts-inventory/{partsInventory}', [\App\Http\Controllers\PartInventoryController::class, 'show'])
        ->name('parts-inventory.show')
        ->middleware('permission:inventory.view');
    
    Route::get('/parts-inventory/{partsInventory}/edit', [\App\Http\Controllers\PartInventoryController::class, 'edit'])
        ->name('parts-inventory.edit')
        ->middleware('permission:inventory.edit');
    
    Route::match(['put', 'patch'], '/parts-inventory/{partsInventory}', [\App\Http\Controllers\PartInventoryController::class, 'update'])
        ->name('parts-inventory.update')
        ->middleware('permission:inventory.edit');
    
    Route::delete('/parts-inventory/{partsInventory}', [\App\Http\Controllers\PartInventoryController::class, 'destroy'])
        ->name('parts-inventory.destroy')
        ->middleware('permission:inventory.delete');
    
    Route::post('/parts-inventory/{id}/restore', [\App\Http\Controllers\PartInventoryController::class, 'restore'])
        ->name('parts-inventory.restore')
        ->middleware('permission:inventory.create');

    Route::post('/parts-inventory/{partsInventory}/quick-update', [\App\Http\Controllers\PartInventoryController::class, 'quickUpdate'])
        ->name('parts-inventory.quick-update')
        ->middleware('permission:inventory.edit');

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
        
        // File uploads
        Route::post('/units/{id}/upload-photos', [\App\Http\Controllers\VehicleUnitController::class, 'uploadPhotos'])->name('inventory.units.upload-photos');
        Route::delete('/units/{id}/delete-photo', [\App\Http\Controllers\VehicleUnitController::class, 'deletePhoto'])->name('inventory.units.delete-photo');
        Route::post('/units/{id}/upload-documents', [\App\Http\Controllers\VehicleUnitController::class, 'uploadDocuments'])->name('inventory.units.upload-documents');
        Route::delete('/units/{id}/delete-document', [\App\Http\Controllers\VehicleUnitController::class, 'deleteDocument'])->name('inventory.units.delete-document');
    });
    
    Route::middleware(['permission:inventory.delete'])->group(function () {
        Route::delete('/units/{unit}', [\App\Http\Controllers\VehicleUnitController::class, 'destroy'])->name('inventory.units.destroy');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/mfa.php';
