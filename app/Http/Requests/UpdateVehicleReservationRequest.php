<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVehicleReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('sales.edit');
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

        return [
            'branch_id' => ['sometimes', 'required', 'exists:branches,id'],
            'handled_by_branch_id' => ['nullable', 'exists:branches,id'],
            'reservation_date' => ['sometimes', 'required', 'date'],
            'payment_type' => ['sometimes', 'required', Rule::in($paymentTypes)],
            'target_release_date' => ['nullable', 'date', 'after_or_equal:reservation_date'],
            'status' => ['sometimes', 'required', Rule::in(['pending', 'confirmed', 'cancelled', 'released'])],
            'remarks' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.in' => 'Invalid status value.',
            'target_release_date.after_or_equal' => 'Target release date cannot be before the reservation date.',
        ];
    }
}
