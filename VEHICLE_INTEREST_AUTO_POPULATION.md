# Vehicle Interest Auto-Population Implementation

## Overview
Implemented a comprehensive Vehicle Interest system that allows structured vehicle data capture in Leads and automatic population into Pipeline opportunities and other modules when a lead is selected.

## Key Features

### 1. Simplified Vehicle Interest Data
Leads now capture vehicle interest information in a streamlined format:
- **vehicle_interest**: Summary text (e.g., "2024 WULING Binguo EV" or "Toyota Vios 1.3 E MT")
- **vehicle_variant**: Specific variant/trim (optional)
- **vehicle_model_id**: Optional link to VehicleModel catalog for structured data

### 2. Auto-Population from Lead to Pipeline
When creating a Pipeline opportunity:
- Select an existing lead from dropdown
- System automatically populates:
  - Customer information (name, email, phone)
  - Branch assignment
  - **Vehicle interest summary**
  
### 3. Reusable Components
Created two reusable React components for consistent UX across modules:

#### **LeadSelector Component**
- Displays available leads with their vehicle interest
- Shows lead ID, name, and vehicle interest preview
- Auto-fills customer and vehicle data on selection
- Location: `resources/js/components/lead-selector.tsx`

#### **VehicleInterestSelector Component**
- Dropdown to select from VehicleModel catalog (optional)
- Single text field for vehicle interest summary
- Auto-populates summary from catalog selection
- Optional quote amount field with auto-pricing
- Clean, simplified UI
- Location: `resources/js/components/vehicle-interest-selector.tsx`

## Database Changes

### Migrations

#### Initial Migration: `add_structured_vehicle_interest_to_leads_table`
Added structured fields to leads table.

#### Cleanup Migration: `remove_redundant_vehicle_fields_from_leads_table`
Removed redundant individual fields, keeping only:
```php
Schema::table('leads', function (Blueprint $table) {
    // Kept fields:
    // - vehicle_interest (summary text)
    // - vehicle_variant (optional)
    // - vehicle_model_id (FK to vehicle_models)
    
    // Removed redundant fields:
    $table->dropColumn(['vehicle_year', 'vehicle_make', 'vehicle_model']);
});
```

## Backend Updates

### Lead Model (`app/Models/Lead.php`)
- Added new fields to `$fillable` array
- Added `vehicleModel()` relationship
- Maintains backward compatibility with existing `vehicle_interest` text field

### Form Requests
Updated validation rules in:
- `StoreLeadRequest.php`
- `UpdateLeadRequest.php`

Added rules:
```php
'vehicle_interest' => 'nullable|string|max:255',
'vehicle_variant' => 'nullable|string|max:100',
'vehicle_model_id' => 'nullable|exists:vehicle_models,id',
```

### PipelineController (`app/Http/Controllers/PipelineController.php`)
Updated `create()` method to include vehicle interest fields when fetching leads:
```php
$leads = Lead::with('branch')
    ->when(!$user->hasRole('admin'), function ($q) use ($user) {
        $q->where('branch_id', $user->branch_id);
    })
    ->whereNotIn('status', ['lost'])
    ->get([
        'id', 'lead_id', 'name', 'email', 'phone', 'branch_id',
        'vehicle_interest', 'vehicle_variant'
    ]);
```

## Frontend Updates

### Pipeline Create Page (`resources/js/pages/sales/pipeline-create.tsx`)

#### Updated Lead Interface
```typescript
interface Lead {
    id: number;
    lead_id: string;
    name: string;
    email: string;
    phone: string;
    branch_id: number;
    vehicle_interest?: string;
    vehicle_variant?: string;
}
```

#### Enhanced handleLeadSelect Function
```typescript
const handleLeadSelect = (leadId: string | undefined) => {
    if (leadId) {
        const selectedLead = leads.find(l => l.id.toString() === leadId);
        if (selectedLead) {
            setData({
                ...data,
                lead_id: leadId,
                branch_id: selectedLead.branch_id.toString(),
                customer_name: selectedLead.name,
                customer_email: selectedLead.email,
                customer_phone: selectedLead.phone,
                // Auto-populate vehicle interest from lead
                vehicle_interest: selectedLead.vehicle_interest || '',
            });
        }
    }
};
```

## Usage Examples

### Example 1: Creating a Lead with Vehicle Interest
```typescript
// In lead-create.tsx
<VehicleInterestSelector
    data={{
        vehicle_interest: data.vehicle_interest,
        vehicle_model_id: data.vehicle_model_id,
    }}
    setData={setData}
    errors={errors}
    vehicleModels={vehicleModels}
    showQuoteAmount={false}
/>
```

### Example 2: Creating Pipeline from Lead
```typescript
// In pipeline-create.tsx
<LeadSelector
    leads={leads}
    selectedLeadId={data.lead_id}
    onLeadSelect={handleLeadSelect}
/>

<VehicleInterestSelector
    data={{
        vehicle_interest: data.vehicle_interest,
        vehicle_model_id: data.vehicle_model_id,
        quote_amount: data.quote_amount,
    }}
    setData={setData}
    errors={errors}
    vehicleModels={vehicleModels}
    showQuoteAmount={true}
/>
```

## Benefits

### 1. Data Consistency
- Structured data capture ensures consistency across modules
- Reduces data entry errors
- Enables better reporting and analytics

### 2. Time Savings
- Sales reps don't need to re-enter vehicle information
- One-click population from lead to pipeline
- Catalog selection auto-fills multiple fields

### 3. Better Tracking
- Link leads to specific vehicle models in catalog
- Track which models generate most interest
- Analyze conversion rates by vehicle type

### 4. Flexibility
- Works with or without vehicle catalog
- Manual entry still available
- Backward compatible with existing text-only vehicle_interest

## Integration Points

### Current Integrations
1. **Lead Management** → **Pipeline**
   - Auto-populates customer and vehicle data
   
### Future Integration Opportunities
1. **Test Drive Scheduling**
   - Pre-fill vehicle from lead/pipeline
   
2. **Quote Generation**
   - Auto-select vehicle model
   - Pre-populate pricing
   
3. **Reservation System**
   - Link to specific vehicle units in inventory
   
4. **Customer Experience**
   - Track vehicle preferences across customer journey

## Migration Instructions

### 1. Run Migration
```bash
php artisan migrate
```

### 2. Update Existing Leads (Optional)
If you have existing leads with vehicle_interest text, you can parse and populate the structured fields:

```php
// Example migration script
$leads = Lead::whereNotNull('vehicle_interest')->get();
foreach ($leads as $lead) {
    // Parse vehicle_interest text (e.g., "2024 Toyota Camry")
    $parts = explode(' ', $lead->vehicle_interest, 3);
    if (count($parts) >= 2) {
        $lead->vehicle_year = $parts[0];
        $lead->vehicle_make = $parts[1];
        $lead->vehicle_model = $parts[2] ?? '';
        $lead->save();
    }
}
```

### 3. Update Frontend Forms
For any custom lead or pipeline forms, import and use the new components:
```typescript
import LeadSelector from '@/components/lead-selector';
import VehicleInterestSelector from '@/components/vehicle-interest-selector';
```

## Testing Checklist

- [ ] Create lead with vehicle interest (manual entry)
- [ ] Create lead with vehicle interest (catalog selection)
- [ ] Create pipeline from lead (verify auto-population)
- [ ] Edit lead vehicle interest
- [ ] Verify branch filtering works for leads
- [ ] Test with and without vehicle_model_id
- [ ] Verify validation errors display correctly
- [ ] Test lead selection dropdown shows vehicle interest
- [ ] Verify quote amount auto-fills from catalog

## Files Modified/Created

### Backend
- ✅ `database/migrations/2025_10_23_162019_add_structured_vehicle_interest_to_leads_table.php`
- ✅ `app/Models/Lead.php`
- ✅ `app/Http/Requests/StoreLeadRequest.php`
- ✅ `app/Http/Requests/UpdateLeadRequest.php`
- ✅ `app/Http/Controllers/PipelineController.php`

### Frontend
- ✅ `resources/js/components/lead-selector.tsx` (NEW)
- ✅ `resources/js/components/vehicle-interest-selector.tsx` (NEW)
- ✅ `resources/js/pages/sales/pipeline-create.tsx`

### Documentation
- ✅ `VEHICLE_INTEREST_AUTO_POPULATION.md` (THIS FILE)

## Standards Compliance

✅ **IMPLEMENTATION_STANDARDS.md Compliant**
- Branch scoping maintained
- Proper validation rules
- Activity logging ready (in controllers)
- Soft deletes support
- Permission-based access
- Reusable components
- TypeScript interfaces
- Error handling

## Next Steps

### Immediate
1. Update `lead-create.tsx` to use new VehicleInterestSelector component
2. Update `lead-edit.tsx` to use new VehicleInterestSelector component
3. Test end-to-end flow: Lead → Pipeline → Test Drive

### Future Enhancements
1. Add vehicle interest analytics dashboard
2. Create vehicle interest heatmap by model
3. Implement smart suggestions based on budget and preferences
4. Add vehicle comparison feature for leads
5. Integrate with external vehicle pricing APIs
6. Add vehicle availability checking from inventory

## Support

For questions or issues:
1. Check this documentation
2. Review component prop types in source files
3. Verify migration has been run
4. Check browser console for TypeScript errors
5. Verify API responses include new fields
