<?php

namespace App\Console\Commands;

use App\Services\ComplianceReminderService;
use Illuminate\Console\Command;

class ProcessComplianceReminders extends Command
{
    protected $signature = 'compliance:process-reminders {--dry-run : Evaluate reminders without sending notifications}';

    protected $description = 'Process scheduled compliance reminders and dispatch notifications when due';

    public function __construct(private readonly ComplianceReminderService $reminderService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $this->info($dryRun ? '🔎 Dry-running compliance reminders...' : '📣 Processing compliance reminders...');

        $result = $this->reminderService->processDueReminders($dryRun);

        if ($result['processed'] === 0) {
            $this->info('✅ No reminders were due at this time.');
            return Command::SUCCESS;
        }

        $this->table(
            ['Metric', 'Value'],
            [
                ['Reminders Processed', $result['processed']],
                ['Events Logged', $result['events_created']],
                ['Mode', $dryRun ? 'Dry Run' : 'Live'],
            ]
        );

        $this->info('🏁 Reminder processing completed.');

        return Command::SUCCESS;
    }
}
