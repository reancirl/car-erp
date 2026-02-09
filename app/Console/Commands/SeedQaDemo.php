<?php

namespace App\Console\Commands;

use Database\Seeders\Qa\QaDemoSeeder;
use Illuminate\Console\Command;
use Throwable;

class SeedQaDemo extends Command
{
    protected $signature = 'qa:seed {--no-summary : Skip printing the seeded sample data summary}';

    protected $description = 'Create deterministic QA demo data covering branches, roles, inventory, sales, and PMS flows.';

    public function handle(): int
    {
        $this->info('Seeding QA demo data...');

        try {
            /** @var QaDemoSeeder $seeder */
            $seeder = app(QaDemoSeeder::class);
            $summary = $seeder->seedData();

            if (! $this->option('no-summary')) {
                $seeder->renderSummary($summary, $this);
            }

            $this->comment('Reset with `php artisan migrate:fresh --seed` then rerun `php artisan qa:seed` for a clean slate.');

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error($e->getMessage());
            return self::FAILURE;
        }
    }
}
