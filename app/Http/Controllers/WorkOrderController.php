<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWorkOrderRequest;
use App\Http\Requests\UpdateWorkOrderRequest;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\ServiceType;
use App\Models\User;
use App\Models\VehicleUnit;
use App\Models\WorkOrder;
use App\Models\WorkOrderPhoto;
use App\Services\OdometerService;
use App\Services\PhotoUploadService;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkOrderController extends Controller
{
    use LogsActivity;

    protected PhotoUploadService $photoService;
    protected OdometerService $odometerService;

    public function __construct(
        PhotoUploadService $photoService,
        OdometerService $odometerService
    ) {
        $this->photoService = $photoService;
        $this->odometerService = $odometerService;
    }

    /**
     * Display a listing of the work orders.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isElevated = $user->hasAnyRole(['admin', 'auditor']);
        $isTechnician = $user->hasRole('technician');

        // Base query with relationships
        $query = WorkOrder::with(['branch', 'serviceType', 'assignedTechnician', 'photos'])
            ->when($request->include_deleted, fn($q) => $q->withTrashed())
            ->when(!$isElevated, function ($q) use ($user, $isTechnician) {
                $q->where('branch_id', $user->branch_id);
                if ($isTechnician) {
                    $q->where('assigned_to', $user->id);
                }
            })
            ->when($isElevated && $request->branch_id,
                fn($q, $branchId) => $q->where('branch_id', $branchId))
            ->when($request->search, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('work_order_number', 'like', "%{$search}%")
                        ->orWhere('vehicle_vin', 'like', "%{$search}%")
                        ->orWhere('vehicle_plate_number', 'like', "%{$search}%")
                        ->orWhere('customer_name', 'like', "%{$search}%")
                        ->orWhere('reference_number', 'like', "%{$search}%");
                });
            })
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->priority, fn($q, $priority) => $q->where('priority', $priority))
            ->when($request->verification_status, fn($q, $vs) => $q->where('verification_status', $vs))
            ->when($request->has_fraud_alerts === 'true', fn($q) => $q->withFraudAlerts())
            ->when($request->is_overdue === 'true', fn($q) => $q->overdue());

        $workOrders = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Calculate stats
        $statsQuery = WorkOrder::query()
            ->when(!$isElevated, function ($q) use ($user, $isTechnician) {
                $q->where('branch_id', $user->branch_id);
                if ($isTechnician) {
                    $q->where('assigned_to', $user->id);
                }
            })
            ->when($isElevated && $request->branch_id,
                fn($q, $branchId) => $q->where('branch_id', $branchId));

        $stats = [
            'total_work_orders' => (clone $statsQuery)->count(),
            'pending' => (clone $statsQuery)->where('status', 'pending')->count(),
            'in_progress' => (clone $statsQuery)->where('status', 'in_progress')->count(),
            'completed' => (clone $statsQuery)->where('status', 'completed')->count(),
            'overdue' => (clone $statsQuery)->overdue()->count(),
            'with_fraud_alerts' => (clone $statsQuery)->withFraudAlerts()->count(),
            'flagged' => (clone $statsQuery)->byVerificationStatus('flagged')->count(),
        ];

        // Get missed PMS vehicles
        $missedPMS = $this->odometerService->getMissedPMSVehicles(
            $user->hasRole('admin') || $user->hasRole('auditor') ? null : $user->branch_id
        );

        return Inertia::render('service/pms-work-orders/index', [
            'workOrders' => $workOrders,
            'stats' => $stats,
            'missedPMS' => $missedPMS,
            'filters' => $request->only([
                'search',
                'status',
                'priority',
                'verification_status',
                'branch_id',
                'has_fraud_alerts',
                'is_overdue',
                'include_deleted'
            ]),
            'branches' => ($user->hasRole('admin') || $user->hasRole('auditor'))
                ? Branch::where('status', 'active')->get()
                : null,
            'can' => [
                'create' => !$isTechnician && $user->can('pms-work-orders.create'),
                'edit' => !$isTechnician && $user->can('pms-work-orders.edit'),
                'delete' => !$isTechnician && $user->can('pms-work-orders.delete'),
                'restore' => !$isTechnician && $user->can('pms-work-orders.create'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new work order.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        $serviceTypesQuery = ServiceType::where('status', 'active');
        $vehiclesQuery = VehicleUnit::with('vehicleModel')
            ->whereNotNull('vehicle_model_id')
            ->orderBy('stock_number');

        if (!$user->hasRole('admin') && !$user->hasRole('auditor')) {
            $serviceTypesQuery->where('branch_id', $user->branch_id);
            $vehiclesQuery->where('branch_id', $user->branch_id);
        }

        return Inertia::render('service/pms-work-orders/create', [
            'branches' => ($user->hasRole('admin') || $user->hasRole('auditor'))
                ? Branch::where('status', 'active')->get()
                : null,
            'serviceTypes' => $serviceTypesQuery->get(),
            'technicians' => User::whereHas('roles', fn($q) => $q->where('name', 'technician'))->get(),
            'vehicles' => $vehiclesQuery->get(),
            'customers' => Customer::all(),
        ]);
    }

    /**
     * Store a newly created work order in storage.
     */
    public function store(StoreWorkOrderRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $workOrder = WorkOrder::create($data);

        // Record odometer reading if provided
        if (isset($data['current_mileage'])) {
            $this->odometerService->recordReading($workOrder, $data['current_mileage']);
        }

        // Set service location from branch if not provided
        if (!isset($data['service_location_lat']) && $workOrder->branch) {
            // Assuming branches have location data
            $workOrder->update([
                'service_location_lat' => $workOrder->branch->latitude ?? null,
                'service_location_lng' => $workOrder->branch->longitude ?? null,
                'service_location_address' => $workOrder->branch->full_address ?? null,
            ]);
        }

        // Log activity
        $this->logCreated(
            module: 'PMS Work Order',
            subject: $workOrder,
            description: "Created work order {$workOrder->work_order_number} for VIN {$workOrder->vehicle_vin}",
            properties: [
                'vehicle_vin' => $workOrder->vehicle_vin,
                'customer_name' => $workOrder->customer_name,
                'status' => $workOrder->status,
            ]
        );

        return redirect()
            ->route('service.pms-work-orders.show', $workOrder)
            ->with('success', 'Work order created successfully!');
    }

    /**
     * Display the specified work order.
     */
    public function show(Request $request, WorkOrder $pms_work_order): Response
    {
        // Authorization
        $this->authorizeWorkOrderAccess($request, $pms_work_order);

        $user = $request->user();
        $isTechnician = $user->hasRole('technician');

        $pms_work_order->load([
            'branch',
            'serviceType',
            'assignedTechnician',
            'creator',
            'updater',
            'photos' => function ($query) {
                $query->orderBy('created_at', 'desc');
            },
            'odometerReadings' => function ($query) {
                $query->orderBy('reading_date', 'desc')->limit(10);
            },
        ]);

        // Get photo statistics
        $photoStats = $this->photoService->getPhotoStatistics($pms_work_order);

        // Get odometer history for this VIN
        $odometerHistory = $this->odometerService->getReadingHistory($pms_work_order->vehicle_vin, 10);

        $beforePhotoExists = $pms_work_order->photos->contains(fn($photo) => $photo->photo_type === 'before');
        $requiresInitialPhoto = $isTechnician && !$beforePhotoExists;

        return Inertia::render('service/pms-work-orders/show', [
            'workOrder' => $pms_work_order,
            'photoStats' => $photoStats,
            'odometerHistory' => $odometerHistory,
            'can' => [
                'edit' => $request->user()->can('pms-work-orders.edit') && !$isTechnician,
                'delete' => $request->user()->can('pms-work-orders.delete') && !$isTechnician,
            ],
            'technicianContext' => [
                'isTechnician' => $isTechnician,
                'requiresInitialPhoto' => $requiresInitialPhoto,
                'canEditNotes' => $isTechnician,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified work order.
     */
    public function edit(Request $request, WorkOrder $pms_work_order): Response
    {
        // Authorization
        if (!$request->user()->hasRole('admin') && !$request->user()->hasRole('auditor')) {
            if ($pms_work_order->branch_id !== $request->user()->branch_id) {
                abort(403, 'You can only edit work orders from your branch.');
            }
        }

        $this->authorizeWorkOrderAccess($request, $pms_work_order);

        if ($request->user()->hasRole('technician')) {
            abort(403, 'Technicians cannot access the edit form.');
        }

        $user = $request->user();
        $pms_work_order->load(['branch', 'serviceType', 'assignedTechnician', 'photos']);

        return Inertia::render('service/pms-work-orders/edit', [
            'workOrder' => $pms_work_order,
            'serviceTypes' => ServiceType::where('status', 'active')
                ->when(!$user->hasRole('admin') && !$user->hasRole('auditor'),
                    fn($q) => $q->forUserBranch($user))
                ->get(['id', 'name', 'category']),
            'technicians' => User::whereHas('roles', fn($q) => $q->where('name', 'technician'))
                ->when(!$user->hasRole('admin') && !$user->hasRole('auditor'),
                    fn($q) => $q->where('branch_id', $user->branch_id))
                ->get(['id', 'name', 'email']),
        ]);
    }

    /**
     * Update the specified work order in storage.
     */
    public function update(UpdateWorkOrderRequest $request, WorkOrder $pms_work_order): RedirectResponse
    {
        $data = $request->validated();

        // Track changes for audit
        $changes = [];
        foreach ($data as $key => $value) {
            if ($pms_work_order->{$key} != $value) {
                $changes[$key] = ['old' => $pms_work_order->{$key}, 'new' => $value];
            }
        }

        // Update odometer if mileage changed
        if (isset($changes['current_mileage'])) {
            $this->odometerService->recordReading($pms_work_order, $data['current_mileage']);
        }

        $pms_work_order->update($data);

        // Check overdue status
        $pms_work_order->checkOverdueStatus();

        // Log activity
        $this->logUpdated(
            module: 'PMS Work Order',
            subject: $pms_work_order,
            description: "Updated work order {$pms_work_order->work_order_number}",
            properties: ['changes' => $changes]
        );

        return redirect()
            ->route('service.pms-work-orders.index')
            ->with('success', 'Work order updated successfully!');
    }

    /**
     * Remove the specified work order from storage (soft delete).
     */
    public function destroy(Request $request, WorkOrder $pms_work_order): RedirectResponse
    {
        // Authorization
        $this->authorizeWorkOrderAccess($request, $pms_work_order);

        $workOrderNumber = $pms_work_order->work_order_number;

        // Log before deletion
        $this->logDeleted(
            module: 'PMS Work Order',
            subject: $pms_work_order,
            description: "Deleted work order {$workOrderNumber}",
            properties: ['work_order_number' => $workOrderNumber]
        );

        $pms_work_order->delete();

        return redirect()
            ->route('service.pms-work-orders.index')
            ->with('success', 'Work order deleted successfully!');
    }

    /**
     * Restore a soft-deleted work order.
     */
    public function restore(Request $request, $id): RedirectResponse
    {
        try {
            $workOrder = WorkOrder::withTrashed()->findOrFail($id);

            $this->authorizeWorkOrderAccess($request, $workOrder);

            if (!$workOrder->trashed()) {
                return redirect()->back()->with('error', 'Work order is not deleted.');
            }

            $workOrderNumber = $workOrder->work_order_number;
            $workOrder->restore();

            // Log activity
            $this->logRestored(
                module: 'PMS Work Order',
                subject: $workOrder,
                description: "Restored work order {$workOrderNumber}",
                properties: ['work_order_number' => $workOrderNumber]
            );

            return redirect()
                ->route('service.pms-work-orders.index')
                ->with('success', 'Work order restored successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to restore work order. Please try again.');
        }
    }

    /**
     * Upload photos to a work order.
     */
    public function uploadPhotos(Request $request, WorkOrder $pms_work_order)
    {
        $this->authorizeWorkOrderAccess($request, $pms_work_order);

        $request->validate([
            'photos' => 'required|array|max:10',
            'photos.*' => 'required|image|mimes:jpeg,png,jpg|max:5120', // 5MB max
            'photo_type' => 'required|in:before,after,during,damage,completion',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            $uploadedPhotos = $this->photoService->uploadMultiplePhotos(
                $pms_work_order,
                $request->file('photos'),
                $request->photo_type
            );

            // Log activity
            $this->logActivity(
                module: 'PMS Work Order',
                action: 'photo_upload',
                subject: $pms_work_order,
                description: "Uploaded " . count($uploadedPhotos) . " photos to work order {$pms_work_order->work_order_number}",
                properties: [
                    'photo_count' => count($uploadedPhotos),
                    'photo_type' => $request->photo_type,
                ]
            );

            // Check if this is an Inertia request
            if ($request->header('X-Inertia')) {
                return redirect()
                    ->route('service.pms-work-orders.show', $pms_work_order)
                    ->with('success', count($uploadedPhotos) . ' photo(s) uploaded successfully');
            }

            return response()->json([
                'success' => true,
                'message' => count($uploadedPhotos) . ' photo(s) uploaded successfully',
                'photos' => $uploadedPhotos,
            ]);
        } catch (\Exception $e) {
            // Check if this is an Inertia request
            if ($request->header('X-Inertia')) {
                return redirect()
                    ->back()
                    ->withErrors(['photos' => 'Photo upload failed: ' . $e->getMessage()]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Photo upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a photo from a work order.
     */
    public function deletePhoto(Request $request, WorkOrder $pms_work_order, WorkOrderPhoto $photo): JsonResponse
    {
        $this->authorizeWorkOrderAccess($request, $pms_work_order);

        if ($photo->work_order_id !== $pms_work_order->id) {
            return response()->json([
                'success' => false,
                'message' => 'Photo does not belong to this work order',
            ], 403);
        }

        try {
            $this->photoService->deletePhoto($photo);

            return response()->json([
                'success' => true,
                'message' => 'Photo deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete photo: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Validate odometer reading for a VIN.
     */
    public function validateOdometer(Request $request): JsonResponse
    {
        $request->validate([
            'vin' => 'required|string|size:17',
            'reading' => 'required|integer|min:0',
        ]);

        $validation = $this->odometerService->validateReading(
            $request->vin,
            $request->reading
        );

        return response()->json($validation);
    }

    /**
     * Ensure non-admin users only access allowed work orders.
     */
    private function authorizeWorkOrderAccess(Request $request, WorkOrder $workOrder): void
    {
        $user = $request->user();

        if ($user->hasAnyRole(['admin', 'auditor'])) {
            return;
        }

        if ($workOrder->branch_id !== $user->branch_id) {
            abort(403, 'You can only access work orders from your branch.');
        }

        if ($user->hasRole('technician') && $workOrder->assigned_to !== $user->id) {
            abort(403, 'You can only access work orders assigned to you.');
        }
    }
}
