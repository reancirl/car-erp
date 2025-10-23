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
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class VehicleUnitController extends Controller
{
    use LogsActivity;

    protected VehicleMovementService $movementService;

    public function __construct(VehicleMovementService $movementService)
    {
        $this->movementService = $movementService;
    }

    /**
     * Display the inventory page (Inertia).
     */
    public function indexPage(Request $request): Response
    {
        $user = $request->user();

        $query = VehicleUnit::with(['master', 'branch', 'assignedUser', 'vehicleModel'])
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

        return Inertia::render('inventory/vehicles', [
            'records' => $units,
            'stats' => $stats,
            'filters' => $request->only(['search', 'branch_id', 'status', 'vin', 'stock_number', 'include_deleted']),
            'branches' => $branches,
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

        return Inertia::render('inventory/vehicle-create', [
            'branches' => $branches,
            'salesReps' => $salesReps,
            'vehicleModels' => $vehicleModels,
        ]);
    }

    /**
     * Show the form for editing the specified resource (Inertia).
     */
    public function edit(Request $request, $id): Response
    {
        $user = $request->user();

        $unit = VehicleUnit::with(['master', 'branch', 'assignedUser', 'vehicleModel'])->findOrFail($id);

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

        return Inertia::render('inventory/vehicle-edit', [
            'unit' => $unit,
            'branches' => $branches,
            'salesReps' => $salesReps,
            'vehicleModels' => $vehicleModels,
        ]);
    }

    /**
     * Display a listing of the resource (API).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = VehicleUnit::with(['master', 'branch', 'assignedUser', 'vehicleModel'])
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
     * Store a newly created resource in storage (Inertia).
     */
    public function store(StoreVehicleUnitRequest $request)
    {
        $unit = VehicleUnit::create($request->validated());

        $this->logCreated(
            'Inventory',
            $unit,
            "Vehicle unit created: {$unit->stock_number} (VIN: {$unit->vin})",
            [
                'unit_id' => $unit->id,
                'stock_number' => $unit->stock_number,
                'vin' => $unit->vin,
            ]
        );

        return redirect()->route('inventory.vehicles.index')
            ->with('success', 'Vehicle unit created successfully.');
    }

    /**
     * Display the specified resource.
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
            'data' => $unit->load(['master', 'branch', 'movements.fromBranch', 'movements.toBranch', 'movements.user']),
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

        $original = $unit->toArray();
        $unit->update($request->validated());

        $changes = [];
        foreach ($request->validated() as $key => $value) {
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

        return redirect()->route('inventory.vehicles.index')
            ->with('success', 'Vehicle unit updated successfully.');
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

        // Prevent deletion of sold units
        if ($unit->status === 'sold') {
            return redirect()->back()
                ->with('error', 'Cannot delete a sold vehicle unit. Please dispose instead.');
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
                    'unit' => $unit->fresh(['master', 'branch']),
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

        $oldStatus = $unit->status;
        $unit->update([
            'status' => $request->status,
            'sold_date' => $request->sold_date,
        ]);

        $this->logActivity(
            action: 'status_change',
            module: 'Inventory',
            description: "Vehicle unit status changed: {$unit->stock_number} from {$oldStatus} to {$request->status}",
            subject: $unit,
            properties: [
                'changes' => [
                    'status' => ['old' => $oldStatus, 'new' => $request->status],
                    'sold_date' => $request->sold_date,
                ],
            ],
            status: 'success',
            event: 'status_changed'
        );

        return response()->json([
            'message' => 'Vehicle unit status updated successfully.',
            'data' => $unit->fresh(['master', 'branch']),
        ]);
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
