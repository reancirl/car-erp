<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class VehicleModelPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create vehicle_model permissions
        $permissions = [
            'vehicle_model.view' => 'View vehicle models',
            'vehicle_model.create' => 'Create vehicle models',
            'vehicle_model.edit' => 'Edit vehicle models',
            'vehicle_model.delete' => 'Delete vehicle models',
        ];

        foreach ($permissions as $name => $description) {
            Permission::firstOrCreate(
                ['name' => $name],
                ['guard_name' => 'web']
            );
        }

        // Assign permissions to roles
        $admin = Role::findByName('admin');
        $admin->givePermissionTo(array_keys($permissions));

        // Sales Manager can view and create
        $salesManager = Role::findByName('sales_manager');
        $salesManager->givePermissionTo([
            'vehicle_model.view',
            'vehicle_model.create',
            'vehicle_model.edit',
        ]);

        // Auditor can view
        $auditor = Role::findByName('auditor');
        $auditor->givePermissionTo('vehicle_model.view');

        $this->command->info('Vehicle Model permissions created and assigned successfully!');
    }
}
