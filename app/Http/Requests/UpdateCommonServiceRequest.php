<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCommonServiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $commonService = $this->route('common_service');

        if (! $this->user()->can('common-services.edit')) {
            return false;
        }

        if (!$this->user()->hasRole('admin') && !$this->user()->hasRole('auditor')) {
            if ($commonService->branch_id !== $this->user()->branch_id) {
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
        $currencyInput = strtoupper((string) $this->input('currency', ''));

        $this->merge([
            'currency' => $currencyInput !== '' ? $currencyInput : ($this->route('common_service')->currency ?? 'PHP'),
            'updated_by' => $this->user()->id,
        ]);

        if ($this->has('is_active')) {
            $this->merge(['is_active' => $this->boolean('is_active')]);
        }

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
        $commonServiceId = $this->route('common_service')->id;

        return [
            'name' => 'required|string|min:3|max:255',
            'code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('common_services', 'code')->ignore($commonServiceId),
            ],
            'description' => 'nullable|string|max:1000',
            'category' => 'required|in:maintenance,repair,inspection,diagnostic',
            'estimated_duration' => 'required|numeric|min:0|max:999.99',
            'standard_price' => 'required|numeric|min:0|max:9999999.99',
            'currency' => 'nullable|string|size:3',
            'is_active' => 'boolean',
            'service_type_ids' => 'nullable|array',
            'service_type_ids.*' => 'exists:service_types,id',
        ];
    }

    /**
     * Custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Service name is required.',
            'name.min' => 'Service name must be at least 3 characters.',
            'name.max' => 'Service name cannot exceed 255 characters.',
            'code.max' => 'Service code cannot exceed 50 characters.',
            'code.unique' => 'This service code is already in use.',
            'category.required' => 'Service category is required.',
            'category.in' => 'Invalid service category selected.',
            'estimated_duration.required' => 'Estimated duration is required.',
            'estimated_duration.numeric' => 'Estimated duration must be a number.',
            'estimated_duration.min' => 'Estimated duration cannot be negative.',
            'standard_price.required' => 'Standard price is required.',
            'standard_price.numeric' => 'Standard price must be a valid number.',
            'standard_price.min' => 'Standard price cannot be negative.',
            'currency.size' => 'Currency must be a 3-letter ISO code.',
            'service_type_ids.array' => 'Service type selections must be an array.',
            'service_type_ids.*.exists' => 'One or more selected service types do not exist.',
        ];
    }

    /**
     * Attribute names for validation errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'service name',
            'code' => 'service code',
            'category' => 'category',
            'estimated_duration' => 'estimated duration',
            'standard_price' => 'standard price',
            'currency' => 'currency',
            'service_type_ids' => 'service types',
        ];
    }
}
