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
        Schema::create('warranty_claim_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warranty_claim_id')->constrained('warranty_claims')->onDelete('cascade');

            // File Information
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_size')->nullable();
            $table->string('mime_type')->nullable();

            // Photo Classification
            $table->enum('photo_type', [
                'failure',
                'damage',
                'before_repair',
                'after_repair',
                'documentation',
                'other'
            ])->default('failure');

            // EXIF Data
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('camera_make')->nullable();
            $table->string('camera_model')->nullable();
            $table->timestamp('photo_taken_at')->nullable();

            // Metadata
            $table->text('caption')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('upload_ip')->nullable();
            $table->string('upload_user_agent')->nullable();
            $table->boolean('is_verified')->default(false);

            $table->timestamps();

            // Indexes
            $table->index('warranty_claim_id');
            $table->index('photo_type');
            $table->index('uploaded_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warranty_claim_photos');
    }
};
