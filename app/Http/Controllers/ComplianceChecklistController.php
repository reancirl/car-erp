<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreComplianceChecklistRequest;
use App\Http\Requests\UpdateComplianceChecklistRequest;
use App\Models\Branch;
use App\Models\ComplianceChecklist;
use App\Models\ComplianceChecklistItem;
use App\Models\ComplianceChecklistTrigger;
use App\Models\User;
use App\Traits\LogsActivity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class ComplianceChecklistController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the compliance checklists.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $now = now();
        $weekAhead = $now->copy()->addDays(7);

        $query = ComplianceChecklist::with([
                'branch:id,name,code',
                'assignedUser:id,name,branch_id',
                'escalationUser:id,name',
            ])
            ->withCount('items')
            ->when($request->boolean('include_deleted'), fn($q) => $q->withTrashed())
            ->when(!$user->hasRole(['admin', 'auditor']) && $user->branch_id, fn($q) => $q->forBranch((int) $user->branch_id))
            ->when($request->branch_id && $user->hasRole(['admin', 'auditor']), fn($q) => $q->forBranch((int) $request->branch_id))
            ->when($request->search, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->status && $request->status !== 'all', fn($q, $status) => $q->where('status', $status))
            ->when($request->frequency_type && $request->frequency_type !== 'all', fn($q, $frequency) => $q->where('frequency_type', $frequency))
            ->when($request->assigned_user_id && $request->assigned_user_id !== 'all', fn($q, $assignedUserId) => $q->where('assigned_user_id', (int) $assignedUserId))
            ->when($request->due_from, fn($q, $dueFrom) => $q->whereDate('next_due_at', '>=', $dueFrom))
            ->when($request->due_to, fn($q, $dueTo) => $q->whereDate('next_due_at', '<=', $dueTo));

        $checklists = $query->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        $statsQuery = ComplianceChecklist::query()
            ->when($request->boolean('include_deleted'), fn($q) => $q->withTrashed())
            ->when(!$user->hasRole(['admin', 'auditor']) && $user->branch_id, fn($q) => $q->forBranch((int) $user->branch_id))
            ->when($request->branch_id && $user->hasRole(['admin', 'auditor']), fn($q) => $q->forBranch((int) $request->branch_id))
            ->when($request->status && $request->status !== 'all', fn($q, $status) => $q->where('status', $status))
            ->when($request->frequency_type && $request->frequency_type !== 'all', fn($q, $frequency) => $q->where('frequency_type', $frequency));

        $stats = [
            'total' => (clone $statsQuery)->when(!$request->boolean('include_deleted'), fn($q) => $q->whereNull('deleted_at'))->count(),
            'due_this_week' => (clone $statsQuery)
                ->whereBetween('next_due_at', [$now, $weekAhead])
                ->count(),
            'overdue' => (clone $statsQuery)
                ->whereNotNull('next_due_at')
                ->where('next_due_at', '<', $now)
                ->count(),
            'inactive' => (clone $statsQuery)
                ->where('status', ComplianceChecklist::STATUS_INACTIVE)
                ->count(),
        ];

        $filters = $request->only([
            'search',
            'status',
            'frequency_type',
            'assigned_user_id',
            'branch_id',
            'due_from',
            'due_to',
            'include_deleted',
        ]);

        $frequencyOptions = $this->frequencyOptions();
        $statusOptions = $this->statusOptions();

        $assignedUsers = User::query()
            ->select('id', 'name', 'branch_id')
            ->when(!$user->hasRole(['admin', 'auditor']), fn($q) => $q->where('branch_id', $user->branch_id))
            ->orderBy('name')
            ->get();

        return Inertia::render('compliance/checklists', [
            'checklists' => $checklists,
            'stats' => $stats,
            'filters' => $filters,
            'frequencyOptions' => $frequencyOptions,
            'statusOptions' => $statusOptions,
            'assignedUsers' => $assignedUsers,
            'branches' => $user->hasRole(['admin', 'auditor'])
                ? Branch::select('id', 'name', 'code')->where('status', 'active')->orderBy('name')->get()
                : null,
            'can' => [
                'create' => $user->can('compliance.manage_checklists'),
                'edit' => $user->can('compliance.manage_checklists'),
                'delete' => $user->can('compliance.manage_checklists'),
                'restore' => $user->can('compliance.manage_checklists'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new checklist.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        $assignedUsers = User::query()
            ->select('id', 'name', 'branch_id')
            ->when(!$user->hasRole(['admin', 'auditor']), fn($q) => $q->where('branch_id', $user->branch_id))
            ->orderBy('name')
            ->get();

        $roles = Role::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $categoryOptions = ComplianceChecklist::CATEGORY_OPTIONS;
        $frequencyOptions = $this->frequencyOptions();
        $channelOptions = $this->channelOptions();

        return Inertia::render('compliance/checklist-create', [
            'branches' => $user->hasRole(['admin', 'auditor'])
                ? Branch::select('id', 'name', 'code')->where('status', 'active')->orderBy('name')->get()
                : null,
            'assignedUsers' => $assignedUsers,
            'roles' => $roles,
            'categoryOptions' => $categoryOptions,
            'frequencyOptions' => $frequencyOptions,
            'channelOptions' => $channelOptions,
        ]);
    }

    /**
     * Store a newly created checklist in storage.
     */
    public function store(StoreComplianceChecklistRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $items = $data['items'] ?? [];
        $triggers = $data['triggers'] ?? [];

        unset($data['items'], $data['triggers']);

        $checklistInstance = new ComplianceChecklist($data);
        $data['next_due_at'] = $checklistInstance->calculateNextDueAt();

        $checklist = null;

        DB::transaction(function () use (&$checklist, $data, $items, $triggers) {
            /** @var \App\Models\ComplianceChecklist $checklist */
            $checklist = ComplianceChecklist::create($data);

            foreach ($items as $index => $itemData) {
                $checklist->items()->create([
                    'title' => $itemData['title'],
                    'description' => $itemData['description'] ?? null,
                    'is_required' => $itemData['is_required'] ?? true,
                    'is_active' => $itemData['is_active'] ?? true,
                    'sort_order' => $itemData['sort_order'] ?? $index,
                    'metadata' => $itemData['metadata'] ?? null,
                ]);
            }

            foreach ($triggers as $triggerData) {
                $checklist->triggers()->create([
                    'trigger_type' => $triggerData['trigger_type'],
                    'offset_hours' => $triggerData['offset_hours'],
                    'channels' => $triggerData['channels'] ?? [],
                    'escalate_to_user_id' => $triggerData['escalate_to_user_id'] ?? null,
                    'escalate_to_role' => $triggerData['escalate_to_role'] ?? null,
                    'is_active' => $triggerData['is_active'] ?? true,
                    'metadata' => $triggerData['metadata'] ?? null,
                ]);
            }
        });

        $this->logCreated(
            module: 'Compliance Checklists',
            subject: $checklist,
            description: "Created compliance checklist: {$checklist->title}",
            properties: [
                'frequency_type' => $checklist->frequency_type,
                'assigned_user_id' => $checklist->assigned_user_id,
                'items_count' => $checklist->items()->count(),
                'triggers_count' => $checklist->triggers()->count(),
            ]
        );

        return redirect()
            ->route('compliance.checklists.index')
            ->with('success', 'Compliance checklist created successfully!');
    }

    /**
     * Display the specified checklist.
     */
    public function show(Request $request, ComplianceChecklist $checklist): Response
    {
        $user = $request->user();

        if (!$user->hasRole(['admin', 'auditor']) && $checklist->branch_id !== $user->branch_id) {
            abort(403, 'You can only view checklists assigned to your branch.');
        }

        $checklist->load(['branch', 'assignedUser', 'escalationUser', 'items', 'triggers']);

        return Inertia::render('compliance/checklist-view', [
            'checklist' => $checklist,
            'can' => [
                'edit' => $user->can('compliance.manage_checklists'),
                'delete' => $user->can('compliance.manage_checklists'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified checklist.
     */
    public function edit(Request $request, ComplianceChecklist $checklist): Response
    {
        $user = $request->user();

        if (!$user->hasRole(['admin', 'auditor']) && $checklist->branch_id !== $user->branch_id) {
            abort(403, 'You can only edit checklists assigned to your branch.');
        }

        $checklist->load(['items', 'triggers']);

        $assignedUsers = User::query()
            ->select('id', 'name', 'branch_id')
            ->when(!$user->hasRole(['admin', 'auditor']), fn($q) => $q->where('branch_id', $user->branch_id))
            ->orderBy('name')
            ->get();

        $roles = Role::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $categoryOptions = ComplianceChecklist::CATEGORY_OPTIONS;
        $frequencyOptions = $this->frequencyOptions();
        $channelOptions = $this->channelOptions();

        return Inertia::render('compliance/checklist-edit', [
            'checklist' => $checklist,
            'branches' => $user->hasRole(['admin', 'auditor'])
                ? Branch::select('id', 'name', 'code')->where('status', 'active')->orderBy('name')->get()
                : null,
            'assignedUsers' => $assignedUsers,
            'roles' => $roles,
            'categoryOptions' => $categoryOptions,
            'frequencyOptions' => $frequencyOptions,
            'channelOptions' => $channelOptions,
        ]);
    }

    /**
     * Update the specified checklist in storage.
     */
    public function update(UpdateComplianceChecklistRequest $request, ComplianceChecklist $checklist): RedirectResponse
    {
        $user = $request->user();

        if (!$user->hasRole(['admin', 'auditor']) && $checklist->branch_id !== $user->branch_id) {
            abort(403, 'You can only update checklists assigned to your branch.');
        }

        $data = $request->validated();
        $itemsData = $data['items'] ?? [];
        $triggersData = $data['triggers'] ?? [];
        unset($data['items'], $data['triggers']);

        $stagingChecklist = new ComplianceChecklist(array_merge($checklist->toArray(), $data));
        $data['next_due_at'] = $stagingChecklist->calculateNextDueAt();

        $originalAttributes = $checklist->getAttributes();

        DB::transaction(function () use ($checklist, $data, $itemsData, $triggersData) {
            $checklist->update($data);

            $existingItems = $checklist->items()->get()->keyBy('id');
            $incomingItemIds = collect($itemsData)->pluck('id')->filter()->all();
            $itemsToDelete = $existingItems->keys()->diff($incomingItemIds);

            if ($itemsToDelete->isNotEmpty()) {
                ComplianceChecklistItem::whereIn('id', $itemsToDelete->all())->delete();
            }

            foreach ($itemsData as $index => $itemData) {
                $payload = [
                    'title' => $itemData['title'],
                    'description' => $itemData['description'] ?? null,
                    'is_required' => $itemData['is_required'] ?? true,
                    'is_active' => $itemData['is_active'] ?? true,
                    'sort_order' => $itemData['sort_order'] ?? $index,
                    'metadata' => $itemData['metadata'] ?? null,
                ];

                if (!empty($itemData['id']) && $existingItems->has($itemData['id'])) {
                    $existingItems[$itemData['id']]->update($payload);
                } else {
                    $checklist->items()->create($payload);
                }
            }

            $existingTriggers = $checklist->triggers()->get()->keyBy('id');
            $incomingTriggerIds = collect($triggersData)->pluck('id')->filter()->all();
            $triggersToDelete = $existingTriggers->keys()->diff($incomingTriggerIds);

            if ($triggersToDelete->isNotEmpty()) {
                ComplianceChecklistTrigger::whereIn('id', $triggersToDelete->all())->delete();
            }

            foreach ($triggersData as $triggerData) {
                $payload = [
                    'trigger_type' => $triggerData['trigger_type'],
                    'offset_hours' => $triggerData['offset_hours'],
                    'channels' => $triggerData['channels'] ?? [],
                    'escalate_to_user_id' => $triggerData['escalate_to_user_id'] ?? null,
                    'escalate_to_role' => $triggerData['escalate_to_role'] ?? null,
                    'is_active' => $triggerData['is_active'] ?? true,
                    'metadata' => $triggerData['metadata'] ?? null,
                ];

                if (!empty($triggerData['id']) && $existingTriggers->has($triggerData['id'])) {
                    $existingTriggers[$triggerData['id']]->update($payload);
                } else {
                    $checklist->triggers()->create($payload);
                }
            }
        });

        $changes = [];
        foreach ($data as $key => $value) {
            if (!array_key_exists($key, $originalAttributes)) {
                continue;
            }

            $originalValue = $originalAttributes[$key];

            if ($originalValue instanceof \DateTimeInterface) {
                $originalValue = $originalValue->format('Y-m-d H:i:s');
            }

            if ($value instanceof \DateTimeInterface) {
                $value = $value->format('Y-m-d H:i:s');
            }

            if ($originalValue != $value) {
                $changes[$key] = [
                    'old' => $originalValue,
                    'new' => $value,
                ];
            }
        }

        $this->logUpdated(
            module: 'Compliance Checklists',
            subject: $checklist,
            description: "Updated compliance checklist: {$checklist->title}",
            properties: [
                'changes' => $changes,
                'items_count' => $checklist->items()->count(),
                'triggers_count' => $checklist->triggers()->count(),
            ]
        );

        return redirect()
            ->route('compliance.checklists.edit', $checklist->id)
            ->with('success', 'Compliance checklist updated successfully!');
    }

    /**
     * Soft delete the specified checklist.
     */
    public function destroy(Request $request, ComplianceChecklist $checklist): RedirectResponse
    {
        $user = $request->user();

        if (!$user->can('compliance.manage_checklists')) {
            abort(403, 'You are not authorized to delete checklists.');
        }

        if (!$user->hasRole(['admin', 'auditor']) && $checklist->branch_id !== $user->branch_id) {
            abort(403, 'You can only delete checklists assigned to your branch.');
        }

        $title = $checklist->title;
        $checklist->delete();

        $this->logDeleted(
            module: 'Compliance Checklists',
            subject: $checklist,
            description: "Deleted compliance checklist: {$title}",
            properties: [
                'checklist_id' => $checklist->id,
            ]
        );

        return redirect()
            ->route('compliance.checklists.index')
            ->with('success', 'Checklist moved to archive successfully.');
    }

    /**
     * Restore a soft deleted checklist.
     */
    public function restore(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();

        if (!$user->can('compliance.manage_checklists')) {
            abort(403, 'You are not authorized to restore checklists.');
        }

        $checklist = ComplianceChecklist::withTrashed()->findOrFail($id);

        if (!$user->hasRole(['admin', 'auditor']) && $checklist->branch_id !== $user->branch_id) {
            abort(403, 'You can only restore checklists assigned to your branch.');
        }

        if (!$checklist->trashed()) {
            return redirect()
                ->route('compliance.checklists.index')
                ->with('info', 'Checklist is not archived.');
        }

        $checklist->restore();

        $this->logRestored(
            module: 'Compliance Checklists',
            subject: $checklist,
            description: "Restored compliance checklist: {$checklist->title}",
            properties: [
                'checklist_id' => $checklist->id,
            ]
        );

        return redirect()
            ->route('compliance.checklists.index')
            ->with('success', 'Checklist restored successfully.');
    }

    /**
     * Frequency option labels for the UI.
     *
     * @return array<int, array<string, string>>
     */
    private function frequencyOptions(): array
    {
        return [
            ['value' => ComplianceChecklist::FREQUENCY_DAILY, 'label' => 'Daily'],
            ['value' => ComplianceChecklist::FREQUENCY_WEEKLY, 'label' => 'Weekly'],
            ['value' => ComplianceChecklist::FREQUENCY_MONTHLY, 'label' => 'Monthly'],
            ['value' => ComplianceChecklist::FREQUENCY_QUARTERLY, 'label' => 'Quarterly'],
            ['value' => ComplianceChecklist::FREQUENCY_YEARLY, 'label' => 'Yearly'],
            ['value' => ComplianceChecklist::FREQUENCY_CUSTOM, 'label' => 'Custom'],
        ];
    }

    /**
     * Status options for dropdowns.
     *
     * @return array<int, array<string, string>>
     */
    private function statusOptions(): array
    {
        return [
            ['value' => ComplianceChecklist::STATUS_ACTIVE, 'label' => 'Active'],
            ['value' => ComplianceChecklist::STATUS_INACTIVE, 'label' => 'Inactive'],
            ['value' => ComplianceChecklist::STATUS_ARCHIVED, 'label' => 'Archived'],
        ];
    }

    /**
     * Reminder channel options supported.
     *
     * @return array<int, array<string, string>>
     */
    private function channelOptions(): array
    {
        return [
            ['value' => 'in_app', 'label' => 'In-App'],
            ['value' => 'email', 'label' => 'Email'],
            ['value' => 'sms', 'label' => 'SMS'],
        ];
    }
}
