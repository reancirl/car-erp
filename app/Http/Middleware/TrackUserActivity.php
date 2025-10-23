<?php

namespace App\Http\Middleware;

use App\Models\UserSession;
use App\Models\SessionSetting;
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
                // Update activity
                $session->updateActivity();
                
                // Get idle timeout from database settings
                $idleThreshold = SessionSetting::get('auto_logout_minutes', 30);
                $minutesSinceLastActivity = $session->last_activity_at->diffInMinutes(now());
                
                if ($minutesSinceLastActivity > $idleThreshold) {
                    // Mark as idle timeout
                    $session->endSession('idle_timeout');
                    auth()->logout();
                    return redirect()->route('login')->with('warning', 'Session expired due to inactivity');
                }
            }
        }

        return $next($request);
    }
}
