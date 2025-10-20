<?php

namespace App\Services;

use App\Models\Pipeline;
use App\Models\Lead;
use Illuminate\Support\Facades\Log;

class PipelineAutoProgressionService
{
    /**
     * Auto-create pipeline when lead is qualified (lead_score >= 70)
     */
    public function createPipelineFromQualifiedLead(Lead $lead): ?Pipeline
    {
        // Check if lead score is >= 70
        if ($lead->lead_score < 70) {
            return null;
        }

        // Check if pipeline already exists for this lead
        $existingPipeline = Pipeline::where('lead_id', $lead->id)->first();
        if ($existingPipeline) {
            Log::info("Pipeline already exists for lead {$lead->lead_id}");
            return $existingPipeline;
        }

        // Create new pipeline from lead
        $pipeline = Pipeline::create([
            'branch_id' => $lead->branch_id,
            'lead_id' => $lead->id,
            'customer_name' => $lead->name,
            'customer_phone' => $lead->phone,
            'customer_email' => $lead->email,
            'sales_rep_id' => $lead->assigned_to,
            'vehicle_interest' => $lead->vehicle_interest,
            'current_stage' => 'qualified',
            'priority' => $lead->priority,
            'lead_score' => $lead->lead_score,
            'auto_progression_enabled' => true,
            'auto_loss_rule_enabled' => true,
        ]);

        // Log the auto-progression
        $pipeline->logStageChange(
            stage: 'qualified',
            previousStage: 'lead',
            triggerType: 'auto',
            triggerSystem: 'Lead Management',
            triggerEvent: 'Lead Qualified (Score >= 70)',
            triggerUserId: $lead->assigned_to,
            properties: [
                'lead_id' => $lead->lead_id,
                'lead_score' => $lead->lead_score,
                'auto_created' => true,
            ]
        );

        Log::info("Auto-created pipeline {$pipeline->pipeline_id} from qualified lead {$lead->lead_id}");

        return $pipeline;
    }

    /**
     * Auto-advance pipeline from Qualified to Quote Sent when quote is generated
     */
    public function advanceToQuoteSent(Pipeline $pipeline, array $quoteData = []): bool
    {
        if (!$pipeline->auto_progression_enabled) {
            return false;
        }

        if ($pipeline->current_stage !== 'qualified') {
            Log::warning("Cannot advance pipeline {$pipeline->pipeline_id} to quote_sent - current stage is {$pipeline->current_stage}");
            return false;
        }

        $pipeline->update([
            'current_stage' => 'quote_sent',
            'quote_amount' => $quoteData['quote_amount'] ?? $pipeline->quote_amount,
            'probability' => 60, // Increase probability when quote is sent
        ]);

        // Log the auto-progression
        $pipeline->logStageChange(
            stage: 'quote_sent',
            previousStage: 'qualified',
            triggerType: 'auto',
            triggerSystem: 'Quote System',
            triggerEvent: 'Quote Generated',
            triggerUserId: auth()->id(),
            properties: array_merge([
                'auto_advanced' => true,
                'quote_amount' => $pipeline->quote_amount,
            ], $quoteData)
        );

        Log::info("Auto-advanced pipeline {$pipeline->pipeline_id} to quote_sent");

        return true;
    }

    /**
     * Auto-advance pipeline from Test Drive to Reservation when reservation is created
     */
    public function advanceToReservation(Pipeline $pipeline, array $reservationData = []): bool
    {
        if (!$pipeline->auto_progression_enabled) {
            return false;
        }

        // Can advance from test_drive_scheduled or test_drive_completed
        if (!in_array($pipeline->current_stage, ['test_drive_scheduled', 'test_drive_completed'])) {
            Log::warning("Cannot advance pipeline {$pipeline->pipeline_id} to reservation_made - current stage is {$pipeline->current_stage}");
            return false;
        }

        $pipeline->update([
            'current_stage' => 'reservation_made',
            'probability' => 85, // High probability when reservation is made
        ]);

        // Log the auto-progression
        $pipeline->logStageChange(
            stage: 'reservation_made',
            previousStage: $pipeline->previous_stage,
            triggerType: 'auto',
            triggerSystem: 'Test Drive System',
            triggerEvent: 'Reservation Created',
            triggerUserId: auth()->id(),
            properties: array_merge([
                'auto_advanced' => true,
            ], $reservationData)
        );

        Log::info("Auto-advanced pipeline {$pipeline->pipeline_id} to reservation_made");

        return true;
    }

    /**
     * Auto-advance pipeline when test drive is scheduled
     */
    public function advanceToTestDriveScheduled(Pipeline $pipeline, array $testDriveData = []): bool
    {
        if (!$pipeline->auto_progression_enabled) {
            return false;
        }

        // Can advance from quote_sent or qualified
        if (!in_array($pipeline->current_stage, ['quote_sent', 'qualified'])) {
            Log::warning("Cannot advance pipeline {$pipeline->pipeline_id} to test_drive_scheduled - current stage is {$pipeline->current_stage}");
            return false;
        }

        $pipeline->update([
            'current_stage' => 'test_drive_scheduled',
            'probability' => 70, // Increase probability when test drive is scheduled
        ]);

        // Log the auto-progression
        $pipeline->logStageChange(
            stage: 'test_drive_scheduled',
            previousStage: $pipeline->previous_stage,
            triggerType: 'auto',
            triggerSystem: 'Test Drive System',
            triggerEvent: 'Test Drive Scheduled',
            triggerUserId: auth()->id(),
            properties: array_merge([
                'auto_advanced' => true,
            ], $testDriveData)
        );

        Log::info("Auto-advanced pipeline {$pipeline->pipeline_id} to test_drive_scheduled");

        return true;
    }

    /**
     * Mark pipelines as lost after 7 days of inactivity
     */
    public function detectAndMarkInactivePipelines(): array
    {
        $inactivityThreshold = now()->subDays(7);
        
        $inactivePipelines = Pipeline::query()
            ->where('auto_loss_rule_enabled', true)
            ->whereNotIn('current_stage', ['lost', 'won'])
            ->where(function ($query) use ($inactivityThreshold) {
                $query->where('last_activity_at', '<', $inactivityThreshold)
                    ->orWhereNull('last_activity_at');
            })
            ->get();

        $markedCount = 0;
        $results = [];

        foreach ($inactivePipelines as $pipeline) {
            $daysInactive = $pipeline->last_activity_at 
                ? now()->diffInDays($pipeline->last_activity_at)
                : now()->diffInDays($pipeline->created_at);

            $pipeline->update([
                'current_stage' => 'lost',
                'probability' => 0,
            ]);

            // Log the auto-loss detection
            $pipeline->logStageChange(
                stage: 'lost',
                previousStage: $pipeline->previous_stage,
                triggerType: 'auto',
                triggerSystem: 'Auto-Loss Detection',
                triggerEvent: 'Inactivity Detected',
                triggerUserId: null,
                properties: [
                    'days_inactive' => $daysInactive,
                    'last_activity_at' => $pipeline->last_activity_at?->toDateTimeString(),
                    'auto_marked_lost' => true,
                ]
            );

            $markedCount++;
            $results[] = [
                'pipeline_id' => $pipeline->pipeline_id,
                'customer_name' => $pipeline->customer_name,
                'days_inactive' => $daysInactive,
                'previous_stage' => $pipeline->previous_stage,
            ];

            Log::info("Auto-marked pipeline {$pipeline->pipeline_id} as lost due to {$daysInactive} days of inactivity");
        }

        return [
            'count' => $markedCount,
            'pipelines' => $results,
        ];
    }

    /**
     * Get auto-logging statistics
     */
    public function getAutoLoggingStats(?int $branchId = null): array
    {
        $query = Pipeline::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId));

        $today = now()->startOfDay();
        $thisWeek = now()->startOfWeek();
        $thisMonth = now()->startOfMonth();

        return [
            'total_auto_events' => (clone $query)->sum('auto_logged_events_count'),
            'auto_events_today' => (clone $query)
                ->where('updated_at', '>=', $today)
                ->sum('auto_logged_events_count'),
            'auto_events_this_week' => (clone $query)
                ->where('updated_at', '>=', $thisWeek)
                ->sum('auto_logged_events_count'),
            'auto_events_this_month' => (clone $query)
                ->where('updated_at', '>=', $thisMonth)
                ->sum('auto_logged_events_count'),
            'auto_progression_enabled_count' => (clone $query)
                ->where('auto_progression_enabled', true)
                ->whereNotIn('current_stage', ['lost', 'won'])
                ->count(),
            'auto_loss_enabled_count' => (clone $query)
                ->where('auto_loss_rule_enabled', true)
                ->whereNotIn('current_stage', ['lost', 'won'])
                ->count(),
            'inactive_pipelines_count' => (clone $query)
                ->where('auto_loss_rule_enabled', true)
                ->whereNotIn('current_stage', ['lost', 'won'])
                ->where(function ($q) {
                    $q->where('last_activity_at', '<', now()->subDays(7))
                        ->orWhereNull('last_activity_at');
                })
                ->count(),
        ];
    }
}
