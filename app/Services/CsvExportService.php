<?php

namespace App\Services;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CsvExportService
{
    public function streamQuery(Builder $query, array $columns, string $filename, ?int $maxRows = null): StreamedResponse
    {
        $maxRows ??= config('exports.max_rows', 1000);

        // Enforce max rows at query level
        $query->limit($maxRows);

        return response()->streamDownload(function () use ($query, $columns) {
            $handle = fopen('php://output', 'w');

            // Header row
            fputcsv($handle, array_keys($columns));

            $query->chunk(200, function ($rows) use ($handle, $columns) {
                foreach ($rows as $row) {
                    $line = [];
                    foreach ($columns as $label => $accessor) {
                        if ($accessor instanceof Closure || is_callable($accessor)) {
                            $line[] = $accessor($row);
                        } else {
                            $line[] = data_get($row, $accessor);
                        }
                    }
                    fputcsv($handle, $line);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }
}
