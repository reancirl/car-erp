<?php

namespace App\Listeners;

use App\Models\UserSession;
use Illuminate\Auth\Events\Logout;

class EndUserSession
{
    /**
     * Handle the event.
     */
    public function handle(Logout $event): void
    {
        if (!$event->user) {
            return;
        }

        $sessionId = session()->getId();

        // Find the active session and end it
        $session = UserSession::where('session_id', $sessionId)
            ->where('user_id', $event->user->id)
            ->where('status', 'active')
            ->whereNull('logout_time')
            ->first();

        if ($session) {
            $session->endSession('normal_logout');
        }
    }
}
