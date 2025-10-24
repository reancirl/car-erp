<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CommonService extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Supported common service categories and their display labels.
     */
    public const CATEGORIES = [
        ['value' => 'maintenance', 'label' => 'Maintenance'],
        ['value' => 'repair', 'label' => 'Repair'],
        ['value' => 'inspection', 'label' => 'Inspection'],
        ['value' => 'diagnostic', 'label' => 'Diagnostic'],
    ];

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
        'estimated_duration',
        'standard_price',
        'currency',
        'is_active',
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
        'standard_price' => 'decimal:2',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Appended attributes for serialization.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'formatted_standard_price',
        'formatted_estimated_duration',
        'category_badge',
        'status_badge',
    ];

    /**
     * Hook into model events.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function (CommonService $commonService) {
            if (! $commonService->code) {
                $commonService->code = static::generateCode($commonService->name);
            }
        });
    }

    /**
     * Generate a unique code derived from the service name.
     */
    private static function generateCode(string $name): string
    {
        $words = preg_split('/\s+/', trim($name));
        $baseCode = strtoupper(
            implode('', array_map(fn($word) => substr($word, 0, 1), $words))
        );

        $code = $baseCode;
        $counter = 1;
        while (static::where('code', $code)->exists()) {
            $code = $baseCode . $counter;
            $counter++;
        }

        return $code;
    }

    /**
     * Relationship: Common Service belongs to a Branch.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Relationship: Common Service belongs to a User (creator).
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship: Common Service belongs to a User (updater).
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Relationship: Common Service belongs to many Service Types.
     */
    public function serviceTypes(): BelongsToMany
    {
        return $this->belongsToMany(
            ServiceType::class,
            'service_type_common_service',
            'common_service_id',
            'service_type_id'
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
     * Scope: Get only active common services.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Get only inactive common services.
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Scope: Filter by category.
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Helper: Check if common service is active.
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Accessor: Get formatted standard price.
     */
    public function getFormattedStandardPriceAttribute(): string
    {
        return $this->currency . ' ' . number_format($this->standard_price, 2);
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
     * Accessor: Get category badge info.
     */
    public function getCategoryBadgeAttribute(): array
    {
        $badges = [
            'maintenance' => ['text' => 'Maintenance', 'color' => 'blue'],
            'repair' => ['text' => 'Repair', 'color' => 'orange'],
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
        return $this->is_active
            ? ['text' => 'Active', 'color' => 'green']
            : ['text' => 'Inactive', 'color' => 'gray'];
    }
}
