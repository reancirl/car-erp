<?php

namespace App\Models;

use App\Models\Concerns\BranchScoped;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkOrder extends Model
{
    use HasFactory;
    use SoftDeletes;
    use BranchScoped;

    /**
     * The attributes that are mass assignable.
     *
     * Guarded is empty to allow feature teams to evolve the payload
     * while the work order module is still being built out.
     */
    protected $guarded = [];

    /**
     * Attribute casting for consistent data handling.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'scheduled_at' => 'datetime',
        'due_date' => 'date',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'estimated_hours' => 'decimal:2',
        'actual_hours' => 'decimal:2',
        'estimated_cost' => 'decimal:2',
        'actual_cost' => 'decimal:2',
        'completion_percentage' => 'integer',
        'is_warranty_claim' => 'boolean',
        'photos_uploaded' => 'boolean',
        'checklist_completed' => 'boolean',
        'selected_services' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Automatically hydrate generated fields and audit information.
     */
    protected static function booted(): void
    {
        static::creating(function (WorkOrder $workOrder) {
            if (! $workOrder->work_order_number) {
                $workOrder->work_order_number = static::generateWorkOrderNumber();
            }

            if (auth()->check()) {
                $workOrder->created_by ??= auth()->id();
                $workOrder->updated_by ??= auth()->id();
            }
        });

        static::updating(function (WorkOrder $workOrder) {
            if (auth()->check()) {
                $workOrder->updated_by = auth()->id();
            }
        });
    }

    /**
     * Generate a unique work order number with daily sequence.
     */
    private static function generateWorkOrderNumber(): string
    {
        $datePrefix = now()->format('Ymd');
        $countForToday = static::withTrashed()
            ->whereDate('created_at', now()->toDateString())
            ->count() + 1;

        return sprintf('WO-%s-%04d', $datePrefix, $countForToday);
    }

    /**
     * Relationship: Work order belongs to a branch.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * A work order belongs to a service type.
     */
    public function serviceType(): BelongsTo
    {
        return $this->belongsTo(ServiceType::class);
    }

    /**
     * Relationship: Work order is assigned to a user.
     */
    public function assignedTechnician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Relationship: Work order creator.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship: Work order updater.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
