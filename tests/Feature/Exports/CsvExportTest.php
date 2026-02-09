<?php

namespace Tests\Feature\Exports;

use App\Models\Branch;
use App\Models\Lead;
use App\Models\PartInventory;
use App\Models\User;
use App\Models\WarrantyClaim;
use App\Models\WorkOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CsvExportTest extends TestCase
{
    use RefreshDatabase;

    private function branch(string $code = 'HQ'): Branch
    {
        return Branch::create([
            'name' => $code . ' Branch',
            'code' => $code,
            'address' => '123 ' . $code,
            'city' => 'City',
            'state' => 'State',
            'postal_code' => '1000',
            'country' => 'PH',
            'status' => 'active',
        ]);
    }

    private function userWithPermissions(string $roleName, array $permissions, Branch $branch): User
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

    public function test_leads_export_respects_filters_branch_and_row_limit(): void
    {
        config(['exports.max_rows' => 2]);

        $branchA = $this->branch('A1');
        $branchB = $this->branch('B1');

        $user = $this->userWithPermissions('sales_rep', ['sales.view'], $branchA);

        // Leads in branch A (3 matching search)
        Lead::create([
            'branch_id' => $branchA->id,
            'name' => 'Match Lead 1',
            'email' => 'match1@example.com',
            'phone' => '+639171111111',
            'source' => 'web_form',
            'status' => 'hot',
            'priority' => 'high',
        ]);
        Lead::create([
            'branch_id' => $branchA->id,
            'name' => 'Match Lead 2',
            'email' => 'match2@example.com',
            'phone' => '+639172222222',
            'source' => 'web_form',
            'status' => 'hot',
            'priority' => 'high',
        ]);
        Lead::create([
            'branch_id' => $branchA->id,
            'name' => 'Match Lead 3',
            'email' => 'match3@example.com',
            'phone' => '+639173333333',
            'source' => 'web_form',
            'status' => 'hot',
            'priority' => 'high',
        ]);

        // Different branch lead (should not appear)
        Lead::create([
            'branch_id' => $branchB->id,
            'name' => 'Other Branch Lead',
            'email' => 'other@example.com',
            'phone' => '+639174444444',
            'source' => 'web_form',
            'status' => 'hot',
            'priority' => 'high',
        ]);

        $response = $this->actingAs($user)
            ->get('/sales/lead-management-export?search=Match&status=hot');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));

        $csv = $response->streamedContent();
        $lines = array_filter(explode("\n", trim($csv)));

        // header + max_rows
        $this->assertCount(3, $lines);
        $this->assertStringContainsString('Match Lead', $csv);
        $this->assertStringNotContainsString('Other Branch Lead', $csv);
    }

    public function test_warranty_claims_export_enforces_branch_scope(): void
    {
        $branchA = $this->branch('A1');
        $branchB = $this->branch('B1');
        $user = $this->userWithPermissions('service_manager', ['warranty.view'], $branchA);

        WarrantyClaim::create([
            'claim_id' => 'WC-TEST-1',
            'branch_id' => $branchA->id,
            'claim_type' => 'parts',
            'claim_date' => now()->toDateString(),
            'failure_description' => 'Issue A',
            'status' => 'submitted',
            'currency' => 'PHP',
        ]);

        WarrantyClaim::create([
            'claim_id' => 'WC-TEST-2',
            'branch_id' => $branchB->id,
            'claim_type' => 'labor',
            'claim_date' => now()->toDateString(),
            'failure_description' => 'Issue B',
            'status' => 'submitted',
            'currency' => 'PHP',
        ]);

        $response = $this->actingAs($user)->get('/service/warranty-claims-export');

        $response->assertOk();
        $csv = $response->streamedContent();
        $this->assertStringContainsString('WC-TEST-1', $csv);
        $this->assertStringNotContainsString('WC-TEST-2', $csv);
    }

    public function test_parts_inventory_export_scoped_and_contains_headers(): void
    {
        $branch = $this->branch('A1');
        $user = $this->userWithPermissions('parts_head', ['inventory.view'], $branch);

        PartInventory::create([
            'part_number' => 'PART-001',
            'branch_id' => $branch->id,
            'part_name' => 'Brake Pad',
            'category' => 'brakes',
            'quantity_on_hand' => 5,
            'quantity_reserved' => 1,
            'unit_cost' => 1000,
            'selling_price' => 1500,
            'currency' => 'PHP',
            'status' => 'active',
            'condition' => 'new',
        ]);

        $response = $this->actingAs($user)->get('/inventory/parts-inventory-export');
        $response->assertOk();
        $this->assertStringContainsString('Part Number', $response->streamedContent());
    }

    public function test_work_orders_export_branch_scope(): void
    {
        $branchA = $this->branch('A1');
        $branchB = $this->branch('B1');
        $user = $this->userWithPermissions('technician', ['pms-work-orders.view'], $branchA);

        WorkOrder::create([
            'branch_id' => $branchA->id,
            'status' => 'pending',
            'priority' => 'normal',
            'customer_name' => 'Alice',
            'vehicle_vin' => 'VIN-A',
            'service_type_id' => null,
            'assigned_to' => $user->id,
        ]);

        WorkOrder::create([
            'branch_id' => $branchB->id,
            'status' => 'pending',
            'priority' => 'normal',
            'customer_name' => 'Bob',
            'vehicle_vin' => 'VIN-B',
            'service_type_id' => null,
            'assigned_to' => $user->id,
        ]);

        $response = $this->actingAs($user)->get('/service/pms-work-orders-export');
        $response->assertOk();
        $csv = $response->streamedContent();
        $this->assertStringContainsString('VIN-A', $csv);
        $this->assertStringNotContainsString('VIN-B', $csv);
    }
}
