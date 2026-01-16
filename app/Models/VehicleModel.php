<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class VehicleModel extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'make',
        'model',
        'model_code',
        'year',
        'generation',
        'body_type',
        'doors',
        'seating_capacity',
        'engine_type',
        'engine_displacement',
        'horsepower',
        'torque',
        'transmission',
        'drivetrain',
        'fuel_type',
        'fuel_tank_capacity',
        'fuel_consumption_city',
        'fuel_consumption_highway',
        'battery_capacity_kwh',
        'electric_range_km',
        'charging_type',
        'charging_time_fast',
        'charging_time_slow',
        'motor_power_kw',
        'length_mm',
        'width_mm',
        'height_mm',
        'wheelbase_mm',
        'ground_clearance_mm',
        'cargo_capacity_liters',
        'curb_weight_kg',
        'gross_weight_kg',
        'base_price',
        'srp',
        'currency',
        'standard_features',
        'optional_features',
        'safety_features',
        'technology_features',
        'available_colors',
        'available_trims',
        'images',
        'description',
        'specifications_pdf',
        'manual_documents',
        'is_active',
        'is_featured',
        'launch_date',
        'discontinuation_date',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'year' => 'integer',
        'doors' => 'integer',
        'seating_capacity' => 'integer',
        'engine_displacement' => 'decimal:2',
        'horsepower' => 'integer',
        'torque' => 'integer',
        'fuel_tank_capacity' => 'decimal:2',
        'fuel_consumption_city' => 'decimal:2',
        'fuel_consumption_highway' => 'decimal:2',
        'battery_capacity_kwh' => 'decimal:2',
        'electric_range_km' => 'integer',
        'charging_time_fast' => 'decimal:2',
        'charging_time_slow' => 'decimal:2',
        'motor_power_kw' => 'integer',
        'length_mm' => 'integer',
        'width_mm' => 'integer',
        'height_mm' => 'integer',
        'wheelbase_mm' => 'integer',
        'ground_clearance_mm' => 'integer',
        'cargo_capacity_liters' => 'integer',
        'curb_weight_kg' => 'integer',
        'gross_weight_kg' => 'integer',
        'base_price' => 'decimal:2',
        'srp' => 'decimal:2',
        'standard_features' => 'array',
        'optional_features' => 'array',
        'safety_features' => 'array',
        'technology_features' => 'array',
        'available_colors' => 'array',
        'available_trims' => 'array',
        'images' => 'array',
        'manual_documents' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'launch_date' => 'date',
        'discontinuation_date' => 'date',
    ];

    /**
     * Get the vehicle units for this model.
     */
    public function vehicleUnits(): HasMany
    {
        return $this->hasMany(VehicleUnit::class);
    }

    /**
     * Scope a query to only include active models.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include featured models.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope a query to filter by year.
     */
    public function scopeByYear($query, int $year)
    {
        return $query->where('year', $year);
    }

    /**
     * Scope a query to filter by body type.
     */
    public function scopeByBodyType($query, string $bodyType)
    {
        return $query->where('body_type', $bodyType);
    }

    /**
     * Scope a query to filter by fuel type.
     */
    public function scopeByFuelType($query, string $fuelType)
    {
        return $query->where('fuel_type', $fuelType);
    }

    /**
     * Scope a query to search across model name and code.
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('model', 'like', "%{$search}%")
              ->orWhere('model_code', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    /**
     * Get the full model name with year.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->year} {$this->make} {$this->model}";
    }

    /**
     * Get activity log options.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['*'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
