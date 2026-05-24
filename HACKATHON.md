# FreightFlow — Hackathon Submission Document

> **Africa's Talking Transportation & Logistics Hackathon**
> Date: Thursday, May 28, 2026 | 8:00 AM – 6:00 PM (GMT+3)
> Venue: Nairobi Garage Kilimani, 7th Floor, Pinetree Plaza, Kaburu Drive Off Ngong Rd
> Hackathon Track: **Freight & Cargo Logistics**

---

## Team Details

| Field | Details |
|-------|---------|
| **Project Name** | FreightFlow SaaS |
| **Team Lead** | [Your Full Name] |
| **Email** | mokwaohuru@gmail.com |
| **Phone** | [Your Phone Number] |
| **GitHub** | https://github.com/YOUR_USERNAME/freightflow |
| **Team Size** | Solo |
| **Location** | Nairobi, Kenya |

---

## Hackathon Problem Track

**Selected Track:** Freight & Cargo Logistics

> *"Create digital freight marketplaces, cargo tracking platforms, truck load matching systems, and cross-border customs documentation tools."*
> — Africa's Talking Hackathon Brief

---

## Problem Statement

Africa's freight and cargo sector operates largely offline and by phone. The core problems FreightFlow addresses:

1. **Fragmented Load Matching** — Shippers and transporters find each other through informal networks and phone calls, wasting hours and resulting in many trucks running empty (est. 30-40% empty trips in East Africa).

2. **Zero Cargo Visibility** — Once cargo leaves the warehouse, shippers have no real-time visibility. Status updates require multiple phone calls.

3. **Feature Phone Exclusion** — Over 70% of East African truck drivers use basic feature phones. Internet-first platforms exclude this majority entirely.

4. **Manual Documentation** — Cross-border shipments involve physical paper documentation that gets lost, delayed, or incorrectly filled, stalling cargo at border posts.

5. **No Performance Incentives** — There is no scalable mechanism to reward reliable, on-time transporters — making it hard for quality operators to differentiate themselves.

---

## Solution — FreightFlow SaaS

FreightFlow is a **multi-tenant digital freight marketplace** built for the African logistics context. It connects shippers and transporters through a web platform and — critically — through Africa's Talking's SMS, USSD, Voice, and Airtime APIs that work on any mobile device.

### How It Works

```
SHIPPER                         TRANSPORTER (smartphone)
   │                                    │
   ├─ Posts load via web dashboard      ├─ Browses loads on web dashboard
   │                                    ├─ Accepts load → status changes
   ├─ Receives AT SMS: "Load accepted"  │
   │                                    │
   └─ Tracks cargo in real time         TRANSPORTER (basic phone)
                                        │
                                        ├─ Dials *384*FreightFlow# (USSD)
                                        ├─ Selects "Update Status"
                                        ├─ Selects "Picked Up"
                                        └─ Shipper receives AT SMS update
```

---

## Africa's Talking APIs Integrated

### 1. SMS API — Core Notification Layer
- **Use Case:** Automated load status alerts at every stage of the delivery journey
- **Triggers:** Load accepted, cargo picked up, in transit, delivered, delayed, payment confirmed
- **Recipients:** Both shippers and transporters receive relevant SMS alerts
- **Why it matters:** Guarantees communication even when users are away from the web dashboard

### 2. USSD API — Feature Phone Interface
- **Use Case:** Truck drivers on basic phones update delivery status and check job assignments
- **Shortcode:** `*384*FreightFlow#`
- **Menu options:** Track Load | Update Status | My Active Jobs | My Payments
- **Why it matters:** This is the breakthrough feature — it includes the 70%+ of East African drivers who cannot use internet-based platforms

### 3. Voice API — Critical Alert Escalation
- **Use Case:** Automated outbound phone calls for time-critical alerts
- **Triggers:** Cargo delayed >2 hours, high-value delivery (>KES 500,000), driver unresponsive to 3 SMS alerts
- **Why it matters:** Voice cuts through when SMS is ignored — critical for high-value or time-sensitive cargo

### 4. Airtime API — Driver Performance Rewards
- **Use Case:** Automatic KES 20 airtime reward to transporters for each verified on-time delivery with a ≥4-star rating
- **Why it matters:** Creates a built-in incentive system for quality and reliability without cash handling or bank accounts

### 5. AT Marketplace
- **Use Case:** FreightFlow published as a subscribable plugin for Africa's Talking customers
- **Benefit:** Transport companies across East Africa can subscribe to FreightFlow freight notification bundles via their existing AT account

---

## Technical Architecture

```
┌─────────────────────────────────────────────────┐
│                  FreightFlow                     │
│                                                  │
│  ┌──────────────┐    ┌───────────────────────┐  │
│  │  Next.js UI  │    │  Node.js/Express API  │  │
│  │  (Frontend)  │◄──►│  (Backend)            │  │
│  └──────────────┘    └───────────┬───────────┘  │
│                                  │               │
│                      ┌───────────▼───────────┐  │
│                      │  PostgreSQL + Prisma  │  │
│                      └───────────────────────┘  │
│                                  │               │
│                      ┌───────────▼───────────┐  │
│                      │ Africa's Talking SDK  │  │
│                      │  SMS | USSD | Voice   │  │
│                      │  Airtime | Marketplace│  │
│                      └───────────────────────┘  │
└─────────────────────────────────────────────────┘
         │                          │
  ┌──────▼──────┐           ┌───────▼──────┐
  │  Shipper    │           │  Transporter │
  │  (Web App)  │           │  (Web/USSD)  │
  └─────────────┘           └──────────────┘
```

**Deployment:** Docker + docker-compose → GitHub Actions CI/CD → Render/Railway

---

## Impact Statement

FreightFlow directly addresses 4 of the hackathon's stated objectives:

| Objective | How FreightFlow Delivers |
|-----------|--------------------------|
| Bridge the Transport Tech Gap | Digital marketplace replaces phone-call-based load matching |
| Foster Local Innovation | Built in Kenya, for East Africa's freight reality |
| Promote Inclusive Mobility | USSD ensures feature phone users are not left behind |
| Enable Impact at Scale | Multi-tenant SaaS architecture — one platform, many logistics companies |

**Measurable impact potential:**
- Reduce empty truck trips by 25-35% through efficient digital matching
- Cut shipper-to-transporter matching time from ~3 hours to <15 minutes
- Provide real-time cargo visibility to shippers for the first time
- Include 70% of East African drivers who cannot access internet-only platforms

---

## Live Demo Details

| Resource | Link |
|----------|------|
| **GitHub Repo** | https://github.com/YOUR_USERNAME/freightflow |
| **Live Demo URL** | https://freightflow.up.railway.app |
| **Demo Video** | *(to be added before May 28)* |
| **AT Sandbox Config** | Username: `sandbox`, Shortcode: `*384*7447#` |

**Demo Credentials (for judges):**
- Shipper: `shipper@demo.com` / `Demo1234!`
- Transporter: `driver@demo.com` / `Demo1234!`
- Admin: `admin@demo.com` / `Demo1234!`

---

## Submission Checklist

- [ ] GitHub repository is public and accessible
- [ ] `README.md` with problem statement, solution, and quick-start instructions
- [ ] Africa's Talking APIs integrated: SMS ✓ | USSD ✓ | Voice ✓ | Airtime ✓
- [ ] Docker deployment working (`docker-compose up --build`)
- [ ] Live demo URL accessible
- [ ] Demo script prepared (3-minute presentation)
- [ ] Mockups/screenshots included in `design/mockups/`
- [ ] Idea submitted via Africa's Talking Hackathon submission form

---

*FreightFlow — connecting Africa's freight economy, one load at a time.*
