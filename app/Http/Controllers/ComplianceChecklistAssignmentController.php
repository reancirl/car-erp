<?php

namespace App\Http\Controllers;

use App\Models\ComplianceChecklistAssignment;
use App\Models\ComplianceChecklistAssignmentItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComplianceChecklistAssignmentController extends Controller
{
    public function toggleItem(
        Request $request,
        ComplianceChecklistAssignment $assignment,
        ComplianceChecklistAssignmentItem $assignmentItem
    ): JsonResponse {
        $user = $request->user();

        if ($assignment->user_id !== $user->id) {
            abort(403, 'You are not authorized to update this checklist.');
        }

        if ($assignmentItem->assignment_id !== $assignment->id) {
            abort(404, 'Checklist item not found for this assignment.');
        }

        $validated = $request->validate([
            'is_completed' => ['required', 'boolean'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $isCompleted = (bool) $validated['is_completed'];

        $assignmentItem->is_completed = $isCompleted;
        $assignmentItem->completed_at = $isCompleted ? now() : null;
        $assignmentItem->completed_by = $isCompleted ? $user->id : null;
        $assignmentItem->notes = $validated['notes'] ?? $assignmentItem->notes;
        $assignmentItem->save();

        $assignment->last_interaction_at = now();
        $assignment->started_at ??= now();

        $totalItems = max(1, $assignment->items()->count());
        $completedItems = $assignment->items()->where('is_completed', true)->count();
        $progressPercentage = (int) round(($completedItems / $totalItems) * 100);

        $assignment->progress_percentage = $progressPercentage;

        if ($completedItems >= $totalItems) {
            $assignment->status = 'completed';
            $assignment->completed_at = now();
        } elseif ($completedItems > 0) {
            $assignment->status = 'in_progress';
            $assignment->completed_at = null;
        } else {
            $assignment->status = 'pending';
            $assignment->completed_at = null;
        }

        $assignment->save();

        return response()->json([
            'assignment_id' => $assignment->id,
            'assignment_item_id' => $assignmentItem->id,
            'is_completed' => $assignmentItem->is_completed,
            'progress_percentage' => $assignment->progress_percentage,
            'status' => $assignment->status,
        ]);
    }
}
