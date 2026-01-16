<?php

namespace App\Http\Requests;

use App\Models\VehicleUnit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVehicleReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('sales.create');
    }

    protected function prepareForValidation(): void
    {
        if (! $this->user()->hasRole(['admin', 'auditor']) && $this->user()->branch_id) {
            $this->merge([
                'branch_id' => $this->user()->branch_id,
            ]);
        }

        if (! $this->filled('target_release_date')) {
            $this->merge(['target_release_date' => null]);
        }

        if (! $this->filled('handled_by_branch_id')) {
            $this->merge(['handled_by_branch_id' => null]);
        }
    }

    public function rules(): array
    {
        $paymentTypes = ['cash', 'bank_transfer', 'gcash', 'credit_card', 'check', 'other'];

        $rules = [
            'customer_id' => ['required', 'exists:customers,id'],
            'vehicle_unit_id' => ['required', 'exists:vehicle_units,id'],
            'branch_id' => ['required', 'exists:branches,id'],
            'handled_by_branch_id' => ['nullable', 'exists:branches,id'],
            'reservation_date' => ['required', 'date'],
            'payment_type' => ['required', Rule::in($paymentTypes)],
            'target_release_date' => ['nullable', 'date', 'after_or_equal:reservation_date'],
            'remarks' => ['nullable', 'string', 'max:2000'],
        ];

        return $rules;
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if (! $this->vehicle_unit_id) {
                return;
            }

            $unit = VehicleUnit::find($this->vehicle_unit_id);
            if (! $unit) {
                return;
            }

            if (in_array($unit->status, ['sold', 'disposed'])) {
                $validator->errors()->add('vehicle_unit_id', 'Selected unit is already sold/disposed.');
            }

            if ($unit->is_locked) {
                $validator->errors()->add('vehicle_unit_id', 'Selected unit is locked and cannot be reserved.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'customer_id.required' => 'Customer is required.',
            'vehicle_unit_id.required' => 'Unit selection is required.',
            'payment_type.in' => 'Invalid payment type selected.',
            'target_release_date.after_or_equal' => 'Target release date cannot be before the reservation date.',
        ];
    }
}
