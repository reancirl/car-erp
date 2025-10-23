<?php

namespace App\Http\Controllers;

use App\Models\VehicleMaster;
use App\Http\Requests\StoreVehicleMasterRequest;
use App\Http\Requests\UpdateVehicleMasterRequest;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class VehicleMasterController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = VehicleMaster::query()
            ->withCount('units')
            ->when($request->include_deleted, function ($q) {
                $q->withTrashed();
            })
            ->when($request->make, fn($q, $make) => $q->where('make', $make))
            ->when($request->model, fn($q, $model) => $q->where('model', $model))
            ->when($request->year, fn($q, $year) => $q->where('year', $year))
            ->when($request->search, fn($q, $search) => $q->search($search))
            ->when($request->is_active !== null, fn($q) => $q->where('is_active', $request->boolean('is_active')));

        $masters = $query->orderBy('year', 'desc')
            ->orderBy('make')
            ->orderBy('model')
            ->paginate($request->per_page ?? 15)
            ->withQueryString();

        // Stats
        $statsQuery = VehicleMaster::query();
        $stats = [
            'total' => $statsQuery->count(),
            'active' => (clone $statsQuery)->where('is_active', true)->count(),
            'inactive' => (clone $statsQuery)->where('is_active', false)->count(),
            'total_units' => \App\Models\VehicleUnit::count(),
        ];

        return response()->json([
            'records' => $masters,
            'stats' => $stats,
            'filters' => $request->only(['search', 'make', 'model', 'year', 'is_active', 'include_deleted']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreVehicleMasterRequest $request): JsonResponse
    {
        $master = VehicleMaster::create($request->validated());

        $this->logCreated(
            'Inventory',
            $master,
            "Vehicle master created: {$master->full_name}",
            ['master_id' => $master->id]
        );

        return response()->json([
            'message' => 'Vehicle master created successfully.',
            'data' => $master->load('units'),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(VehicleMaster $master): JsonResponse
    {
        return response()->json([
            'data' => $master->load(['units.branch', 'units.movements']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateVehicleMasterRequest $request, VehicleMaster $master): JsonResponse
    {
        $original = $master->toArray();
        $master->update($request->validated());

        $changes = array_diff_assoc($request->validated(), $original);

        $this->logUpdated(
            'Inventory',
            $master,
            "Vehicle master updated: {$master->full_name}",
            ['changes' => $changes]
        );

        return response()->json([
            'message' => 'Vehicle master updated successfully.',
            'data' => $master->fresh(['units']),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(VehicleMaster $master): JsonResponse
    {
        // Check if master has active units
        $activeUnitsCount = $master->units()->whereIn('status', ['in_stock', 'reserved', 'in_transit'])->count();
        
        if ($activeUnitsCount > 0) {
            return response()->json([
                'message' => "Cannot delete vehicle master with {$activeUnitsCount} active unit(s). Please dispose or transfer units first.",
            ], 422);
        }

        $master->delete();

        $this->logDeleted(
            'Inventory',
            $master,
            "Vehicle master deleted: {$master->full_name}",
            ['master_id' => $master->id]
        );

        return response()->json([
            'message' => 'Vehicle master deleted successfully.',
        ]);
    }

    /**
     * Restore a soft-deleted resource.
     */
    public function restore(int $id): JsonResponse
    {
        $master = VehicleMaster::withTrashed()->findOrFail($id);

        if (!$master->trashed()) {
            return response()->json([
                'message' => 'Vehicle master is not deleted.',
            ], 422);
        }

        $master->restore();

        $this->logRestored(
            'Inventory',
            $master,
            "Vehicle master restored: {$master->full_name}",
            ['master_id' => $master->id]
        );

        return response()->json([
            'message' => 'Vehicle master restored successfully.',
            'data' => $master->fresh(['units']),
        ]);
    }
}
