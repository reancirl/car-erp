<?php

namespace App\Services;

use App\Models\OdometerReading;
use App\Models\WorkOrder;

class OdometerService
{
    /**
     * Record an odometer reading and detect anomalies.
     *
     * @param WorkOrder $workOrder
     * @param int $reading
     * @param string|null $photoPath
     * @return OdometerReading
     */
    public function recordReading(
        WorkOrder $workOrder,
        int $reading,
        ?string $photoPath = null
    ): OdometerReading {
        $odometerReading = OdometerReading::create([
            'vehicle_vin' => $workOrder->vehicle_vin,
            'vehicle_plate_number' => $workOrder->vehicle_plate_number,
            'work_order_id' => $workOrder->id,
            'branch_id' => $workOrder->branch_id,
            'reading' => $reading,
            'unit' => 'km',
            'reading_date' => now(),
            'photo_path' => $photoPath,
            'has_photo_evidence' => $photoPath !== null,
            'recorded_by' => auth()->id(),
            'recorded_ip_address' => request()->ip(),
        ]);

        // Update work order with current mileage
        $workOrder->update(['current_mileage' => $reading]);

        // If anomaly detected, add fraud alert to work order
        if ($odometerReading->is_anomaly) {
            $workOrder->addFraudAlert(
                'odometer_anomaly',
                $odometerReading->anomaly_notes,
                [
                    'anomaly_type' => $odometerReading->anomaly_type,
                    'reading' => $odometerReading->reading,
                    'previous_reading' => $odometerReading->previous_reading,
                    'distance_diff' => $odometerReading->distance_diff,
                    'days_diff' => $odometerReading->days_diff,
                    'avg_daily_distance' => $odometerReading->avg_daily_distance,
                ]
            );
        } else {
            // Mark odometer as verified if no anomalies
            $workOrder->update(['odometer_verified' => true]);
        }

        // Check if PMS interval was missed
        $this->checkMissedInterval($workOrder, $odometerReading);

        return $odometerReading;
    }

    /**
     * Check if PMS interval was missed.
     *
     * @param WorkOrder $workOrder
     * @param OdometerReading $reading
     * @return void
     */
    private function checkMissedInterval(WorkOrder $workOrder, OdometerReading $reading): void
    {
        // Check mileage-based interval
        if ($workOrder->pms_interval_km && $reading->distance_diff) {
            if ($reading->distance_diff > ($workOrder->pms_interval_km + 1000)) {
                // Exceeded interval by more than 1000km
                $kmOver = $reading->distance_diff - $workOrder->pms_interval_km;
                $workOrder->addFraudAlert(
                    'missed_pms_interval',
                    "PMS interval exceeded by {$kmOver} km",
                    [
                        'interval_km' => $workOrder->pms_interval_km,
                        'actual_km' => $reading->distance_diff,
                        'km_over' => $kmOver,
                    ]
                );
            }
        }

        // Check time-based interval (6 months default)
        if ($reading->previous_reading_date) {
            $monthsDiff = $reading->previous_reading_date->diffInMonths($reading->reading_date);
            if ($monthsDiff > 6) {
                $workOrder->addFraudAlert(
                    'missed_time_interval',
                    "Service delayed by {$monthsDiff} months",
                    [
                        'months_delayed' => $monthsDiff,
                        'last_service_date' => $reading->previous_reading_date->format('Y-m-d'),
                        'current_service_date' => $reading->reading_date->format('Y-m-d'),
                    ]
                );
            }
        }
    }

    /**
     * Get odometer reading history for a VIN.
     *
     * @param string $vin
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getReadingHistory(string $vin, int $limit = 10)
    {
        return OdometerReading::forVin($vin)
            ->with(['workOrder', 'recorder', 'verifier'])
            ->orderBy('reading_date', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Detect all anomalies for a specific VIN.
     *
     * @param string $vin
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAnomaliesForVin(string $vin)
    {
        return OdometerReading::forVin($vin)
            ->anomalies()
            ->with(['workOrder', 'recorder'])
            ->orderBy('reading_date', 'desc')
            ->get();
    }

    /**
     * Get vehicles that have missed PMS intervals.
     *
     * @param int|null $branchId
     * @return \Illuminate\Support\Collection
     */
    public function getMissedPMSVehicles(?int $branchId = null)
    {
        $query = WorkOrder::query()
            ->where('is_overdue', true)
            ->orWhere(function ($q) {
                $q->whereNotNull('next_pms_due_date')
                    ->where('next_pms_due_date', '<', now());
            })
            ->orWhere(function ($q) {
                $q->whereNotNull('next_pms_due_mileage')
                    ->whereColumn('current_mileage', '>', 'next_pms_due_mileage');
            });

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return $query->with(['branch', 'latestOdometerReading'])
            ->orderBy('next_pms_due_date', 'asc')
            ->get()
            ->map(function ($workOrder) {
                return [
                    'work_order_id' => $workOrder->id,
                    'work_order_number' => $workOrder->work_order_number,
                    'vehicle_vin' => $workOrder->vehicle_vin,
                    'vehicle_plate' => $workOrder->vehicle_plate_number,
                    'vehicle_info' => "{$workOrder->vehicle_make} {$workOrder->vehicle_model} ({$workOrder->vehicle_year})",
                    'current_mileage' => $workOrder->current_mileage,
                    'next_pms_mileage' => $workOrder->next_pms_due_mileage,
                    'km_overdue' => $workOrder->km_overdue,
                    'next_pms_date' => $workOrder->next_pms_due_date,
                    'days_overdue' => $workOrder->days_overdue,
                    'branch' => $workOrder->branch->name,
                ];
            });
    }

    /**
     * Validate odometer reading against history.
     *
     * @param string $vin
     * @param int $newReading
     * @return array
     */
    public function validateReading(string $vin, int $newReading): array
    {
        $lastReading = OdometerReading::forVin($vin)
            ->orderBy('reading_date', 'desc')
            ->first();

        if (!$lastReading) {
            return [
                'valid' => true,
                'message' => 'First reading for this vehicle',
            ];
        }

        $errors = [];

        // Check for rollback
        if ($newReading < $lastReading->reading) {
            $difference = $lastReading->reading - $newReading;
            $errors[] = [
                'type' => 'rollback',
                'severity' => 'critical',
                'message' => "Reading is {$difference} km lower than previous reading",
            ];
        }

        // Check for duplicate
        if ($newReading === $lastReading->reading) {
            $errors[] = [
                'type' => 'duplicate',
                'severity' => 'warning',
                'message' => 'Reading is identical to previous reading',
            ];
        }

        // Check for excessive increase
        $daysDiff = now()->diffInDays($lastReading->reading_date);
        if ($daysDiff > 0) {
            $avgDaily = ($newReading - $lastReading->reading) / $daysDiff;
            if ($avgDaily > 500) {
                $errors[] = [
                    'type' => 'excessive_increase',
                    'severity' => 'warning',
                    'message' => sprintf(
                        'Unusually high daily average: %.2f km/day (%d km in %d days)',
                        $avgDaily,
                        $newReading - $lastReading->reading,
                        $daysDiff
                    ),
                ];
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'previous_reading' => $lastReading->reading,
            'previous_date' => $lastReading->reading_date->format('Y-m-d'),
            'days_since_last' => $daysDiff,
        ];
    }
}
