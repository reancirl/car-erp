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
            // Drop the existing foreign key constraint
            $table->dropForeign(['vehicle_master_id']);
            
            // Modify the column to be nullable
            $table->foreignId('vehicle_master_id')->nullable()->change()->constrained()->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicle_units', function (Blueprint $table) {
            // Drop the foreign key
            $table->dropForeign(['vehicle_master_id']);
            
            // Make it required again
            $table->foreignId('vehicle_master_id')->nullable(false)->change()->constrained()->onDelete('restrict');
        });
    }
};
