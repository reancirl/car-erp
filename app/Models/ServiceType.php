<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceType extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'branch_id',
        'name',
        'code',
        'description',
        'category',
        'interval_type',
        'interval_value',
        'estimated_duration',
        'base_price',
        'currency',
        'status',
        'is_available',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'estimated_duration' => 'decimal:2',
        'base_price' => 'decimal:2',
        'interval_value' => 'integer',
        'is_available' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Boot method for model events.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($serviceType) {
            if (!$serviceType->code) {
                $serviceType->code = static::generateCode($serviceType->name);
            }
        });
    }

    /**
     * Generate a unique code from the service type name.
     */
    private static function generateCode(string $name): string
    {
        // Create base code from first letters of words
        $words = explode(' ', $name);
        $baseCode = strtoupper(
            implode('', array_map(fn($word) => substr($word, 0, 1), $words))
        );

        // Check for uniqueness
        $code = $baseCode;
        $counter = 1;
        while (static::where('code', $code)->exists()) {
            $code = $baseCode . $counter;
            $counter++;
        }

        return $code;
    }

    /**
     * Relationship: Service Type belongs to a Branch.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Relationship: Service Type belongs to a User (creator).
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship: Service Type belongs to a User (updater).
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Relationship: Service Type has many Work Orders.
     */
    public function workOrders(): HasMany
    {
        return $this->hasMany(WorkOrder::class, 'service_type_id');
    }

    /**
     * Relationship: Service Type belongs to many Common Services.
     */
    public function commonServices(): BelongsToMany
    {
        return $this->belongsToMany(
            CommonService::class,
            'service_type_common_service',
            'service_type_id',
            'common_service_id'
        )
        ->withPivot('sequence')
        ->withTimestamps()
        ->orderBy('service_type_common_service.sequence');
    }

    /**
     * Scope: Filter by branch.
     */
    public function scopeForBranch($query, int $branchId)
    {
        return $query->where('branch_id', $branchId);
    }

    /**
     * Scope: Filter by user's branch.
     */
    public function scopeForUserBranch($query, User $user)
    {
        return $query->where('branch_id', $user->branch_id);
    }

    /**
     * Scope: Get only active service types.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')->where('is_available', true);
    }

    /**
     * Scope: Get only inactive service types.
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    /**
     * Scope: Filter by category.
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope: Filter by interval type.
     */
    public function scopeByIntervalType($query, string $intervalType)
    {
        return $query->where('interval_type', $intervalType);
    }

    /**
     * Scope: Get mileage-based services.
     */
    public function scopeMileageBased($query)
    {
        return $query->where('interval_type', 'mileage');
    }

    /**
     * Scope: Get time-based services.
     */
    public function scopeTimeBased($query)
    {
        return $query->where('interval_type', 'time');
    }

    /**
     * Helper: Check if service type is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && $this->is_available;
    }

    /**
     * Helper: Check if service is mileage-based.
     */
    public function isMileageBased(): bool
    {
        return $this->interval_type === 'mileage';
    }

    /**
     * Helper: Check if service is time-based.
     */
    public function isTimeBased(): bool
    {
        return $this->interval_type === 'time';
    }

    /**
     * Accessor: Get formatted base price.
     */
    public function getFormattedBasePriceAttribute(): string
    {
        return $this->currency . ' ' . number_format($this->base_price, 2);
    }

    /**
     * Accessor: Get formatted estimated duration.
     */
    public function getFormattedEstimatedDurationAttribute(): string
    {
        $hours = floor($this->estimated_duration);
        $minutes = ($this->estimated_duration - $hours) * 60;

        if ($minutes > 0) {
            return $hours . 'h ' . round($minutes) . 'm';
        }

        return $hours . ' hour' . ($hours != 1 ? 's' : '');
    }

    /**
     * Accessor: Get interval description.
     */
    public function getIntervalDescriptionAttribute(): ?string
    {
        if ($this->interval_type === 'on_demand') {
            return 'On Demand';
        }

        if (!$this->interval_value) {
            return null;
        }

        if ($this->interval_type === 'mileage') {
            return 'Every ' . number_format($this->interval_value) . ' km';
        }

        if ($this->interval_type === 'time') {
            $months = $this->interval_value;
            if ($months < 12) {
                return 'Every ' . $months . ' month' . ($months != 1 ? 's' : '');
            }
            $years = $months / 12;
            return 'Every ' . $years . ' year' . ($years != 1 ? 's' : '');
        }

        return null;
    }

    /**
     * Accessor: Get category badge info.
     */
    public function getCategoryBadgeAttribute(): array
    {
        $badges = [
            'maintenance' => ['text' => 'Maintenance', 'color' => 'blue'],
            'repair' => ['text' => 'Repair', 'color' => 'orange'],
            'warranty' => ['text' => 'Warranty', 'color' => 'green'],
            'inspection' => ['text' => 'Inspection', 'color' => 'purple'],
            'diagnostic' => ['text' => 'Diagnostic', 'color' => 'yellow'],
        ];

        return $badges[$this->category] ?? ['text' => 'Unknown', 'color' => 'gray'];
    }

    /**
     * Accessor: Get status badge info.
     */
    public function getStatusBadgeAttribute(): array
    {
        $badges = [
            'active' => ['text' => 'Active', 'color' => 'green'],
            'inactive' => ['text' => 'Inactive', 'color' => 'gray'],
            'discontinued' => ['text' => 'Discontinued', 'color' => 'red'],
        ];

        return $badges[$this->status] ?? ['text' => 'Unknown', 'color' => 'gray'];
    }

    /**
     * Helper: Calculate total price with common services.
     */
    public function calculateTotalPrice(): float
    {
        $basePrice = (float) $this->base_price;
        $servicesTotal = $this->commonServices->sum('standard_price');

        return $basePrice + $servicesTotal;
    }

    /**
     * Helper: Calculate total estimated duration.
     */
    public function calculateTotalDuration(): float
    {
        $baseDuration = (float) $this->estimated_duration;
        $servicesDuration = $this->commonServices->sum('estimated_duration');

        return $baseDuration + $servicesDuration;
    }
}
