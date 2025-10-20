<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PipelineStageLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'pipeline_id',
        'stage',
        'previous_stage',
        'entry_timestamp',
        'exit_timestamp',
        'duration_hours',
        'trigger_type',
        'trigger_system',
        'trigger_event',
        'trigger_user_id',
        'properties',
        'notes',
    ];

    protected $casts = [
        'entry_timestamp' => 'datetime',
        'exit_timestamp' => 'datetime',
        'duration_hours' => 'decimal:2',
        'properties' => 'array',
    ];

    /**
     * Relationships
     */
    public function pipeline()
    {
        return $this->belongsTo(Pipeline::class);
    }

    public function triggerUser()
    {
        return $this->belongsTo(User::class, 'trigger_user_id');
    }
}
