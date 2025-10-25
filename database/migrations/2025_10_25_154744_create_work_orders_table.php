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

            // Branch relationship for multi-tenant scoping
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');

            // Service relationship
            $table->foreignId('service_type_id')->nullable()->constrained('service_types')->nullOnDelete();

            // Identifiers
            $table->string('work_order_number')->unique();
            $table->string('reference_number')->nullable();

            // Vehicle details snapshot
            $table->string('vehicle_plate_number')->nullable();
            $table->string('vehicle_vin')->nullable();
            $table->string('vehicle_make')->nullable();
            $table->string('vehicle_model')->nullable();
            $table->integer('vehicle_year')->nullable();
            $table->integer('current_mileage')->nullable();
            $table->integer('last_service_mileage')->nullable();

            // Customer details snapshot
            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();
            $table->string('customer_email')->nullable();
            $table->enum('customer_type', ['individual', 'corporate'])->nullable();

            // Scheduling & status
            $table->enum('status', [
                'draft',
                'pending',
                'scheduled',
                'confirmed',
                'in_progress',
                'completed',
                'cancelled',
                'overdue',
            ])->default('pending');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->timestamp('scheduled_at')->nullable();
            $table->date('due_date')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            // Assignment
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->string('assigned_technician_name')->nullable();

            // Estimates & actuals
            $table->decimal('estimated_hours', 6, 2)->default(0);
            $table->decimal('actual_hours', 6, 2)->nullable();
            $table->decimal('estimated_cost', 12, 2)->default(0);
            $table->decimal('actual_cost', 12, 2)->nullable();
            $table->unsignedTinyInteger('completion_percentage')->default(0);

            // Flags & metadata
            $table->boolean('is_warranty_claim')->default(false);
            $table->boolean('photos_uploaded')->default(false);
            $table->boolean('checklist_completed')->default(false);
            $table->json('selected_services')->nullable();
            $table->text('customer_concerns')->nullable();
            $table->text('diagnostic_findings')->nullable();
            $table->text('notes')->nullable();

            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('branch_id');
            $table->index('service_type_id');
            $table->index('status');
            $table->index('priority');
            $table->index('scheduled_at');
            $table->index('due_date');
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
