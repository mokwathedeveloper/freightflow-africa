# FreightFlow SaaS — Project Architecture
### System Design, Database Schema, API Layer, and Infrastructure

This document defines the complete technical architecture of the FreightFlow platform — the authoritative reference for every architectural decision made during development.

---

## 1. System Architecture Overview

FreightFlow is a **three-tier web application** with an external communications layer powered by Africa's Talking.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────┐  │
│  │  Web Browser     │    │  Mobile Browser  │    │  USSD Phone  │  │
│  │  (Next.js SPA)   │    │  (responsive)    │    │  (any phone) │  │
│  └────────┬─────────┘    └────────┬─────────┘    └──────┬───────┘  │
└───────────┼──────────────────────┼───────────────────────┼──────────┘
            │  HTTPS               │  HTTPS               │  USSD
            ▼                      ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                                │
│                                                                      │
│  ┌─────────────────────────┐   ┌──────────────────────────────────┐ │
│  │   Next.js Frontend      │   │   Node.js / Express API          │ │
│  │   Port 3000             │◄──►   Port 4000                      │ │
│  │                         │   │                                  │ │
│  │   Pages & Components    │   │   REST API Endpoints             │ │
│  │   Tailwind CSS          │   │   Business Logic Services        │ │
│  │   shadcn/ui             │   │   JWT Auth Middleware            │ │
│  │   React Query           │   │   RBAC Guards                    │ │
│  │   Zustand / Context     │   │   Prisma ORM                     │ │
│  └─────────────────────────┘   └──────────────┬───────────────────┘ │
└──────────────────────────────────────────────┼──────────────────────┘
                                               │
            ┌──────────────────────────────────┼───────────────┐
            │                                  │               │
            ▼                                  ▼               ▼
┌───────────────────┐            ┌─────────────────────┐  ┌──────────────────────┐
│   DATA LAYER      │            │  COMMS LAYER        │  │  STORAGE LAYER       │
│                   │            │                     │  │                      │
│  PostgreSQL 15    │            │  Africa's Talking   │  │  Cloudinary          │
│  (via Prisma ORM) │            │  ├── SMS API        │  │  (document uploads)  │
│                   │            │  ├── USSD API       │  │                      │
│  Tables:          │            │  ├── Voice API      │  │  (future: S3)        │
│  users            │            │  └── Airtime API    │  │                      │
│  loads            │            │                     │  └──────────────────────┘
│  shipments        │            └─────────────────────┘
│  notifications    │
│  otp_records      │
│  airtime_logs     │
│  sms_logs         │
│  disputes         │
│  documents        │
│  tenants          │
│  subscriptions    │
└───────────────────┘
```

---

## 2. Frontend Architecture (Next.js)

### Routing Structure

```
web/
└── app/                          (Next.js 14 App Router)
    ├── page.tsx                  → Landing page (public)
    ├── about/page.tsx            → About page (public)
    ├── faq/page.tsx              → FAQ (public)
    ├── contact/page.tsx          → Contact (public)
    │
    ├── auth/
    │   ├── role/page.tsx         → Role selection (Step 1)
    │   ├── register/page.tsx     → Sign up form (Step 2)
    │   ├── verify/page.tsx       → OTP verification (Step 3)
    │   ├── login/page.tsx        → Login
    │   └── reset/page.tsx        → Password reset
    │
    ├── dashboard/
    │   ├── shipper/
    │   │   ├── page.tsx          → Shipper dashboard
    │   │   ├── post-load/page.tsx
    │   │   ├── shipments/page.tsx
    │   │   ├── track/[loadId]/page.tsx
    │   │   ├── notifications/page.tsx
    │   │   ├── billing/page.tsx
    │   │   └── settings/page.tsx
    │   │
    │   ├── transporter/
    │   │   ├── page.tsx          → Transporter dashboard
    │   │   ├── loads/page.tsx    → Available loads marketplace
    │   │   ├── jobs/page.tsx     → Accepted jobs
    │   │   ├── track/[loadId]/page.tsx
    │   │   ├── notifications/page.tsx
    │   │   ├── billing/page.tsx
    │   │   └── settings/page.tsx
    │   │
    │   └── admin/
    │       ├── page.tsx          → Admin overview
    │       ├── users/page.tsx
    │       ├── loads/page.tsx
    │       ├── analytics/page.tsx
    │       ├── subscriptions/page.tsx
    │       ├── disputes/page.tsx
    │       └── alerts/page.tsx
    │
    └── not-found.tsx             → 404 page
```

### Frontend Component Tree

```
components/
├── layout/
│   ├── Navbar.tsx               (top nav with role-aware links)
│   ├── Sidebar.tsx              (collapsible, role-specific nav)
│   ├── Footer.tsx
│   └── DashboardLayout.tsx      (wraps all dashboard pages)
│
├── auth/
│   ├── RoleCard.tsx             (Shipper / Transporter selection cards)
│   ├── OTPInput.tsx             (6-box OTP with auto-advance)
│   └── PhoneInput.tsx           (E.164 formatter with country selector)
│
├── loads/
│   ├── LoadCard.tsx             (marketplace + dashboard card)
│   ├── LoadStatusBadge.tsx      (POSTED / ACCEPTED / etc.)
│   ├── PostLoadForm.tsx         (shipper form with validation)
│   ├── AcceptLoadModal.tsx      (transporter confirmation)
│   ├── UpdateStatusModal.tsx    (transporter status update)
│   └── ConfirmDeliveryModal.tsx (shipper confirm + star rating)
│
├── tracking/
│   ├── TrackingMap.tsx          (Leaflet map — optional GPS)
│   ├── StatusTimeline.tsx       (step-by-step status history)
│   └── LoadSummaryPanel.tsx     (ETA, transporter info, route)
│
├── notifications/
│   ├── NotificationBell.tsx     (top nav icon + unread badge)
│   ├── NotificationDrawer.tsx   (slide-in panel)
│   └── NotificationItem.tsx     (single notification row)
│
├── ui/
│   ├── Button.tsx               (primary / secondary / danger / ghost)
│   ├── Input.tsx                (with label, error, helper text)
│   ├── Modal.tsx                (accessible dialog wrapper)
│   ├── Toast.tsx                (success / error / info toasts)
│   ├── SkeletonCard.tsx         (loading placeholder)
│   ├── EmptyState.tsx           (reusable empty state with CTA)
│   └── StarRating.tsx           (1–5 interactive stars)
│
└── dashboard/
    ├── KPICard.tsx              (metric + icon + trend)
    ├── DataTable.tsx            (sortable, filterable table)
    └── ChartWrapper.tsx         (recharts wrapper)
```

### State Management

| Concern | Solution |
|---------|----------|
| Server data (loads, notifications) | **React Query (TanStack Query)** — caching, refetching, optimistic updates |
| Auth state (user, role, token) | **React Context** + httpOnly cookie (no localStorage) |
| UI state (modals, drawers) | **Local component state** — `useState` |
| Form state | **React Hook Form** + Zod schema validation |
| Global toasts | **Zustand** toast store |

---

## 3. Backend Architecture (Node.js / Express)

### Folder Structure

```
server/
├── index.js                     (app entry — Express init, middleware, routes)
├── prisma/
│   └── schema.prisma            (database schema — single source of truth)
│
├── routes/
│   ├── auth.routes.js           (register, login, OTP, refresh)
│   ├── loads.routes.js          (CRUD + status transitions)
│   ├── users.routes.js          (profile, preferences)
│   ├── notifications.routes.js  (list, mark read)
│   ├── documents.routes.js      (upload, status)
│   ├── analytics.routes.js      (admin reports)
│   ├── ussd.js                  (AT USSD callback handler)
│   └── webhooks.js              (AT SMS delivery, Voice callback, M-Pesa)
│
├── controllers/
│   ├── auth.controller.js
│   ├── loads.controller.js
│   ├── users.controller.js
│   └── ...
│
├── services/
│   ├── at.js                    (Africa's Talking SDK init — singleton)
│   ├── sms.service.js           (SMS send + templates)
│   ├── ussd.service.js          (USSD session state helpers)
│   ├── voice.service.js         (Voice call initiation)
│   ├── airtime.service.js       (Airtime disbursement + retry)
│   ├── otp.service.js           (generate, store, verify OTP)
│   ├── load.service.js          (load lifecycle + matching logic)
│   └── delivery.service.js      (confirm delivery + auto-confirm job)
│
├── middleware/
│   ├── auth.middleware.js        (JWT verify + attach req.user)
│   ├── rbac.middleware.js        (role guard: requireRole('SHIPPER'))
│   ├── tenant.middleware.js      (attach req.tenantId from JWT)
│   ├── rateLimiter.js            (express-rate-limit on auth routes)
│   └── errorHandler.js          (global error handler)
│
└── utils/
    ├── jwt.js                   (sign, verify tokens)
    ├── hash.js                  (bcrypt password hash/compare)
    ├── validators.js            (Zod schemas for request validation)
    └── logger.js                (Winston structured logging)
```

### API Route Map

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/register` | None | Any | Register new user (phone + role) |
| POST | `/api/auth/send-otp` | None | Any | Send AT SMS OTP to phone |
| POST | `/api/auth/verify-otp` | None | Any | Verify OTP → return JWT |
| POST | `/api/auth/login` | None | Any | Login with phone + password |
| POST | `/api/auth/refresh` | Refresh token | Any | Refresh access token |
| POST | `/api/auth/forgot-password` | None | Any | Send password reset OTP |
| POST | `/api/auth/reset-password` | None | Any | Set new password with OTP |
| GET | `/api/loads` | JWT | Transporter | Browse POSTED loads |
| POST | `/api/loads` | JWT | Shipper | Create a new load |
| GET | `/api/loads/:id` | JWT | Any | Get load details |
| POST | `/api/loads/:id/accept` | JWT | Transporter | Accept a POSTED load |
| PATCH | `/api/loads/:id/status` | JWT | Transporter | Update status (PICKED_UP, IN_TRANSIT) |
| POST | `/api/loads/:id/deliver` | JWT | Transporter | Mark as AWAITING_CONFIRMATION |
| POST | `/api/loads/:id/confirm` | JWT | Shipper | Confirm delivery + rating |
| POST | `/api/loads/:id/dispute` | JWT | Shipper | Raise dispute |
| POST | `/api/loads/:id/cancel` | JWT | Shipper | Cancel POSTED load |
| GET | `/api/loads/my` | JWT | Shipper/Transporter | Get own loads |
| GET | `/api/notifications` | JWT | Any | List notifications |
| PATCH | `/api/notifications/:id/read` | JWT | Any | Mark notification read |
| GET | `/api/users/me` | JWT | Any | Get own profile |
| PATCH | `/api/users/me` | JWT | Any | Update profile |
| POST | `/api/documents` | JWT | Any | Upload document |
| GET | `/api/documents` | JWT | Any | List own documents |
| GET | `/api/admin/analytics` | JWT | Admin | Platform analytics |
| GET | `/api/admin/users` | JWT | Admin | List all users |
| GET | `/api/admin/disputes` | JWT | Admin | List disputes |
| PATCH | `/api/admin/disputes/:id` | JWT | Admin | Resolve dispute |
| POST | `/api/ussd` | None (AT IP whitelist) | Public | USSD session handler |
| POST | `/api/webhooks/sms-delivery` | AT secret header | Public | SMS delivery report |
| POST | `/api/webhooks/voice` | AT secret header | Public | Voice callback |
| POST | `/api/webhooks/mpesa` | M-Pesa cert | Public | M-Pesa payment callback |
| GET | `/health` | None | Public | Health check |

### Middleware Stack (per request)

```
Request
  → cors()
  → helmet()                     (security headers)
  → express.json()
  → rateLimiter (auth routes only)
  → authMiddleware               (validates JWT, attaches req.user)
  → tenantMiddleware             (attaches req.tenantId)
  → rbacMiddleware               (checks role if route requires it)
  → controller
  → errorHandler
Response
```

---

## 4. Database Schema (PostgreSQL + Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ── Tenants (multi-tenant support) ─────────────────────────────────
model Tenant {
  id          String   @id @default(cuid())
  name        String
  plan        Plan     @default(FREE)
  createdAt   DateTime @default(now())
  users       User[]
  loads       Load[]
  documents   Document[]
  subscription Subscription?
}

enum Plan {
  FREE
  BASIC
  PRO
}

// ── Users ──────────────────────────────────────────────────────────
model User {
  id            String    @id @default(cuid())
  phone         String    @unique              // primary identifier
  email         String?   @unique
  name          String
  passwordHash  String
  role          Role
  tenantId      String
  tenant        Tenant    @relation(fields: [tenantId], references: [id])
  // Transporter-specific
  vehicleType   String?
  numberPlate   String?
  rating        Float?    @default(0)
  completedJobs Int       @default(0)
  // Relations
  loadsAsShipper     Load[]        @relation("ShipperLoads")
  loadsAsTransporter Load[]        @relation("TransporterLoads")
  notifications      Notification[]
  otpRecords         OTPRecord[]
  airtimeLogs        AirtimeLog[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Role {
  SHIPPER
  TRANSPORTER
  ADMIN
}

// ── OTP Records ────────────────────────────────────────────────────
model OTPRecord {
  id        String   @id @default(cuid())
  phone     String
  otp       String                           // store hashed
  expiresAt DateTime
  used      Boolean  @default(false)
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())

  @@index([phone])
}

// ── Loads ──────────────────────────────────────────────────────────
model Load {
  id          String     @id @default(cuid())
  shortId     String     @unique              // e.g. FF-2026-001
  tenantId    String
  tenant      Tenant     @relation(fields: [tenantId], references: [id])
  shipperId   String
  shipper     User       @relation("ShipperLoads", fields: [shipperId], references: [id])
  transporterId String?
  transporter User?      @relation("TransporterLoads", fields: [transporterId], references: [id])
  // Load details
  origin      String
  destination String
  cargoType   String
  weightKg    Float
  deliveryDate DateTime
  notes       String?
  // Status
  status      LoadStatus @default(POSTED)
  lastLocation String?                        // last known checkpoint (USSD or GPS)
  eta         DateTime?
  // Timestamps
  acceptedAt       DateTime?
  pickedUpAt       DateTime?
  transitStartedAt DateTime?
  deliveredAt      DateTime?
  confirmedAt      DateTime?
  // Confirmation
  rating      Int?                            // 1–5 stars from shipper
  // Relations
  notifications Notification[]
  statusLogs    LoadStatusLog[]
  dispute       Dispute?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([status])
  @@index([shipperId])
  @@index([transporterId])
  @@index([tenantId])
}

enum LoadStatus {
  POSTED
  ACCEPTED
  PICKED_UP
  IN_TRANSIT
  AWAITING_CONFIRMATION
  DELIVERED
  DISPUTED
  CANCELLED
  REFUND_PENDING
}

// ── Load Status Log (audit trail) ─────────────────────────────────
model LoadStatusLog {
  id        String     @id @default(cuid())
  loadId    String
  load      Load       @relation(fields: [loadId], references: [id])
  fromStatus LoadStatus
  toStatus  LoadStatus
  changedBy String                           // userId or 'SYSTEM' or 'USSD'
  channel   String     @default("WEB")       // WEB | USSD | SYSTEM
  note      String?
  createdAt DateTime   @default(now())

  @@index([loadId])
}

// ── Notifications ──────────────────────────────────────────────────
model Notification {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id])
  loadId    String?
  load      Load?            @relation(fields: [loadId], references: [id])
  type      NotificationType
  title     String
  body      String
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())

  @@index([userId, read])
}

enum NotificationType {
  LOAD_ACCEPTED
  CARGO_PICKED_UP
  CARGO_IN_TRANSIT
  DELIVERY_REPORTED
  DELIVERY_CONFIRMED
  DISPUTE_RAISED
  DISPUTE_RESOLVED
  NEW_LOAD_AVAILABLE
  SYSTEM_ALERT
}

// ── SMS Logs ───────────────────────────────────────────────────────
model SmsLog {
  id          String   @id @default(cuid())
  messageId   String   @unique              // AT message ID
  phone       String
  message     String
  status      String                        // Success | Failed | queued
  networkCode String?
  failureReason String?
  createdAt   DateTime @default(now())

  @@index([phone])
}

// ── Airtime Logs ───────────────────────────────────────────────────
model AirtimeLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  loadId    String
  amount    Int                             // in KES
  status    String                          // SUCCESS | FAILED
  error     String?
  createdAt DateTime @default(now())
}

// ── Disputes ───────────────────────────────────────────────────────
model Dispute {
  id          String        @id @default(cuid())
  loadId      String        @unique
  load        Load          @relation(fields: [loadId], references: [id])
  description String
  resolution  String?
  status      DisputeStatus @default(OPEN)
  resolvedBy  String?                       // admin userId
  createdAt   DateTime      @default(now())
  resolvedAt  DateTime?
}

enum DisputeStatus {
  OPEN
  UNDER_REVIEW
  RESOLVED
  ESCALATED
}

// ── Documents (Cross-border) ───────────────────────────────────────
model Document {
  id        String         @id @default(cuid())
  tenantId  String
  tenant    Tenant         @relation(fields: [tenantId], references: [id])
  loadId    String?
  type      String                          // invoice | packing_list | bill_of_lading | customs
  fileUrl   String                          // Cloudinary URL
  status    DocumentStatus @default(PENDING)
  rejectionReason String?
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt
}

enum DocumentStatus {
  PENDING
  UNDER_REVIEW
  VERIFIED
  REJECTED
}

// ── Subscriptions ──────────────────────────────────────────────────
model Subscription {
  id        String   @id @default(cuid())
  tenantId  String   @unique
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  plan      Plan
  status    String   @default("ACTIVE")     // ACTIVE | CANCELLED | PAST_DUE
  mpesaRef  String?
  startsAt  DateTime
  endsAt    DateTime?
  createdAt DateTime @default(now())
}
```

### Key Database Decisions

| Decision | Reasoning |
|----------|-----------|
| `phone` is the unique identifier on `User`, not `email` | Matches the phone-first auth flow; email is optional |
| `shortId` on `Load` (e.g. `FF-2026-001`) | Human-readable for USSD and SMS — `cuid()` alone is not usable in a USSD session |
| `LoadStatusLog` is a separate table | Every status transition is audited with timestamp, channel (WEB/USSD/SYSTEM), and actor — critical for dispute resolution |
| `changedBy = 'USSD'` in logs | Distinguishes USSD updates from web updates — shows in admin dispute view |
| `tenantId` on every business table | Multi-tenant data isolation — all queries are scoped by `tenantId` |
| `lastLocation` on `Load` | Stores the most recent checkpoint string from USSD. No separate GPS table for MVP |
| `AirtimeLog` and `SmsLog` separate tables | Independent audit of AT API calls — allows retry logic without re-processing business events |

---

## 5. Authentication & Security Architecture

```
Registration flow:
  Client → POST /api/auth/register → validate → bcrypt.hash(password) → create User → sendOTP()
  Client → POST /api/auth/verify-otp → verify OTP → sign JWT (access 15m + refresh 7d) → set httpOnly cookies

Login flow:
  Client → POST /api/auth/login → find User by phone → bcrypt.compare → sign JWT → set httpOnly cookies

JWT payload:
  { userId, role, tenantId, iat, exp }

Refresh flow:
  Client → POST /api/auth/refresh (sends refresh token cookie) → verify → issue new access token

Protected route:
  Request → authMiddleware → verify access JWT → attach req.user → route handler
```

**Token storage:** Both tokens stored as **httpOnly, Secure, SameSite=Strict cookies** — never in localStorage or sessionStorage.

**Rate limits:**
| Endpoint | Limit |
|----------|-------|
| `/api/auth/send-otp` | 3 requests per phone per 10 minutes |
| `/api/auth/login` | 5 attempts per IP per 15 minutes |
| `/api/auth/register` | 10 requests per IP per hour |
| All other endpoints | 100 requests per IP per minute |

**USSD security:** AT USSD callback is not authenticated by JWT (it comes from AT's servers). Protect it by:
1. Whitelist AT's IP ranges on the server
2. Validate `serviceCode` matches your registered shortcode
3. Validate `phoneNumber` is E.164 format before DB queries

---

## 6. Infrastructure & Deployment Architecture

```
                        GitHub Repository
                               │
                    Push to main branch
                               │
                               ▼
                    ┌──────────────────┐
                    │  GitHub Actions  │
                    │  CI/CD Pipeline  │
                    │                  │
                    │  1. Run tests    │
                    │  2. Build Docker │
                    │     images       │
                    │  3. Push to      │
                    │     Docker Hub   │
                    │  4. Trigger      │
                    │     Render deploy│
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
    ┌──────────────┐  ┌───────────┐  ┌───────────────┐
    │  Render      │  │  Render   │  │  Render       │
    │  Web Service │  │  Web Svc  │  │  PostgreSQL   │
    │  (API)       │  │  (Web)    │  │  (Database)   │
    │  Port 4000   │  │  Port 3000│  │               │
    └──────┬───────┘  └─────┬─────┘  └───────────────┘
           │                │
           └────────────────┘
                    │
           Publicly accessible URL
    e.g. https://freightflow-api.onrender.com
         https://freightflow.onrender.com

External services:
    ├── Africa's Talking (SMS, USSD, Voice, Airtime)
    ├── Cloudinary (file storage)
    └── M-Pesa Daraja API (payments)
```

### Environment Summary

| Environment | Purpose | AT Mode |
|-------------|---------|---------|
| `local` | Development on laptop | `sandbox` |
| `staging` | Pre-demo testing | `sandbox` |
| `production` | Live demo + post-hackathon | Real AT credentials |

---

## 7. Data Flow — Load Lifecycle (Architecture View)

```
[Shipper Browser]
    │ POST /api/loads
    ▼
[Express Router → loads.controller.js → load.service.js]
    │ prisma.load.create({ status: 'POSTED', ... })
    │ findMatchingTransporters()
    ▼
[sms.service.js → AT SDK → AT SMS API]
    │ Sends SMS to N matching transporters
    ▼
[AT SMS API → Transporter phones]

[Transporter Browser]
    │ POST /api/loads/:id/accept
    ▼
[loads.controller.js]
    │ prisma.$transaction([
    │   load.update({ status: 'ACCEPTED', transporterId }),
    │   loadStatusLog.create({ fromStatus: 'POSTED', toStatus: 'ACCEPTED', channel: 'WEB' })
    │ ])
    │ sms.service.notifyLoadAccepted(...)
    ▼
[AT SMS → Shipper phone]

[AT USSD Callback]
    │ POST /api/ussd (from Africa's Talking servers)
    ▼
[ussd.js handler]
    │ Parse text input → route to correct menu level
    │ getActiveJobsForDriver(phoneNumber)
    │ updateLoadStatus(jobId, 'PICKED_UP', 'USSD')
    │ prisma.loadStatusLog.create({ channel: 'USSD', changedBy: 'USSD' })
    │ sms.service.sendSMS(shipper.phone, 'Cargo picked up...')
    ▼
[Returns CON/END text to AT → Displayed on driver's phone]
[AT SMS fires to shipper]

[Shipper confirms delivery]
    │ POST /api/loads/:id/confirm { rating: 5 }
    ▼
[delivery.service.js]
    │ prisma.$transaction([
    │   load.update({ status: 'DELIVERED', rating, confirmedAt }),
    │   loadStatusLog.create(...)
    │ ])
    │ Check: isOnTime AND rating >= 4?
    │ YES → airtime.service.rewardTransporter(transporter.phone, 'KES 20')
    │ AT Airtime API → KES 20 disbursed to driver
    │ AT SMS to both parties
    ▼
[Load lifecycle complete]
```

---

## 8. Architecture Decision Log

| Decision | Chosen | Rejected | Reason |
|----------|--------|----------|--------|
| Auth identifier | Phone number | Email | 70% of target transporters don't use email regularly |
| Token storage | httpOnly cookie | localStorage | XSS protection — localStorage is readable by JS |
| USSD state | Stateless (text path parsing) | Redis session | Simplest approach; AT USSD text string encodes full session path |
| Load matching | Rule-based (region + vehicle type) | ML model | MVP scope; ML is v2 |
| GPS tracking | Optional (USSD fallback) | Required GPS | Feature-phone drivers cannot send GPS; fallback shows USSD checkpoints |
| Delivery confirmation | Shipper confirms | Auto-confirm or transporter confirms | Shipper is the paying party and must validate receipt |
| Multi-tenancy | Shared DB + tenantId filter | Separate DB per tenant | Simpler for MVP; adequate isolation for hackathon scope |
| Frontend framework | Next.js 14 (App Router) | Create React App, Vite | SSR for SEO, App Router for layouts, large ecosystem |
| ORM | Prisma | TypeORM, Knex | Type safety, excellent migrations, Prisma Studio for DB debugging |

---

*This is the authoritative architecture document. All implementation must align with the decisions recorded here.*

*Related:*
- [`docs/end_to_end_flow.md`](end_to_end_flow.md) — user-facing state machine
- [`docs/africas_talking_integration.md`](africas_talking_integration.md) — AT API code
- [`docs/docker_deployment.md`](docker_deployment.md) — containerization
- [`docs/project_folder_structure.md`](project_folder_structure.md) — codebase layout
