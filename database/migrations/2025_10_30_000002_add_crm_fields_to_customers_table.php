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
        Schema::table('customers', function (Blueprint $table) {
            // Lead and classification
            $table->enum('customer_segment', ['retail', 'fleet', 'puv_operator', 'ap_dealer', 'sub_dealer'])->default('retail')->after('customer_type');
            $table->enum('lead_source', ['walk_in', 'facebook', 'ap', 'referral', 'event', 'other'])->nullable()->after('referral_source');
            $table->text('interest_notes')->nullable()->after('notes');
            $table->foreignId('preferred_vehicle_model_id')->nullable()->after('interest_notes')->constrained('vehicle_models')->nullOnDelete();

            // Compliance / identification
            $table->string('government_id_type')->nullable()->after('tax_id');
            $table->string('government_id_number')->nullable()->after('government_id_type');

            // Corporate signatory
            $table->string('authorized_signatory')->nullable()->after('company_name');
            $table->string('authorized_position')->nullable()->after('authorized_signatory');

            // Reservation tracking
            $table->decimal('reservation_amount', 12, 2)->nullable()->after('total_spent');
            $table->date('reservation_date')->nullable()->after('reservation_amount');
            $table->enum('reservation_status', ['pending', 'confirmed', 'cancelled', 'converted'])->nullable()->after('reservation_date');
            $table->string('reservation_reference')->nullable()->after('reservation_status');
            $table->foreignId('reservation_unit_id')->nullable()->after('reservation_reference')->constrained('vehicle_units')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn([
                'customer_segment',
                'lead_source',
                'interest_notes',
                'government_id_type',
                'government_id_number',
                'authorized_signatory',
                'authorized_position',
                'reservation_amount',
                'reservation_date',
                'reservation_status',
                'reservation_reference',
            ]);

            $table->dropConstrainedForeignId('preferred_vehicle_model_id');
            $table->dropConstrainedForeignId('reservation_unit_id');
        });
    }
};
