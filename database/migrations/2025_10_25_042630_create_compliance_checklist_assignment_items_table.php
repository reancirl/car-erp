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
        Schema::create('compliance_checklist_assignment_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('compliance_checklist_assignments')->cascadeOnDelete();
            $table->foreignId('checklist_item_id')->constrained('compliance_checklist_items')->cascadeOnDelete();
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('completed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['assignment_id', 'checklist_item_id'], 'ck_assignment_items_unique');
            $table->index('is_completed', 'ck_assignment_items_completed_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compliance_checklist_assignment_items');
    }
};
