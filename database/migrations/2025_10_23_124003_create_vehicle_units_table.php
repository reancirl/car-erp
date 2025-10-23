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
        Schema::create('vehicle_units', function (Blueprint $table) {
            $table->id();
            
            // Foreign keys
            $table->foreignId('vehicle_master_id')->constrained()->onDelete('restrict');
            $table->foreignId('branch_id')->constrained()->onDelete('restrict');
            
            // Unique identifiers
            $table->string('vin')->unique()->comment('Vehicle Identification Number');
            $table->string('stock_number')->unique()->comment('Internal stock/inventory number');
            
            // Status and lifecycle
            $table->enum('status', [
                'in_stock',
                'reserved',
                'sold',
                'in_transit',
                'transferred',
                'disposed'
            ])->default('in_stock');
            
            // Pricing
            $table->decimal('purchase_price', 15, 2)->nullable()->comment('Dealer acquisition cost');
            $table->decimal('sale_price', 15, 2)->nullable()->comment('Actual selling price');
            $table->string('currency', 3)->default('PHP');
            
            // Dates
            $table->date('acquisition_date')->nullable()->comment('Date unit was acquired by dealer');
            $table->date('sold_date')->nullable()->comment('Date unit was sold');
            
            // Flexible specs (JSON) - unit-specific attributes
            $table->json('specs')->nullable()->comment('Validated against attribute_definitions with scope=unit or both');
            
            // Additional metadata
            $table->text('notes')->nullable();
            $table->json('images')->nullable()->comment('Array of image URLs specific to this unit');
            $table->string('color_exterior')->nullable();
            $table->string('color_interior')->nullable();
            $table->integer('odometer')->nullable()->comment('Current odometer reading in km');
            
            $table->timestamps();
            $table->softDeletes();

            // Indexes for common queries
            $table->index(['branch_id', 'status']);
            $table->index('branch_id');
            $table->index('status');
            $table->index('vin');
            $table->index('stock_number');
            $table->index('vehicle_master_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_units');
    }
};
