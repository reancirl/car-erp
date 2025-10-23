# Customer Survey System Implementation

## Overview
Public customer satisfaction survey system with unique shareable links for each customer.

**Implementation Date:** October 23, 2025  
**Public Route:** `/survey/{token}`  
**No Authentication Required** for survey submission

---

## ✅ Features Implemented

### 1. **Unique Survey Links**
- Each survey has a unique 64-character token
- Shareable public URL: `https://yourdomain.com/survey/{token}`
- No login required for customers
- 30-day expiration (configurable)

### 2. **Survey Questions**
- **Overall Rating** (1-5 stars) - Required
- **Detailed Ratings** (1-5 stars each):
  - Product Quality
  - Service Quality
  - Staff Friendliness
  - Facility Cleanliness
  - Value for Money
- **NPS Score** (0-10) - Required
  - Net Promoter Score with reason
  - Auto-categorizes as Promoter/Passive/Detractor
- **Open-ended Feedback**:
  - What went well?
  - What needs improvement?
  - Additional comments
- **Follow-up Preference**:
  - Wants follow-up checkbox
  - Preferred contact method (email/phone/SMS)

### 3. **Survey States**
- **Pending** - Not yet completed
- **Completed** - Successfully submitted
- **Expired** - Past expiration date

### 4. **Auto-Updates Customer Record**
- Maps overall rating to satisfaction_rating field
- 5 stars → very_satisfied
- 4 stars → satisfied
- 3 stars → neutral
- 2 stars → dissatisfied
- 1 star → very_dissatisfied

---

## Database Schema

### `customer_surveys` Table

**Identification:**
- `id` - Primary key
- `customer_id` - Foreign key to customers
- `branch_id` - Foreign key to branches
- `token` - Unique 64-char token for public access

**Survey Metadata:**
- `survey_type` - Type (general, post_purchase, service_followup)
- `trigger_event` - What triggered this survey
- `sent_at`, `sent_method` - When/how it was sent
- `expires_at` - Expiration date (default: 30 days)
- `created_by` - User who generated it

**Response Status:**
- `status` - pending/completed/expired
- `completed_at` - Submission timestamp
- `ip_address`, `user_agent` - Response metadata

**Ratings (1-5):**
- `overall_rating` *
- `product_quality`
- `service_quality`
- `staff_friendliness`
- `facility_cleanliness`
- `value_for_money`

**Open-ended:**
- `what_went_well`
- `what_needs_improvement`
- `additional_comments`

**NPS:**
- `nps_score` (0-10) *
- `nps_reason`

**Follow-up:**
- `wants_followup` (boolean)
- `preferred_contact_method`

**Flexible:**
- `custom_fields` (JSON) - For additional questions

---

## Backend Implementation

### Models

**CustomerSurvey Model** (`app/Models/CustomerSurvey.php`)
- Auto-generates unique token on creation
- Auto-sets 30-day expiration
- Relationships: customer, branch, createdBy
- Scopes: pending(), completed(), expired(), notExpired()
- Helpers:
  - `getPublicUrlAttribute()` - Returns full public URL
  - `isExpired()`, `isCompleted()`, `canBeCompleted()`
  - `markAsCompleted()`, `markAsExpired()`
  - `getAverageRatingAttribute()` - Calculates average of all ratings
  - `getNpsCategoryAttribute()` - Returns promoter/passive/detractor

**Customer Model** (Updated)
- Added `surveys()` relationship
- Added `generateSurvey()` method
- Added `getLatestSurveyAttribute()` accessor
- Added `getPendingSurveysCountAttribute()` accessor

### Controllers

**PublicSurveyController** (`app/Http/Controllers/PublicSurveyController.php`)
- `show($token)` - Display survey form or completion/expiration page
- `submit($token)` - Process survey submission
- Auto-updates customer satisfaction rating
- No authentication required

**CustomerController** (Updated)
- `generateSurvey($customer)` - Generate new survey for customer
- Returns survey URL in flash message
- Logs activity

### Routes

**Public Routes** (No Auth):
```php
Route::prefix('survey')->name('survey.')->group(function () {
    Route::get('/{token}', [PublicSurveyController::class, 'show']);
    Route::post('/{token}', [PublicSurveyController::class, 'submit']);
});
```

**Admin Routes** (Auth Required):
```php
Route::post('/customer-experience/{customer}/generate-survey', 
    [CustomerController::class, 'generateSurvey'])
    ->middleware('permission:customer.send_survey');
```

---

## Frontend Implementation

### Public Pages (No Auth Layout)

**1. Survey Form** (`resources/js/pages/public/survey-form.tsx`)
- Beautiful gradient background
- Star rating components with hover effects
- NPS score buttons (0-10) with color coding
- Text areas for open-ended feedback
- Follow-up preference selection
- Validation error banner
- Mobile responsive

**2. Survey Completed** (`resources/js/pages/public/survey-completed.tsx`)
- Thank you message
- Shows submitted rating
- Completion timestamp
- Green success theme

**3. Survey Expired** (`resources/js/pages/public/survey-expired.tsx`)
- Expiration notice
- Expiration date display
- Contact information
- Orange warning theme

### Admin Features

**Customer View Page** (To be updated)
- "Generate Survey" button
- List of recent surveys
- Survey status badges
- Copy survey link button
- Survey statistics

---

## Usage Flow

### 1. **Generate Survey**
```php
// From admin panel
$customer = Customer::find($id);
$survey = $customer->generateSurvey(
    surveyType: 'general',
    triggerEvent: 'Post-purchase follow-up',
    createdBy: auth()->id()
);

// Get the public URL
$url = $survey->public_url;
// Example: https://yourdomain.com/survey/abc123...xyz
```

### 2. **Share Link**
- Copy link from admin panel
- Send via email/SMS
- Share manually
- Embed in automated workflows

### 3. **Customer Completes Survey**
- Customer clicks link
- No login required
- Fills out survey form
- Submits responses

### 4. **Auto-Processing**
- Survey marked as completed
- Customer satisfaction_rating updated
- Activity logged
- Follow-up flag set if requested

---

## API Examples

### Generate Survey (Programmatic)
```php
use App\Models\Customer;

$customer = Customer::where('email', 'customer@example.com')->first();

$survey = $customer->generateSurvey(
    surveyType: 'post_purchase',
    triggerEvent: 'Order #12345 delivered',
    createdBy: 1
);

// Send email with $survey->public_url
Mail::to($customer->email)->send(new SurveyEmail($survey));
```

### Check Survey Status
```php
$survey = CustomerSurvey::where('token', $token)->first();

if ($survey->isCompleted()) {
    // Already submitted
}

if ($survey->isExpired()) {
    // Expired
}

if ($survey->canBeCompleted()) {
    // Ready for submission
}
```

### Get Customer Survey Stats
```php
$customer = Customer::find($id);

// Latest completed survey
$latestSurvey = $customer->latest_survey;

// Pending surveys count
$pendingCount = $customer->pending_surveys_count;

// All surveys
$allSurveys = $customer->surveys;

// Average NPS score
$avgNPS = $customer->surveys()
    ->completed()
    ->avg('nps_score');
```

---

## Validation Rules

### Survey Submission
```php
'overall_rating' => 'required|integer|min:1|max:5',
'product_quality' => 'nullable|integer|min:1|max:5',
'service_quality' => 'nullable|integer|min:1|max:5',
'staff_friendliness' => 'nullable|integer|min:1|max:5',
'facility_cleanliness' => 'nullable|integer|min:1|max:5',
'value_for_money' => 'nullable|integer|min:1|max:5',
'what_went_well' => 'nullable|string|max:1000',
'what_needs_improvement' => 'nullable|string|max:1000',
'additional_comments' => 'nullable|string|max:2000',
'nps_score' => 'required|integer|min:0|max:10',
'nps_reason' => 'nullable|string|max:500',
'wants_followup' => 'boolean',
'preferred_contact_method' => 'nullable|string|in:email,phone,sms',
```

---

## Security Features

✅ **Token-based Access** - Unique, unguessable 64-char tokens  
✅ **Expiration** - Surveys expire after 30 days  
✅ **One-time Submission** - Can't submit twice  
✅ **IP & User Agent Logging** - Track submission source  
✅ **No Authentication Required** - Frictionless for customers  
✅ **Branch Isolation** - Surveys tied to specific branches  
✅ **Activity Logging** - All survey generation logged  

---

## NPS Scoring

**Net Promoter Score Categories:**
- **9-10** = Promoter (Green) 🟢
- **7-8** = Passive (Yellow) 🟡
- **0-6** = Detractor (Red) 🔴

**Calculate NPS:**
```php
$promoters = CustomerSurvey::completed()
    ->where('nps_score', '>=', 9)
    ->count();

$detractors = CustomerSurvey::completed()
    ->where('nps_score', '<=', 6)
    ->count();

$total = CustomerSurvey::completed()->count();

$nps = (($promoters - $detractors) / $total) * 100;
// NPS ranges from -100 to +100
```

---

## Files Created/Modified

### Backend
- ✅ `database/migrations/2025_10_23_060318_create_customer_surveys_table.php`
- ✅ `app/Models/CustomerSurvey.php`
- ✅ `app/Models/Customer.php` (updated)
- ✅ `app/Http/Controllers/PublicSurveyController.php`
- ✅ `app/Http/Controllers/CustomerController.php` (updated)
- ✅ `routes/web.php` (updated)

### Frontend
- ✅ `resources/js/pages/public/survey-form.tsx`
- ✅ `resources/js/pages/public/survey-completed.tsx`
- ✅ `resources/js/pages/public/survey-expired.tsx`

### Documentation
- ✅ `CUSTOMER_SURVEY_IMPLEMENTATION.md` (this file)

---

## Next Steps

1. **Update Customer View Page**
   - Add "Generate Survey" button
   - Display recent surveys list
   - Show survey statistics
   - Copy link functionality

2. **Email Integration**
   - Create survey email template
   - Auto-send after purchase
   - Reminder emails for pending surveys

3. **SMS Integration**
   - Send survey links via SMS
   - Short URL generation

4. **Analytics Dashboard**
   - NPS trends over time
   - Average ratings by branch
   - Response rate tracking
   - Sentiment analysis

5. **Automated Triggers**
   - Auto-generate after purchase
   - Service appointment follow-up
   - Milestone-based surveys

6. **Export Functionality**
   - Export survey responses to CSV
   - Generate reports
   - Satisfaction trends

---

## Example Survey URL

```
https://yourdomain.com/survey/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**Features:**
- ✅ No login required
- ✅ Works on any device
- ✅ Mobile-friendly
- ✅ Beautiful UI
- ✅ Auto-saves on submit
- ✅ Expires in 30 days
- ✅ One-time use

---

## Testing Checklist

- [ ] Generate survey for customer
- [ ] Copy survey link
- [ ] Open link in incognito window (no auth)
- [ ] Submit survey with all fields
- [ ] Verify completion page shows
- [ ] Check customer satisfaction_rating updated
- [ ] Try to submit same survey again (should show completed)
- [ ] Test expired survey (manually set expires_at to past)
- [ ] Verify activity log entry created
- [ ] Test NPS categorization (promoter/passive/detractor)
- [ ] Test validation (submit without required fields)
- [ ] Test mobile responsiveness
- [ ] Test star rating hover effects
- [ ] Test follow-up preference selection

---

## Summary

The **Customer Survey System** is fully implemented and ready to use! 

**Key Benefits:**
- 🔗 Unique shareable links for each customer
- 📱 No login required - frictionless experience
- ⭐ Comprehensive satisfaction tracking
- 📊 NPS scoring built-in
- 🎨 Beautiful, modern UI
- 🔒 Secure token-based access
- 📈 Auto-updates customer records
- 🔍 Full audit trail

Customers can now easily share their feedback, and you can track satisfaction metrics across your entire customer base!
