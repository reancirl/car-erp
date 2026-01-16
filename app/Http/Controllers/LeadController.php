<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Branch;
use App\Models\User;
use App\Http\Requests\StoreLeadRequest;
use App\Http\Requests\UpdateLeadRequest;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    use LogsActivity;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Base query with branch filtering
        $query = Lead::with(['branch', 'assignedUser'])
            ->when($request->include_deleted, function ($q) {
                $q->withTrashed();
            })
            ->when(!$user->hasRole('admin'), function ($q) use ($user) {
                // Non-admin: Only see leads from their branch
                $q->forUserBranch($user);
            })
            ->when($request->branch_id && $user->hasRole('admin'), function ($q) use ($request) {
                // Admin: Can filter by branch
                $q->where('branch_id', $request->branch_id);
            })
            ->when($request->search, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('lead_id', 'like', "%{$search}%");
                });
            })
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->source, fn($q, $source) => $q->where('source', $source))
            ->when($request->lead_score, function ($q, $score) {
                if ($score === 'high') {
                    $q->where('lead_score', '>=', 80);
                } elseif ($score === 'medium') {
                    $q->whereBetween('lead_score', [60, 79]);
                } elseif ($score === 'low') {
                    $q->where('lead_score', '<', 60);
                }
            });

        $leads = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        // Stats for dashboard
        $statsQuery = clone $query;
        $stats = [
            'total' => $statsQuery->count(),
            'hot' => (clone $statsQuery)->where('status', 'hot')->count(),
            'conversion_rate' => round((clone $statsQuery)->avg('conversion_probability') ?? 0, 1),
            'suspicious' => (clone $statsQuery)->where('fake_lead_score', '>', 70)->count(),
        ];

        // Upcoming follow-ups (7 days window)
        $upcomingFollowups = (clone $query)
            ->whereNotIn('status', ['lost', 'unqualified'])
            ->whereNotNull('next_followup_at')
            ->whereBetween('next_followup_at', [now(), now()->addDays(7)])
            ->orderBy('next_followup_at')
            ->limit(10)
            ->get([
                'id',
                'lead_id',
                'name',
                'phone',
                'email',
                'next_followup_at',
                'status',
                'branch_id',
                'assigned_to',
            ])
            ->map(function ($lead) {
                return [
                    'id' => $lead->id,
                    'lead_id' => $lead->lead_id,
                    'name' => $lead->name,
                    'phone' => $lead->phone,
                    'email' => $lead->email,
                    'next_followup_at' => optional($lead->next_followup_at)->toIso8601String(),
                    'status' => $lead->status,
                    'branch' => $lead->branch?->only(['id', 'name', 'code']),
                    'assigned_user' => $lead->assignedUser?->only(['id', 'name']),
                ];
            });

        return Inertia::render('sales/lead-management', [
            'leads' => $leads,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'source', 'branch_id', 'lead_score', 'include_deleted']),
            'branches' => $user->hasRole('admin') ? Branch::where('status', 'active')->get() : null,
            'upcomingFollowups' => $upcomingFollowups,
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

        // Get vehicle models for vehicle interest dropdown
        $vehicleModels = \App\Models\VehicleModel::where('is_active', true)
            ->orderBy('make')
            ->orderBy('model')
            ->orderBy('year', 'desc')
            ->get(['id', 'make', 'model', 'year', 'body_type']);

        return Inertia::render('sales/lead-create', [
            'branches' => $user->hasRole('admin') ? Branch::where('status', 'active')->get() : null,
            'salesReps' => $salesReps,
            'vehicleModels' => $vehicleModels,
        ]);
    }

    /**
     * Download a CSV template for lead imports.
     */
    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="lead-import-template-test.csv"',
        ];

        $callback = function () {
            $file = fopen('php://output', 'w');
            fputcsv($file, [
                'name',
                'email',
                'phone',
                'location',
                'ip_address',
                'source',
                'status',
                'priority',
                'vehicle_interest',
                'vehicle_model_code',
                'budget_min',
                'budget_max',
                'purchase_timeline',
                'assigned_to_email',
                'next_followup_at',
                'contact_method',
                'branch_code',
                'notes',
                'tags (pipe-separated)',
            ]);
            fputcsv($file, [
                'Juan Dela Cruz',
                'juan@example.com',
                '+639171234567',
                'Cebu City',
                '192.168.1.10',
                'web_form',
                'new',
                'medium',
                'Toyota Vios',
                'Vios_2023_G',
                '800000',
                '1000000',
                'soon',
                'sales.rep@example.com',
                '2025-02-10',
                'phone',
                'HQ (required for admins)',
                'HQ',
                'Met at auto show',
                'hot_lead|financing_needed',
            ]);
            fputcsv($file, [
                'Maria Santos',
                'maria@example.com',
                '+639181111111',
                'Davao City',
                '172.16.0.5',
                'social_media',
                'contacted',
                'high',
                'Honda Civic',
                'Civic_2024_RS',
                '1200000',
                '1500000',
                'immediate',
                'sales.manager@example.com',
                '2025-02-08',
                'email',
                'DVO',
                'Requested brochure',
                'urgent|trade_in',
            ]);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Bulk import leads from CSV.
     */
    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        $user = $request->user();
        $path = $request->file('file')->getRealPath();
        $handle = fopen($path, 'r');
        if (! $handle) {
            return back()->withErrors(['file' => 'Unable to read uploaded file.']);
        }

        $header = fgetcsv($handle);
        if (! $header) {
            fclose($handle);
            return back()->withErrors(['file' => 'File is empty or invalid.']);
        }

        $header = array_map(fn($h) => strtolower(trim($h)), $header);

        $created = 0;
        $failed = [];

        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) === 1 && trim($row[0]) === '') {
                continue; // skip empty lines
            }

            $data = array_combine($header, $row);
            if ($data === false) {
                $failed[] = ['row' => $row, 'error' => 'Column mismatch'];
                continue;
            }

            $payload = [
                'name' => $data['name'] ?? null,
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'location' => $data['location'] ?? null,
                'ip_address' => $data['ip_address'] ?? null,
                'source' => $data['source'] ?? 'web_form',
                'status' => $data['status'] ?? 'new',
                'priority' => $data['priority'] ?? 'medium',
                'purchase_timeline' => $data['purchase_timeline'] ?? 'exploring',
                'vehicle_interest' => $data['vehicle_interest'] ?? null,
                'vehicle_model_id' => isset($data['vehicle_model_code'])
                    ? optional(\App\Models\VehicleModel::where('model_code', $data['vehicle_model_code'])->first())->id
                    : null,
                'budget_min' => $data['budget_min'] ?? null,
                'budget_max' => $data['budget_max'] ?? null,
                'assigned_to' => isset($data['assigned_to_email'])
                    ? optional(User::where('email', $data['assigned_to_email'])->first())->id
                    : null,
                'next_followup_at' => $data['next_followup_at'] ?? null,
                'contact_method' => $data['contact_method'] ?? null,
                'notes' => $data['notes'] ?? null,
                'tags' => isset($data['tags (pipe-separated)']) ? explode('|', $data['tags (pipe-separated)']) : null,
                'branch_id' => $user->hasRole('admin')
                    ? optional(Branch::where('code', $data['branch_code'] ?? null)->first())->id
                    : $user->branch_id,
            ];

            $validator = Validator::make($payload, [
                'name' => 'required|string|max:255',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:50',
                'location' => 'nullable|string|max:255',
                'ip_address' => 'nullable|string|max:45',
                'source' => 'required|string|max:100',
                'status' => 'required|string|max:100',
                'vehicle_interest' => 'nullable|string|max:255',
                'notes' => 'nullable|string|max:1000',
                'branch_id' => 'required|exists:branches,id',
                'priority' => 'nullable|string|max:50',
                'purchase_timeline' => 'nullable|string|max:50',
                'vehicle_model_id' => 'nullable|exists:vehicle_models,id',
                'budget_min' => 'nullable|numeric',
                'budget_max' => 'nullable|numeric',
                'assigned_to' => 'nullable|exists:users,id',
                'next_followup_at' => 'nullable|date',
                'contact_method' => 'nullable|string|max:100',
                'tags' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                $failed[] = ['row' => $payload, 'error' => $validator->errors()->first()];
                continue;
            }

            $dataForLead = $validator->validated();

            // Calculate scores and flags
            $dataForLead['lead_score'] = $this->calculateLeadScore($dataForLead);
            $dataForLead['conversion_probability'] = $this->calculateConversionProbability($dataForLead);
            [$dataForLead['fake_lead_score'], $dataForLead['duplicate_flags']] = $this->detectSuspiciousLead($dataForLead);

            Lead::create($dataForLead);
            $created++;
        }

        fclose($handle);

        $message = "{$created} lead(s) imported successfully.";
        if (! empty($failed)) {
            $message .= ' Some rows were skipped.';
        }

        return redirect()->route('sales.lead-management')
            ->with('success', $message)
            ->with('import_failed', $failed);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLeadRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // Calculate initial lead score based on source and priority
        $data['lead_score'] = $this->calculateLeadScore($data);
        $data['conversion_probability'] = $this->calculateConversionProbability($data);
        
        // Calculate fake lead score and detect duplicates
        [$data['fake_lead_score'], $data['duplicate_flags']] = $this->detectSuspiciousLead($data);

        $lead = Lead::create($data);

        // Log activity
        $this->logCreated(
            module: 'Sales',
            subject: $lead,
            description: "Created lead {$lead->lead_id} - {$lead->name} ({$lead->source})",
            properties: [
                'lead_id' => $lead->lead_id,
                'name' => $lead->name,
                'email' => $lead->email,
                'source' => $lead->source,
                'status' => $lead->status,
                'lead_score' => $lead->lead_score,
            ]
        );

        return redirect()
            ->route('sales.lead-management')
            ->with('success', "Lead {$lead->lead_id} created successfully!");
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Lead $lead): Response
    {
        // Authorization check
        if (!$request->user()->hasRole('admin') && $lead->branch_id !== $request->user()->branch_id) {
            abort(403, 'You can only view leads from your branch.');
        }

        $lead->load(['branch', 'assignedUser']);

        return Inertia::render('sales/lead-view', [
            'lead' => $lead,
            'can' => [
                'edit' => $request->user()->can('sales.edit'),
                'delete' => $request->user()->can('sales.delete'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Lead $lead): Response
    {
        // Authorization check
        if (!$request->user()->hasRole('admin') && $lead->branch_id !== $request->user()->branch_id) {
            abort(403, 'You can only edit leads from your branch.');
        }

        $lead->load(['branch', 'assignedUser']);

        $salesReps = User::role('sales_rep')
            ->when(!$request->user()->hasRole('admin'), function ($q) use ($request) {
                $q->where('branch_id', $request->user()->branch_id);
            })
            ->get(['id', 'name', 'branch_id']);

        // Get vehicle models for vehicle interest dropdown
        $vehicleModels = \App\Models\VehicleModel::where('is_active', true)
            ->orderBy('make')
            ->orderBy('model')
            ->orderBy('year', 'desc')
            ->get(['id', 'make', 'model', 'year', 'body_type']);

        return Inertia::render('sales/lead-edit', [
            'lead' => $lead,
            'salesReps' => $salesReps,
            'vehicleModels' => $vehicleModels,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateLeadRequest $request, Lead $lead): RedirectResponse
    {
        $data = $request->validated();

        // Recalculate scores if relevant fields changed
        if (isset($data['source']) || isset($data['priority']) || isset($data['tags'])) {
            $data['lead_score'] = $this->calculateLeadScore(array_merge($lead->toArray(), $data));
            $data['conversion_probability'] = $this->calculateConversionProbability(array_merge($lead->toArray(), $data));
        }

        // Re-check for suspicious activity if contact info changed
        if (isset($data['email']) || isset($data['phone']) || isset($data['name'])) {
            [$data['fake_lead_score'], $data['duplicate_flags']] = $this->detectSuspiciousLead(array_merge($lead->toArray(), $data), $lead->id);
        }

        // Track changes for logging
        $changes = [];
        foreach ($data as $key => $value) {
            if ($lead->{$key} != $value) {
                $changes[$key] = [
                    'old' => $lead->{$key},
                    'new' => $value,
                ];
            }
        }

        $lead->update($data);

        // Log activity
        $this->logUpdated(
            module: 'Sales',
            subject: $lead,
            description: "Updated lead {$lead->lead_id} - {$lead->name}",
            properties: [
                'lead_id' => $lead->lead_id,
                'changes' => $changes,
            ]
        );

        return redirect()
            ->route('sales.lead-management')
            ->with('success', "Lead {$lead->lead_id} updated successfully!");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Lead $lead): RedirectResponse
    {
        // Authorization check
        if (!$request->user()->hasRole('admin') && $lead->branch_id !== $request->user()->branch_id) {
            abort(403, 'You can only delete leads from your branch.');
        }

        $leadId = $lead->lead_id;
        $leadName = $lead->name;

        // Log activity before deletion
        $this->logDeleted(
            module: 'Sales',
            subject: $lead,
            description: "Deleted lead {$leadId} - {$leadName}",
            properties: [
                'lead_id' => $leadId,
                'name' => $leadName,
                'email' => $lead->email,
                'phone' => $lead->phone,
                'status' => $lead->status,
            ]
        );

        $lead->delete();

        return redirect()
            ->route('sales.lead-management')
            ->with('success', "Lead {$leadId} deleted successfully!");
    }

    /**
     * Calculate lead score based on various factors
     */
    private function calculateLeadScore(array $data): int
    {
        $score = 15; // Base score

        // Source score
        $sourceScores = [
            'web_form' => 20,
            'phone' => 30,
            'walk_in' => 40,
            'referral' => 35,
            'social_media' => 15,
        ];
        $score += $sourceScores[$data['source']] ?? 0;

        // Priority score
        $priorityScores = [
            'low' => 0,
            'medium' => 10,
            'high' => 20,
            'urgent' => 30,
        ];
        $score += $priorityScores[$data['priority']] ?? 0;

        // Tags score
        if (isset($data['tags']) && is_array($data['tags'])) {
            $score += count($data['tags']) * 5;
        }

        return min(100, $score);
    }

    /**
     * Calculate conversion probability
     */
    private function calculateConversionProbability(array $data): int
    {
        $probability = 50; // Base probability

        // Status impact
        $statusImpact = [
            'new' => -10,
            'contacted' => 0,
            'qualified' => 15,
            'hot' => 30,
            'unqualified' => -40,
            'lost' => -50,
        ];
        $probability += $statusImpact[$data['status']] ?? 0;

        // Budget impact
        if (isset($data['budget_min']) && $data['budget_min'] > 0) {
            $probability += 10;
        }

        // Purchase timeline impact
        $timelineImpact = [
            'immediate' => 20,
            'soon' => 10,
            'month' => 5,
            'quarter' => 0,
            'exploring' => -10,
        ];
        $probability += $timelineImpact[$data['purchase_timeline']] ?? 0;

        return max(0, min(100, $probability));
    }

    /**
     * Detect suspicious leads and calculate fake lead score
     * Returns: [fake_lead_score, duplicate_flags]
     */
    private function detectSuspiciousLead(array $data, ?int $excludeLeadId = null): array
    {
        $score = 0;
        $flags = [];

        // Check for duplicate email
        if (isset($data['email'])) {
            $query = Lead::where('email', $data['email']);
            if ($excludeLeadId) {
                $query->where('id', '!=', $excludeLeadId);
            }
            $duplicateEmail = $query->exists();
            
            if ($duplicateEmail) {
                $score += 30;
                $flags[] = 'duplicate_email';
            }

            // Check for disposable/temporary email domains
            $disposableDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'throwaway.email', 'temp-mail.org', 'yopmail.com', 'trashmail.com'];
            $emailDomain = substr(strrchr($data['email'], "@"), 1);
            if (in_array(strtolower($emailDomain), $disposableDomains)) {
                $score += 40;
                $flags[] = 'suspicious_email';
            }
        }

        // Check for duplicate phone
        if (isset($data['phone'])) {
            $query = Lead::where('phone', $data['phone']);
            if ($excludeLeadId) {
                $query->where('id', '!=', $excludeLeadId);
            }
            $duplicatePhone = $query->exists();
            
            if ($duplicatePhone) {
                $score += 25;
                $flags[] = 'duplicate_phone';
            }
        }

        // Check for duplicate IP address (within 24 hours)
        if (isset($data['ip_address']) && $data['ip_address']) {
            $query = Lead::where('ip_address', $data['ip_address'])
                ->where('created_at', '>=', now()->subHours(24));
            if ($excludeLeadId) {
                $query->where('id', '!=', $excludeLeadId);
            }
            $duplicateIP = $query->exists();
            
            if ($duplicateIP) {
                $score += 20;
                $flags[] = 'duplicate_ip';
            }
        }

        // Check for missing critical information
        if (empty($data['location']) || empty($data['vehicle_interest'])) {
            $score += 10;
            $flags[] = 'incomplete_info';
        }

        // Check for unrealistic budget (too low or missing)
        if (isset($data['budget_min']) && $data['budget_min'] > 0) {
            // Very low budget (less than 100k PHP) might be suspicious for car purchase
            if ($data['budget_min'] < 100000) {
                $score += 15;
                $flags[] = 'unrealistic_budget';
            }
        }

        // Check for suspicious patterns in name (all caps, numbers, etc.)
        if (isset($data['name'])) {
            if (preg_match('/\d{3,}/', $data['name']) || $data['name'] === strtoupper($data['name'])) {
                $score += 10;
                $flags[] = 'suspicious_name';
            }
        }

        return [min(100, $score), $flags];
    }

    /**
     * Restore a soft-deleted lead.
     */
    public function restore(Request $request, $id): RedirectResponse
    {
        try {
            $lead = Lead::withTrashed()->findOrFail($id);
            
            // Authorization check
            if (!$request->user()->hasRole('admin') && $lead->branch_id !== $request->user()->branch_id) {
                abort(403, 'You can only restore leads from your branch.');
            }
            
            // Check if already active
            if (!$lead->trashed()) {
                return redirect()->back()
                    ->with('error', 'Lead is not deleted.');
            }
            
            $leadId = $lead->lead_id;
            $leadName = $lead->name;
            
            $lead->restore();

            // Log activity
            $this->logRestored(
                module: 'Sales',
                subject: $lead,
                description: "Restored lead {$leadId} - {$leadName}",
                properties: [
                    'lead_id' => $leadId,
                    'name' => $leadName,
                    'email' => $lead->email,
                    'phone' => $lead->phone,
                    'status' => $lead->status,
                ]
            );

            return redirect()
                ->route('sales.lead-management')
                ->with('success', "Lead {$leadId} restored successfully!");
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to restore lead. Please try again.');
        }
    }
}
