<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransferVehicleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only admin, inventory managers, and auditors can transfer vehicles
        return $this->user()->can('inventory.edit') && 
               $this->user()->hasRole(['admin', 'auditor', 'parts_head']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'to_branch_id' => 'required|exists:branches,id',
            'transfer_date' => 'required|date|before_or_equal:today',
            'remarks' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'to_branch_id.required' => 'Destination branch is required.',
            'to_branch_id.exists' => 'Selected destination branch does not exist.',
            'transfer_date.required' => 'Transfer date is required.',
            'transfer_date.date' => 'Transfer date must be a valid date.',
            'transfer_date.before_or_equal' => 'Transfer date cannot be in the future.',
            'remarks.max' => 'Remarks cannot exceed 1000 characters.',
        ];
    }
}
