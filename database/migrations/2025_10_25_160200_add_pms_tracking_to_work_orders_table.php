<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Add PMS tracking and fraud prevention fields to work_orders table.
     */
    public function up(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            // PMS interval tracking
            $table->unsignedInteger('pms_interval_km')->nullable()->after('current_mileage'); // Expected interval (5000, 10000, etc.)
            $table->unsignedTinyInteger('time_interval_months')->nullable()->after('pms_interval_km'); // Time-based interval (e.g., 6 months)
            $table->timestamp('next_pms_due_date')->nullable()->after('completed_at'); // Calendar-based due date
            $table->unsignedInteger('next_pms_due_mileage')->nullable()->after('next_pms_due_date'); // Mileage-based due

            // Missed service detection
            $table->boolean('is_overdue')->default(false)->after('status'); // Auto-flagged if overdue
            $table->integer('days_overdue')->nullable()->after('is_overdue'); // Days past due date
            $table->integer('km_overdue')->nullable()->after('days_overdue'); // KM past due mileage

            // Fraud prevention flags
            $table->boolean('requires_photo_verification')->default(true)->after('photos_uploaded');
            $table->unsignedTinyInteger('minimum_photos_required')->default(2)->after('requires_photo_verification'); // Before/after minimum
            $table->boolean('odometer_verified')->default(false)->after('minimum_photos_required');
            $table->boolean('location_verified')->default(false)->after('odometer_verified'); // GPS check passed

            // Service location (for geo-verification)
            $table->decimal('service_location_lat', 10, 7)->nullable()->after('location_verified');
            $table->decimal('service_location_lng', 10, 7)->nullable()->after('service_location_lat');
            $table->string('service_location_address')->nullable()->after('service_location_lng');

            // Fraud alerts
            $table->json('fraud_alerts')->nullable()->after('notes'); // Array of detected anomalies
            $table->boolean('has_fraud_alerts')->default(false)->after('fraud_alerts');
            $table->enum('verification_status', [
                'pending',
                'verified',
                'flagged',
                'rejected'
            ])->default('pending')->after('has_fraud_alerts');

            // Indexes for fraud detection queries
            $table->index('is_overdue');
            $table->index('has_fraud_alerts');
            $table->index('verification_status');
            $table->index('next_pms_due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropIndex(['is_overdue']);
            $table->dropIndex(['has_fraud_alerts']);
            $table->dropIndex(['verification_status']);
            $table->dropIndex(['next_pms_due_date']);

            $table->dropColumn([
                'pms_interval_km',
                'next_pms_due_date',
                'next_pms_due_mileage',
                'time_interval_months',
                'is_overdue',
                'days_overdue',
                'km_overdue',
                'requires_photo_verification',
                'minimum_photos_required',
                'odometer_verified',
                'location_verified',
                'service_location_lat',
                'service_location_lng',
                'service_location_address',
                'fraud_alerts',
                'has_fraud_alerts',
                'verification_status',
            ]);
        });
    }
};
