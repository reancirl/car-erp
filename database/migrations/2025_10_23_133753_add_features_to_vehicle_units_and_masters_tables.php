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
        Schema::table('vehicle_masters', function (Blueprint $table) {
            $table->json('features')->nullable()->after('specs')->comment('Array of features with title and value: [{"title": "Apple CarPlay", "value": "Standard"}]');
        });

        Schema::table('vehicle_units', function (Blueprint $table) {
            $table->json('features')->nullable()->after('specs')->comment('Array of features with title and value: [{"title": "Apple CarPlay", "value": "Standard"}]');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicle_masters', function (Blueprint $table) {
            $table->dropColumn('features');
        });

        Schema::table('vehicle_units', function (Blueprint $table) {
            $table->dropColumn('features');
        });
    }
};
