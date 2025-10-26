<?php

namespace App\Http\Requests;

use App\Models\Customer;
use App\Models\VehicleUnit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;

class StoreWorkOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('pms-work-orders.create');
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Auto-assign branch_id for non-admin users
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasRole('auditor')) {
            $this->merge(['branch_id' => auth()->user()->branch_id]);
        }

        // Copy vehicle data from selected vehicle_unit_id (if provided)
        if ($this->has('vehicle_unit_id') && $this->vehicle_unit_id) {
            $vehicle = VehicleUnit::with('vehicleModel')->find($this->vehicle_unit_id);
            if ($vehicle) {
                $model = $vehicle->vehicleModel;
                $this->merge([
                    'vehicle_vin' => $vehicle->vin,
                    'vehicle_plate_number' => null, // VehicleUnit doesn't have plate_number
                    'vehicle_make' => $model->make ?? null,
                    'vehicle_model' => $model->model ?? null,
                    'vehicle_year' => $model->year ?? null,
                    // Note: current_mileage should be updated by user, not copied from vehicle.odometer
                ]);
            }
        }

        // Copy customer data from selected customer_id (if provided)
        if ($this->has('customer_id') && $this->customer_id) {
            $customer = Customer::find($this->customer_id);
            if ($customer) {
                $this->merge([
                    'customer_name' => trim("{$customer->first_name} {$customer->last_name}"),
                    'customer_phone' => $customer->phone,
                    'customer_email' => $customer->email,
                    'customer_type' => $customer->customer_type,
                ]);
            }
        }

        // Auto-assign created_by
        $this->merge([
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);

        // Default fraud prevention flags
        $this->merge([
            'requires_photo_verification' => $this->input('requires_photo_verification', true),
            'minimum_photos_required' => $this->input('minimum_photos_required', 2),
            'verification_status' => 'pending',
        ]);

        // Calculate next PMS due based on interval
        if ($this->has('current_mileage') && $this->has('pms_interval_km')) {
            $this->merge([
                'next_pms_due_mileage' => $this->current_mileage + $this->pms_interval_km,
            ]);
        }

        // Set next due date based on scheduled date + interval (e.g., 6 months)
        if ($this->filled('scheduled_at') && $this->has('service_type_id')) {
            // Default to 6 months or 180 days if not specified
            $intervalMonthsInput = $this->input('time_interval_months');
            $intervalMonths = is_numeric($intervalMonthsInput) && $intervalMonthsInput > 0
                ? (int) $intervalMonthsInput
                : 6;

            $nextDueDate = Carbon::parse($this->scheduled_at)->addMonths($intervalMonths);
            $this->merge(['next_pms_due_date' => $nextDueDate]);
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
            // Branch assignment
            'branch_id' => 'sometimes|exists:branches,id',

            // Service relationship
            'service_type_id' => 'nullable|exists:service_types,id',

            // Vehicle and customer relationships (foreign keys)
            'vehicle_unit_id' => 'required|exists:vehicle_units,id',
            'customer_id' => 'required|exists:customers,id',

            // Identifiers
            'reference_number' => 'nullable|string|max:255',

            // Vehicle details (snapshot - auto-filled from vehicle_unit_id)
            'vehicle_plate_number' => 'nullable|string|max:255',
            'vehicle_vin' => 'required|string|max:255', // Snapshot from vehicle unit
            'vehicle_make' => 'required|string|max:255',
            'vehicle_model' => 'required|string|max:255',
            'vehicle_year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'current_mileage' => 'required|integer|min:0|max:9999999', // Required for PMS tracking
            'last_service_mileage' => 'nullable|integer|min:0|max:9999999',

            // Customer details (snapshot - auto-filled from customer_id)
            'customer_name' => 'required|string|min:2|max:255',
            'customer_phone' => 'required|string|min:10|max:20',
            'customer_email' => 'nullable|email|max:255',
            'customer_type' => 'required|in:individual,corporate',

            // Scheduling & status
            'status' => 'required|in:draft,pending,scheduled,confirmed,in_progress,completed,cancelled,overdue',
            'priority' => 'required|in:low,normal,high,urgent',
            'scheduled_at' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:scheduled_at',

            // Assignment
            'assigned_to' => 'nullable|exists:users,id',
            'assigned_technician_name' => 'nullable|string|max:255',

            // Estimates
            'estimated_hours' => 'nullable|numeric|min:0|max:999.99',
            'estimated_cost' => 'nullable|numeric|min:0|max:9999999.99',

            // PMS Interval tracking
            'pms_interval_km' => 'required|integer|min:1000|max:50000', // e.g., 5000, 10000, etc.
            'time_interval_months' => 'nullable|integer|min:1|max:24', // e.g., 6 months

            // Service location (for geo-verification)
            'service_location_lat' => 'nullable|numeric|between:-90,90',
            'service_location_lng' => 'nullable|numeric|between:-180,180',
            'service_location_address' => 'nullable|string|max:500',

            // Metadata
            'is_warranty_claim' => 'nullable|boolean',
            'customer_concerns' => 'nullable|string|max:2000',
            'diagnostic_findings' => 'nullable|string|max:2000',
            'notes' => 'nullable|string|max:2000',

            // Fraud prevention
            'requires_photo_verification' => 'nullable|boolean',
            'minimum_photos_required' => 'nullable|integer|min:1|max:10',
        ];

        // Conditional rules: Branch is required for admin/auditor users
        if ($this->user()->hasRole('admin') || $this->user()->hasRole('auditor')) {
            $rules['branch_id'] = 'required|exists:branches,id';
        }

        // Validate mileage logic: current > last service
        if ($this->has('last_service_mileage') && $this->has('current_mileage')) {
            $rules['current_mileage'] .= '|gte:last_service_mileage';
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
            'vehicle_unit_id.required' => 'Please select a vehicle unit.',
            'vehicle_unit_id.exists' => 'Selected vehicle unit does not exist.',

            'customer_id.required' => 'Please select a customer.',
            'customer_id.exists' => 'Selected customer does not exist.',

            'vehicle_vin.required' => 'Vehicle VIN is required for PMS tracking.',

            'vehicle_make.required' => 'Vehicle make is required.',
            'vehicle_model.required' => 'Vehicle model is required.',
            'vehicle_year.required' => 'Vehicle year is required.',
            'vehicle_year.integer' => 'Vehicle year must be a valid year.',
            'vehicle_year.min' => 'Vehicle year must be 1900 or later.',

            'current_mileage.required' => 'Current mileage is required for PMS tracking.',
            'current_mileage.integer' => 'Current mileage must be a whole number.',
            'current_mileage.min' => 'Current mileage cannot be negative.',
            'current_mileage.gte' => 'Current mileage must be greater than or equal to last service mileage.',

            'customer_name.required' => 'Customer name is required.',
            'customer_name.min' => 'Customer name must be at least 2 characters.',
            'customer_phone.required' => 'Customer phone number is required.',
            'customer_phone.min' => 'Phone number must be at least 10 characters.',

            'customer_type.required' => 'Customer type is required.',
            'customer_type.in' => 'Invalid customer type selected.',

            'status.required' => 'Work order status is required.',
            'status.in' => 'Invalid status selected.',

            'priority.required' => 'Priority is required.',
            'priority.in' => 'Invalid priority selected.',

            'pms_interval_km.required' => 'PMS interval in kilometers is required.',
            'pms_interval_km.integer' => 'PMS interval must be a whole number.',
            'pms_interval_km.min' => 'PMS interval must be at least 1000 km.',
            'pms_interval_km.max' => 'PMS interval cannot exceed 50000 km.',

            'due_date.after_or_equal' => 'Due date must be on or after the scheduled date.',

            'branch_id.required' => 'Branch selection is required.',
            'branch_id.exists' => 'Selected branch does not exist.',

            'assigned_to.exists' => 'Selected technician does not exist.',
            'service_type_id.exists' => 'Selected service type does not exist.',
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
            'vehicle_unit_id' => 'vehicle unit',
            'customer_id' => 'customer',
            'vehicle_vin' => 'VIN',
            'vehicle_plate_number' => 'plate number',
            'vehicle_make' => 'vehicle make',
            'vehicle_model' => 'vehicle model',
            'vehicle_year' => 'vehicle year',
            'current_mileage' => 'current mileage',
            'last_service_mileage' => 'last service mileage',
            'customer_name' => 'customer name',
            'customer_phone' => 'phone number',
            'customer_email' => 'email address',
            'customer_type' => 'customer type',
            'pms_interval_km' => 'PMS interval',
            'time_interval_months' => 'time interval',
            'branch_id' => 'branch',
            'service_type_id' => 'service type',
            'assigned_to' => 'assigned technician',
        ];
    }
}
