<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AttributeDefinition extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'key',
        'label',
        'type',
        'scope',
        'uom',
        'enum_options',
        'is_required_master',
        'is_required_unit',
        'is_active',
        'description',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'enum_options' => 'array',
        'is_required_master' => 'boolean',
        'is_required_unit' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get the attribute set items that use this definition.
     */
    public function attributeSetItems(): HasMany
    {
        return $this->hasMany(AttributeSetItem::class);
    }

    /**
     * Scope a query to only include active definitions.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by scope.
     */
    public function scopeForScope($query, string $scope)
    {
        return $query->where('scope', $scope)
            ->orWhere('scope', 'both');
    }

    /**
     * Scope a query to filter by type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Check if this attribute is required for masters.
     */
    public function isRequiredForMaster(): bool
    {
        return $this->is_required_master && in_array($this->scope, ['master', 'both']);
    }

    /**
     * Check if this attribute is required for units.
     */
    public function isRequiredForUnit(): bool
    {
        return $this->is_required_unit && in_array($this->scope, ['unit', 'both']);
    }

    /**
     * Check if this attribute applies to the given scope.
     */
    public function appliesTo(string $scope): bool
    {
        return $this->scope === 'both' || $this->scope === $scope;
    }

    /**
     * Validate a value against this definition.
     */
    public function validateValue($value): bool
    {
        return match ($this->type) {
            'string' => is_string($value),
            'int' => is_int($value),
            'decimal' => is_numeric($value),
            'bool' => is_bool($value),
            'enum' => is_string($value) && in_array($value, $this->enum_options ?? []),
            default => false,
        };
    }

    /**
     * Get formatted label with UOM if applicable.
     */
    public function getFormattedLabelAttribute(): string
    {
        return $this->uom ? "{$this->label} ({$this->uom})" : $this->label;
    }
}
