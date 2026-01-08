<?php

namespace App\Models;

use App\Models\Concerns\BranchScoped;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class VehicleUnit extends Model
{
    use HasFactory, SoftDeletes, BranchScoped;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'vehicle_model_id',
        'variant',
        'variant_spec',
        'branch_id',
        'assigned_user_id',
        'owner_id',
        'vin',
        'stock_number',
        'conduction_no',
        'drive_motor_no',
        'plate_no',
        'status',
        'location',
        'sub_status',
        'is_locked',
        'purchase_price',
        'sale_price',
        'msrp_price',
        'currency',
        'acquisition_date',
        'sold_date',
        'specs',
        'notes',
        'images',
        'color_exterior',
        'color_interior',
        'color_code',
        'odometer',
        'battery_capacity',
        'battery_range_km',
        'lto_transaction_no',
        'cr_no',
        'or_cr_release_date',
        'emission_reference',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'purchase_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'msrp_price' => 'decimal:2',
        'acquisition_date' => 'date',
        'sold_date' => 'date',
        'or_cr_release_date' => 'date',
        'specs' => 'array',
        'features' => 'array',
        'images' => 'array',
        'odometer' => 'integer',
        'battery_capacity' => 'decimal:2',
        'battery_range_km' => 'integer',
        'is_locked' => 'boolean',
    ];

    /**
     * Get the vehicle model for this unit.
     */
    public function vehicleModel(): BelongsTo
    {
        return $this->belongsTo(VehicleModel::class, 'vehicle_model_id');
    }

    /**
     * Get the assigned sales rep for this unit.
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    /**
     * Get the owner/customer for this unit (once sold).
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'owner_id');
    }

    /**
     * Get the movements for this unit.
     */
    public function movements(): HasMany
    {
        return $this->hasMany(VehicleMovement::class)->orderBy('transfer_date', 'desc');
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to filter by VIN.
     */
    public function scopeByVin($query, string $vin)
    {
        return $query->where('vin', $vin);
    }

    /**
     * Scope a query to filter by stock number.
     */
    public function scopeByStockNumber($query, string $stockNumber)
    {
        return $query->where('stock_number', $stockNumber);
    }

    /**
     * Scope a query to search across VIN, stock number, and colors.
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('vin', 'like', "%{$search}%")
                ->orWhere('stock_number', 'like', "%{$search}%")
                ->orWhere('color_exterior', 'like', "%{$search}%")
                ->orWhere('color_interior', 'like', "%{$search}%");
        });
    }

    /**
     * Scope to get available units (in stock).
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'in_stock');
    }

    /**
     * Scope to get sold units.
     */
    public function scopeSold($query)
    {
        return $query->where('status', 'sold');
    }

    /**
     * Check if unit is available for sale.
     */
    public function isAvailable(): bool
    {
        return $this->status === 'in_stock';
    }

    /**
     * Check if unit is sold.
     */
    public function isSold(): bool
    {
        return $this->status === 'sold';
    }

    /**
     * Check if unit is reserved.
     */
    public function isReserved(): bool
    {
        return $this->status === 'reserved';
    }

    /**
     * Get the full vehicle name (from linked vehicle model data).
     */
    public function getFullNameAttribute(): string
    {
        if ($this->vehicleModel) {
            $parts = array_filter([
                $this->vehicleModel->year,
                $this->vehicleModel->make,
                $this->vehicleModel->model,
                $this->vehicleModel->trim,
            ]);

            return trim(implode(' ', $parts));
        }

        return $this->stock_number ?? 'Unknown Vehicle';
    }

    /**
     * Get days in inventory.
     */
    public function getDaysInInventoryAttribute(): ?int
    {
        if (!$this->acquisition_date) {
            return null;
        }

        $endDate = $this->sold_date ?? now();
        return $this->acquisition_date->diffInDays($endDate);
    }

    /**
     * Get profit margin if sold.
     */
    public function getProfitMarginAttribute(): ?float
    {
        if (!$this->isSold() || !$this->purchase_price || !$this->sale_price) {
            return null;
        }

        return $this->sale_price - $this->purchase_price;
    }

    /**
     * Get profit percentage if sold.
     */
    public function getProfitPercentageAttribute(): ?float
    {
        if (!$this->profit_margin || !$this->purchase_price) {
            return null;
        }

        return ($this->profit_margin / $this->purchase_price) * 100;
    }

    /**
     * Get a spec value by key.
     */
    public function getSpec(string $key, $default = null)
    {
        return data_get($this->specs, $key, $default);
    }

    /**
     * Set a spec value by key.
     */
    public function setSpec(string $key, $value): void
    {
        $specs = $this->specs ?? [];
        data_set($specs, $key, $value);
        $this->specs = $specs;
    }

    /**
     * Check if unit has a specific spec.
     */
    public function hasSpec(string $key): bool
    {
        return data_get($this->specs, $key) !== null;
    }

    /**
     * Get the latest movement record.
     */
    public function getLatestMovementAttribute()
    {
        return $this->movements()->first();
    }
}
