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
        Schema::create('compliance_reminder_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('compliance_reminder_id')->constrained('compliance_reminders')->cascadeOnDelete();
            $table->string('event_type', 50);
            $table->string('channel', 25)->nullable();
            $table->string('status', 25)->default('queued');
            $table->text('message')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index(['event_type', 'status'], 'compliance_reminder_events_type_status_idx');
            $table->index('processed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compliance_reminder_events');
    }
};
