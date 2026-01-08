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
            $table->date('release_date')->nullable()->after('sold_date');
            $table->enum('payment_method', ['cash', 'bank_financing', 'in_house'])->nullable()->after('release_date');
            $table->json('proof_of_payment_refs')->nullable()->after('payment_method');
            $table->string('dealer')->nullable()->after('proof_of_payment_refs');
            $table->foreignId('sales_agent_id')->nullable()->after('dealer')->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_driver_id')->nullable()->after('sales_agent_id')->constrained('users')->nullOnDelete();
            $table->json('gps_details')->nullable()->after('assigned_driver_id');
            $table->json('insurance_details')->nullable()->after('gps_details');
            $table->json('promo_freebies')->nullable()->after('insurance_details');

            // Pricing breakdown
            $table->decimal('srp_amount', 15, 2)->nullable()->after('msrp_price');
            $table->decimal('discount_amount', 15, 2)->nullable()->after('srp_amount');
            $table->decimal('net_selling_price', 15, 2)->nullable()->after('discount_amount');
            $table->decimal('dp_amount', 15, 2)->nullable()->after('net_selling_price');
            $table->date('dp_date')->nullable()->after('dp_amount');
            $table->decimal('balance_financed', 15, 2)->nullable()->after('dp_date');
            $table->string('financing_institution')->nullable()->after('balance_financed');
            $table->integer('financing_terms_months')->nullable()->after('financing_institution');
            $table->decimal('financing_interest_rate', 5, 2)->nullable()->after('financing_terms_months');
            $table->decimal('financing_monthly_amortization', 15, 2)->nullable()->after('financing_interest_rate');
            $table->json('chattel_mortgage_details')->nullable()->after('financing_monthly_amortization');

            // Documents and approvals
            $table->string('sales_invoice_no')->nullable()->after('chattel_mortgage_details');
            $table->string('dr_no')->nullable()->after('sales_invoice_no');
            $table->json('or_numbers')->nullable()->after('dr_no');
            $table->json('release_checklist_status')->nullable()->after('or_numbers');
            $table->foreignId('release_approval_user_id')->nullable()->after('release_checklist_status')->constrained('users')->nullOnDelete();

            // Freebies / subsidies
            $table->json('freebies_list')->nullable()->after('release_approval_user_id');
            $table->decimal('freebies_total_cost', 15, 2)->nullable()->after('freebies_list');
            $table->enum('freebies_payer', ['hq', 'cebu', 'other'])->nullable()->after('freebies_total_cost');

            // Warranty
            $table->date('warranty_start_date')->nullable()->after('freebies_payer');
            $table->date('warranty_end_date')->nullable()->after('warranty_start_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicle_units', function (Blueprint $table) {
            $table->dropColumn([
                'release_date',
                'payment_method',
                'proof_of_payment_refs',
                'dealer',
                'gps_details',
                'insurance_details',
                'promo_freebies',
                'srp_amount',
                'discount_amount',
                'net_selling_price',
                'dp_amount',
                'dp_date',
                'balance_financed',
                'financing_institution',
                'financing_terms_months',
                'financing_interest_rate',
                'financing_monthly_amortization',
                'chattel_mortgage_details',
                'sales_invoice_no',
                'dr_no',
                'or_numbers',
                'release_checklist_status',
                'freebies_list',
                'freebies_total_cost',
                'freebies_payer',
                'warranty_start_date',
                'warranty_end_date',
            ]);

            $table->dropConstrainedForeignId('sales_agent_id');
            $table->dropConstrainedForeignId('assigned_driver_id');
            $table->dropConstrainedForeignId('release_approval_user_id');
        });
    }
};
