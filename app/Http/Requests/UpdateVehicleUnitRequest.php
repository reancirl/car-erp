<?php

namespace App\Http\Requests;

use App\Services\AttributeSpecValidator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVehicleUnitRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('inventory.edit');
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
        $unitId = $this->route('unit');

        return [
            'vehicle_master_id' => 'sometimes|required|exists:vehicle_masters,id',
            'vin' => ['sometimes', 'required', 'string', 'max:17', Rule::unique('vehicle_units', 'vin')->ignore($unitId)],
            'stock_number' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('vehicle_units', 'stock_number')->ignore($unitId)],
            'status' => ['sometimes', 'required', Rule::in(['in_stock', 'reserved', 'sold', 'in_transit', 'transferred', 'disposed'])],
            'purchase_price' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'acquisition_date' => 'nullable|date|before_or_equal:today',
            'sold_date' => 'nullable|date|after_or_equal:acquisition_date',
            'specs' => 'nullable|array',
            'notes' => 'nullable|string|max:2000',
            'images' => 'nullable|array',
            'images.*' => 'string|url',
            'color_exterior' => 'nullable|string|max:255',
            'color_interior' => 'nullable|string|max:255',
            'odometer' => 'nullable|integer|min:0',
            'branch_id' => 'sometimes|required|exists:branches,id',
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
                    $specValidator->validate($this->specs, 'unit');
                } catch (\Illuminate\Validation\ValidationException $e) {
                    foreach ($e->errors() as $key => $messages) {
                        $validator->errors()->add("specs.{$key}", is_array($messages) ? $messages[0] : $messages);
                    }
                }
            }

            // Validate sold_date is only set when status is 'sold'
            if ($this->has('sold_date') && $this->sold_date && $this->has('status') && $this->status !== 'sold') {
                $validator->errors()->add('sold_date', 'Sold date can only be set when status is "sold".');
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'vehicle_master_id.required' => 'Vehicle master is required.',
            'vehicle_master_id.exists' => 'Selected vehicle master does not exist.',
            'vin.required' => 'VIN (Vehicle Identification Number) is required.',
            'vin.unique' => 'This VIN is already registered in the system.',
            'vin.max' => 'VIN cannot exceed 17 characters.',
            'stock_number.required' => 'Stock number is required.',
            'stock_number.unique' => 'This stock number is already in use.',
            'status.required' => 'Status is required.',
            'status.in' => 'Invalid status value.',
            'purchase_price.numeric' => 'Purchase price must be a valid number.',
            'purchase_price.min' => 'Purchase price cannot be negative.',
            'sale_price.numeric' => 'Sale price must be a valid number.',
            'sale_price.min' => 'Sale price cannot be negative.',
            'currency.size' => 'Currency code must be exactly 3 characters (e.g., PHP, USD).',
            'acquisition_date.date' => 'Acquisition date must be a valid date.',
            'acquisition_date.before_or_equal' => 'Acquisition date cannot be in the future.',
            'sold_date.date' => 'Sold date must be a valid date.',
            'sold_date.after_or_equal' => 'Sold date must be on or after acquisition date.',
            'odometer.integer' => 'Odometer reading must be a number.',
            'odometer.min' => 'Odometer reading cannot be negative.',
            'branch_id.required' => 'Branch is required.',
            'branch_id.exists' => 'Selected branch does not exist.',
            'images.*.url' => 'Each image must be a valid URL.',
        ];
    }
}
