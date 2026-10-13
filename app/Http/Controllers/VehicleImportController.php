<?php

namespace App\Http\Controllers;

use App\Services\InventoryXlsxImporter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Upload the inventory workbook, preview what would change (dry run), then confirm.
 * The uploaded file waits in storage, referenced from the session, until confirmed or cancelled.
 */
class VehicleImportController extends Controller
{
    public function create(Request $request, InventoryXlsxImporter $importer): Response
    {
        $pending = $request->session()->get('vehicle_import');
        $preview = null;

        // Re-run the dry run on every visit so the preview always reflects the current data.
        if ($pending && Storage::exists($pending['path']) && $request->user()->branch_id) {
            $preview = $importer->import(
                Storage::path($pending['path']),
                $request->user()->branch_id,
                dryRun: true,
                sourceName: $pending['name']
            ) + ['file_name' => $pending['name']];
        }

        return Inertia::render('inventory/vehicle-import', ['preview' => $preview]);
    }

    public function preview(Request $request, InventoryXlsxImporter $importer): RedirectResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx|max:10240',
        ]);

        if (! $request->user()->branch_id) {
            return back()->withErrors(['file' => 'Your account has no branch to assign new vehicles to.']);
        }

        $this->discardPending($request);
        $path = $request->file('file')->storeAs('vehicle-imports', Str::uuid().'.xlsx');

        try {
            $importer->import(Storage::path($path), $request->user()->branch_id, dryRun: true);
        } catch (\RuntimeException $e) {
            Storage::delete($path);

            return back()->withErrors(['file' => $e->getMessage()]);
        }

        $request->session()->put('vehicle_import', [
            'path' => $path,
            'name' => $request->file('file')->getClientOriginalName(),
        ]);

        return redirect()->route('inventory.vehicle-import');
    }

    public function store(Request $request, InventoryXlsxImporter $importer): RedirectResponse
    {
        $pending = $request->session()->get('vehicle_import');

        if (! $pending || ! Storage::exists($pending['path'])) {
            return redirect()->route('inventory.vehicle-import')->with('error', 'Nothing to import. Upload the workbook again.');
        }

        $result = $importer->import(
            Storage::path($pending['path']),
            $request->user()->branch_id,
            sourceName: $pending['name']
        );
        $this->discardPending($request);

        return redirect()->route('inventory.vehicles.index')
            ->with('success', "Import done: {$result['created']} new, {$result['updated']} updated, {$result['unchanged']} unchanged, {$result['skipped']} skipped.");
    }

    public function cancel(Request $request): RedirectResponse
    {
        $this->discardPending($request);

        return redirect()->route('inventory.vehicle-import');
    }

    // ponytail: files from abandoned previews stay in storage/app/private/vehicle-imports until the next preview by that user; add a scheduled cleanup if they pile up.
    private function discardPending(Request $request): void
    {
        if ($pending = $request->session()->pull('vehicle_import')) {
            Storage::delete($pending['path']);
        }
    }
}
