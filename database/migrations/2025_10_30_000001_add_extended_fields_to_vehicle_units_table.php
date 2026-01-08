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
            // Identifiers and regulatory numbers
            $table->string('conduction_no')->nullable()->after('stock_number')->index();
            $table->string('drive_motor_no')->nullable()->after('conduction_no')->index();
            $table->string('plate_no')->nullable()->after('drive_motor_no')->index();
            $table->string('lto_transaction_no')->nullable()->after('plate_no');
            $table->string('cr_no')->nullable()->after('lto_transaction_no');
            $table->date('or_cr_release_date')->nullable()->after('cr_no');
            $table->string('emission_reference')->nullable()->after('or_cr_release_date');

            // Commercial metadata
            $table->decimal('msrp_price', 15, 2)->nullable()->after('sale_price');
            $table->string('variant')->nullable()->after('vehicle_model_id');
            $table->string('variant_spec')->nullable()->after('variant');
            $table->string('color_code')->nullable()->after('color_exterior');
            $table->string('location')->default('branch')->after('status')->comment('warehouse, gbf, branch, sold');
            $table->string('sub_status')->nullable()->after('location')->comment('reserved_with_dp, reserved_no_dp, for_lto, for_release, for_body_repair, inspection');
            $table->boolean('is_locked')->default(false)->after('sub_status')->comment('Prevents selling/changes when reserved and paid');

            // Ownership
            $table->foreignId('owner_id')->nullable()->after('assigned_user_id')->constrained('customers')->nullOnDelete();

            // EV/technical details
            $table->decimal('battery_capacity', 6, 2)->nullable()->after('odometer');
            $table->integer('battery_range_km')->nullable()->after('battery_capacity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicle_units', function (Blueprint $table) {
            $table->dropColumn([
                'conduction_no',
                'drive_motor_no',
                'plate_no',
                'lto_transaction_no',
                'cr_no',
                'or_cr_release_date',
                'emission_reference',
                'msrp_price',
                'variant',
                'variant_spec',
                'color_code',
                'location',
                'sub_status',
                'is_locked',
                'battery_capacity',
                'battery_range_km',
            ]);

            $table->dropConstrainedForeignId('owner_id');
        });
    }
};
