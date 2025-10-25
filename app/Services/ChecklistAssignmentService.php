<?php

namespace App\Services;

use App\Models\ComplianceChecklist;
use App\Models\ComplianceChecklistAssignment;
use App\Models\ComplianceChecklistAssignmentItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;

class ChecklistAssignmentService
{
    /**
     * Build a collection of checklist assignments tailored for the provided user.
     */
    public function assignmentsForUser(User $user, ?int $limit = null): Collection
    {
        $roleNames = $user->roles?->pluck('name')->filter()->values() ?? collect();

        $query = ComplianceChecklist::with([
                'items' => fn($query) => $query->orderBy('sort_order')->orderBy('id'),
                'branch',
            ])
            ->whereNull('deleted_at')
            ->where('status', '!=', ComplianceChecklist::STATUS_ARCHIVED)
            ->where(function ($innerQuery) use ($user, $roleNames) {
                $innerQuery->where('assigned_user_id', $user->id);

                if ($roleNames->isNotEmpty()) {
                    $innerQuery->orWhereIn('assigned_role', $roleNames);
                }

                if ($user->branch_id) {
                    $innerQuery->orWhere('branch_id', $user->branch_id);
                }
            })
            ->orderBy('next_due_at');

        if ($limit) {
            $query->limit($limit);
        }

        /** @var EloquentCollection<int, ComplianceChecklist> $checklists */
        $checklists = $query->get();

        return $checklists->map(fn(ComplianceChecklist $checklist) => $this->transformChecklist($checklist, $user));
    }

    /**
     * Convert a checklist into an assignment payload while ensuring data consistency.
     */
    protected function transformChecklist(ComplianceChecklist $checklist, User $user): array
    {
        $assignment = ComplianceChecklistAssignment::firstOrCreate(
            [
                'compliance_checklist_id' => $checklist->id,
                'user_id' => $user->id,
            ],
            [
                'branch_id' => $checklist->branch_id ?? $user->branch_id,
                'status' => 'pending',
                'progress_percentage' => 0,
            ]
        );

        if (!$assignment->branch_id && $checklist->branch_id) {
            $assignment->branch_id = $checklist->branch_id;
            $assignment->save();
        }

        $assignmentItems = $this->syncAssignmentItems($assignment, $checklist);

        $totalItems = max(1, $assignmentItems->count());
        $completedItems = $assignmentItems->where('is_completed', true)->count();
        $progressPercentage = (int) round(($completedItems / $totalItems) * 100);

        if ($assignment->progress_percentage !== $progressPercentage) {
            $assignment->progress_percentage = $progressPercentage;

            if ($completedItems >= $totalItems) {
                $assignment->status = 'completed';
                $assignment->completed_at ??= now();
            } elseif ($completedItems > 0 && $assignment->status === 'pending') {
                $assignment->status = 'in_progress';
                $assignment->completed_at = null;
            } elseif ($completedItems === 0) {
                $assignment->status = 'pending';
                $assignment->completed_at = null;
            }

            $assignment->save();
        }

        return [
            'id' => $checklist->id,
            'assignment_id' => $assignment->id,
            'title' => $checklist->title,
            'frequency' => ucfirst($checklist->frequency_type),
            'due_at' => optional($checklist->next_due_at)->toIso8601String(),
            'branch' => optional($checklist->branch)?->name,
            'status' => $assignment->status,
            'progress_percentage' => $assignment->progress_percentage,
            'items' => $checklist->items->map(function ($item) use ($assignmentItems) {
                $assignmentItem = $assignmentItems->get($item->id);

                return [
                    'id' => $item->id,
                    'label' => $item->title,
                    'assignment_item_id' => $assignmentItem?->id,
                    'is_completed' => (bool) ($assignmentItem?->is_completed ?? false),
                ];
            })->values(),
        ];
    }

    /**
     * Ensure assignment items are synchronized with latest checklist definition.
     */
    protected function syncAssignmentItems(ComplianceChecklistAssignment $assignment, ComplianceChecklist $checklist): Collection
    {
        $assignmentItems = $assignment->items()->with('checklistItem')->get()->keyBy('checklist_item_id');
        $checklistItems = $checklist->items ?? collect();

        foreach ($checklistItems as $item) {
            if (!$assignmentItems->has($item->id)) {
                $assignmentItems->put(
                    $item->id,
                    ComplianceChecklistAssignmentItem::create([
                        'assignment_id' => $assignment->id,
                        'checklist_item_id' => $item->id,
                    ])
                );
            }
        }

        return $assignment->items()->with('checklistItem')->get()->keyBy('checklist_item_id');
    }
}
