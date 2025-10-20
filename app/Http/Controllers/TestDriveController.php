<?php

namespace App\Http\Controllers;

use App\Models\TestDrive;
use App\Models\Branch;
use App\Models\User;
use App\Http\Requests\StoreTestDriveRequest;
use App\Http\Requests\UpdateTestDriveRequest;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TestDriveController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Base query with branch filtering
        $query = TestDrive::with(['branch', 'assignedUser'])
            ->when($request->include_deleted, function ($q) {
                $q->withTrashed();
            })
            ->when(!$user->hasRole('admin'), function ($q) use ($user) {
                // Non-admin: Only see test drives from their branch
                $q->where('branch_id', $user->branch_id);
            })
            ->when($request->branch_id && $user->hasRole('admin'), function ($q) use ($request) {
                // Admin: Can filter by branch
                $q->where('branch_id', $request->branch_id);
            })
            ->when($request->search, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('customer_name', 'like', "%{$search}%")
                        ->orWhere('customer_phone', 'like', "%{$search}%")
                        ->orWhere('customer_email', 'like', "%{$search}%")
                        ->orWhere('reservation_id', 'like', "%{$search}%")
                        ->orWhere('vehicle_vin', 'like', "%{$search}%");
                });
            })
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->reservation_type, fn($q, $type) => $q->where('reservation_type', $type))
            ->when($request->esignature_status, fn($q, $esig) => $q->where('esignature_status', $esig))
            ->when($request->date_range, function ($q) use ($request) {
                switch ($request->date_range) {
                    case 'today':
                        $q->whereDate('scheduled_date', now());
                        break;
                    case 'this_week':
                        $q->whereBetween('scheduled_date', [now()->startOfWeek(), now()->endOfWeek()]);
                        break;
                    case 'this_month':
                        $q->whereMonth('scheduled_date', now()->month)
                          ->whereYear('scheduled_date', now()->year);
                        break;
                }
            });

        $testDrives = $query->orderBy('scheduled_date', 'desc')
            ->orderBy('scheduled_time', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Stats for dashboard
        $statsQuery = clone $query;
        $stats = [
            'total' => $statsQuery->count(),
            'completed' => (clone $statsQuery)->where('status', 'completed')->count(),
            'walk_in_rate' => $statsQuery->count() > 0 
                ? round(((clone $statsQuery)->where('reservation_type', 'walk_in')->count() / $statsQuery->count()) * 100, 0)
                : 0,
            'esignature_rate' => $statsQuery->count() > 0
                ? round(((clone $statsQuery)->where('esignature_status', 'signed')->count() / $statsQuery->count()) * 100, 0)
                : 0,
        ];

        return Inertia::render('sales/test-drives', [
            'testDrives' => $testDrives,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'reservation_type', 'esignature_status', 'branch_id', 'date_range', 'include_deleted']),
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

        return Inertia::render('sales/test-drive-create', [
            'branches' => $user->hasRole('admin') ? Branch::where('status', 'active')->get() : null,
            'salesReps' => $salesReps,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTestDriveRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // Auto-assign branch if not admin
        if (!$request->user()->hasRole('admin')) {
            $data['branch_id'] = $request->user()->branch_id;
        }

        // Set default status if not provided
        if (!isset($data['status'])) {
            $data['status'] = 'pending_signature';
        }

        $testDrive = TestDrive::create($data);

        // Log activity
        $this->logCreated(
            module: 'Sales',
            subject: $testDrive,
            description: "Created test drive {$testDrive->reservation_id} for {$testDrive->customer_name}",
            properties: [
                'reservation_id' => $testDrive->reservation_id,
                'customer_name' => $testDrive->customer_name,
                'vehicle_vin' => $testDrive->vehicle_vin,
                'scheduled_date' => $testDrive->scheduled_date->format('Y-m-d'),
                'reservation_type' => $testDrive->reservation_type,
                'status' => $testDrive->status,
            ]
        );

        return redirect()
            ->route('sales.test-drives')
            ->with('success', "Test drive reservation {$testDrive->reservation_id} created successfully!");
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, TestDrive $testDrive): Response
    {
        // Authorization check
        if (!$request->user()->hasRole('admin') && $testDrive->branch_id !== $request->user()->branch_id) {
            abort(403, 'You can only view test drives from your branch.');
        }

        $testDrive->load(['branch', 'assignedUser']);

        return Inertia::render('sales/test-drive-view', [
            'testDrive' => $testDrive,
            'can' => [
                'edit' => $request->user()->can('sales.edit'),
                'delete' => $request->user()->can('sales.delete'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, TestDrive $testDrive): Response
    {
        // Authorization check
        if (!$request->user()->hasRole('admin') && $testDrive->branch_id !== $request->user()->branch_id) {
            abort(403, 'You can only edit test drives from your branch.');
        }

        $user = $request->user();

        $salesReps = User::role('sales_rep')
            ->when(!$user->hasRole('admin'), function ($q) use ($user) {
                $q->where('branch_id', $user->branch_id);
            })
            ->get(['id', 'name', 'branch_id']);

        return Inertia::render('sales/test-drive-edit', [
            'testDrive' => $testDrive,
            'branches' => $user->hasRole('admin') ? Branch::where('status', 'active')->get() : null,
            'salesReps' => $salesReps,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTestDriveRequest $request, TestDrive $testDrive): RedirectResponse
    {
        // Authorization check
        if (!$request->user()->hasRole('admin') && $testDrive->branch_id !== $request->user()->branch_id) {
            abort(403, 'You can only update test drives from your branch.');
        }

        $validated = $request->validated();

        // Track changes for logging
        $changes = [];
        foreach ($validated as $key => $value) {
            if ($testDrive->{$key} != $value) {
                $changes[$key] = [
                    'old' => $testDrive->{$key},
                    'new' => $value,
                ];
            }
        }

        $testDrive->update($validated);

        // Log activity
        $this->logUpdated(
            module: 'Sales',
            subject: $testDrive,
            description: "Updated test drive {$testDrive->reservation_id} for {$testDrive->customer_name}",
            properties: [
                'changes' => $changes,
            ]
        );

        return redirect()
            ->route('sales.test-drives')
            ->with('success', "Test drive {$testDrive->reservation_id} updated successfully!");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, TestDrive $testDrive): RedirectResponse
    {
        // Authorization check
        if (!$request->user()->hasRole('admin') && $testDrive->branch_id !== $request->user()->branch_id) {
            abort(403, 'You can only delete test drives from your branch.');
        }

        try {
            $reservationId = $testDrive->reservation_id;
            $customerName = $testDrive->customer_name;

            // Log activity before deletion
            $this->logDeleted(
                module: 'Sales',
                subject: $testDrive,
                description: "Deleted test drive {$reservationId} for {$customerName}",
                properties: [
                    'reservation_id' => $reservationId,
                    'customer_name' => $customerName,
                    'scheduled_date' => $testDrive->scheduled_date->format('Y-m-d'),
                    'status' => $testDrive->status,
                ]
            );

            $testDrive->delete();

            return redirect()->route('sales.test-drives')
                ->with('success', "Test drive {$reservationId} deleted successfully!");
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete test drive. Please try again.');
        }
    }

    /**
     * Restore a soft-deleted test drive.
     */
    public function restore(Request $request, $id): RedirectResponse
    {
        try {
            $testDrive = TestDrive::withTrashed()->findOrFail($id);
            
            // Authorization check
            if (!$request->user()->hasRole('admin') && $testDrive->branch_id !== $request->user()->branch_id) {
                abort(403, 'You can only restore test drives from your branch.');
            }
            
            // Check if already active
            if (!$testDrive->trashed()) {
                return redirect()->back()
                    ->with('error', 'Test drive is not deleted.');
            }
            
            $reservationId = $testDrive->reservation_id;
            $testDrive->restore();

            // Log activity
            $this->logRestored(
                module: 'Sales',
                subject: $testDrive,
                description: "Restored test drive {$reservationId} for {$testDrive->customer_name}",
                properties: [
                    'reservation_id' => $reservationId,
                    'customer_name' => $testDrive->customer_name,
                    'scheduled_date' => $testDrive->scheduled_date->format('Y-m-d'),
                ]
            );

            return redirect()->route('sales.test-drives')
                ->with('success', "Test drive {$reservationId} restored successfully!");
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to restore test drive. Please try again.');
        }
    }

    /**
     * Export test drives to CSV.
     */
    public function export(Request $request)
    {
        $user = $request->user();

        $query = TestDrive::with(['branch', 'assignedUser'])
            ->when(!$user->hasRole('admin'), function ($q) use ($user) {
                $q->where('branch_id', $user->branch_id);
            })
            ->when($request->filled('branch_id'), function ($q) use ($request) {
                $q->where('branch_id', $request->branch_id);
            })
            ->when($request->filled('status'), function ($q) use ($request) {
                $q->where('status', $request->status);
            })
            ->when($request->filled('reservation_type'), function ($q) use ($request) {
                $q->where('reservation_type', $request->reservation_type);
            })
            ->orderBy('scheduled_date', 'desc');

        $testDrives = $query->limit(1000)->get();

        // Generate CSV
        $filename = 'test_drives_' . now()->format('Y-m-d_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($testDrives) {
            $file = fopen('php://output', 'w');
            
            fputcsv($file, [
                'Reservation ID',
                'Customer Name',
                'Phone',
                'Email',
                'Vehicle VIN',
                'Vehicle Details',
                'Scheduled Date',
                'Scheduled Time',
                'Duration (min)',
                'Sales Rep',
                'Branch',
                'Status',
                'Type',
                'E-Signature Status',
                'Insurance Verified',
                'License Verified',
                'Deposit Amount',
                'GPS Tracked',
                'Route Distance (km)',
                'Max Speed (km/h)',
                'Created At',
            ]);

            foreach ($testDrives as $drive) {
                fputcsv($file, [
                    $drive->reservation_id,
                    $drive->customer_name,
                    $drive->customer_phone,
                    $drive->customer_email,
                    $drive->vehicle_vin,
                    $drive->vehicle_details,
                    $drive->scheduled_date->format('Y-m-d'),
                    $drive->scheduled_time,
                    $drive->duration_minutes,
                    $drive->assignedUser ? $drive->assignedUser->name : 'Unassigned',
                    $drive->branch ? $drive->branch->name : 'N/A',
                    $drive->status,
                    $drive->reservation_type,
                    $drive->esignature_status,
                    $drive->insurance_verified ? 'Yes' : 'No',
                    $drive->license_verified ? 'Yes' : 'No',
                    $drive->deposit_amount,
                    $drive->hasGPSTracking() ? 'Yes' : 'No',
                    $drive->route_distance_km ?? 'N/A',
                    $drive->max_speed_kmh ?? 'N/A',
                    $drive->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        // Log export activity
        $this->logActivity(
            action: 'sales.export',
            module: 'Sales',
            description: "Exported {$testDrives->count()} test drive records to CSV",
            properties: [
                'filename' => $filename,
                'record_count' => $testDrives->count(),
                'filters' => $request->only(['branch_id', 'status', 'reservation_type']),
            ]
        );

        return response()->stream($callback, 200, $headers);
    }
}
