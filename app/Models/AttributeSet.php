<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AttributeSet extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the items in this attribute set.
     */
    public function items(): HasMany
    {
        return $this->hasMany(AttributeSetItem::class)->orderBy('sort_order');
    }

    /**
     * Scope a query to only include active sets.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get all attribute definitions in this set.
     */
    public function getAttributeDefinitions()
    {
        return $this->items()
            ->with('attributeDefinition')
            ->get()
            ->pluck('attributeDefinition');
    }

    /**
     * Get default specs array from this set.
     */
    public function getDefaultSpecs(): array
    {
        $specs = [];
        
        foreach ($this->items as $item) {
            if ($item->default_value !== null && $item->attributeDefinition) {
                $specs[$item->attributeDefinition->key] = $item->default_value;
            }
        }
        
        return $specs;
    }
}
