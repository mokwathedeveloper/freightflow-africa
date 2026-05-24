# Solo MVP Scope — FreightFlow Hackathon

> **Africa's Talking Transportation & Logistics Hackathon**
> Date: Thursday, May 28, 2026 | 8:00 AM – 6:00 PM (GMT+3)
> Developer: Solo build

This document defines the **minimum viable product** for the hackathon demo and provides a realistic solo build timeline for pre-hackathon development and the day itself.

---

## Guiding Principle

> Build what you can demo live. A working SMS + USSD demo beats a beautiful but offline prototype every time.

The judges will see a live demo at 5:00 PM. Every feature built should be demoable in under 3 minutes.

---

## MVP Feature Set (Build This)

These 6 features form the hackathon MVP. They cover the full load lifecycle AND both AT API requirements:

### 1. User Authentication
- Phone number + password registration (Shipper / Transporter role)
- JWT-based session
- **AT SMS OTP** for phone number verification
- Login + logout

### 2. Digital Freight Marketplace
- **Shipper:** Post a load (origin, destination, cargo type, weight, delivery date)
- **Transporter:** Browse available loads with filters (origin, destination)
- **Transporter:** Accept a load → status changes to ACCEPTED
- Load status indicators: `POSTED` → `ACCEPTED` → `PICKED_UP` → `IN_TRANSIT` → `DELIVERED`

### 3. AT SMS Notifications (Core Demo Feature)
- **Load accepted** → AT SMS to shipper: *"Your load #X has been accepted by [Transporter]"*
- **Cargo picked up** → AT SMS to shipper: *"Cargo #X picked up. ETA: [time]"*
- **Delivery confirmed** → AT SMS to both: *"Cargo #X delivered successfully!"*
- New load posted matching transporter's usual route → AT SMS to transporter

### 4. AT USSD Driver Interface (Core Demo Feature)
- Shortcode: `*384*7447#` (AT sandbox)
- Menu: **1. Track Load | 2. Update Status | 3. My Jobs | 0. Exit**
- Driver selects "Update Status" → picks "Picked Up" or "In Transit" or "Delivered"
- Status updates in web dashboard in real time
- AT SMS confirmation sent to shipper automatically

### 5. Cargo Tracking Page
- Status timeline showing: POSTED → ACCEPTED → PICKED UP → IN TRANSIT → DELIVERED
- Basic map with last-known location (can be simulated/mocked for MVP)
- Timestamps for each status change
- "Who has my cargo?" — shows transporter name and phone

### 6. Role-based Dashboards
- **Shipper Dashboard:** My posted loads + status indicators + notifications feed
- **Transporter Dashboard:** Available loads + accepted jobs + quick status update button
- Minimal, clean UI — focus on core actions

---

## Deferred to v2 (After Hackathon)

| Feature | Why Deferred |
|---------|-------------|
| Voice API call alerts | Complex IVR setup, hard to demo live in 3 minutes |
| Airtime rewards | Needs real AT credits and a delivery chain to trigger |
| Admin Dashboard (multi-tenant) | No time for multi-tenant UX in solo sprint |
| Cross-border documentation | Complex file upload + verification flow |
| Reports & Analytics charts | Nice-to-have, not impactful in 3-min demo |
| Billing & M-Pesa payments | Requires Safaricom approval, out of hackathon scope |
| Marketplace listing on AT | Takes days to review and approve |

---

## Pre-Hackathon Build Plan (Before May 28)

### Day 1–2: Foundation
- [ ] Initialize GitHub repo: `freightflow`
- [ ] Set up project folder structure (per `docs/project_folder_structure.md`)
- [ ] Initialize Next.js frontend + Node.js/Express backend
- [ ] Set up PostgreSQL + Prisma schema (Users, Loads, Shipments, Notifications)
- [ ] Run Prisma migrations
- [ ] Configure `.env` with AT sandbox credentials
- [ ] Write `Dockerfile.api`, `Dockerfile.web`, `docker-compose.yml`
- [ ] Verify `docker-compose up` runs the full stack

### Day 3: Auth + Marketplace Core
- [ ] Implement user registration (Shipper / Transporter)
- [ ] Implement AT SMS OTP for phone verification
- [ ] Implement JWT login/logout
- [ ] Build Post Load form (shipper)
- [ ] Build Available Loads list (transporter)
- [ ] Implement Accept Load endpoint + AT SMS notification to shipper

### Day 4: Tracking + USSD
- [ ] Build Cargo Tracking page (status timeline + map)
- [ ] Implement status update endpoints (PICKED_UP, IN_TRANSIT, DELIVERED)
- [ ] Wire status changes to AT SMS notifications
- [ ] Implement USSD handler at `POST /api/ussd`
- [ ] Build USSD menu: Track Load | Update Status | My Jobs
- [ ] Test USSD end-to-end using AT Simulator

### Day 5: Dashboards + Polish
- [ ] Build Shipper Dashboard (loads list + notifications)
- [ ] Build Transporter Dashboard (available loads + accepted jobs)
- [ ] Polish UI: consistent colors, spacing, loading states
- [ ] Write demo credentials and test the full user journey
- [ ] Deploy to Render/Railway
- [ ] Confirm live URL works + USSD callbacks point to production

### Day 6 (May 27 — eve of hackathon): Final Check
- [ ] Run through full demo script 3 times
- [ ] Confirm AT SMS works on production
- [ ] Confirm USSD works via AT Simulator (and ideally a real phone)
- [ ] Prepare 3-minute pitch notes
- [ ] Charge laptop, pack charger
- [ ] Set alarm for 7:00 AM (arrive by 8:00 AM)

---

## Hackathon Day Timeline (May 28)

| Time | Task |
|------|------|
| 08:00–09:00 | Warm-up: check-in, team formation session, confirm GitHub repo and AT sandbox |
| 09:00–10:00 | Fix any overnight deployment issues; retest full demo flow |
| 10:00–11:30 | Sprint: any remaining MVP features or bug fixes |
| 11:30–13:00 | Polish: UI cleanup, loading states, error handling |
| 13:00–14:00 | Lunch break |
| 14:00–15:30 | Demo prep: write pitch notes, rehearse 3-minute demo, prepare live credentials |
| 15:30–16:30 | Buffer: fix critical issues if found during rehearsal |
| 16:30–17:00 | Final run-through of demo; submit hackathon idea form if not yet submitted |
| 17:00–18:00 | Demonstrations — all teams demo to judges and audience |

---

## Demo Script (3 Minutes for Judges)

**Setup before demo:** Have two browser tabs open — one logged in as Shipper, one as Transporter. Have a phone or AT Simulator ready to show USSD.

---

**Opening (15 seconds):**
> "FreightFlow is a digital freight marketplace for Africa. It connects shippers and transporters — and crucially, it works on any phone, even a basic feature phone, with no internet required."

---

**Step 1 — Post a Load (30 seconds):**
- [Shipper tab] Click "Post New Load"
- Fill form: Origin: Nairobi, Destination: Mombasa, Cargo: Electronics, 2 tons, May 30
- Click "Post Load"
- Show load appearing in marketplace

---

**Step 2 — Accept the Load (30 seconds):**
- [Transporter tab] Browse marketplace — new load appears
- Click "Accept Load"
- Show status changes to "ACCEPTED"

---

**Step 3 — Show AT SMS (30 seconds):**
- Show the AT SMS Sandbox log or a phone screen
- Read the SMS: *"FreightFlow: Your load #001 (Nairobi→Mombasa) has been accepted by John Kamau. Track at freightflow.app/track/001"*
- **"The shipper got this instantly on their phone — no internet, no app, just a text message."**

---

**Step 4 — USSD Update (45 seconds):**
- Open AT Simulator (or real phone)
- Dial `*384*7447#`
- Navigate: *"2. Update Status"* → *"1. Picked Up"*
- Show END message: *"Status updated. Shipper has been notified."*
- Switch to Shipper Dashboard — status now shows "PICKED UP" with timestamp
- **"The driver updated this status from a basic phone, no internet, just a USSD code. This reaches the 70% of East African drivers who don't have smartphones."**

---

**Closing (30 seconds):**
> "FreightFlow addresses the core gap in African freight logistics — real-time visibility and communication across ALL devices. With Africa's Talking SMS and USSD, we reach everyone: the Nairobi office manager on a dashboard and the Mombasa driver on a basic phone. The platform is live, deployed on Docker, and ready to scale."

---

## What Makes FreightFlow Win-Worthy

1. **USSD is the differentiator** — no other team will likely build working USSD. This is technically impressive and directly solves a real African problem.
2. **All AT APIs are integrated** — SMS (live), USSD (live), Voice + Airtime (specified and ready to activate)
3. **Full-stack, deployed** — not a mockup. A live URL that judges can test.
4. **Clear impact story** — "70% of East African truckers use basic phones" is a compelling, data-backed narrative.
5. **Multi-tenant architecture** — shows business scalability beyond a single company.

---

*Related: [`docs/africas_talking_integration.md`](africas_talking_integration.md) · [`docs/docker_deployment.md`](docker_deployment.md)*
