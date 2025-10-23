<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CustomerSurvey extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'branch_id',
        'token',
        'survey_type',
        'trigger_event',
        'sent_at',
        'sent_method',
        'expires_at',
        'status',
        'completed_at',
        'ip_address',
        'user_agent',
        'overall_rating',
        'product_quality',
        'service_quality',
        'staff_friendliness',
        'facility_cleanliness',
        'value_for_money',
        'what_went_well',
        'what_needs_improvement',
        'additional_comments',
        'nps_score',
        'nps_reason',
        'wants_followup',
        'preferred_contact_method',
        'created_by',
        'custom_fields',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'expires_at' => 'datetime',
        'completed_at' => 'datetime',
        'wants_followup' => 'boolean',
        'custom_fields' => 'array',
        'overall_rating' => 'integer',
        'product_quality' => 'integer',
        'service_quality' => 'integer',
        'staff_friendliness' => 'integer',
        'facility_cleanliness' => 'integer',
        'value_for_money' => 'integer',
        'nps_score' => 'integer',
    ];

    // Relationships
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expired');
    }

    public function scopeNotExpired($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        });
    }

    // Boot method
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($survey) {
            if (!$survey->token) {
                $survey->token = self::generateUniqueToken();
            }
            
            // Set default expiration (30 days from now)
            if (!$survey->expires_at) {
                $survey->expires_at = now()->addDays(30);
            }
        });
    }

    // Helper methods
    private static function generateUniqueToken(): string
    {
        do {
            $token = Str::random(64);
        } while (self::where('token', $token)->exists());

        return $token;
    }

    public function getPublicUrlAttribute(): string
    {
        return url("/survey/{$this->token}");
    }

    public function isExpired(): bool
    {
        if (!$this->expires_at) {
            return false;
        }
        
        return $this->expires_at->isPast();
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function canBeCompleted(): bool
    {
        return $this->status === 'pending' && !$this->isExpired();
    }

    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    public function markAsExpired(): void
    {
        $this->update([
            'status' => 'expired',
        ]);
    }

    // Calculate average rating
    public function getAverageRatingAttribute(): ?float
    {
        $ratings = array_filter([
            $this->overall_rating,
            $this->product_quality,
            $this->service_quality,
            $this->staff_friendliness,
            $this->facility_cleanliness,
            $this->value_for_money,
        ]);

        if (empty($ratings)) {
            return null;
        }

        return round(array_sum($ratings) / count($ratings), 2);
    }

    // NPS Category
    public function getNpsCategoryAttribute(): ?string
    {
        if ($this->nps_score === null) {
            return null;
        }

        if ($this->nps_score >= 9) {
            return 'promoter';
        } elseif ($this->nps_score >= 7) {
            return 'passive';
        } else {
            return 'detractor';
        }
    }
}
