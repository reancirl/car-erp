<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('customer.create');
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

        // Convert 'none' to null for referred_by
        if ($this->referred_by === 'none') {
            $this->merge([
                'referred_by' => null,
            ]);
        }

        // Normalize assigned_to empty string to null
        if ($this->assigned_to === '') {
            $this->merge([
                'assigned_to' => null,
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
            'first_name' => 'required|string|min:2|max:255',
            'last_name' => 'required|string|min:2|max:255',
            'email' => 'required|email:rfc,dns|max:255|unique:customers,email',
            'phone' => ['required', 'string', 'regex:/^(09|\+639)\d{9}$/'],
            'prefers_viber' => ['boolean'],
            'alternate_phone' => ['nullable', 'string', 'regex:/^(09|\+639)\d{9}$/'],
            'date_of_birth' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other,prefer_not_to_say',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'postal_code' => ['nullable', 'string', 'regex:/^\d{4}$/'],
            'country' => 'nullable|string|max:255',
            'customer_type' => 'required|in:individual,corporate',
            'customer_segment' => 'required|in:retail,fleet,puv_operator,ap_dealer,sub_dealer',
            'company_name' => 'nullable|required_if:customer_type,corporate|string|max:255',
            'tax_id' => 'nullable|string|max:50',
            'government_id_type' => 'nullable|string|max:100',
            'government_id_number' => 'nullable|string|max:100',
            'authorized_signatory' => 'nullable|string|max:255',
            'authorized_position' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive,vip,blacklisted',
            'email_notifications' => 'boolean',
            'sms_notifications' => 'boolean',
            'marketing_consent' => 'boolean',
            'assigned_to' => 'nullable|exists:users,id',
            'notes' => 'nullable|string|max:2000',
            'interest_notes' => 'nullable|string|max:2000',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
            'preferences' => 'nullable|array',
            'referred_by' => 'nullable|exists:customers,id',
            'referral_source' => 'nullable|string|max:255',
            'lead_source' => 'nullable|in:walk_in,facebook,ap,referral,event,other',
            'preferred_vehicle_model_id' => 'nullable|exists:vehicle_models,id',
            'reservation_amount' => 'nullable|numeric|min:0',
            'reservation_date' => 'nullable|date',
            'reservation_status' => 'nullable|in:pending,confirmed,cancelled,converted',
            'reservation_reference' => 'nullable|string|max:255',
            'reservation_unit_id' => 'nullable|exists:vehicle_units,id',
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
            'first_name.required' => 'First name is required.',
            'first_name.min' => 'First name must be at least 2 characters.',
            'last_name.required' => 'Last name is required.',
            'last_name.min' => 'Last name must be at least 2 characters.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email is already registered.',
            'phone.required' => 'Phone number is required.',
            'phone.regex' => 'Phone number must be a valid Philippine mobile number (e.g., 09171234567 or +639171234567).',
            'alternate_phone.regex' => 'Alternate phone must be a valid Philippine mobile number (e.g., 09171234567 or +639171234567).',
            'postal_code.regex' => 'Postal code must be a valid 4-digit Philippine ZIP code (e.g., 1000).',
            'date_of_birth.before' => 'Date of birth must be in the past.',
            'customer_type.required' => 'Customer type is required.',
            'company_name.required_if' => 'Company name is required for corporate customers.',
            'status.required' => 'Customer status is required.',
            'assigned_to.exists' => 'Selected relationship manager does not exist.',
            'referred_by.exists' => 'Selected referring customer does not exist.',
            'branch_id.required' => 'Branch is required.',
            'branch_id.exists' => 'Selected branch does not exist.',
        ];
    }
}
