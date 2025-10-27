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
        Schema::create('warranty_claim_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warranty_claim_id')->constrained('warranty_claims')->onDelete('cascade');
            $table->foreignId('part_inventory_id')->nullable()->constrained('parts_inventory')->onDelete('set null');

            // Part Details
            $table->string('part_number')->nullable();
            $table->string('part_name');
            $table->text('description')->nullable();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);

            // Claim Specific
            $table->enum('claim_status', ['pending', 'approved', 'rejected', 'partial'])->default('pending');
            $table->decimal('approved_quantity', 10, 2)->nullable();
            $table->decimal('approved_amount', 10, 2)->nullable();
            $table->text('rejection_reason')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('warranty_claim_id');
            $table->index('part_inventory_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warranty_claim_parts');
    }
};
