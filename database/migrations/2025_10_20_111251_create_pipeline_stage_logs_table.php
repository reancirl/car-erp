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
        Schema::create('pipeline_stage_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pipeline_id')->constrained('pipelines')->onDelete('cascade');
            
            // Stage Information
            $table->enum('stage', [
                'lead',
                'qualified',
                'quote_sent',
                'test_drive_scheduled',
                'test_drive_completed',
                'reservation_made',
                'lost',
                'won'
            ]);
            $table->enum('previous_stage', [
                'lead',
                'qualified',
                'quote_sent',
                'test_drive_scheduled',
                'test_drive_completed',
                'reservation_made',
                'lost',
                'won'
            ])->nullable();
            
            // Timing Information
            $table->timestamp('entry_timestamp');
            $table->timestamp('exit_timestamp')->nullable();
            $table->decimal('duration_hours', 8, 2)->nullable();
            
            // Trigger Information
            $table->enum('trigger_type', ['auto', 'manual'])->default('manual');
            $table->string('trigger_system')->nullable(); // e.g., "Lead Management", "Quote System"
            $table->string('trigger_event')->nullable(); // e.g., "Lead Qualified", "Quote Generated"
            $table->foreignId('trigger_user_id')->nullable()->constrained('users')->onDelete('set null');
            
            // Additional Context
            $table->json('properties')->nullable(); // Additional metadata
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('pipeline_id');
            $table->index('stage');
            $table->index('entry_timestamp');
            $table->index('trigger_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pipeline_stage_logs');
    }
};
