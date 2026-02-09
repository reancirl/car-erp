<?php

namespace App\Http\Controllers;

use App\Models\VehicleUnit;
use App\Models\Branch;
use App\Http\Requests\StoreVehicleUnitRequest;
use App\Http\Requests\UpdateVehicleUnitRequest;
use App\Http\Requests\TransferVehicleRequest;
use App\Http\Requests\UpdateVehicleStatusRequest;
use App\Services\VehicleMovementService;
use App\Traits\LogsActivity;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class VehicleUnitController extends Controller
{
    use LogsActivity;

    protected VehicleMovementService $movementService;

    public function __construct(VehicleMovementService $movementService)
    {
        $this->movementService = $movementService;
    }

    /**
     * Finance-related fields guarded for non-accounting users.
     */
    private array $financeFields = [
        'purchase_price',
        'sale_price',
        'msrp_price',
        'srp_amount',
        'discount_amount',
        'net_selling_price',
        'dp_amount',
        'dp_date',
        'balance_financed',
        'financing_institution',
        'financing_terms_months',
        'financing_interest_rate',
        'financing_monthly_amortization',
        'chattel_mortgage_details',
        'proof_of_payment_refs',
        'freebies_total_cost',
        'freebies_list',
        'promo_freebies',
    ];

    /**
     * Operational-only fields allowed for inventory users without sales/finance perms.
     */
    private array $inventoryOperationalFields = [
        'status',
        'sub_status',
        'location',
        'is_locked',
    ];

    private function applyWarrantyDefaults(array $data, ?VehicleUnit $unit = null): array
    {
        $termMonths = config('warranty.default_term_months', 36);

        $startProvided = isset($data['warranty_start_date']) && $data['warranty_start_date'];
        $endProvided = array_key_exists('warranty_end_date', $data) && $data['warranty_end_date'];

        if ($startProvided && !$endProvided) {
            $data['warranty_end_date'] = Carbon::parse($data['warranty_start_date'])->addMonths($termMonths)->toDateString();
        }

        return $data;
    }

    private function enforceFinancePermissions($request, array $validated, string $operation = 'update')
    {
        $user = $request->user();
        $hasFinancePerm = $user->can('finance.edit_financials');

        $financeTouched = collect($this->financeFields)
            ->filter(fn($field) => array_key_exists($field, $validated))
            ->isNotEmpty();

        if ($financeTouched && ! $hasFinancePerm) {
            abort(response()->json([
                'message' => 'You are not allowed to modify financial fields.',
            ], 403));
        }

        $isInventoryOnly = $operation === 'update'
            && $user->can('inventory.edit')
            && ! $user->can('sales.edit')
            && ! $hasFinancePerm;

        if ($isInventoryOnly) {
            $disallowed = array_diff(array_keys($validated), $this->inventoryOperationalFields);
            if (! empty($disallowed)) {
                abort(response()->json([
                    'message' => 'Inventory users can only update status, sub-status, location, or lock.',
                ], 403));
            }
        }
    }

    /**
     * Display the inventory page (Inertia).
     */
    public function indexPage(Request $request): Response
    {
        $user = $request->user();

        $query = VehicleUnit::with(['branch', 'assignedUser', 'vehicleModel', 'owner'])
            ->when($request->include_deleted, function ($q) {
                $q->withTrashed();
            })
            // Branch filtering: admin/auditor see all, others see own branch
            ->when(!$user->hasRole(['admin', 'auditor']), function ($q) use ($user) {
                $q->where('branch_id', $user->branch_id);
            })
            ->when($request->branch_id && $user->hasRole(['admin', 'auditor']), function ($q) use ($request) {
                $q->where('branch_id', $request->branch_id);
            })
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->vin, fn($q, $vin) => $q->where('vin', 'like', "%{$vin}%"))
            ->when($request->stock_number, fn($q, $stock) => $q->where('stock_number', 'like', "%{$stock}%"))
            ->when($request->search, fn($q, $search) => $q->search($search));

        $units = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15)
            ->withQueryString();

        // Stats - respecting branch scope
        $statsQuery = VehicleUnit::query()
            ->when(!$user->hasRole(['admin', 'auditor']), function ($q) use ($user) {
                $q->where('branch_id', $user->branch_id);
            });

        $stats = [
            'total' => (clone $statsQuery)->count(),
            'in_stock' => (clone $statsQuery)->where('status', 'in_stock')->count(),
            'reserved' => (clone $statsQuery)->where('status', 'reserved')->count(),
            'sold' => (clone $statsQuery)->where('status', 'sold')->count(),
            'total_value' => (clone $statsQuery)->where('status', 'in_stock')->sum('purchase_price'),
        ];

        // Get branches for admin/auditor filter
        $branches = $user->hasRole(['admin', 'auditor']) ? Branch::orderBy('name')->get() : null;
        $customers = \App\Models\Customer::orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'company_name', 'customer_type', 'email'])
            ->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->display_name,
                'email' => $c->email,
            ]);

        return Inertia::render('inventory/vehicles', [
            'records' => $units,
            'stats' => $stats,
            'filters' => $request->only(['search', 'branch_id', 'status', 'vin', 'stock_number', 'include_deleted']),
            'branches' => $branches,
            'customers' => $customers,
        ]);
    }

    /**
     * Show the form for creating a new resource (Inertia).
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        // Get branches for admin/auditor
        $branches = Branch::orderBy('name')->get();

        // Get sales reps (users with sales_rep role)
        $salesReps = \App\Models\User::role('sales_rep')->orderBy('name')->get(['id', 'name', 'email']);

        // Get active vehicle models
        $vehicleModels = \App\Models\VehicleModel::active()
            ->orderBy('year', 'desc')
            ->orderBy('model', 'asc')
            ->get(['id', 'make', 'model', 'year', 'body_type', 'transmission', 'fuel_type']);

        $customers = \App\Models\Customer::orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'company_name', 'customer_type', 'email'])
            ->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->display_name,
                'email' => $c->email,
            ]);

        return Inertia::render('inventory/vehicle-create', [
            'branches' => $branches,
            'salesReps' => $salesReps,
            'vehicleModels' => $vehicleModels,
            'customers' => $customers,
        ]);
    }

    /**
     * Show the form for editing the specified resource (Inertia).
     */
    public function edit(Request $request, $id): Response
    {
        $user = $request->user();

        $unit = VehicleUnit::with(['branch', 'assignedUser', 'vehicleModel', 'owner', 'salesAgent', 'assignedDriver', 'releaseApprovalUser'])->findOrFail($id);

        // Verify user has access to this unit's branch
        if (!$user->hasRole(['admin', 'auditor']) && $unit->branch_id !== $user->branch_id) {
            abort(403, 'Unauthorized to edit this vehicle unit.');
        }

        // Get branches for admin/auditor
        $branches = Branch::orderBy('name')->get();

        // Get sales reps (users with sales_rep role)
        $salesReps = \App\Models\User::role('sales_rep')->orderBy('name')->get(['id', 'name', 'email']);

        // Get active vehicle models
        $vehicleModels = \App\Models\VehicleModel::active()
            ->orderBy('year', 'desc')
            ->orderBy('model', 'asc')
            ->get(['id', 'make', 'model', 'year', 'body_type', 'transmission', 'fuel_type']);

        $customers = \App\Models\Customer::orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'company_name', 'customer_type', 'email'])
            ->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->display_name,
                'email' => $c->email,
            ]);

        return Inertia::render('inventory/vehicle-edit', [
            'unit' => $unit,
            'branches' => $branches,
            'salesReps' => $salesReps,
            'vehicleModels' => $vehicleModels,
            'customers' => $customers,
        ]);
    }

    /**
     * Display a listing of the resource (API).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = VehicleUnit::with(['branch', 'assignedUser', 'vehicleModel', 'owner'])
            ->when($request->include_deleted, function ($q) {
                $q->withTrashed();
            })
            // Branch filtering: admin/auditor see all, others see own branch
            ->when(!$user->hasRole(['admin', 'auditor']), function ($q) use ($user) {
                $q->where('branch_id', $user->branch_id);
            })
            ->when($request->branch_id && $user->hasRole(['admin', 'auditor']), function ($q) use ($request) {
                $q->where('branch_id', $request->branch_id);
            })
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->vin, fn($q, $vin) => $q->where('vin', 'like', "%{$vin}%"))
            ->when($request->stock_number, fn($q, $stock) => $q->where('stock_number', 'like', "%{$stock}%"))
            ->when($request->search, fn($q, $search) => $q->search($search));

        $units = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15)
            ->withQueryString();

        // Stats - respecting branch scope
        $statsQuery = VehicleUnit::query()
            ->when(!$user->hasRole(['admin', 'auditor']), function ($q) use ($user) {
                $q->where('branch_id', $user->branch_id);
            });

        $stats = [
            'total' => (clone $statsQuery)->count(),
            'in_stock' => (clone $statsQuery)->where('status', 'in_stock')->count(),
            'reserved' => (clone $statsQuery)->where('status', 'reserved')->count(),
            'sold' => (clone $statsQuery)->where('status', 'sold')->count(),
            'total_value' => (clone $statsQuery)->where('status', 'in_stock')->sum('purchase_price'),
        ];

        return response()->json([
            'records' => $units,
            'stats' => $stats,
            'filters' => $request->only(['search', 'branch_id', 'status', 'vin', 'stock_number', 'include_deleted']),
        ]);
    }

    /**
     * Store a newly created resource in storage (Inertia/API).
     */
    public function store(StoreVehicleUnitRequest $request)
    {
        $validated = $request->validated();

        $this->enforceFinancePermissions($request, $validated, 'create');
        $validated = $this->applyWarrantyDefaults($validated);
        
        // Handle photo uploads
        $imageUrls = [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('vehicles/photos', 'public');
                $imageUrls[] = '/storage/' . $path;
            }
        }
        $validated['images'] = $imageUrls;
        
        // Handle document uploads
        $documents = [];
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $doc) {
                $path = $doc->store('vehicles/documents', 'public');
                $documents[] = [
                    'name' => $doc->getClientOriginalName(),
                    'url' => '/storage/' . $path,
                ];
            }
        }
        
        // Store documents in specs JSON
        if (!empty($documents)) {
            $specs = $validated['specs'] ?? [];
            $specs['documents'] = $documents;
            $validated['specs'] = $specs;
        }
        
        // Remove photos and documents from validated data as they're now processed
        unset($validated['photos'], $validated['documents']);
        
        $unit = VehicleUnit::create($validated);

        $this->logCreated(
            'Inventory',
            $unit,
            "Vehicle unit created: {$unit->stock_number} (VIN: {$unit->vin})",
            [
                'unit_id' => $unit->id,
                'stock_number' => $unit->stock_number,
                'vin' => $unit->vin,
                'photos_count' => count($imageUrls),
                'documents_count' => count($documents),
            ]
        );

        // If this is an API request (for file uploads), return JSON
        if ($request->wantsJson() || $request->header('Accept') === 'application/json') {
            return response()->json([
                'message' => 'Vehicle unit created successfully.',
                'data' => $unit->load(['branch', 'vehicleModel', 'owner']),
            ], 201);
        }

        // Otherwise, redirect for normal Inertia form submission
        return redirect()->route('inventory.vehicles.show', $unit->id)
            ->with('success', 'Vehicle unit created successfully.');
    }

    /**
     * Display the vehicle view page (Inertia).
     */
    public function showPage(Request $request, $id): Response
    {
        $unit = VehicleUnit::with(['branch', 'assignedUser', 'vehicleModel', 'owner'])
            ->findOrFail($id);

        // Verify user has access to this unit's branch
        $user = $request->user();
        if (!$user->hasRole(['admin', 'auditor']) && $unit->branch_id !== $user->branch_id) {
            abort(403, 'Unauthorized to view this vehicle unit.');
        }

        // Get recent activity logs for this vehicle
        $activityLogs = \App\Models\ActivityLog::where('subject_type', VehicleUnit::class)
            ->where('subject_id', $unit->id)
            ->with('causer')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->description,
                    'user' => $log->causer ? $log->causer->name : 'System',
                    'timestamp' => $log->created_at->toISOString(),
                    'event' => $log->event,
                    'module' => $log->module,
                ];
            });

        return Inertia::render('inventory/vehicle-view', [
            'vehicle' => $unit,
            'activityLogs' => $activityLogs,
        ]);
    }

    /**
     * Display the specified resource (API).
     */
    public function show(VehicleUnit $unit): JsonResponse
    {
        // Verify user has access to this unit's branch
        $user = request()->user();
        if (!$user->hasRole(['admin', 'auditor']) && $unit->branch_id !== $user->branch_id) {
            return response()->json([
                'message' => 'Unauthorized to view this vehicle unit.',
            ], 403);
        }

        return response()->json([
            'data' => $unit->load(['branch', 'vehicleModel', 'owner', 'movements.fromBranch', 'movements.toBranch', 'movements.user']),
        ]);
    }

    /**
     * Update the specified resource in storage (Inertia).
     */
    public function update(UpdateVehicleUnitRequest $request, VehicleUnit $unit)
    {
        // Verify user has access to this unit's branch
        $user = $request->user();
        if (!$user->hasRole(['admin', 'auditor']) && $unit->branch_id !== $user->branch_id) {
            return redirect()->back()
                ->with('error', 'Unauthorized to update this vehicle unit.');
        }

        $validated = $request->validated();
        $this->enforceFinancePermissions($request, $validated);
        $validated = $this->applyWarrantyDefaults($validated, $unit);
        $original = $unit->toArray();
        
        // Handle new photo uploads (append to existing)
        if ($request->hasFile('photos')) {
            $existingImages = $unit->images ?? [];
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('vehicles/photos', 'public');
                $existingImages[] = '/storage/' . $path;
            }
            $validated['images'] = $existingImages;
        }
        
        // Handle new document uploads (append to existing)
        if ($request->hasFile('documents')) {
            $existingDocs = $unit->specs['documents'] ?? [];
            foreach ($request->file('documents') as $doc) {
                $path = $doc->store('vehicles/documents', 'public');
                $existingDocs[] = [
                    'name' => $doc->getClientOriginalName(),
                    'url' => '/storage/' . $path,
                ];
            }
            
            $specs = $validated['specs'] ?? $unit->specs ?? [];
            $specs['documents'] = $existingDocs;
            $validated['specs'] = $specs;
        }
        
        // Remove photos and documents from validated data as they're now processed
        unset($validated['photos'], $validated['documents']);
        
        $unit->update($validated);

        $changes = [];
        foreach ($validated as $key => $value) {
            if (isset($original[$key]) && $original[$key] != $value) {
                $changes[$key] = ['old' => $original[$key], 'new' => $value];
            }
        }

        $this->logUpdated(
            'Inventory',
            $unit,
            "Vehicle unit updated: {$unit->stock_number}",
            ['changes' => $changes]
        );

        return redirect()->route('inventory.vehicles.show', $unit->id)
            ->with('success', 'Vehicle unit updated successfully.');
    }

    public function approveRelease(Request $request, VehicleUnit $unit): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole('admin') && !$user->can('sales.approve_release')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$user->hasRole(['admin', 'auditor']) && $unit->branch_id !== $user->branch_id) {
            return response()->json(['message' => 'Unauthorized to approve this vehicle.'], 403);
        }

        $required = config('release.required_checklist', []);

        $validated = $request->validate([
            'release_checklist_status' => 'required|array',
        ]);

        $status = $validated['release_checklist_status'];

        $missing = collect($required)->filter(fn($key) => !data_get($status, $key));
        if ($missing->isNotEmpty()) {
            return response()->json([
                'message' => 'Checklist incomplete.',
                'missing' => $missing->values(),
            ], 422);
        }

        // Optional doc presence check for or_cr_ready
        if (data_get($status, 'or_cr_ready')) {
            $hasOrCrDoc = $unit->documents()
                ->where('type', 'or_cr_scan')
                ->exists();
            if (!$hasOrCrDoc) {
                return response()->json([
                    'message' => 'OR/CR document required when OR/CR ready is checked.',
                ], 422);
            }
        }

        DB::transaction(function () use ($unit, $status, $user) {
            $unit->update([
                'release_checklist_status' => $status,
                'release_approval_user_id' => $user->id,
                'release_approved_at' => now(),
            ]);
        });

        $this->logActivity(
            action: 'release_approved',
            module: 'Inventory',
            description: "Release approved for vehicle: {$unit->stock_number}",
            subject: $unit,
            properties: ['approved_by' => $user->id],
            status: 'success',
            event: 'approved'
        );

        return response()->json([
            'message' => 'Release approved.',
            'data' => $unit->only(['release_checklist_status', 'release_approval_user_id', 'release_approved_at']),
        ]);
    }

    /**
     * Remove the specified resource from storage (Inertia).
     */
    public function destroy(VehicleUnit $unit)
    {
        // Verify user has access to this unit's branch
        $user = request()->user();
        if (!$user->hasRole(['admin', 'auditor']) && $unit->branch_id !== $user->branch_id) {
            return redirect()->back()
                ->with('error', 'Unauthorized to delete this vehicle unit.');
        }

        // Prevent deletion of sold or locked units
        if ($unit->status === 'sold') {
            return redirect()->back()
                ->with('error', 'Cannot delete a sold vehicle unit. Please dispose instead.');
        }

        if ($unit->is_locked) {
            return redirect()->back()
                ->with('error', 'This vehicle is locked. Unlock before deleting.');
        }

        $unit->delete();

        $this->logDeleted(
            'Inventory',
            $unit,
            "Vehicle unit deleted: {$unit->stock_number} (VIN: {$unit->vin})",
            [
                'unit_id' => $unit->id,
                'stock_number' => $unit->stock_number,
            ]
        );

        return redirect()->route('inventory.vehicles.index')
            ->with('success', 'Vehicle unit deleted successfully.');
    }

    /**
     * Restore a soft-deleted resource (Inertia).
     */
    public function restore(int $id)
    {
        $unit = VehicleUnit::withTrashed()->findOrFail($id);

        // Verify user has access to this unit's branch
        $user = request()->user();
        if (!$user->hasRole(['admin', 'auditor']) && $unit->branch_id !== $user->branch_id) {
            return redirect()->back()
                ->with('error', 'Unauthorized to restore this vehicle unit.');
        }

        if (!$unit->trashed()) {
            return redirect()->back()
                ->with('error', 'Vehicle unit is not deleted.');
        }

        $unit->restore();

        $this->logRestored(
            'Inventory',
            $unit,
            "Vehicle unit restored: {$unit->stock_number}",
            ['unit_id' => $unit->id]
        );

        return redirect()->route('inventory.vehicles.index')
            ->with('success', 'Vehicle unit restored successfully.');
    }

    /**
     * Transfer a vehicle unit to another branch.
     */
    public function transfer(TransferVehicleRequest $request, VehicleUnit $unit): JsonResponse
    {
        if ($unit->is_locked) {
            return response()->json([
                'message' => 'Vehicle is locked and cannot be transferred.',
            ], 422);
        }

        try {
            $movement = $this->movementService->transfer(
                $unit,
                $request->to_branch_id,
                Carbon::parse($request->transfer_date),
                $request->user()->id,
                $request->remarks
            );

            return response()->json([
                'message' => 'Vehicle unit transferred successfully.',
                'data' => [
                    'unit' => $unit->fresh(['branch', 'vehicleModel']),
                    'movement' => $movement->load(['fromBranch', 'toBranch', 'user']),
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Transfer validation failed.',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Update the status of a vehicle unit.
     */
    public function updateStatus(UpdateVehicleStatusRequest $request, VehicleUnit $unit): JsonResponse
    {
        // Verify user has access to this unit's branch
        $user = $request->user();
        if (!$user->hasRole(['admin', 'auditor']) && $unit->branch_id !== $user->branch_id) {
            return response()->json([
                'message' => 'Unauthorized to update this vehicle unit status.',
            ], 403);
        }

        $allowLockedTransition = $unit->is_locked
            && $unit->status === 'reserved'
            && $request->status === 'sold';

        if ($unit->is_locked && $request->status !== $unit->status && !$allowLockedTransition) {
            return response()->json([
                'message' => 'Vehicle is locked. Unlock before changing status.',
            ], 422);
        }

        $oldStatus = $unit->status;
        $updateData = [
            'status' => $request->status,
            'sold_date' => $request->sold_date,
        ];

        // When marking as sold, ensure we have an owner and lock the record
        if ($request->status === 'sold') {
            $ownerId = $request->owner_id;

            if (!$ownerId) {
                $activeReservation = $unit->reservations()
                    ->whereNotIn('status', ['cancelled'])
                    ->latest()
                    ->first();

                if ($activeReservation) {
                    $ownerId = $activeReservation->customer_id;
                }
            }

            if (!$ownerId) {
                return response()->json([
                    'message' => 'Owner is required when marking a vehicle as sold.',
                ], 422);
            }

            $updateData['owner_id'] = $ownerId;
            $updateData['is_locked'] = true;
        }

        $unit->update($updateData);

        $this->logActivity(
            action: 'status_change',
            module: 'Inventory',
            description: "Vehicle unit status changed: {$unit->stock_number} from {$oldStatus} to {$request->status}",
            subject: $unit,
            properties: [
                'changes' => [
                    'status' => ['old' => $oldStatus, 'new' => $request->status],
                    'sold_date' => $request->sold_date,
                    'owner_id' => $unit->owner_id,
                ],
            ],
            status: 'success',
            event: 'status_changed'
        );

        return response()->json([
            'message' => 'Vehicle unit status updated successfully.',
            'data' => $unit->fresh(['branch', 'vehicleModel', 'owner']),
        ]);
    }

    /**
     * Upload photos for a vehicle unit.
     */
    public function uploadPhotos(Request $request, $id): JsonResponse
    {
        $unit = VehicleUnit::findOrFail($id);
        
        // Verify user has access to this unit's branch
        $user = $request->user();
        if (!$user->hasRole(['admin', 'auditor']) && $unit->branch_id !== $user->branch_id) {
            return response()->json([
                'message' => 'Unauthorized to upload photos for this vehicle unit.',
            ], 403);
        }

        $request->validate([
            'photos' => 'required|array|max:10',
            'photos.*' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // 5MB max per image
        ]);

        $existingImages = $unit->images ?? [];
        $uploadedImages = [];

        foreach ($request->file('photos') as $photo) {
            $path = $photo->store('vehicles/' . $unit->id . '/photos', 'public');
            $uploadedImages[] = '/storage/' . $path;
        }

        $allImages = array_merge($existingImages, $uploadedImages);
        $unit->update(['images' => $allImages]);

        $this->logActivity(
            action: 'photos_uploaded',
            module: 'Inventory',
            description: "Uploaded " . count($uploadedImages) . " photo(s) for vehicle: {$unit->stock_number}",
            subject: $unit,
            properties: ['uploaded_count' => count($uploadedImages)],
            status: 'success',
            event: 'updated'
        );

        return response()->json([
            'message' => 'Photos uploaded successfully.',
            'data' => [
                'images' => $allImages,
                'uploaded_count' => count($uploadedImages),
            ],
        ]);
    }

    /**
     * Delete a photo from a vehicle unit.
     */
    public function deletePhoto(Request $request, $id): JsonResponse
    {
        $unit = VehicleUnit::findOrFail($id);
        
        // Verify user has access to this unit's branch
        $user = $request->user();
        if (!$user->hasRole(['admin', 'auditor']) && $unit->branch_id !== $user->branch_id) {
            return response()->json([
                'message' => 'Unauthorized to delete photos for this vehicle unit.',
            ], 403);
        }

        $request->validate([
            'photo_url' => 'required|string',
        ]);

        $existingImages = $unit->images ?? [];
        $photoUrl = $request->photo_url;
        
        // Remove from array
        $updatedImages = array_values(array_filter($existingImages, fn($img) => $img !== $photoUrl));
        
        // Delete physical file
        $path = str_replace('/storage/', '', $photoUrl);
        \Storage::disk('public')->delete($path);

        $unit->update(['images' => $updatedImages]);

        $this->logActivity(
            action: 'photo_deleted',
            module: 'Inventory',
            description: "Deleted photo from vehicle: {$unit->stock_number}",
            subject: $unit,
            properties: ['deleted_photo' => $photoUrl],
            status: 'success',
            event: 'updated'
        );

        return response()->json([
            'message' => 'Photo deleted successfully.',
            'data' => ['images' => $updatedImages],
        ]);
    }

    /**
     * Upload documents for a vehicle unit.
     */
    public function uploadDocuments(Request $request, $id): JsonResponse
    {
        // deprecated legacy route kept for backward compatibility
        return $this->uploadDocument($request, VehicleUnit::findOrFail($id));
    }

    public function uploadDocument(Request $request, VehicleUnit $unit): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasRole(['admin', 'auditor']) && $unit->branch_id !== $user->branch_id) {
            abort(403, 'Unauthorized to upload documents for this vehicle unit.');
        }

        if (!$user->hasRole('admin') && !$user->can('inventory.edit') && !$user->can('sales.edit')) {
            return response()->json(['message' => 'Unauthorized to upload documents.'], 403);
        }

        $allowedTypes = config('documents.allowed_types');

        $validated = $request->validate([
            'type' => ['required', 'string', Rule::in($allowedTypes)],
            'file' => ['required', 'file', 'max:' . config('documents.max_size_kb'), 'mimetypes:' . implode(',', config('documents.allowed_mimes'))],
        ]);

        $path = $request->file('file')->store("vehicles/{$unit->id}/documents", 'public');

        $document = Document::create([
            'documentable_type' => VehicleUnit::class,
            'documentable_id' => $unit->id,
            'type' => $validated['type'],
            'path' => $path,
            'filename' => $request->file('file')->getClientOriginalName(),
            'mime' => $request->file('file')->getClientMimeType(),
            'size' => $request->file('file')->getSize(),
            'uploaded_by' => $user->id,
        ]);

        $this->logActivity(
            action: 'documents_uploaded',
            module: 'Inventory',
            description: "Uploaded document ({$document->type}) for vehicle: {$unit->stock_number}",
            subject: $unit,
            properties: ['document_id' => $document->id],
            status: 'success',
            event: 'updated'
        );

        return response()->json([
            'message' => 'Document uploaded successfully.',
            'data' => $document,
        ], 201);
    }

    public function listDocuments(VehicleUnit $unit): JsonResponse
    {
        $user = request()->user();

        if (!$user->hasRole(['admin', 'auditor']) && $unit->branch_id !== $user->branch_id) {
            abort(403, 'Unauthorized to view documents for this vehicle unit.');
        }

        $docs = $unit->documents()->get()->groupBy('type')->map(function ($items) {
            return $items->map(function (Document $doc) {
                return [
                    'id' => $doc->id,
                    'type' => $doc->type,
                    'filename' => $doc->filename,
                    'mime' => $doc->mime,
                    'size' => $doc->size,
                    'url' => \Storage::disk('public')->url($doc->path),
                    'uploaded_at' => $doc->created_at->toIso8601String(),
                    'uploaded_by' => $doc->uploader?->name,
                ];
            });
        });

        return response()->json(['data' => $docs]);
    }

    /**
     * Delete a document from a vehicle unit (legacy route signature).
     */
    public function deleteDocument(Request $request, $id): JsonResponse
    {
        $unit = VehicleUnit::findOrFail($id);
        $documentId = $request->input('document_id');
        if (!$documentId) {
            return response()->json(['message' => 'document_id is required'], 422);
        }
        $document = Document::findOrFail($documentId);
        return $this->deleteDocumentForUnit($request, $unit, $document);
    }

    public function deleteDocumentForUnit(Request $request, VehicleUnit $unit, Document $document): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasRole('admin')) {
            return response()->json(['message' => 'Only admin can delete documents.'], 403);
        }

        if ($document->documentable_id !== $unit->id || $document->documentable_type !== VehicleUnit::class) {
            return response()->json(['message' => 'Document does not belong to this vehicle.'], 422);
        }

        \Storage::disk('public')->delete($document->path);
        $document->delete();

        $this->logActivity(
            action: 'document_deleted',
            module: 'Inventory',
            description: "Deleted document ({$document->type}) from vehicle: {$unit->stock_number}",
            subject: $unit,
            properties: ['document_id' => $document->id],
            status: 'success',
            event: 'updated'
        );

        return response()->json(['message' => 'Document deleted successfully.']);
    }

    /**
     * Get movement history for a vehicle unit.
     */
    public function movements(VehicleUnit $unit): JsonResponse
    {
        // Verify user has access to this unit's branch
        $user = request()->user();
        if (!$user->hasRole(['admin', 'auditor']) && $unit->branch_id !== $user->branch_id) {
            return response()->json([
                'message' => 'Unauthorized to view this vehicle unit movements.',
            ], 403);
        }

        $movements = $unit->movements()
            ->with(['fromBranch', 'toBranch', 'user'])
            ->orderBy('transfer_date', 'desc')
            ->get();

        return response()->json([
            'data' => $movements,
        ]);
    }
}
