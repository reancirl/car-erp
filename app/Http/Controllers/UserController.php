<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $users = User::query()
            ->with(['branch', 'roles'])
            ->when(request('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->when(request('branch_id'), function ($query, $branchId) {
                $query->where('branch_id', $branchId);
            })
            ->when(request('role'), function ($query, $role) {
                $query->whereHas('roles', function ($q) use ($role) {
                    $q->where('name', $role);
                });
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        $branches = Branch::where('status', 'active')
            ->orderBy('name')
            ->get();

        $roles = Role::orderBy('name')->get();

        return Inertia::render('admin/user-management', [
            'users' => $users,
            'branches' => $branches,
            'roles' => $roles,
            'filters' => request()->only(['search', 'branch_id', 'role']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $branches = Branch::where('status', 'active')
            ->orderBy('name')
            ->get();

        $roles = Role::orderBy('name')->get();

        return Inertia::render('admin/user-create', [
            'branches' => $branches,
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|min:3|max:255',
            'email' => 'required|email:rfc,dns|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'branch_id' => 'required|exists:branches,id',
            'role' => 'required|exists:roles,name',
        ], [
            'name.required' => 'User name is required.',
            'name.min' => 'User name must be at least 3 characters.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email address is already registered.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
            'branch_id.required' => 'Branch is required.',
            'branch_id.exists' => 'Selected branch does not exist.',
            'role.required' => 'Role is required.',
            'role.exists' => 'Selected role does not exist.',
        ]);

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'branch_id' => $validated['branch_id'],
            ]);

            $user->assignRole($validated['role']);

            return redirect()->route('admin.user-management.index')
                ->with('success', 'User created successfully! ' . $validated['name'] . ' has been added.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create user. Please try again.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user): Response
    {
        $user->load(['branch', 'roles', 'permissions']);

        return Inertia::render('admin/user-view', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user): Response
    {
        $user->load(['branch', 'roles']);

        $branches = Branch::where('status', 'active')
            ->orderBy('name')
            ->get();

        $roles = Role::orderBy('name')->get();

        return Inertia::render('admin/user-edit', [
            'user' => $user,
            'branches' => $branches,
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|min:3|max:255',
            'email' => ['required', 'email:rfc,dns', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'branch_id' => 'required|exists:branches,id',
            'role' => 'required|exists:roles,name',
        ], [
            'name.required' => 'User name is required.',
            'name.min' => 'User name must be at least 3 characters.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email address is already registered.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
            'branch_id.required' => 'Branch is required.',
            'branch_id.exists' => 'Selected branch does not exist.',
            'role.required' => 'Role is required.',
            'role.exists' => 'Selected role does not exist.',
        ]);

        try {
            $updateData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'branch_id' => $validated['branch_id'],
            ];

            // Only update password if provided
            if (!empty($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }

            $user->update($updateData);

            // Update role
            $user->syncRoles([$validated['role']]);

            return redirect()->route('admin.user-management.index')
                ->with('success', 'User updated successfully! ' . $validated['name'] . ' has been updated.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update user. Please try again.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        try {
            $userName = $user->name;
            $user->delete();

            return redirect()->route('admin.user-management.index')
                ->with('success', 'User deleted successfully! ' . $userName . ' has been removed.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete user. They may have associated records.');
        }
    }
}
