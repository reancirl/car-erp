<?php

namespace Tests\Feature\Inventory;

use App\Models\Branch;
use App\Models\Customer;
use App\Models\User;
use App\Models\VehicleModel;
use App\Models\VehicleReservation;
use App\Models\VehicleUnit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class VehicleUnitStatusTest extends TestCase
{
    use RefreshDatabase;

    private function adminUser(array $permissions = []): User
    {
        $branch = Branch::create([
            'name' => 'HQ',
            'code' => 'HQ',
            'status' => 'active',
            'address' => '123 Test St',
            'city' => 'Makati',
            'state' => 'NCR',
            'postal_code' => '1200',
            'country' => 'PH',
        ]);

        $user = User::factory()->create(['branch_id' => $branch->id]);

        $role = Role::findOrCreate('admin');
        $role->syncPermissions([]); // keep role slim for test context
        $user->assignRole($role);

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
            $user->givePermissionTo($permission);
        }

        return $user;
    }

    private function vehicleModel(): VehicleModel
    {
        return VehicleModel::create([
            'model' => 'Binguo',
            'year' => 2025,
        ]);
    }

    private function vehicleUnit(Branch $branch, VehicleModel $model, array $overrides = []): VehicleUnit
    {
        return VehicleUnit::create(array_merge([
            'branch_id' => $branch->id,
            'vehicle_model_id' => $model->id,
            'vin' => 'VIN' . uniqid(),
            'stock_number' => 'STK' . uniqid(),
            'status' => 'in_stock',
            'location' => 'branch',
        ], $overrides));
    }

    public function test_cannot_mark_sold_without_owner()
    {
        $user = $this->adminUser(['inventory.edit']);
        $branch = Branch::first();
        $model = $this->vehicleModel();
        $unit = $this->vehicleUnit($branch, $model);

        $response = $this->actingAs($user)
            ->postJson(route('inventory.units.status', $unit->id), [
                'status' => 'sold',
                'sold_date' => now()->toDateString(),
            ]);

        $response->assertStatus(422);
        $response->assertJson(['message' => 'Owner is required when marking a vehicle as sold.']);
        $this->assertNull($unit->fresh()->owner_id);
    }

    public function test_reserved_unit_can_be_marked_sold_and_owner_autofills_from_reservation_even_when_locked()
    {
        $user = $this->adminUser(['inventory.edit']);
        $branch = Branch::first();
        $model = $this->vehicleModel();
        $customer = Customer::create([
            'branch_id' => $branch->id,
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane@example.com',
            'phone' => '09171234567',
            'customer_type' => 'individual',
            'status' => 'active',
        ]);

        $unit = $this->vehicleUnit($branch, $model, [
            'status' => 'reserved',
            'is_locked' => true,
        ]);

        VehicleReservation::create([
            'reservation_ref' => 'RES-001',
            'branch_id' => $branch->id,
            'vehicle_unit_id' => $unit->id,
            'customer_id' => $customer->id,
            'reservation_date' => now()->toDateString(),
            'payment_type' => 'cash',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user)
            ->postJson(route('inventory.units.status', $unit->id), [
                'status' => 'sold',
                'sold_date' => now()->toDateString(),
            ]);

        $response->assertOk();
        $unit->refresh();
        $this->assertEquals('sold', $unit->status);
        $this->assertEquals($customer->id, $unit->owner_id);
        $this->assertTrue($unit->is_locked);
    }

    public function test_gps_and_insurance_strings_are_normalized_and_stored_as_json()
    {
        $user = $this->adminUser(['inventory.create']);
        $branch = Branch::first();
        $model = $this->vehicleModel();

        $payload = [
            'vehicle_model_id' => $model->id,
            'branch_id' => $branch->id,
            'vin' => 'VINJSON123456789',
            'stock_number' => 'STKJSON123',
            'status' => 'in_stock',
            'location' => 'branch',
            'gps_details' => json_encode(['tracker' => 'TK-1']),
            'insurance_details' => json_encode(['provider' => 'ABC']),
        ];

        $response = $this->actingAs($user)
            ->postJson('/inventory/units', $payload);

        $response->assertStatus(201);
        $unit = VehicleUnit::where('vin', 'VINJSON123456789')->first();
        $this->assertEquals(['tracker' => 'TK-1'], $unit->gps_details);
        $this->assertEquals(['provider' => 'ABC'], $unit->insurance_details);
    }
}
