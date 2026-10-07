# Wuling ERP — Build Update (May 2026)

Features delivered in response to client feedback (Shamcey Lee, Aurelia Ropan, Vlad, Rica Pasco). Snapshot as of **2026-05-24**.

---

## Vehicle Inventory

- Car model, body type (Sedan / SUV / Hatchback), exterior & interior color
- Conduction no., VIN / Chassis no., Drive Motor no., Plate no.
- MSRP price, variant & spec details, model year (MY2024, MY2025, etc.)
- Battery capacity / range, color code for repaint matching
- Location field (Warehouse, GBF, Branch, Sold)
- Status (sold, in stock, reserved) with sub-status (reserved – with DP, reserved – no DP, for LTO, for release, body repair, etc.)
- Lock flag to block sale once reserved + paid
- LTO transaction no., CR no., OR/CR release date, emission / inspection reference
- Owner tagging once sold (vehicle linked to customer record)
- "Sold" / allocation status label on each unit
- Supporting document uploads on each vehicle (spec sheets, DOE approval, LTO docs)
- Spec / manual document upload on vehicle models

## Customer Database / CRM

- Name, company, contact number, email, address
- TIN (for invoice / BIR), government ID type & number
- Corporate authorized signatory and position
- Customer type (retail, fleet, PUV operator, AP dealer, sub-dealer)
- Lead source (walk-in, Facebook, AP, referral, event)
- Interest notes
- Preferred Wuling model
- Reservation amount, date, reference no., status (pending / confirmed / cancelled / converted)
- Reservation linked to a specific unit ID from inventory
- One customer can be linked to multiple owned vehicles
- +63 phone-number format helper
- "Prefers Viber" checkbox on contact
- Shareable customer-survey link (token-based public form)

## Sales — Leads

- Branch assignment on each lead
- Full lead CRUD with information capture
- Source & classification
- Vehicle of interest + budget range
- Tags & notes
- Initial follow-up tracking
- Bulk lead import via CSV with template download
- "Upcoming Follow-ups (Next 7 Days)" reminder card on the lead dashboard

## Sales — Pipeline

- Kanban pipeline with stage progression and auto-loss detection
- Manual phone-number entry on pipeline opportunities
- Quote amount + quote-sent status per opportunity

## Sales — Test Drives

- Test-drive calendar view
- Calendar entry shows the unit being tested (year / make / model / body type)
- E-signature capture with photo-upload fallback (for clients without a stylus or who prefer to attach a signed letter)
- Acknowledgement & agreement displayed as a checkbox checklist
- E-sign rate metric on the test-drive dashboard
- Insurance verification check on the client before approval

## Reservations & Allocation

- Reservation module with date, payment type, dealer / branch, target release date, remarks
- Every reservation linked to a specific unit ID
- Allocation status reflected on the unit ("Allocated to [Customer] – Reservation Ref #")
- Reservation overview page with "Add New Customer" inline flow

## Once Sold — Sales & Financing

- Owner tagging on sale
- Date of release, release approval (who cleared) with timestamp
- Payment method (cash, bank financing, in-house)
- Proof of payment attachments
- Dealer, sales agent, assigned driver
- GPS details, insurance details
- Promo / freebies tracking
- Pricing breakdown: SRP, discount, net selling price
- DP amount & date, balance financed
- Bank / financing institution, financing terms (months, rate, monthly amortization)
- Chattel mortgage details (for in-house)
- Sales invoice no., DR no., OR numbers
- Release checklist status (PDI done, accessories installed, insurance active, OR/CR ready)
- Freebies list with cost and "who shoulders" (HQ / Cebu / Other dealer) — gives true margin per unit
- Warranty start date (set on release) + warranty end date (auto-computed)

## PMS Work Orders

- Full PMS work-orders module (create, edit, view, delete, restore)
- Schedule, request date, history, actual PMS date
- JO number
- Mechanic / technician attending
- Job type (PMS, warranty, accident, customer-pay)
- Labor hours & labor cost (with start / end timestamps for actual duration)
- Parts list with part numbers, qty, cost, SRP
- Repair details, photos, replaced parts
- Warranty claim flag on work orders
- Odometer reading per PMS (with fraud-prevention validation)
- Next PMS due (km and / or date)
- Notes on recurring issues

## Service Types & Common Services

- Service Types module with full CRUD, filtering, category stats
- Common Services module with full CRUD
- Pricing in PHP (₱), formatted with Philippine locale

## Warranty Claims

- Warranty Claims module with full CRUD
- New Claim flow with parts + services + photos captured in one transaction
- Export CSV button on the warranty claims index, with filters carried through to the export URL

## Parts Inventory

- Parts inventory CRUD
- QR / barcode scanner that auto-fills part details on scan
- Scan history per session

## Compliance & Attachments

- Polymorphic documents table — financing agreements, LTO docs (OR/CR scans), insurance policies, signed delivery receipts / release waivers all attach to their parent record
- Compliance checklist templates with trigger-based auto-assignment
- Compliance reminder events with escalation

## Users & Access Control

- Per-user fields: name, email, designation (via role), branch assignment
- Multi-tenant branch scoping throughout
- Access levels: Admin, Sales Rep, Sales Manager, Service Manager, Technician, Parts Clerk, Parts Head, Accounting, Auditor (each with granular permissions)
- 65+ granular permissions mapped to modules
- MFA / OTP required for sensitive deletes
- Full activity / audit log: who changed what, when (with branch context)
- Editable branch information (name, code, address, city, phone, email, status, coordinates)

## Dashboard / UX

- Comma-formatted prices throughout (₱2,500,000.00)
- Sidebar visually distinct from main area (Shadcn sidebar tokens)
- Dashboard calendar shows test drives, PMS schedules, and branch events for the next 14 days
- Term "cadences" no longer appears anywhere in the UI

## KPI / Metrics

- Customer satisfaction rating captured and surfaced in performance metrics
- Compliance progress tracked as a percentage on each checklist assignment
- Aftersales reports module

## Clarifications

- **E-sign rate** = percentage of test-drive reservations with a signed digital waiver (counted as confirmed). Visible on the test-drive dashboard card.
- **Insurance verification on test drive** = verifies the *client's* insurance before approval, shown with a red / green indicator.
