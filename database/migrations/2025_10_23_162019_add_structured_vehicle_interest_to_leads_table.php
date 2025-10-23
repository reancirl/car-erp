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
            // Add structured vehicle interest fields after vehicle_interest
            $table->string('vehicle_year')->nullable()->after('vehicle_interest');
            $table->string('vehicle_make')->nullable()->after('vehicle_year');
            $table->string('vehicle_model')->nullable()->after('vehicle_make');
            $table->string('vehicle_variant')->nullable()->after('vehicle_model');
            $table->foreignId('vehicle_model_id')->nullable()->constrained('vehicle_models')->onDelete('set null')->after('vehicle_variant');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropForeign(['vehicle_model_id']);
            $table->dropColumn([
                'vehicle_year',
                'vehicle_make',
                'vehicle_model',
                'vehicle_variant',
                'vehicle_model_id',
            ]);
        });
    }
};
