<?php

namespace Tests\Feature\Inventory;

use App\Models\Branch;
use App\Models\User;
use App\Models\VehicleModel;
use App\Models\VehicleUnit;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VehicleUnitWarrantyTest extends TestCase
{
    use RefreshDatabase;

    private function branch(): Branch
    {
        return Branch::create([
            'name' => 'HQ',
            'code' => 'HQ',
            'address' => '123 Test',
            'city' => 'Makati',
            'state' => 'NCR',
            'postal_code' => '1200',
            'country' => 'PH',
            'status' => 'active',
        ]);
    }

    private function model(): VehicleModel
    {
        return VehicleModel::create([
            'model' => 'Binguo',
            'year' => 2025,
        ]);
    }

    private function admin(): User
    {
        $branch = $this->branch();
        $user = User::factory()->create(['branch_id' => $branch->id]);
        // Create minimal admin role if not seeded
        $role = Role::findOrCreate('admin');
        foreach (['inventory.create', 'inventory.edit', 'inventory.view'] as $perm) {
            Permission::findOrCreate($perm);
        }
        $role->syncPermissions(['inventory.create', 'inventory.edit', 'inventory.view']);
        $user->assignRole($role);
        return $user;
    }

    public function test_warranty_end_auto_computed_on_create()
    {
        $admin = $this->admin();
        $branch = $admin->branch_id;
        $model = $this->model();

        $response = $this->actingAs($admin)
            ->postJson('/inventory/units', [
                'vehicle_model_id' => $model->id,
                'branch_id' => $branch,
                'vin' => 'VIN-WARRANTY-1',
                'stock_number' => 'STK-W1',
                'status' => 'in_stock',
                'location' => 'branch',
                'warranty_start_date' => '2026-01-01',
            ]);

        $response->assertCreated();
        $unit = VehicleUnit::where('vin', 'VIN-WARRANTY-1')->first();
        $this->assertEquals('2029-01-01', $unit->warranty_end_date->toDateString());
    }

    public function test_manual_warranty_end_override_respected()
    {
        $admin = $this->admin();
        $branch = $admin->branch_id;
        $model = $this->model();

        $response = $this->actingAs($admin)
            ->postJson('/inventory/units', [
                'vehicle_model_id' => $model->id,
                'branch_id' => $branch,
                'vin' => 'VIN-WARRANTY-2',
                'stock_number' => 'STK-W2',
                'status' => 'in_stock',
                'location' => 'branch',
                'warranty_start_date' => '2026-01-01',
                'warranty_end_date' => '2026-12-31',
            ]);

        $response->assertCreated();
        $unit = VehicleUnit::where('vin', 'VIN-WARRANTY-2')->first();
        $this->assertEquals('2026-12-31', $unit->warranty_end_date->toDateString());
    }
}
