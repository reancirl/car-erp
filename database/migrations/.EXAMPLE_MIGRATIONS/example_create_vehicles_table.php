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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            
            // Branch relationship (REQUIRED for branch isolation)
            $table->foreignId('branch_id')
                ->constrained('branches')
                ->onDelete('restrict');
            $table->index('branch_id');
            
            // Vehicle identification
            $table->string('vin', 17)->unique();
            $table->string('stock_number')->unique();
            $table->enum('type', ['new', 'used', 'demo']);
            
            // Vehicle details
            $table->string('make');
            $table->string('model');
            $table->string('variant')->nullable();
            $table->year('year');
            $table->string('color_exterior');
            $table->string('color_interior')->nullable();
            $table->string('transmission');
            $table->string('fuel_type');
            $table->integer('mileage')->default(0);
            $table->string('engine_number')->nullable();
            
            // Pricing
            $table->decimal('cost_price', 12, 2);
            $table->decimal('selling_price', 12, 2);
            $table->decimal('floor_price', 12, 2)->nullable();
            
            // Status tracking
            $table->enum('status', [
                'in_transit',
                'available',
                'reserved',
                'sold',
                'service',
                'damaged',
                'traded_in'
            ])->default('in_transit');
            
            // Dates
            $table->date('acquisition_date');
            $table->date('available_date')->nullable();
            $table->date('sale_date')->nullable();
            
            // Additional info
            $table->text('features')->nullable();
            $table->text('description')->nullable();
            $table->json('photos')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for common queries
            $table->index('status');
            $table->index('type');
            $table->index(['branch_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
