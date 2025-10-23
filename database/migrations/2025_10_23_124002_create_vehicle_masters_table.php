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
        Schema::create('vehicle_masters', function (Blueprint $table) {
            $table->id();
            
            // Core identification
            $table->string('make')->comment('Manufacturer, e.g., Toyota, Honda');
            $table->string('model')->comment('Model name, e.g., Vios, Civic');
            $table->year('year')->comment('Model year');
            $table->string('trim')->nullable()->comment('Trim level, e.g., G, V, RS');
            
            // Vehicle characteristics
            $table->string('body_type')->nullable()->comment('Sedan, SUV, Hatchback, etc.');
            $table->string('transmission')->nullable()->comment('Manual, Automatic, CVT, etc.');
            $table->string('fuel_type')->nullable()->comment('Gasoline, Diesel, Hybrid, Electric');
            $table->string('drivetrain')->nullable()->comment('FWD, RWD, AWD, 4WD');
            $table->integer('seating')->nullable()->comment('Number of seats');
            $table->integer('doors')->nullable()->comment('Number of doors');
            
            // Pricing
            $table->decimal('base_price', 15, 2)->nullable()->comment('Manufacturer suggested retail price');
            $table->string('currency', 3)->default('PHP');
            
            // Flexible specs (JSON)
            $table->json('specs')->nullable()->comment('Validated against attribute_definitions with scope=master or both');
            
            // Metadata
            $table->text('description')->nullable();
            $table->json('images')->nullable()->comment('Array of image URLs');
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            $table->softDeletes();

            // Indexes for common queries
            $table->index(['make', 'model', 'year']);
            $table->index('make');
            $table->index('model');
            $table->index('year');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_masters');
    }
};
