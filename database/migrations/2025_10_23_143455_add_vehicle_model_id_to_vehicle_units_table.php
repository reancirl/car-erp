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
        Schema::table('vehicle_units', function (Blueprint $table) {
            // Add vehicle_model_id foreign key after vehicle_master_id
            $table->foreignId('vehicle_model_id')->nullable()->after('vehicle_master_id')->constrained('vehicle_models')->onDelete('restrict')->comment('Reference to vehicle model (WULING model catalog)');
            $table->index('vehicle_model_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicle_units', function (Blueprint $table) {
            $table->dropForeign(['vehicle_model_id']);
            $table->dropIndex(['vehicle_model_id']);
            $table->dropColumn('vehicle_model_id');
        });
    }
};
