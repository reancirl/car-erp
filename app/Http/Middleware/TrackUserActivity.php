<?php

namespace App\Http\Middleware;

use App\Models\SessionSetting;
use App\Models\UserSession;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackUserActivity
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
            $sessionId = session()->getId();

            // Find active session for this user
            $session = UserSession::where('session_id', $sessionId)
                ->where('user_id', auth()->id())
                ->where('status', 'active')
                ->whereNull('logout_time')
                ->first();

            if ($session) {
                $idleThreshold = (int) SessionSetting::get('auto_logout_minutes', 30);
                $minutesSinceLastActivity = $session->last_activity_at
                    ? (int) $session->last_activity_at->diffInMinutes(now(), true)
                    : 0;

                if ($minutesSinceLastActivity > $idleThreshold) {
                    $session->calculateIdleTime();
                    $session->endSession('idle_timeout');
                    auth()->logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();

                    return redirect()->route('login')->with('warning', 'Session expired due to inactivity');
                }

                $session->updateActivity();
            }
        }

        return $next($request);
    }
}
