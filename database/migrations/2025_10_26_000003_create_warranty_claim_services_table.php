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
        Schema::create('warranty_claim_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warranty_claim_id')->constrained('warranty_claims')->onDelete('cascade');
            $table->foreignId('service_type_id')->nullable()->constrained('service_types')->onDelete('set null');

            // Service Details
            $table->string('service_code')->nullable();
            $table->string('service_name');
            $table->text('description')->nullable();
            $table->decimal('labor_hours', 5, 2);
            $table->decimal('labor_rate', 10, 2);
            $table->decimal('total_labor_cost', 10, 2);

            // Claim Specific
            $table->enum('claim_status', ['pending', 'approved', 'rejected', 'partial'])->default('pending');
            $table->decimal('approved_hours', 5, 2)->nullable();
            $table->decimal('approved_amount', 10, 2)->nullable();
            $table->text('rejection_reason')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('warranty_claim_id');
            $table->index('service_type_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warranty_claim_services');
    }
};
