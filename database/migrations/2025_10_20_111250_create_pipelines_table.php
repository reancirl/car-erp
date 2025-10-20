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
        Schema::create('pipelines', function (Blueprint $table) {
            $table->id();
            $table->string('pipeline_id')->unique(); // PL-2025-001
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('lead_id')->nullable()->constrained('leads')->onDelete('set null');
            
            // Customer Information
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email')->nullable();
            
            // Sales Assignment
            $table->foreignId('sales_rep_id')->nullable()->constrained('users')->onDelete('set null');
            
            // Vehicle & Quote Information
            $table->string('vehicle_interest')->nullable();
            $table->string('vehicle_year')->nullable();
            $table->string('vehicle_make')->nullable();
            $table->string('vehicle_model')->nullable();
            $table->decimal('quote_amount', 10, 2)->nullable();
            
            // Pipeline Stage & Status
            $table->enum('current_stage', [
                'lead',
                'qualified',
                'quote_sent',
                'test_drive_scheduled',
                'test_drive_completed',
                'reservation_made',
                'lost',
                'won'
            ])->default('lead');
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
            $table->timestamp('stage_entry_timestamp')->nullable();
            $table->decimal('stage_duration_hours', 8, 2)->nullable();
            
            // Probability & Priority
            $table->integer('probability')->default(50); // 0-100
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            
            // Lead Score
            $table->integer('lead_score')->default(0);
            
            // Next Actions
            $table->string('next_action')->nullable();
            $table->timestamp('next_action_due')->nullable();
            
            // Automation Settings
            $table->boolean('auto_progression_enabled')->default(true);
            $table->boolean('auto_loss_rule_enabled')->default(true);
            $table->enum('follow_up_frequency', ['daily', 'weekly', 'biweekly', 'monthly'])->default('weekly');
            
            // Additional Information
            $table->text('notes')->nullable();
            $table->json('tags')->nullable();
            
            // Metadata
            $table->integer('auto_logged_events_count')->default(0);
            $table->integer('manual_notes_count')->default(0);
            $table->integer('attachments_count')->default(0);
            $table->timestamp('last_activity_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('branch_id');
            $table->index('lead_id');
            $table->index('sales_rep_id');
            $table->index('current_stage');
            $table->index('priority');
            $table->index('created_at');
            $table->index('last_activity_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pipelines');
    }
};
