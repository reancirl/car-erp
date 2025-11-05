<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class TestUsersSeeder extends Seeder
{
    /**
     * Seed demo users for each available role.
     */
    public function run(): void
    {
        $branches = Branch::query()->get(['id', 'code', 'name']);

        if ($branches->isEmpty()) {
            $this->command?->warn('Skipping test users seeding because no branches are available.');

            return;
        }

        $roles = Role::query()->pluck('name');

        if ($roles->isEmpty()) {
            $this->command?->warn('Skipping test users seeding because no roles are available.');

            return;
        }

        $password = Hash::make('password');

        foreach ($branches as $branch) {
            $branchSlug = Str::slug($branch->code ?: $branch->name, '.');
            $branchSlug = $branchSlug !== '' ? $branchSlug : 'branch';

            foreach ($roles as $roleName) {
                $roleSlug = Str::slug($roleName, '.');
                $roleSlug = $roleSlug !== '' ? $roleSlug : 'role';
                $email = sprintf('%s.%s.tester@car-erp.test', $branchSlug, $roleSlug);

                $user = User::updateOrCreate(
                    ['email' => $email],
                    [
                        'name' => Str::headline(sprintf('%s %s Demo', $branch->name, $roleName)),
                        'password' => $password,
                        'branch_id' => $branch->id,
                    ]
                );

                $user->syncRoles([$roleName]);
            }
        }
    }
}
