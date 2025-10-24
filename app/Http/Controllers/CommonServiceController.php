<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommonServiceRequest;
use App\Http\Requests\UpdateCommonServiceRequest;
use App\Models\Branch;
use App\Models\CommonService;
use App\Models\ServiceType;
use App\Traits\LogsActivity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommonServiceController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the common services.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = CommonService::with(['branch', 'creator'])
            ->when($request->boolean('include_deleted'), fn($q) => $q->withTrashed())
            ->when(
                ! $user->hasRole(['admin', 'auditor']),
                fn($q) => $q->forUserBranch($user)
            )
            ->when(
                $request->filled('branch_id') && $user->hasRole(['admin', 'auditor']),
                fn($q) => $q->where('branch_id', $request->integer('branch_id'))
            )
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->string('search');
                $q->where(function ($subQuery) use ($search) {
                    $subQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('category') && $request->category !== 'all', fn($q) => $q->where('category', $request->category))
            ->when($request->filled('status') && $request->status !== 'all', function ($q) use ($request) {
                if ($request->status === 'active') {
                    $q->where('is_active', true);
                } elseif ($request->status === 'inactive') {
                    $q->where('is_active', false);
                }
            });

        $commonServices = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Build statistics scoped by branch visibility
        $statsQuery = CommonService::query()
            ->when(
                ! $user->hasRole(['admin', 'auditor']),
                fn($q) => $q->forUserBranch($user)
            )
            ->when(
                $request->filled('branch_id') && $user->hasRole(['admin', 'auditor']),
                fn($q) => $q->where('branch_id', $request->integer('branch_id'))
            );

        $stats = [
            'total_services' => (clone $statsQuery)->count(),
            'active_services' => (clone $statsQuery)->where('is_active', true)->count(),
            'inactive_services' => (clone $statsQuery)->where('is_active', false)->count(),
            'average_price' => round((float) ((clone $statsQuery)->avg('standard_price') ?? 0), 2),
            'total_standard_price' => round((float) (clone $statsQuery)->sum('standard_price'), 2),
        ];

        $categoryBreakdown = (clone $statsQuery)
            ->selectRaw('category, COUNT(*) as count')
            ->groupBy('category')
            ->pluck('count', 'category')
            ->toArray();

        $filters = $request->only([
            'search',
            'category',
            'status',
            'branch_id',
            'include_deleted',
        ]);

        return Inertia::render('service/common-services', [
            'commonServices' => $commonServices,
            'stats' => $stats,
            'categoryStats' => $categoryBreakdown,
            'filters' => $filters,
            'branches' => ($user->hasRole(['admin', 'auditor']))
                ? Branch::where('status', 'active')->orderBy('name')->get()
                : null,
            'meta' => [
                'categories' => CommonService::CATEGORIES,
            ],
            'can' => [
                'create' => $user->can('common-services.create'),
                'edit' => $user->can('common-services.edit'),
                'delete' => $user->can('common-services.delete'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new common service.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('service/common-service-create', [
            'branches' => ($user->hasRole(['admin', 'auditor']))
                ? Branch::where('status', 'active')->orderBy('name')->get()
                : null,
            'serviceTypes' => ServiceType::query()
                ->select('id', 'name', 'code', 'branch_id')
                ->when(
                    ! $user->hasRole(['admin', 'auditor']),
                    fn($q) => $q->forUserBranch($user)
                )
                ->orderBy('name')
                ->get(),
            'meta' => [
                'categories' => CommonService::CATEGORIES,
                'default_currency' => 'PHP',
            ],
        ]);
    }

    /**
     * Store a newly created common service in storage.
     */
    public function store(StoreCommonServiceRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $serviceTypeIds = $data['service_type_ids'] ?? [];
        unset($data['service_type_ids']);

        $data['currency'] = $data['currency'] ?? 'PHP';
        $data['is_active'] = $data['is_active'] ?? true;

        $commonService = CommonService::create($data);

        if (!empty($serviceTypeIds)) {
            $commonService->serviceTypes()->sync($serviceTypeIds);
        }

        $this->logCreated(
            module: 'Common Services',
            subject: $commonService,
            description: "Created common service: {$commonService->name}",
            properties: [
                'code' => $commonService->code,
                'category' => $commonService->category,
                'branch_id' => $commonService->branch_id,
                'service_types_count' => count($serviceTypeIds),
            ]
        );

        return redirect()
            ->route('common-services.index')
            ->with('success', 'Common service created successfully!');
    }

    /**
     * Display the specified common service.
     */
    public function show(Request $request, CommonService $commonService): Response
    {
        $user = $request->user();

        if (! $user->hasRole(['admin', 'auditor']) && $commonService->branch_id !== $user->branch_id) {
            abort(403, 'You can only view common services from your branch.');
        }

        $commonService->load([
            'branch',
            'creator',
            'updater',
            'serviceTypes' => fn($query) => $query->select('service_types.id', 'name', 'code'),
        ]);

        $serviceTypeUsage = $commonService->serviceTypes->count();

        return Inertia::render('service/common-service-view', [
            'commonService' => $commonService,
            'overview' => [
                'service_type_usage' => $serviceTypeUsage,
                'is_active' => $commonService->is_active,
            ],
            'can' => [
                'edit' => $user->can('common-services.edit'),
                'delete' => $user->can('common-services.delete'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified common service.
     */
    public function edit(Request $request, CommonService $commonService): Response
    {
        $user = $request->user();

        if (! $user->hasRole(['admin', 'auditor']) && $commonService->branch_id !== $user->branch_id) {
            abort(403, 'You can only edit common services from your branch.');
        }

        $commonService->load('serviceTypes:id');

        return Inertia::render('service/common-service-edit', [
            'commonService' => $commonService,
            'serviceTypes' => ServiceType::query()
                ->select('id', 'name', 'code', 'branch_id')
                ->when(
                    ! $user->hasRole(['admin', 'auditor']),
                    fn($q) => $q->forUserBranch($user)
                )
                ->orderBy('name')
                ->get(),
            'branches' => ($user->hasRole(['admin', 'auditor']))
                ? Branch::where('status', 'active')->orderBy('name')->get()
                : null,
            'meta' => [
                'categories' => CommonService::CATEGORIES,
            ],
        ]);
    }

    /**
     * Update the specified common service in storage.
     */
    public function update(UpdateCommonServiceRequest $request, CommonService $commonService): RedirectResponse
    {
        $data = $request->validated();
        $serviceTypeIds = $data['service_type_ids'] ?? [];
        unset($data['service_type_ids']);

        $changes = [];
        foreach ($data as $key => $value) {
            if ($commonService->{$key} != $value) {
                $changes[$key] = [
                    'old' => $commonService->{$key},
                    'new' => $value,
                ];
            }
        }

        $commonService->update($data);
        $commonService->serviceTypes()->sync($serviceTypeIds);

        $this->logUpdated(
            module: 'Common Services',
            subject: $commonService,
            description: "Updated common service: {$commonService->name}",
            properties: [
                'changes' => $changes,
                'service_types_count' => count($serviceTypeIds),
            ]
        );

        return redirect()
            ->route('common-services.index')
            ->with('success', 'Common service updated successfully!');
    }

    /**
     * Remove the specified common service from storage.
     */
    public function destroy(Request $request, CommonService $commonService): RedirectResponse
    {
        $user = $request->user();

        if (! $user->hasRole(['admin', 'auditor']) && $commonService->branch_id !== $user->branch_id) {
            abort(403, 'You can only delete common services from your branch.');
        }

        $name = $commonService->name;

        $this->logDeleted(
            module: 'Common Services',
            subject: $commonService,
            description: "Deleted common service: {$name}",
            properties: ['name' => $name]
        );

        $commonService->delete();

        return redirect()
            ->route('common-services.index')
            ->with('success', 'Common service deleted successfully!');
    }

    /**
     * Restore a soft-deleted common service.
     */
    public function restore(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();

        $commonService = CommonService::withTrashed()->findOrFail($id);

        if (! $user->hasRole(['admin', 'auditor']) && $commonService->branch_id !== $user->branch_id) {
            abort(403, 'You can only restore common services from your branch.');
        }

        if (! $commonService->trashed()) {
            return redirect()
                ->back()
                ->with('error', 'Common service is not deleted.');
        }

        $commonService->restore();

        $this->logRestored(
            module: 'Common Services',
            subject: $commonService,
            description: "Restored common service: {$commonService->name}",
            properties: ['name' => $commonService->name]
        );

        return redirect()
            ->route('common-services.index')
            ->with('success', 'Common service restored successfully!');
    }
}
