# FreightFlow — Master End-to-End User Flow
### Complete journey: Post Load → Accept → Track → USSD Update → Confirm Delivery → Airtime Reward

This document is the **single connected reference** for the full freight lifecycle on FreightFlow. It resolves handoffs between all actors (Shipper, Transporter, System, AT APIs) and defines exactly what fires at each step. Use this during development to verify every state transition and notification.

---

## Actors

| Actor | Interface | Notes |
|-------|-----------|-------|
| **Shipper** | Web dashboard | Posts loads, tracks cargo, confirms delivery |
| **Transporter** | Web dashboard OR USSD (`*384*7447#`) | Accepts loads, updates status |
| **System (FreightFlow API)** | Backend | Manages state, fires notifications |
| **Africa's Talking** | SMS + USSD + Airtime APIs | Communication to all phone types |

---

## Full Flow Diagram

```
SHIPPER                    SYSTEM                     TRANSPORTER
   │                          │                            │
   │── POST LOAD ─────────────►│                            │
   │   (origin, dest,          │── store load (POSTED) ─────│
   │    cargo, weight,         │                            │
   │    date)                  │── AT SMS to matching ──────►│
   │                           │   transporters:            │
   │◄── Confirmation screen ───│   "New load available"     │
   │    "Load #001 posted"      │                            │
   │                           │                            │
   │                           │◄── ACCEPT LOAD ────────────│
   │                           │    (transporter clicks     │
   │◄── AT SMS ────────────────│     Accept in dashboard)   │
   │    "Load accepted by       │── update: ACCEPTED ────────│
   │     John Kamau"            │                            │
   │◄── Dashboard updates ─────│                            │
   │    status: ACCEPTED        │                            │
   │                           │                            │
   │                           │      [DRIVER ON BASIC PHONE]
   │                           │◄── USSD *384*7447# ────────│
   │                           │    "2. Update Status"       │
   │                           │    "1. Picked Up"           │
   │                           │── update: PICKED_UP ───────►│
   │◄── AT SMS ────────────────│── AT SMS to driver ────────►│
   │    "Cargo picked up"       │   "Status updated.         │
   │◄── Dashboard updates ─────│    Shipper notified."       │
   │    status: PICKED UP       │                            │
   │                           │                            │
   │                           │◄── USSD (or web) ──────────│
   │                           │    Update: IN_TRANSIT       │
   │◄── AT SMS ────────────────│                            │
   │    "Cargo in transit"      │── update: IN_TRANSIT ──────│
   │                           │                            │
   │                           │◄── USSD / web ─────────────│
   │                           │    Update: DELIVERED        │
   │◄── Confirmation prompt ───│                            │
   │    "Confirm delivery?"     │                            │
   │── CONFIRM DELIVERY ───────►│                            │
   │   + submit rating (1–5★)   │── update: DELIVERED ───────│
   │                           │── AT SMS to both ──────────►│
   │◄── AT SMS ────────────────│   "Cargo delivered! ✓"     │
   │    "Delivery confirmed"    │                            │
   │                           │                            │
   │                           │── IF rating ≥ 4★           │
   │                           │   AND on time              │
   │                           │── AT Airtime KES 20 ───────►│
   │                           │── AT SMS to driver ────────►│
   │                           │   "You earned KES 20!"     │
   │                           │                            │
```

---

## Step-by-Step State Machine

### State 1: POSTED
**Triggered by:** Shipper submits Post Load form

**What the system does:**
- Creates `Load` record in DB with status `POSTED`
- Assigns a unique `loadId` (e.g., `FF-2026-001`)
- Identifies matching transporters (same region, vehicle type can handle weight)
- Fires AT SMS to all matching transporters: *"FreightFlow: New load FF-2026-001 — Nairobi→Mombasa, 2 tons, May 30. Accept at [url]"*

**What the UI shows:**
- Shipper sees confirmation screen: *"Load #FF-2026-001 posted! Transporters in your area have been notified."*
- Load appears in Shipper Dashboard under "My Loads" with status badge `POSTED`
- Marketplace shows the load to all eligible transporters

**API endpoint:** `POST /api/loads`
**Response:** `{ loadId, status: 'POSTED', matchedTransporters: N }`

---

### State 2: ACCEPTED
**Triggered by:** Transporter clicks "Accept" on a load card

**Decision rule:** First transporter to accept wins. Load is immediately removed from marketplace.

**What the system does:**
- Updates `Load.status` to `ACCEPTED`
- Sets `Load.transporterId` to the accepting transporter
- Removes load from marketplace (not visible to other transporters)
- Fires AT SMS to shipper: *"Your load #FF-2026-001 (Nairobi→Mombasa) has been accepted by John Kamau. Track at [url]"*
- Fires AT SMS to transporter: *"You accepted load #FF-2026-001. Pickup: Nairobi Industrial Area. Contact shipper: +254712XXXXXX"*

**What the UI shows:**
- Shipper dashboard: status changes from `POSTED` → `ACCEPTED`, transporter name/phone visible
- Transporter dashboard: load moves from "Available Loads" to "Accepted Jobs"
- Other transporters: load disappears from their marketplace

**API endpoint:** `POST /api/loads/:loadId/accept`
**Guards:** Only a `TRANSPORTER` role user can call this. Load must still be in `POSTED` status.

---

### State 3: PICKED_UP
**Triggered by:** Transporter updates status — via **web dashboard** OR **USSD `*384*7447#`**

**USSD path (feature phone driver):**
```
Dial *384*7447#
→ 2. Update Delivery Status
→ [If 1 active load]: "Update Load #FF-2026-001?"
  → 1. Picked Up ✓
  → END: Status updated. Shipper has been notified.

[If 2+ active loads]: Select which load:
  → 1. Load #FF-2026-001 (Nairobi→Mombasa)
  → 2. Load #FF-2026-002 (Kisumu→Nakuru)
  → [Select] → then status options
```

**Web path:**
- Transporter clicks "Update Status" button on load card → modal with status options

**What the system does:**
- Updates `Load.status` to `PICKED_UP`
- Records `Load.pickedUpAt` timestamp
- Fires AT SMS to shipper: *"FreightFlow: Cargo #FF-2026-001 picked up at 09:45. Est. delivery: May 30, 5:00 PM."*
- Fires AT SMS to transporter (USSD only — web users get toast): *"Status updated to Picked Up. Shipper has been notified."*

**API endpoint:** `PATCH /api/loads/:loadId/status` with `{ status: 'PICKED_UP' }`

---

### State 4: IN_TRANSIT
**Triggered by:** Transporter updates status to In Transit (web or USSD)

**What the system does:**
- Updates `Load.status` to `IN_TRANSIT`
- Records `Load.transitStartedAt` timestamp
- Fires AT SMS to shipper: *"FreightFlow: Cargo #FF-2026-001 is in transit. ETA: May 30, 5:00 PM."*

**What the UI shows:**
- Shipper tracking page: timeline advances to "In Transit" step
- Map shows last known location (GPS if available; manual checkpoint if USSD only)

**Note on GPS for USSD drivers:** When a driver updates via USSD, there is no GPS coordinate. The system records the status change without a location. The tracking map shows **"Last updated: [timestamp] — Location: Driver reported In Transit via USSD."** This is honest and expected — do not show a fake pin.

---

### State 5: DELIVERED (pending shipper confirmation)
**Triggered by:** Transporter marks status as Delivered (web or USSD)

**What the system does:**
- Updates `Load.status` to `AWAITING_CONFIRMATION`
- Records `Load.deliveredAt` timestamp
- Sends shipper a push notification (web) + AT SMS: *"FreightFlow: Your driver reports Cargo #FF-2026-001 has been delivered. Please confirm delivery in your dashboard."*
- Sets a **48-hour confirmation window** — if shipper does not confirm or dispute within 48 hours, system auto-confirms

**What the UI shows:**
- Shipper dashboard: load card shows yellow banner: *"Driver reported delivery. Confirm or report an issue."*
- Two buttons: **"Confirm Delivery"** and **"Report Issue"**

---

### State 6: DELIVERED (confirmed)
**Triggered by:** Shipper clicks "Confirm Delivery" + submits star rating (1–5)

**What the system does:**
- Updates `Load.status` to `DELIVERED`
- Records `Load.confirmedAt` and `Load.rating`
- Fires AT SMS to both: *"FreightFlow: Cargo #FF-2026-001 delivered and confirmed. Thank you!"*
- **Airtime reward check:**
  - IF `rating >= 4` AND `deliveredAt <= Load.eta + 30min`
  - THEN call `AT Airtime API` → disburse KES 20 to transporter phone
  - THEN SMS transporter: *"FreightFlow: You earned KES 20 airtime for on-time delivery of Load #FF-2026-001!"*

**API endpoint:** `POST /api/loads/:loadId/confirm` with `{ rating: 4 }`

---

### State 7: DISPUTED (optional branch)
**Triggered by:** Shipper clicks "Report Issue" instead of "Confirm Delivery"

**What the system does:**
- Updates `Load.status` to `DISPUTED`
- Opens a dispute record with shipper's description
- Notifies Admin via web dashboard alert
- Freezes any payment/reward until Admin resolves
- Both parties notified: *"FreightFlow: A dispute has been raised for Load #FF-2026-001. Our team will contact you within 24 hours."*

**Resolution:** Admin reviews, updates status to `DELIVERED` or `REFUND_PENDING`. Outside hackathon MVP scope — include the status in the DB and UI but admin resolution UI can be basic for demo.

---

### State 8: CANCELLED
**Triggered by:** Shipper cancels a `POSTED` load (before any transporter accepts)

**Rule:** A load can only be cancelled while in `POSTED` status. Once `ACCEPTED`, the shipper must raise a dispute — they cannot unilaterally cancel.

**What the system does:**
- Updates `Load.status` to `CANCELLED`
- If AT SMS was sent to transporters, no retraction needed (load already removed from marketplace on accept)

---

## Complete Status Transition Map

```
POSTED
  │
  ├── Transporter accepts ──────────────────► ACCEPTED
  │                                              │
  ├── Shipper cancels ──────────────────────► CANCELLED
  │                                           (terminal)
  │
ACCEPTED
  │
  └── Driver updates via USSD/web ──────────► PICKED_UP
                                                │
                                            IN_TRANSIT
                                                │
                                        AWAITING_CONFIRMATION
                                                │
                    ┌───────────────────────────┤
                    ▼                           ▼
              DELIVERED (final)            DISPUTED
                                               │
                                    Admin resolves:
                                    DELIVERED or REFUND_PENDING
```

**Allowed transitions (enforced by API guard):**
| From | To | Who can trigger |
|------|----|-----------------|
| `POSTED` | `ACCEPTED` | Transporter only |
| `POSTED` | `CANCELLED` | Shipper only |
| `ACCEPTED` | `PICKED_UP` | Transporter only |
| `PICKED_UP` | `IN_TRANSIT` | Transporter only |
| `IN_TRANSIT` | `AWAITING_CONFIRMATION` | Transporter only |
| `AWAITING_CONFIRMATION` | `DELIVERED` | Shipper only |
| `AWAITING_CONFIRMATION` | `DISPUTED` | Shipper only |
| `AWAITING_CONFIRMATION` | `DELIVERED` | System auto (48h timeout) |
| `DISPUTED` | `DELIVERED` or `REFUND_PENDING` | Admin only |

**Any other transition is rejected with HTTP 422.**

---

## AT Notification Summary Table

| Event | Recipient | Channel | Message |
|-------|-----------|---------|---------|
| Load posted | Matching transporters | AT SMS | "New load — Nairobi→Mombasa, 2 tons. Accept: [url]" |
| Load accepted | Shipper | AT SMS | "Load #X accepted by [Name]. Track: [url]" |
| Load accepted | Transporter | AT SMS | "You accepted Load #X. Pickup: [Address]. Shipper: [Phone]" |
| Picked up | Shipper | AT SMS | "Cargo #X picked up at [time]. ETA: [date/time]" |
| USSD status update | Transporter | USSD END + AT SMS | "Status updated. Shipper notified." |
| In transit | Shipper | AT SMS | "Cargo #X in transit. ETA: [time]." |
| Awaiting confirmation | Shipper | AT SMS + web push | "Driver reports delivery. Confirm in dashboard." |
| Delivery confirmed | Both | AT SMS | "Cargo #X delivered and confirmed. Thank you!" |
| Airtime reward | Transporter | AT SMS + Airtime | "You earned KES 20 airtime for on-time delivery!" |
| Disputed | Both | AT SMS | "Dispute raised for Load #X. Our team will contact you." |

---

## API Endpoint Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/loads` | POST | Shipper | Create a new load |
| `/api/loads` | GET | Transporter | Browse available (POSTED) loads |
| `/api/loads/:id` | GET | Any | Get single load details |
| `/api/loads/:id/accept` | POST | Transporter | Accept a POSTED load |
| `/api/loads/:id/status` | PATCH | Transporter | Update status (PICKED_UP, IN_TRANSIT) |
| `/api/loads/:id/deliver` | POST | Transporter | Mark as delivered (→ AWAITING_CONFIRMATION) |
| `/api/loads/:id/confirm` | POST | Shipper | Confirm delivery + rating |
| `/api/loads/:id/dispute` | POST | Shipper | Raise dispute |
| `/api/loads/:id/cancel` | POST | Shipper | Cancel POSTED load |
| `/api/ussd` | POST | Public (AT) | USSD session handler |

---

*This document is the authoritative flow reference. Any change to status transitions, notifications, or confirmation logic must be updated here first.*

*Related: [`docs/africas_talking_integration.md`](africas_talking_integration.md) · [`design/features/notifications_alerts_ux.md`](../design/features/notifications_alerts_ux.md) · [`design/pages/authentication_pages.md`](../design/pages/authentication_pages.md)*
