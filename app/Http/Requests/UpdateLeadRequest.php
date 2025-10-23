<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLeadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $lead = $this->route('lead');
        
        // Check if user has permission to edit sales
        if (!$this->user()->can('sales.edit')) {
            return false;
        }

        // Non-admin can only edit leads from their own branch
        if (!$this->user()->hasRole('admin') && $lead->branch_id !== $this->user()->branch_id) {
            return false;
        }

        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert 'unassigned' string to null for assigned_to
        if ($this->assigned_to === 'unassigned') {
            $this->merge([
                'assigned_to' => null,
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
            'name' => 'required|string|min:2|max:255',
            'email' => 'required|email:rfc,dns|max:255',
            'phone' => 'required|string|min:10|max:20',
            'location' => 'nullable|string|max:255',
            'ip_address' => 'nullable|ip',
            'source' => 'required|in:web_form,phone,walk_in,referral,social_media',
            'status' => 'required|in:new,contacted,qualified,hot,unqualified,lost',
            'priority' => 'required|in:low,medium,high,urgent',
            'vehicle_interest' => 'nullable|string|max:255',
            'vehicle_variant' => 'nullable|string|max:100',
            'vehicle_model_id' => 'nullable|exists:vehicle_models,id',
            'budget_min' => 'nullable|numeric|min:0|max:99999999.99',
            'budget_max' => 'nullable|numeric|min:0|max:99999999.99|gte:budget_min',
            'purchase_timeline' => 'nullable|in:immediate,soon,month,quarter,exploring',
            'assigned_to' => 'nullable|exists:users,id',
            'last_contact_at' => 'nullable|date',
            'next_followup_at' => 'nullable|date',
            'contact_method' => 'nullable|string|max:255',
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
            'name.required' => 'Lead name is required.',
            'name.min' => 'Lead name must be at least 2 characters.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'phone.required' => 'Phone number is required.',
            'source.required' => 'Lead source is required.',
            'source.in' => 'Invalid lead source selected.',
            'status.required' => 'Lead status is required.',
            'budget_max.gte' => 'Maximum budget must be greater than or equal to minimum budget.',
            'assigned_to.exists' => 'Selected sales representative does not exist.',
        ];
    }
}
