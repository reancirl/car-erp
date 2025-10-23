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
        Schema::create('customer_surveys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');
            
            // Unique survey link
            $table->string('token', 64)->unique(); // Unique token for public access
            $table->string('survey_type')->default('general'); // general, post_purchase, service_followup, etc.
            
            // Survey metadata
            $table->string('trigger_event')->nullable(); // What triggered this survey
            $table->timestamp('sent_at')->nullable();
            $table->string('sent_method')->nullable(); // email, sms, manual
            $table->timestamp('expires_at')->nullable(); // Survey expiration
            
            // Response data
            $table->enum('status', ['pending', 'completed', 'expired'])->default('pending');
            $table->timestamp('completed_at')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            
            // Survey questions and responses
            $table->integer('overall_rating')->nullable(); // 1-5 stars
            $table->integer('product_quality')->nullable(); // 1-5
            $table->integer('service_quality')->nullable(); // 1-5
            $table->integer('staff_friendliness')->nullable(); // 1-5
            $table->integer('facility_cleanliness')->nullable(); // 1-5
            $table->integer('value_for_money')->nullable(); // 1-5
            
            // Open-ended responses
            $table->text('what_went_well')->nullable();
            $table->text('what_needs_improvement')->nullable();
            $table->text('additional_comments')->nullable();
            
            // NPS (Net Promoter Score)
            $table->integer('nps_score')->nullable(); // 0-10 (likelihood to recommend)
            $table->text('nps_reason')->nullable();
            
            // Follow-up
            $table->boolean('wants_followup')->default(false);
            $table->string('preferred_contact_method')->nullable();
            
            // Metadata
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->json('custom_fields')->nullable(); // For flexible additional questions
            
            $table->timestamps();
            
            // Indexes
            $table->index('customer_id');
            $table->index('branch_id');
            $table->index('token');
            $table->index('status');
            $table->index('survey_type');
            $table->index('sent_at');
            $table->index('completed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_surveys');
    }
};
