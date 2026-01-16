<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVehicleModelRequest;
use App\Http\Requests\UpdateVehicleModelRequest;
use App\Models\VehicleModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Traits\LogsActivity;

class VehicleModelController extends Controller
{
    use LogsActivity;

    /**
     * Display the listing page (Inertia).
     */
    public function indexPage(Request $request): Response
    {
        $query = VehicleModel::query()
            ->when($request->include_deleted, function ($q) {
                $q->withTrashed();
            })
            ->when($request->search, fn($q, $search) => $q->search($search))
            ->when($request->year, fn($q, $year) => $q->byYear($year))
            ->when($request->body_type, fn($q, $type) => $q->byBodyType($type))
            ->when($request->fuel_type, fn($q, $fuel) => $q->byFuelType($fuel))
            ->when($request->is_active !== null, fn($q) => $q->where('is_active', $request->is_active));

        $models = $query->orderBy('year', 'desc')
            ->orderBy('model', 'asc')
            ->paginate($request->per_page ?? 15)
            ->withQueryString();

        // Stats
        $stats = [
            'total' => VehicleModel::count(),
            'active' => VehicleModel::active()->count(),
            'featured' => VehicleModel::featured()->count(),
            'electric' => VehicleModel::where('fuel_type', 'electric')->count(),
        ];

        return Inertia::render('inventory/vehicle-models', [
            'records' => $models,
            'stats' => $stats,
            'filters' => $request->only(['search', 'year', 'body_type', 'fuel_type', 'is_active', 'include_deleted']),
        ]);
    }

    /**
     * Show the form for creating a new resource (Inertia).
     */
    public function create(): Response
    {
        return Inertia::render('inventory/vehicle-model-create');
    }

    /**
     * Show the form for editing the specified resource (Inertia).
     */
    public function edit(VehicleModel $vehicleModel): Response
    {
        return Inertia::render('inventory/vehicle-model-edit', [
            'model' => $vehicleModel,
        ]);
    }

    /**
     * Display a listing of the resource (API).
     */
    public function index(Request $request): JsonResponse
    {
        $query = VehicleModel::query()
            ->when($request->include_deleted, function ($q) {
                $q->withTrashed();
            })
            ->when($request->search, fn($q, $search) => $q->search($search))
            ->when($request->year, fn($q, $year) => $q->byYear($year))
            ->when($request->body_type, fn($q, $type) => $q->byBodyType($type))
            ->when($request->fuel_type, fn($q, $fuel) => $q->byFuelType($fuel))
            ->when($request->is_active !== null, fn($q) => $q->where('is_active', $request->is_active));

        $models = $query->orderBy('year', 'desc')
            ->orderBy('model', 'asc')
            ->paginate($request->per_page ?? 15)
            ->withQueryString();

        // Stats
        $stats = [
            'total' => VehicleModel::count(),
            'active' => VehicleModel::active()->count(),
            'featured' => VehicleModel::featured()->count(),
            'electric' => VehicleModel::where('fuel_type', 'electric')->count(),
        ];

        return response()->json([
            'records' => $models,
            'stats' => $stats,
            'filters' => $request->only(['search', 'year', 'body_type', 'fuel_type', 'is_active', 'include_deleted']),
        ]);
    }

    /**
     * Store a newly created resource in storage (Inertia).
     */
    public function store(StoreVehicleModelRequest $request)
    {
        $data = $request->validated();
        $manualDocuments = $this->uploadManualDocuments($request);

        if (!empty($manualDocuments)) {
            $data['manual_documents'] = $manualDocuments;
        }

        $model = VehicleModel::create($data);

        $this->logCreated(
            'Inventory',
            $model,
            "Vehicle model created: {$model->full_name}",
            [
                'model_id' => $model->id,
                'model_name' => $model->model,
                'year' => $model->year,
            ]
        );

        return redirect()->route('inventory.models.index')
            ->with('success', 'Vehicle model created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(VehicleModel $vehicleModel): JsonResponse
    {
        return response()->json([
            'data' => $vehicleModel->load('vehicleUnits'),
        ]);
    }

    /**
     * Update the specified resource in storage (Inertia).
     */
    public function update(UpdateVehicleModelRequest $request, VehicleModel $vehicleModel)
    {
        $data = $request->validated();
        $oldData = $vehicleModel->toArray();

        $existingManuals = $vehicleModel->manual_documents ?? [];
        $newManuals = $this->uploadManualDocuments($request);

        if (!empty($newManuals)) {
            $data['manual_documents'] = array_merge($existingManuals, $newManuals);
        }

        $vehicleModel->update($data);

        $this->logUpdated(
            'Inventory',
            $vehicleModel,
            "Vehicle model updated: {$vehicleModel->full_name}",
            [
                'model_id' => $vehicleModel->id,
                'changes' => array_diff_assoc($data, $oldData),
            ]
        );

        return redirect()->route('inventory.models.index')
            ->with('success', 'Vehicle model updated successfully.');
    }

    /**
     * Remove the specified resource from storage (Inertia).
     */
    public function destroy(VehicleModel $vehicleModel)
    {
        // Check if model has vehicle units
        if ($vehicleModel->vehicleUnits()->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete vehicle model with existing vehicle units. Please deactivate instead.');
        }

        $vehicleModel->delete();

        $this->logDeleted(
            'Inventory',
            $vehicleModel,
            "Vehicle model deleted: {$vehicleModel->full_name}",
            [
                'model_id' => $vehicleModel->id,
                'model_name' => $vehicleModel->model,
            ]
        );

        return redirect()->route('inventory.models.index')
            ->with('success', 'Vehicle model deleted successfully.');
    }

    /**
     * Restore a soft-deleted resource (Inertia).
     */
    public function restore($id)
    {
        $vehicleModel = VehicleModel::withTrashed()->findOrFail($id);
        $vehicleModel->restore();

        $this->logRestored(
            'Inventory',
            $vehicleModel,
            "Vehicle model restored: {$vehicleModel->full_name}",
            [
                'model_id' => $vehicleModel->id,
            ]
        );

        return redirect()->route('inventory.models.index')
            ->with('success', 'Vehicle model restored successfully.');
    }

    /**
     * Handle manual document uploads for vehicle models.
     */
    private function uploadManualDocuments(Request $request): array
    {
        if (!$request->hasFile('manual_documents')) {
            return [];
        }

        $uploaded = [];
        foreach ($request->file('manual_documents') as $document) {
            $path = $document->store('vehicle-models/manuals', 'public');
            
            $uploaded[] = [
                'name' => $document->getClientOriginalName(),
                'url' => '/storage/' . $path,
                'mime_type' => $document->getClientMimeType(),
                'size_kb' => round($document->getSize() / 1024, 2),
                'uploaded_at' => now()->toISOString(),
            ];
        }

        return $uploaded;
    }
}
