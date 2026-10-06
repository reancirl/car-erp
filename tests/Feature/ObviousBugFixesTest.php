<?php

namespace Tests\Feature;

use App\Http\Middleware\RequiresMfa;
use App\Http\Middleware\TrackUserActivity;
use App\Models\Branch;
use App\Models\OdometerReading;
use App\Models\Pipeline;
use App\Models\TestDrive;
use App\Models\User;
use App\Models\UserSession;
use App\Models\WorkOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ObviousBugFixesTest extends TestCase
{
    use RefreshDatabase;

    public function test_overdue_work_orders_store_a_positive_day_count(): void
    {
        $workOrder = WorkOrder::create([
            'branch_id' => $this->branch()->id,
            'work_order_number' => 'WO-BUG-1',
            'next_pms_due_date' => now()->subDays(5),
        ]);

        $workOrder->checkOverdueStatus();

        $this->assertTrue($workOrder->fresh()->is_overdue);
        $this->assertSame(5, $workOrder->fresh()->days_overdue);
    }

    public function test_odometer_history_counts_days_forward_and_flags_a_missed_interval(): void
    {
        $branch = $this->branch();

        OdometerReading::create([
            'vehicle_vin' => 'VINBUGFIX00000001',
            'branch_id' => $branch->id,
            'reading' => 1000,
            'reading_date' => now()->subDays(200),
        ]);

        $latest = OdometerReading::create([
            'vehicle_vin' => 'VINBUGFIX00000001',
            'branch_id' => $branch->id,
            'reading' => 1500,
            'reading_date' => now(),
        ]);

        $this->assertSame(200, $latest->days_diff);
        $this->assertTrue($latest->is_anomaly);
        $this->assertSame('missed_interval', $latest->anomaly_type);
    }

    public function test_open_pipeline_match_ignores_a_closed_deal_with_the_same_phone(): void
    {
        $branch = $this->branch();

        Pipeline::create([
            'branch_id' => $branch->id,
            'customer_name' => 'Closed Deal',
            'customer_phone' => '09171234567',
            'customer_email' => 'closed@example.com',
            'current_stage' => 'lost',
        ]);

        $open = Pipeline::create([
            'branch_id' => $branch->id,
            'customer_name' => 'Open Deal',
            'customer_phone' => '09998887777',
            'customer_email' => 'open@example.com',
            'current_stage' => 'qualified',
        ]);

        $match = TestDrive::findOpenPipelineForContact('09171234567', 'open@example.com');

        $this->assertNotNull($match);
        $this->assertTrue($match->is($open));
    }

    public function test_automatic_stage_changes_are_not_logged_twice(): void
    {
        $pipeline = Pipeline::create([
            'branch_id' => $this->branch()->id,
            'customer_name' => 'Stage Log',
            'customer_phone' => '09170000000',
            'current_stage' => 'qualified',
        ]);

        $pipeline->suppressAutomaticStageLog = true;
        $pipeline->update(['current_stage' => 'quote_sent']);
        $pipeline->logStageChange(
            stage: 'quote_sent',
            previousStage: 'qualified',
            triggerType: 'auto',
            triggerSystem: 'Quote System',
            triggerEvent: 'Quote Generated',
        );

        $this->assertSame(2, $pipeline->stageLogs()->count());
        $this->assertSame(1, $pipeline->stageLogs()->where('trigger_type', 'auto')->count());
    }

    public function test_login_tracks_the_session_id_after_regeneration(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect(route('dashboard', absolute: false));

        $this->assertDatabaseHas('user_sessions', [
            'user_id' => $user->id,
            'session_id' => session()->getId(),
            'status' => 'active',
        ]);
    }

    public function test_idle_sessions_are_logged_out(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $session = $this->app['session.store'];
        $session->start();

        UserSession::create([
            'session_id' => $session->getId(),
            'user_id' => $user->id,
            'login_time' => now()->subHours(3),
            'last_activity_at' => now()->subMinutes(90),
            'status' => 'active',
        ]);

        $request = Request::create('/dashboard', 'GET');
        $request->setLaravelSession($session);

        $response = app(TrackUserActivity::class)->handle(
            $request,
            fn () => response('still-in'),
        );

        $this->assertTrue($response->isRedirect(route('login')));
        $this->assertGuest();
        $this->assertDatabaseHas('user_sessions', [
            'user_id' => $user->id,
            'status' => 'idle_timeout',
        ]);
    }

    public function test_expired_mfa_verification_is_rejected(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $request = Request::create('/roles/1', 'DELETE');
        $request->setLaravelSession($this->app['session.store']);
        $request->session()->start();
        $request->session()->put('mfa_verified_delete_role', now()->subMinutes(45));

        $response = app(RequiresMfa::class)->handle(
            $request,
            fn () => response('allowed'),
            'delete_role',
        );

        $this->assertTrue($response->isRedirect(route('mfa.verify')));
    }

    public function test_legacy_pms_urls_leave_the_sample_pages(): void
    {
        $user = User::factory()->create();
        Permission::findOrCreate('pms-work-orders.view');
        $user->givePermissionTo('pms-work-orders.view');

        $this->actingAs($user)
            ->get('/pms/work-orders')
            ->assertRedirect(route('service.pms-work-orders.index'));
    }

    private function branch(): Branch
    {
        return Branch::create([
            'name' => 'HQ',
            'code' => 'HQ-'.uniqid(),
            'address' => '123 Test',
            'city' => 'Makati',
            'state' => 'NCR',
            'postal_code' => '1200',
            'country' => 'PH',
            'status' => 'active',
        ]);
    }
}
