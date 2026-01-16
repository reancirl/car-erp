<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVehicleReservationRequest;
use App\Http\Requests\UpdateVehicleReservationRequest;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\VehicleReservation;
use App\Models\VehicleUnit;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VehicleReservationController extends Controller
{
    use LogsActivity;

    /**
     * List reservations (Inertia).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = VehicleReservation::with([
            'customer',
            'vehicleUnit.vehicleModel',
            'branch',
            'handledByBranch',
        ])
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->branch_id && $user->hasRole(['admin', 'auditor']), function ($q) use ($request) {
                $q->where('branch_id', $request->branch_id);
            })
            ->when($request->search, function ($q, $search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('reservation_ref', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($c) use ($search) {
                            $c->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhere('company_name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('vehicleUnit', function ($unit) use ($search) {
                            $unit->where('stock_number', 'like', "%{$search}%")
                                ->orWhere('vin', 'like', "%{$search}%");
                        });
                });
            });

        $reservations = $query->orderByDesc('reservation_date')
            ->paginate($request->per_page ?? 15)
            ->withQueryString();

        $branches = $user->hasRole(['admin', 'auditor'])
            ? Branch::orderBy('name')->get(['id', 'name', 'code'])
            : null;

        $paymentTypes = ['cash', 'bank_transfer', 'gcash', 'credit_card', 'check', 'other'];

        return Inertia::render('sales/reservations', [
            'reservations' => $reservations,
            'filters' => $request->only(['status', 'branch_id', 'search']),
            'branches' => $branches,
            'paymentTypes' => $paymentTypes,
        ]);
    }

    /**
     * Show create form.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        $customers = Customer::when(!$user->hasRole(['admin', 'auditor']), function ($q) use ($user) {
                $q->forUserBranch($user);
            })
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'company_name', 'customer_type', 'email']);

        $vehicles = VehicleUnit::with(['vehicleModel', 'branch'])
            ->whereNotIn('status', ['sold', 'disposed'])
            ->where(function ($q) {
                $q->where('is_locked', false)
                    ->orWhereNull('is_locked');
            })
            ->whereDoesntHave('reservations', function ($q) {
                $q->whereNotIn('status', ['cancelled', 'released']);
            })
            ->orderBy('created_at', 'desc')
            ->get(['id', 'vehicle_model_id', 'branch_id', 'vin', 'stock_number', 'status', 'is_locked', 'allocation_status']);

        $branches = $user->hasRole(['admin', 'auditor'])
            ? Branch::orderBy('name')->get(['id', 'name', 'code'])
            : null;

        $paymentTypes = ['cash', 'bank_transfer', 'gcash', 'credit_card', 'check', 'other'];

        return Inertia::render('sales/reservation-create', [
            'customers' => $customers,
            'vehicles' => $vehicles,
            'branches' => $branches,
            'paymentTypes' => $paymentTypes,
            'defaultBranchId' => $user->branch_id,
        ]);
    }

    /**
     * Persist a reservation.
     */
    public function store(StoreVehicleReservationRequest $request): RedirectResponse|JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        if (! $user->hasRole(['admin', 'auditor'])) {
            $data['branch_id'] = $user->branch_id;
        }

        $data['handled_by_branch_id'] = $data['handled_by_branch_id'] ?? null;
        $data['target_release_date'] = $data['target_release_date'] ?? null;

        $unit = VehicleUnit::findOrFail($data['vehicle_unit_id']);
        $customer = Customer::findOrFail($data['customer_id']);

        $existingActiveReservation = VehicleReservation::where('vehicle_unit_id', $unit->id)
            ->whereNotIn('status', ['cancelled', 'released'])
            ->exists();

        if ($existingActiveReservation) {
            return back()->withErrors(['vehicle_unit_id' => 'This unit already has an active reservation.'])->withInput();
        }

        if (in_array($unit->status, ['sold', 'disposed'])) {
            return back()->withErrors(['vehicle_unit_id' => 'Cannot reserve a sold/disposed unit.'])->withInput();
        }

        $reservation = VehicleReservation::create($data);

        $allocationLabel = "Allocated to {$customer->display_name} – {$reservation->reservation_ref}";
        $unit->update([
            'status' => 'reserved',
            'is_locked' => true,
            'allocation_status' => $allocationLabel,
        ]);

        $this->logCreated(
            'Reservations',
            $reservation,
            "Reservation {$reservation->reservation_ref} created for unit {$unit->stock_number}",
            [
                'vehicle_unit_id' => $unit->id,
                'customer_id' => $customer->id,
                'branch_id' => $reservation->branch_id,
            ]
        );

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Reservation created successfully.',
                'data' => $reservation->load(['customer', 'vehicleUnit', 'branch']),
            ], 201);
        }

        return redirect()->route('sales.reservations.index')
            ->with('success', 'Reservation created successfully.');
    }

    /**
     * Update reservation details / status.
     */
    public function update(UpdateVehicleReservationRequest $request, VehicleReservation $reservation): RedirectResponse|JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        if (! $user->hasRole(['admin', 'auditor']) && $reservation->branch_id !== $user->branch_id) {
            return back()->withErrors(['branch_id' => 'Unauthorized to update this reservation.']);
        }

        $data['handled_by_branch_id'] = $data['handled_by_branch_id'] ?? null;
        $data['target_release_date'] = $data['target_release_date'] ?? null;

        $reservation->update($data);

        // Refresh allocation label on status changes
        $unit = $reservation->vehicleUnit;
        $customer = $reservation->customer;

        if ($unit && $customer) {
            if (isset($data['status']) && $data['status'] === 'cancelled') {
                $unit->update([
                    'status' => 'in_stock',
                    'is_locked' => false,
                    'allocation_status' => null,
                ]);
            } elseif (isset($data['status']) && $data['status'] === 'released') {
                $unit->update([
                    'is_locked' => false,
                ]);
            } else {
                $allocationLabel = "Allocated to {$customer->display_name} – {$reservation->reservation_ref}";
                $unit->update([
                    'status' => 'reserved',
                    'is_locked' => true,
                    'allocation_status' => $allocationLabel,
                ]);
            }
        }

        $this->logUpdated(
            'Reservations',
            $reservation,
            "Reservation {$reservation->reservation_ref} updated.",
            ['status' => $reservation->status]
        );

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Reservation updated successfully.',
                'data' => $reservation->load(['customer', 'vehicleUnit', 'branch']),
            ]);
        }

        return redirect()->route('sales.reservations.index')
            ->with('success', 'Reservation updated successfully.');
    }
}
