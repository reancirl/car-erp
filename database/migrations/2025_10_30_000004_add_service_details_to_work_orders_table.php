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
        Schema::table('work_orders', function (Blueprint $table) {
            $table->date('requested_at')->nullable()->after('priority');
            $table->date('actual_service_date')->nullable()->after('requested_at');
            $table->enum('job_type', ['pms', 'warranty', 'accident', 'customer_pay'])
                ->default('pms')
                ->after('service_type_id');
            $table->decimal('labor_cost', 12, 2)->nullable()->after('actual_cost');
            $table->text('service_details')->nullable()->after('diagnostic_findings');
            $table->text('recurring_issue_notes')->nullable()->after('service_details');
            $table->enum('warranty_charge_to', ['none', 'wuling', 'supplier', 'other'])
                ->default('none')
                ->after('is_warranty_claim');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropColumn([
                'requested_at',
                'actual_service_date',
                'job_type',
                'labor_cost',
                'service_details',
                'recurring_issue_notes',
                'warranty_charge_to',
            ]);
        });
    }
};
