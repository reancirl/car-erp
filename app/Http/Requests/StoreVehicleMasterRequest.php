<?php

namespace App\Http\Requests;

use App\Services\AttributeSpecValidator;
use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleMasterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('inventory.create');
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure specs is an array
        if ($this->has('specs') && is_string($this->specs)) {
            $this->merge([
                'specs' => json_decode($this->specs, true) ?? [],
            ]);
        }

        // Ensure images is an array
        if ($this->has('images') && is_string($this->images)) {
            $this->merge([
                'images' => json_decode($this->images, true) ?? [],
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
            'make' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:' . (date('Y') + 2),
            'trim' => 'nullable|string|max:255',
            'body_type' => 'nullable|string|max:255',
            'transmission' => 'nullable|string|max:255',
            'fuel_type' => 'nullable|string|max:255',
            'drivetrain' => 'nullable|string|max:255',
            'seating' => 'nullable|integer|min:1|max:50',
            'doors' => 'nullable|integer|min:1|max:10',
            'base_price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'specs' => 'nullable|array',
            'description' => 'nullable|string|max:2000',
            'images' => 'nullable|array',
            'images.*' => 'string|url',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Validate specs against attribute definitions
            if ($this->has('specs') && is_array($this->specs) && !empty($this->specs)) {
                try {
                    $specValidator = app(AttributeSpecValidator::class);
                    $specValidator->validate($this->specs, 'master');
                } catch (\Illuminate\Validation\ValidationException $e) {
                    foreach ($e->errors() as $key => $messages) {
                        $validator->errors()->add("specs.{$key}", is_array($messages) ? $messages[0] : $messages);
                    }
                }
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'make.required' => 'Vehicle make is required.',
            'model.required' => 'Vehicle model is required.',
            'year.required' => 'Model year is required.',
            'year.integer' => 'Year must be a valid number.',
            'year.min' => 'Year must be 1900 or later.',
            'year.max' => 'Year cannot be more than 2 years in the future.',
            'seating.integer' => 'Seating capacity must be a number.',
            'seating.min' => 'Seating capacity must be at least 1.',
            'doors.integer' => 'Number of doors must be a number.',
            'base_price.numeric' => 'Base price must be a valid number.',
            'base_price.min' => 'Base price cannot be negative.',
            'currency.size' => 'Currency code must be exactly 3 characters (e.g., PHP, USD).',
            'images.*.url' => 'Each image must be a valid URL.',
        ];
    }
}
