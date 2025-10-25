<?php

namespace App\Models;

use App\Models\Concerns\BranchScoped;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class ComplianceReminder extends Model
{
    use HasFactory, SoftDeletes, BranchScoped;

    public const STATUS_SCHEDULED = 'scheduled';
    public const STATUS_PENDING = 'pending';
    public const STATUS_TRIGGERED = 'triggered';
    public const STATUS_SENT = 'sent';
    public const STATUS_FAILED = 'failed';
    public const STATUS_ESCALATED = 'escalated';
    public const STATUS_CANCELLED = 'cancelled';

    public const STATUSES = [
        self::STATUS_SCHEDULED,
        self::STATUS_PENDING,
        self::STATUS_TRIGGERED,
        self::STATUS_SENT,
        self::STATUS_FAILED,
        self::STATUS_ESCALATED,
        self::STATUS_CANCELLED,
    ];

    public const PRIORITY_LOW = 'low';
    public const PRIORITY_MEDIUM = 'medium';
    public const PRIORITY_HIGH = 'high';
    public const PRIORITY_CRITICAL = 'critical';

    public const PRIORITIES = [
        self::PRIORITY_LOW,
        self::PRIORITY_MEDIUM,
        self::PRIORITY_HIGH,
        self::PRIORITY_CRITICAL,
    ];

    public const TYPE_MANUAL = 'manual';
    public const TYPE_CHECKLIST_DUE = 'checklist_due';
    public const TYPE_CHECKLIST_OVERDUE = 'checklist_overdue';
    public const TYPE_FOLLOW_UP = 'follow_up';
    public const TYPE_ESCALATION = 'escalation';

    public const TYPES = [
        self::TYPE_MANUAL,
        self::TYPE_CHECKLIST_DUE,
        self::TYPE_CHECKLIST_OVERDUE,
        self::TYPE_FOLLOW_UP,
        self::TYPE_ESCALATION,
    ];

    public const CHANNEL_EMAIL = 'email';
    public const CHANNEL_SMS = 'sms';
    public const CHANNEL_PUSH = 'push';
    public const CHANNEL_IN_APP = 'in_app';

    public const CHANNELS = [
        self::CHANNEL_EMAIL,
        self::CHANNEL_SMS,
        self::CHANNEL_PUSH,
        self::CHANNEL_IN_APP,
    ];

    protected $fillable = [
        'branch_id',
        'compliance_checklist_id',
        'compliance_checklist_assignment_id',
        'assigned_user_id',
        'assigned_role',
        'title',
        'description',
        'reminder_type',
        'priority',
        'delivery_channel',
        'delivery_channels',
        'remind_at',
        'due_at',
        'escalate_at',
        'status',
        'auto_escalate',
        'escalate_to_user_id',
        'escalate_to_role',
        'last_triggered_at',
        'last_sent_at',
        'last_escalated_at',
        'sent_count',
        'metadata',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'delivery_channels' => 'array',
        'remind_at' => 'datetime',
        'due_at' => 'datetime',
        'escalate_at' => 'datetime',
        'last_triggered_at' => 'datetime',
        'last_sent_at' => 'datetime',
        'last_escalated_at' => 'datetime',
        'auto_escalate' => 'boolean',
        'metadata' => 'array',
    ];

    public function checklist(): BelongsTo
    {
        return $this->belongsTo(ComplianceChecklist::class, 'compliance_checklist_id');
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(ComplianceChecklistAssignment::class, 'compliance_checklist_assignment_id');
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function escalateToUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'escalate_to_user_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(ComplianceReminderEvent::class)->latest();
    }

    public function isDue(?Carbon $reference = null): bool
    {
        $reference ??= now();

        if (!$this->remind_at) {
            return false;
        }

        return $this->remind_at->lessThanOrEqualTo($reference)
            && !in_array($this->status, [self::STATUS_SENT, self::STATUS_CANCELLED], true);
    }

    public function scopeDue($query)
    {
        return $query->whereIn('status', [self::STATUS_SCHEDULED, self::STATUS_PENDING])
            ->whereNotNull('remind_at')
            ->where('remind_at', '<=', now());
    }
}
