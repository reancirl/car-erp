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
        Schema::dropIfExists('user_sessions');
        
        Schema::create('user_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->unique(); // Links to sessions.id
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('login_time');
            $table->timestamp('logout_time')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->integer('activity_count')->default(0); // Count of activities during session
            $table->timestamp('last_activity_at')->nullable();
            $table->integer('idle_time_minutes')->default(0); // Calculated idle time
            $table->enum('status', ['active', 'completed', 'idle_timeout', 'forced_logout'])->default('active');
            $table->text('logout_reason')->nullable(); // Why session ended
            $table->timestamps();
            
            $table->index(['user_id', 'login_time']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_sessions');
    }
};
