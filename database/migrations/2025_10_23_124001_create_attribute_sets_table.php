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
        Schema::create('attribute_sets', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique()->comment('Template name, e.g., "Sedan Standard Features"');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('name');
            $table->index('is_active');
        });

        Schema::create('attribute_set_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attribute_set_id')->constrained()->onDelete('cascade');
            $table->foreignId('attribute_definition_id')->constrained()->onDelete('cascade');
            $table->json('default_value')->nullable()->comment('Default value for this attribute in the set');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('attribute_set_id');
            $table->index('attribute_definition_id');
            $table->unique(['attribute_set_id', 'attribute_definition_id'], 'unique_set_attribute');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attribute_set_items');
        Schema::dropIfExists('attribute_sets');
    }
};
