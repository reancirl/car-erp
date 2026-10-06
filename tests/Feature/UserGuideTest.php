<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserGuideTest extends TestCase
{
    use RefreshDatabase;

    public function test_anyone_can_open_the_user_guide(): void
    {
        $this->get(route('guide'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('public/user-guide'));
    }

    public function test_a_signed_in_user_can_open_the_user_guide(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('guide'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('public/user-guide'));
    }
}
