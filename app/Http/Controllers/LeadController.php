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

        return Inertia::render('sales/lead-management', [
            'leads' => $leads,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'source', 'branch_id', 'lead_score']),
            'branches' => $user->hasRole('admin') ? Branch::where('status', 'active')->get() : null,
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

        return Inertia::render('sales/lead-create', [
            'branches' => $user->hasRole('admin') ? Branch::where('status', 'active')->get() : null,
            'salesReps' => $salesReps,
        ]);
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

        return Inertia::render('sales/lead-edit', [
            'lead' => $lead,
            'salesReps' => $salesReps,
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
}
