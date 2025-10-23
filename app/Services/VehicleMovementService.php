<?php

namespace App\Services;

use App\Models\VehicleUnit;
use App\Models\VehicleMovement;
use App\Traits\LogsActivity;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VehicleMovementService
{
    use LogsActivity;

    /**
     * Transfer a vehicle unit to another branch.
     *
     * @param VehicleUnit $unit The vehicle unit to transfer
     * @param int $toBranchId The destination branch ID
     * @param Carbon $when The transfer date
     * @param int|null $userId The user initiating the transfer
     * @param string|null $remarks Transfer notes
     * @return VehicleMovement
     * @throws ValidationException
     */
    public function transfer(
        VehicleUnit $unit,
        int $toBranchId,
        Carbon $when,
        ?int $userId = null,
        ?string $remarks = null
    ): VehicleMovement {
        // Domain validation: Check if transfer is to the same branch
        if ($unit->branch_id === $toBranchId) {
            throw ValidationException::withMessages([
                'to_branch_id' => 'Cannot transfer vehicle to the same branch it is currently in.',
            ]);
        }

        // Domain validation: Check if unit is in a transferable state
        if (in_array($unit->status, ['sold', 'disposed'])) {
            throw ValidationException::withMessages([
                'status' => "Cannot transfer vehicle with status: {$unit->status}",
            ]);
        }

        // Perform transfer in a transaction
        return DB::transaction(function () use ($unit, $toBranchId, $when, $userId, $remarks) {
            $fromBranchId = $unit->branch_id;

            // Create movement record
            $movement = VehicleMovement::create([
                'vehicle_unit_id' => $unit->id,
                'from_branch_id' => $fromBranchId,
                'to_branch_id' => $toBranchId,
                'transfer_date' => $when,
                'user_id' => $userId ?? auth()->id(),
                'remarks' => $remarks,
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            // Update unit's branch and status
            $unit->update([
                'branch_id' => $toBranchId,
                'status' => 'transferred',
            ]);

            // Log the transfer activity
            $this->logTransfer($unit, $movement, $fromBranchId, $toBranchId);

            return $movement;
        });
    }

    /**
     * Log the transfer activity.
     */
    protected function logTransfer(
        VehicleUnit $unit,
        VehicleMovement $movement,
        int $fromBranchId,
        int $toBranchId
    ): void {
        $fromBranch = \App\Models\Branch::find($fromBranchId);
        $toBranch = \App\Models\Branch::find($toBranchId);

        $description = sprintf(
            'Vehicle unit %s (VIN: %s) transferred from %s to %s',
            $unit->stock_number,
            $unit->vin,
            $fromBranch->name ?? 'Unknown',
            $toBranch->name ?? 'Unknown'
        );

        $this->logActivity(
            action: 'transfer',
            module: 'Inventory',
            description: $description,
            subject: $unit,
            properties: [
                'changes' => [
                    'branch_id' => [
                        'old' => $fromBranchId,
                        'new' => $toBranchId,
                    ],
                    'status' => [
                        'old' => $unit->getOriginal('status'),
                        'new' => 'transferred',
                    ],
                ],
                'movement_id' => $movement->id,
                'transfer_date' => $movement->transfer_date->toDateString(),
                'remarks' => $movement->remarks,
            ],
            status: 'success',
            event: 'transferred'
        );
    }

    /**
     * Bulk transfer multiple units to a branch.
     *
     * @param array $unitIds Array of vehicle unit IDs
     * @param int $toBranchId Destination branch ID
     * @param Carbon $when Transfer date
     * @param int|null $userId User initiating transfer
     * @param string|null $remarks Transfer notes
     * @return array Array of created movements
     */
    public function bulkTransfer(
        array $unitIds,
        int $toBranchId,
        Carbon $when,
        ?int $userId = null,
        ?string $remarks = null
    ): array {
        $movements = [];
        $errors = [];

        foreach ($unitIds as $unitId) {
            try {
                $unit = VehicleUnit::findOrFail($unitId);
                $movements[] = $this->transfer($unit, $toBranchId, $when, $userId, $remarks);
            } catch (\Exception $e) {
                $errors[$unitId] = $e->getMessage();
            }
        }

        if (!empty($errors)) {
            throw ValidationException::withMessages([
                'units' => 'Some units could not be transferred',
                'errors' => $errors,
            ]);
        }

        return $movements;
    }

    /**
     * Get transfer history for a vehicle unit.
     *
     * @param VehicleUnit $unit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getTransferHistory(VehicleUnit $unit)
    {
        return $unit->movements()
            ->with(['fromBranch', 'toBranch', 'user'])
            ->orderBy('transfer_date', 'desc')
            ->get();
    }

    /**
     * Get transfer statistics for a branch.
     *
     * @param int $branchId
     * @param Carbon|null $startDate
     * @param Carbon|null $endDate
     * @return array
     */
    public function getBranchTransferStats(
        int $branchId,
        ?Carbon $startDate = null,
        ?Carbon $endDate = null
    ): array {
        $query = VehicleMovement::query();

        if ($startDate) {
            $query->where('transfer_date', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('transfer_date', '<=', $endDate);
        }

        return [
            'transfers_in' => (clone $query)->where('to_branch_id', $branchId)->count(),
            'transfers_out' => (clone $query)->where('from_branch_id', $branchId)->count(),
            'net_transfers' => (clone $query)->where('to_branch_id', $branchId)->count() 
                - (clone $query)->where('from_branch_id', $branchId)->count(),
        ];
    }
}
