<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\ComplianceReminder;
use App\Models\ComplianceReminderEvent;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ComplianceReminderService
{
    /**
     * Process all reminders whose remind_at timestamps are due.
     */
    public function processDueReminders(bool $dryRun = false): array
    {
        $now = now();
        $processed = 0;
        $eventsCreated = 0;

        ComplianceReminder::query()
            ->due()
            ->orderBy('remind_at')
            ->chunkById(100, function ($reminders) use (&$processed, &$eventsCreated, $now, $dryRun) {
                foreach ($reminders as $reminder) {
                    $result = $this->triggerReminder($reminder, $now, $dryRun);
                    if ($result['processed']) {
                        $processed++;
                        $eventsCreated += $result['events'];
                    }
                }
            });

        return [
            'processed' => $processed,
            'events_created' => $eventsCreated,
            'dry_run' => $dryRun,
        ];
    }

    /**
     * Trigger an individual reminder and persist delivery metadata.
     */
    public function triggerReminder(ComplianceReminder $reminder, Carbon $reference, bool $dryRun = false): array
    {
        if (!$reminder->isDue($reference)) {
            return ['processed' => false, 'events' => 0];
        }

        if ($dryRun) {
            return ['processed' => true, 'events' => 0];
        }

        $events = 0;

        DB::transaction(function () use ($reminder, $reference, &$events) {
            $status = ComplianceReminder::STATUS_SENT;
            $reminder->last_triggered_at = $reference;
            $reminder->last_sent_at = $reference;
            $reminder->sent_count = ($reminder->sent_count ?? 0) + 1;

            if ($reminder->auto_escalate && $reminder->due_at && $reminder->due_at->lessThan($reference)) {
                $status = ComplianceReminder::STATUS_ESCALATED;
                $reminder->last_escalated_at = $reference;
            }

            $reminder->status = $status;
            $reminder->save();

            ComplianceReminderEvent::create([
                'compliance_reminder_id' => $reminder->id,
                'event_type' => 'triggered',
                'channel' => $reminder->delivery_channel,
                'status' => $status,
                'message' => 'Reminder automatically triggered based on schedule.',
                'metadata' => [
                    'delivery_channel' => $reminder->delivery_channel,
                    'delivery_channels' => $reminder->delivery_channels,
                ],
                'processed_at' => $reference,
            ]);

            ActivityLog::create([
                'log_name' => 'compliance',
                'description' => sprintf('Reminder "%s" triggered automatically.', $reminder->title),
                'subject_type' => ComplianceReminder::class,
                'subject_id' => $reminder->id,
                'event' => 'reminder_triggered',
                'branch_id' => $reminder->branch_id,
                'properties' => [
                    'status' => $status,
                    'remind_at' => optional($reminder->remind_at)?->toIso8601String(),
                    'delivery_channel' => $reminder->delivery_channel,
                ],
                'action' => 'compliance.reminders.trigger',
                'module' => 'Compliance Reminders',
                'status' => 'success',
            ]);

            $events++;
        });

        return ['processed' => true, 'events' => $events];
    }
}
