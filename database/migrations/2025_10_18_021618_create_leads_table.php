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
            $table->string('lead_id')->unique(); // LD-2025-001
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            
            // Contact Information
            $table->string('name');
            $table->string('email');
            $table->string('phone');
            $table->string('location')->nullable();
            $table->string('ip_address')->nullable();
            
            // Lead Source & Classification
            $table->enum('source', ['web_form', 'phone', 'walk_in', 'referral', 'social_media']);
            $table->enum('status', ['new', 'contacted', 'qualified', 'hot', 'unqualified', 'lost'])->default('new');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            
            // Vehicle Interest
            $table->string('vehicle_interest')->nullable();
            $table->decimal('budget_min', 10, 2)->nullable();
            $table->decimal('budget_max', 10, 2)->nullable();
            $table->enum('purchase_timeline', ['immediate', 'soon', 'month', 'quarter', 'exploring'])->nullable();
            
            // Scoring & Assignment
            $table->integer('lead_score')->default(0);
            $table->integer('fake_lead_score')->default(0);
            $table->integer('conversion_probability')->default(0);
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            
            // Follow-up
            $table->timestamp('last_contact_at')->nullable();
            $table->timestamp('next_followup_at')->nullable();
            $table->string('contact_method')->nullable();
            
            // Notes & Tags
            $table->text('notes')->nullable();
            $table->json('tags')->nullable();
            $table->json('duplicate_flags')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('branch_id');
            $table->index('assigned_to');
            $table->index('status');
            $table->index('created_at');
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
