<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WarrantyClaimService extends Model
{
    use HasFactory;

    protected $fillable = [
        'warranty_claim_id',
        'service_type_id',
        'service_code',
        'service_name',
        'description',
        'labor_hours',
        'labor_rate',
        'total_labor_cost',
        'claim_status',
        'approved_hours',
        'approved_amount',
        'rejection_reason',
    ];

    protected $casts = [
        'labor_hours' => 'decimal:2',
        'labor_rate' => 'decimal:2',
        'total_labor_cost' => 'decimal:2',
        'approved_hours' => 'decimal:2',
        'approved_amount' => 'decimal:2',
    ];

    // Relationships
    public function warrantyClaim(): BelongsTo
    {
        return $this->belongsTo(WarrantyClaim::class);
    }

    public function serviceType(): BelongsTo
    {
        return $this->belongsTo(ServiceType::class);
    }

    // Boot method to auto-calculate total
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($service) {
            $service->total_labor_cost = $service->labor_hours * $service->labor_rate;
        });

        static::updating(function ($service) {
            if ($service->isDirty(['labor_hours', 'labor_rate'])) {
                $service->total_labor_cost = $service->labor_hours * $service->labor_rate;
            }
        });
    }

    // Accessors
    public function getFormattedTotalLaborCostAttribute(): string
    {
        return '₱' . number_format($this->total_labor_cost, 2);
    }

    public function getFormattedLaborRateAttribute(): string
    {
        return '₱' . number_format($this->labor_rate, 2);
    }

    public function getStatusBadgeAttribute(): array
    {
        $badges = [
            'pending' => ['text' => 'Pending', 'color' => 'gray'],
            'approved' => ['text' => 'Approved', 'color' => 'green'],
            'rejected' => ['text' => 'Rejected', 'color' => 'red'],
            'partial' => ['text' => 'Partial', 'color' => 'yellow'],
        ];

        return $badges[$this->claim_status] ?? ['text' => 'Unknown', 'color' => 'gray'];
    }
}
