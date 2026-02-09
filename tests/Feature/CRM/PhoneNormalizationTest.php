<?php

namespace Tests\Feature\CRM;

use App\Models\Branch;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class PhoneNormalizationTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
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

        $user = User::factory()->create(['branch_id' => $branch->id]);
        $role = Role::findOrCreate('admin');
        foreach (['customer.create', 'customer.edit', 'customer.view', 'sales.view'] as $perm) {
            Permission::findOrCreate($perm);
        }
        $role->syncPermissions(Permission::all());
        $user->assignRole($role);

        return $user;
    }

    public function test_customer_phone_normalizes_to_plus63()
    {
        $admin = $this->admin();

        $response = $this->actingAs($admin)
            ->postJson(route('sales.customer-experience.store'), [
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'email' => 'juan@valid.com',
                'phone' => '09171234567',
                'customer_type' => 'individual',
                'customer_segment' => 'retail',
                'status' => 'active',
                'branch_id' => $admin->branch_id,
            ]);

        $response->assertRedirect();
        $customer = Customer::first();
        $this->assertEquals('+639171234567', $customer->phone);
    }

    public function test_invalid_phone_rejected()
    {
        $admin = $this->admin();

        $response = $this->actingAs($admin)
            ->postJson(route('sales.customer-experience.store'), [
                'first_name' => 'Invalid',
                'last_name' => 'Number',
                'email' => 'invalid@example.com',
                'phone' => '12345',
                'customer_type' => 'individual',
                'customer_segment' => 'retail',
                'status' => 'active',
                'branch_id' => $admin->branch_id,
            ]);

        $response->assertStatus(422);
    }
}
