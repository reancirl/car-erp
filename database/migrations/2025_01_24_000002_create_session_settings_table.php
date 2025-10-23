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
        Schema::create('session_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // Setting key (e.g., 'idle_warning_minutes')
            $table->string('value'); // Setting value
            $table->string('label'); // Human-readable label
            $table->text('description')->nullable(); // Description of the setting
            $table->string('type')->default('integer'); // Data type: integer, boolean, string
            $table->integer('default_value')->nullable(); // Default value
            $table->timestamps();
        });

        // Insert default settings
        DB::table('session_settings')->insert([
            [
                'key' => 'idle_warning_minutes',
                'value' => '15',
                'label' => 'Idle Warning (minutes)',
                'description' => 'Show warning after this many minutes of inactivity',
                'type' => 'integer',
                'default_value' => 15,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'auto_logout_minutes',
                'value' => '30',
                'label' => 'Auto Logout (minutes)',
                'description' => 'Force logout after this many minutes of inactivity',
                'type' => 'integer',
                'default_value' => 30,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'grace_period_minutes',
                'value' => '5',
                'label' => 'Grace Period (minutes)',
                'description' => 'Allow re-authentication within this time after idle timeout',
                'type' => 'integer',
                'default_value' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('session_settings');
    }
};
