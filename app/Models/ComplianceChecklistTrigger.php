<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ComplianceChecklistTrigger extends Model
{
    use HasFactory, SoftDeletes;

    public const TYPE_ADVANCE = 'advance';
    public const TYPE_DUE = 'due';
    public const TYPE_ESCALATION = 'escalation';

    /**
     * Mass assignable attributes.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'compliance_checklist_id',
        'trigger_type',
        'offset_hours',
        'channels',
        'escalate_to_user_id',
        'escalate_to_role',
        'is_active',
        'metadata',
    ];

    /**
     * Attribute casting.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'offset_hours' => 'integer',
        'channels' => 'array',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Relationship: Trigger belongs to a checklist.
     */
    public function checklist(): BelongsTo
    {
        return $this->belongsTo(ComplianceChecklist::class, 'compliance_checklist_id');
    }

    /**
     * Relationship: Trigger escalation target.
     */
    public function escalationUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'escalate_to_user_id');
    }
}
