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
        Schema::create('service_types', function (Blueprint $table) {
            $table->id();

            // Branch relationship (multi-tenant support)
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');

            // Basic Information
            $table->string('name'); // e.g., "Preventive Maintenance Service (PMS)"
            $table->string('code')->unique(); // e.g., "PMS", "20K", "100K"
            $table->text('description')->nullable();

            // Category & Classification
            $table->enum('category', ['maintenance', 'repair', 'warranty', 'inspection', 'diagnostic']);

            // Service Intervals
            $table->enum('interval_type', ['mileage', 'time', 'on_demand'])->default('on_demand');
            $table->integer('interval_value')->nullable(); // km for mileage, months for time

            // Pricing & Duration
            $table->decimal('estimated_duration', 8, 2)->nullable(); // hours
            $table->decimal('base_price', 10, 2)->default(0); // base service price
            $table->string('currency', 3)->default('PHP');

            // Status & Availability
            $table->enum('status', ['active', 'inactive', 'discontinued'])->default('active');
            $table->boolean('is_available')->default(true);

            // Metadata
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            // Timestamps & Soft Deletes
            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index('branch_id');
            $table->index('category');
            $table->index('status');
            $table->index('interval_type');
            $table->index('created_at');
        });

        // Junction table for many-to-many relationship with common_services
        Schema::create('service_type_common_service', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_type_id')->constrained('service_types')->onDelete('cascade');
            $table->foreignId('common_service_id')->constrained('common_services')->onDelete('cascade');
            $table->integer('sequence')->default(0); // order of services in the type
            $table->timestamps();

            // Prevent duplicate associations
            $table->unique(['service_type_id', 'common_service_id'], 'service_type_common_service_unique');

            // Indexes
            $table->index('service_type_id');
            $table->index('common_service_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_type_common_service');
        Schema::dropIfExists('service_types');
    }
};
