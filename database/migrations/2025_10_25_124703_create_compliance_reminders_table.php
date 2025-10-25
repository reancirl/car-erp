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
        Schema::create('compliance_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('compliance_checklist_id')->nullable()->constrained('compliance_checklists')->nullOnDelete();
            $table->foreignId('compliance_checklist_assignment_id')->nullable()->constrained('compliance_checklist_assignments')->nullOnDelete();
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('assigned_role', 75)->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('reminder_type', 50)->default('manual');
            $table->string('priority', 25)->default('medium');
            $table->string('delivery_channel', 25)->default('email');
            $table->json('delivery_channels')->nullable();
            $table->timestamp('remind_at')->nullable();
            $table->timestamp('due_at')->nullable();
            $table->timestamp('escalate_at')->nullable();
            $table->string('status', 25)->default('scheduled');
            $table->boolean('auto_escalate')->default(false);
            $table->foreignId('escalate_to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('escalate_to_role', 75)->nullable();
            $table->timestamp('last_triggered_at')->nullable();
            $table->timestamp('last_sent_at')->nullable();
            $table->timestamp('last_escalated_at')->nullable();
            $table->unsignedInteger('sent_count')->default(0);
            $table->json('metadata')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'remind_at'], 'compliance_reminders_status_remind_at_idx');
            $table->index(['assigned_user_id', 'status'], 'compliance_reminders_assigned_status_idx');
            $table->index('reminder_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compliance_reminders');
    }
};
