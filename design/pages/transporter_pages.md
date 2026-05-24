# FreightFlow SaaS — Transporter Pages

This Markdown file provides a **professional overview** of all Transporter-specific pages for FreightFlow SaaS, detailing their purpose, key features, and functionality.

---

## Transporter Pages

1. **Transporter Dashboard**
   - Overview of available and accepted loads
   - Summary metrics: total loads accepted, in-transit, delivered
   - Quick access to Available Loads and Notifications Panel
   - Analytics for performance tracking

2. **Available Loads**
   - List or grid of posted loads available for acceptance
   - Filter options: origin, destination, cargo type, weight, delivery date
   - Action buttons: Accept or Reject
   - Quick view of load details before accepting

3. **Accepted Jobs**
   - List of loads accepted by the transporter
   - Status indicators: `ACCEPTED` → `PICKED_UP` → `IN_TRANSIT` → `AWAITING_CONFIRMATION` → `DELIVERED`
   - **"Update Status" button** — opens a modal with status options (Picked Up / In Transit / Delivered)
   - **IMPORTANT — Delivery ownership:** The transporter marks `DELIVERED` via this button OR via USSD. This sets the load to `AWAITING_CONFIRMATION`. The **shipper then confirms** — the transporter does NOT get a final "confirmed" status until the shipper acts. This is displayed clearly to the transporter: *"Delivery reported. Waiting for shipper confirmation."*
   - Contact Shipper button — opens phone dialler with shipper's number
   - Historical completed jobs (last 30 days, exportable)

4. **Route and Tracking Page**
   - Interactive map with route visualization
   - Real-time cargo tracking and ETA updates
   - Status feed for all updates along the route
   - Action buttons: Report Issue, Contact Shipper

5. **Notifications Panel**
   - Real-time alerts for new loads, status changes, or shipment updates
   - SMS and email integration
   - Mark notifications as read/unread or dismiss
   - Contextual links to load or route details

6. **Billing / Subscription Page**
   - View current subscription plan and payment status
   - Upgrade or downgrade subscription tiers
   - Payment integration (Stripe, M-Pesa)
   - View and download billing history (CSV/PDF)

7. **Profile & Settings**
   - Update personal information: name, email, phone, vehicle details
   - Change password and security settings
   - Notification preferences
   - Role-specific configurations if applicable

---

---

## Delivery Confirmation Ownership — Transporter's Perspective

| Action | Who Does It | Interface |
|--------|-------------|-----------|
| Mark as Delivered | **Transporter** | Web "Update Status" button OR USSD `*384*7447#` → Option 3 |
| Confirm Delivery (final) | **Shipper** | Shipper dashboard — "Confirm Delivery" button |
| Auto-confirm (if shipper is idle) | **System** | After 48 hours with no action |
| Raise dispute | **Shipper** | Shipper dashboard — "Report Issue" button |

**Transporter sees:** After marking Delivered → status badge changes to `AWAITING CONFIRMATION` with a yellow indicator and the message: *"Delivery reported on [date/time]. Awaiting shipper confirmation."*

**Transporter is NOT blocked** from other work while waiting for confirmation. If shipper does not confirm within 48 hours, the system auto-confirms and the airtime reward triggers if applicable.

---

**These pages ensure a complete, professional, and user-friendly interface for Transporters, enabling efficient load management, route tracking, status updates, and delivery confirmation.**

*Related: [`docs/end_to_end_flow.md`](../../docs/end_to_end_flow.md)*

