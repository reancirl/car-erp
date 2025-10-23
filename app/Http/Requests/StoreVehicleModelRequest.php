<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleModelRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('vehicle_model.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Basic Information
            'make' => ['nullable', 'string', 'max:255'],
            'model' => ['required', 'string', 'max:255'],
            'model_code' => ['nullable', 'string', 'max:255', 'unique:vehicle_models,model_code'],
            'year' => ['required', 'integer', 'min:2000', 'max:2050'],
            'generation' => ['nullable', 'string', 'max:255'],
            
            // Body & Design
            'body_type' => ['nullable', 'in:sedan,suv,hatchback,mpv,van,pickup,coupe,wagon'],
            'doors' => ['nullable', 'integer', 'min:2', 'max:6'],
            'seating_capacity' => ['nullable', 'integer', 'min:1', 'max:20'],
            
            // Engine & Performance
            'engine_type' => ['nullable', 'string', 'max:255'],
            'engine_displacement' => ['nullable', 'numeric', 'min:0', 'max:10'],
            'horsepower' => ['nullable', 'integer', 'min:0', 'max:2000'],
            'torque' => ['nullable', 'integer', 'min:0', 'max:3000'],
            'transmission' => ['nullable', 'in:manual,automatic,cvt,dct,amt'],
            'drivetrain' => ['nullable', 'in:fwd,rwd,awd,4wd'],
            
            // Fuel & Efficiency
            'fuel_type' => ['nullable', 'in:gasoline,diesel,electric,hybrid,plug_in_hybrid'],
            'fuel_tank_capacity' => ['nullable', 'numeric', 'min:0', 'max:200'],
            'fuel_consumption_city' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'fuel_consumption_highway' => ['nullable', 'numeric', 'min:0', 'max:100'],
            
            // Electric Vehicle Specs
            'battery_capacity_kwh' => ['nullable', 'numeric', 'min:0', 'max:500'],
            'electric_range_km' => ['nullable', 'integer', 'min:0', 'max:2000'],
            'charging_type' => ['nullable', 'string', 'max:255'],
            'charging_time_fast' => ['nullable', 'numeric', 'min:0', 'max:24'],
            'charging_time_slow' => ['nullable', 'numeric', 'min:0', 'max:48'],
            'motor_power_kw' => ['nullable', 'integer', 'min:0', 'max:1000'],
            
            // Dimensions
            'length_mm' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'width_mm' => ['nullable', 'integer', 'min:0', 'max:5000'],
            'height_mm' => ['nullable', 'integer', 'min:0', 'max:5000'],
            'wheelbase_mm' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'ground_clearance_mm' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'cargo_capacity_liters' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'curb_weight_kg' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'gross_weight_kg' => ['nullable', 'integer', 'min:0', 'max:20000'],
            
            // Pricing
            'base_price' => ['nullable', 'numeric', 'min:0'],
            'srp' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            
            // Features & Equipment (JSON)
            'standard_features' => ['nullable', 'array'],
            'optional_features' => ['nullable', 'array'],
            'safety_features' => ['nullable', 'array'],
            'technology_features' => ['nullable', 'array'],
            'available_colors' => ['nullable', 'array'],
            'available_trims' => ['nullable', 'array'],
            
            // Media
            'images' => ['nullable', 'array'],
            'description' => ['nullable', 'string'],
            'specifications_pdf' => ['nullable', 'string', 'max:500'],
            
            // Status & Metadata
            'is_active' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'launch_date' => ['nullable', 'date'],
            'discontinuation_date' => ['nullable', 'date', 'after_or_equal:launch_date'],
            'notes' => ['nullable', 'string'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'model.required' => 'The model name is required.',
            'year.required' => 'The model year is required.',
            'year.min' => 'The year must be at least 2000.',
            'year.max' => 'The year cannot be greater than 2050.',
            'model_code.unique' => 'This model code is already in use.',
            'discontinuation_date.after_or_equal' => 'The discontinuation date must be after the launch date.',
        ];
    }
}
