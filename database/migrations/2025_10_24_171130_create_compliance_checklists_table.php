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
        Schema::create('compliance_checklists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('code', 50)->nullable()->unique();
            $table->text('description')->nullable();
            $table->string('category', 75)->nullable();
            $table->string('status', 25)->default('active');
            $table->string('frequency_type', 25);
            $table->unsignedInteger('frequency_interval')->default(1);
            $table->string('custom_frequency_unit', 25)->nullable();
            $table->unsignedInteger('custom_frequency_value')->nullable();
            $table->date('start_date')->nullable();
            $table->time('due_time')->nullable();
            $table->timestamp('next_due_at')->nullable();
            $table->timestamp('last_triggered_at')->nullable();
            $table->timestamp('last_completed_at')->nullable();
            $table->boolean('is_recurring')->default(true);
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('assigned_role', 75)->nullable();
            $table->foreignId('escalate_to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('escalation_offset_hours')->nullable();
            $table->json('advance_reminder_offsets')->nullable();
            $table->json('metadata')->nullable();
            $table->boolean('requires_acknowledgement')->default(false);
            $table->boolean('allow_partial_completion')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['branch_id', 'status']);
            $table->index('frequency_type');
            $table->index('next_due_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compliance_checklists');
    }
};
