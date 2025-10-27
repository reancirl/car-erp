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
        Schema::create('warranty_claims', function (Blueprint $table) {
            $table->id();
            $table->string('claim_id')->unique(); // Auto-generated WC-2025-001
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');

            // Customer & Vehicle Information
            $table->foreignId('customer_id')->nullable()->constrained('customers')->onDelete('set null');
            $table->foreignId('vehicle_unit_id')->nullable()->constrained('vehicle_units')->onDelete('set null');

            // Claim Details
            $table->enum('claim_type', ['parts', 'labor', 'both'])->default('both');
            $table->date('claim_date');
            $table->date('incident_date')->nullable();
            $table->string('failure_description', 1000);
            $table->text('diagnosis')->nullable();
            $table->text('repair_actions')->nullable();

            // Current Odometer at time of claim
            $table->integer('odometer_reading')->nullable();

            // Warranty Information
            $table->string('warranty_type')->nullable(); // manufacturer, extended, dealer
            $table->string('warranty_provider')->nullable();
            $table->string('warranty_number')->nullable();
            $table->date('warranty_start_date')->nullable();
            $table->date('warranty_end_date')->nullable();

            // Claim Status
            $table->enum('status', [
                'draft',
                'submitted',
                'under_review',
                'approved',
                'partially_approved',
                'rejected',
                'paid',
                'closed'
            ])->default('draft');

            // Financial Information
            $table->decimal('parts_claimed_amount', 10, 2)->default(0);
            $table->decimal('labor_claimed_amount', 10, 2)->default(0);
            $table->decimal('total_claimed_amount', 10, 2)->default(0);
            $table->decimal('approved_amount', 10, 2)->nullable();
            $table->string('currency', 3)->default('PHP');

            // Decision Information
            $table->date('submission_date')->nullable();
            $table->date('decision_date')->nullable();
            $table->string('decision_by')->nullable(); // Reviewer name from warranty provider
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();

            // Tracking
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');

            $table->softDeletes();
            $table->timestamps();

            // Indexes
            $table->index('branch_id');
            $table->index('customer_id');
            $table->index('vehicle_unit_id');
            $table->index('status');
            $table->index('claim_date');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warranty_claims');
    }
};
