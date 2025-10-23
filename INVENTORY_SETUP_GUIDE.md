# Inventory System - Setup Guide

## Quick Start

### 1. Run Migrations
```bash
php artisan migrate
```

This will create the following tables:
- `attribute_definitions` - Catalog of flexible attributes
- `attribute_sets` + `attribute_set_items` - Attribute templates
- `vehicle_masters` - Vehicle model templates
- `vehicle_units` - Physical vehicle inventory
- `vehicle_movements` - Transfer history

### 2. Seed Data
```bash
php artisan db:seed
```

This will seed:
- **Branches:** HQ, CDO, DVO, CEB (idempotent - safe to run multiple times)
- **Attribute Definitions:** 15 sample attributes across safety, comfort, infotainment, dimensions, emissions, performance, and unit-specific categories
- **Admin User:** admin@admin.com / password (assigned to HQ branch)

### 3. Test API Endpoints

#### Create a Vehicle Master
```bash
curl -X POST http://localhost/inventory/masters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "make": "Toyota",
    "model": "Vios",
    "year": 2024,
    "trim": "G",
    "body_type": "Sedan",
    "transmission": "CVT",
    "fuel_type": "Gasoline",
    "base_price": 1000000,
    "specs": {
      "safety.airbags": 6,
      "comfort.sunroof": true,
      "emissions.euro_class": "Euro 5"
    }
  }'
```

#### Create a Vehicle Unit
```bash
curl -X POST http://localhost/inventory/units \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "vehicle_master_id": 1,
    "vin": "ABC123456789XYZ01",
    "stock_number": "STK-2024-001",
    "status": "in_stock",
    "purchase_price": 900000,
    "color_exterior": "Pearl White",
    "specs": {
      "unit.condition": "Excellent"
    }
  }'
```

#### List Vehicle Units
```bash
curl -X GET "http://localhost/inventory/units?status=in_stock&branch_id=1" \
  -H "Authorization: Bearer {token}"
```

#### Transfer Vehicle Unit
```bash
curl -X POST http://localhost/inventory/units/1/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "to_branch_id": 2,
    "transfer_date": "2024-10-23",
    "remarks": "Branch stock rebalancing"
  }'
```

#### Update Vehicle Status
```bash
curl -X POST http://localhost/inventory/units/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "status": "sold",
    "sold_date": "2024-10-23"
  }'
```

---

## Available API Endpoints

### Vehicle Masters
- `GET /inventory/masters` - List all masters
- `POST /inventory/masters` - Create master
- `GET /inventory/masters/{id}` - View master
- `PUT /inventory/masters/{id}` - Update master
- `DELETE /inventory/masters/{id}` - Delete master
- `POST /inventory/masters/{id}/restore` - Restore deleted master

### Vehicle Units
- `GET /inventory/units` - List all units (branch-filtered)
- `POST /inventory/units` - Create unit
- `GET /inventory/units/{id}` - View unit
- `PUT /inventory/units/{id}` - Update unit
- `DELETE /inventory/units/{id}` - Delete unit
- `POST /inventory/units/{id}/restore` - Restore deleted unit
- `POST /inventory/units/{id}/transfer` - Transfer to another branch
- `POST /inventory/units/{id}/status` - Update status
- `GET /inventory/units/{id}/movements` - View transfer history

---

## Permissions Required

All endpoints require authentication and the following permissions:
- `inventory.view` - View/list records
- `inventory.create` - Create new records and restore
- `inventory.edit` - Update, transfer, status changes
- `inventory.delete` - Delete records

Transfer action additionally requires one of these roles:
- `admin`
- `auditor`
- `parts_head`

---

## Branch Scoping Behavior

### Admin/Auditor Users
- Can see ALL vehicle units across all branches
- Can create units in any branch
- Can transfer units between any branches

### Non-Admin Users
- Can ONLY see vehicle units in their assigned branch
- New units automatically assigned to their branch
- Cannot access units from other branches

---

## Attribute Definitions Seeded

### Safety
- `safety.airbags` (int, both) - Number of airbags
- `safety.abs` (bool, master) - Anti-lock braking system
- `safety.traction_control` (bool, master) - Traction control

### Comfort
- `comfort.sunroof` (bool, master) - Sunroof
- `comfort.climate_zones` (int, master) - Climate control zones

### Infotainment
- `infotainment.apple_carplay` (bool, both) - Apple CarPlay support
- `infotainment.android_auto` (bool, both) - Android Auto support
- `infotainment.screen_size` (decimal, master) - Touchscreen size in inches

### Dimensions
- `dimension.ground_clearance` (decimal, master) - Ground clearance in mm
- `dimension.cargo_capacity` (decimal, master) - Cargo capacity in liters

### Emissions
- `emissions.euro_class` (enum, master) - Euro 2/3/4/5/6

### Performance
- `performance.horsepower` (int, master) - Engine horsepower
- `performance.torque` (int, master) - Engine torque in Nm

### Unit-Specific
- `unit.condition` (enum, unit) - Excellent/Good/Fair/Poor
- `unit.previous_owners` (int, unit) - Number of previous owners

---

## Adding Custom Attributes

You can add more attribute definitions via the database or API:

```php
use App\Models\AttributeDefinition;

AttributeDefinition::create([
    'key' => 'feature.parking_sensors',
    'label' => 'Parking Sensors',
    'type' => 'bool',
    'scope' => 'both',
    'is_required_master' => false,
    'is_required_unit' => false,
    'is_active' => true,
    'description' => 'Front and rear parking sensors',
]);
```

---

## Validation Rules

### Specs Validation
- All keys must exist in `attribute_definitions`
- Values must match the defined type (string/int/decimal/bool/enum)
- Enum values must be in the allowed options
- Required attributes must be present
- Scope must match (master specs for masters, unit specs for units)

### Business Rules
- VIN must be unique across all units
- Stock number must be unique across all units
- Cannot transfer to the same branch
- Cannot transfer sold or disposed units
- Cannot delete sold units (must dispose instead)
- sold_date only allowed when status='sold'

---

## Activity Logging

All operations are automatically logged:
- **Module:** Inventory
- **Actions:** create, update, delete, restore, transfer, status_change
- **Captured:** User, IP, User Agent, Branch, Changes diff
- **View logs:** `/audit/activity-logs`

---

## Troubleshooting

### Migration Issues
```bash
# Rollback last migration batch
php artisan migrate:rollback

# Fresh migration (WARNING: drops all data)
php artisan migrate:fresh --seed
```

### Clear Attribute Cache
```php
use App\Services\AttributeSpecValidator;

$validator = app(AttributeSpecValidator::class);
$validator->clearCache();
```

### Check Permissions
```bash
php artisan permission:show
```

### View Routes
```bash
php artisan route:list --path=inventory
```

---

## Next Steps

### Frontend Integration
The API is ready for frontend integration. You'll need to create:
1. Vehicle Masters UI (list, create, edit, view)
2. Vehicle Units UI (list, create, edit, view)
3. Transfer dialog/modal
4. Status update dialog/modal
5. Movement history timeline

### Optional Enhancements
1. Bulk operations (bulk transfer, bulk status update)
2. Attribute set management UI
3. Inventory reports and analytics
4. Low stock alerts
5. Aging inventory alerts

---

## Support

For detailed implementation information, see:
- `INVENTORY_SYSTEM_IMPLEMENTATION.md` - Complete technical documentation
- `IMPLEMENTATION_STANDARDS.md` - House coding standards

For questions about existing patterns, refer to:
- Customer Experience CRUD (`/sales/customer-experience`)
- Test Drive Management (`/sales/test-drives`)
- Branch Management (`/admin/branch-management`)
