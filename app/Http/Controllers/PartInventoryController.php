<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePartInventoryRequest;
use App\Http\Requests\UpdatePartInventoryRequest;
use App\Models\Branch;
use App\Models\PartInventory;
use App\Traits\LogsActivity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PartInventoryController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the parts inventory.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Base query with relationships
        $query = PartInventory::with(['branch'])
            ->when($request->include_deleted, fn($q) => $q->withTrashed())
            ->when(!$user->hasRole('admin') && !$user->hasRole('auditor'), 
                fn($q) => $q->forUserBranch($user))
            ->when($request->branch_id && ($user->hasRole('admin') || $user->hasRole('auditor')), 
                fn($q) => $q->where('branch_id', $request->branch_id))
            ->when($request->search, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('part_name', 'like', "%{$search}%")
                        ->orWhere('part_number', 'like', "%{$search}%")
                        ->orWhere('manufacturer', 'like', "%{$search}%")
                        ->orWhere('manufacturer_part_number', 'like', "%{$search}%")
                        ->orWhere('oem_part_number', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($request->category, fn($q, $category) => $q->where('category', $category))
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->condition, fn($q, $condition) => $q->where('condition', $condition))
            ->when($request->stock_status === 'low_stock', fn($q) => $q->lowStock())
            ->when($request->stock_status === 'out_of_stock', fn($q) => $q->outOfStock())
            ->when($request->stock_status === 'in_stock', fn($q) => $q->inStock());

        $parts = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Calculate stats
        $statsQuery = PartInventory::query()
            ->when(!$user->hasRole('admin') && !$user->hasRole('auditor'), 
                fn($q) => $q->forUserBranch($user))
            ->when($request->branch_id && ($user->hasRole('admin') || $user->hasRole('auditor')), 
                fn($q) => $q->where('branch_id', $request->branch_id));

        $stats = [
            'total_parts' => (clone $statsQuery)->count(),
            'in_stock' => (clone $statsQuery)->inStock()->count(),
            'low_stock' => (clone $statsQuery)->lowStock()->count(),
            'out_of_stock' => (clone $statsQuery)->outOfStock()->count(),
            'total_inventory_value' => (clone $statsQuery)->get()->sum(function ($part) {
                return $part->calculateInventoryValue();
            }),
        ];

        return Inertia::render('inventory/parts-inventory', [
            'parts' => $parts,
            'stats' => $stats,
            'filters' => $request->only([
                'search', 
                'category', 
                'status', 
                'condition', 
                'stock_status', 
                'branch_id', 
                'include_deleted'
            ]),
            'branches' => ($user->hasRole('admin') || $user->hasRole('auditor')) 
                ? Branch::where('status', 'active')->get() 
                : null,
        ]);
    }

    /**
     * Show the form for creating a new part.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('inventory/parts-inventory-create', [
            'branches' => ($user->hasRole('admin') || $user->hasRole('auditor')) 
                ? Branch::where('status', 'active')->get() 
                : null,
        ]);
    }

    /**
     * Store a newly created part in storage.
     */
    public function store(StorePartInventoryRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $part = PartInventory::create($data);

        // Log activity
        $this->logCreated(
            module: 'Parts Inventory',
            subject: $part,
            description: "Created part: {$part->part_name} ({$part->part_number})",
            properties: [
                'part_number' => $part->part_number,
                'category' => $part->category,
                'quantity' => $part->quantity_on_hand,
            ]
        );

        return redirect()
            ->route('parts-inventory.index')
            ->with('success', 'Part created successfully!');
    }

    /**
     * Display the specified part.
     */
    public function show(Request $request, PartInventory $partsInventory): Response
    {
        // Authorization
        if (!$request->user()->hasRole('admin') && !$request->user()->hasRole('auditor')) {
            if ($partsInventory->branch_id !== $request->user()->branch_id) {
                abort(403, 'You can only view parts from your branch.');
            }
        }

        $partsInventory->load(['branch']);

        return Inertia::render('inventory/parts-inventory-view', [
            'part' => $partsInventory,
            'can' => [
                'edit' => $request->user()->can('inventory.edit'),
                'delete' => $request->user()->can('inventory.delete'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified part.
     */
    public function edit(Request $request, PartInventory $partsInventory): Response
    {
        // Authorization
        if (!$request->user()->hasRole('admin') && !$request->user()->hasRole('auditor')) {
            if ($partsInventory->branch_id !== $request->user()->branch_id) {
                abort(403, 'You can only edit parts from your branch.');
            }
        }

        $partsInventory->load(['branch']);

        return Inertia::render('inventory/parts-inventory-edit', [
            'part' => $partsInventory,
        ]);
    }

    /**
     * Update the specified part in storage.
     */
    public function update(UpdatePartInventoryRequest $request, PartInventory $partsInventory): RedirectResponse
    {
        $data = $request->validated();

        // Track changes
        $changes = [];
        foreach ($data as $key => $value) {
            if ($partsInventory->{$key} != $value) {
                $changes[$key] = [
                    'old' => $partsInventory->{$key}, 
                    'new' => $value
                ];
            }
        }

        $partsInventory->update($data);

        // Log activity
        $this->logUpdated(
            module: 'Parts Inventory',
            subject: $partsInventory,
            description: "Updated part: {$partsInventory->part_name} ({$partsInventory->part_number})",
            properties: ['changes' => $changes]
        );

        return redirect()
            ->route('parts-inventory.index')
            ->with('success', 'Part updated successfully!');
    }

    /**
     * Remove the specified part from storage (soft delete).
     */
    public function destroy(Request $request, PartInventory $partsInventory): RedirectResponse
    {
        // Authorization
        if (!$request->user()->hasRole('admin') && !$request->user()->hasRole('auditor')) {
            if ($partsInventory->branch_id !== $request->user()->branch_id) {
                abort(403, 'You can only delete parts from your branch.');
            }
        }

        $partName = $partsInventory->part_name;
        $partNumber = $partsInventory->part_number;

        // Log before deletion
        $this->logDeleted(
            module: 'Parts Inventory',
            subject: $partsInventory,
            description: "Deleted part: {$partName} ({$partNumber})",
            properties: [
                'part_name' => $partName,
                'part_number' => $partNumber,
            ]
        );

        $partsInventory->delete();

        return redirect()
            ->route('parts-inventory.index')
            ->with('success', 'Part deleted successfully!');
    }

    /**
     * Restore a soft-deleted part.
     */
    public function restore(Request $request, $id): RedirectResponse
    {
        try {
            $part = PartInventory::withTrashed()->findOrFail($id);
            
            // Authorization
            if (!$request->user()->hasRole('admin') && !$request->user()->hasRole('auditor')) {
                if ($part->branch_id !== $request->user()->branch_id) {
                    abort(403, 'You can only restore parts from your branch.');
                }
            }
            
            if (!$part->trashed()) {
                return redirect()->back()->with('error', 'Part is not deleted.');
            }
            
            $partName = $part->part_name;
            $partNumber = $part->part_number;
            
            $part->restore();

            // Log activity
            $this->logRestored(
                module: 'Parts Inventory',
                subject: $part,
                description: "Restored part: {$partName} ({$partNumber})",
                properties: [
                    'part_name' => $partName,
                    'part_number' => $partNumber,
                ]
            );

            return redirect()
                ->route('parts-inventory.index')
                ->with('success', 'Part restored successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to restore part. Please try again.');
        }
    }

    /**
     * Helper methods for activity logging
     */
    protected function logCreated(string $module, $subject, string $description, array $properties = []): void
    {
        $this->logActivity('create', $module, $description, $subject, $properties, 'success', 'created');
    }

    protected function logUpdated(string $module, $subject, string $description, array $properties = []): void
    {
        $this->logActivity('update', $module, $description, $subject, $properties, 'success', 'updated');
    }

    protected function logDeleted(string $module, $subject, string $description, array $properties = []): void
    {
        $this->logActivity('delete', $module, $description, $subject, $properties, 'success', 'deleted');
    }

    protected function logRestored(string $module, $subject, string $description, array $properties = []): void
    {
        $this->logActivity('restore', $module, $description, $subject, $properties, 'success', 'restored');
    }
}
