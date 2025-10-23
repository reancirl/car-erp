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
        Schema::create('vehicle_movements', function (Blueprint $table) {
            $table->id();
            
            // Foreign keys
            $table->foreignId('vehicle_unit_id')->constrained()->onDelete('cascade');
            $table->foreignId('from_branch_id')->nullable()->constrained('branches')->onDelete('set null');
            $table->foreignId('to_branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null')->comment('User who initiated transfer');
            
            // Transfer details
            $table->date('transfer_date')->comment('Date of transfer');
            $table->text('remarks')->nullable()->comment('Transfer notes or reason');
            
            // Metadata
            $table->enum('status', ['pending', 'in_transit', 'completed', 'cancelled'])->default('completed');
            $table->timestamp('completed_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['vehicle_unit_id', 'transfer_date']);
            $table->index('vehicle_unit_id');
            $table->index('from_branch_id');
            $table->index('to_branch_id');
            $table->index('transfer_date');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_movements');
    }
};
