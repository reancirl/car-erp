<?php

namespace App\Models\Concerns;

use App\Models\Branch;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Trait BranchScoped
 * 
 * Provides automatic branch filtering for models based on authenticated user's branch.
 * Use this trait on models that should be isolated by branch.
 * 
 * Usage:
 * - Add 'use BranchScoped;' in your model
 * - Ensure the model has a 'branch_id' column in the database
 * 
 * Features:
 * - Automatic filtering by current user's branch
 * - Admin/auditor roles can see all branches
 * - Manual branch filtering with scopeForBranch()
 * - Relationship to Branch model
 */
trait BranchScoped
{
    /**
     * Boot the branch scoped trait for a model.
     */
    protected static function bootBranchScoped(): void
    {
        // Automatically apply branch scope when creating records
        static::creating(function ($model) {
            if (! $model->branch_id && auth()->check() && auth()->user()->branch_id) {
                $model->branch_id = auth()->user()->branch_id;
            }
        });

        // Apply global scope for branch filtering
        static::addGlobalScope('branch', function (Builder $builder) {
            if (auth()->check() && auth()->user()->branch_id) {
                // Check if user has permission to view all branches
                $user = auth()->user();
                
                // Admin and auditor roles can see all branches
                if (!$user->hasRole(['admin', 'auditor'])) {
                    $builder->where($builder->qualifyColumn('branch_id'), $user->branch_id);
                }
            }
        });
    }

    /**
     * Scope a query to a specific branch.
     */
    public function scopeForBranch(Builder $query, int $branchId): Builder
    {
        return $query->where($query->qualifyColumn('branch_id'), $branchId);
    }

    /**
     * Scope a query to multiple branches.
     */
    public function scopeForBranches(Builder $query, array $branchIds): Builder
    {
        return $query->whereIn($query->qualifyColumn('branch_id'), $branchIds);
    }

    /**
     * Scope to get records without branch scope (admin use).
     */
    public function scopeWithoutBranchScope(Builder $query): Builder
    {
        return $query->withoutGlobalScope('branch');
    }

    /**
     * Get the branch that this record belongs to.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Check if the record belongs to a specific branch.
     */
    public function belongsToBranch(int $branchId): bool
    {
        return $this->branch_id === $branchId;
    }

    /**
     * Check if the record belongs to the current user's branch.
     */
    public function belongsToUserBranch(): bool
    {
        if (!auth()->check() || !auth()->user()->branch_id) {
            return false;
        }

        return $this->branch_id === auth()->user()->branch_id;
    }
}
