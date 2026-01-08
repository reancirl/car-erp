<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Append computed name fields for API/Inertia responses.
     */
    protected $appends = [
        'full_name',
        'display_name',
    ];

    // 1. Fillable fields
    protected $fillable = [
        'customer_id',
        'branch_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'alternate_phone',
        'date_of_birth',
        'gender',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'customer_type',
        'customer_segment',
        'company_name',
        'tax_id',
        'government_id_type',
        'government_id_number',
        'authorized_signatory',
        'authorized_position',
        'status',
        'loyalty_points',
        'customer_lifetime_value',
        'satisfaction_rating',
        'total_purchases',
        'total_spent',
        'first_purchase_date',
        'last_purchase_date',
        'email_notifications',
        'sms_notifications',
        'marketing_consent',
        'assigned_to',
        'notes',
        'interest_notes',
        'tags',
        'preferences',
        'referred_by',
        'referral_source',
        'lead_source',
        'preferred_vehicle_model_id',
        'reservation_amount',
        'reservation_date',
        'reservation_status',
        'reservation_reference',
        'reservation_unit_id',
    ];

    // 2. Casts for type safety
    protected $casts = [
        'tags' => 'array',
        'preferences' => 'array',
        'date_of_birth' => 'date',
        'first_purchase_date' => 'date',
        'last_purchase_date' => 'date',
        'total_spent' => 'decimal:2',
        'loyalty_points' => 'integer',
        'customer_lifetime_value' => 'integer',
        'total_purchases' => 'integer',
        'email_notifications' => 'boolean',
        'sms_notifications' => 'boolean',
        'marketing_consent' => 'boolean',
        'reservation_amount' => 'decimal:2',
        'reservation_date' => 'date',
    ];

    // 3. Relationships
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function referredByCustomer()
    {
        return $this->belongsTo(Customer::class, 'referred_by');
    }

    public function referrals()
    {
        return $this->hasMany(Customer::class, 'referred_by');
    }

    public function surveys()
    {
        return $this->hasMany(CustomerSurvey::class);
    }

    public function reservationUnit()
    {
        return $this->belongsTo(VehicleUnit::class, 'reservation_unit_id');
    }

    public function preferredVehicleModel()
    {
        return $this->belongsTo(VehicleModel::class, 'preferred_vehicle_model_id');
    }

    public function ownedVehicles()
    {
        return $this->hasMany(VehicleUnit::class, 'owner_id');
    }

    // 4. Query Scopes for branch filtering
    public function scopeForBranch($query, $branchId)
    {
        return $query->where('branch_id', $branchId);
    }

    public function scopeForUserBranch($query, User $user)
    {
        return $query->where('branch_id', $user->branch_id);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeVip($query)
    {
        return $query->where('status', 'vip');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('customer_type', $type);
    }

    // 5. Boot method for auto-generation and observers
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($customer) {
            if (!$customer->customer_id) {
                $customer->customer_id = self::generateCustomerId();
            }
        });
    }

    // 6. Helper methods
    private static function generateCustomerId(): string
    {
        $year = date('Y');
        $lastCustomer = self::withTrashed()
            ->whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $number = $lastCustomer ? intval(substr($lastCustomer->customer_id, -3)) + 1 : 1;
        return sprintf('CUS-%s-%03d', $year, $number);
    }

    // 7. Accessors for formatted data
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getDisplayNameAttribute(): string
    {
        if ($this->customer_type === 'corporate' && $this->company_name) {
            return "{$this->company_name} ({$this->full_name})";
        }
        return $this->full_name;
    }

    public function getFormattedTotalSpentAttribute(): string
    {
        return '₱' . number_format($this->total_spent, 2);
    }

    public function getAgeAttribute(): ?int
    {
        return $this->date_of_birth ? $this->date_of_birth->age : null;
    }

    public function getCustomerSinceAttribute(): ?string
    {
        return $this->created_at ? $this->created_at->format('M Y') : null;
    }

    public function isVip(): bool
    {
        return $this->status === 'vip';
    }

    public function isActive(): bool
    {
        return $this->status === 'active' || $this->status === 'vip';
    }

    public function isBlacklisted(): bool
    {
        return $this->status === 'blacklisted';
    }

    /**
     * Generate a new survey for this customer
     */
    public function generateSurvey(string $surveyType = 'general', ?string $triggerEvent = null, ?int $createdBy = null): CustomerSurvey
    {
        return CustomerSurvey::create([
            'customer_id' => $this->id,
            'branch_id' => $this->branch_id,
            'survey_type' => $surveyType,
            'trigger_event' => $triggerEvent,
            'created_by' => $createdBy,
        ]);
    }

    /**
     * Get the latest completed survey
     */
    public function getLatestSurveyAttribute(): ?CustomerSurvey
    {
        return $this->surveys()->completed()->latest()->first();
    }

    /**
     * Get pending surveys count
     */
    public function getPendingSurveysCountAttribute(): int
    {
        return $this->surveys()->pending()->notExpired()->count();
    }
}
