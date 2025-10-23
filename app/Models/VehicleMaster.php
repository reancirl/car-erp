<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class VehicleMaster extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'make',
        'model',
        'year',
        'trim',
        'body_type',
        'transmission',
        'fuel_type',
        'drivetrain',
        'seating',
        'doors',
        'base_price',
        'currency',
        'specs',
        'description',
        'images',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'year' => 'integer',
        'seating' => 'integer',
        'doors' => 'integer',
        'base_price' => 'decimal:2',
        'specs' => 'array',
        'features' => 'array',
        'images' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the vehicle units for this master.
     */
    public function units(): HasMany
    {
        return $this->hasMany(VehicleUnit::class);
    }

    /**
     * Scope a query to only include active masters.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by make.
     */
    public function scopeByMake($query, string $make)
    {
        return $query->where('make', $make);
    }

    /**
     * Scope a query to filter by model.
     */
    public function scopeByModel($query, string $model)
    {
        return $query->where('model', $model);
    }

    /**
     * Scope a query to filter by year.
     */
    public function scopeByYear($query, int $year)
    {
        return $query->where('year', $year);
    }

    /**
     * Scope a query to search across make, model, and trim.
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('make', 'like', "%{$search}%")
                ->orWhere('model', 'like', "%{$search}%")
                ->orWhere('trim', 'like', "%{$search}%");
        });
    }

    /**
     * Get the full name of the vehicle.
     */
    public function getFullNameAttribute(): string
    {
        $parts = [$this->year, $this->make, $this->model];
        
        if ($this->trim) {
            $parts[] = $this->trim;
        }
        
        return implode(' ', $parts);
    }

    /**
     * Get the count of available units.
     */
    public function getAvailableUnitsCountAttribute(): int
    {
        return $this->units()->where('status', 'in_stock')->count();
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
     * Check if master has a specific spec.
     */
    public function hasSpec(string $key): bool
    {
        return data_get($this->specs, $key) !== null;
    }
}
