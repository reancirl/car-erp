<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplianceReminderEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'compliance_reminder_id',
        'event_type',
        'channel',
        'status',
        'message',
        'metadata',
        'processed_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'processed_at' => 'datetime',
    ];

    public function reminder(): BelongsTo
    {
        return $this->belongsTo(ComplianceReminder::class, 'compliance_reminder_id');
    }
}
