<?php

namespace App\Models;

use App\Models\Concerns\BranchScoped;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ComplianceChecklist extends Model
{
    use HasFactory, SoftDeletes, BranchScoped;

    /**
     * Frequency options supported by the compliance checklist scheduler.
     */
    public const FREQUENCY_DAILY = 'daily';
    public const FREQUENCY_WEEKLY = 'weekly';
    public const FREQUENCY_MONTHLY = 'monthly';
    public const FREQUENCY_QUARTERLY = 'quarterly';
    public const FREQUENCY_YEARLY = 'yearly';
    public const FREQUENCY_CUSTOM = 'custom';

    public const FREQUENCIES = [
        self::FREQUENCY_DAILY,
        self::FREQUENCY_WEEKLY,
        self::FREQUENCY_MONTHLY,
        self::FREQUENCY_QUARTERLY,
        self::FREQUENCY_YEARLY,
        self::FREQUENCY_CUSTOM,
    ];

    /**
     * Checklist status options.
     */
    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';
    public const STATUS_ARCHIVED = 'archived';

    /**
     * Checklist category suggestions.
     */
    public const CATEGORY_OPTIONS = [
        ['value' => 'safety', 'label' => 'Safety & Facilities'],
        ['value' => 'inventory', 'label' => 'Inventory & Warehouse'],
        ['value' => 'environmental', 'label' => 'Environmental Compliance'],
        ['value' => 'data_protection', 'label' => 'Data Protection'],
        ['value' => 'quality', 'label' => 'Quality Assurance'],
        ['value' => 'custom', 'label' => 'Custom'],
    ];

    /**
     * Mass assignable attributes.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'branch_id',
        'title',
        'code',
        'description',
        'category',
        'status',
        'frequency_type',
        'frequency_interval',
        'custom_frequency_unit',
        'custom_frequency_value',
        'start_date',
        'due_time',
        'next_due_at',
        'last_triggered_at',
        'last_completed_at',
        'is_recurring',
        'assigned_user_id',
        'assigned_role',
        'escalate_to_user_id',
        'escalation_offset_hours',
        'advance_reminder_offsets',
        'metadata',
        'requires_acknowledgement',
        'allow_partial_completion',
        'created_by',
        'updated_by',
    ];

    /**
     * Attribute casting.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'next_due_at' => 'datetime',
        'last_triggered_at' => 'datetime',
        'last_completed_at' => 'datetime',
        'is_recurring' => 'boolean',
        'advance_reminder_offsets' => 'array',
        'metadata' => 'array',
        'requires_acknowledgement' => 'boolean',
        'allow_partial_completion' => 'boolean',
    ];

    /**
     * Relationship: Checklist belongs to a user (assignee).
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    /**
     * Relationship: Checklist escalation target.
     */
    public function escalationUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'escalate_to_user_id');
    }

    /**
     * Relationship: Checklist creator.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship: Checklist updater.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Relationship: Checklist items.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function items(): HasMany
    {
        return $this->hasMany(ComplianceChecklistItem::class)
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    /**
     * Relationship: Checklist triggers.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function triggers(): HasMany
    {
        return $this->hasMany(ComplianceChecklistTrigger::class)
            ->orderBy('trigger_type')
            ->orderBy('offset_hours');
    }

    /**
     * Scope: Only active checklists.
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Calculate the next due date based on the configured frequency.
     */
    public function calculateNextDueAt(?Carbon $reference = null): ?Carbon
    {
        $reference = $reference ?: now();

        if (!$this->start_date) {
            return null;
        }

        $startDate = $this->start_date instanceof Carbon
            ? $this->start_date->format('Y-m-d')
            : (string) $this->start_date;

        $startDateTime = Carbon::parse($startDate . ' ' . ($this->due_time ?? '00:00:00'), $reference->getTimezone());

        if ($startDateTime->greaterThan($reference)) {
            return $startDateTime;
        }

        $interval = max(1, (int) $this->frequency_interval);

        $nextDueAt = clone $startDateTime;

        switch ($this->frequency_type) {
            case self::FREQUENCY_DAILY:
                while ($nextDueAt->lessThanOrEqualTo($reference)) {
                    $nextDueAt->addDays($interval);
                }
                break;
            case self::FREQUENCY_WEEKLY:
                while ($nextDueAt->lessThanOrEqualTo($reference)) {
                    $nextDueAt->addWeeks($interval);
                }
                break;
            case self::FREQUENCY_MONTHLY:
                while ($nextDueAt->lessThanOrEqualTo($reference)) {
                    $nextDueAt->addMonthsNoOverflow($interval);
                }
                break;
            case self::FREQUENCY_QUARTERLY:
                while ($nextDueAt->lessThanOrEqualTo($reference)) {
                    $nextDueAt->addMonthsNoOverflow($interval * 3);
                }
                break;
            case self::FREQUENCY_YEARLY:
                while ($nextDueAt->lessThanOrEqualTo($reference)) {
                    $nextDueAt->addYears($interval);
                }
                break;
            case self::FREQUENCY_CUSTOM:
                $unit = $this->custom_frequency_unit ?: 'days';
                $value = max(1, (int) ($this->custom_frequency_value ?: $interval));

                while ($nextDueAt->lessThanOrEqualTo($reference)) {
                    $nextDueAt = match ($unit) {
                        'hours' => $nextDueAt->addHours($value),
                        'days' => $nextDueAt->addDays($value),
                        'weeks' => $nextDueAt->addWeeks($value),
                        'months' => $nextDueAt->addMonthsNoOverflow($value),
                        'years' => $nextDueAt->addYears($value),
                        default => $nextDueAt->addDays($value),
                    };
                }
                break;
            default:
                return $startDateTime->greaterThan($reference) ? $startDateTime : null;
        }

        return $nextDueAt;
    }
}
