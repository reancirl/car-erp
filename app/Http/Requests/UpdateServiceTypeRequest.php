<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceTypeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $serviceType = $this->route('service_type');

        // Check permission
        if (!$this->user()->can('service-types.edit')) {
            return false;
        }

        // Check branch-level authorization (non-admin can only edit their branch records)
        if (!$this->user()->hasRole('admin') && !$this->user()->hasRole('auditor')) {
            if ($serviceType->branch_id !== $this->user()->branch_id) {
                return false;
            }
        }

        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Auto-assign updated_by
        $this->merge(['updated_by' => auth()->id()]);

        // Force PHP currency when field is empty
        $currencyInput = strtoupper((string) $this->input('currency', ''));
        $this->merge([
            'currency' => $currencyInput !== '' ? $currencyInput : ($this->route('service_type')->currency ?? 'PHP'),
        ]);

        // Branch ID cannot be changed, ensure it's not in the request
        if ($this->has('branch_id')) {
            $this->request->remove('branch_id');
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $serviceTypeId = $this->route('service_type')->id;

        $rules = [
            // Basic Information
            'name' => 'required|string|min:3|max:255',
            'code' => 'nullable|string|max:50|unique:service_types,code,' . $serviceTypeId,
            'description' => 'nullable|string|max:1000',

            // Category & Classification
            'category' => 'required|in:maintenance,repair,warranty,inspection,diagnostic',

            // Service Intervals
            'interval_type' => 'required|in:mileage,time,on_demand',
            'interval_value' => 'nullable|integer|min:1|max:999999',

            // Pricing & Duration
            'estimated_duration' => 'nullable|numeric|min:0|max:999.99',
            'base_price' => 'required|numeric|min:0|max:9999999.99',
            'currency' => 'nullable|string|size:3',

            // Status & Availability
            'status' => 'required|in:active,inactive,discontinued',
            'is_available' => 'nullable|boolean',

            // Common Services (many-to-many)
            'common_service_ids' => 'nullable|array',
            'common_service_ids.*' => 'exists:common_services,id',
        ];

        // Conditional: interval_value is required for mileage/time based services
        if (in_array($this->interval_type, ['mileage', 'time'])) {
            $rules['interval_value'] = 'required|integer|min:1|max:999999';
        }

        return $rules;
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Service type name is required.',
            'name.min' => 'Service type name must be at least 3 characters.',
            'name.max' => 'Service type name cannot exceed 255 characters.',

            'code.unique' => 'This service type code already exists.',
            'code.max' => 'Service type code cannot exceed 50 characters.',

            'category.required' => 'Please select a service category.',
            'category.in' => 'Invalid service category selected.',

            'interval_type.required' => 'Please select a service interval type.',
            'interval_type.in' => 'Invalid interval type selected.',

            'interval_value.required' => 'Interval value is required for mileage/time-based services.',
            'interval_value.integer' => 'Interval value must be a whole number.',
            'interval_value.min' => 'Interval value must be at least 1.',

            'estimated_duration.numeric' => 'Estimated duration must be a number.',
            'estimated_duration.min' => 'Estimated duration cannot be negative.',

            'base_price.required' => 'Base price is required.',
            'base_price.numeric' => 'Base price must be a valid number.',
            'base_price.min' => 'Base price cannot be negative.',

            'status.required' => 'Service type status is required.',
            'status.in' => 'Invalid status selected.',

            'common_service_ids.array' => 'Common services must be provided as an array.',
            'common_service_ids.*.exists' => 'One or more selected common services do not exist.',
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'service type name',
            'code' => 'service type code',
            'category' => 'category',
            'interval_type' => 'interval type',
            'interval_value' => 'interval value',
            'estimated_duration' => 'estimated duration',
            'base_price' => 'base price',
            'status' => 'status',
            'common_service_ids' => 'common services',
        ];
    }
}
