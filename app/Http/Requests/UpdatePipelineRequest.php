<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePipelineRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $pipeline = $this->route('pipeline');
        
        // Check if user has permission to edit sales
        if (!$this->user()->can('sales.edit')) {
            return false;
        }

        // Non-admin can only edit pipelines from their own branch
        if (!$this->user()->hasRole('admin') && $pipeline->branch_id !== $this->user()->branch_id) {
            return false;
        }

        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert 'unassigned' string to null for sales_rep_id
        if ($this->sales_rep_id === 'unassigned') {
            $this->merge([
                'sales_rep_id' => null,
            ]);
        }
        
        // Convert empty string to null for vehicle_model_id
        if ($this->vehicle_model_id === '') {
            $this->merge([
                'vehicle_model_id' => null,
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_name' => 'required|string|min:2|max:255',
            'customer_phone' => 'required|string|regex:/^\+?63[-\s]?[0-9]{1,2}[-\s]?[0-9]{3,4}[-\s]?[0-9]{4}$/',
            'customer_email' => 'nullable|email:rfc,dns|max:255',
            'sales_rep_id' => 'nullable|exists:users,id',
            'vehicle_interest' => 'nullable|string|max:255',
            'vehicle_model_id' => 'nullable|exists:vehicle_models,id',
            'quote_amount' => 'nullable|numeric|min:0|max:99999999.99',
            'current_stage' => 'required|in:lead,qualified,quote_sent,test_drive_scheduled,test_drive_completed,reservation_made,lost,won',
            'probability' => 'required|integer|min:0|max:100',
            'priority' => 'required|in:low,medium,high,urgent',
            'next_action' => 'nullable|string|max:255',
            'next_action_due' => 'nullable|date',
            'auto_progression_enabled' => 'nullable|boolean',
            'auto_loss_rule_enabled' => 'nullable|boolean',
            'follow_up_frequency' => 'nullable|in:daily,weekly,biweekly,monthly',
            'notes' => 'nullable|string|max:2000',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
            // Note: branch_id is NOT updatable after creation
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'customer_name.required' => 'Customer name is required.',
            'customer_name.min' => 'Customer name must be at least 2 characters.',
            'customer_phone.required' => 'Phone number is required.',
            'customer_phone.regex' => 'Please enter a valid Philippine phone number format (e.g., +63-2-8123-4567 or +63-917-123-4567).',
            'customer_email.email' => 'Please enter a valid email address.',
            'current_stage.required' => 'Pipeline stage is required.',
            'current_stage.in' => 'Invalid pipeline stage selected.',
            'probability.required' => 'Probability is required.',
            'probability.min' => 'Probability must be at least 0%.',
            'probability.max' => 'Probability cannot exceed 100%.',
            'priority.required' => 'Priority is required.',
            'sales_rep_id.exists' => 'Selected sales representative does not exist.',
        ];
    }
}
