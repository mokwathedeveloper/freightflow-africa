# FreightFlow SaaS — User Journey Maps
### Three Personas: Shipper · Transporter · Admin

This document maps the complete emotional and functional journey of each user type — from first awareness through daily use. It identifies touchpoints, AT API intersections, pain points, and the moments that make or break the experience.

---

## How to Read These Maps

Each journey is broken into **stages**. For each stage:

| Column | What it means |
|--------|---------------|
| **Stage** | Where the user is in their journey |
| **User Goal** | What they are trying to accomplish |
| **Actions** | What they do on FreightFlow |
| **AT API Touchpoint** | Which Africa's Talking API is involved |
| **Emotion** | How the user feels (😊 positive / 😐 neutral / 😟 frustration) |
| **Pain Point** | What could go wrong |
| **Design Response** | How FreightFlow addresses the pain |

---

## Journey 1 — The Shipper

**Persona:** Grace Wanjiku, 38. Operations Manager at a Nairobi SME. Ships goods to Mombasa, Kisumu, and Eldoret monthly. Currently books transporters by phone and WhatsApp. Frustrated by poor visibility and unreliable drivers.

### Stage 1: Awareness & Sign Up

| Element | Detail |
|---------|--------|
| **Goal** | Understand what FreightFlow is and create an account |
| **Touchpoints** | Landing page → Role selection → Sign Up form → OTP screen |
| **Actions** | Reads value proposition; selects "I'm a Shipper"; fills name, phone, company; receives OTP |
| **AT API** | **SMS API** — OTP verification code sent to phone |
| **Emotion** | 😊 Curious, cautiously optimistic |
| **Pain Point** | Doesn't trust another new platform; worried about giving her phone number |
| **Design Response** | Landing page leads with social proof (testimonials, partner logos). OTP copy reassures: *"We'll only use this to verify your identity."* No email required — reduces friction |

---

### Stage 2: First Load Post

| Element | Detail |
|---------|--------|
| **Goal** | Post a load and get a transporter quickly |
| **Touchpoints** | Shipper Dashboard → Post New Load form → Confirmation screen |
| **Actions** | Fills in origin (Nairobi), destination (Mombasa), cargo type (electronics), weight (2 tons), date (May 30) → clicks "Post Load" |
| **AT API** | **SMS API** — AT SMS fires to all matching transporters: *"New load available — Nairobi→Mombasa, 2 tons"* |
| **Emotion** | 😊 Purposeful, slightly anxious ("Will anyone accept?") |
| **Pain Point** | Form is confusing; doesn't know what "cargo type" categories to use; unsure if the load is visible to anyone |
| **Design Response** | Cargo type is a dropdown (not free text). After posting, confirmation screen says: *"Load #FF-001 posted! 7 transporters in your area have been notified by SMS."* — exact number of notifications sent builds confidence |

---

### Stage 3: Waiting for Acceptance

| Element | Detail |
|---------|--------|
| **Goal** | Know that someone has seen and is considering her load |
| **Touchpoints** | Dashboard — POSTED status badge |
| **Actions** | Checks dashboard periodically; may close browser and go back to work |
| **AT API** | None yet (waiting state) |
| **Emotion** | 😐 Mild anxiety — "What if no one accepts?" |
| **Pain Point** | No feedback that anyone has seen the load; feels like shouting into a void |
| **Design Response** | Dashboard shows: *"Load #FF-001 — 3 transporters viewed, 0 accepted. Posted 2 hours ago."* View count is reassuring even before acceptance. If no acceptance after 6 hours, system nudges: *"Tip: Add a competitive rate to attract faster acceptance."* |

---

### Stage 4: Load Accepted

| Element | Detail |
|---------|--------|
| **Goal** | Know who is transporting her goods and feel confident in them |
| **Touchpoints** | AT SMS on phone → Dashboard refresh |
| **Actions** | Receives SMS; opens dashboard; views transporter profile (name, vehicle, rating) |
| **AT API** | **SMS API** — *"Your load #FF-001 has been accepted by John Kamau (⭐4.8). Track at [url]"* |
| **Emotion** | 😊 Relief, excitement |
| **Pain Point** | Doesn't know if the transporter is trustworthy |
| **Design Response** | Transporter card on dashboard shows: name, photo, vehicle type/plate, star rating, number of completed deliveries. No anonymous transporters |

---

### Stage 5: Cargo in Transit

| Element | Detail |
|---------|--------|
| **Goal** | Know where her goods are at any point |
| **Touchpoints** | AT SMS updates → Tracking page |
| **Actions** | Receives SMS when driver picks up, goes in transit; checks tracking page |
| **AT API** | **SMS API** — pickup notification + in-transit update. For USSD drivers: last reported checkpoint shown on tracking page |
| **Emotion** | 😊 Informed and in control |
| **Pain Point** | Driver is on a basic phone — no GPS. Tracking page shows nothing moving |
| **Design Response** | Tracking page shows status timeline prominently even without GPS: *"Driver updated status via mobile: In Transit • Last update: 2:15 PM, Mtito Andei."* Timeline is the primary tracking — map is secondary |

---

### Stage 6: Delivery Confirmation

| Element | Detail |
|---------|--------|
| **Goal** | Confirm goods arrived and close the loop |
| **Touchpoints** | AT SMS → Dashboard → Confirm Delivery modal |
| **Actions** | Receives SMS *"Driver reports delivery"*; opens dashboard; clicks "Confirm Delivery"; gives 5-star rating |
| **AT API** | **SMS API** — delivery report received + confirmation SMS sent after she confirms |
| **Emotion** | 😊 Satisfied, grateful |
| **Pain Point** | She confirms but the goods were damaged — no clear path to dispute |
| **Design Response** | "Confirm Delivery" and "Report Issue" are equally prominent — not a tiny link. Report Issue opens a text field and optional photo upload. Dispute is logged immediately |

---

### Stage 7: Repeat Use

| Element | Detail |
|---------|--------|
| **Goal** | Make FreightFlow her default booking method |
| **Touchpoints** | Dashboard → history → re-post load with 1 click |
| **Actions** | Views delivery history; reposts a similar load; filters for John Kamau specifically |
| **AT API** | **SMS API** — new load notifies preferred transporter first (if feature enabled) |
| **Emotion** | 😊 Confident, habitual |
| **Pain Point** | Has to re-enter all load details every time |
| **Design Response** | "Re-post similar load" button on completed load card — pre-fills the form. Favourite transporter option for fast matching |

---

## Journey 2 — The Transporter

**Persona:** John Kamau, 42. Independent truck owner-driver. Runs a 7-ton truck on the Nairobi–Mombasa route. Currently finds loads through a broker who takes 15% commission. Has a smartphone but often drives with it on silent. Wants more direct loads and better pay.

### Stage 1: Discovery & Sign Up

| Element | Detail |
|---------|--------|
| **Goal** | Join a platform that finds him loads directly, without a broker |
| **Touchpoints** | Referral from another driver → Landing page → Role selection → Sign Up (Transporter) |
| **Actions** | Selects "I'm a Transporter"; fills name, phone, vehicle type (7-ton truck), number plate; receives OTP |
| **AT API** | **SMS API** — OTP verification |
| **Emotion** | 😊 Hopeful, slightly sceptical ("Is this better than my broker?") |
| **Pain Point** | Signup asks for number plate — feels like surveillance |
| **Design Response** | Helper text: *"Your number plate helps shippers verify your vehicle — it builds trust and gets you more loads."* Frames it as a benefit, not a requirement |

---

### Stage 2: Browsing Available Loads (Smartphone)

| Element | Detail |
|---------|--------|
| **Goal** | Find a load that matches his route and truck capacity |
| **Touchpoints** | Transporter Dashboard → Available Loads page |
| **Actions** | Filters by Origin: Nairobi, Destination: Mombasa, Weight: up to 7 tons; browses load cards |
| **AT API** | **SMS API** — he was already notified by SMS when a matching load was posted |
| **Emotion** | 😐 Focused, scanning quickly |
| **Pain Point** | Too many loads shown, can't tell which are worth it |
| **Design Response** | Each load card shows: origin → destination, weight, cargo type, posted time, distance from current location (if location permission granted). Sort by "Best match" (route + weight) by default |

---

### Stage 3: Accepting a Load (Smartphone)

| Element | Detail |
|---------|--------|
| **Goal** | Accept a good load before another transporter takes it |
| **Touchpoints** | Load detail modal → Accept button → Confirmation |
| **Actions** | Clicks load card → reviews details → clicks "Accept Load" → confirmation modal |
| **AT API** | **SMS API** — receives SMS: *"You accepted Load #FF-001. Pickup: Industrial Area Nairobi. Shipper: +254712XXXXXX"* |
| **Emotion** | 😊 Decisive, slightly competitive |
| **Pain Point** | Clicks Accept but load was already taken (race condition) |
| **Design Response** | If another transporter accepted first: toast message *"Sorry, this load was just taken. Here are similar loads."* — immediately shows 3 alternatives. Never a dead end |

---

### Stage 4: Pickup & Status Update (Basic Phone — USSD)

| Element | Detail |
|---------|--------|
| **Goal** | Tell the shipper he has picked up the cargo |
| **Touchpoints** | USSD `*384*7447#` on feature phone |
| **Actions** | Dials shortcode → selects "2. Update Delivery Status" → selects "1. Picked Up" → gets END confirmation |
| **AT API** | **USSD API** (status update) + **SMS API** (confirmation back to driver + notification to shipper) |
| **Emotion** | 😊 Empowered — he can update without a smartphone |
| **Pain Point** | Doesn't remember the USSD shortcode |
| **Design Response** | When load is accepted, SMS to driver includes: *"To update status on any phone, dial *384*7447#"* — the code is always one SMS away |

---

### Stage 5: Delivery & Reward

| Element | Detail |
|---------|--------|
| **Goal** | Complete the job and get paid/rewarded |
| **Touchpoints** | USSD "Delivered" update → wait for shipper confirmation → AT Airtime reward |
| **Actions** | Updates status to Delivered via USSD or app; waits for shipper to confirm; receives KES 20 airtime |
| **AT API** | **USSD API** (status update) + **Airtime API** (KES 20 reward) + **SMS API** (reward notification) |
| **Emotion** | 😊 Proud, motivated to maintain rating |
| **Pain Point** | Shipper doesn't confirm for days — feels uncertain |
| **Design Response** | Driver sees *"Delivery reported. Awaiting shipper confirmation (auto-confirms in 48h)."* No ambiguity about the timeline |

---

### Stage 6: Repeat Use

| Element | Detail |
|---------|--------|
| **Goal** | Make FreightFlow his primary load source |
| **Touchpoints** | SMS notifications → Dashboard → Accept loads |
| **AT API** | **SMS API** — proactive matching notifications keep him engaged without opening the app |
| **Emotion** | 😊 Loyal, tells other drivers about FreightFlow |
| **Pain Point** | Gets too many SMS notifications and mutes the number |
| **Design Response** | Notification preferences in Profile: "Notify me for loads on these routes only" + quiet hours setting (e.g., no SMS after 10 PM) |

---

## Journey 3 — The Admin / Platform Operator

**Persona:** Sarah Njeri, 29. FreightFlow platform operator / logistics company manager. Manages 12 drivers and 50+ shipper clients. Needs a bird's-eye view of all operations and the ability to intervene when things go wrong.

### Stage 1: Onboarding

| Element | Detail |
|---------|--------|
| **Goal** | Set up her company's workspace on FreightFlow |
| **Touchpoints** | Admin invite → Sign Up → Admin Dashboard |
| **Actions** | Receives invite link; creates admin account; invites shippers and transporters via phone numbers |
| **AT API** | **SMS API** — invite SMS sent to each team member: *"Sarah invited you to join FreightFlow. Register: [url]"* |
| **Emotion** | 😊 Methodical, in setup mode |
| **Pain Point** | Has to add 12 drivers one by one — tedious |
| **Design Response** | Bulk invite: paste a list of phone numbers (comma-separated) → system sends invite SMS to all at once |

---

### Stage 2: Daily Operations Monitoring

| Element | Detail |
|---------|--------|
| **Goal** | See the status of all active shipments at a glance |
| **Touchpoints** | Admin Dashboard — KPI cards + loads table |
| **Actions** | Logs in; scans KPI cards (active loads, in transit, delayed, delivered today); reviews alerts panel |
| **AT API** | None directly — but AT SMS failures surface as alerts |
| **Emotion** | 😐 Alert, scanning for problems |
| **Pain Point** | One driver hasn't updated status in 4 hours — cargo might be stuck |
| **Design Response** | "Stale shipments" alert: any load that hasn't had a status update in >3 hours is flagged in the alerts panel with a yellow badge. Admin can click to see details and trigger a manual check |

---

### Stage 3: Dispute Resolution

| Element | Detail |
|---------|--------|
| **Goal** | Resolve a disputed delivery fairly and quickly |
| **Touchpoints** | Disputes tab → Load detail → Contact both parties → Resolve |
| **Actions** | Views dispute description; reads both sides; contacts shipper and transporter; marks resolution |
| **AT API** | **SMS API** — resolution notification sent to both parties |
| **Emotion** | 😟 Stressed (both parties are unhappy), then 😊 relieved after resolution |
| **Pain Point** | No record of what actually happened — hard to rule fairly |
| **Design Response** | Every status change is timestamped and logged (who made the change, from which device/channel). Admin sees the full audit trail. USSD updates show the exact time the driver dialled |

---

### Stage 4: Analytics & Reporting

| Element | Detail |
|---------|--------|
| **Goal** | Report on monthly performance to her company director |
| **Touchpoints** | Analytics page → filter by date range → export PDF/CSV |
| **Actions** | Sets date range (May 1–31); views: total deliveries, on-time %, top drivers, avg acceptance time; exports report |
| **AT API** | None (analytics are internal) |
| **Emotion** | 😊 Confident when numbers are good; 😟 uncomfortable when presenting delays |
| **Pain Point** | Report doesn't match the director's question — wrong metric |
| **Design Response** | Report presets: "Monthly Summary", "Driver Performance", "Delay Analysis" — each pre-configured with the right metrics for its audience |

---

## Emotional Journey Summary

```
SHIPPER EMOTION ARC:
Curious → Anxious (no one accepting) → Relieved (accepted!) → Informed (tracking) → Satisfied (confirmed)

TRANSPORTER EMOTION ARC:
Sceptical → Focused (browsing) → Competitive (accepting) → Empowered (USSD update) → Motivated (airtime reward)

ADMIN EMOTION ARC:
Methodical (setup) → Alert (monitoring) → Stressed (dispute) → Confident (resolved + reported)
```

---

## Journey × AT API Touchpoint Matrix

| Journey Stage | Shipper | Transporter | AT API |
|---------------|---------|-------------|--------|
| Sign up | OTP verification | OTP verification | SMS |
| Load posted | — | New load notification | SMS |
| Load accepted | Acceptance alert | Pickup details | SMS |
| Cargo picked up | Pickup notification | USSD confirmation | SMS + USSD |
| In transit | Transit update | — | SMS |
| Delivery reported | Confirmation prompt | — | SMS |
| Delivery confirmed | Final confirmation | Airtime reward | SMS + Airtime |
| Critical delay | Voice call escalation | — | Voice |
| Dispute raised | Notification | Notification | SMS |

---

*Related documents:*
- [`docs/end_to_end_flow.md`](end_to_end_flow.md) — technical state machine for each transition
- [`docs/africas_talking_integration.md`](africas_talking_integration.md) — AT API code patterns
- [`design/pages/authentication_pages.md`](../design/pages/authentication_pages.md) — auth flow detail
- [`design/pages/shipper_pages.md`](../design/pages/shipper_pages.md) — shipper screen specs
- [`design/pages/transporter_pages.md`](../design/pages/transporter_pages.md) — transporter screen specs
