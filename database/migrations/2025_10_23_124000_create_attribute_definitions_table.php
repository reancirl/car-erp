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
        Schema::create('attribute_definitions', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique()->comment('Unique slug, e.g., infotainment.apple_carplay');
            $table->string('label')->comment('Human-readable label');
            $table->enum('type', ['string', 'int', 'decimal', 'bool', 'enum'])->comment('Data type');
            $table->enum('scope', ['master', 'unit', 'both'])->comment('Applicable to master, unit, or both');
            $table->string('uom')->nullable()->comment('Unit of measurement, e.g., mm, kg');
            $table->json('enum_options')->nullable()->comment('Valid options for enum type');
            $table->boolean('is_required_master')->default(false);
            $table->boolean('is_required_unit')->default(false);
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('key');
            $table->index(['scope', 'is_active']);
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attribute_definitions');
    }
};
