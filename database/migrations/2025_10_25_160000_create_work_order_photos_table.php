<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Photo evidence table for PMS fraud prevention.
     * Stores before/after photos with EXIF metadata for geo-verification.
     */
    public function up(): void
    {
        Schema::create('work_order_photos', function (Blueprint $table) {
            $table->id();

            // Work order relationship
            $table->foreignId('work_order_id')->constrained('work_orders')->onDelete('cascade');

            // Photo metadata
            $table->string('file_path'); // Storage path
            $table->string('file_name'); // Original filename
            $table->unsignedInteger('file_size')->nullable(); // In bytes
            $table->string('mime_type')->nullable();
            $table->enum('photo_type', ['before', 'after', 'during', 'damage', 'completion'])->default('during');

            // EXIF and geo-location data (fraud prevention)
            $table->decimal('latitude', 10, 7)->nullable(); // GPS latitude from EXIF
            $table->decimal('longitude', 10, 7)->nullable(); // GPS longitude from EXIF
            $table->string('location_address')->nullable(); // Reverse geocoded address
            $table->timestamp('photo_taken_at')->nullable(); // EXIF datetime original
            $table->string('camera_make')->nullable(); // EXIF camera make
            $table->string('camera_model')->nullable(); // EXIF camera model

            // Upload metadata (additional fraud prevention)
            $table->string('uploaded_ip_address', 45)->nullable(); // IPv4/IPv6
            $table->text('user_agent')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();

            // Verification flags
            $table->boolean('has_gps_data')->default(false);
            $table->boolean('has_exif_data')->default(false);
            $table->boolean('is_verified')->default(false); // Manual verification by supervisor
            $table->text('notes')->nullable(); // Description or notes about the photo

            $table->timestamps();

            // Indexes for performance
            $table->index('work_order_id');
            $table->index('photo_type');
            $table->index('uploaded_by');
            $table->index('photo_taken_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_order_photos');
    }
};
