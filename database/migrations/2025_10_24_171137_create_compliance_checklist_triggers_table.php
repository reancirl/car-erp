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
        Schema::create('compliance_checklist_triggers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('compliance_checklist_id')->constrained('compliance_checklists')->cascadeOnDelete();
            $table->string('trigger_type', 25); // advance, due, escalation
            $table->integer('offset_hours')->default(0);
            $table->json('channels')->nullable();
            $table->foreignId('escalate_to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('escalate_to_role', 75)->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['compliance_checklist_id', 'trigger_type'], 'ck_triggers_type_idx');
            $table->index('is_active', 'ck_triggers_active_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compliance_checklist_triggers');
    }
};
