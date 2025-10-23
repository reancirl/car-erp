<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVehicleStatusRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('inventory.edit');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['in_stock', 'reserved', 'sold', 'in_transit', 'transferred', 'disposed'])],
            'sold_date' => 'nullable|required_if:status,sold|date|before_or_equal:today',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Validate sold_date is only provided when status is 'sold'
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
            'status.required' => 'Status is required.',
            'status.in' => 'Invalid status value.',
            'sold_date.required_if' => 'Sold date is required when status is "sold".',
            'sold_date.date' => 'Sold date must be a valid date.',
            'sold_date.before_or_equal' => 'Sold date cannot be in the future.',
        ];
    }
}
