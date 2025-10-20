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
        Schema::create('test_drives', function (Blueprint $table) {
            $table->id();
            $table->string('reservation_id')->unique();
            
            // Customer Information
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email')->nullable();
            
            // Vehicle Information
            $table->string('vehicle_vin');
            $table->string('vehicle_details');
            
            // Schedule
            $table->date('scheduled_date');
            $table->string('scheduled_time');
            $table->integer('duration_minutes')->default(30);
            
            // Assignment
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->onDelete('set null');
            
            // Status
            $table->enum('status', [
                'pending_signature',
                'confirmed', 
                'in_progress',
                'completed', 
                'cancelled',
                'no_show'
            ])->default('pending_signature');
            
            $table->enum('reservation_type', ['scheduled', 'walk_in'])->default('scheduled');
            
            // E-Signature
            $table->enum('esignature_status', ['pending', 'signed', 'not_required'])->default('pending');
            $table->timestamp('esignature_timestamp')->nullable();
            $table->string('esignature_device')->nullable();
            $table->text('esignature_data')->nullable(); // JSON blob for signature image/data
            
            // GPS Tracking
            $table->string('gps_start_coords')->nullable(); // latitude,longitude
            $table->string('gps_end_coords')->nullable();
            $table->timestamp('gps_start_timestamp')->nullable();
            $table->timestamp('gps_end_timestamp')->nullable();
            $table->decimal('route_distance_km', 8, 2)->nullable();
            $table->decimal('max_speed_kmh', 5, 2)->nullable();
            
            // Verification & Requirements
            $table->boolean('insurance_verified')->default(false);
            $table->boolean('license_verified')->default(false);
            $table->decimal('deposit_amount', 10, 2)->default(0);
            
            // Notes
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('reservation_id');
            $table->index('customer_phone');
            $table->index('vehicle_vin');
            $table->index('scheduled_date');
            $table->index('status');
            $table->index('branch_id');
            $table->index('assigned_user_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('test_drives');
    }
};
