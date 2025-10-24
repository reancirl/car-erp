<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCommonServiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('common-services.create');
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $user = $this->user();

        if (!$user->hasRole('admin') && !$user->hasRole('auditor')) {
            $this->merge(['branch_id' => $user->branch_id]);
        }

        $currencyInput = strtoupper((string) $this->input('currency', ''));

        $this->merge([
            'currency' => $currencyInput !== '' ? $currencyInput : 'PHP',
            'is_active' => $this->boolean('is_active', true),
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'branch_id' => 'required|exists:branches,id',
            'name' => 'required|string|min:3|max:255',
            'code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('common_services', 'code'),
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
     * Custom validation error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'branch_id.required' => 'Please select a branch.',
            'branch_id.exists' => 'Selected branch does not exist.',
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
     * Human readable attribute names.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'branch_id' => 'branch',
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
