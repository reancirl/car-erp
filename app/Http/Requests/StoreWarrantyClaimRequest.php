<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWarrantyClaimRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('warranty.create');
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

        // Auto-assign created_by
        $this->merge([
            'created_by' => auth()->id(),
        ]);

        // Convert empty strings to null
        $nullableFields = ['assigned_to', 'incident_date',
                          'warranty_number', 'warranty_start_date', 'warranty_end_date',
                          'odometer_reading', 'diagnosis', 'repair_actions', 'notes'];

        foreach ($nullableFields as $field) {
            if ($this->{$field} === '' || $this->{$field} === 'unassigned') {
                $this->merge([$field => null]);
            }
        }

        // Default currency to PHP
        $currencyInput = strtoupper((string) $this->input('currency', ''));
        $this->merge([
            'currency' => $currencyInput !== '' ? $currencyInput : 'PHP',
        ]);

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
        $rules = [
            // Basic claim info
            'claim_type' => 'required|in:parts,labor,both',
            'claim_date' => 'required|date|before_or_equal:today',
            'incident_date' => 'nullable|date|before_or_equal:today',
            'failure_description' => 'required|string|min:10|max:1000',
            'diagnosis' => 'nullable|string|max:2000',
            'repair_actions' => 'nullable|string|max:2000',

            // Customer & Vehicle
            'customer_id' => 'required|exists:customers,id',
            'vehicle_unit_id' => 'required|exists:vehicle_units,id',
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
            'currency' => 'required|string|size:3',

            // Assignment
            'assigned_to' => 'nullable|exists:users,id',
            'notes' => 'nullable|string|max:2000',

            // Parts array
            'parts' => 'nullable|array',
            'parts.*.part_inventory_id' => 'required|exists:parts_inventory,id',
            'parts.*.part_name' => 'required|string|max:255',
            'parts.*.part_number' => 'nullable|string|max:255',
            'parts.*.description' => 'nullable|string|max:500',
            'parts.*.quantity' => 'required|integer|min:1|max:9999',
            'parts.*.unit_price' => 'required|numeric|min:0|max:99999999.99',

            // Services array
            'services' => 'nullable|array',
            'services.*.service_type_id' => 'required|exists:service_types,id',
            'services.*.service_name' => 'required|string|max:255',
            'services.*.service_code' => 'nullable|string|max:255',
            'services.*.description' => 'nullable|string|max:500',
            'services.*.labor_hours' => 'required|numeric|min:0.01|max:999.99',
            'services.*.labor_rate' => 'required|numeric|min:0|max:99999999.99',
        ];

        // Admin can choose branch, non-admin gets auto-filled
        if ($this->user()->hasRole('admin') || $this->user()->hasRole('auditor')) {
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
            'claim_type.required' => 'Claim type is required.',
            'claim_date.required' => 'Claim date is required.',
            'claim_date.before_or_equal' => 'Claim date cannot be in the future.',
            'incident_date.before_or_equal' => 'Incident date cannot be in the future.',
            'failure_description.required' => 'Failure description is required.',
            'failure_description.min' => 'Failure description must be at least 10 characters.',
            'customer_id.required' => 'Customer is required.',
            'customer_id.exists' => 'Selected customer does not exist.',
            'vehicle_unit_id.required' => 'Vehicle is required.',
            'vehicle_unit_id.exists' => 'Selected vehicle does not exist.',
            'warranty_end_date.after' => 'Warranty end date must be after start date.',
            'status.required' => 'Claim status is required.',
            'assigned_to.exists' => 'Selected user does not exist.',
            'branch_id.required' => 'Branch is required.',
            'branch_id.exists' => 'Selected branch does not exist.',

            // Parts validation messages
            'parts.*.part_inventory_id.required' => 'Please select an inventory part for each entry.',
            'parts.*.part_name.required' => 'Part name is required for all parts.',
            'parts.*.quantity.required' => 'Part quantity is required.',
            'parts.*.quantity.min' => 'Part quantity must be at least 1.',
            'parts.*.unit_price.required' => 'Part unit price is required.',

            // Services validation messages
            'services.*.service_type_id.required' => 'Please select a service type for each entry.',
            'services.*.service_name.required' => 'Service name is required for all services.',
            'services.*.labor_hours.required' => 'Labor hours is required.',
            'services.*.labor_hours.min' => 'Labor hours must be at least 0.01.',
            'services.*.labor_rate.required' => 'Labor rate is required.',
        ];
    }
}
