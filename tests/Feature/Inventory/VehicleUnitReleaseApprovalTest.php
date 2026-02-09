<?php

namespace Tests\Feature\Inventory;

use App\Models\Branch;
use App\Models\Document;
use App\Models\User;
use App\Models\VehicleModel;
use App\Models\VehicleUnit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class VehicleUnitReleaseApprovalTest extends TestCase
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

    public function test_cannot_approve_with_incomplete_checklist()
    {
        $branch = $this->branch();
        $model = $this->model();
        $unit = $this->unit($branch, $model);
        $admin = $this->userWithRole('admin', ['inventory.edit'], $branch);

        $response = $this->actingAs($admin)
            ->postJson(route('inventory.units.approve-release', $unit->id), [
                'release_checklist_status' => [
                    'payment_verified' => true,
                ],
            ]);

        $response->assertStatus(422);
    }

    public function test_can_approve_with_complete_checklist_and_or_cr_doc()
    {
        $branch = $this->branch();
        $model = $this->model();
        $unit = $this->unit($branch, $model);
        $admin = $this->userWithRole('admin', ['inventory.edit'], $branch);
        $admin->assignRole('admin');

        Document::create([
            'documentable_type' => VehicleUnit::class,
            'documentable_id' => $unit->id,
            'type' => 'or_cr_scan',
            'path' => 'dummy/path.pdf',
            'filename' => 'path.pdf',
            'mime' => 'application/pdf',
            'size' => 1000,
            'uploaded_by' => $admin->id,
        ]);

        $payload = [
            'release_checklist_status' => [
                'or_cr_ready' => true,
                'unit_cleaned' => true,
                'payment_verified' => true,
                'documents_signed' => true,
            ],
        ];

        $response = $this->actingAs($admin)
            ->postJson(route('inventory.units.approve-release', $unit->id), $payload);

        $response->assertOk();
        $unit->refresh();
        $this->assertNotNull($unit->release_approval_user_id);
        $this->assertNotNull($unit->release_approved_at);
    }

    public function test_non_authorized_user_cannot_approve()
    {
        $branch = $this->branch();
        $model = $this->model();
        $unit = $this->unit($branch, $model);
        $user = $this->userWithRole('sales_rep', ['sales.edit'], $branch);

        $response = $this->actingAs($user)
            ->postJson(route('inventory.units.approve-release', $unit->id), [
                'release_checklist_status' => [
                    'or_cr_ready' => true,
                    'unit_cleaned' => true,
                    'payment_verified' => true,
                    'documents_signed' => true,
                ],
            ]);

        $response->assertStatus(403);
    }
}
