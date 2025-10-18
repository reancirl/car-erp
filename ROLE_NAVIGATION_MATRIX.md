# Role Navigation Matrix

Quick reference showing which navigation items are visible to each role.

## Navigation Visibility by Role

| Navigation Item | Admin | Service Manager | Parts Head | Sales Manager | Sales Rep | Technician | Auditor | Parts Clerk |
|----------------|-------|-----------------|------------|---------------|-----------|------------|---------|-------------|
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Sales & Customer** |
| Lead Management | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ (view) | ❌ |
| Test Drives | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ (view) | ❌ |
| Sales Pipeline | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ (view) | ❌ |
| Customer Experience | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ (view) | ✅ (view) |
| **Inventory Management** |
| Vehicle Inventory | ✅ | ✅ (view) | ✅ | ❌ | ❌ | ✅ (view) | ✅ (view) | ✅ (view) |
| **Operations** |
| PMS Work Orders | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ (limited) | ✅ (view) | ❌ |
| Service Types | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ (view) | ❌ | ❌ |
| Common Services | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ (view) | ❌ | ❌ |
| Warranty Claims | ✅ | ✅ | ✅ (view) | ❌ | ❌ | ✅ (view) | ✅ (view) | ✅ (view) |
| Parts & Accessories | ✅ | ✅ (view) | ✅ | ❌ | ❌ | ✅ (view) | ✅ (view) | ✅ (view) |
| **Analytics & Reports** |
| Performance Metrics | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Activity Logs | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Time Tracking | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Compliance & Quality** |
| Checklists | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Reminders | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Supervisor Approvals | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Administration** |
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Branch Management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Roles & Permissions | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| MFA Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Technician Navigation (Example)

When logged in as **technician@test.com**:

### ✅ Visible Sections:
- **Dashboard**
- **Operations**
  - PMS Work Orders (view, edit, complete)
  - Service Types (view only)
  - Common Services (view only)
  - Warranty Claims (view, create)
  - Parts & Accessories (view, issue, return)
- **Sales & Customer** (appears if has customer.view)
  - Customer Experience (view only)

### ❌ Hidden Sections:
- Sales & Customer (Lead Management, Test Drives, Pipeline)
- Inventory Management
- Analytics & Reports
- Compliance & Quality
- Administration

## Permission-to-Navigation Mapping

```typescript
const navPermissions: Record<string, string> = {
    // Administration
    '/admin/user-management': 'users.view',
    '/admin/branch-management': 'users.view',
    '/roles': 'users.view',
    '/settings/mfa': 'users.view',
    
    // Operations
    '/service/pms-work-orders': 'pms.view',
    '/service/service-types': 'service_types.view',
    '/service/common-services': 'common_services.view',
    '/service/warranty-claims': 'warranty.view',
    '/service/parts-inventory': 'inventory.view',
    
    // Inventory
    '/inventory/vehicles': 'inventory.view',
    
    // Sales
    '/sales/lead-management': 'sales.view',
    '/sales/test-drives': 'sales.view',
    '/sales/pipeline': 'sales.view',
    '/sales/customer-experience': 'customer.view', // ✅ FIXED: Now uses customer.view
    '/sales/performance-metrics': 'reports.view',
    
    // Audit
    '/audit/activity-logs': 'audit.view',
    '/audit/time-tracking': 'audit.view',
    '/audit/supervisor-approvals': 'audit.supervisor_override',
    
    // Compliance
    '/compliance/checklists': 'compliance.view',
    '/compliance/reminders': 'compliance.view',
};
```

## Recent Fix

**Issue Fixed:** Customer Experience showing for technician but returning 403

**Problem:** 
- Route required `sales.view` permission (in sales route group)
- Navigation required `customer.view` permission
- Technician has `customer.view` but not `sales.view`

**Solution:**
- Moved Customer Experience routes to separate route group
- Changed route permission from `sales.view` to `customer.view`
- Now matches the navigation permission mapping

**Result:** ✅ Technicians can now access Customer Experience (view only)
