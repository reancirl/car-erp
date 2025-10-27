<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWarrantyClaimRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $claim = $this->route('warranty_claim');

        // Check permission
        if (!$this->user()->can('service.edit')) {
            return false;
        }

        // Branch-level authorization (non-admin users can only edit their branch's claims)
        if (!$this->user()->hasRole('admin') && $claim->branch_id !== $this->user()->branch_id) {
            return false;
        }

        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Auto-assign updated_by
        $this->merge([
            'updated_by' => auth()->id(),
        ]);

        // Convert empty strings to null
        $nullableFields = ['customer_id', 'vehicle_unit_id', 'assigned_to', 'incident_date',
                          'warranty_number', 'warranty_start_date', 'warranty_end_date',
                          'odometer_reading', 'diagnosis', 'repair_actions', 'notes',
                          'approved_amount', 'submission_date', 'decision_date',
                          'decision_by', 'rejection_reason'];

        foreach ($nullableFields as $field) {
            if ($this->{$field} === '' || $this->{$field} === 'unassigned') {
                $this->merge([$field => null]);
            }
        }

        // Default amounts to 0 if not provided
        $this->merge([
            'parts_claimed_amount' => $this->parts_claimed_amount ?? 0,
            'labor_claimed_amount' => $this->labor_claimed_amount ?? 0,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Basic claim info (branch_id is NOT editable)
            'claim_type' => 'required|in:parts,labor,both',
            'claim_date' => 'required|date|before_or_equal:today',
            'incident_date' => 'nullable|date|before_or_equal:today',
            'failure_description' => 'required|string|min:10|max:1000',
            'diagnosis' => 'nullable|string|max:2000',
            'repair_actions' => 'nullable|string|max:2000',

            // Customer & Vehicle
            'customer_id' => 'nullable|exists:customers,id',
            'vehicle_unit_id' => 'nullable|exists:vehicle_units,id',
            'odometer_reading' => 'nullable|integer|min:0|max:9999999',

            // Warranty info
            'warranty_type' => 'nullable|string|max:100',
            'warranty_provider' => 'nullable|string|max:255',
            'warranty_number' => 'nullable|string|max:255',
            'warranty_start_date' => 'nullable|date',
            'warranty_end_date' => 'nullable|date|after:warranty_start_date',

            // Status and financial
            'status' => 'required|in:draft,submitted,under_review,approved,partially_approved,rejected,paid,closed',
            'parts_claimed_amount' => 'required|numeric|min:0|max:99999999.99',
            'labor_claimed_amount' => 'required|numeric|min:0|max:99999999.99',
            'approved_amount' => 'nullable|numeric|min:0|max:99999999.99',
            'currency' => 'required|string|size:3',

            // Decision info
            'submission_date' => 'nullable|date',
            'decision_date' => 'nullable|date|after_or_equal:submission_date',
            'decision_by' => 'nullable|string|max:255',
            'rejection_reason' => 'nullable|string|max:2000',

            // Assignment
            'assigned_to' => 'nullable|exists:users,id',
            'notes' => 'nullable|string|max:2000',

            // Parts array
            'parts' => 'nullable|array',
            'parts.*.part_inventory_id' => 'nullable|exists:parts_inventory,id',
            'parts.*.part_name' => 'required|string|max:255',
            'parts.*.part_number' => 'nullable|string|max:255',
            'parts.*.description' => 'nullable|string|max:500',
            'parts.*.quantity' => 'required|integer|min:1|max:9999',
            'parts.*.unit_price' => 'required|numeric|min:0|max:99999999.99',
            'parts.*.claim_status' => 'nullable|in:pending,approved,rejected,partial',
            'parts.*.approved_quantity' => 'nullable|numeric|min:0|max:9999',
            'parts.*.approved_amount' => 'nullable|numeric|min:0|max:99999999.99',

            // Services array
            'services' => 'nullable|array',
            'services.*.service_type_id' => 'nullable|exists:service_types,id',
            'services.*.service_name' => 'required|string|max:255',
            'services.*.service_code' => 'nullable|string|max:255',
            'services.*.description' => 'nullable|string|max:500',
            'services.*.labor_hours' => 'required|numeric|min:0.01|max:999.99',
            'services.*.labor_rate' => 'required|numeric|min:0|max:99999999.99',
            'services.*.claim_status' => 'nullable|in:pending,approved,rejected,partial',
            'services.*.approved_hours' => 'nullable|numeric|min:0|max:999.99',
            'services.*.approved_amount' => 'nullable|numeric|min:0|max:99999999.99',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'claim_type.required' => 'Claim type is required.',
            'claim_date.required' => 'Claim date is required.',
            'claim_date.before_or_equal' => 'Claim date cannot be in the future.',
            'incident_date.before_or_equal' => 'Incident date cannot be in the future.',
            'failure_description.required' => 'Failure description is required.',
            'failure_description.min' => 'Failure description must be at least 10 characters.',
            'customer_id.exists' => 'Selected customer does not exist.',
            'vehicle_unit_id.exists' => 'Selected vehicle does not exist.',
            'warranty_end_date.after' => 'Warranty end date must be after start date.',
            'decision_date.after_or_equal' => 'Decision date must be after or equal to submission date.',
            'status.required' => 'Claim status is required.',
            'assigned_to.exists' => 'Selected user does not exist.',

            // Parts validation messages
            'parts.*.part_name.required' => 'Part name is required for all parts.',
            'parts.*.quantity.required' => 'Part quantity is required.',
            'parts.*.quantity.min' => 'Part quantity must be at least 1.',
            'parts.*.unit_price.required' => 'Part unit price is required.',

            // Services validation messages
            'services.*.service_name.required' => 'Service name is required for all services.',
            'services.*.labor_hours.required' => 'Labor hours is required.',
            'services.*.labor_hours.min' => 'Labor hours must be at least 0.01.',
            'services.*.labor_rate.required' => 'Labor rate is required.',
        ];
    }
}
