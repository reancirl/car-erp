<?php

namespace App\Console\Commands;

use App\Models\Branch;
use App\Services\InventoryXlsxImporter;
use Illuminate\Console\Command;

class ImportInventoryXlsx extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inventory:import-xlsx
        {file : Path to the inventory workbook (.xlsx), one sheet per model}
        {--branch=HQ : Code of the branch that owns newly created units}
        {--dry-run : Validate and report without saving anything}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import vehicle units from the inventory spreadsheet. Existing units (matched by VIN or CS number) are filled in, not duplicated.';

    /**
     * Execute the console command.
     */
    public function handle(InventoryXlsxImporter $importer): int
    {
        $file = (string) $this->argument('file');
        $branch = Branch::where('code', $this->option('branch'))->first();

        if (! is_file($file)) {
            $this->error("File not found: {$file}");

            return self::FAILURE;
        }

        if (! $branch) {
            $this->error("Branch not found: {$this->option('branch')}");

            return self::FAILURE;
        }

        $result = $importer->import($file, $branch->id, (bool) $this->option('dry-run'));

        $rows = array_filter($result['rows'], fn ($row) => $row['result'] !== 'new');
        if ($rows) {
            $this->table(['Row', 'Result', 'VIN', 'Model', 'Details'], array_map('array_values', $rows));
        }

        if ($result['new_models']) {
            $this->line('New vehicle models: '.implode(', ', $result['new_models']));
        }

        $this->info(($this->option('dry-run') ? '[dry run, nothing saved] ' : '')
            ."Created {$result['created']}, updated {$result['updated']}, unchanged {$result['unchanged']}, skipped {$result['skipped']}.");

        return self::SUCCESS;
    }
}
