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
        Schema::create('work_order_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->onDelete('cascade');
            $table->string('part_number')->nullable();
            $table->string('description')->nullable();
            $table->decimal('quantity', 10, 2)->default(1);
            $table->decimal('unit_cost', 12, 2)->nullable();
            $table->decimal('unit_price', 12, 2)->nullable();
            $table->timestamps();

            $table->index('part_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_order_parts');
    }
};
