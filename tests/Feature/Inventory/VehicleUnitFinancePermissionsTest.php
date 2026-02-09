<?php

namespace Tests\Feature\Inventory;

use App\Models\Branch;
use App\Models\User;
use App\Models\VehicleModel;
use App\Models\VehicleUnit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class VehicleUnitFinancePermissionsTest extends TestCase
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

    private function unit(Branch $branch, VehicleModel $model): VehicleUnit
    {
        return VehicleUnit::create([
            'branch_id' => $branch->id,
            'vehicle_model_id' => $model->id,
            'vin' => 'VIN-' . uniqid(),
            'stock_number' => 'STK-' . uniqid(),
            'status' => 'in_stock',
            'location' => 'branch',
        ]);
    }

    private function userWithRole(string $roleName, array $permissions, Branch $branch): User
    {
        $role = Role::findOrCreate($roleName);
        foreach ($permissions as $perm) {
            Permission::findOrCreate($perm);
        }
        $role->syncPermissions($permissions);

        $user = User::factory()->create(['branch_id' => $branch->id]);
        $user->assignRole($role);

        return $user;
    }

    public function test_inventory_user_cannot_update_financial_fields()
    {
        $branch = $this->branch();
        $model = $this->model();
        $unit = $this->unit($branch, $model);

        $inventoryUser = $this->userWithRole('inventory_user', ['inventory.edit'], $branch);

        $response = $this->actingAs($inventoryUser)
            ->withHeader('Accept', 'application/json')
            ->patchJson(route('inventory.units.update', $unit->id), [
                'purchase_price' => 1000000,
            ]);

        $response->assertStatus(403);
    }

    public function test_inventory_user_can_update_status_and_location()
    {
        $branch = $this->branch();
        $model = $this->model();
        $unit = $this->unit($branch, $model);

        $inventoryUser = $this->userWithRole('inventory_user', ['inventory.edit'], $branch);

        $response = $this->actingAs($inventoryUser)
            ->withHeader('Accept', 'application/json')
            ->patchJson(route('inventory.units.update', $unit->id), [
                'status' => 'reserved',
                'location' => 'branch',
                'sub_status' => 'reserved_no_dp',
            ]);

        $response->assertRedirect();
        $unit->refresh();
        $this->assertEquals('reserved', $unit->status);
        $this->assertEquals('reserved_no_dp', $unit->sub_status);
    }

    public function test_accounting_user_can_update_financial_fields()
    {
        $branch = $this->branch();
        $model = $this->model();
        $unit = $this->unit($branch, $model);

        $accountingUser = $this->userWithRole('accounting', ['finance.edit_financials', 'inventory.edit'], $branch);

        $response = $this->actingAs($accountingUser)
            ->withHeader('Accept', 'application/json')
            ->patchJson(route('inventory.units.update', $unit->id), [
                'purchase_price' => 750000,
                'sale_price' => 900000,
            ]);

        $response->assertRedirect();
        $unit->refresh();
        $this->assertEquals(750000, (float) $unit->purchase_price);
        $this->assertEquals(900000, (float) $unit->sale_price);
    }

    public function test_sales_user_cannot_update_financial_fields()
    {
        $branch = $this->branch();
        $model = $this->model();
        $unit = $this->unit($branch, $model);

        $salesUser = $this->userWithRole('sales_rep', ['sales.edit'], $branch);

        $response = $this->actingAs($salesUser)
            ->withHeader('Accept', 'application/json')
            ->patchJson(route('inventory.units.update', $unit->id), [
                'srp_amount' => 880000,
            ]);

        $response->assertStatus(403);
    }
}
