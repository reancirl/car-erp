<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles, permissions, branches, and supporting data
        $this->call([
            RolePermissionSeeder::class,
            BranchSeeder::class,
            AttributeDefinitionsSeeder::class,
            VehicleModelPermissionsSeeder::class,
        ]);

        // Ensure there is a default admin user we can reference in seed data
        $admin = User::firstOrCreate(
            ['email' => User::SUPER_ADMIN_EMAIL],
            [
                'name' => 'Admin User',
                'password' => Hash::make('mikaroerp2^2!5'),
                'branch_id' => 1,
            ]
        );
        $admin->assignRole('admin');
    }
}
