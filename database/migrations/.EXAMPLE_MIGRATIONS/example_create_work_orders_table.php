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
        Schema::create('work_orders', function (Blueprint $table) {
            $table->id();
            
            // Branch relationship (REQUIRED for branch isolation)
            $table->foreignId('branch_id')
                ->constrained('branches')
                ->onDelete('restrict');
            $table->index('branch_id');
            
            // Work order identification
            $table->string('wo_number')->unique();
            $table->enum('type', ['pms', 'repair', 'warranty', 'inspection', 'bodywork']);
            
            // Customer & Vehicle
            $table->foreignId('customer_id')->constrained('customers')->onDelete('restrict');
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->onDelete('set null');
            $table->string('vehicle_info')->nullable(); // VIN, model, etc if vehicle not in system
            
            // Assignment
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('service_advisor_id')->nullable()->constrained('users')->onDelete('set null');
            
            // Scheduling
            $table->dateTime('scheduled_date');
            $table->dateTime('actual_start_date')->nullable();
            $table->dateTime('actual_completion_date')->nullable();
            $table->integer('estimated_hours')->nullable();
            $table->integer('actual_hours')->nullable();
            
            // Status & Priority
            $table->enum('status', [
                'pending',
                'scheduled',
                'in_progress',
                'on_hold',
                'completed',
                'cancelled',
                'approved',
                'invoiced'
            ])->default('pending');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            
            // Service details
            $table->text('customer_complaint')->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('work_performed')->nullable();
            $table->text('recommendations')->nullable();
            
            // Pricing
            $table->decimal('labor_cost', 10, 2)->default(0);
            $table->decimal('parts_cost', 10, 2)->default(0);
            $table->decimal('total_cost', 10, 2)->default(0);
            
            // Mileage tracking
            $table->integer('mileage_in')->nullable();
            $table->integer('mileage_out')->nullable();
            
            // Additional info
            $table->text('internal_notes')->nullable();
            $table->json('attachments')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for common queries
            $table->index('status');
            $table->index('type');
            $table->index('scheduled_date');
            $table->index(['branch_id', 'status']);
            $table->index(['assigned_to', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_orders');
    }
};
