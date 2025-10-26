<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;

class UpdateWorkOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $workOrder = $this->route('pms_work_order');

        // Check permission
        if (!$this->user()->can('pms-work-orders.edit')) {
            return false;
        }

        // Branch-level authorization: non-admin users can only edit their branch's work orders
        if (!$this->user()->hasAnyRole(['admin', 'auditor'])) {
            if ($workOrder->branch_id !== $this->user()->branch_id) {
                return false;
            }

            if ($this->user()->hasRole('technician') && $workOrder->assigned_to !== $this->user()->id) {
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

        $isTechnician = auth()->user()?->hasRole('technician');

        if ($isTechnician) {
            $this->replace([
                'diagnostic_findings' => $this->input('diagnostic_findings'),
                'notes' => $this->input('notes'),
                'updated_by' => auth()->id(),
            ]);

            return;
        }

        // Recalculate next PMS due based on interval if mileage changed
        if ($this->has('current_mileage') && $this->has('pms_interval_km')) {
            $this->merge([
                'next_pms_due_mileage' => $this->current_mileage + $this->pms_interval_km,
            ]);
        }

        // Update next due date if scheduled date changed
        if ($this->filled('scheduled_at')) {
            $intervalMonthsInput = $this->input('time_interval_months');
            $intervalMonths = is_numeric($intervalMonthsInput) && $intervalMonthsInput > 0
                ? (int) $intervalMonthsInput
                : 6;

            $nextDueDate = Carbon::parse($this->scheduled_at)->addMonths($intervalMonths);
            $this->merge([
                'time_interval_months' => $intervalMonths,
                'next_pms_due_date' => $nextDueDate,
            ]);
        }

        // Mark timestamps when status changes to specific states
        if ($this->has('status')) {
            $workOrder = $this->route('pms_work_order');

            if ($this->status === 'in_progress' && $workOrder->status !== 'in_progress') {
                $this->merge(['started_at' => now()]);
            }

            if ($this->status === 'completed' && $workOrder->status !== 'completed') {
                $this->merge([
                    'completed_at' => now(),
                    'completion_percentage' => 100,
                ]);
            }
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $workOrder = $this->route('pms_work_order');

        if ($this->user()->hasRole('technician')) {
            return [
                'diagnostic_findings' => 'nullable|string|max:2000',
                'notes' => 'nullable|string|max:2000',
            ];
        }

        $rules = [
            // Branch is NOT updatable (data isolation)
            // 'branch_id' is intentionally omitted

            // Service relationship
            'service_type_id' => 'nullable|exists:service_types,id',

            // Identifiers
            'reference_number' => 'nullable|string|max:255',

            // Vehicle details
            'vehicle_plate_number' => 'nullable|string|max:255',
            'vehicle_vin' => 'required|string|max:255',
            'vehicle_make' => 'required|string|max:255',
            'vehicle_model' => 'required|string|max:255',
            'vehicle_year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'current_mileage' => 'required|integer|min:0|max:9999999',
            'last_service_mileage' => 'nullable|integer|min:0|max:9999999',

            // Customer details
            'customer_name' => 'required|string|min:2|max:255',
            'customer_phone' => 'required|string|min:10|max:20',
            'customer_email' => 'nullable|email|max:255',
            'customer_type' => 'required|in:individual,corporate',

            // Scheduling & status
            'status' => 'required|in:draft,pending,scheduled,confirmed,in_progress,completed,cancelled,overdue',
            'priority' => 'required|in:low,normal,high,urgent',
            'scheduled_at' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:scheduled_at',
            'started_at' => 'nullable|date',
            'completed_at' => 'nullable|date',

            // Assignment
            'assigned_to' => 'nullable|exists:users,id',
            'assigned_technician_name' => 'nullable|string|max:255',

            // Estimates & actuals
            'estimated_hours' => 'nullable|numeric|min:0|max:999.99',
            'actual_hours' => 'nullable|numeric|min:0|max:999.99',
            'estimated_cost' => 'nullable|numeric|min:0|max:9999999.99',
            'actual_cost' => 'nullable|numeric|min:0|max:9999999.99',
            'completion_percentage' => 'nullable|integer|min:0|max:100',

            // PMS Interval tracking
            'pms_interval_km' => 'required|integer|min:1000|max:50000',
            'time_interval_months' => 'nullable|integer|min:1|max:24',

            // Service location
            'service_location_lat' => 'nullable|numeric|between:-90,90',
            'service_location_lng' => 'nullable|numeric|between:-180,180',
            'service_location_address' => 'nullable|string|max:500',

            // Metadata
            'is_warranty_claim' => 'nullable|boolean',
            'customer_concerns' => 'nullable|string|max:2000',
            'diagnostic_findings' => 'nullable|string|max:2000',
            'notes' => 'nullable|string|max:2000',

            // Fraud prevention (only updatable by supervisors)
            'verification_status' => 'nullable|in:pending,verified,flagged,rejected',
            'odometer_verified' => 'nullable|boolean',
            'location_verified' => 'nullable|boolean',
        ];

        // Validate mileage logic
        if ($this->has('last_service_mileage') && $this->has('current_mileage')) {
            $rules['current_mileage'] .= '|gte:last_service_mileage';
        }

        // Only allow VIN change if it's not already verified (prevent fraud)
        if ($workOrder->odometer_verified || $workOrder->verification_status === 'verified') {
            // VIN should not be changeable after verification
            $rules['vehicle_vin'] .= '|in:' . $workOrder->vehicle_vin;
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
            'vehicle_vin.required' => 'Vehicle VIN is required.',
            'vehicle_vin.in' => 'VIN cannot be changed after verification.',

            'current_mileage.required' => 'Current mileage is required.',
            'current_mileage.gte' => 'Current mileage must be greater than or equal to last service mileage.',

            'customer_name.required' => 'Customer name is required.',
            'customer_phone.required' => 'Customer phone is required.',

            'status.required' => 'Status is required.',
            'priority.required' => 'Priority is required.',

            'pms_interval_km.required' => 'PMS interval is required.',
            'pms_interval_km.min' => 'PMS interval must be at least 1000 km.',

            'completion_percentage.max' => 'Completion percentage cannot exceed 100%.',
            'completion_percentage.min' => 'Completion percentage cannot be negative.',

            'due_date.after_or_equal' => 'Due date must be on or after the scheduled date.',
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
            'vehicle_vin' => 'VIN',
            'vehicle_plate_number' => 'plate number',
            'current_mileage' => 'current mileage',
            'customer_name' => 'customer name',
            'customer_phone' => 'phone number',
            'pms_interval_km' => 'PMS interval',
            'verification_status' => 'verification status',
        ];
    }
}
