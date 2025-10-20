<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pipeline extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'pipeline_id',
        'branch_id',
        'lead_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'sales_rep_id',
        'vehicle_interest',
        'vehicle_year',
        'vehicle_make',
        'vehicle_model',
        'quote_amount',
        'current_stage',
        'previous_stage',
        'stage_entry_timestamp',
        'stage_duration_hours',
        'probability',
        'priority',
        'lead_score',
        'next_action',
        'next_action_due',
        'auto_progression_enabled',
        'auto_loss_rule_enabled',
        'follow_up_frequency',
        'notes',
        'tags',
        'auto_logged_events_count',
        'manual_notes_count',
        'attachments_count',
        'last_activity_at',
    ];

    protected $casts = [
        'tags' => 'array',
        'stage_entry_timestamp' => 'datetime',
        'next_action_due' => 'datetime',
        'last_activity_at' => 'datetime',
        'quote_amount' => 'decimal:2',
        'stage_duration_hours' => 'decimal:2',
        'probability' => 'integer',
        'lead_score' => 'integer',
        'auto_logged_events_count' => 'integer',
        'manual_notes_count' => 'integer',
        'attachments_count' => 'integer',
        'auto_progression_enabled' => 'boolean',
        'auto_loss_rule_enabled' => 'boolean',
    ];

    /**
     * Relationships
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function salesRep()
    {
        return $this->belongsTo(User::class, 'sales_rep_id');
    }

    public function stageLogs()
    {
        return $this->hasMany(PipelineStageLog::class)->orderBy('entry_timestamp', 'desc');
    }

    /**
     * Scopes for Branch Filtering
     */
    public function scopeForBranch($query, $branchId)
    {
        return $query->where('branch_id', $branchId);
    }

    public function scopeForUserBranch($query, User $user)
    {
        return $query->where('branch_id', $user->branch_id);
    }

    /**
     * Boot method to auto-generate pipeline_id and log initial stage
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($pipeline) {
            if (!$pipeline->pipeline_id) {
                $pipeline->pipeline_id = self::generatePipelineId();
            }
            
            // Set initial stage entry timestamp
            if (!$pipeline->stage_entry_timestamp) {
                $pipeline->stage_entry_timestamp = now();
            }
            
            // Set initial last activity
            $pipeline->last_activity_at = now();
        });

        static::created(function ($pipeline) {
            // Create initial stage log
            $pipeline->logStageChange(
                $pipeline->current_stage,
                null,
                'manual',
                'Pipeline Created',
                'Initial pipeline entry'
            );
        });

        static::updating(function ($pipeline) {
            // Check if stage changed
            if ($pipeline->isDirty('current_stage')) {
                $oldStage = $pipeline->getOriginal('current_stage');
                $newStage = $pipeline->current_stage;
                
                // Calculate duration in previous stage
                $stageEntryTime = $pipeline->getOriginal('stage_entry_timestamp');
                if ($stageEntryTime) {
                    $duration = now()->diffInHours($stageEntryTime, true);
                    $pipeline->stage_duration_hours = round($duration, 2);
                }
                
                // Update previous stage and entry timestamp
                $pipeline->previous_stage = $oldStage;
                $pipeline->stage_entry_timestamp = now();
            }
            
            // Update last activity timestamp
            $pipeline->last_activity_at = now();
        });

        static::updated(function ($pipeline) {
            // Log stage change if stage was updated
            if ($pipeline->wasChanged('current_stage')) {
                $pipeline->logStageChange(
                    $pipeline->current_stage,
                    $pipeline->previous_stage,
                    'manual',
                    'Stage Updated',
                    'Pipeline stage manually updated'
                );
            }
        });
    }

    /**
     * Generate unique pipeline ID (PL-YYYY-XXX)
     */
    private static function generatePipelineId(): string
    {
        $year = date('Y');
        $lastPipeline = self::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $number = $lastPipeline ? intval(substr($lastPipeline->pipeline_id, -3)) + 1 : 1;
        return sprintf('PL-%s-%03d', $year, $number);
    }

    /**
     * Log stage change
     */
    public function logStageChange(
        string $stage,
        ?string $previousStage = null,
        string $triggerType = 'manual',
        ?string $triggerSystem = null,
        ?string $triggerEvent = null,
        ?int $triggerUserId = null,
        array $properties = []
    ): PipelineStageLog {
        // Close previous stage log if exists
        $lastLog = $this->stageLogs()
            ->where('stage', $previousStage ?? $this->getOriginal('current_stage'))
            ->whereNull('exit_timestamp')
            ->first();
            
        if ($lastLog) {
            $duration = now()->diffInHours($lastLog->entry_timestamp, true);
            $lastLog->update([
                'exit_timestamp' => now(),
                'duration_hours' => round($duration, 2),
            ]);
        }

        // Create new stage log
        $stageLog = $this->stageLogs()->create([
            'stage' => $stage,
            'previous_stage' => $previousStage,
            'entry_timestamp' => now(),
            'trigger_type' => $triggerType,
            'trigger_system' => $triggerSystem,
            'trigger_event' => $triggerEvent,
            'trigger_user_id' => $triggerUserId ?? auth()->id(),
            'properties' => $properties,
        ]);

        // Increment auto-logged events count if auto trigger
        if ($triggerType === 'auto') {
            $this->increment('auto_logged_events_count');
        }

        return $stageLog;
    }

    /**
     * Calculate lead score based on various factors
     */
    public function calculateLeadScore(): int
    {
        $score = 0;

        // Contact information completeness
        if ($this->customer_name) $score += 10;
        if ($this->customer_phone) $score += 15;
        if ($this->customer_email) $score += 15;

        // Vehicle interest specificity
        if ($this->vehicle_make && $this->vehicle_model) $score += 15;
        if ($this->quote_amount && $this->quote_amount > 0) $score += 20;

        // Priority
        $priorityScores = [
            'low' => 0,
            'medium' => 5,
            'high' => 10,
            'urgent' => 15,
        ];
        $score += $priorityScores[$this->priority] ?? 0;

        // Next action defined
        if ($this->next_action) $score += 5;

        // Lead source from related lead
        if ($this->lead) {
            $sourceScores = [
                'referral' => 20,
                'walk_in' => 10,
                'web_form' => 15,
                'phone' => 10,
                'social_media' => 5,
            ];
            $score += $sourceScores[$this->lead->source] ?? 0;
        }

        return min(100, $score);
    }

    /**
     * Get stage progress percentage
     */
    public function getStageProgressAttribute(): int
    {
        $stages = ['lead', 'qualified', 'quote_sent', 'test_drive_scheduled', 'test_drive_completed', 'reservation_made'];
        $currentIndex = array_search($this->current_stage, $stages);
        
        if ($currentIndex === false) return 0;
        
        return (int) round((($currentIndex + 1) / count($stages)) * 100);
    }
}
