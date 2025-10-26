# PMS Work Orders - Implementation Summary

**Module**: `/service/pms-work-orders`
**Status**: ✅ Backend Complete - Frontend Pending
**Date**: 2025-10-25

---

## Overview

This is a comprehensive **Preventive Maintenance Service (PMS) Work Orders** system with **industry-leading fraud prevention** features. This module is the heart of the service management system and implements rigorous tracking to prevent:

- ❌ Fake service entries
- ❌ Skipped services
- ❌ Tampered odometer data
- ❌ Location spoofing
- ❌ Missed PMS intervals

---

## Fraud Prevention Features Implemented

### 1. Photo Evidence System ✅
**Requirement**: *Photo evidence (before/after) for each PMS logged*

**Implementation**:
- ✅ WorkOrderPhoto model with EXIF metadata extraction
- ✅ GPS coordinates extracted from photo EXIF data
- ✅ Timestamp verification (photo_taken_at vs upload time)
- ✅ Camera make/model tracking
- ✅ IP address and user agent logging
- ✅ Minimum 2 photos required (configurable)
- ✅ Before/after photo type enforcement
- ✅ File size limits (5MB per photo, max 10 photos)

**Key Files**:
- [WorkOrderPhoto.php](app/Models/WorkOrderPhoto.php)
- [PhotoUploadService.php](app/Services/PhotoUploadService.php)
- [create_work_order_photos_table.php](database/migrations/2025_10_25_160000_create_work_order_photos_table.php)

---

### 2. VIN & Odometer Cross-Checking ✅
**Requirement**: *VIN numbers cross-checked with odometer readings and visit history*

**Implementation**:
- ✅ VIN validation (exactly 17 characters, required field)
- ✅ OdometerReading model with automatic anomaly detection
- ✅ Historical reading comparison per VIN
- ✅ Automatic calculation of distance traveled and time elapsed
- ✅ Photo evidence for odometer readings
- ✅ VIN becomes immutable after verification (fraud prevention)

**Anomaly Detection**:
1. **Rollback Detection**: Reading lower than previous (CRITICAL)
2. **Duplicate Detection**: Same reading as previous entry
3. **Excessive Increase**: >500km per day average (WARNING)
4. **Missed Interval**: >10,000km or >180 days since last service

**Key Files**:
- [OdometerReading.php](app/Models/OdometerReading.php)
- [OdometerService.php](app/Services/OdometerService.php)
- [create_odometer_readings_table.php](database/migrations/2025_10_25_160100_create_odometer_readings_table.php)

---

### 3. Geo-Tagging & Location Verification ✅
**Requirement**: *Geo-tagging to verify vehicle was physically at service center*

**Implementation**:
- ✅ GPS coordinates extracted from photo EXIF (latitude/longitude)
- ✅ Service center location stored per work order
- ✅ Automatic distance calculation using Haversine formula
- ✅ Location verification: Photos must be within 1km of service center
- ✅ Fraud alert triggered if photo taken >1km away
- ✅ IP address logging for upload traceability
- ✅ Reverse geocoding support (location_address field)

**Distance Calculation**:
```php
// Haversine formula implemented in WorkOrder model
$distance = $workOrder->calculateDistance($lat1, $lng1, $lat2, $lng2);
// Returns distance in kilometers
```

**Key Files**:
- [WorkOrder.php](app/Models/WorkOrder.php) - `isLocationVerified()` method
- [PhotoUploadService.php](app/Services/PhotoUploadService.php) - `verifyPhotoLocation()`

---

### 4. Auto-Flagging for Missed PMS Intervals ✅
**Requirement**: *System auto-flags units that have missed PMS intervals*

**Implementation**:
- ✅ Configurable PMS intervals (km-based and time-based)
- ✅ Automatic overdue detection:
  - Mileage: >10,000km since last service
  - Time: >6 months (180 days) since last service
- ✅ `is_overdue` flag with `days_overdue` and `km_overdue` tracking
- ✅ Next PMS due date/mileage auto-calculation
- ✅ Fraud alerts for excessive intervals
- ✅ Dashboard view of all overdue vehicles

**Key Methods**:
```php
$workOrder->checkOverdueStatus(); // Auto-updates overdue flags
$missedVehicles = OdometerService::getMissedPMSVehicles($branchId);
```

**Key Files**:
- [WorkOrder.php](app/Models/WorkOrder.php) - `checkOverdueStatus()` method
- [OdometerService.php](app/Services/OdometerService.php) - `getMissedPMSVehicles()`

---

## Database Schema

### Tables Created

#### 1. `work_order_photos`
Stores photo evidence with fraud prevention metadata.

**Key Columns**:
- `file_path`, `file_name`, `file_size`, `mime_type`
- `photo_type`: before | after | during | damage | completion
- `latitude`, `longitude` (from EXIF GPS)
- `photo_taken_at` (from EXIF DateTimeOriginal)
- `camera_make`, `camera_model`
- `uploaded_ip_address`, `user_agent`
- `has_gps_data`, `has_exif_data`, `is_verified`

#### 2. `odometer_readings`
Historical odometer data with anomaly detection.

**Key Columns**:
- `vehicle_vin`, `vehicle_plate_number`
- `reading`, `unit`, `reading_date`
- `previous_reading`, `previous_reading_date`
- `distance_diff`, `days_diff`, `avg_daily_distance`
- `is_anomaly`, `anomaly_type`, `anomaly_notes`
- `photo_path`, `has_photo_evidence`
- `recorded_by`, `recorded_ip_address`
- `is_verified`, `verified_by`, `verified_at`

**Anomaly Types**:
- `rollback` - Reading decreased
- `duplicate` - Same as previous
- `excessive_increase` - >500km/day
- `missed_interval` - >10,000km or >180 days

#### 3. Enhanced `work_orders` Table
Added PMS tracking and fraud prevention columns.

**New Columns**:
- `pms_interval_km` - Expected interval (5000, 10000, etc.)
- `next_pms_due_date`, `next_pms_due_mileage`
- `is_overdue`, `days_overdue`, `km_overdue`
- `requires_photo_verification`, `minimum_photos_required`
- `odometer_verified`, `location_verified`
- `service_location_lat`, `service_location_lng`, `service_location_address`
- `fraud_alerts` (JSON), `has_fraud_alerts`
- `verification_status`: pending | verified | flagged | rejected

---

## Backend Implementation

### Models
1. ✅ **WorkOrder** - Enhanced with fraud prevention methods
2. ✅ **WorkOrderPhoto** - Photo evidence tracking
3. ✅ **OdometerReading** - Historical odometer data

### Services
1. ✅ **PhotoUploadService** - EXIF extraction, GPS verification, upload handling
2. ✅ **OdometerService** - Anomaly detection, history tracking, validation

### Controllers
1. ✅ **WorkOrderController** - Full CRUD with fraud prevention endpoints

### Request Validation
1. ✅ **StoreWorkOrderRequest** - Create validation with VIN/mileage rules
2. ✅ **UpdateWorkOrderRequest** - Update validation with change tracking

### Routes
All routes under `/service/pms-work-orders` with permission gates:
- `pms-work-orders.view` - Index, Show
- `pms-work-orders.create` - Create, Store, Restore
- `pms-work-orders.edit` - Edit, Update, Photo Upload/Delete
- `pms-work-orders.delete` - Destroy

**Special Endpoints**:
- `POST /service/pms-work-orders/{id}/photos` - Upload photos
- `DELETE /service/pms-work-orders/{id}/photos/{photo}` - Delete photo
- `POST /service/validate-odometer` - Validate odometer reading

---

## Fraud Detection Workflow

### Photo Upload Flow
1. User uploads photo → PhotoUploadService
2. Extract EXIF data (GPS, timestamp, camera info)
3. Store photo with metadata
4. Verify location against service center (within 1km)
5. If location mismatch → Add fraud alert
6. Check minimum photo requirements
7. Check for before/after photos
8. Update work order verification status

### Odometer Recording Flow
1. User enters new odometer reading
2. Fetch previous reading for VIN
3. Calculate differences (distance, days, avg daily)
4. **Auto-detect anomalies**:
   - Rollback (reading < previous) → CRITICAL
   - Duplicate (reading == previous) → WARNING
   - Excessive increase (>500km/day) → WARNING
   - Missed interval (>10k km or >180 days) → ALERT
5. If anomaly detected → Add fraud alert to work order
6. Store reading with audit trail
7. Update work order current_mileage

### PMS Interval Monitoring
1. On work order create/update → Calculate next PMS due
2. Background job/cron → Check all active work orders
3. If `now() > next_pms_due_date` → Set `is_overdue = true`
4. If `current_mileage > next_pms_due_mileage` → Set `is_overdue = true`
5. Calculate `days_overdue` and `km_overdue`
6. Dashboard displays all overdue vehicles

---

## Key Features Implemented

### ✅ Data Integrity
- VIN validation (17 chars, immutable after verification)
- Odometer cannot decrease (rollback detection)
- Mileage must be ≥ last service mileage
- Photo file type validation (JPEG, PNG only)
- File size limits (5MB per photo)

### ✅ Audit Trail
- `created_by`, `updated_by` tracking
- `recorded_by` for odometer readings
- `uploaded_by` for photos
- IP address logging for all actions
- User agent tracking
- Activity logging via `LogsActivity` trait

### ✅ Branch Scoping
- Non-admin users see only their branch's data
- Auto-assign branch_id on create
- Branch-level authorization in controllers

### ✅ Verification System
- `verification_status`: pending | verified | flagged | rejected
- Photo verification (`is_verified` flag)
- Odometer verification (`is_verified` flag)
- Location verification (GPS-based)
- Manual supervisor override capability

### ✅ Fraud Alerts
JSON array stored in `fraud_alerts` column:
```json
[
  {
    "type": "odometer_anomaly",
    "message": "Odometer reading decreased by 5000 km",
    "data": {
      "anomaly_type": "rollback",
      "reading": 45000,
      "previous_reading": 50000
    },
    "detected_at": "2025-10-25 10:30:00"
  },
  {
    "type": "location_mismatch",
    "message": "Photo taken 2.5 km away from service center",
    "data": {
      "distance_km": 2.5,
      "photo_id": 123
    },
    "detected_at": "2025-10-25 10:32:00"
  }
]
```

---

## Frontend Requirements (To Be Implemented)

### Pages Needed
1. **Index** (`service/pms-work-orders/index.tsx`)
   - Data table with work orders
   - Filter by: status, priority, verification_status, has_fraud_alerts, is_overdue
   - Stats cards: Total, Pending, In Progress, Completed, Overdue, Flagged
   - **Missed PMS Alert Section** (highlighted vehicles)
   - Fraud alert badges on flagged work orders

2. **Create** (`service/pms-work-orders/create.tsx`)
   - Vehicle details form (VIN, make, model, year, current mileage)
   - Customer details form
   - Service details (type, scheduled date, PMS interval)
   - Assignment (technician, branch)
   - Photo upload section (before/after)
   - **Real-time odometer validation** (API call to `/validate-odometer`)
   - Validation error banner

3. **Edit** (`service/pms-work-orders/edit.tsx`)
   - Same as Create but with pre-filled data
   - Photo management (upload additional, delete existing)
   - Change tracking display
   - Lock VIN field if already verified

4. **Show/View** (`service/pms-work-orders/show.tsx`)
   - Work order details (read-only)
   - **Photo gallery** with EXIF data display (GPS map, timestamp, camera info)
   - **Odometer reading history** table
   - **Fraud alerts panel** (if any)
   - Verification status badges
   - Action buttons (Edit, Delete, Verify)

### Components Needed
1. **PhotoUploadZone** - Drag & drop photo upload with preview
2. **PhotoGallery** - Display photos with lightbox
3. **EXIFMetadataCard** - Show GPS, timestamp, camera data
4. **OdometerHistoryTable** - Historical readings with anomaly flags
5. **FraudAlertPanel** - Display fraud alerts with severity
6. **LocationMap** - Show GPS coordinates on map
7. **PMSIntervalTracker** - Visual progress to next PMS

### TypeScript Interfaces Needed
```typescript
interface WorkOrder {
  id: number;
  work_order_number: string;
  vehicle_vin: string;
  vehicle_plate_number: string | null;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  current_mileage: number;
  pms_interval_km: number;
  next_pms_due_mileage: number | null;
  next_pms_due_date: string | null;
  is_overdue: boolean;
  days_overdue: number | null;
  km_overdue: number | null;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  verification_status: VerificationStatus;
  has_fraud_alerts: boolean;
  fraud_alerts: FraudAlert[] | null;
  photos: WorkOrderPhoto[];
  odometer_readings: OdometerReading[];
  // ... other fields
}

interface WorkOrderPhoto {
  id: number;
  file_path: string;
  file_name: string;
  photo_type: 'before' | 'after' | 'during' | 'damage' | 'completion';
  latitude: number | null;
  longitude: number | null;
  location_address: string | null;
  photo_taken_at: string | null;
  camera_make: string | null;
  camera_model: string | null;
  has_gps_data: boolean;
  has_exif_data: boolean;
  url: string;
}

interface OdometerReading {
  id: number;
  reading: number;
  reading_date: string;
  previous_reading: number | null;
  distance_diff: number | null;
  days_diff: number | null;
  avg_daily_distance: number | null;
  is_anomaly: boolean;
  anomaly_type: AnomalyType;
  anomaly_notes: string | null;
}

type WorkOrderStatus = 'draft' | 'pending' | 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
type WorkOrderPriority = 'low' | 'normal' | 'high' | 'urgent';
type VerificationStatus = 'pending' | 'verified' | 'flagged' | 'rejected';
type AnomalyType = 'none' | 'rollback' | 'excessive_increase' | 'duplicate' | 'missed_interval';
```

---

## Testing Checklist

### Unit Tests
- [ ] WorkOrder model methods (fraud alert, overdue check, location verification)
- [ ] OdometerReading anomaly detection logic
- [ ] PhotoUploadService EXIF extraction
- [ ] OdometerService validation methods

### Feature Tests
- [ ] Create work order with VIN validation
- [ ] Update work order with change tracking
- [ ] Upload photos with EXIF data
- [ ] Delete photos
- [ ] Record odometer reading with anomaly detection
- [ ] Validate odometer endpoint
- [ ] Soft delete and restore
- [ ] Branch-level authorization

### Fraud Prevention Tests
- [ ] Rollback detection (reading < previous)
- [ ] Duplicate detection (reading == previous)
- [ ] Excessive increase detection (>500km/day)
- [ ] Missed interval detection (>10k km or >180 days)
- [ ] Location verification (GPS within 1km)
- [ ] Photo requirement enforcement (min 2 photos)
- [ ] Before/after photo enforcement
- [ ] VIN immutability after verification

---

## Migration Instructions

1. **Rollback if needed**:
   ```bash
   php artisan migrate:rollback --step=3
   ```

2. **Run migrations**:
   ```bash
   php artisan migrate
   ```

   **Note**: There was a duplicate index issue fixed in `create_odometer_readings_table.php`. The `vehicle_vin` index was defined twice (once in the column definition with `->index()` and once at the end with `$table->index('vehicle_vin')`). The redundant index has been removed.

3. **Seed permissions** (if using Spatie Laravel Permission):
   ```php
   // Add to PermissionSeeder
   Permission::create(['name' => 'pms-work-orders.view']);
   Permission::create(['name' => 'pms-work-orders.create']);
   Permission::create(['name' => 'pms-work-orders.edit']);
   Permission::create(['name' => 'pms-work-orders.delete']);
   ```

4. **Assign permissions to roles**:
   ```php
   $admin->givePermissionTo('pms-work-orders.view', 'pms-work-orders.create', 'pms-work-orders.edit', 'pms-work-orders.delete');
   $manager->givePermissionTo('pms-work-orders.view', 'pms-work-orders.create', 'pms-work-orders.edit');
   $technician->givePermissionTo('pms-work-orders.view');
   ```

---

## API Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/service/pms-work-orders` | List all work orders | `pms-work-orders.view` |
| GET | `/service/pms-work-orders/create` | Show create form | `pms-work-orders.create` |
| POST | `/service/pms-work-orders` | Store new work order | `pms-work-orders.create` |
| GET | `/service/pms-work-orders/{id}` | Show work order | `pms-work-orders.view` |
| GET | `/service/pms-work-orders/{id}/edit` | Show edit form | `pms-work-orders.edit` |
| PUT/PATCH | `/service/pms-work-orders/{id}` | Update work order | `pms-work-orders.edit` |
| DELETE | `/service/pms-work-orders/{id}` | Delete work order | `pms-work-orders.delete` |
| POST | `/service/pms-work-orders/{id}/restore` | Restore deleted | `pms-work-orders.create` |
| POST | `/service/pms-work-orders/{id}/photos` | Upload photos | `pms-work-orders.edit` |
| DELETE | `/service/pms-work-orders/{id}/photos/{photoId}` | Delete photo | `pms-work-orders.edit` |
| POST | `/service/validate-odometer` | Validate odometer | authenticated |

---

## Security Considerations

### ✅ Implemented
- VIN immutability after verification (prevents tampering)
- IP address logging for all actions
- User agent tracking
- GPS coordinate verification
- EXIF timestamp validation
- File upload restrictions (type, size)
- Branch-level data isolation
- Role-based permissions

### 🔒 Additional Recommendations
- **Rate limiting** on photo upload endpoint (prevent abuse)
- **File virus scanning** (integrate ClamAV or similar)
- **Photo watermarking** with timestamp and location
- **Blockchain logging** for immutable audit trail (future enhancement)
- **Two-factor verification** for critical actions (flagged work orders)

---

## Performance Optimizations

### Database
- ✅ Indexes on frequently queried columns (VIN, status, dates)
- ✅ Eager loading relationships (`with()`)
- ✅ Pagination (15 items per page)
- ✅ Query scopes for common filters

### File Storage
- ✅ Store photos in public disk (accessible via URL)
- ✅ Organized folder structure: `work_orders/{id}/photos/`
- ✅ File size limits to prevent storage bloat

### Recommended
- **Image optimization** - Compress uploaded photos (reduce to 1024x768 max)
- **Thumbnail generation** - Create thumbnails for gallery view
- **CDN integration** - Serve photos from CDN for faster loading
- **Lazy loading** - Load photos on demand in gallery view

---

## Future Enhancements

1. **SMS Alerts** - Notify customers when PMS is due
2. **Email Reminders** - Automated email for missed intervals
3. **QR Code Scanning** - Scan VIN from barcode
4. **AI Anomaly Detection** - Machine learning for pattern recognition
5. **Dashboard Analytics** - Fraud trends, overdue statistics
6. **Mobile App** - Field technician app for photo upload
7. **OCR for Odometer** - Auto-read odometer from photo
8. **Geofencing** - Auto-detect when vehicle enters service center

---

## Compliance & Standards

✅ **IMPLEMENTATION_STANDARDS.md** Compliance:
- Branch management system implemented
- Soft deletes implemented
- Activity logs system integrated
- Form request validation implemented
- Following established UI patterns
- Regional defaults (PHP currency) ready

✅ **Industry Standards**:
- ISO 9001 Quality Management principles
- Automotive service industry best practices
- Data privacy (GDPR-ready with audit trails)
- Anti-fraud measures exceeding industry norms

---

## Support & Documentation

**Backend Files**:
- [Models](app/Models/) - WorkOrder.php, WorkOrderPhoto.php, OdometerReading.php
- [Controllers](app/Http/Controllers/) - WorkOrderController.php
- [Services](app/Services/) - PhotoUploadService.php, OdometerService.php
- [Requests](app/Http/Requests/) - StoreWorkOrderRequest.php, UpdateWorkOrderRequest.php
- [Migrations](database/migrations/) - 2025_10_25_*

**Frontend**: To be implemented

**Contact**: Development Team

---

## Status Summary

| Component | Status |
|-----------|--------|
| Database Migrations | ✅ Complete |
| Models | ✅ Complete |
| Services | ✅ Complete |
| Controllers | ✅ Complete |
| Request Validation | ✅ Complete |
| Routes | ✅ Complete |
| Fraud Detection Logic | ✅ Complete |
| Photo EXIF Extraction | ✅ Complete |
| Odometer Anomaly Detection | ✅ Complete |
| GPS Verification | ✅ Complete |
| Auto-Flagging System | ✅ Complete |
| Frontend Pages | ⏳ Pending |
| TypeScript Interfaces | ⏳ Pending |
| UI Components | ⏳ Pending |
| Tests | ⏳ Pending |

---

**Next Steps**: Implement frontend React/TypeScript pages following the IMPLEMENTATION_STANDARDS.md UI patterns.

---

_Generated: 2025-10-25_
