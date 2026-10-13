<?php

namespace App\Services;

use App\Models\VehicleModel;
use App\Models\VehicleUnit;
use App\Traits\LogsActivity;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use ZipArchive;

/**
 * Imports vehicle units from the inventory workbook (one sheet per model).
 *
 * Rows are matched to existing units by VIN, or by CS number when the VIN is missing.
 * Matched units are only filled with cells that have a value, so blank cells never erase
 * data entered in the app. Unmatched rows with a valid VIN become new units.
 */
class InventoryXlsxImporter
{
    use LogsActivity;

    /**
     * Rows list every new, updated and skipped row (unchanged rows are only counted).
     *
     * @return array{created: int, updated: int, unchanged: int, skipped: int, new_models: string[], rows: array<int, array{row: string, result: string, vin: ?string, model: ?string, details: string}>}
     */
    public function import(string $path, int $branchId, bool $dryRun = false, ?string $sourceName = null): array
    {
        $sourceName ??= basename($path);
        $result = ['created' => 0, 'updated' => 0, 'unchanged' => 0, 'skipped' => 0, 'new_models' => [], 'rows' => []];
        $changes = [];
        $seen = [];
        $models = [];

        DB::beginTransaction();

        try {
            foreach ($this->readSheets($path) as $sheet => $rows) {
                $headerRow = array_key_first($rows);
                $columns = array_map(fn ($header) => strtoupper(trim($header)), $rows[$headerRow] ?? []);
                unset($rows[$headerRow]);

                foreach ($rows as $number => $cells) {
                    $col = function (string ...$names) use ($columns, $cells): ?string {
                        foreach ($names as $name) {
                            $key = array_search($name, $columns, true);
                            $value = $key === false ? '' : trim($cells[$key] ?? '');

                            if ($value !== '') {
                                return $value;
                            }
                        }

                        return null;
                    };

                    $ref = "{$sheet}!{$number}";
                    $report = function (string $outcome, ?string $vin, string $details) use (&$result, $ref, $col) {
                        $result['rows'][] = ['row' => $ref, 'result' => $outcome, 'vin' => $vin, 'model' => $col('VEHICLE MODEL'), 'details' => $details];
                    };
                    $vin = strtoupper((string) $col('VIN NUMBER'));
                    $vin = preg_match('/^[A-HJ-NPR-Z0-9]{17}$/', $vin) ? $vin : null;
                    $cs = ($cs = $col('CS NUMBER')) ? strtoupper(preg_replace('/\s+/', '', $cs)) : null;

                    // Rows with only numbers in them are the sheet totals.
                    if (! $col('VIN NUMBER', 'CS NUMBER', 'VEHICLE MODEL', 'COLOR')) {
                        continue;
                    }

                    $csMatches = ! $vin && $cs ? VehicleUnit::withTrashed()->where('conduction_no', $cs)->limit(2)->get() : collect();
                    $unit = $vin
                        ? VehicleUnit::withTrashed()->firstOrNew(['vin' => $vin])
                        : ($csMatches->count() === 1 ? $csMatches->first() : null);

                    if (! $unit || (! $unit->exists && ! $col('VEHICLE MODEL'))) {
                        $result['skipped']++;
                        $report('skipped', $col('VIN NUMBER'), 'No valid VIN or vehicle model, and no single existing unit with this CS number');

                        continue;
                    }

                    $key = $unit->vin ?? $vin;
                    if (isset($seen[$key])) {
                        $result['skipped']++;
                        $report('skipped', $key, "Duplicate VIN, already imported from {$seen[$key]}");

                        continue;
                    }
                    $seen[$key] = $ref;

                    if ($model = $col('VEHICLE MODEL')) {
                        $make = str_starts_with($model, 'BAOJUN ') ? 'BAOJUN' : 'WULING';
                        $models[$model] ??= VehicleModel::firstOrCreate(
                            ['make' => $make, 'model' => $make === 'BAOJUN' ? substr($model, 7) : $model],
                            ['year' => $this->modelYear($key)]
                        );

                        if ($models[$model]->wasRecentlyCreated && ! in_array($model, $result['new_models'], true)) {
                            $result['new_models'][] = $model;
                        }
                    }

                    $warning = null;
                    if (! $unit->exists) {
                        $stockNumber = $cs ?? $vin;

                        if ($cs && VehicleUnit::withTrashed()->where('stock_number', $cs)->exists()) {
                            $warning = "CS number {$cs} is already used by another VIN, stock number set to the VIN";
                            $stockNumber = $vin;
                        }

                        $unit->fill(['branch_id' => $branchId, 'stock_number' => $stockNumber]);
                    }

                    $sold = (int) $col('SOLD', 'PAID') === 1;
                    $reserved = (int) $col('RESERVED') === 1;
                    $state = $col('STATUS'); // READY = still in the warehouse, RELEASED = handed over

                    $unit->fill(array_filter([
                        'vehicle_model_id' => $model ? $models[$model]->id : null,
                        'conduction_no' => $cs,
                        'drive_motor_no' => $col('MOTOR NUMBER'),
                        'color_exterior' => $col('COLOR'),
                        'dealer' => $col('DEALERSHIP', 'DEALERSHIP/CUSTOMER'),
                        'allocation_status' => $col('CODE'),
                        'sales_invoice_no' => $col('INVOICE NO'),
                        'sold_date' => $this->toDate($col('INVOICE DATE')),
                    ], fn ($value) => $value !== null));

                    // A row without any SOLD / RESERVED / AVAILABLE tick keeps the unit's current status.
                    if (! $unit->exists || $sold || $reserved || (int) $col('AVAILABLE') === 1) {
                        $unit->fill([
                            'status' => $sold ? 'sold' : ($reserved ? 'reserved' : 'in_stock'),
                            'location' => match (true) {
                                $sold && $state !== 'READY' => 'sold',
                                $state === 'RELEASED' || $col('LOCATION') === 'BRIDGETOWNE' => 'branch',
                                default => 'warehouse',
                            },
                            'sub_status' => $sold && $state === 'READY' ? 'for_release' : null,
                        ]);
                    }

                    $unit->notes = $this->mergeNotes($unit->notes, [
                        'Batch' => $col('BATCH'),
                        'Customer' => $col('CUSTOMER'),
                        'Imported from' => $unit->exists ? null : "{$sourceName} ({$ref})",
                    ]);

                    if (! $unit->exists) {
                        $unit->save();
                        $result['created']++;
                        $report($warning ? 'warning' : 'new', $vin, "{$unit->status}, {$unit->location}".($warning ? ". {$warning}" : ''));
                    } elseif ($unit->isDirty()) {
                        $changes[$unit->vin] = array_keys($unit->getDirty());
                        $report('updated', $unit->vin, collect($unit->getDirty())->map(fn ($new, $field) => match ($field) {
                            'notes' => 'notes',
                            'vehicle_model_id' => "model → {$model}",
                            default => "{$field}: ".($unit->getRawOriginal($field) ?? '—')." → {$new}",
                        })->implode('; '));
                        $unit->save();
                        $result['updated']++;
                    } else {
                        $result['unchanged']++;
                    }
                }
            }
        } catch (\Throwable $e) {
            DB::rollBack();

            throw $e;
        }

        if ($dryRun) {
            DB::rollBack();

            return $result;
        }

        $this->logActivity('import', 'Inventory', "Imported vehicle units from {$sourceName}", null, [
            'branch_id' => $branchId,
            'created' => $result['created'],
            'updated' => $result['updated'],
            'unchanged' => $result['unchanged'],
            'skipped' => $result['skipped'],
            'changes' => $changes,
        ]);
        DB::commit();

        return $result;
    }

    /**
     * Replace "Label: value" lines in place so notes typed in the app are kept.
     */
    private function mergeNotes(?string $notes, array $fields): ?string
    {
        $lines = $notes === null || $notes === '' ? [] : explode("\n", $notes);

        foreach (array_filter($fields) as $label => $value) {
            $index = array_search(true, array_map(fn ($line) => str_starts_with($line, "{$label}: "), $lines), true);
            $lines[$index === false ? count($lines) : $index] = "{$label}: {$value}";
        }

        return $lines ? implode("\n", $lines) : null;
    }

    /**
     * Read every sheet as [sheet name => [row number => [column index => value]]].
     */
    private function readSheets(string $path): array
    {
        $zip = new ZipArchive;

        if ($zip->open($path) !== true) {
            throw new RuntimeException('Unable to open the file as an .xlsx workbook.');
        }

        $xml = fn (string $name) => ($content = $zip->getFromName($name)) === false ? null : simplexml_load_string($content);

        $strings = [];
        foreach ($xml('xl/sharedStrings.xml')?->si ?? [] as $si) {
            $text = (string) $si->t;
            foreach ($si->r as $run) {
                $text .= (string) $run->t;
            }
            $strings[] = $text;
        }

        $targets = [];
        foreach ($xml('xl/_rels/workbook.xml.rels')->Relationship as $rel) {
            $target = (string) $rel['Target'];
            $targets[(string) $rel['Id']] = str_starts_with($target, '/') ? substr($target, 1) : "xl/{$target}";
        }

        $sheets = [];
        $relNs = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
        foreach ($xml('xl/workbook.xml')->sheets->sheet as $sheet) {
            $rows = [];
            foreach ($xml($targets[(string) $sheet->attributes($relNs)['id']])->sheetData->row as $row) {
                foreach ($row->c as $cell) {
                    $value = match ((string) $cell['t']) {
                        's' => $strings[(int) $cell->v] ?? '',
                        'inlineStr' => (string) $cell->is->t,
                        default => (string) $cell->v,
                    };
                    $rows[(int) $row['r']][$this->columnIndex((string) $cell['r'])] = $value;
                }
            }
            $sheets[(string) $sheet['name']] = $rows;
        }

        $zip->close();

        return $sheets;
    }

    private function columnIndex(string $cellRef): int
    {
        $index = 0;
        foreach (str_split(preg_replace('/\d+/', '', $cellRef)) as $letter) {
            $index = $index * 26 + ord($letter) - 64;
        }

        return $index - 1;
    }

    /**
     * Model year from the VIN's 10th character (R = 2024, S = 2025, T = 2026).
     */
    private function modelYear(string $vin): int
    {
        $offset = strpos('ABCDEFGHJKLMNPRSTVWXY123456789', $vin[9]);

        return $offset === false ? (int) date('Y') : 2010 + $offset;
    }

    private function toDate(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        if (is_numeric($value)) {
            return Carbon::create(1899, 12, 30)->addDays((int) $value)->toDateString();
        }

        return rescue(fn () => Carbon::parse($value)->toDateString(), null, false);
    }
}
