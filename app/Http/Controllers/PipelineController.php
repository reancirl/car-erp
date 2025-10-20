<?php

namespace App\Http\Controllers;

use App\Models\Pipeline;
use App\Models\Branch;
use App\Models\User;
use App\Models\Lead;
use App\Http\Requests\StorePipelineRequest;
use App\Http\Requests\UpdatePipelineRequest;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PipelineController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Base query with branch filtering
        $query = Pipeline::with(['branch', 'salesRep', 'lead'])
            ->when($request->include_deleted, function ($q) {
                $q->withTrashed();
            })
            ->when(!$user->hasRole('admin'), function ($q) use ($user) {
                // Non-admin: Only see pipelines from their branch
                $q->forUserBranch($user);
            })
            ->when($request->branch_id && $user->hasRole('admin'), function ($q) use ($request) {
                // Admin: Can filter by branch
                $q->where('branch_id', $request->branch_id);
            })
            ->when($request->search, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('customer_name', 'like', "%{$search}%")
                        ->orWhere('customer_email', 'like', "%{$search}%")
                        ->orWhere('customer_phone', 'like', "%{$search}%")
                        ->orWhere('pipeline_id', 'like', "%{$search}%");
                });
            })
            ->when($request->current_stage, fn($q, $stage) => $q->where('current_stage', $stage))
            ->when($request->priority, fn($q, $priority) => $q->where('priority', $priority))
            ->when($request->sales_rep_id, fn($q, $repId) => $q->where('sales_rep_id', $repId))
            ->when($request->probability, function ($q, $probability) {
                if ($probability === 'high') {
                    $q->where('probability', '>=', 80);
                } elseif ($probability === 'medium') {
                    $q->whereBetween('probability', [50, 79]);
                } elseif ($probability === 'low') {
                    $q->where('probability', '<', 50);
                }
            });

        $pipelines = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        // Stats for dashboard
        $statsQuery = clone $query;
        $stats = [
            'active_pipeline' => (clone $statsQuery)->whereNotIn('current_stage', ['lost', 'won'])->count(),
            'auto_logged_events' => (clone $statsQuery)->sum('auto_logged_events_count'),
            'avg_stage_duration' => round((clone $statsQuery)->avg('stage_duration_hours') ?? 0, 1),
            'pipeline_value' => (clone $statsQuery)->whereNotIn('current_stage', ['lost', 'won'])->sum('quote_amount'),
        ];

        // Auto-logging stats (events from today)
        $today = now()->startOfDay();
        $autoLoggingQuery = Pipeline::query()
            ->when(!$user->hasRole('admin'), function ($q) use ($user) {
                $q->forUserBranch($user);
            })
            ->when($request->branch_id && $user->hasRole('admin'), function ($q) use ($request) {
                $q->where('branch_id', $request->branch_id);
            });

        $autoLoggingStats = [
            'lead_events_today' => (clone $autoLoggingQuery)
                ->whereIn('current_stage', ['lead', 'qualified'])
                ->where('created_at', '>=', $today)
                ->count(),
            'quotes_generated' => (clone $autoLoggingQuery)
                ->where('current_stage', 'quote_sent')
                ->where('created_at', '>=', $today)
                ->count(),
            'activities_tracked' => (clone $autoLoggingQuery)
                ->whereIn('current_stage', ['test_drive_scheduled', 'test_drive_completed', 'reservation_made'])
                ->where('created_at', '>=', $today)
                ->count(),
        ];

        // Get sales reps for filter
        $salesReps = User::role('sales_rep')
            ->when(!$user->hasRole('admin'), function ($q) use ($user) {
                $q->where('branch_id', $user->branch_id);
            })
            ->get(['id', 'name']);

        return Inertia::render('sales/pipeline', [
            'pipelines' => $pipelines,
            'stats' => $stats,
            'autoLoggingStats' => $autoLoggingStats,
            'filters' => $request->only(['search', 'current_stage', 'priority', 'sales_rep_id', 'branch_id', 'probability', 'include_deleted']),
            'branches' => $user->hasRole('admin') ? Branch::where('status', 'active')->get() : null,
            'salesReps' => $salesReps,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        // Get sales reps for assignment (from user's branch or all if admin)
        $salesReps = User::role('sales_rep')
            ->when(!$user->hasRole('admin'), function ($q) use ($user) {
                $q->where('branch_id', $user->branch_id);
            })
            ->get(['id', 'name', 'branch_id']);

        // Get leads for linking (from user's branch or all if admin)
        $leads = Lead::with('branch')
            ->when(!$user->hasRole('admin'), function ($q) use ($user) {
                $q->where('branch_id', $user->branch_id);
            })
            ->whereNotIn('status', ['lost'])
            ->get(['id', 'lead_id', 'name', 'email', 'phone', 'branch_id']);

        return Inertia::render('sales/pipeline-create', [
            'branches' => $user->hasRole('admin') ? Branch::where('status', 'active')->get() : null,
            'salesReps' => $salesReps,
            'leads' => $leads,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePipelineRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // Calculate initial lead score
        $pipeline = new Pipeline($data);
        $data['lead_score'] = $pipeline->calculateLeadScore();

        $pipeline = Pipeline::create($data);

        // Log activity
        $this->logCreated(
            module: 'Sales',
            subject: $pipeline,
            description: "Created pipeline opportunity {$pipeline->pipeline_id} - {$pipeline->customer_name}",
            properties: [
                'pipeline_id' => $pipeline->pipeline_id,
                'customer_name' => $pipeline->customer_name,
                'current_stage' => $pipeline->current_stage,
                'probability' => $pipeline->probability,
                'quote_amount' => $pipeline->quote_amount,
            ]
        );

        return redirect()
            ->route('sales.pipeline')
            ->with('success', "Pipeline opportunity {$pipeline->pipeline_id} created successfully!");
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Pipeline $pipeline): Response
    {
        // Authorization check
        if (!$request->user()->hasRole('admin') && $pipeline->branch_id !== $request->user()->branch_id) {
            abort(403, 'You can only view pipelines from your branch.');
        }

        $pipeline->load(['branch', 'salesRep', 'lead', 'stageLogs.triggerUser']);

        return Inertia::render('sales/pipeline-view', [
            'pipeline' => $pipeline,
            'can' => [
                'edit' => $request->user()->can('sales.edit'),
                'delete' => $request->user()->can('sales.delete'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Pipeline $pipeline): Response
    {
        // Authorization check
        if (!$request->user()->hasRole('admin') && $pipeline->branch_id !== $request->user()->branch_id) {
            abort(403, 'You can only edit pipelines from your branch.');
        }

        $pipeline->load(['branch', 'salesRep', 'lead']);

        $salesReps = User::role('sales_rep')
            ->when(!$request->user()->hasRole('admin'), function ($q) use ($request) {
                $q->where('branch_id', $request->user()->branch_id);
            })
            ->get(['id', 'name', 'branch_id']);

        return Inertia::render('sales/pipeline-edit', [
            'pipeline' => $pipeline,
            'salesReps' => $salesReps,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePipelineRequest $request, Pipeline $pipeline): RedirectResponse
    {
        $data = $request->validated();

        // Recalculate lead score if relevant fields changed
        if (isset($data['customer_name']) || isset($data['vehicle_make']) || isset($data['quote_amount']) || isset($data['priority'])) {
            $tempPipeline = new Pipeline(array_merge($pipeline->toArray(), $data));
            $data['lead_score'] = $tempPipeline->calculateLeadScore();
        }

        // Track changes for logging
        $changes = [];
        foreach ($data as $key => $value) {
            if ($pipeline->{$key} != $value) {
                $changes[$key] = [
                    'old' => $pipeline->{$key},
                    'new' => $value,
                ];
            }
        }

        $pipeline->update($data);

        // Log activity
        $this->logUpdated(
            module: 'Sales',
            subject: $pipeline,
            description: "Updated pipeline opportunity {$pipeline->pipeline_id} - {$pipeline->customer_name}",
            properties: [
                'pipeline_id' => $pipeline->pipeline_id,
                'changes' => $changes,
            ]
        );

        return redirect()
            ->route('sales.pipeline')
            ->with('success', "Pipeline opportunity {$pipeline->pipeline_id} updated successfully!");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Pipeline $pipeline): RedirectResponse
    {
        // Authorization check
        if (!$request->user()->hasRole('admin') && $pipeline->branch_id !== $request->user()->branch_id) {
            abort(403, 'You can only delete pipelines from your branch.');
        }

        $pipelineId = $pipeline->pipeline_id;
        $customerName = $pipeline->customer_name;

        // Log activity before deletion
        $this->logDeleted(
            module: 'Sales',
            subject: $pipeline,
            description: "Deleted pipeline opportunity {$pipelineId} - {$customerName}",
            properties: [
                'pipeline_id' => $pipelineId,
                'customer_name' => $customerName,
                'current_stage' => $pipeline->current_stage,
                'probability' => $pipeline->probability,
            ]
        );

        $pipeline->delete();

        return redirect()
            ->route('sales.pipeline')
            ->with('success', "Pipeline opportunity {$pipelineId} deleted successfully!");
    }

    /**
     * Restore a soft-deleted pipeline.
     */
    public function restore(Request $request, $id): RedirectResponse
    {
        try {
            $pipeline = Pipeline::withTrashed()->findOrFail($id);
            
            // Authorization check
            if (!$request->user()->hasRole('admin') && $pipeline->branch_id !== $request->user()->branch_id) {
                abort(403, 'You can only restore pipelines from your branch.');
            }
            
            // Check if already active
            if (!$pipeline->trashed()) {
                return redirect()->back()
                    ->with('error', 'Pipeline is not deleted.');
            }
            
            $pipelineId = $pipeline->pipeline_id;
            $customerName = $pipeline->customer_name;
            
            $pipeline->restore();

            // Log activity
            $this->logRestored(
                module: 'Sales',
                subject: $pipeline,
                description: "Restored pipeline opportunity {$pipelineId} - {$customerName}",
                properties: [
                    'pipeline_id' => $pipelineId,
                    'customer_name' => $customerName,
                    'current_stage' => $pipeline->current_stage,
                ]
            );

            return redirect()
                ->route('sales.pipeline')
                ->with('success', "Pipeline opportunity {$pipelineId} restored successfully!");
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to restore pipeline. Please try again.');
        }
    }

    /**
     * Export pipelines to CSV.
     */
    public function export(Request $request)
    {
        $user = $request->user();

        // Base query with same filters as index
        $query = Pipeline::with(['branch', 'salesRep', 'lead'])
            ->when(!$user->hasRole('admin'), function ($q) use ($user) {
                $q->forUserBranch($user);
            })
            ->when($request->filled('branch_id') && $user->hasRole('admin'), function ($q) use ($request) {
                $q->where('branch_id', $request->branch_id);
            })
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($query) use ($search) {
                    $query->where('customer_name', 'like', "%{$search}%")
                        ->orWhere('customer_email', 'like', "%{$search}%")
                        ->orWhere('customer_phone', 'like', "%{$search}%")
                        ->orWhere('pipeline_id', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('current_stage'), fn($q) => $q->where('current_stage', $request->current_stage))
            ->when($request->filled('priority'), fn($q) => $q->where('priority', $request->priority))
            ->when($request->filled('sales_rep_id'), fn($q) => $q->where('sales_rep_id', $request->sales_rep_id))
            ->when($request->filled('probability'), function ($q) use ($request) {
                $probability = $request->probability;
                if ($probability === 'high') {
                    $q->where('probability', '>=', 80);
                } elseif ($probability === 'medium') {
                    $q->whereBetween('probability', [50, 79]);
                } elseif ($probability === 'low') {
                    $q->where('probability', '<', 50);
                }
            })
            ->orderBy('created_at', 'desc');

        $pipelines = $query->limit(1000)->get();

        // Generate CSV
        $filename = 'pipelines_' . now()->format('Y-m-d_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($pipelines) {
            $file = fopen('php://output', 'w');
            
            fputcsv($file, [
                'Pipeline ID',
                'Customer Name',
                'Phone',
                'Email',
                'Lead ID',
                'Current Stage',
                'Previous Stage',
                'Stage Duration (hours)',
                'Sales Rep',
                'Branch',
                'Vehicle Interest',
                'Vehicle Year',
                'Vehicle Make',
                'Vehicle Model',
                'Quote Amount (₱)',
                'Probability (%)',
                'Priority',
                'Lead Score',
                'Next Action',
                'Next Action Due',
                'Auto Progression',
                'Auto Loss Rule',
                'Follow-up Frequency',
                'Auto Events Count',
                'Manual Notes Count',
                'Attachments Count',
                'Last Activity',
                'Created At',
            ]);

            foreach ($pipelines as $pipeline) {
                fputcsv($file, [
                    $pipeline->pipeline_id,
                    $pipeline->customer_name,
                    $pipeline->customer_phone,
                    $pipeline->customer_email,
                    $pipeline->lead ? $pipeline->lead->lead_id : 'N/A',
                    $pipeline->current_stage,
                    $pipeline->previous_stage ?? 'N/A',
                    $pipeline->stage_duration_hours ?? 'N/A',
                    $pipeline->salesRep ? $pipeline->salesRep->name : 'Unassigned',
                    $pipeline->branch ? $pipeline->branch->name : 'N/A',
                    $pipeline->vehicle_interest ?? 'N/A',
                    $pipeline->vehicle_year ?? 'N/A',
                    $pipeline->vehicle_make ?? 'N/A',
                    $pipeline->vehicle_model ?? 'N/A',
                    $pipeline->quote_amount ?? 'N/A',
                    $pipeline->probability,
                    $pipeline->priority,
                    $pipeline->lead_score,
                    $pipeline->next_action ?? 'N/A',
                    $pipeline->next_action_due ? $pipeline->next_action_due->format('Y-m-d H:i:s') : 'N/A',
                    $pipeline->auto_progression_enabled ? 'Yes' : 'No',
                    $pipeline->auto_loss_rule_enabled ? 'Yes' : 'No',
                    $pipeline->follow_up_frequency,
                    $pipeline->auto_logged_events_count,
                    $pipeline->manual_notes_count,
                    $pipeline->attachments_count,
                    $pipeline->last_activity_at ? $pipeline->last_activity_at->format('Y-m-d H:i:s') : 'N/A',
                    $pipeline->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        // Log export activity
        $this->logActivity(
            action: 'sales.export',
            module: 'Sales',
            description: "Exported {$pipelines->count()} pipeline records to CSV",
            properties: [
                'filename' => $filename,
                'record_count' => $pipelines->count(),
                'filters' => $request->only(['search', 'current_stage', 'priority', 'sales_rep_id', 'branch_id', 'probability']),
            ]
        );

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Run auto-loss detection to mark inactive pipelines as lost
     */
    public function runAutoLossDetection(Request $request): RedirectResponse
    {
        $user = $request->user();
        
        // Only allow admin or sales managers to run this
        if (!$user->hasAnyRole(['admin', 'sales_manager'])) {
            abort(403, 'You do not have permission to run auto-loss detection.');
        }

        $service = app(\App\Services\PipelineAutoProgressionService::class);
        $result = $service->detectAndMarkInactivePipelines();

        // Log activity
        $this->logActivity(
            action: 'sales.auto_loss_detection',
            module: 'Sales',
            description: "Ran auto-loss detection - marked {$result['count']} pipelines as lost",
            properties: [
                'marked_count' => $result['count'],
                'pipelines' => $result['pipelines'],
            ]
        );

        if ($result['count'] > 0) {
            return redirect()
                ->route('sales.pipeline')
                ->with('success', "Auto-loss detection completed! Marked {$result['count']} inactive pipeline(s) as lost.");
        }

        return redirect()
            ->route('sales.pipeline')
            ->with('info', 'Auto-loss detection completed. No inactive pipelines found.');
    }
}
