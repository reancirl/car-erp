<?php

namespace App\Http\Requests;

use App\Services\AttributeSpecValidator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVehicleUnitRequest extends FormRequest
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
        // Auto-assign branch for non-admin users
        if (!auth()->user()->hasRole(['admin', 'auditor'])) {
            $this->merge([
                'branch_id' => auth()->user()->branch_id,
            ]);
        }

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

        // Default location to branch if not provided
        if (!$this->has('location')) {
            $this->merge([
                'location' => 'branch',
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
            'vehicle_model_id' => 'required|exists:vehicle_models,id',
            'assigned_user_id' => 'nullable|exists:users,id',
            'owner_id' => 'nullable|exists:customers,id',
            'vin' => 'required|string|max:17|unique:vehicle_units,vin',
            'stock_number' => 'required|string|max:255|unique:vehicle_units,stock_number',
            'conduction_no' => 'nullable|string|max:255',
            'drive_motor_no' => 'nullable|string|max:255',
            'plate_no' => 'nullable|string|max:255',
            'variant' => 'nullable|string|max:255',
            'variant_spec' => 'nullable|string|max:255',
            'status' => ['required', Rule::in(['in_stock', 'reserved', 'sold', 'in_transit', 'transferred', 'disposed'])],
            'location' => ['required', Rule::in(['warehouse', 'gbf', 'branch', 'sold'])],
            'sub_status' => ['nullable', Rule::in(['reserved_with_dp', 'reserved_no_dp', 'for_lto', 'for_release', 'for_body_repair', 'inspection'])],
            'is_locked' => 'boolean',
            'purchase_price' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'msrp_price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'acquisition_date' => 'nullable|date|before_or_equal:today',
            'sold_date' => 'nullable|date|after_or_equal:acquisition_date',
            'specs' => 'nullable|array',
            'notes' => 'nullable|string|max:2000',
            'photos' => 'nullable|array|max:10',
            'photos.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'documents' => 'nullable|array|max:10',
            'documents.*' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx|max:10240',
            'color_exterior' => 'nullable|string|max:255',
            'color_interior' => 'nullable|string|max:255',
            'color_code' => 'nullable|string|max:255',
            'odometer' => 'nullable|integer|min:0',
            'battery_capacity' => 'nullable|numeric|min:0',
            'battery_range_km' => 'nullable|integer|min:0',
            'lto_transaction_no' => 'nullable|string|max:255',
            'cr_no' => 'nullable|string|max:255',
            'or_cr_release_date' => 'nullable|date',
            'emission_reference' => 'nullable|string|max:255',
        ];

        // Admin/auditor can choose branch, non-admin gets auto-filled
        if ($this->user()->hasRole(['admin', 'auditor'])) {
            $rules['branch_id'] = 'required|exists:branches,id';
        }

        return $rules;
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
            if ($this->sold_date && $this->status !== 'sold') {
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
