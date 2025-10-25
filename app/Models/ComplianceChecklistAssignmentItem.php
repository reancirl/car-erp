<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplianceChecklistAssignmentItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_id',
        'checklist_item_id',
        'is_completed',
        'completed_at',
        'notes',
        'completed_by',
        'metadata',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(ComplianceChecklistAssignment::class, 'assignment_id');
    }

    public function checklistItem(): BelongsTo
    {
        return $this->belongsTo(ComplianceChecklistItem::class, 'checklist_item_id');
    }

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }
}
