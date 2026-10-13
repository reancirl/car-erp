<?php

namespace Tests\Feature\Inventory;

use App\Models\Branch;
use App\Models\User;
use App\Models\VehicleModel;
use App\Models\VehicleUnit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ImportInventoryXlsxTest extends TestCase
{
    use RefreshDatabase;

    public function test_imports_the_workbook_then_fills_existing_units_from_a_newer_one(): void
    {
        $branch = Branch::create([
            'name' => 'HQ',
            'code' => 'HQ',
            'address' => '123 Test',
            'city' => 'Makati',
            'state' => 'NCR',
            'postal_code' => '1200',
            'country' => 'PH',
            'status' => 'active',
        ]);
        $file = base_path('tests/Fixtures/inventory-import.xlsx');

        $this->artisan('inventory:import-xlsx', ['file' => $file, '--dry-run' => true])->assertSuccessful();
        $this->assertSame(0, VehicleUnit::count());

        // 8 vehicle rows: one duplicate VIN and one without a VIN are skipped.
        $this->artisan('inventory:import-xlsx', ['file' => $file])
            ->expectsOutputToContain('Created 6, updated 0, unchanged 0, skipped 2.')
            ->assertSuccessful();
        $this->artisan('inventory:import-xlsx', ['file' => $file])
            ->expectsOutputToContain('Created 0, updated 0, unchanged 6, skipped 2.')
            ->assertSuccessful();

        $sold = VehicleUnit::where('vin', 'LK6ADAE30SF000001')->firstOrFail();
        $this->assertSame('sold', $sold->status);
        $this->assertSame('sold', $sold->location);
        $this->assertSame('EO001B', $sold->stock_number);
        $this->assertSame('EO001B', $sold->conduction_no);
        $this->assertSame('2026-03-21', $sold->sold_date->toDateString());
        $this->assertSame('00000272', $sold->sales_invoice_no);
        $this->assertSame('BQ ASTER', $sold->dealer);
        $this->assertSame('ASTER 2', $sold->allocation_status);
        $this->assertSame(2025, $sold->vehicleModel->year);
        $this->assertTrue(VehicleModel::where(['make' => 'BAOJUN', 'model' => 'YEP', 'year' => 2024])->exists());
        $this->assertSame(['reserved', 'branch', null], $this->state('LK6ADAE10RE000003'));
        $this->assertSame(['sold', 'warehouse', 'for_release'], $this->state('LK6ADAE10RE000004'));
        $this->assertSame(['in_stock', 'branch', null], $this->state('LK6ADAE10RE000005'));
        $this->assertSame('LK6ADAE10RE000006', VehicleUnit::where('vin', 'LK6ADAE10RE000006')->value('stock_number'));

        $sold->update(['notes' => $sold->notes."\nCall owner on Monday"]);

        Role::findOrCreate('inventory-clerk')->syncPermissions([Permission::findOrCreate('inventory.create')]);
        $user = User::factory()->create(['branch_id' => $branch->id]);
        $user->assignRole('inventory-clerk');

        Storage::fake('local');
        $this->actingAs($user)
            ->post('/inventory/vehicle-import/preview', [
                'file' => new UploadedFile(base_path('tests/Fixtures/inventory-import-update.xlsx'), 'update.xlsx', null, null, true),
            ])
            ->assertRedirect('/inventory/vehicle-import');

        $this->get('/inventory/vehicle-import')->assertInertia(fn (Assert $page) => $page
            ->component('inventory/vehicle-import')
            ->where('preview.file_name', 'update.xlsx')
            ->where('preview.created', 1)
            ->where('preview.updated', 3)
            ->where('preview.unchanged', 1)
            ->where('preview.skipped', 0)
            ->where('preview.rows.1.details', 'status: reserved → sold; location: branch → sold'));
        $this->assertSame(6, VehicleUnit::count(), 'Preview must not save anything');

        $this->post('/inventory/vehicle-import')->assertRedirect('/inventory/vehicles');
        $this->assertSame([], Storage::disk('local')->allFiles('vehicle-imports'));
        $this->assertSame(7, VehicleUnit::count());

        // New customer replaces the old one in place, notes typed in the app are kept.
        $notes = $sold->fresh()->notes;
        $this->assertStringContainsString('Customer: MARIA SANTOS', $notes);
        $this->assertStringNotContainsString('JUAN DELA CRUZ', $notes);
        $this->assertStringContainsString('Call owner on Monday', $notes);

        // Now sold; blank cells kept the existing color and dealer.
        $released = VehicleUnit::where('vin', 'LK6ADAE10RE000003')->firstOrFail();
        $this->assertSame(['sold', 'sold', null], $this->state('LK6ADAE10RE000003'));
        $this->assertSame('CREAM/BLACK', $released->color_exterior);
        $this->assertSame('OTTO MOTTO MOBILITY', $released->dealer);

        // Row without a VIN was matched by CS number; no ticks, so the status stayed.
        $this->assertSame('NEXT GEN FLEET', VehicleUnit::where('vin', 'LK6ADAE10RE000005')->value('dealer'));
        $this->assertSame(['in_stock', 'branch', null], $this->state('LK6ADAE10RE000005'));
    }

    private function state(string $vin): array
    {
        $unit = VehicleUnit::where('vin', $vin)->firstOrFail();

        return [$unit->status, $unit->location, $unit->sub_status];
    }
}
