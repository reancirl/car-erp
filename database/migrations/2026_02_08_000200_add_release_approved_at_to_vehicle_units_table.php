<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicle_units', function (Blueprint $table) {
            $table->timestamp('release_approved_at')->nullable()->after('release_approval_user_id');
        });
    }

    public function down(): void
    {
        Schema::table('vehicle_units', function (Blueprint $table) {
            $table->dropColumn('release_approved_at');
        });
    }
};
