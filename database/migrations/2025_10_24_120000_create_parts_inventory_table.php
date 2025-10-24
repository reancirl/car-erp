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
        Schema::create('parts_inventory', function (Blueprint $table) {
            $table->id();
            
            // Auto-generated ID
            $table->string('part_number')->unique()->comment('Auto-generated: PART-YYYY-XXX');
            
            // Branch isolation
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');
            
            // Basic Information
            $table->string('part_name');
            $table->text('description')->nullable();
            $table->string('category'); // engine, transmission, electrical, body, suspension, brakes, interior, exterior, accessories, fluids, filters, other
            $table->string('subcategory')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('manufacturer_part_number')->nullable();
            $table->string('oem_part_number')->nullable();
            
            // Compatibility
            $table->json('compatible_makes')->nullable()->comment('Array of compatible vehicle makes');
            $table->json('compatible_models')->nullable()->comment('Array of compatible vehicle models');
            $table->json('compatible_years')->nullable()->comment('Array of compatible years');
            
            // Inventory Tracking
            $table->integer('quantity_on_hand')->default(0);
            $table->integer('quantity_reserved')->default(0)->comment('Reserved for pending orders');
            $table->integer('quantity_available')->virtualAs('quantity_on_hand - quantity_reserved');
            $table->integer('minimum_stock_level')->default(0)->comment('Reorder point');
            $table->integer('maximum_stock_level')->nullable()->comment('Maximum stock to maintain');
            $table->integer('reorder_quantity')->nullable()->comment('Quantity to order when below minimum');
            
            // Location
            $table->string('warehouse_location')->nullable()->comment('Shelf/Bin location');
            $table->string('aisle')->nullable();
            $table->string('rack')->nullable();
            $table->string('bin')->nullable();
            
            // Pricing
            $table->decimal('unit_cost', 10, 2)->default(0)->comment('Cost per unit');
            $table->decimal('selling_price', 10, 2)->default(0)->comment('Retail price');
            $table->decimal('wholesale_price', 10, 2)->nullable()->comment('Wholesale/dealer price');
            $table->string('currency', 3)->default('PHP');
            $table->decimal('markup_percentage', 8, 2)->nullable()->comment('Markup percentage (can exceed 100%)');
            
            // Physical Attributes
            $table->decimal('weight', 8, 2)->nullable()->comment('Weight in kg');
            $table->decimal('length', 8, 2)->nullable()->comment('Length in cm');
            $table->decimal('width', 8, 2)->nullable()->comment('Width in cm');
            $table->decimal('height', 8, 2)->nullable()->comment('Height in cm');
            
            // Supplier Information
            $table->string('primary_supplier')->nullable();
            $table->string('supplier_contact')->nullable();
            $table->string('supplier_email')->nullable();
            $table->string('supplier_phone')->nullable();
            $table->integer('lead_time_days')->nullable()->comment('Supplier lead time');
            
            // Condition & Quality
            $table->enum('condition', ['new', 'refurbished', 'used', 'oem', 'aftermarket'])->default('new');
            $table->string('quality_grade')->nullable()->comment('A, B, C, etc.');
            $table->boolean('is_genuine')->default(true)->comment('OEM vs Aftermarket');
            
            // Warranty
            $table->integer('warranty_months')->nullable();
            $table->text('warranty_terms')->nullable();
            
            // Status & Flags
            $table->enum('status', ['active', 'inactive', 'discontinued', 'out_of_stock', 'on_order'])->default('active');
            $table->boolean('is_serialized')->default(false)->comment('Track by serial number');
            $table->boolean('is_hazardous')->default(false)->comment('Hazardous material');
            $table->boolean('requires_special_handling')->default(false);
            $table->boolean('is_fast_moving')->default(false)->comment('High turnover item');
            
            // Dates
            $table->date('last_received_date')->nullable();
            $table->date('last_sold_date')->nullable();
            $table->date('last_counted_date')->nullable()->comment('Last physical count');
            $table->date('discontinued_date')->nullable();
            
            // Analytics
            $table->integer('total_sold')->default(0)->comment('Lifetime sales quantity');
            $table->decimal('total_revenue', 12, 2)->default(0)->comment('Lifetime revenue');
            $table->integer('times_ordered')->default(0)->comment('Number of times ordered');
            $table->decimal('average_monthly_sales', 8, 2)->default(0);
            $table->integer('days_in_stock')->default(0);
            $table->decimal('turnover_rate', 5, 2)->nullable();
            
            // Images & Documents
            $table->json('images')->nullable()->comment('Array of image URLs');
            $table->json('documents')->nullable()->comment('Array of document URLs (manuals, specs)');
            
            // Notes & Tags
            $table->text('notes')->nullable();
            $table->json('tags')->nullable()->comment('Custom tags for filtering');
            
            // Barcode/SKU
            $table->string('barcode')->nullable()->unique();
            $table->string('sku')->nullable()->unique();
            
            // Timestamps & Soft Deletes
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('branch_id');
            $table->index('category');
            $table->index('status');
            $table->index('manufacturer');
            $table->index('quantity_on_hand');
            $table->index('last_sold_date');
            $table->index(['branch_id', 'status']);
            $table->index(['branch_id', 'category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parts_inventory');
    }
};
