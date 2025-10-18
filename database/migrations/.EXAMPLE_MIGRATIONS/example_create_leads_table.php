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
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            
            // Branch relationship (REQUIRED for branch isolation)
            $table->foreignId('branch_id')
                ->constrained('branches')
                ->onDelete('restrict');
            $table->index('branch_id');
            
            // Lead identification
            $table->string('lead_number')->unique();
            
            // Customer information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->nullable();
            $table->string('phone');
            $table->string('mobile')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            
            // Lead source & classification
            $table->enum('source', [
                'walk_in',
                'phone_call',
                'website',
                'social_media',
                'referral',
                'email',
                'event',
                'third_party',
                'other'
            ]);
            $table->string('source_details')->nullable();
            $table->enum('type', ['new_vehicle', 'used_vehicle', 'service', 'parts', 'trade_in']);
            
            // Interest & Budget
            $table->string('interested_model')->nullable();
            $table->string('interested_variant')->nullable();
            $table->decimal('budget_min', 12, 2)->nullable();
            $table->decimal('budget_max', 12, 2)->nullable();
            $table->enum('purchase_timeframe', [
                'immediate',
                'within_week',
                'within_month',
                'within_3months',
                'over_3months',
                'undecided'
            ])->nullable();
            
            // Assignment & Status
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', [
                'new',
                'contacted',
                'qualified',
                'presentation',
                'negotiation',
                'won',
                'lost',
                'follow_up'
            ])->default('new');
            $table->enum('priority', ['low', 'medium', 'high', 'hot'])->default('medium');
            
            // Qualification
            $table->boolean('has_trade_in')->default(false);
            $table->string('trade_in_vehicle')->nullable();
            $table->boolean('needs_financing')->default(false);
            $table->string('financing_status')->nullable();
            
            // Tracking
            $table->integer('contact_attempts')->default(0);
            $table->dateTime('last_contact_date')->nullable();
            $table->dateTime('next_follow_up_date')->nullable();
            $table->text('notes')->nullable();
            
            // Conversion tracking
            $table->foreignId('converted_to_sale_id')->nullable()->constrained('sales')->onDelete('set null');
            $table->dateTime('converted_at')->nullable();
            $table->string('lost_reason')->nullable();
            $table->text('lost_details')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for common queries
            $table->index('status');
            $table->index('priority');
            $table->index('source');
            $table->index('assigned_to');
            $table->index(['branch_id', 'status']);
            $table->index(['assigned_to', 'status']);
            $table->index('next_follow_up_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
