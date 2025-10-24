<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePartInventoryRequest extends FormRequest
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
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasRole('auditor')) {
            $this->merge(['branch_id' => auth()->user()->branch_id]);
        }

        // Convert empty arrays to null
        if ($this->compatible_makes === []) {
            $this->merge(['compatible_makes' => null]);
        }
        if ($this->compatible_models === []) {
            $this->merge(['compatible_models' => null]);
        }
        if ($this->compatible_years === []) {
            $this->merge(['compatible_years' => null]);
        }
        if ($this->tags === []) {
            $this->merge(['tags' => null]);
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
            // Basic Information
            'part_name' => 'required|string|min:2|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => 'required|in:engine,transmission,electrical,body,suspension,brakes,interior,exterior,accessories,fluids,filters,other',
            'subcategory' => 'nullable|string|max:100',
            'manufacturer' => 'nullable|string|max:255',
            'manufacturer_part_number' => 'nullable|string|max:100',
            'oem_part_number' => 'nullable|string|max:100',

            // Compatibility
            'compatible_makes' => 'nullable|array',
            'compatible_makes.*' => 'string|max:100',
            'compatible_models' => 'nullable|array',
            'compatible_models.*' => 'string|max:100',
            'compatible_years' => 'nullable|array',
            'compatible_years.*' => 'integer|min:1900|max:' . (date('Y') + 2),

            // Inventory
            'quantity_on_hand' => 'required|integer|min:0',
            'quantity_reserved' => 'nullable|integer|min:0',
            'minimum_stock_level' => 'required|integer|min:0',
            'maximum_stock_level' => 'nullable|integer|min:0|gte:minimum_stock_level',
            'reorder_quantity' => 'nullable|integer|min:1',

            // Location
            'warehouse_location' => 'nullable|string|max:100',
            'aisle' => 'nullable|string|max:50',
            'rack' => 'nullable|string|max:50',
            'bin' => 'nullable|string|max:50',

            // Pricing
            'unit_cost' => 'required|numeric|min:0|max:9999999.99',
            'selling_price' => 'required|numeric|min:0|max:9999999.99|gte:unit_cost',
            'wholesale_price' => 'nullable|numeric|min:0|max:9999999.99',
            'currency' => 'nullable|string|size:3',
            'markup_percentage' => 'nullable|numeric|min:0|max:999.99',

            // Physical Attributes
            'weight' => 'nullable|numeric|min:0|max:999999.99',
            'length' => 'nullable|numeric|min:0|max:999999.99',
            'width' => 'nullable|numeric|min:0|max:999999.99',
            'height' => 'nullable|numeric|min:0|max:999999.99',

            // Supplier
            'primary_supplier' => 'nullable|string|max:255',
            'supplier_contact' => 'nullable|string|max:255',
            'supplier_email' => 'nullable|email|max:255',
            'supplier_phone' => 'nullable|string|max:20',
            'lead_time_days' => 'nullable|integer|min:0|max:365',

            // Condition & Quality
            'condition' => 'required|in:new,refurbished,used,oem,aftermarket',
            'quality_grade' => 'nullable|string|max:10',
            'is_genuine' => 'nullable|boolean',

            // Warranty
            'warranty_months' => 'nullable|integer|min:0|max:120',
            'warranty_terms' => 'nullable|string|max:500',

            // Status & Flags
            'status' => 'required|in:active,inactive,discontinued,out_of_stock,on_order',
            'is_serialized' => 'nullable|boolean',
            'is_hazardous' => 'nullable|boolean',
            'requires_special_handling' => 'nullable|boolean',
            'is_fast_moving' => 'nullable|boolean',

            // Dates
            'last_received_date' => 'nullable|date|before_or_equal:today',
            'last_sold_date' => 'nullable|date|before_or_equal:today',
            'last_counted_date' => 'nullable|date|before_or_equal:today',
            'discontinued_date' => 'nullable|date',

            // Notes & Tags
            'notes' => 'nullable|string|max:1000',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',

            // Barcode/SKU
            'barcode' => 'nullable|string|max:100|unique:parts_inventory,barcode',
            'sku' => 'nullable|string|max:100|unique:parts_inventory,sku',
        ];

        // Branch is required for admin/auditor
        if ($this->user()->hasRole('admin') || $this->user()->hasRole('auditor')) {
            $rules['branch_id'] = 'required|exists:branches,id';
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
            'part_name.required' => 'Part name is required.',
            'part_name.min' => 'Part name must be at least 2 characters.',
            'category.required' => 'Category is required.',
            'category.in' => 'Please select a valid category.',
            'quantity_on_hand.required' => 'Quantity on hand is required.',
            'quantity_on_hand.integer' => 'Quantity must be a whole number.',
            'quantity_on_hand.min' => 'Quantity cannot be negative.',
            'minimum_stock_level.required' => 'Minimum stock level is required.',
            'maximum_stock_level.gte' => 'Maximum stock level must be greater than or equal to minimum stock level.',
            'unit_cost.required' => 'Unit cost is required.',
            'unit_cost.min' => 'Unit cost cannot be negative.',
            'selling_price.required' => 'Selling price is required.',
            'selling_price.gte' => 'Selling price must be greater than or equal to unit cost.',
            'condition.required' => 'Condition is required.',
            'condition.in' => 'Please select a valid condition.',
            'status.required' => 'Status is required.',
            'status.in' => 'Please select a valid status.',
            'branch_id.required' => 'Branch is required.',
            'branch_id.exists' => 'Selected branch does not exist.',
            'supplier_email.email' => 'Please enter a valid email address.',
            'barcode.unique' => 'This barcode is already in use.',
            'sku.unique' => 'This SKU is already in use.',
        ];
    }
}
