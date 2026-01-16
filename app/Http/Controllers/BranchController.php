<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Constants\PhRegions;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BranchController extends Controller
{
    use LogsActivity;

    private const BUSINESS_HOUR_DAYS = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
    ];
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $branches = Branch::query()
            ->when(request('include_deleted'), function ($query) {
                $query->withTrashed();
            })
            ->when(request('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('city', 'like', "%{$search}%");
            })
            ->when(request('status'), function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/branch-management', [
            'branches' => $branches,
            'filters' => request()->only(['search', 'status', 'include_deleted']),
            'can' => [
                'create' => $request->user()->can('users.create'),
                'edit' => $request->user()->can('users.edit'),
                'delete' => $request->user()->can('users.delete'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/branch-create', [
            'regions' => PhRegions::getRegions(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|min:3|max:255',
            'code' => 'required|string|min:2|max:10|unique:branches,code|alpha_dash',
            'address' => 'required|string|min:10|max:500',
            'city' => 'required|string|min:2|max:255',
            'state' => 'required|string|min:2|max:255',
            'postal_code' => 'required|string|min:4|max:4|regex:/^[0-9]{4}$/',
            'country' => 'required|string|max:255',
            'phone' => 'required|string|regex:/^\+?63[-\s]?[0-9]{1,2}[-\s]?[0-9]{3,4}[-\s]?[0-9]{4}$/',
            'email' => 'required|email:rfc,dns|max:255',
            'status' => 'required|in:active,inactive,maintenance',
            'business_hours' => 'nullable|array',
            'business_hours.*.open' => 'nullable|string|max:50',
            'business_hours.*.close' => 'nullable|string|max:50',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'notes' => 'nullable|string|max:1000',
        ], [
            'name.required' => 'Branch name is required.',
            'name.min' => 'Branch name must be at least 3 characters.',
            'code.required' => 'Branch code is required.',
            'code.unique' => 'This branch code is already taken.',
            'code.alpha_dash' => 'Branch code can only contain letters, numbers, dashes and underscores.',
            'postal_code.regex' => 'Postal code must be exactly 4 digits.',
            'phone.required' => 'Phone number is required.',
            'phone.regex' => 'Please enter a valid Philippine phone number format (e.g., +63-2-8123-4567).',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
        ]);

        $validated['business_hours'] = $this->sanitizeBusinessHours($validated['business_hours'] ?? null);

        try {
            $branch = Branch::create($validated);

            // Log activity
            $this->logCreated(
                module: 'Branch',
                subject: $branch,
                description: "Created branch {$branch->name} ({$branch->code})",
                properties: [
                    'branch_code' => $branch->code,
                    'city' => $branch->city,
                    'status' => $branch->status,
                ]
            );

            return redirect()->route('admin.branch-management.index')
                ->with('success', 'Branch created successfully! ' . $validated['name'] . ' is now active.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create branch. Please try again.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Branch $branch)
    {
        return Inertia::render('admin/branch-view', [
            'branch' => $branch,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Branch $branch): Response
    {
        return Inertia::render('admin/branch-edit', [
            'branch' => $branch,
            'regions' => PhRegions::getRegions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Branch $branch): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|min:3|max:255',
            'code' => ['required', 'string', 'min:2', 'max:10', 'alpha_dash', Rule::unique('branches')->ignore($branch->id)],
            'address' => 'required|string|min:10|max:500',
            'city' => 'required|string|min:2|max:255',
            'state' => 'required|string|min:2|max:255',
            'postal_code' => 'required|string|min:4|max:4|regex:/^[0-9]{4}$/',
            'country' => 'required|string|max:255',
            'phone' => 'required|string|regex:/^\+?63[-\s]?[0-9]{1,2}[-\s]?[0-9]{3,4}[-\s]?[0-9]{4}$/',
            'email' => 'required|email:rfc,dns|max:255',
            'status' => 'required|in:active,inactive,maintenance',
            'business_hours' => 'nullable|array',
            'business_hours.*.open' => 'nullable|string|max:50',
            'business_hours.*.close' => 'nullable|string|max:50',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'notes' => 'nullable|string|max:1000',
        ], [
            'name.required' => 'Branch name is required.',
            'name.min' => 'Branch name must be at least 3 characters.',
            'code.required' => 'Branch code is required.',
            'code.unique' => 'This branch code is already taken.',
            'code.alpha_dash' => 'Branch code can only contain letters, numbers, dashes and underscores.',
            'postal_code.regex' => 'Postal code must be exactly 4 digits.',
            'phone.required' => 'Phone number is required.',
            'phone.regex' => 'Please enter a valid Philippine phone number format (e.g., +63-2-8123-4567).',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
        ]);

        $validated['business_hours'] = $this->sanitizeBusinessHours($validated['business_hours'] ?? null);

        try {
            // Track changes for logging
            $changes = [];
            foreach ($validated as $key => $value) {
                if ($branch->{$key} != $value) {
                    $changes[$key] = [
                        'old' => $branch->{$key},
                        'new' => $value,
                    ];
                }
            }

            $branch->update($validated);

            // Log activity
            $this->logUpdated(
                module: 'Branch',
                subject: $branch,
                description: "Updated branch {$branch->name} ({$branch->code})",
                properties: [
                    'changes' => $changes,
                ]
            );

            return redirect()->route('admin.branch-management.index')
                ->with('success', 'Branch updated successfully! ' . $validated['name'] . ' has been updated.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update branch. Please try again.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Branch $branch): RedirectResponse
    {
        try {
            $branchName = $branch->name;
            $branchCode = $branch->code;

            // Log activity before deletion
            $this->logDeleted(
                module: 'Branch',
                subject: $branch,
                description: "Deleted branch {$branchName} ({$branchCode})",
                properties: [
                    'branch_code' => $branchCode,
                    'city' => $branch->city,
                    'status' => $branch->status,
                ]
            );

            $branch->delete();

            return redirect()->route('admin.branch-management.index')
                ->with('success', 'Branch deleted successfully! ' . $branchName . ' has been removed.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete branch. It may have associated records.');
        }
    }

    /**
     * Restore a soft-deleted branch.
     */
    public function restore(Request $request, $id): RedirectResponse
    {
        try {
            $branch = Branch::withTrashed()->findOrFail($id);
            
            // Check if already active
            if (!$branch->trashed()) {
                return redirect()->back()
                    ->with('error', 'Branch is not deleted.');
            }
            
            $branchName = $branch->name;
            $branch->restore();

            // Log activity
            $this->logRestored(
                module: 'Branch',
                subject: $branch,
                description: "Restored branch {$branchName} ({$branch->code})",
                properties: [
                    'branch_code' => $branch->code,
                    'city' => $branch->city,
                    'status' => $branch->status,
                ]
            );

            return redirect()->route('admin.branch-management.index')
                ->with('success', 'Branch restored successfully! ' . $branchName . ' is now active.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to restore branch. Please try again.');
        }
    }

    /**
     * Normalize business hours payload for storage.
     */
    private function sanitizeBusinessHours(?array $businessHours): ?array
    {
        if (empty($businessHours)) {
            return null;
        }

        $normalized = [];
        $hasAny = false;

        foreach (self::BUSINESS_HOUR_DAYS as $day) {
            $hours = $businessHours[$day] ?? null;

            if (!is_array($hours)) {
                $normalized[$day] = null;
                continue;
            }

            $open = $this->normalizeHoursValue($hours['open'] ?? null);
            $close = $this->normalizeHoursValue($hours['close'] ?? null);

            if ($open && $close) {
                $normalized[$day] = [
                    'open' => $open,
                    'close' => $close,
                ];
                $hasAny = true;
            } else {
                $normalized[$day] = null;
            }
        }

        return $hasAny ? $normalized : null;
    }

    private function normalizeHoursValue(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);

        if ($trimmed === '' || strcasecmp($trimmed, 'closed') === 0) {
            return null;
        }

        return $trimmed;
    }
}
