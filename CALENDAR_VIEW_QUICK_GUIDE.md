# Calendar View Quick Guide - Test Drive Module

## Accessing the Calendar

### From Test Drives List
1. Go to **Sales & Customer** → **Test Drives**
2. Click the **"Calendar View"** button in the top right
3. Calendar opens in Month view by default

### Direct URL
Navigate to: `/sales/test-drives/calendar`

## View Modes

### 📅 Month View
**Best for:** Overview of the entire month

**Features:**
- Full month calendar grid
- See all days at once
- Up to 3 reservations shown per day
- "+X more" indicator for additional bookings
- Click any day to select it
- Today highlighted in blue

**How to use:**
- Scan the month for busy/free days
- Click on a day to see more details
- Click on a reservation to view full details

### 📊 Week View
**Best for:** Detailed weekly schedule with time slots

**Features:**
- 7-day week layout
- Hourly time slots (8 AM - 8 PM)
- Reservations in their scheduled time
- Today's column highlighted
- Horizontal scroll on mobile

**How to use:**
- See exact timing of all reservations
- Identify time slot conflicts
- Plan daily schedules
- Check staff assignments

### 📋 Day View
**Best for:** Detailed daily schedule and planning

**Features:**
- Hour-by-hour breakdown
- Full reservation details
- Customer and vehicle info
- Day summary statistics
- Quick actions sidebar

**How to use:**
- Manage daily operations
- See complete reservation details
- Check day statistics
- Quick access to create new reservation

## Navigation

### Date Navigation
**Previous/Next Buttons:**
- ⬅️ **Previous** - Go back (month/week/day)
- ➡️ **Next** - Go forward (month/week/day)

**Today Button:**
- Click **"Today"** to jump to current date
- Works in all view modes

### View Switching
Click the view buttons to switch:
- **Month** - Full month grid
- **Week** - 7-day schedule
- **Day** - Single day detail

Active view is highlighted in blue.

## Understanding the Calendar

### Status Colors

| Color | Status | Meaning |
|-------|--------|---------|
| 🟢 Green | Confirmed | Ready for test drive |
| 🟡 Yellow | Pending Signature | Awaiting customer signature |
| 🔵 Blue | In Progress | Test drive happening now |
| ⚪ Gray | Completed | Test drive finished |
| 🔴 Red | Cancelled | Reservation cancelled |
| 🟠 Orange | No Show | Customer didn't arrive |

### Status Icons
- ✓ **CheckCircle** - Confirmed/Completed
- 📝 **FileSignature** - Pending Signature
- 🚗 **Car** - In Progress
- ⚠️ **AlertTriangle** - Cancelled/No Show
- 🕐 **Clock** - Other statuses

### Reservation Cards

**Month View Card:**
```
⏰ 10:00 AM
John Doe
```

**Week View Card:**
```
10:00
John Doe
```

**Day View Card:**
```
⏰ 10:00 AM  [30 min]  [TD-2025-001]
👤 John Doe
🚗 2024 Honda Civic LX - Silver
👤 Sarah Sales Rep
```

## Common Tasks

### View a Reservation
1. Find the reservation on the calendar
2. Click on the colored card
3. Opens full details page

### Create New Reservation
**Option 1:** From Calendar
- Click **"New Reservation"** button (top right)

**Option 2:** From Day View
- Switch to Day view
- Click **"New Reservation"** in Quick Actions sidebar

### Check Availability
1. Navigate to desired date
2. Switch to Day or Week view
3. Look for empty time slots
4. Green = available, filled = booked

### Find a Specific Date
1. Use Previous/Next buttons to navigate
2. Or click **"Today"** then navigate from there
3. Click on days in Month view to jump to them

### See Today's Schedule
1. Click **"Today"** button
2. Switch to **Day** view
3. See all today's reservations with details

### Check Weekly Schedule
1. Navigate to desired week
2. Switch to **Week** view
3. See all 7 days with time slots

### View Monthly Overview
1. Navigate to desired month
2. Switch to **Month** view
3. See distribution across the month

## Tips & Tricks

### 💡 Quick Tips

**Efficient Navigation:**
- Use **Today** button to reset to current date
- Click days in Month view to jump to them
- Use keyboard shortcuts (future feature)

**Best Practices:**
- Start with Month view for overview
- Switch to Week view for detailed planning
- Use Day view for daily operations
- Check calendar before creating new reservations

**Time Management:**
- Morning slots: 8 AM - 12 PM
- Afternoon slots: 12 PM - 5 PM
- Evening slots: 5 PM - 8 PM

**Color Coding:**
- Yellow reservations need attention (signature pending)
- Blue reservations are active (in progress)
- Green reservations are ready to go

### 📱 Mobile Usage

**On Smartphones:**
- Month view works best in portrait
- Week view better in landscape
- Day view optimized for portrait
- Swipe to scroll horizontally in Week view

**On Tablets:**
- All views work well
- Use landscape for Week view
- Portrait for Day view
- Touch-friendly buttons

### 🖥️ Desktop Usage

**Keyboard Shortcuts (Future):**
- Arrow keys to navigate dates
- M/W/D to switch views
- T to go to today
- N to create new reservation

**Mouse:**
- Click to select dates
- Click cards to view details
- Hover for tooltips (future)

## Troubleshooting

### Calendar shows no reservations
**Possible causes:**
- No reservations scheduled for this period
- Branch filter applied (non-admin users)
- Date range outside loaded data

**Solution:**
- Navigate to different dates
- Check if reservations exist in List view
- Contact admin if you should see data

### Can't see other branches
**Cause:** You're not an admin user

**Explanation:** Non-admin users only see their own branch's reservations for security.

**Solution:** Contact admin for cross-branch visibility if needed.

### "+X more" indicator
**Meaning:** More than 3 reservations on this day

**Solution:**
- Click the day to select it
- Switch to Day view to see all reservations
- Or click directly on visible cards

### Time slots empty but reservations exist
**Cause:** Reservations outside 8 AM - 8 PM range

**Solution:** Check List view for all reservations

### Calendar not updating
**Cause:** Browser cache or stale data

**Solution:**
- Refresh the page (F5 or Cmd+R)
- Clear browser cache
- Navigate away and back

## Keyboard Shortcuts (Coming Soon)

| Key | Action |
|-----|--------|
| ← | Previous period |
| → | Next period |
| T | Today |
| M | Month view |
| W | Week view |
| D | Day view |
| N | New reservation |
| / | Search |
| ? | Help |

## Integration with Other Features

### From Calendar to:
- **Detail View** - Click any reservation card
- **Edit Form** - Click reservation, then Edit button
- **Create Form** - Click "New Reservation" button
- **List View** - Click "Back to List" button

### From Other Pages to Calendar:
- **List View** - Click "Calendar View" button
- **Detail View** - Navigate via breadcrumbs
- **Create Form** - Cancel and use breadcrumbs

## Best Practices

### For Sales Representatives
1. Check calendar every morning
2. Review day's schedule in Day view
3. Update statuses as test drives progress
4. Mark no-shows promptly
5. Keep notes updated

### For Sales Managers
1. Use Month view for capacity planning
2. Check Week view for staff allocation
3. Monitor pending signatures (yellow)
4. Track completion rates
5. Identify busy/slow periods

### For Administrators
1. Monitor all branches
2. Balance workload across staff
3. Identify scheduling patterns
4. Plan resource allocation
5. Review utilization rates

## Frequently Asked Questions

### Q: How far ahead can I see reservations?
**A:** Calendar loads 2 months forward and 1 month back (3 months total).

### Q: Can I create a reservation from the calendar?
**A:** Currently, click "New Reservation" button. Inline creation coming soon.

### Q: Can I reschedule by dragging?
**A:** Not yet. Use the Edit form to reschedule. Drag-and-drop coming soon.

### Q: Why can't I see past reservations?
**A:** Calendar shows 1 month back. Use List view for older records.

### Q: Can I print the calendar?
**A:** Print functionality coming soon. Use browser print for now.

### Q: How do I filter by status?
**A:** Status filtering coming soon. Currently shows all statuses with color coding.

### Q: Can I export the calendar?
**A:** Export functionality coming soon. Use List view export for now.

### Q: What if I have reservations before 8 AM or after 8 PM?
**A:** They won't show in Week/Day view. Check List view or adjust time range in code.

## Support

### Need Help?
- Check this guide first
- Review full documentation: `CALENDAR_VIEW_IMPLEMENTATION.md`
- Contact IT Support: [support@dealership.com]
- Call Help Desk: [phone number]

### Report Issues
- Bug reports: [bug-tracker-url]
- Feature requests: [feature-request-url]
- UI/UX feedback: [feedback-url]

### Training Resources
- Video tutorial: [Coming soon]
- Interactive demo: [Coming soon]
- Training sessions: Contact HR

---

**Last Updated:** January 2025
**Version:** 1.0
**Module:** Test Drive Management - Calendar View
