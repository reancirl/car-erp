<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class FeedbackIntakeTest extends TestCase
{
    use RefreshDatabase;

    private string $intakeUrl = 'https://api.swiftlyph.online/api/v1/intake/test-key/feedback';

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.swiftly.intake_url' => $this->intakeUrl]);
    }

    public function test_guests_cannot_open_the_feedback_form(): void
    {
        $this->get(route('feedback.create'))
            ->assertRedirect(route('login'));
    }

    public function test_a_signed_in_user_can_open_the_feedback_form(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('feedback.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('feedback/create')
                ->has('types', 3));
    }

    public function test_feedback_is_sent_to_the_intake_api_with_the_signed_in_user(): void
    {
        Http::fake([
            $this->intakeUrl => Http::response(['data' => ['id' => 30, 'status' => 'pending']], 201),
        ]);

        $user = User::factory()->create([
            'name' => 'Dana Reyes',
            'email' => 'dana@example.com',
        ]);

        $this->actingAs($user)
            ->post(route('feedback.store'), [
                'type' => 'bug',
                'title' => 'Checkout button does nothing',
                'description' => 'Safari 17, nothing happens when I click Pay.',
            ])
            ->assertRedirect(route('feedback.create'))
            ->assertSessionHas('success');

        Http::assertSent(function (Request $request) {
            return $request->url() === $this->intakeUrl
                && $request['type'] === 'bug'
                && $request['title'] === 'Checkout button does nothing'
                && $request['description'] === 'Safari 17, nothing happens when I click Pay.'
                && $request['reporter_name'] === 'Dana Reyes'
                && $request['reporter_email'] === 'dana@example.com';
        });
    }

    public function test_a_screenshot_is_attached_when_one_is_chosen(): void
    {
        Http::fake([
            $this->intakeUrl => Http::response(['data' => ['id' => 31, 'status' => 'pending']], 201),
        ]);

        $this->actingAs(User::factory()->create())
            ->post(route('feedback.store'), [
                'type' => 'feature',
                'title' => 'Export the pipeline',
                'description' => 'Sales needs a spreadsheet of the current board.',
                'screenshot' => UploadedFile::fake()->image('board.png'),
            ])
            ->assertRedirect(route('feedback.create'));

        Http::assertSent(function (Request $request) {
            $body = $request->body();

            return $request->url() === $this->intakeUrl
                && str_contains($body, 'name="type"')
                && str_contains($body, 'feature')
                && str_contains($body, 'name="screenshot"')
                && str_contains($body, 'filename="screenshot.png"');
        });
    }

    public function test_a_change_request_uses_the_change_type(): void
    {
        Http::fake([
            $this->intakeUrl => Http::response(['data' => ['id' => 32, 'status' => 'pending']], 201),
        ]);

        $this->actingAs(User::factory()->create())
            ->post(route('feedback.store'), [
                'type' => 'change',
                'title' => 'Rename the release checklist',
                'description' => 'Call the last step Handover instead of Release.',
            ])
            ->assertRedirect(route('feedback.create'));

        Http::assertSent(fn (Request $request) => $request['type'] === 'feature'
            && $request['title'] === 'Change request: Rename the release checklist');
    }

    public function test_invalid_feedback_is_not_sent(): void
    {
        Http::fake();

        $this->actingAs(User::factory()->create())
            ->post(route('feedback.store'), [
                'type' => 'other',
                'title' => '',
                'description' => '',
            ])
            ->assertSessionHasErrors(['type', 'title', 'description']);

        Http::assertNothingSent();
    }
}
