<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class UserSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'user_id',
        'login_time',
        'logout_time',
        'ip_address',
        'user_agent',
        'activity_count',
        'last_activity_at',
        'idle_time_minutes',
        'status',
        'logout_reason',
    ];

    protected $casts = [
        'login_time' => 'datetime',
        'logout_time' => 'datetime',
        'last_activity_at' => 'datetime',
        'activity_count' => 'integer',
        'idle_time_minutes' => 'integer',
    ];

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('login_time', today());
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Helpers
     */
    public function calculateDuration(): ?int
    {
        if (!$this->logout_time) {
            // Session still active - calculate from login to now
            return $this->login_time->diffInMinutes(now());
        }
        
        return $this->login_time->diffInMinutes($this->logout_time);
    }

    public function getDurationFormatted(): string
    {
        $minutes = $this->calculateDuration();
        
        if ($minutes === null) {
            return 'N/A';
        }
        
        $hours = floor($minutes / 60);
        $mins = $minutes % 60;
        
        return sprintf('%dh %dm', $hours, $mins);
    }

    public function getIdleTimeFormatted(): string
    {
        $minutes = $this->idle_time_minutes;
        
        if ($minutes < 60) {
            return sprintf('%dm', $minutes);
        }
        
        $hours = floor($minutes / 60);
        $mins = $minutes % 60;
        
        return sprintf('%dh %dm', $hours, $mins);
    }

    public function updateActivity(): void
    {
        $this->increment('activity_count');
        $this->update(['last_activity_at' => now()]);
    }

    public function calculateIdleTime(): void
    {
        if ($this->last_activity_at) {
            $idleMinutes = $this->last_activity_at->diffInMinutes(now());
            $this->update(['idle_time_minutes' => $idleMinutes]);
        }
    }

    public function endSession(string $reason = 'normal_logout'): void
    {
        $this->update([
            'logout_time' => now(),
            'status' => $reason === 'idle_timeout' ? 'idle_timeout' : 
                       ($reason === 'forced_logout' ? 'forced_logout' : 'completed'),
            'logout_reason' => $reason,
        ]);
    }

    /**
     * Accessors
     */
    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active' && $this->logout_time === null;
    }

    public function getDurationMinutesAttribute(): int
    {
        return $this->calculateDuration() ?? 0;
    }
}
