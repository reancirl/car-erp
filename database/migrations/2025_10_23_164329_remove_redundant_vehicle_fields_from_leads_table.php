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
        Schema::table('leads', function (Blueprint $table) {
            // Remove redundant individual fields, keep vehicle_interest summary and vehicle_model_id
            $table->dropColumn([
                'vehicle_year',
                'vehicle_make',
                'vehicle_model',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            // Restore fields if needed
            $table->string('vehicle_year')->nullable()->after('vehicle_interest');
            $table->string('vehicle_make')->nullable()->after('vehicle_year');
            $table->string('vehicle_model')->nullable()->after('vehicle_make');
        });
    }
};
