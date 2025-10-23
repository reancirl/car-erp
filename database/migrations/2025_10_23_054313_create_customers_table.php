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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('customer_id')->unique(); // Auto-generated: CUS-YYYY-XXX
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');
            
            // Personal Information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('phone');
            $table->string('alternate_phone')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other', 'prefer_not_to_say'])->nullable();
            
            // Address Information
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country')->default('Philippines');
            
            // Customer Classification
            $table->enum('customer_type', ['individual', 'corporate'])->default('individual');
            $table->string('company_name')->nullable();
            $table->string('tax_id')->nullable(); // TIN for Philippines
            
            // Customer Status & Scoring
            $table->enum('status', ['active', 'inactive', 'vip', 'blacklisted'])->default('active');
            $table->integer('loyalty_points')->default(0);
            $table->integer('customer_lifetime_value')->default(0); // Total purchases
            $table->enum('satisfaction_rating', ['very_satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very_dissatisfied'])->nullable();
            
            // Purchase History Tracking
            $table->integer('total_purchases')->default(0);
            $table->decimal('total_spent', 12, 2)->default(0);
            $table->date('first_purchase_date')->nullable();
            $table->date('last_purchase_date')->nullable();
            
            // Communication Preferences
            $table->boolean('email_notifications')->default(true);
            $table->boolean('sms_notifications')->default(true);
            $table->boolean('marketing_consent')->default(false);
            
            // Assigned Relationship Manager
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            
            // Additional Information
            $table->text('notes')->nullable();
            $table->json('tags')->nullable(); // e.g., ['vip', 'fleet_buyer', 'referral_source']
            $table->json('preferences')->nullable(); // Store custom preferences
            
            // Referral Information
            $table->foreignId('referred_by')->nullable()->constrained('customers')->onDelete('set null');
            $table->string('referral_source')->nullable(); // How they found us
            
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes for performance
            $table->index('branch_id');
            $table->index('customer_id');
            $table->index('email');
            $table->index('phone');
            $table->index('status');
            $table->index('customer_type');
            $table->index('assigned_to');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
