<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class WarrantyClaim extends Model
{
    use HasFactory, SoftDeletes;

    // 1. Fillable fields
    protected $fillable = [
        'claim_id',
        'branch_id',
        'customer_id',
        'vehicle_unit_id',
        'claim_type',
        'claim_date',
        'incident_date',
        'failure_description',
        'diagnosis',
        'repair_actions',
        'odometer_reading',
        'warranty_type',
        'warranty_provider',
        'warranty_number',
        'warranty_start_date',
        'warranty_end_date',
        'status',
        'parts_claimed_amount',
        'labor_claimed_amount',
        'total_claimed_amount',
        'approved_amount',
        'currency',
        'submission_date',
        'decision_date',
        'decision_by',
        'rejection_reason',
        'notes',
        'assigned_to',
        'created_by',
        'updated_by',
    ];

    // 2. Casts for type safety
    protected $casts = [
        'claim_date' => 'date',
        'incident_date' => 'date',
        'warranty_start_date' => 'date',
        'warranty_end_date' => 'date',
        'submission_date' => 'date',
        'decision_date' => 'date',
        'parts_claimed_amount' => 'decimal:2',
        'labor_claimed_amount' => 'decimal:2',
        'total_claimed_amount' => 'decimal:2',
        'approved_amount' => 'decimal:2',
        'odometer_reading' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // 3. Relationships
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function vehicleUnit(): BelongsTo
    {
        return $this->belongsTo(VehicleUnit::class);
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function parts(): HasMany
    {
        return $this->hasMany(WarrantyClaimPart::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(WarrantyClaimService::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(WarrantyClaimPhoto::class);
    }

    // 4. Query Scopes
    public function scopeForBranch($query, $branchId)
    {
        return $query->where('branch_id', $branchId);
    }

    public function scopeForUserBranch($query, User $user)
    {
        return $query->where('branch_id', $user->branch_id);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['draft', 'submitted', 'under_review']);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    // 5. Boot method for auto-generation
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($claim) {
            if (!$claim->claim_id) {
                $claim->claim_id = self::generateClaimId();
            }

            // Auto-calculate total claimed amount
            $claim->total_claimed_amount = $claim->parts_claimed_amount + $claim->labor_claimed_amount;
        });

        static::updating(function ($claim) {
            // Recalculate total if parts or labor amount changes
            if ($claim->isDirty(['parts_claimed_amount', 'labor_claimed_amount'])) {
                $claim->total_claimed_amount = $claim->parts_claimed_amount + $claim->labor_claimed_amount;
            }
        });
    }

    // 6. Helper methods
    private static function generateClaimId(): string
    {
        $year = date('Y');
        $lastClaim = self::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $number = $lastClaim ? intval(substr($lastClaim->claim_id, -3)) + 1 : 1;
        return sprintf('WC-%s-%03d', $year, $number);
    }

    public function calculateTotalParts(): float
    {
        return $this->parts()->sum('total_price');
    }

    public function calculateTotalLabor(): float
    {
        return $this->services()->sum('total_labor_cost');
    }

    public function recalculateAmounts(): void
    {
        $this->parts_claimed_amount = $this->calculateTotalParts();
        $this->labor_claimed_amount = $this->calculateTotalLabor();
        $this->total_claimed_amount = $this->parts_claimed_amount + $this->labor_claimed_amount;
        $this->save();
    }

    // 7. Accessors for formatted data
    public function getFormattedTotalClaimedAttribute(): string
    {
        return '₱' . number_format($this->total_claimed_amount, 2);
    }

    public function getFormattedPartsClaimedAttribute(): string
    {
        return '₱' . number_format($this->parts_claimed_amount, 2);
    }

    public function getFormattedLaborClaimedAttribute(): string
    {
        return '₱' . number_format($this->labor_claimed_amount, 2);
    }

    public function getFormattedApprovedAmountAttribute(): ?string
    {
        return $this->approved_amount ? '₱' . number_format($this->approved_amount, 2) : null;
    }

    public function getStatusBadgeAttribute(): array
    {
        $badges = [
            'draft' => ['text' => 'Draft', 'color' => 'gray'],
            'submitted' => ['text' => 'Submitted', 'color' => 'blue'],
            'under_review' => ['text' => 'Under Review', 'color' => 'yellow'],
            'approved' => ['text' => 'Approved', 'color' => 'green'],
            'partially_approved' => ['text' => 'Partially Approved', 'color' => 'orange'],
            'rejected' => ['text' => 'Rejected', 'color' => 'red'],
            'paid' => ['text' => 'Paid', 'color' => 'purple'],
            'closed' => ['text' => 'Closed', 'color' => 'gray'],
        ];

        return $badges[$this->status] ?? ['text' => 'Unknown', 'color' => 'gray'];
    }

    public function getClaimTypeBadgeAttribute(): array
    {
        $badges = [
            'parts' => ['text' => 'Parts Only', 'color' => 'blue'],
            'labor' => ['text' => 'Labor Only', 'color' => 'green'],
            'both' => ['text' => 'Parts & Labor', 'color' => 'purple'],
        ];

        return $badges[$this->claim_type] ?? ['text' => 'Unknown', 'color' => 'gray'];
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isSubmitted(): bool
    {
        return in_array($this->status, ['submitted', 'under_review']);
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function isClosed(): bool
    {
        return $this->status === 'closed';
    }

    public function canEdit(): bool
    {
        return in_array($this->status, ['draft', 'submitted']);
    }

    public function canDelete(): bool
    {
        return $this->status === 'draft';
    }
}
