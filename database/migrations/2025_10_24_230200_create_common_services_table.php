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
        Schema::create('common_services', function (Blueprint $table) {
            $table->id();

            // Branch relationship (multi-tenant support)
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');

            // Basic Information
            $table->string('name'); // e.g., "Oil Change", "Brake Inspection"
            $table->string('code')->unique(); // e.g., "OIL", "BRAKE"
            $table->text('description')->nullable();

            // Category
            $table->string('category')->index(); // oil_change, filter, brake, engine, etc.

            // Pricing & Duration
            $table->decimal('estimated_duration', 8, 2)->default(0); // hours
            $table->decimal('standard_price', 10, 2)->default(0);
            $table->string('currency', 3)->default('PHP');

            // Status
            $table->boolean('is_active')->default(true);

            // Metadata
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            // Timestamps & Soft Deletes
            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index('branch_id');
            $table->index('is_active');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('common_services');
    }
};
