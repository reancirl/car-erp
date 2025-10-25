<?php

namespace App\Http\Controllers;

use App\Models\ComplianceReminder;
use App\Models\User;
use App\Services\ChecklistAssignmentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChecklistReminderCenterController extends Controller
{
    public function __invoke(Request $request, ChecklistAssignmentService $assignmentService): Response
    {
        $user = $request->user();

        return Inertia::render('checklists-reminders', [
            'assignedChecklists' => $assignmentService->assignmentsForUser($user)->values(),
            'assignedReminders' => $this->remindersForUser($user),
        ]);
    }

    protected function remindersForUser(User $user)
    {
        $roleNames = $user->roles?->pluck('name')->filter()->values() ?? collect();

        return ComplianceReminder::with(['branch:id,name', 'checklist:id,title'])
            ->whereNull('deleted_at')
            ->where(function ($query) use ($user, $roleNames) {
                $query->where('assigned_user_id', $user->id);

                if ($roleNames->isNotEmpty()) {
                    $query->orWhereIn('assigned_role', $roleNames);
                }

                if ($user->branch_id) {
                    $query->orWhere(function ($inner) use ($user) {
                        $inner->whereNull('assigned_user_id')
                            ->where('branch_id', $user->branch_id);
                    });
                }
            })
            ->orderBy('remind_at')
            ->limit(25)
            ->get()
            ->map(function (ComplianceReminder $reminder) {
                return [
                    'id' => $reminder->id,
                    'title' => $reminder->title,
                    'reminder_type' => $reminder->reminder_type,
                    'priority' => $reminder->priority,
                    'remind_at' => optional($reminder->remind_at)->toIso8601String(),
                    'due_at' => optional($reminder->due_at)->toIso8601String(),
                    'status' => $reminder->status,
                    'delivery_channel' => $reminder->delivery_channel,
                    'branch' => optional($reminder->branch)?->name,
                    'checklist' => optional($reminder->checklist)?->only(['id', 'title']),
                ];
            })
            ->values();
    }
}
