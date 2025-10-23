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
        Schema::create('vehicle_models', function (Blueprint $table) {
            $table->id();
            
            // Basic Information
            $table->string('make')->default('WULING')->comment('Vehicle manufacturer - default WULING');
            $table->string('model')->comment('Model name (e.g., Alvez, Binguo)');
            $table->string('model_code')->unique()->nullable()->comment('Internal model code');
            $table->integer('year')->comment('Model year');
            $table->string('generation')->nullable()->comment('Model generation (e.g., Gen 1, Gen 2)');
            
            // Body & Design
            $table->enum('body_type', ['sedan', 'suv', 'hatchback', 'mpv', 'van', 'pickup', 'coupe', 'wagon'])->nullable();
            $table->integer('doors')->nullable()->comment('Number of doors');
            $table->integer('seating_capacity')->nullable()->comment('Number of seats');
            
            // Engine & Performance
            $table->string('engine_type')->nullable()->comment('Engine type (e.g., 1.5L Turbo, Electric)');
            $table->decimal('engine_displacement', 5, 2)->nullable()->comment('Engine displacement in liters');
            $table->integer('horsepower')->nullable()->comment('Horsepower (HP)');
            $table->integer('torque')->nullable()->comment('Torque (Nm)');
            $table->enum('transmission', ['manual', 'automatic', 'cvt', 'dct', 'amt'])->nullable();
            $table->enum('drivetrain', ['fwd', 'rwd', 'awd', '4wd'])->nullable()->comment('Front/Rear/All-wheel drive');
            
            // Fuel & Efficiency
            $table->enum('fuel_type', ['gasoline', 'diesel', 'electric', 'hybrid', 'plug_in_hybrid'])->default('gasoline');
            $table->decimal('fuel_tank_capacity', 5, 2)->nullable()->comment('Fuel tank capacity in liters');
            $table->decimal('fuel_consumption_city', 5, 2)->nullable()->comment('City fuel consumption (km/L)');
            $table->decimal('fuel_consumption_highway', 5, 2)->nullable()->comment('Highway fuel consumption (km/L)');
            
            // Electric Vehicle Specs (if applicable)
            $table->decimal('battery_capacity_kwh', 6, 2)->nullable()->comment('Battery capacity in kWh');
            $table->integer('electric_range_km')->nullable()->comment('Electric range in kilometers');
            $table->string('charging_type')->nullable()->comment('Charging type (e.g., AC, DC Fast)');
            $table->decimal('charging_time_fast', 5, 2)->nullable()->comment('Fast charging time in hours');
            $table->decimal('charging_time_slow', 5, 2)->nullable()->comment('Slow charging time in hours');
            $table->integer('motor_power_kw')->nullable()->comment('Electric motor power in kW');
            
            // Dimensions
            $table->integer('length_mm')->nullable()->comment('Length in millimeters');
            $table->integer('width_mm')->nullable()->comment('Width in millimeters');
            $table->integer('height_mm')->nullable()->comment('Height in millimeters');
            $table->integer('wheelbase_mm')->nullable()->comment('Wheelbase in millimeters');
            $table->integer('ground_clearance_mm')->nullable()->comment('Ground clearance in millimeters');
            $table->integer('cargo_capacity_liters')->nullable()->comment('Cargo/trunk capacity in liters');
            $table->integer('curb_weight_kg')->nullable()->comment('Curb weight in kilograms');
            $table->integer('gross_weight_kg')->nullable()->comment('Gross vehicle weight in kilograms');
            
            // Pricing
            $table->decimal('base_price', 15, 2)->nullable()->comment('Base/starting price');
            $table->decimal('srp', 15, 2)->nullable()->comment('Suggested retail price');
            $table->string('currency', 3)->default('PHP');
            
            // Features & Equipment (JSON)
            $table->json('standard_features')->nullable()->comment('Standard features included');
            $table->json('optional_features')->nullable()->comment('Available optional features');
            $table->json('safety_features')->nullable()->comment('Safety features');
            $table->json('technology_features')->nullable()->comment('Technology & infotainment features');
            $table->json('available_colors')->nullable()->comment('Available exterior colors');
            $table->json('available_trims')->nullable()->comment('Available trim levels');
            
            // Media
            $table->json('images')->nullable()->comment('Model images URLs');
            $table->text('description')->nullable()->comment('Model description');
            $table->text('specifications_pdf')->nullable()->comment('Link to specifications PDF');
            
            // Status & Metadata
            $table->boolean('is_active')->default(true)->comment('Is model currently available');
            $table->boolean('is_featured')->default(false)->comment('Featured model on website');
            $table->date('launch_date')->nullable()->comment('Model launch date');
            $table->date('discontinuation_date')->nullable()->comment('Model discontinuation date');
            $table->text('notes')->nullable()->comment('Internal notes');
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['make', 'model', 'year']);
            $table->index('model');
            $table->index('year');
            $table->index('body_type');
            $table->index('fuel_type');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_models');
    }
};
