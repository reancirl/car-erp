<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WarrantyClaimPart extends Model
{
    use HasFactory;

    protected $fillable = [
        'warranty_claim_id',
        'part_inventory_id',
        'part_number',
        'part_name',
        'description',
        'quantity',
        'unit_price',
        'total_price',
        'claim_status',
        'approved_quantity',
        'approved_amount',
        'rejection_reason',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'approved_quantity' => 'decimal:2',
        'approved_amount' => 'decimal:2',
    ];

    protected $appends = [
        'subtotal',
    ];

    // Relationships
    public function warrantyClaim(): BelongsTo
    {
        return $this->belongsTo(WarrantyClaim::class);
    }

    public function partInventory(): BelongsTo
    {
        return $this->belongsTo(PartInventory::class);
    }

    // Boot method to auto-calculate total
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($part) {
            $part->total_price = $part->quantity * $part->unit_price;
        });

        static::updating(function ($part) {
            if ($part->isDirty(['quantity', 'unit_price'])) {
                $part->total_price = $part->quantity * $part->unit_price;
            }
        });
    }

    // Accessors
    public function getFormattedTotalPriceAttribute(): string
    {
        return '₱' . number_format($this->total_price, 2);
    }

    public function getFormattedUnitPriceAttribute(): string
    {
        return '₱' . number_format($this->unit_price, 2);
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

    public function getSubtotalAttribute(): float
    {
        return (float) $this->total_price;
    }
}
