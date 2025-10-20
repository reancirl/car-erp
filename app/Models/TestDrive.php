<?php

namespace App\Models;

use App\Models\Concerns\BranchScoped;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TestDrive extends Model
{
    use HasFactory, SoftDeletes, BranchScoped;

    protected $fillable = [
        'reservation_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'vehicle_vin',
        'vehicle_details',
        'scheduled_date',
        'scheduled_time',
        'duration_minutes',
        'branch_id',
        'assigned_user_id',
        'status',
        'reservation_type',
        'esignature_status',
        'esignature_timestamp',
        'esignature_device',
        'esignature_data',
        'gps_start_coords',
        'gps_end_coords',
        'gps_start_timestamp',
        'gps_end_timestamp',
        'route_distance_km',
        'max_speed_kmh',
        'insurance_verified',
        'license_verified',
        'deposit_amount',
        'notes',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'esignature_timestamp' => 'datetime',
        'gps_start_timestamp' => 'datetime',
        'gps_end_timestamp' => 'datetime',
        'route_distance_km' => 'decimal:2',
        'max_speed_kmh' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'insurance_verified' => 'boolean',
        'license_verified' => 'boolean',
    ];

    /**
     * Boot method to generate reservation ID and handle auto-progression
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($testDrive) {
            if (! $testDrive->reservation_id) {
                $testDrive->reservation_id = self::generateReservationId();
            }
        });

        static::created(function ($testDrive) {
            // Auto-advance pipeline when test drive is created (scheduled)
            if ($testDrive->status === 'confirmed') {
                $pipeline = Pipeline::where('customer_phone', $testDrive->customer_phone)
                    ->orWhere('customer_email', $testDrive->customer_email)
                    ->whereNotIn('current_stage', ['lost', 'won'])
                    ->first();

                if ($pipeline) {
                    $service = app(\App\Services\PipelineAutoProgressionService::class);
                    $service->advanceToTestDriveScheduled($pipeline, [
                        'test_drive_id' => $testDrive->reservation_id,
                        'scheduled_date' => $testDrive->scheduled_date->toDateString(),
                        'scheduled_time' => $testDrive->scheduled_time,
                    ]);
                }
            }
        });

        static::updated(function ($testDrive) {
            // Auto-advance pipeline when test drive status changes to reservation type
            if ($testDrive->wasChanged('reservation_type') && $testDrive->reservation_type === 'reservation') {
                $pipeline = Pipeline::where('customer_phone', $testDrive->customer_phone)
                    ->orWhere('customer_email', $testDrive->customer_email)
                    ->whereNotIn('current_stage', ['lost', 'won', 'reservation_made'])
                    ->first();

                if ($pipeline) {
                    $service = app(\App\Services\PipelineAutoProgressionService::class);
                    $service->advanceToReservation($pipeline, [
                        'test_drive_id' => $testDrive->reservation_id,
                        'reservation_created_at' => now()->toDateTimeString(),
                    ]);
                }
            }
        });
    }

    /**
     * Generate unique reservation ID
     */
    public static function generateReservationId(): string
    {
        $year = now()->year;
        $latestTestDrive = self::withTrashed()
            ->where('reservation_id', 'like', "TD-{$year}-%")
            ->orderBy('id', 'desc')
            ->first();

        if ($latestTestDrive) {
            $lastNumber = (int) substr($latestTestDrive->reservation_id, -3);
            $nextNumber = str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
        } else {
            $nextNumber = '001';
        }

        return "TD-{$year}-{$nextNumber}";
    }

    /**
     * Get the branch this test drive belongs to
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get the user assigned to this test drive
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    /**
     * Scope to get test drives by status
     */
    public function scopeWithStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get test drives by reservation type
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('reservation_type', $type);
    }

    /**
     * Scope to get test drives for a specific date
     */
    public function scopeForDate($query, $date)
    {
        return $query->whereDate('scheduled_date', $date);
    }

    /**
     * Scope to get test drives for a date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('scheduled_date', [$startDate, $endDate]);
    }

    /**
     * Scope to get test drives with e-signature status
     */
    public function scopeESignatureStatus($query, string $status)
    {
        return $query->where('esignature_status', $status);
    }

    /**
     * Scope to get test drives assigned to specific user
     */
    public function scopeAssignedTo($query, int $userId)
    {
        return $query->where('assigned_user_id', $userId);
    }

    /**
     * Check if test drive is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if test drive is cancelled
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if e-signature is signed
     */
    public function isSignatureSigned(): bool
    {
        return $this->esignature_status === 'signed';
    }

    /**
     * Check if test drive has GPS tracking data
     */
    public function hasGPSTracking(): bool
    {
        return !is_null($this->gps_start_coords) && !is_null($this->gps_end_coords);
    }

    /**
     * Check if all verifications are complete
     */
    public function isFullyVerified(): bool
    {
        return $this->insurance_verified && $this->license_verified;
    }

    /**
     * Get formatted scheduled datetime
     */
    public function getScheduledDatetimeAttribute(): string
    {
        return $this->scheduled_date->format('Y-m-d') . ' ' . $this->scheduled_time;
    }
}
