<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartInventory extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'parts_inventory';

    // 1. Fillable fields
    protected $fillable = [
        'part_number',
        'branch_id',
        'part_name',
        'description',
        'category',
        'subcategory',
        'manufacturer',
        'manufacturer_part_number',
        'oem_part_number',
        'compatible_makes',
        'compatible_models',
        'compatible_years',
        'quantity_on_hand',
        'quantity_reserved',
        'minimum_stock_level',
        'maximum_stock_level',
        'reorder_quantity',
        'warehouse_location',
        'aisle',
        'rack',
        'bin',
        'unit_cost',
        'selling_price',
        'wholesale_price',
        'currency',
        'markup_percentage',
        'weight',
        'length',
        'width',
        'height',
        'primary_supplier',
        'supplier_contact',
        'supplier_email',
        'supplier_phone',
        'lead_time_days',
        'condition',
        'quality_grade',
        'is_genuine',
        'warranty_months',
        'warranty_terms',
        'status',
        'is_serialized',
        'is_hazardous',
        'requires_special_handling',
        'is_fast_moving',
        'last_received_date',
        'last_sold_date',
        'last_counted_date',
        'discontinued_date',
        'total_sold',
        'total_revenue',
        'times_ordered',
        'average_monthly_sales',
        'days_in_stock',
        'turnover_rate',
        'images',
        'documents',
        'notes',
        'tags',
        'barcode',
        'sku',
    ];

    // 2. Casts for type safety
    protected $casts = [
        'compatible_makes' => 'array',
        'compatible_models' => 'array',
        'compatible_years' => 'array',
        'quantity_on_hand' => 'integer',
        'quantity_reserved' => 'integer',
        'minimum_stock_level' => 'integer',
        'maximum_stock_level' => 'integer',
        'reorder_quantity' => 'integer',
        'unit_cost' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'wholesale_price' => 'decimal:2',
        'markup_percentage' => 'decimal:2',
        'weight' => 'decimal:2',
        'length' => 'decimal:2',
        'width' => 'decimal:2',
        'height' => 'decimal:2',
        'lead_time_days' => 'integer',
        'is_genuine' => 'boolean',
        'warranty_months' => 'integer',
        'is_serialized' => 'boolean',
        'is_hazardous' => 'boolean',
        'requires_special_handling' => 'boolean',
        'is_fast_moving' => 'boolean',
        'last_received_date' => 'date',
        'last_sold_date' => 'date',
        'last_counted_date' => 'date',
        'discontinued_date' => 'date',
        'total_sold' => 'integer',
        'total_revenue' => 'decimal:2',
        'times_ordered' => 'integer',
        'average_monthly_sales' => 'decimal:2',
        'days_in_stock' => 'integer',
        'turnover_rate' => 'decimal:2',
        'images' => 'array',
        'documents' => 'array',
        'tags' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // 3. Relationships
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    // 4. Query Scopes
    public function scopeForBranch($query, $branchId)
    {
        return $query->where('branch_id', $branchId);
    }

    public function scopeForUserBranch($query, User $user)
    {
        return $query->where('branch_id', $user->branch_id);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInStock($query)
    {
        return $query->where('quantity_on_hand', '>', 0);
    }

    public function scopeLowStock($query)
    {
        return $query->whereRaw('quantity_on_hand <= minimum_stock_level')
            ->where('quantity_on_hand', '>', 0);
    }

    public function scopeOutOfStock($query)
    {
        return $query->where('quantity_on_hand', '<=', 0);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeFastMoving($query)
    {
        return $query->where('is_fast_moving', true);
    }

    // 5. Boot method for auto-generation
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($part) {
            if (!$part->part_number) {
                $part->part_number = self::generatePartNumber();
            }
            
            // Calculate markup percentage if not provided
            if (!$part->markup_percentage && $part->unit_cost > 0 && $part->selling_price > 0) {
                $part->markup_percentage = (($part->selling_price - $part->unit_cost) / $part->unit_cost) * 100;
            }
        });

        static::updating(function ($part) {
            // Recalculate markup percentage if prices change
            if ($part->isDirty(['unit_cost', 'selling_price']) && $part->unit_cost > 0 && $part->selling_price > 0) {
                $part->markup_percentage = (($part->selling_price - $part->unit_cost) / $part->unit_cost) * 100;
            }
        });
    }

    // 6. Helper methods
    private static function generatePartNumber(): string
    {
        $year = date('Y');
        $lastPart = self::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();
        
        $number = $lastPart ? intval(substr($lastPart->part_number, -3)) + 1 : 1;
        
        return sprintf('PART-%s-%03d', $year, $number);
    }

    public function isLowStock(): bool
    {
        return $this->quantity_on_hand <= $this->minimum_stock_level && $this->quantity_on_hand > 0;
    }

    public function isOutOfStock(): bool
    {
        return $this->quantity_on_hand <= 0;
    }

    public function needsReorder(): bool
    {
        return $this->quantity_on_hand <= $this->minimum_stock_level;
    }

    public function getAvailableQuantity(): int
    {
        return max(0, $this->quantity_on_hand - $this->quantity_reserved);
    }

    public function calculateInventoryValue(): float
    {
        return $this->quantity_on_hand * $this->unit_cost;
    }

    public function calculatePotentialRevenue(): float
    {
        return $this->quantity_on_hand * $this->selling_price;
    }

    public function calculateProfit(): float
    {
        return ($this->selling_price - $this->unit_cost) * $this->quantity_on_hand;
    }

    // 7. Accessors for formatted data
    public function getFormattedUnitCostAttribute(): string
    {
        return $this->currency . ' ' . number_format($this->unit_cost, 2);
    }

    public function getFormattedSellingPriceAttribute(): string
    {
        return $this->currency . ' ' . number_format($this->selling_price, 2);
    }

    public function getFormattedInventoryValueAttribute(): string
    {
        return $this->currency . ' ' . number_format($this->calculateInventoryValue(), 2);
    }

    public function getStockStatusAttribute(): string
    {
        if ($this->isOutOfStock()) {
            return 'out_of_stock';
        } elseif ($this->isLowStock()) {
            return 'low_stock';
        } else {
            return 'in_stock';
        }
    }

    public function getStockStatusBadgeAttribute(): array
    {
        $status = $this->stock_status;
        
        return match($status) {
            'out_of_stock' => ['text' => 'Out of Stock', 'color' => 'red'],
            'low_stock' => ['text' => 'Low Stock', 'color' => 'yellow'],
            'in_stock' => ['text' => 'In Stock', 'color' => 'green'],
            default => ['text' => 'Unknown', 'color' => 'gray'],
        };
    }

    public function getFullLocationAttribute(): ?string
    {
        $parts = array_filter([
            $this->warehouse_location,
            $this->aisle ? "Aisle {$this->aisle}" : null,
            $this->rack ? "Rack {$this->rack}" : null,
            $this->bin ? "Bin {$this->bin}" : null,
        ]);

        return !empty($parts) ? implode(' - ', $parts) : null;
    }
}
