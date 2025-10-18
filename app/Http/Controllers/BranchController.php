<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Constants\PhRegions;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BranchController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $branches = Branch::query()
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
            'filters' => request()->only(['search', 'status']),
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
            'status' => 'required|in:active,inactive',
            'business_hours' => 'nullable|array',
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

        try {
            Branch::create($validated);

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
            'status' => 'required|in:active,inactive',
            'business_hours' => 'nullable|array',
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

        try {
            $branch->update($validated);

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
            $branch->delete();

            return redirect()->route('admin.branch-management.index')
                ->with('success', 'Branch deleted successfully! ' . $branchName . ' has been removed.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete branch. It may have associated records.');
        }
    }

}
