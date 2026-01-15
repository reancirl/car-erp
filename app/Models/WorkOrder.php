<?php

namespace App\Models;

use App\Models\Concerns\BranchScoped;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkOrder extends Model
{
    use HasFactory;
    use SoftDeletes;
    use BranchScoped;

    /**
     * The attributes that are mass assignable.
     *
     * Guarded is empty to allow feature teams to evolve the payload
     * while the work order module is still being built out.
     */
    protected $guarded = [];

    /**
     * Attribute casting for consistent data handling.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'scheduled_at' => 'datetime',
        'due_date' => 'date',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'estimated_hours' => 'decimal:2',
        'actual_hours' => 'decimal:2',
        'estimated_cost' => 'decimal:2',
        'actual_cost' => 'decimal:2',
        'labor_cost' => 'decimal:2',
        'completion_percentage' => 'integer',
        'is_warranty_claim' => 'boolean',
        'photos_uploaded' => 'boolean',
        'checklist_completed' => 'boolean',
        'requested_at' => 'date',
        'actual_service_date' => 'date',
        // PMS tracking
        'next_pms_due_date' => 'datetime',
        'is_overdue' => 'boolean',
        'requires_photo_verification' => 'boolean',
        'odometer_verified' => 'boolean',
        'location_verified' => 'boolean',
        'fraud_alerts' => 'array',
        'has_fraud_alerts' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Automatically hydrate generated fields and audit information.
     */
    protected static function booted(): void
    {
        static::creating(function (WorkOrder $workOrder) {
            if (! $workOrder->work_order_number) {
                $workOrder->work_order_number = static::generateWorkOrderNumber();
            }

            if (auth()->check()) {
                $workOrder->created_by ??= auth()->id();
                $workOrder->updated_by ??= auth()->id();
            }
        });

        static::updating(function (WorkOrder $workOrder) {
            if (auth()->check()) {
                $workOrder->updated_by = auth()->id();
            }
        });
    }

    /**
     * Generate a unique work order number with daily sequence.
     */
    private static function generateWorkOrderNumber(): string
    {
        $datePrefix = now()->format('Ymd');
        $countForToday = static::withTrashed()
            ->whereDate('created_at', now()->toDateString())
            ->count() + 1;

        return sprintf('WO-%s-%04d', $datePrefix, $countForToday);
    }

    /**
     * Relationship: Work order belongs to a branch.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * A work order belongs to a service type.
     */
    public function serviceType(): BelongsTo
    {
        return $this->belongsTo(ServiceType::class);
    }

    /**
     * Relationship: Work order belongs to a vehicle unit.
     */
    public function vehicleUnit(): BelongsTo
    {
        return $this->belongsTo(VehicleUnit::class);
    }

    /**
     * Relationship: Work order belongs to a customer.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Relationship: Work order is assigned to a user.
     */
    public function assignedTechnician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Relationship: Work order creator.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship: Work order updater.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Relationship: Work order photos (evidence).
     */
    public function photos()
    {
        return $this->hasMany(WorkOrderPhoto::class);
    }

    /**
     * Relationship: Parts replaced/used on this work order.
     */
    public function parts()
    {
        return $this->hasMany(WorkOrderPart::class);
    }

    /**
     * Relationship: Odometer readings for this work order.
     */
    public function odometerReadings()
    {
        return $this->hasMany(OdometerReading::class);
    }

    /**
     * Relationship: Latest odometer reading.
     */
    public function latestOdometerReading()
    {
        return $this->hasOne(OdometerReading::class)->latestOfMany('reading_date');
    }

    /**
     * Scope: Filter work orders that are overdue for PMS.
     */
    public function scopeOverdue($query)
    {
        return $query->where('is_overdue', true);
    }

    /**
     * Scope: Filter work orders with fraud alerts.
     */
    public function scopeWithFraudAlerts($query)
    {
        return $query->where('has_fraud_alerts', true);
    }

    /**
     * Scope: Filter by verification status.
     */
    public function scopeByVerificationStatus($query, string $status)
    {
        return $query->where('verification_status', $status);
    }

    /**
     * Check if work order has required photo evidence.
     */
    public function hasRequiredPhotos(): bool
    {
        if (!$this->requires_photo_verification) {
            return true;
        }

        $photoCount = $this->photos()->count();
        return $photoCount >= $this->minimum_photos_required;
    }

    /**
     * Check if work order has before AND after photos.
     */
    public function hasBeforeAfterPhotos(): bool
    {
        $hasBefore = $this->photos()->where('photo_type', 'before')->exists();
        $hasAfter = $this->photos()->where('photo_type', 'after')->exists();
        return $hasBefore && $hasAfter;
    }

    /**
     * Get photo count by type.
     */
    public function getPhotoCountAttribute(): int
    {
        return $this->photos()->count();
    }

    /**
     * Check if location is verified (GPS from photos matches service center).
     */
    public function isLocationVerified(): bool
    {
        // Check if any photo has GPS data near the service location
        if (!$this->service_location_lat || !$this->service_location_lng) {
            return false;
        }

        $photosWithGPS = $this->photos()
            ->where('has_gps_data', true)
            ->get();

        if ($photosWithGPS->isEmpty()) {
            return false;
        }

        // Check if at least one photo is within 1km of service location
        foreach ($photosWithGPS as $photo) {
            $distance = $this->calculateDistance(
                $this->service_location_lat,
                $this->service_location_lng,
                $photo->latitude,
                $photo->longitude
            );

            // Within 1km radius
            if ($distance <= 1.0) {
                return true;
            }
        }

        return false;
    }

    /**
     * Calculate distance between two GPS coordinates (Haversine formula).
     * Returns distance in kilometers.
     */
    private function calculateDistance(
        float $lat1,
        float $lng1,
        float $lat2,
        float $lng2
    ): float {
        $earthRadius = 6371; // km

        $latDiff = deg2rad($lat2 - $lat1);
        $lngDiff = deg2rad($lng2 - $lng1);

        $a = sin($latDiff / 2) * sin($latDiff / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($lngDiff / 2) * sin($lngDiff / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Add fraud alert to the work order.
     */
    public function addFraudAlert(string $type, string $message, array $data = []): void
    {
        $alerts = $this->fraud_alerts ?? [];
        $alerts[] = [
            'type' => $type,
            'message' => $message,
            'data' => $data,
            'detected_at' => now()->toDateTimeString(),
        ];

        $this->fraud_alerts = $alerts;
        $this->has_fraud_alerts = true;
        $this->verification_status = 'flagged';
        $this->save();
    }

    /**
     * Clear all fraud alerts.
     */
    public function clearFraudAlerts(): void
    {
        $this->fraud_alerts = [];
        $this->has_fraud_alerts = false;
        $this->verification_status = 'verified';
        $this->save();
    }

    /**
     * Check if work order is overdue based on date or mileage.
     */
    public function checkOverdueStatus(): void
    {
        $isOverdue = false;
        $daysOverdue = null;
        $kmOverdue = null;

        // Check date-based overdue
        if ($this->next_pms_due_date && now()->gt($this->next_pms_due_date)) {
            $isOverdue = true;
            $daysOverdue = now()->diffInDays($this->next_pms_due_date);
        }

        // Check mileage-based overdue
        if ($this->next_pms_due_mileage && $this->current_mileage) {
            if ($this->current_mileage > $this->next_pms_due_mileage) {
                $isOverdue = true;
                $kmOverdue = $this->current_mileage - $this->next_pms_due_mileage;
            }
        }

        $this->is_overdue = $isOverdue;
        $this->days_overdue = $daysOverdue;
        $this->km_overdue = $kmOverdue;
        $this->save();
    }
}
