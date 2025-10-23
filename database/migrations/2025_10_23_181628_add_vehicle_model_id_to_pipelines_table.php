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
        Schema::table('pipelines', function (Blueprint $table) {
            // Add vehicle_model_id foreign key
            $table->foreignId('vehicle_model_id')->nullable()->after('vehicle_interest')->constrained('vehicle_models')->onDelete('set null');
            
            // Remove redundant vehicle fields
            $table->dropColumn(['vehicle_year', 'vehicle_make', 'vehicle_model']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pipelines', function (Blueprint $table) {
            // Restore redundant vehicle fields
            $table->string('vehicle_year')->nullable()->after('vehicle_interest');
            $table->string('vehicle_make')->nullable()->after('vehicle_year');
            $table->string('vehicle_model')->nullable()->after('vehicle_make');
            
            // Remove vehicle_model_id
            $table->dropForeign(['vehicle_model_id']);
            $table->dropColumn('vehicle_model_id');
        });
    }
};
