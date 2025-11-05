<?php

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class EnsurePlaywrightLoginUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'playwright:ensure-login-user
        {--email=playwright.login.tester@car-erp.test : Email address for the Playwright login user}
        {--password=password : Password to set for the Playwright login user}
        {--role=admin : Optional role to assign when available}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Ensure a deterministic login user exists for Playwright end-to-end tests.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = (string) $this->option('email');
        $password = (string) $this->option('password');
        $requestedRole = (string) $this->option('role');

        $branchId = Branch::query()->active()->value('id') ?? Branch::query()->value('id');

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Playwright Login Tester',
                'password' => Hash::make($password),
                'branch_id' => $branchId,
            ]
        );

        if ($user->email_verified_at === null) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        $roleName = null;
        if ($requestedRole !== '') {
            $roleName = Role::query()->where('name', $requestedRole)->value('name');
        }

        if ($roleName !== null) {
            $user->syncRoles([$roleName]);
            $this->info("Assigned role [{$roleName}] to {$user->email}.");
        } elseif ($user->roles()->exists()) {
            $this->warn("No matching role found for '{$requestedRole}'. Existing role assignments retained.");
        } else {
            $this->warn("No matching role found for '{$requestedRole}'. User created without role assignments.");
        }

        $this->info("Playwright login user is ready: {$user->email}");

        return self::SUCCESS;
    }
}
