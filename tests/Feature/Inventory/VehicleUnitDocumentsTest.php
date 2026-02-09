<?php

namespace Tests\Feature\Inventory;

use App\Models\Branch;
use App\Models\User;
use App\Models\VehicleModel;
use App\Models\VehicleUnit;
use App\Models\Document;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class VehicleUnitDocumentsTest extends TestCase
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

    private function userWithPermissions(array $permissions, Branch $branch, string $roleName = 'user'): User
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

    public function test_upload_document_success()
    {
        Storage::fake('public');
        $branch = $this->branch();
        $model = $this->model();
        $unit = $this->unit($branch, $model);
        $user = $this->userWithPermissions(['inventory.edit'], $branch);

        $file = UploadedFile::fake()->create('proof.pdf', 100, 'application/pdf');

        $response = $this->actingAs($user)
            ->postJson(route('inventory.units.documents.upload', $unit->id), [
                'type' => 'proof_of_payment',
                'file' => $file,
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseCount('documents', 1);
        $document = Document::first();
        Storage::disk('public')->assertExists($document->path);
        $this->assertEquals('proof_of_payment', $document->type);
    }

    public function test_upload_or_cr_document_success()
    {
        Storage::fake('public');
        $branch = $this->branch();
        $model = $this->model();
        $unit = $this->unit($branch, $model);
        $user = $this->userWithPermissions(['inventory.edit'], $branch);

        $file = UploadedFile::fake()->create('orcr.png', 200, 'image/png');

        $response = $this->actingAs($user)
            ->postJson(route('inventory.units.documents.upload', $unit->id), [
                'type' => 'or_cr_scan',
                'file' => $file,
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('documents', ['type' => 'or_cr_scan']);
    }

    public function test_upload_document_forbidden_for_other_branch()
    {
        Storage::fake('public');
        $branch = $this->branch();
        $otherBranch = Branch::create([
            'name' => 'Other',
            'code' => 'OTH',
            'address' => 'Other',
            'city' => 'Cebu',
            'state' => 'CEB',
            'postal_code' => '6000',
            'country' => 'PH',
            'status' => 'active',
        ]);
        $model = $this->model();
        $unit = $this->unit($branch, $model);
        $user = $this->userWithPermissions(['inventory.edit'], $otherBranch, 'inventory_other');

        $file = UploadedFile::fake()->create('proof.pdf', 100, 'application/pdf');

        $response = $this->actingAs($user)
            ->postJson(route('inventory.units.documents.upload', $unit->id), [
                'type' => 'proof_of_payment',
                'file' => $file,
            ]);

        $this->assertTrue(in_array($response->status(), [403, 404]));
        $this->assertDatabaseCount('documents', 0);
    }

    public function test_list_documents_grouped_by_type()
    {
        Storage::fake('public');
        $branch = $this->branch();
        $model = $this->model();
        $unit = $this->unit($branch, $model);
        $user = $this->userWithPermissions(['inventory.view'], $branch, 'viewer');

        $doc = Document::create([
            'documentable_type' => VehicleUnit::class,
            'documentable_id' => $unit->id,
            'type' => 'spec_sheet',
            'path' => 'vehicles/'.$unit->id.'/documents/spec.pdf',
            'filename' => 'spec.pdf',
            'mime' => 'application/pdf',
            'size' => 1234,
            'uploaded_by' => null,
        ]);

        $response = $this->actingAs($user)
            ->getJson(route('inventory.units.documents', $unit->id));

        $response->assertOk();
        $response->assertJsonStructure(['data' => ['spec_sheet']]);
    }

    public function test_delete_document_requires_admin()
    {
        Storage::fake('public');
        $branch = $this->branch();
        $model = $this->model();
        $unit = $this->unit($branch, $model);
        $admin = $this->userWithPermissions(['inventory.view', 'inventory.edit'], $branch, 'admin');
        $admin->assignRole('admin');

        $doc = Document::create([
            'documentable_type' => VehicleUnit::class,
            'documentable_id' => $unit->id,
            'type' => 'spec_sheet',
            'path' => 'vehicles/'.$unit->id.'/documents/spec.pdf',
            'filename' => 'spec.pdf',
            'mime' => 'application/pdf',
            'size' => 1234,
            'uploaded_by' => $admin->id,
        ]);

        $response = $this->actingAs($admin)
            ->deleteJson(route('inventory.units.documents.delete', [$unit->id, $doc->id]));

        $response->assertOk();
        $this->assertDatabaseCount('documents', 0);
    }
}
