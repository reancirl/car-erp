<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WarrantyClaimPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'warranty_claim_id',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'photo_type',
        'latitude',
        'longitude',
        'camera_make',
        'camera_model',
        'photo_taken_at',
        'caption',
        'notes',
        'uploaded_by',
        'upload_ip',
        'upload_user_agent',
        'is_verified',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'photo_taken_at' => 'datetime',
        'is_verified' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function warrantyClaim(): BelongsTo
    {
        return $this->belongsTo(WarrantyClaim::class);
    }

    public function uploadedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    // Accessors
    public function getPhotoTypeBadgeAttribute(): array
    {
        $badges = [
            'failure' => ['text' => 'Failure', 'color' => 'red'],
            'damage' => ['text' => 'Damage', 'color' => 'orange'],
            'before_repair' => ['text' => 'Before Repair', 'color' => 'yellow'],
            'after_repair' => ['text' => 'After Repair', 'color' => 'green'],
            'documentation' => ['text' => 'Documentation', 'color' => 'blue'],
            'other' => ['text' => 'Other', 'color' => 'gray'],
        ];

        return $badges[$this->photo_type] ?? ['text' => 'Unknown', 'color' => 'gray'];
    }

    public function getFullUrlAttribute(): string
    {
        return asset('storage/' . $this->file_path);
    }

    public function getFormattedFileSizeAttribute(): ?string
    {
        if (!$this->file_size) {
            return null;
        }

        $bytes = (int) $this->file_size;

        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }

        return $bytes . ' B';
    }

    public function hasGpsData(): bool
    {
        return $this->latitude !== null && $this->longitude !== null;
    }
}
