<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        $query = ActivityLog::with('causer:id,name', 'branch:id,name')
            ->orderBy('created_at', 'desc');

        // Branch filtering based on role
        if (!$user->hasRole('admin')) {
            // Non-admin: Only see logs from their branch
            $query->where('branch_id', $user->branch_id);
        } elseif ($request->filled('branch_id')) {
            // Admin: Can filter by branch
            $query->where('branch_id', $request->branch_id);
        }

        // Apply other filters
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
            // Check if subject is soft deleted
            $subjectDeleted = false;
            if ($log->subject_type && $log->subject_id) {
                try {
                    $model = app($log->subject_type)::withTrashed()->find($log->subject_id);
                    $subjectDeleted = $model && method_exists($model, 'trashed') ? $model->trashed() : false;
                } catch (\Exception $e) {
                    // Model doesn't exist or doesn't support soft deletes
                }
            }

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
                'subject_type' => $log->subject_type,
                'subject_id' => $log->subject_id,
                'subject_deleted' => $subjectDeleted,
            ];
        });

        // Get statistics
        $stats = $this->getStatistics($user, $request->branch_id);

        return Inertia::render('audit/activity-logs', [
            'logs' => $logs,
            'stats' => $stats,
            'filters' => $request->only(['module', 'status', 'search', 'branch_id']),
            'branches' => $user->hasRole('admin') ? Branch::where('status', 'active')->get(['id', 'name', 'code']) : null,
        ]);
    }

    private function getStatistics($user, $branchId = null): array
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        // Base query with branch filtering
        $baseQuery = ActivityLog::query();
        if (!$user->hasRole('admin')) {
            $baseQuery->where('branch_id', $user->branch_id);
        } elseif ($branchId) {
            $baseQuery->where('branch_id', $branchId);
        }

        // Total events today
        $eventsToday = (clone $baseQuery)->whereDate('created_at', $today)->count();
        $eventsYesterday = (clone $baseQuery)->whereDate('created_at', $yesterday)->count();
        $eventsChange = $eventsYesterday > 0
            ? round((($eventsToday - $eventsYesterday) / $eventsYesterday) * 100)
            : 0;

        // Active users (users who performed actions today)
        $activeUsers = (clone $baseQuery)->whereDate('created_at', $today)
            ->whereNotNull('causer_id')
            ->distinct('causer_id')
            ->count('causer_id');

        // Failed actions today
        $failedActions = (clone $baseQuery)->whereDate('created_at', $today)
            ->where('status', 'failed')
            ->count();

        // Flagged events (last 7 days)
        $flaggedEvents = (clone $baseQuery)->where('status', 'flagged')
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
        $user = $request->user();
        
        $query = ActivityLog::with('causer:id,name')
            ->orderBy('created_at', 'desc');

        // Branch filtering for export
        if (!$user->hasRole('admin')) {
            $query->where('branch_id', $user->branch_id);
        } elseif ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

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
