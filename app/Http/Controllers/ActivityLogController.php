<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ActivityLog::with('causer:id,name')
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('module')) {
            $query->where('module', $request->module);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', '%' . $search . '%')
                  ->orWhere('action', 'like', '%' . $search . '%');
            });
        }

        // Paginate results
        $logs = $query->paginate(50)->through(function ($log) {
            return [
                'id' => $log->id,
                'action' => $log->action,
                'user' => $log->causer ? $log->causer->name : 'System',
                'module' => $log->module,
                'timestamp' => $log->created_at->format('Y-m-d H:i:s'),
                'ip_address' => $log->ip_address,
                'details' => $log->description,
                'status' => $log->status,
                'properties' => $log->properties,
            ];
        });

        // Get statistics
        $stats = $this->getStatistics();

        return Inertia::render('audit/activity-logs', [
            'logs' => $logs,
            'stats' => $stats,
            'filters' => $request->only(['module', 'status', 'search']),
        ]);
    }

    private function getStatistics(): array
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        // Total events today
        $eventsToday = ActivityLog::whereDate('created_at', $today)->count();
        $eventsYesterday = ActivityLog::whereDate('created_at', $yesterday)->count();
        $eventsChange = $eventsYesterday > 0
            ? round((($eventsToday - $eventsYesterday) / $eventsYesterday) * 100)
            : 0;

        // Active users (users who performed actions today)
        $activeUsers = ActivityLog::whereDate('created_at', $today)
            ->whereNotNull('causer_id')
            ->distinct('causer_id')
            ->count('causer_id');

        // Failed actions today
        $failedActions = ActivityLog::whereDate('created_at', $today)
            ->where('status', 'failed')
            ->count();

        // Flagged events (last 7 days)
        $flaggedEvents = ActivityLog::where('status', 'flagged')
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        return [
            'total_events_today' => $eventsToday,
            'events_change' => $eventsChange,
            'active_users' => $activeUsers,
            'failed_actions' => $failedActions,
            'flagged_events' => $flaggedEvents,
        ];
    }

    public function export(Request $request)
    {
        $query = ActivityLog::with('causer:id,name')
            ->orderBy('created_at', 'desc');

        // Apply the same filters
        if ($request->filled('module')) {
            $query->where('module', $request->module);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $logs = $query->limit(1000)->get();

        // Generate CSV
        $filename = 'activity_logs_' . now()->format('Y-m-d_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($logs) {
            $file = fopen('php://output', 'w');
            
            fputcsv($file, ['ID', 'Timestamp', 'User', 'Action', 'Module', 'Status', 'IP Address', 'Description']);

            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->created_at->format('Y-m-d H:i:s'),
                    $log->causer ? $log->causer->name : 'System',
                    $log->action,
                    $log->module,
                    $log->status,
                    $log->ip_address,
                    $log->description,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
