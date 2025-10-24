<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceTypeRequest;
use App\Http\Requests\UpdateServiceTypeRequest;
use App\Models\Branch;
use App\Models\CommonService;
use App\Models\ServiceType;
use App\Traits\LogsActivity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceTypeController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the service types.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Base query with relationships
        $query = ServiceType::with(['branch', 'creator', 'commonServices'])
            ->when($request->include_deleted, fn($q) => $q->withTrashed())
            ->when(!$user->hasRole('admin') && !$user->hasRole('auditor'),
                fn($q) => $q->forUserBranch($user))
            ->when($request->branch_id && ($user->hasRole('admin') || $user->hasRole('auditor')),
                fn($q) => $q->where('branch_id', $request->branch_id))
            ->when($request->search, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->category, fn($q, $category) => $q->where('category', $category))
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->interval_type, fn($q, $type) => $q->where('interval_type', $type));

        $serviceTypes = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Calculate stats
        $statsQuery = ServiceType::query()
            ->when(!$user->hasRole('admin') && !$user->hasRole('auditor'),
                fn($q) => $q->forUserBranch($user))
            ->when($request->branch_id && ($user->hasRole('admin') || $user->hasRole('auditor')),
                fn($q) => $q->where('branch_id', $request->branch_id));

        $stats = [
            'total_service_types' => (clone $statsQuery)->count(),
            'active_services' => (clone $statsQuery)->active()->count(),
            'inactive_services' => (clone $statsQuery)->inactive()->count(),
            'mileage_based' => (clone $statsQuery)->mileageBased()->count(),
            'time_based' => (clone $statsQuery)->timeBased()->count(),
        ];

        // Category breakdown
        $categoryStats = (clone $statsQuery)
            ->selectRaw('category, COUNT(*) as count')
            ->groupBy('category')
            ->pluck('count', 'category')
            ->toArray();

        return Inertia::render('service/service-types', [
            'serviceTypes' => $serviceTypes,
            'stats' => $stats,
            'categoryStats' => $categoryStats,
            'filters' => $request->only([
                'search',
                'category',
                'status',
                'interval_type',
                'branch_id',
                'include_deleted'
            ]),
            'branches' => ($user->hasRole('admin') || $user->hasRole('auditor'))
                ? Branch::where('status', 'active')->get()
                : null,
            'can' => [
                'create' => $user->can('service-types.create'),
                'edit' => $user->can('service-types.edit'),
                'delete' => $user->can('service-types.delete'),
                'restore' => $user->can('service-types.create'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new service type.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('service/service-type-create', [
            'branches' => ($user->hasRole('admin') || $user->hasRole('auditor'))
                ? Branch::where('status', 'active')->get()
                : null,
            'commonServices' => CommonService::where('is_active', true)
                ->when(!$user->hasRole('admin') && !$user->hasRole('auditor'),
                    fn($q) => $q->where('branch_id', $user->branch_id))
                ->orderBy('name')
                ->get(),
        ]);
    }

    /**
     * Store a newly created service type in storage.
     */
    public function store(StoreServiceTypeRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // Extract common service IDs for relationship
        $commonServiceIds = $data['common_service_ids'] ?? [];
        unset($data['common_service_ids']);

        // Set default values
        $data['is_available'] = $data['is_available'] ?? true;
        $data['currency'] = $data['currency'] ?? 'PHP';

        // Create service type
        $serviceType = ServiceType::create($data);

        // Attach common services if provided
        if (!empty($commonServiceIds)) {
            $serviceType->commonServices()->attach($commonServiceIds);
        }

        // Log activity
        $this->logCreated(
            module: 'Service Types',
            subject: $serviceType,
            description: "Created service type: {$serviceType->name}",
            properties: [
                'code' => $serviceType->code,
                'category' => $serviceType->category,
                'common_services_count' => count($commonServiceIds),
            ]
        );

        return redirect()
            ->route('service-types.index')
            ->with('success', 'Service type created successfully!');
    }

    /**
     * Display the specified service type.
     */
    public function show(Request $request, ServiceType $serviceType): Response
    {
        // Authorization check
        if (!$request->user()->hasRole('admin') && !$request->user()->hasRole('auditor')) {
            if ($serviceType->branch_id !== $request->user()->branch_id) {
                abort(403, 'You can only view service types from your branch.');
            }
        }

        // Load relationships
        $serviceType->load([
            'branch',
            'creator',
            'updater',
            'commonServices',
        ]);

        // Get work orders count and performance metrics
        $workOrdersCount = $serviceType->workOrders()->count();
        $completedWorkOrders = $serviceType->workOrders()->where('status', 'completed')->count();

        return Inertia::render('service/service-type-view', [
            'serviceType' => $serviceType,
            'performance' => [
                'work_orders_count' => $workOrdersCount,
                'completed_count' => $completedWorkOrders,
                'total_price' => $serviceType->calculateTotalPrice(),
                'total_duration' => $serviceType->calculateTotalDuration(),
            ],
            'can' => [
                'edit' => $request->user()->can('service-types.edit'),
                'delete' => $request->user()->can('service-types.delete'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified service type.
     */
    public function edit(Request $request, ServiceType $serviceType): Response
    {
        // Authorization check
        if (!$request->user()->hasRole('admin') && !$request->user()->hasRole('auditor')) {
            if ($serviceType->branch_id !== $request->user()->branch_id) {
                abort(403, 'You can only edit service types from your branch.');
            }
        }

        $user = $request->user();

        // Load relationships
        $serviceType->load(['branch', 'commonServices']);

        return Inertia::render('service/service-type-edit', [
            'serviceType' => $serviceType,
            'commonServices' => CommonService::where('is_active', true)
                ->when(!$user->hasRole('admin') && !$user->hasRole('auditor'),
                    fn($q) => $q->where('branch_id', $user->branch_id))
                ->orderBy('name')
                ->get(),
        ]);
    }

    /**
     * Update the specified service type in storage.
     */
    public function update(UpdateServiceTypeRequest $request, ServiceType $serviceType): RedirectResponse
    {
        $data = $request->validated();

        // Extract common service IDs for relationship
        $commonServiceIds = $data['common_service_ids'] ?? [];
        unset($data['common_service_ids']);

        // Track changes for activity log
        $changes = [];
        foreach ($data as $key => $value) {
            if ($serviceType->{$key} != $value) {
                $changes[$key] = ['old' => $serviceType->{$key}, 'new' => $value];
            }
        }

        // Update service type
        $serviceType->update($data);

        // Sync common services
        $serviceType->commonServices()->sync($commonServiceIds);

        // Log activity
        $this->logUpdated(
            module: 'Service Types',
            subject: $serviceType,
            description: "Updated service type: {$serviceType->name}",
            properties: [
                'changes' => $changes,
                'common_services_count' => count($commonServiceIds),
            ]
        );

        return redirect()
            ->route('service-types.index')
            ->with('success', 'Service type updated successfully!');
    }

    /**
     * Remove the specified service type from storage (soft delete).
     */
    public function destroy(Request $request, ServiceType $serviceType): RedirectResponse
    {
        // Authorization check
        if (!$request->user()->hasRole('admin') && !$request->user()->hasRole('auditor')) {
            if ($serviceType->branch_id !== $request->user()->branch_id) {
                abort(403, 'You can only delete service types from your branch.');
            }
        }

        $name = $serviceType->name;
        $code = $serviceType->code;

        // Log before deletion
        $this->logDeleted(
            module: 'Service Types',
            subject: $serviceType,
            description: "Deleted service type: {$name}",
            properties: [
                'name' => $name,
                'code' => $code,
            ]
        );

        $serviceType->delete();

        return redirect()
            ->route('service-types.index')
            ->with('success', 'Service type deleted successfully!');
    }

    /**
     * Restore a soft-deleted service type.
     */
    public function restore(Request $request, $id): RedirectResponse
    {
        try {
            $serviceType = ServiceType::withTrashed()->findOrFail($id);

            // Authorization check
            if (!$request->user()->hasRole('admin') && !$request->user()->hasRole('auditor')) {
                if ($serviceType->branch_id !== $request->user()->branch_id) {
                    abort(403, 'You can only restore service types from your branch.');
                }
            }

            if (!$serviceType->trashed()) {
                return redirect()->back()->with('error', 'Service type is not deleted.');
            }

            $name = $serviceType->name;
            $serviceType->restore();

            // Log activity
            $this->logRestored(
                module: 'Service Types',
                subject: $serviceType,
                description: "Restored service type: {$name}",
                properties: ['name' => $name, 'code' => $serviceType->code]
            );

            return redirect()
                ->route('service-types.index')
                ->with('success', 'Service type restored successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to restore service type. Please try again.');
        }
    }
}
