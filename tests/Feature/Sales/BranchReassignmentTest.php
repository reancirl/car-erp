<?php

namespace Tests\Feature\Sales;

use App\Models\ActivityLog;
use App\Models\Branch;
use App\Models\Lead;
use App\Models\Pipeline;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BranchReassignmentTest extends TestCase
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

    private function lead(Branch $branch): Lead
    {
        return Lead::create([
            'branch_id' => $branch->id,
            'name' => 'Lead One',
            'email' => 'lead@gmail.com',
            'phone' => '+639171234567',
            'source' => 'web_form',
            'status' => 'new',
            'priority' => 'medium',
        ]);
    }

    private function pipeline(Branch $branch): Pipeline
    {
        return Pipeline::create([
            'branch_id' => $branch->id,
            'customer_name' => 'Customer One',
            'customer_phone' => '+63-91-7123-4567',
            'customer_email' => 'customer@gmail.com',
            'current_stage' => 'lead',
            'probability' => 50,
            'priority' => 'medium',
        ]);
    }

    public function test_admin_can_reassign_lead_branch_and_logs_activity(): void
    {
        $origin = $this->branch('HQ');
        $target = $this->branch('C1');
        $lead = $this->lead($origin);

        $admin = $this->userWithRole('admin', ['sales.view', 'sales.edit'], $origin);

        $response = $this->actingAs($admin)
            ->withHeader('Accept', 'application/json')
            ->putJson(route('sales.lead-management.update', $lead), [
                'name' => $lead->name,
                'email' => $lead->email,
                'phone' => $lead->phone,
                'source' => $lead->source,
                'status' => 'hot',
                'priority' => 'high',
                'branch_id' => $target->id,
            ]);

        $response->assertRedirect();
        $lead->refresh();
        $this->assertEquals($target->id, $lead->branch_id);

        $log = ActivityLog::where('subject_type', Lead::class)
            ->where('subject_id', $lead->id)
            ->where('event', 'updated')
            ->first();

        $this->assertNotNull($log);
        $this->assertEquals($admin->id, $log->causer_id);
        $this->assertEquals($target->id, $log->properties['changes']['branch_id']['new'] ?? null);
    }

    public function test_non_admin_cannot_reassign_lead_branch(): void
    {
        $origin = $this->branch('HQ');
        $target = $this->branch('C1');
        $lead = $this->lead($origin);

        $sales = $this->userWithRole('sales_rep', ['sales.view', 'sales.edit'], $origin);

        $response = $this->actingAs($sales)
            ->withHeader('Accept', 'application/json')
            ->putJson(route('sales.lead-management.update', $lead), [
                'name' => $lead->name,
                'email' => $lead->email,
                'phone' => $lead->phone,
                'source' => $lead->source,
                'status' => $lead->status,
                'priority' => $lead->priority,
                'branch_id' => $target->id,
            ]);

        $response->assertStatus(403);
        $lead->refresh();
        $this->assertEquals($origin->id, $lead->branch_id);
        $this->assertFalse(ActivityLog::where('subject_type', Lead::class)->exists());
    }

    public function test_admin_can_reassign_pipeline_branch(): void
    {
        $origin = $this->branch('HQ');
        $target = $this->branch('C1');
        $pipeline = $this->pipeline($origin);

        $admin = $this->userWithRole('admin', ['sales.view', 'sales.edit'], $origin);

        $response = $this->actingAs($admin)
            ->withHeader('Accept', 'application/json')
            ->putJson(route('sales.pipeline.update', $pipeline), [
                'customer_name' => $pipeline->customer_name,
                'customer_phone' => $pipeline->customer_phone,
                'customer_email' => 'customer@gmail.com',
                'current_stage' => 'qualified',
                'probability' => 60,
                'priority' => 'high',
                'branch_id' => $target->id,
            ]);

        $response->assertRedirect();
        $pipeline->refresh();
        $this->assertEquals($target->id, $pipeline->branch_id);

        $log = ActivityLog::where('subject_type', Pipeline::class)
            ->where('subject_id', $pipeline->id)
            ->where('event', 'updated')
            ->first();

        $this->assertNotNull($log);
        $this->assertEquals($target->id, $log->properties['changes']['branch_id']['new'] ?? null);
    }

    public function test_non_admin_cannot_reassign_pipeline_branch(): void
    {
        $origin = $this->branch('HQ');
        $target = $this->branch('C1');
        $pipeline = $this->pipeline($origin);

        $sales = $this->userWithRole('sales_rep', ['sales.view', 'sales.edit'], $origin);

        $response = $this->actingAs($sales)
            ->withHeader('Accept', 'application/json')
            ->putJson(route('sales.pipeline.update', $pipeline), [
                'customer_name' => $pipeline->customer_name,
                'customer_phone' => $pipeline->customer_phone,
                'customer_email' => 'customer@gmail.com',
                'current_stage' => 'qualified',
                'probability' => 70,
                'priority' => 'high',
                'branch_id' => $target->id,
            ]);

        $response->assertStatus(403);
        $pipeline->refresh();
        $this->assertEquals($origin->id, $pipeline->branch_id);
        $this->assertFalse(ActivityLog::where('subject_type', Pipeline::class)->exists());
    }
}
