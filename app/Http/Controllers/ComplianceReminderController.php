<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreComplianceReminderRequest;
use App\Http\Requests\UpdateComplianceReminderRequest;
use App\Models\Branch;
use App\Models\ComplianceChecklist;
use App\Models\ComplianceReminder;
use App\Models\User;
use App\Traits\LogsActivity;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ComplianceReminderController extends Controller
{
    use LogsActivity;

    public function index(Request $request): Response
    {
        $user = $request->user();
        $branchFilter = $request->branch_id;
        $shouldFilterByBranch = $user->hasRole(['admin', 'auditor']) && $branchFilter && $branchFilter !== 'all';

        $query = ComplianceReminder::with([
                'branch:id,name,code',
                'checklist:id,title',
                'assignment:id,compliance_checklist_id,user_id,status',
                'assignedUser:id,name',
                'escalateToUser:id,name',
            ])
            ->when($request->boolean('include_deleted'), fn($q) => $q->withTrashed())
            ->when($shouldFilterByBranch, function ($q) use ($branchFilter) {
                return $q->withoutBranchScope()->where('branch_id', (int) $branchFilter);
            })
            ->when($request->search, function ($q, $search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->status && $request->status !== 'all', fn($q, $status) => $q->where('status', $status))
            ->when($request->priority && $request->priority !== 'all', fn($q, $priority) => $q->where('priority', $priority))
            ->when($request->reminder_type && $request->reminder_type !== 'all', fn($q, $type) => $q->where('reminder_type', $type))
            ->when($request->delivery_channel && $request->delivery_channel !== 'all', fn($q, $channel) => $q->where('delivery_channel', $channel))
            ->when($request->assigned_user_id && $request->assigned_user_id !== 'all', fn($q, $assignedId) => $q->where('assigned_user_id', (int) $assignedId))
            ->when($request->remind_from, fn($q, $from) => $q->whereDate('remind_at', '>=', $from))
            ->when($request->remind_to, fn($q, $to) => $q->whereDate('remind_at', '<=', $to));

        $reminders = $query->orderByDesc('remind_at')
            ->paginate(15)
            ->withQueryString();

        $baseStatsQuery = ComplianceReminder::query()
            ->when($request->boolean('include_deleted'), fn($q) => $q->withTrashed())
            ->when($shouldFilterByBranch, function ($q) use ($branchFilter) {
                return $q->withoutBranchScope()->where('branch_id', (int) $branchFilter);
            });

        $now = now();
        $stats = [
            'total' => (clone $baseStatsQuery)->count(),
            'due_today' => (clone $baseStatsQuery)->whereDate('remind_at', $now->toDateString())->count(),
            'triggered' => (clone $baseStatsQuery)->where('status', ComplianceReminder::STATUS_SENT)->count(),
            'escalated' => (clone $baseStatsQuery)->where('status', ComplianceReminder::STATUS_ESCALATED)->count(),
            'overdue' => (clone $baseStatsQuery)
                ->where(function ($q) use ($now) {
                    $q->whereIn('status', [ComplianceReminder::STATUS_SCHEDULED, ComplianceReminder::STATUS_PENDING])
                        ->where('remind_at', '<', $now);
                })
                ->count(),
        ];

        $filters = $request->only([
            'search',
            'status',
            'priority',
            'reminder_type',
            'delivery_channel',
            'assigned_user_id',
            'branch_id',
            'remind_from',
            'remind_to',
            'include_deleted',
        ]);
        $filters['include_deleted'] = $request->boolean('include_deleted');

        return Inertia::render('compliance/reminders', [
            'reminders' => $reminders,
            'stats' => $stats,
            'filters' => $filters,
            'statusOptions' => $this->statusOptions(),
            'priorityOptions' => $this->priorityOptions(),
            'typeOptions' => $this->typeOptions(),
            'channelOptions' => $this->channelOptions(),
            'channelFilterOptions' => $this->channelFilterOptions(),
            'assignedUsers' => User::select('id', 'name')
                ->when(!$user->hasRole(['admin', 'auditor']), fn($q) => $q->where('branch_id', $user->branch_id))
                ->orderBy('name')
                ->get(),
            'branches' => $user->hasRole(['admin', 'auditor'])
                ? Branch::select('id', 'name', 'code')->where('status', 'active')->orderBy('name')->get()
                : null,
            'can' => [
                'create' => $user->can('compliance.manage_reminders'),
                'edit' => $user->can('compliance.manage_reminders'),
                'delete' => $user->can('compliance.manage_reminders'),
                'restore' => $user->can('compliance.manage_reminders'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('compliance/reminder-create', [
            'branches' => $user->hasRole(['admin', 'auditor'])
                ? Branch::select('id', 'name', 'code')->where('status', 'active')->orderBy('name')->get()
                : null,
            'checklists' => ComplianceChecklist::select('id', 'title')->orderBy('title')->get(),
            'assignedUsers' => User::select('id', 'name')->orderBy('name')->get(),
            'statusOptions' => $this->statusOptions(),
            'priorityOptions' => $this->priorityOptions(),
            'typeOptions' => $this->typeOptions(),
            'channelOptions' => $this->channelOptions(),
        ]);
    }

    public function store(StoreComplianceReminderRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['status'] = $data['status'] ?? ($this->isPastReminder($data['remind_at']) ? ComplianceReminder::STATUS_PENDING : ComplianceReminder::STATUS_SCHEDULED);
        $data['delivery_channels'] = $this->normalizeDeliveryChannels($data);

        $reminder = ComplianceReminder::create($data);

        $this->logCreated('Compliance Reminders', $reminder, sprintf('Created reminder "%s"', $reminder->title));

        return redirect()
            ->route('compliance.reminders.index')
            ->with('success', 'Reminder created successfully!');
    }

    public function show(Request $request, ComplianceReminder $reminder): Response
    {
        $reminder->loadMissing(['branch', 'checklist', 'assignment', 'assignedUser', 'escalateToUser', 'events']);

        return Inertia::render('compliance/reminder-view', [
            'reminder' => $reminder,
            'statusOptions' => $this->statusOptions(),
            'priorityOptions' => $this->priorityOptions(),
            'typeOptions' => $this->typeOptions(),
            'channelOptions' => $this->channelOptions(),
            'can' => [
                'edit' => $request->user()->can('compliance.manage_reminders'),
                'delete' => $request->user()->can('compliance.manage_reminders'),
                'restore' => $request->user()->can('compliance.manage_reminders'),
            ],
        ]);
    }

    public function edit(Request $request, ComplianceReminder $reminder): Response
    {
        $user = $request->user();

        $reminder->load(['branch', 'checklist', 'assignment', 'assignedUser', 'escalateToUser']);

        return Inertia::render('compliance/reminder-edit', [
            'reminder' => $reminder,
            'branches' => $user->hasRole(['admin', 'auditor'])
                ? Branch::select('id', 'name', 'code')->where('status', 'active')->orderBy('name')->get()
                : null,
            'checklists' => ComplianceChecklist::select('id', 'title')->orderBy('title')->get(),
            'assignedUsers' => User::select('id', 'name')->orderBy('name')->get(),
            'statusOptions' => $this->statusOptions(),
            'priorityOptions' => $this->priorityOptions(),
            'typeOptions' => $this->typeOptions(),
            'channelOptions' => $this->channelOptions(),
        ]);
    }

    public function update(UpdateComplianceReminderRequest $request, ComplianceReminder $reminder): RedirectResponse
    {
        $data = $request->validated();
        $data['delivery_channels'] = $this->normalizeDeliveryChannels($data);

        DB::transaction(function () use ($reminder, $data) {
            $reminder->update($data);

            if ($reminder->status === ComplianceReminder::STATUS_SCHEDULED && $reminder->remind_at && $reminder->remind_at->lessThan(now())) {
                $reminder->status = ComplianceReminder::STATUS_PENDING;
                $reminder->save();
            }
        });

        $this->logUpdated('Compliance Reminders', $reminder, sprintf('Updated reminder "%s"', $reminder->title));

        return redirect()
            ->route('compliance.reminders.show', $reminder)
            ->with('success', 'Reminder updated successfully!');
    }

    public function destroy(ComplianceReminder $reminder): RedirectResponse
    {
        $reminder->delete();

        $this->logDeleted('Compliance Reminders', $reminder, sprintf('Deleted reminder "%s"', $reminder->title));

        return redirect()
            ->route('compliance.reminders.index')
            ->with('success', 'Reminder archived successfully!');
    }

    public function restore(int $id): RedirectResponse
    {
        $reminder = ComplianceReminder::withTrashed()->findOrFail($id);

        if (!$reminder->trashed()) {
            return redirect()->route('compliance.reminders.index')->with('info', 'Reminder is already active.');
        }

        $reminder->restore();

        $this->logRestored('Compliance Reminders', $reminder, sprintf('Restored reminder "%s"', $reminder->title));

        return redirect()
            ->route('compliance.reminders.index')
            ->with('success', 'Reminder restored successfully!');
    }

    protected function statusOptions(): array
    {
        return collect(ComplianceReminder::STATUSES)
            ->map(fn($value) => ['value' => $value, 'label' => ucwords(str_replace('_', ' ', $value))])
            ->prepend(['value' => 'all', 'label' => 'All Statuses'])
            ->values()
            ->all();
    }

    protected function priorityOptions(): array
    {
        return collect(ComplianceReminder::PRIORITIES)
            ->map(fn($value) => ['value' => $value, 'label' => ucfirst($value)])
            ->prepend(['value' => 'all', 'label' => 'All Priorities'])
            ->values()
            ->all();
    }

    protected function typeOptions(): array
    {
        return collect(ComplianceReminder::TYPES)
            ->map(fn($value) => ['value' => $value, 'label' => ucwords(str_replace('_', ' ', $value))])
            ->prepend(['value' => 'all', 'label' => 'All Types'])
            ->values()
            ->all();
    }

    protected function channelOptions(): array
    {
        return collect(ComplianceReminder::CHANNELS)
            ->map(fn($value) => ['value' => $value, 'label' => strtoupper(str_replace('_', ' ', $value))])
            ->values()
            ->all();
    }

    protected function channelFilterOptions(): array
    {
        return array_merge([
            ['value' => 'all', 'label' => 'All Channels'],
        ], $this->channelOptions());
    }

    protected function normalizeDeliveryChannels(array $data): array
    {
        $channels = collect($data['delivery_channels'] ?? [])
            ->filter(fn($channel) => in_array($channel, ComplianceReminder::CHANNELS, true))
            ->values();

        if ($channels->isEmpty()) {
            $channels->push($data['delivery_channel']);
        }

        return $channels->unique()->values()->all();
    }

    protected function isPastReminder($remindAt): bool
    {
        if (!$remindAt) {
            return false;
        }

        $reference = Carbon::parse($remindAt);

        return now()->greaterThan($reference);
    }
}
