<?php

namespace App\Http\Controllers;

use App\Models\UserSession;
use App\Models\User;
use App\Models\SessionSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class TimeTrackingController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        
        // Date range filtering (default: today)
        $startDate = $request->get('start_date', now()->startOfDay());
        $endDate = $request->get('end_date', now()->endOfDay());
        
        // Role filter
        $roleFilter = $request->get('role');
        
        // Status filter
        $statusFilter = $request->get('status');
        
        // Search filter
        $search = $request->get('search');

        // Build query
        $sessionsQuery = UserSession::with(['user.roles'])
            ->whereBetween('login_time', [$startDate, $endDate])
            ->orderBy('login_time', 'desc');

        // Apply filters
        if ($search) {
            $sessionsQuery->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($roleFilter && $roleFilter !== 'all') {
            $sessionsQuery->whereHas('user.roles', function ($q) use ($roleFilter) {
                $q->where('name', $roleFilter);
            });
        }

        if ($statusFilter && $statusFilter !== 'all') {
            $sessionsQuery->where('status', $statusFilter);
        }

        // Get sessions with pagination
        $sessions = $sessionsQuery->paginate(20);

        // Calculate stats
        $stats = $this->calculateStats($startDate, $endDate);

        // Format sessions for frontend
        $formattedSessions = $sessions->map(function ($session) {
            return [
                'id' => $session->id,
                'user' => $session->user->name,
                'user_email' => $session->user->email,
                'role' => $session->user->roles->first()?->name ?? 'no_role',
                'login_time' => $session->login_time->format('Y-m-d H:i:s'),
                'logout_time' => $session->logout_time?->format('Y-m-d H:i:s'),
                'session_duration' => $session->getDurationFormatted(),
                'idle_time' => $session->getIdleTimeFormatted(),
                'ip_address' => $session->ip_address,
                'status' => $session->status,
                'activities' => $session->activity_count,
                'logout_reason' => $session->logout_reason,
            ];
        });

        // Get session settings
        $settings = [
            'idle_warning_minutes' => SessionSetting::get('idle_warning_minutes', 15),
            'auto_logout_minutes' => SessionSetting::get('auto_logout_minutes', 30),
            'grace_period_minutes' => SessionSetting::get('grace_period_minutes', 5),
        ];

        return Inertia::render('audit/time-tracking', [
            'sessions' => [
                'data' => $formattedSessions,
                'pagination' => [
                    'current_page' => $sessions->currentPage(),
                    'last_page' => $sessions->lastPage(),
                    'per_page' => $sessions->perPage(),
                    'total' => $sessions->total(),
                ],
            ],
            'stats' => $stats,
            'settings' => $settings,
            'filters' => [
                'search' => $search,
                'role' => $roleFilter,
                'status' => $statusFilter,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    private function calculateStats($startDate, $endDate)
    {
        // Active sessions (currently logged in)
        $activeSessions = UserSession::active()
            ->whereNull('logout_time')
            ->count();

        // Average session time (completed sessions only)
        $avgSessionMinutes = UserSession::whereBetween('login_time', [$startDate, $endDate])
            ->whereNotNull('logout_time')
            ->get()
            ->avg(function ($session) {
                return $session->calculateDuration();
            }) ?? 0;

        $avgSessionFormatted = $this->formatMinutes($avgSessionMinutes);

        // Idle timeouts count
        $idleTimeouts = UserSession::whereBetween('login_time', [$startDate, $endDate])
            ->where('status', 'idle_timeout')
            ->count();

        // Total activities
        $totalActivities = UserSession::whereBetween('login_time', [$startDate, $endDate])
            ->sum('activity_count');

        // Forced logouts
        $forcedLogouts = UserSession::whereBetween('login_time', [$startDate, $endDate])
            ->where('status', 'forced_logout')
            ->count();

        // Total sessions
        $totalSessions = UserSession::whereBetween('login_time', [$startDate, $endDate])
            ->count();

        return [
            'active_sessions' => $activeSessions,
            'avg_session_time' => $avgSessionFormatted,
            'idle_timeouts' => $idleTimeouts,
            'total_activities' => $totalActivities,
            'forced_logouts' => $forcedLogouts,
            'total_sessions' => $totalSessions,
        ];
    }

    private function formatMinutes($minutes): string
    {
        if ($minutes < 60) {
            return sprintf('%dm', round($minutes));
        }
        
        $hours = floor($minutes / 60);
        $mins = round($minutes % 60);
        
        return sprintf('%dh %dm', $hours, $mins);
    }

    public function updateIdleTimes()
    {
        // Update idle times for all active sessions
        $activeSessions = UserSession::active()->whereNull('logout_time')->get();
        
        foreach ($activeSessions as $session) {
            $session->calculateIdleTime();
        }

        return response()->json([
            'message' => 'Idle times updated',
            'updated' => $activeSessions->count(),
        ]);
    }

    public function forceLogout(Request $request, $sessionId)
    {
        $session = UserSession::findOrFail($sessionId);
        
        // Only allow admins or auditors to force logout
        if (!auth()->user()->hasAnyRole(['admin', 'auditor'])) {
            abort(403, 'Unauthorized');
        }

        $session->endSession('forced_logout');

        return redirect()->back()->with('success', 'User session terminated');
    }

    public function saveSettings(Request $request)
    {
        // Only allow admins or auditors to change settings
        if (!auth()->user()->hasAnyRole(['admin', 'auditor'])) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'idle_warning_minutes' => 'required|integer|min:1|max:120',
            'auto_logout_minutes' => 'required|integer|min:5|max:240',
            'grace_period_minutes' => 'required|integer|min:1|max:60',
        ]);

        // Validate that auto_logout is greater than idle_warning
        if ($validated['auto_logout_minutes'] <= $validated['idle_warning_minutes']) {
            return redirect()->back()->withErrors([
                'auto_logout_minutes' => 'Auto logout must be greater than idle warning time'
            ]);
        }

        // Save settings
        SessionSetting::set('idle_warning_minutes', $validated['idle_warning_minutes']);
        SessionSetting::set('auto_logout_minutes', $validated['auto_logout_minutes']);
        SessionSetting::set('grace_period_minutes', $validated['grace_period_minutes']);

        return redirect()->back()->with('success', 'Session settings updated successfully');
    }
}
