<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Odometer readings history for fraud detection.
     * Tracks vehicle mileage with VIN cross-checking and anomaly detection.
     */
    public function up(): void
    {
        Schema::create('odometer_readings', function (Blueprint $table) {
            $table->id();

            // Vehicle identification
            $table->string('vehicle_vin')->index(); // Cross-check with VIN
            $table->string('vehicle_plate_number')->nullable()->index();

            // Work order relationship (nullable because readings can be standalone)
            $table->foreignId('work_order_id')->nullable()->constrained('work_orders')->onDelete('cascade');
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');

            // Odometer data
            $table->unsignedInteger('reading'); // Odometer reading in km
            $table->enum('unit', ['km', 'miles'])->default('km');
            $table->timestamp('reading_date'); // When the reading was taken

            // Fraud detection fields
            $table->unsignedInteger('previous_reading')->nullable(); // Last known reading
            $table->timestamp('previous_reading_date')->nullable(); // Date of last reading
            $table->integer('distance_diff')->nullable(); // Difference from previous reading
            $table->integer('days_diff')->nullable(); // Days since last reading
            $table->decimal('avg_daily_distance', 10, 2)->nullable(); // Average km per day

            // Anomaly detection flags
            $table->boolean('is_anomaly')->default(false); // Auto-flagged by system
            $table->enum('anomaly_type', [
                'none',
                'rollback', // Reading lower than previous
                'excessive_increase', // Unrealistic daily average (>500km/day)
                'duplicate', // Same reading as previous
                'missed_interval', // Missed PMS interval
            ])->default('none');
            $table->text('anomaly_notes')->nullable();

            // Photo evidence for verification
            $table->string('photo_path')->nullable(); // Photo of odometer
            $table->boolean('has_photo_evidence')->default(false);

            // Audit trail
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('recorded_ip_address', 45)->nullable();
            $table->boolean('is_verified')->default(false); // Verified by supervisor
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();

            $table->timestamps();

            // Indexes for efficient querying (vehicle_vin already has index from earlier definition)
            $table->index('reading_date');
            $table->index('is_anomaly');
            $table->index('anomaly_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('odometer_readings');
    }
};
