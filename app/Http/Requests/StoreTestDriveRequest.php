<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTestDriveRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('sales.create');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'customer_name' => 'required|string|min:3|max:255',
            'customer_phone' => 'required|string|min:10|max:20',
            'customer_email' => 'nullable|email:rfc|max:255',
            
            'vehicle_vin' => 'required|string|min:17|max:17',
            'vehicle_details' => 'required|string|max:500',
            
            'scheduled_date' => 'required|date|after_or_equal:today',
            'scheduled_time' => ['required', 'string', 'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/'],
            'duration_minutes' => 'required|integer|min:15|max:120',
            
            'branch_id' => 'nullable|exists:branches,id',
            'assigned_user_id' => 'nullable|exists:users,id',
            
            'status' => 'nullable|in:pending_signature,confirmed,in_progress,completed,cancelled,no_show',
            'reservation_type' => 'required|in:scheduled,walk_in',
            
            'esignature_status' => 'nullable|in:pending,signed,not_required',
            'esignature_device' => 'nullable|string|max:255',
            'esignature_data' => 'nullable|string',
            
            'gps_start_coords' => 'nullable|string|max:255',
            'gps_end_coords' => 'nullable|string|max:255',
            'route_distance_km' => 'nullable|numeric|min:0|max:9999.99',
            'max_speed_kmh' => 'nullable|numeric|min:0|max:999.99',
            
            'insurance_verified' => 'nullable|boolean',
            'license_verified' => 'nullable|boolean',
            'deposit_amount' => 'nullable|numeric|min:0|max:99999999.99',
            
            'notes' => 'nullable|string|max:2000',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'customer_name.required' => 'Customer name is required.',
            'customer_name.min' => 'Customer name must be at least 3 characters.',
            'customer_phone.required' => 'Customer phone number is required.',
            'customer_phone.min' => 'Phone number must be at least 10 characters.',
            'customer_email.email' => 'Please enter a valid email address.',
            
            'vehicle_vin.required' => 'Vehicle VIN is required.',
            'vehicle_vin.min' => 'VIN must be exactly 17 characters.',
            'vehicle_vin.max' => 'VIN must be exactly 17 characters.',
            'vehicle_details.required' => 'Vehicle details are required.',
            
            'scheduled_date.required' => 'Scheduled date is required.',
            'scheduled_date.after_or_equal' => 'Scheduled date must be today or in the future.',
            'scheduled_time.required' => 'Scheduled time is required.',
            'scheduled_time.regex' => 'Invalid time format. Use HH:MM format.',
            'duration_minutes.required' => 'Duration is required.',
            'duration_minutes.min' => 'Duration must be at least 15 minutes.',
            'duration_minutes.max' => 'Duration cannot exceed 120 minutes.',
            
            'reservation_type.required' => 'Reservation type is required.',
        ];
    }
}
