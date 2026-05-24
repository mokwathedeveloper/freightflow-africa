# FreightFlow — Digital Freight Marketplace for Africa

> **Africa's Talking Transportation & Logistics Hackathon — May 28, 2026**
> Problem Track: **Freight & Cargo Logistics**
> Venue: Nairobi Garage Kilimani, 7th Floor, Pinetree Plaza

---

## The Problem

Africa's freight sector is fragmented, opaque, and largely offline. Over **70% of East African truck operators** use basic feature phones without internet access. Key pain points:

- Shippers have no visibility into where their cargo is after it leaves the warehouse
- Transporters spend hours calling around to find available loads — wasting fuel and time
- Load matching is done by phone calls and word-of-mouth, with no audit trail
- Rural and peri-urban drivers are excluded from digital logistics platforms that require smartphones
- Cross-border cargo gets stuck due to missing or incorrect customs documentation

## The Solution — FreightFlow

FreightFlow is a **multi-tenant digital freight marketplace** that connects shippers and transporters in real time. It is built specifically for the African logistics context — SMS and USSD-first, mobile-responsive, and designed for operators across the income and tech spectrum.

**Shippers** post loads, get matched to verified transporters, and receive live SMS updates as their cargo moves.

**Transporters** browse and accept loads via a dashboard or by dialling a USSD shortcode on any phone — no internet required.

---

## Africa's Talking APIs Powering FreightFlow

| API | How FreightFlow Uses It |
|-----|------------------------|
| **SMS API** | Instant load status alerts, delivery confirmations, and OTP verification sent to any phone number |
| **USSD API** | Drivers dial `*384*FreightFlow#` to update delivery status, check jobs, and check payments — no internet, no smartphone |
| **Voice API** | Automated outbound calls for critical alerts: cargo delayed >2 hours, high-value delivery confirmation |
| **Airtime API** | Transporter performance rewards — KES 20 airtime disbursed automatically on each verified on-time delivery |
| **Marketplace** | FreightFlow published as a subscribable service on the AT Marketplace for transport companies |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express, REST API |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT / Auth.js |
| Payments | M-Pesa (Daraja API), Stripe |
| Comms | Africa's Talking SDK (Node.js) — SMS, USSD, Voice, Airtime |
| Container | Docker + docker-compose |
| CI/CD | GitHub Actions → deploy to Render/Railway |
| Maps | Leaflet.js / Google Maps API |

---

## Key Features

- **Digital Freight Marketplace** — Post, browse, and match loads with verified transporters
- **Real-time Cargo Tracking** — GPS status timeline: Pending → Accepted → Picked Up → In Transit → Delivered
- **SMS Notifications** — Automatic AT SMS alerts at every status change to shipper and transporter
- **USSD Driver Interface** — Drivers on any phone update status via `*384*FreightFlow#`
- **Voice Alerts** — Automated AT Voice calls for critical delivery delays
- **Airtime Rewards** — AT Airtime disbursed to top-performing drivers automatically
- **Cross-Border Documentation** — Upload and track customs/invoice documents
- **Multi-tenant Architecture** — Each logistics company gets an isolated workspace
- **Role-based Access** — Shipper, Transporter, and Admin dashboards
- **M-Pesa Payments** — Integrated freight invoice payment and subscription management

---

## Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/freightflow.git
cd freightflow

# Copy environment variables
cp .env.example .env
# Edit .env — add your AT API key, AT username, database URL, etc.

# Start the full stack (API + frontend + PostgreSQL)
docker-compose up --build

# App will be available at:
# Frontend: http://localhost:3000
# API:      http://localhost:4000
```

### Environment Variables (`.env.example`)

```bash
# Africa's Talking
AT_API_KEY=your_at_api_key
AT_USERNAME=sandbox                  # "sandbox" for testing; your AT username for prod
AT_SENDER_ID=FreightFlow
AT_USSD_CODE=*384*7447#

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/freightflow

# Auth
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# M-Pesa
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey

# App
NEXT_PUBLIC_API_URL=http://localhost:4000
NODE_ENV=development
```

---

## Screenshots

> UI mockups are in [`design/mockups/`](design/mockups/)

| Screen | Description |
|--------|-------------|
| `Freight & Cargo1.png` | Landing page hero |
| `Freight & Cargo4.png` | Shipper dashboard |
| `Freight & Cargo5.png` | Load marketplace |
| `Freight & Cargo6.png` | Cargo tracking map |
| `Freight & Cargo7.png` | Transporter dashboard |
| `Freight & Cargo8.png` | Notifications panel |

---

## Project Structure

```
freightflow/
├── README.md                    # This file
├── HACKATHON.md                 # Hackathon submission details
├── docs/
│   ├── product_brief.md         # Product identity and vision
│   ├── features_and_pages.md    # All features with AT API touchpoints
│   ├── africas_talking_integration.md   # Full AT API specs + code patterns
│   ├── docker_deployment.md     # Dockerfile + docker-compose + CI/CD
│   ├── mvp_hackathon_scope.md   # Solo MVP scope and demo day plan
│   ├── development_task_list.md # Checklist from setup to deployment
│   ├── fullstack_roadmap.md     # Full development roadmap
│   ├── multitenant_architecture.md  # Multi-tenant DB + API design
│   └── project_folder_structure.md  # Codebase folder layout
└── design/
    ├── ux_ui_blueprint.md       # All page components and interactions
    ├── wireframes_figma_prompt.md
    ├── brand/
    │   └── design_system.md     # Colors, typography, component rules
    ├── features/                # UX guide per feature (11 guides)
    ├── pages/                   # Page specs per role (7 specs)
    └── mockups/                 # UI mockup screenshots (6 PNGs)
```

---

## Demo Guide (Hackathon Judges)

**3-minute demo flow:**

1. **Post a Load** — Log in as shipper → fill Post Load form (Nairobi → Mombasa, electronics, 2 tons)
2. **Accept the Load** — Log in as transporter → browse marketplace → accept the load
3. **SMS Alert** — Show the SMS received by the shipper: *"Your load #001 has been accepted by [Transporter]"*
4. **USSD Update** — Dial `*384*7447#` → Select *Update Status* → Select *Picked Up* → See confirmation
5. **Dashboard Update** — Show shipper dashboard: status now shows "Picked Up"
6. **Impact Statement** — "70% of East African truckers use basic phones — USSD bridges the last-mile communication gap"

---

## Impact

- **Inclusivity:** USSD access means any driver with a basic phone can participate in the digital freight economy
- **Transparency:** Every status change is logged and notified — no more "where is my cargo?" calls
- **Efficiency:** Digital load matching cuts empty-truck trips and reduces matching time from hours to minutes
- **Scale:** Built multi-tenant from day one — one platform can serve hundreds of logistics companies

---

## Team

| Name | Role |
|------|------|
| [Your Name] | Full-Stack Developer, Product Designer |

---

## Links

| Resource | URL |
|----------|-----|
| GitHub Repo | https://github.com/YOUR_USERNAME/freightflow |
| Live Demo | https://freightflow.up.railway.app *(deployed before May 28)* |
| Video Demo | *(link to be added)* |
| Hackathon | https://community.africastalking.com/events/transportation-logistics-hackathon |

---

*Built with [Africa's Talking APIs](https://africastalking.com) for the Transportation & Logistics Hackathon, May 2026.*
