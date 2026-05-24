# FreightFlow SaaS — Shipper Pages

This Markdown file provides a **professional overview** of all Shipper-specific pages for FreightFlow SaaS, detailing their purpose, key features, and functionality.

---

## Shipper Pages

1. **Shipper Dashboard**
   - Overview of all active and pending loads
   - Summary of key metrics (total loads, accepted loads, in-transit, delivered)
   - Quick access to Post New Load and Notifications Panel
   - Analytics overview: delivery efficiency, transporter response times

2. **Post New Load**
   - Form to input load details: origin, destination, cargo type, weight, delivery date
   - Preview of load before posting
   - Submit button to post load to marketplace
   - Inline validation and success confirmation

3. **View / Track Shipments**
   - List of all loads (posted, active, completed)
   - Status badges: `POSTED` `ACCEPTED` `PICKED UP` `IN TRANSIT` `AWAITING CONFIRMATION` `DELIVERED` `DELAYED` `CANCELLED`
   - Real-time tracking: GPS map for smartphone drivers; last USSD-reported status + timestamp for feature-phone drivers
   - Timeline feed of all status changes with timestamps
   - **Delivery confirmation action — owned by shipper:**
     - When status is `AWAITING CONFIRMATION`, a yellow banner appears: *"Your driver reports delivery on [date]. Please confirm."*
     - Two action buttons: **"Confirm Delivery"** (green) and **"Report Issue"** (red outlined)
     - Clicking "Confirm Delivery" opens a modal asking for a 1–5 star rating before submitting
     - Clicking "Report Issue" opens a text field to describe the problem, then submits a dispute
     - If no action taken within 48 hours, the system auto-confirms with a notice: *"Auto-confirmed after 48 hours."*

4. **Notifications Panel**
   - Real-time alerts for load acceptance, status changes, or delays
   - SMS and email integration
   - Mark notifications as read/unread or dismiss
   - Contextual links to shipment or load details

5. **Billing / Subscription Page**
   - View current subscription plan and payment status
   - Upgrade or downgrade subscription tiers
   - Payment integration (Stripe, M-Pesa)
   - View and download billing history (CSV/PDF)

6. **Profile & Settings**
   - Update personal information: name, email, phone, company details
   - Change password and security settings
   - Notification preferences
   - Role-specific configurations if applicable

---

---

## Delivery Confirmation Ownership — Shipper's Perspective

The shipper is the **final authority on delivery**. This is an explicit design decision:

| Scenario | What happens |
|----------|-------------|
| Shipper confirms within 48h | Status → `DELIVERED`, airtime reward fires if applicable |
| Shipper reports issue within 48h | Status → `DISPUTED`, admin notified |
| Shipper does nothing for 48h | System auto-confirms, status → `DELIVERED` |
| Dispute resolved by admin | Status → `DELIVERED` or `REFUND_PENDING` |

**Why shipper confirms (not transporter):** The shipper is the paying party and bears responsibility for confirming receipt. This prevents transporters from self-marking delivery without actually completing it.

---

**These pages ensure a complete, professional, and user-friendly interface for Shippers, enabling efficient load posting, tracking, delivery confirmation, and account management.**

*Related: [`docs/end_to_end_flow.md`](../../docs/end_to_end_flow.md)*