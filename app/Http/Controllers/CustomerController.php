<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomerSurvey;
use App\Models\Branch;
use App\Models\User;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Base query with branch filtering
        $query = Customer::with(['branch', 'assignedUser'])
            ->when($request->include_deleted, function ($q) {
                $q->withTrashed();
            })
            ->when(!$user->hasRole('admin'), function ($q) use ($user) {
                // Non-admin: Only see customers from their branch
                $q->forUserBranch($user);
            })
            ->when($request->branch_id && $user->hasRole('admin'), function ($q) use ($request) {
                // Admin: Can filter by branch
                $q->where('branch_id', $request->branch_id);
            })
            ->when($request->search, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('customer_id', 'like', "%{$search}%")
                        ->orWhere('company_name', 'like', "%{$search}%");
                });
            })
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->customer_type, fn($q, $type) => $q->where('customer_type', $type))
            ->when($request->satisfaction_rating, fn($q, $rating) => $q->where('satisfaction_rating', $rating));

        $customers = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        // Stats for dashboard
        $statsQuery = clone $query;
        $stats = [
            'total' => $statsQuery->count(),
            'active' => (clone $statsQuery)->where('status', 'active')->count(),
            'vip' => (clone $statsQuery)->where('status', 'vip')->count(),
            'total_lifetime_value' => (clone $statsQuery)->sum('customer_lifetime_value'),
        ];

        return Inertia::render('sales/customer-experience', [
            'customers' => $customers,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'customer_type', 'satisfaction_rating', 'branch_id', 'include_deleted']),
            'branches' => $user->hasRole('admin') ? Branch::where('status', 'active')->get() : null,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        // Get relationship managers (from user's branch or all if admin)
        $managers = User::whereHas('roles', function ($q) {
            $q->whereIn('name', ['admin', 'sales_manager', 'sales_rep']);
        })
            ->when(!$user->hasRole('admin'), function ($q) use ($user) {
                $q->where('branch_id', $user->branch_id);
            })
            ->get(['id', 'name', 'branch_id']);

        // Get existing customers for referral selection
        $existingCustomers = Customer::select('id', 'customer_id', 'first_name', 'last_name', 'email')
            ->when(!$user->hasRole('admin'), function ($q) use ($user) {
                $q->where('branch_id', $user->branch_id);
            })
            ->where('status', '!=', 'blacklisted')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('sales/customer-experience-create', [
            'branches' => $user->hasRole('admin') ? Branch::where('status', 'active')->get() : null,
            'managers' => $managers,
            'existingCustomers' => $existingCustomers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $customer = Customer::create($data);

        // Log activity
        $this->logCreated(
            module: 'Customer',
            subject: $customer,
            description: "Created customer {$customer->customer_id} - {$customer->full_name}",
            properties: [
                'customer_id' => $customer->customer_id,
                'name' => $customer->full_name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'customer_type' => $customer->customer_type,
                'status' => $customer->status,
            ]
        );

        return redirect()
            ->route('sales.customer-experience.index')
            ->with('success', "Customer {$customer->customer_id} created successfully!");
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Customer $customer): Response
    {
        // Authorization check
        if (!$request->user()->hasRole('admin') && $customer->branch_id !== $request->user()->branch_id) {
            abort(403, 'You can only view customers from your branch.');
        }

        $customer->load(['branch', 'assignedUser', 'referredByCustomer', 'referrals', 'surveys']);

        return Inertia::render('sales/customer-experience-view', [
            'customer' => $customer,
            'surveys' => $customer->surveys()->latest()->take(5)->get(),
            'can' => [
                'edit' => $request->user()->can('customer.edit'),
                'delete' => $request->user()->can('customer.delete'),
                'send_survey' => $request->user()->can('customer.send_survey'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Customer $customer): Response
    {
        // Authorization check
        if (!$request->user()->hasRole('admin') && $customer->branch_id !== $request->user()->branch_id) {
            abort(403, 'You can only edit customers from your branch.');
        }

        $customer->load(['branch', 'assignedUser']);

        $user = $request->user();

        // Get relationship managers
        $managers = User::whereHas('roles', function ($q) {
            $q->whereIn('name', ['admin', 'sales_manager', 'sales_rep']);
        })
            ->when(!$user->hasRole('admin'), function ($q) use ($user) {
                $q->where('branch_id', $user->branch_id);
            })
            ->get(['id', 'name', 'branch_id']);

        // Get existing customers for referral selection (excluding self)
        $existingCustomers = Customer::select('id', 'customer_id', 'first_name', 'last_name', 'email')
            ->where('id', '!=', $customer->id)
            ->when(!$user->hasRole('admin'), function ($q) use ($user) {
                $q->where('branch_id', $user->branch_id);
            })
            ->where('status', '!=', 'blacklisted')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('sales/customer-experience-edit', [
            'customer' => $customer,
            'managers' => $managers,
            'existingCustomers' => $existingCustomers,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $data = $request->validated();

        // Track changes for logging
        $changes = [];
        foreach ($data as $key => $value) {
            if ($customer->{$key} != $value) {
                $changes[$key] = [
                    'old' => $customer->{$key},
                    'new' => $value,
                ];
            }
        }

        $customer->update($data);

        // Log activity
        $this->logUpdated(
            module: 'Customer',
            subject: $customer,
            description: "Updated customer {$customer->customer_id} - {$customer->full_name}",
            properties: [
                'customer_id' => $customer->customer_id,
                'changes' => $changes,
            ]
        );

        return redirect()
            ->route('sales.customer-experience.index')
            ->with('success', "Customer {$customer->customer_id} updated successfully!");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Customer $customer): RedirectResponse
    {
        // Authorization check
        if (!$request->user()->hasRole('admin') && $customer->branch_id !== $request->user()->branch_id) {
            abort(403, 'You can only delete customers from your branch.');
        }

        $customerId = $customer->customer_id;
        $customerName = $customer->full_name;

        // Log activity before deletion
        $this->logDeleted(
            module: 'Customer',
            subject: $customer,
            description: "Deleted customer {$customerId} - {$customerName}",
            properties: [
                'customer_id' => $customerId,
                'name' => $customerName,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'status' => $customer->status,
            ]
        );

        $customer->delete();

        return redirect()
            ->route('sales.customer-experience.index')
            ->with('success', "Customer {$customerId} deleted successfully!");
    }

    /**
     * Restore a soft-deleted customer.
     */
    public function restore(Request $request, $id): RedirectResponse
    {
        try {
            $customer = Customer::withTrashed()->findOrFail($id);
            
            // Authorization check
            if (!$request->user()->hasRole('admin') && $customer->branch_id !== $request->user()->branch_id) {
                abort(403, 'You can only restore customers from your branch.');
            }
            
            if (!$customer->trashed()) {
                return redirect()->back()
                    ->with('error', 'Customer is not deleted.');
            }
            
            $customerId = $customer->customer_id;
            $customerName = $customer->full_name;
            
            $customer->restore();

            // Log activity
            $this->logRestored(
                module: 'Customer',
                subject: $customer,
                description: "Restored customer {$customerId} - {$customerName}",
                properties: [
                    'customer_id' => $customerId,
                    'name' => $customerName,
                    'email' => $customer->email,
                    'phone' => $customer->phone,
                    'status' => $customer->status,
                ]
            );

            return redirect()
                ->route('sales.customer-experience.index')
                ->with('success', "Customer {$customerId} restored successfully!");
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to restore customer. Please try again.');
        }
    }

    /**
     * Generate a new survey for the customer
     */
    public function generateSurvey(Request $request, Customer $customer): RedirectResponse
    {
        // Authorization check
        if (!$request->user()->hasRole('admin') && $customer->branch_id !== $request->user()->branch_id) {
            abort(403, 'You can only generate surveys for customers from your branch.');
        }

        $survey = $customer->generateSurvey(
            surveyType: 'general',
            triggerEvent: 'Manual generation by ' . $request->user()->name,
            createdBy: $request->user()->id
        );

        // Log activity
        $this->logCreated(
            module: 'Customer',
            subject: $survey,
            description: "Generated survey for customer {$customer->customer_id}",
            properties: [
                'customer_id' => $customer->customer_id,
                'survey_token' => $survey->token,
                'survey_url' => $survey->public_url,
            ]
        );

        return redirect()->back()
            ->with('success', 'Survey generated successfully!')
            ->with('survey_url', $survey->public_url);
    }

    /**
     * Send survey email to customer
     */
    public function sendSurveyEmail(Request $request, Customer $customer, CustomerSurvey $customerSurvey): RedirectResponse
    {
        // Authorization check
        if (!$request->user()->hasRole('admin') && $customer->branch_id !== $request->user()->branch_id) {
            abort(403, 'You can only send surveys to customers from your branch.');
        }

        // Verify survey belongs to customer
        if ($customerSurvey->customer_id !== $customer->id) {
            abort(403, 'This survey does not belong to this customer.');
        }

        // Check if survey can be sent
        if ($customerSurvey->status === 'completed') {
            return redirect()->back()
                ->with('error', 'This survey has already been completed.');
        }

        if ($customerSurvey->isExpired()) {
            return redirect()->back()
                ->with('error', 'This survey has expired.');
        }

        try {
            // Send email
            \Mail::to($customer->email)->send(
                new \App\Mail\SurveyEmail(
                    customer: $customer,
                    survey: $customerSurvey,
                    branchName: $customer->branch->name
                )
            );

            // Update survey sent timestamp
            $customerSurvey->update([
                'sent_at' => now(),
                'sent_method' => 'email',
            ]);

            // Log activity
            $this->logCreated(
                module: 'Customer',
                subject: $customerSurvey,
                description: "Sent survey email to {$customer->email}",
                properties: [
                    'customer_id' => $customer->customer_id,
                    'customer_email' => $customer->email,
                    'survey_token' => $customerSurvey->token,
                ]
            );

            return redirect()->back()
                ->with('success', "Survey email sent successfully to {$customer->email}!");
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to send email. Please try again.');
        }
    }
}
