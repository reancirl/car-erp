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
        Schema::table('test_drives', function (Blueprint $table) {
            $table->foreignId('vehicle_model_id')->nullable()->after('vehicle_details')->constrained('vehicle_models')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('test_drives', function (Blueprint $table) {
            $table->dropForeign(['vehicle_model_id']);
            $table->dropColumn('vehicle_model_id');
        });
    }
};
