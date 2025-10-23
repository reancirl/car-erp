<?php

namespace App\Listeners;

use App\Models\UserSession;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Request;

class CreateUserSession
{
    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        $user = $event->user;
        $sessionId = session()->getId();

        // Check if session already exists (prevent duplicates)
        $existingSession = UserSession::where('session_id', $sessionId)
            ->where('user_id', $user->id)
            ->first();

        if ($existingSession) {
            // Update existing session instead of creating duplicate
            $existingSession->update([
                'login_time' => now(),
                'ip_address' => Request::ip(),
                'user_agent' => Request::userAgent(),
                'last_activity_at' => now(),
                'status' => 'active',
                'logout_time' => null,
                'logout_reason' => null,
            ]);
            return;
        }

        // Create new session
        UserSession::create([
            'session_id' => $sessionId,
            'user_id' => $user->id,
            'login_time' => now(),
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'last_activity_at' => now(),
            'status' => 'active',
        ]);
    }
}
