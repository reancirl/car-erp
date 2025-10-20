# Test Drive API Reference

## Endpoints

### 1. List Test Drives
**GET** `/sales/test-drives`

**Permission:** `sales.view`

**Query Parameters:**
- `search` (string) - Search customer name, phone, email, reservation ID, or VIN
- `status` (string) - Filter by status: `pending_signature`, `confirmed`, `in_progress`, `completed`, `cancelled`, `no_show`
- `reservation_type` (string) - Filter by type: `scheduled`, `walk_in`
- `esignature_status` (string) - Filter by e-signature: `pending`, `signed`, `not_required`
- `date_range` (string) - Filter by date: `today`, `this_week`, `this_month`
- `branch_id` (integer) - Filter by branch (admin only)
- `include_deleted` (boolean) - Include soft-deleted records
- `page` (integer) - Pagination page number

**Response:**
```json
{
  "testDrives": {
    "data": [...],
    "links": [...],
    "meta": {...}
  },
  "stats": {
    "total": 150,
    "completed": 120,
    "walk_in_rate": 35,
    "esignature_rate": 95
  },
  "filters": {...},
  "branches": [...]
}
```

### 2. Create Test Drive Form
**GET** `/sales/test-drives/create`

**Permission:** `sales.create`

**Response:**
```json
{
  "branches": [...],
  "salesReps": [...]
}
```

### 3. Store Test Drive
**POST** `/sales/test-drives`

**Permission:** `sales.create`

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "customer_phone": "09171234567",
  "customer_email": "john@example.com",
  "vehicle_vin": "1HGBH41JXMN109186",
  "vehicle_details": "2024 Honda Civic LX - Silver",
  "scheduled_date": "2025-01-20",
  "scheduled_time": "14:00",
  "duration_minutes": 30,
  "branch_id": 1,
  "assigned_user_id": 5,
  "reservation_type": "scheduled",
  "insurance_verified": true,
  "license_verified": true,
  "deposit_amount": 5000.00,
  "notes": "Customer prefers manual transmission"
}
```

**Validation Rules:**
- `customer_name`: required, string, 3-255 chars
- `customer_phone`: required, string, 10-20 chars
- `customer_email`: optional, valid email
- `vehicle_vin`: required, exactly 17 chars
- `vehicle_details`: required, max 500 chars
- `scheduled_date`: required, date, today or future
- `scheduled_time`: required, HH:MM format
- `duration_minutes`: required, integer, 15-120
- `branch_id`: optional, must exist
- `assigned_user_id`: optional, must exist
- `reservation_type`: required, `scheduled` or `walk_in`
- `status`: optional, valid status enum
- `insurance_verified`: optional, boolean
- `license_verified`: optional, boolean
- `deposit_amount`: optional, numeric, positive
- `notes`: optional, max 2000 chars

**Response:** Redirect to `/sales/test-drives` with success message

### 4. View Test Drive
**GET** `/sales/test-drives/{id}`

**Permission:** `sales.view`

**Response:**
```json
{
  "testDrive": {
    "id": 1,
    "reservation_id": "TD-2025-001",
    "customer_name": "John Doe",
    "customer_phone": "09171234567",
    "customer_email": "john@example.com",
    "vehicle_vin": "1HGBH41JXMN109186",
    "vehicle_details": "2024 Honda Civic LX - Silver",
    "scheduled_date": "2025-01-20",
    "scheduled_time": "14:00",
    "duration_minutes": 30,
    "status": "confirmed",
    "reservation_type": "scheduled",
    "esignature_status": "signed",
    "esignature_timestamp": "2025-01-19 10:30:00",
    "esignature_device": "iPad Pro",
    "gps_start_coords": "14.5995,120.9842",
    "gps_end_coords": "14.6091,120.9823",
    "gps_start_timestamp": "2025-01-20 14:00:00",
    "gps_end_timestamp": "2025-01-20 14:30:00",
    "route_distance_km": 5.2,
    "max_speed_kmh": 65.5,
    "insurance_verified": true,
    "license_verified": true,
    "deposit_amount": 5000.00,
    "notes": "Customer prefers manual transmission",
    "branch": {...},
    "assigned_user": {...},
    "created_at": "2025-01-19 09:00:00"
  },
  "can": {
    "edit": true,
    "delete": true
  }
}
```

### 5. Edit Test Drive Form
**GET** `/sales/test-drives/{id}/edit`

**Permission:** `sales.edit`

**Response:**
```json
{
  "testDrive": {...},
  "branches": [...],
  "salesReps": [...]
}
```

### 6. Update Test Drive
**PUT** `/sales/test-drives/{id}`

**Permission:** `sales.edit`

**Request Body:** Same as Store (all fields optional with `sometimes` validation)

**Response:** Redirect to `/sales/test-drives` with success message

### 7. Delete Test Drive
**DELETE** `/sales/test-drives/{id}`

**Permission:** `sales.delete`

**Response:** Redirect to `/sales/test-drives` with success message

**Note:** This is a soft delete. Record remains in database with `deleted_at` timestamp.

### 8. Restore Test Drive
**POST** `/sales/test-drives/{id}/restore`

**Permission:** `sales.create`

**Response:** Redirect to `/sales/test-drives` with success message

### 9. Export Test Drives
**GET** `/sales/test-drives-export`

**Permission:** `sales.view`

**Query Parameters:**
- `branch_id` (integer) - Filter by branch
- `status` (string) - Filter by status
- `reservation_type` (string) - Filter by type

**Response:** CSV file download

**CSV Columns:**
- Reservation ID
- Customer Name
- Phone
- Email
- Vehicle VIN
- Vehicle Details
- Scheduled Date
- Scheduled Time
- Duration (min)
- Sales Rep
- Branch
- Status
- Type
- E-Signature Status
- Insurance Verified
- License Verified
- Deposit Amount
- GPS Tracked
- Route Distance (km)
- Max Speed (km/h)
- Created At

**Limit:** 1000 records per export

## Status Values

### Test Drive Status
- `pending_signature` - Awaiting customer signature
- `confirmed` - Signature captured, reservation confirmed
- `in_progress` - Test drive currently happening
- `completed` - Test drive finished successfully
- `cancelled` - Reservation cancelled
- `no_show` - Customer didn't show up

### E-Signature Status
- `pending` - Awaiting signature
- `signed` - Signature captured
- `not_required` - Signature not required for this reservation

### Reservation Type
- `scheduled` - Pre-planned appointment
- `walk_in` - Same-day, unscheduled visit

## Authorization Rules

### Branch Scoping
- **Non-admin users:** Can only access test drives from their assigned branch
- **Admin users:** Can access all test drives and filter by branch

### Permission Requirements
- **View:** `sales.view` permission required
- **Create:** `sales.create` permission required
- **Edit:** `sales.edit` permission required
- **Delete:** `sales.delete` permission required
- **Restore:** `sales.create` permission required
- **Export:** `sales.view` permission required

## Activity Logging

All CRUD operations are automatically logged with the following information:
- Action type (created, updated, deleted, restored, exported)
- User who performed the action
- Timestamp
- Module: "Sales"
- Subject: TestDrive model instance
- Properties: Relevant data (reservation ID, customer name, changes, etc.)

## Error Responses

### Validation Error (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "customer_name": ["Customer name is required."],
    "vehicle_vin": ["VIN must be exactly 17 characters."]
  }
}
```

### Authorization Error (403)
```json
{
  "message": "You can only view test drives from your branch."
}
```

### Not Found Error (404)
```json
{
  "message": "Test drive not found."
}
```

## Example Usage

### Create a Test Drive
```javascript
import { useForm } from '@inertiajs/react';

const { data, setData, post, processing, errors } = useForm({
  customer_name: 'John Doe',
  customer_phone: '09171234567',
  customer_email: 'john@example.com',
  vehicle_vin: '1HGBH41JXMN109186',
  vehicle_details: '2024 Honda Civic LX - Silver',
  scheduled_date: '2025-01-20',
  scheduled_time: '14:00',
  duration_minutes: 30,
  reservation_type: 'scheduled',
  insurance_verified: true,
  license_verified: true,
  deposit_amount: 5000.00,
  notes: 'Customer prefers manual transmission'
});

const handleSubmit = (e) => {
  e.preventDefault();
  post('/sales/test-drives');
};
```

### Update a Test Drive
```javascript
import { useForm } from '@inertiajs/react';

const { data, setData, put, processing, errors } = useForm({
  status: 'completed',
  gps_start_coords: '14.5995,120.9842',
  gps_end_coords: '14.6091,120.9823',
  route_distance_km: 5.2,
  max_speed_kmh: 65.5
});

const handleSubmit = (e) => {
  e.preventDefault();
  put(`/sales/test-drives/${testDrive.id}`);
};
```

### Search and Filter
```javascript
import { router } from '@inertiajs/react';

const handleSearch = (searchTerm) => {
  router.get('/sales/test-drives', {
    search: searchTerm,
    status: 'confirmed',
    reservation_type: 'scheduled',
    date_range: 'this_week'
  }, {
    preserveState: true,
    replace: true
  });
};
```

### Delete a Test Drive
```javascript
import { router } from '@inertiajs/react';

const handleDelete = (id) => {
  if (confirm('Are you sure you want to delete this test drive?')) {
    router.delete(`/sales/test-drives/${id}`, {
      preserveScroll: true
    });
  }
};
```

## Best Practices

1. **Always validate VIN:** Ensure VIN is exactly 17 characters
2. **Verify documents:** Check insurance and license before confirming
3. **Capture e-signature:** Get customer signature before test drive
4. **Enable GPS tracking:** Track route for safety and insurance
5. **Assign sales rep:** Always assign a sales representative
6. **Update status:** Keep status current throughout workflow
7. **Add notes:** Document any special requirements or observations
8. **Check availability:** Verify vehicle is available before scheduling
9. **Confirm appointments:** Send confirmation to customer
10. **Follow up:** Update status to completed after successful test drive
