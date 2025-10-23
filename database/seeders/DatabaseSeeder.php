<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles and permissions first
        $this->call(RolePermissionSeeder::class);
        
        // Seed branches
        $this->call(BranchSeeder::class);
        
        // Seed attribute definitions for inventory system
        $this->call(AttributeDefinitionsSeeder::class);

        $this->call(VehicleModelPermissionsSeeder::class);

        // Create only admin user
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@admin.com',
            'password' => 'password',
            'branch_id' => 1, // Assign to HQ branch
        ]);
        $admin->assignRole('admin');
    }
}
