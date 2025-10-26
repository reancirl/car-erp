<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OdometerReading extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'vehicle_vin',
        'vehicle_plate_number',
        'work_order_id',
        'branch_id',
        'reading',
        'unit',
        'reading_date',
        'previous_reading',
        'previous_reading_date',
        'distance_diff',
        'days_diff',
        'avg_daily_distance',
        'is_anomaly',
        'anomaly_type',
        'anomaly_notes',
        'photo_path',
        'has_photo_evidence',
        'recorded_by',
        'recorded_ip_address',
        'is_verified',
        'verified_by',
        'verified_at',
    ];

    /**
     * Attribute casting.
     */
    protected $casts = [
        'reading' => 'integer',
        'previous_reading' => 'integer',
        'reading_date' => 'datetime',
        'previous_reading_date' => 'datetime',
        'distance_diff' => 'integer',
        'days_diff' => 'integer',
        'avg_daily_distance' => 'decimal:2',
        'is_anomaly' => 'boolean',
        'has_photo_evidence' => 'boolean',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Automatically detect anomalies and calculate differences.
     */
    protected static function booted(): void
    {
        static::creating(function (OdometerReading $reading) {
            // Get previous reading for this VIN
            $previous = static::where('vehicle_vin', $reading->vehicle_vin)
                ->where('id', '!=', $reading->id)
                ->orderBy('reading_date', 'desc')
                ->first();

            if ($previous) {
                $reading->previous_reading = $previous->reading;
                $reading->previous_reading_date = $previous->reading_date;

                // Calculate differences
                $reading->distance_diff = $reading->reading - $previous->reading;
                $reading->days_diff = $reading->reading_date->diffInDays($previous->reading_date);

                // Calculate average daily distance
                if ($reading->days_diff > 0) {
                    $reading->avg_daily_distance = abs($reading->distance_diff) / $reading->days_diff;
                }

                // Detect anomalies
                $reading->detectAnomaly();
            }

            // Set recorded_by if authenticated
            if (auth()->check() && !$reading->recorded_by) {
                $reading->recorded_by = auth()->id();
            }

            // Capture IP address
            if (!$reading->recorded_ip_address && request()) {
                $reading->recorded_ip_address = request()->ip();
            }
        });
    }

    /**
     * Detect anomalies in odometer reading.
     */
    public function detectAnomaly(): void
    {
        if (!$this->previous_reading) {
            $this->is_anomaly = false;
            $this->anomaly_type = 'none';
            return;
        }

        // Check for rollback (reading decreased)
        if ($this->distance_diff < 0) {
            $this->is_anomaly = true;
            $this->anomaly_type = 'rollback';
            $this->anomaly_notes = "Odometer reading decreased by " . abs($this->distance_diff) . " km";
            return;
        }

        // Check for duplicate reading
        if ($this->distance_diff === 0) {
            $this->is_anomaly = true;
            $this->anomaly_type = 'duplicate';
            $this->anomaly_notes = "Same reading as previous entry";
            return;
        }

        // Check for excessive daily increase (>500km per day)
        if ($this->avg_daily_distance > 500) {
            $this->is_anomaly = true;
            $this->anomaly_type = 'excessive_increase';
            $this->anomaly_notes = "Unusually high daily average: " . number_format($this->avg_daily_distance, 2) . " km/day";
            return;
        }

        // Check for missed PMS interval (>10,000km or >180 days since last service)
        if ($this->distance_diff > 10000 || $this->days_diff > 180) {
            $this->is_anomaly = true;
            $this->anomaly_type = 'missed_interval';
            $this->anomaly_notes = "Missed PMS interval: {$this->distance_diff} km / {$this->days_diff} days since last service";
            return;
        }

        // No anomaly detected
        $this->is_anomaly = false;
        $this->anomaly_type = 'none';
    }

    /**
     * Relationship: Reading belongs to a work order.
     */
    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    /**
     * Relationship: Reading belongs to a branch.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Relationship: Recorded by user.
     */
    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    /**
     * Relationship: Verified by user.
     */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Scope: Filter by VIN.
     */
    public function scopeForVin($query, string $vin)
    {
        return $query->where('vehicle_vin', $vin);
    }

    /**
     * Scope: Only anomalies.
     */
    public function scopeAnomalies($query)
    {
        return $query->where('is_anomaly', true);
    }

    /**
     * Scope: By anomaly type.
     */
    public function scopeByAnomalyType($query, string $type)
    {
        return $query->where('anomaly_type', $type);
    }

    /**
     * Scope: Unverified readings.
     */
    public function scopeUnverified($query)
    {
        return $query->where('is_verified', false);
    }

    /**
     * Mark reading as verified.
     */
    public function markAsVerified(int $userId = null): void
    {
        $this->is_verified = true;
        $this->verified_by = $userId ?? auth()->id();
        $this->verified_at = now();
        $this->save();
    }

    /**
     * Get reading history for a VIN.
     */
    public static function getHistoryForVin(string $vin, int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return static::forVin($vin)
            ->orderBy('reading_date', 'desc')
            ->limit($limit)
            ->get();
    }
}
