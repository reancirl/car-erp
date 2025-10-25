<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('compliance_checklist_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('compliance_checklist_id')->constrained('compliance_checklists')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status', 25)->default('pending'); // pending, in_progress, completed, on_hold
            $table->unsignedTinyInteger('progress_percentage')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('last_interaction_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['compliance_checklist_id', 'user_id'], 'ck_assignments_user_unique');
            $table->index(['status', 'progress_percentage'], 'ck_assignments_status_progress_idx');
            $table->index('last_interaction_at', 'ck_assignments_last_interaction_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compliance_checklist_assignments');
    }
};
