<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('sales.create');
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Auto-assign branch for non-admin users
        if (!auth()->user()->hasRole('admin')) {
            $this->merge([
                'branch_id' => auth()->user()->branch_id,
            ]);
        }
        
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
        $rules = [
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
            'next_followup_at' => 'nullable|date|after:now',
            'contact_method' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:2000',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
        ];

        // Admin can choose branch, non-admin gets auto-filled
        if ($this->user()->hasRole('admin')) {
            $rules['branch_id'] = 'required|exists:branches,id';
        }

        return $rules;
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
            'next_followup_at.after' => 'Follow-up date must be in the future.',
            'branch_id.required' => 'Branch is required.',
            'branch_id.exists' => 'Selected branch does not exist.',
        ];
    }
}
