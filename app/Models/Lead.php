<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'lead_id',
        'branch_id',
        'name',
        'email',
        'phone',
        'location',
        'ip_address',
        'source',
        'status',
        'priority',
        'vehicle_interest',
        'vehicle_variant',
        'vehicle_model_id',
        'budget_min',
        'budget_max',
        'purchase_timeline',
        'lead_score',
        'fake_lead_score',
        'conversion_probability',
        'assigned_to',
        'last_contact_at',
        'next_followup_at',
        'contact_method',
        'notes',
        'tags',
        'duplicate_flags',
    ];

    protected $casts = [
        'tags' => 'array',
        'duplicate_flags' => 'array',
        'last_contact_at' => 'datetime',
        'next_followup_at' => 'datetime',
        'budget_min' => 'decimal:2',
        'budget_max' => 'decimal:2',
        'lead_score' => 'integer',
        'fake_lead_score' => 'integer',
        'conversion_probability' => 'integer',
    ];

    /**
     * Relationships
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function vehicleModel()
    {
        return $this->belongsTo(VehicleModel::class, 'vehicle_model_id');
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
     * Boot method to auto-generate lead_id and handle auto-progression
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($lead) {
            if (!$lead->lead_id) {
                $lead->lead_id = self::generateLeadId();
            }
        });

        static::updated(function ($lead) {
            // Auto-create pipeline when lead status changes to 'qualified' and lead_score >= 70
            if ($lead->wasChanged('status') && $lead->status === 'qualified' && $lead->lead_score >= 70) {
                $service = app(\App\Services\PipelineAutoProgressionService::class);
                $service->createPipelineFromQualifiedLead($lead);
            }
        });
    }

    /**
     * Generate unique lead ID (LD-YYYY-XXX)
     */
    private static function generateLeadId(): string
    {
        $year = date('Y');
        $lastLead = self::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $number = $lastLead ? intval(substr($lastLead->lead_id, -3)) + 1 : 1;
        return sprintf('LD-%s-%03d', $year, $number);
    }

    /**
     * Get budget range formatted
     */
    public function getBudgetRangeAttribute(): ?string
    {
        if (!$this->budget_min && !$this->budget_max) {
            return null;
        }

        if ($this->budget_min && $this->budget_max) {
            return '$' . number_format($this->budget_min, 0) . ' - $' . number_format($this->budget_max, 0);
        }

        if ($this->budget_min) {
            return '$' . number_format($this->budget_min, 0) . '+';
        }

        return 'Up to $' . number_format($this->budget_max, 0);
    }
}
