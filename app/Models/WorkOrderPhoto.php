<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkOrderPhoto extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'work_order_id',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'photo_type',
        'latitude',
        'longitude',
        'location_address',
        'photo_taken_at',
        'camera_make',
        'camera_model',
        'uploaded_ip_address',
        'user_agent',
        'uploaded_by',
        'has_gps_data',
        'has_exif_data',
        'is_verified',
        'notes',
    ];

    /**
     * Attribute casting.
     */
    protected $casts = [
        'file_size' => 'integer',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'photo_taken_at' => 'datetime',
        'has_gps_data' => 'boolean',
        'has_exif_data' => 'boolean',
        'is_verified' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Attributes to append to model's array form.
     */
    protected $appends = [
        'url',
        'file_size_formatted',
    ];

    /**
     * Relationship: Photo belongs to a work order.
     */
    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    /**
     * Relationship: Photo uploaded by user.
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get full URL for the photo.
     */
    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->file_path);
    }

    /**
     * Get human-readable file size.
     */
    public function getFileSizeFormattedAttribute(): string
    {
        if (!$this->file_size) {
            return 'Unknown';
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = $this->file_size;
        $i = 0;

        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Check if photo has location data.
     */
    public function hasLocation(): bool
    {
        return $this->latitude !== null && $this->longitude !== null;
    }

    /**
     * Get location coordinates as array.
     */
    public function getLocationAttribute(): ?array
    {
        if (!$this->hasLocation()) {
            return null;
        }

        return [
            'lat' => (float) $this->latitude,
            'lng' => (float) $this->longitude,
            'address' => $this->location_address,
        ];
    }

    /**
     * Scope: Filter by photo type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('photo_type', $type);
    }

    /**
     * Scope: Only photos with GPS data.
     */
    public function scopeWithGPS($query)
    {
        return $query->where('has_gps_data', true);
    }

    /**
     * Scope: Only verified photos.
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }
}
