<?php

namespace App\Models;

use App\Models\Concerns\BranchScoped;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class VehicleReservation extends Model
{
    use HasFactory, SoftDeletes, BranchScoped;

    protected $fillable = [
        'reservation_ref',
        'branch_id',
        'vehicle_unit_id',
        'customer_id',
        'handled_by_branch_id',
        'reservation_date',
        'payment_type',
        'target_release_date',
        'status',
        'remarks',
        'created_by',
    ];

    protected $casts = [
        'reservation_date' => 'date',
        'target_release_date' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($reservation) {
            if (! $reservation->reservation_ref) {
                $reservation->reservation_ref = self::generateReservationRef();
            }

            if (! $reservation->created_by && auth()->check()) {
                $reservation->created_by = auth()->id();
            }
        });
    }

    public static function generateReservationRef(): string
    {
        $year = now()->year;

        $latest = self::withTrashed()
            ->where('reservation_ref', 'like', "RS-{$year}-%")
            ->orderBy('id', 'desc')
            ->first();

        $next = $latest ? (int) substr($latest->reservation_ref, -4) + 1 : 1;
        $sequence = str_pad($next, 4, '0', STR_PAD_LEFT);

        return "RS-{$year}-{$sequence}";
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function handledByBranch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'handled_by_branch_id');
    }

    public function vehicleUnit(): BelongsTo
    {
        return $this->belongsTo(VehicleUnit::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
