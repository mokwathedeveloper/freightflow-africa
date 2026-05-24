# FreightFlow SaaS — Shared Pages
### Including Full Empty State, Loading State, and Error State Specifications

---

## 1. Cargo Tracking Page

- Interactive map: GPS location for smartphone drivers; last USSD checkpoint for feature-phone drivers
- Status timeline: `POSTED` → `ACCEPTED` → `PICKED UP` → `IN TRANSIT` → `DELIVERED`
- "Last updated: [timestamp]" always visible — never a stale or frozen map pin
- Historical timeline feed (expandable cards per status change)
- Action buttons: Report Issue (opens modal), Contact Transporter (phone dialler)
- Accessible to Shippers, Transporters, and Admin

**GPS unavailable state (USSD driver):**
- Map shows route line only (origin → destination)
- No moving pin
- Status panel shows: *"Driver is updating status via USSD. Location tracking not available for this trip."*
- This is intentional and honest — do not show a fake pin

---

## 2. Cross-Border Documentation Page

- Upload area: drag-and-drop or file picker (PDF, JPG, PNG — max 5MB per file)
- Required document types: Commercial Invoice, Packing List, Bill of Lading, Customs Declaration
- Status per document: `PENDING` `UNDER REVIEW` `VERIFIED` `REJECTED`
- Rejection reason displayed inline when status is `REJECTED`
- History table: previous submissions with date, type, status, download link
- Guidelines panel: collapsible sidebar with document requirements per border crossing

---

## 3. Notifications / Alerts Panel

- Bell icon in top nav with unread count badge (max display: 99+)
- Panel opens as a right-side drawer (not a full page)
- Tabs: All | Loads | Tracking | System
- Each notification has: icon, title, body (max 2 lines), timestamp, read/unread dot
- Click notification → navigate to relevant page and mark as read
- "Mark all as read" button at the top
- SMS and push notifications for critical events (from AT SMS API)

---

## 4. Error Pages

### 404 — Page Not Found

**Layout:**
```
┌─────────────────────────────────────┐
│           FreightFlow               │
│                                     │
│              404                    │
│                                     │
│       Page not found                │
│                                     │
│   The page you're looking for       │
│   doesn't exist or was moved.       │
│                                     │
│   [Go to Dashboard]  [Go Home]      │
└─────────────────────────────────────┘
```

- "Go to Dashboard" links to the user's role dashboard (if logged in)
- "Go Home" links to the landing page (always)
- Do not show a stack trace or technical error message to the user

### 500 — Server Error

**Layout:**
```
┌─────────────────────────────────────┐
│           FreightFlow               │
│                                     │
│              500                    │
│                                     │
│       Something went wrong          │
│                                     │
│   Our team has been notified.       │
│   Please try again in a moment.     │
│                                     │
│   [Try Again]   [Contact Support]   │
└─────────────────────────────────────┘
```

- "Try Again" reloads the current page
- "Contact Support" opens a pre-filled email (`support@freightflow.app`) or WhatsApp link
- Error is logged server-side automatically — do not ask the user to report it unless they want to

---

## 5. Empty States

Empty states are **the first thing a new user sees** on key screens. They must be helpful, clear, and action-driving — not just blank space.

### Empty State: Marketplace (Transporter — No Available Loads)

```
┌─────────────────────────────────────────┐
│  🚛                                     │
│  No loads available right now           │
│                                         │
│  New loads are posted regularly.        │
│  We'll send you an SMS when a load      │
│  matches your route.                    │
│                                         │
│  [Update My Route Preferences]          │
└─────────────────────────────────────────┘
```

- Background: `#F3F4F6` card on white page
- Icon: truck illustration or SVG (not emoji in production)
- CTA links to Profile → Route Preferences settings
- Body text sets expectation and reassures (AT SMS will notify them)

---

### Empty State: My Loads (Shipper — No Loads Posted Yet)

```
┌─────────────────────────────────────────┐
│  📦                                     │
│  No loads posted yet                   │
│                                         │
│  Post your first load to get matched    │
│  with a verified transporter.           │
│                                         │
│  [Post Your First Load]                 │
└─────────────────────────────────────────┘
```

- CTA navigates directly to the Post Load form
- For returning shipper with all loads delivered: show congratulatory micro-copy instead: *"All caught up! Post a new load when you're ready."*

---

### Empty State: Accepted Jobs (Transporter — Nothing Accepted Yet)

```
┌─────────────────────────────────────────┐
│  📋                                     │
│  No active jobs                         │
│                                         │
│  Browse the marketplace to accept a     │
│  load and start earning.                │
│                                         │
│  [Browse Available Loads]               │
└─────────────────────────────────────────┘
```

- CTA navigates to the Available Loads page

---

### Empty State: Notifications Panel (No Notifications)

```
┌─────────────────────────────────────────┐
│  🔔                                     │
│  No notifications yet                   │
│                                         │
│  You're all caught up. Notifications    │
│  for load updates will appear here      │
│  and via SMS.                           │
└─────────────────────────────────────────┘
```

- No CTA needed — this state is naturally resolved when loads are active

---

### Empty State: Cross-Border Documentation (No Documents Uploaded)

```
┌─────────────────────────────────────────┐
│  📄                                     │
│  No documents uploaded                  │
│                                         │
│  Upload your customs documents for      │
│  cross-border shipments.                │
│                                         │
│  [Upload Document]  [View Guidelines]   │
└─────────────────────────────────────────┘
```

---

## 6. Loading States

Every API-driven view needs a loading state to avoid the appearance of an empty state while data is fetching.

### Skeleton Loaders (preferred over spinners for content-heavy screens)

**Load cards skeleton:**
```
┌──────────────────────────────────┐
│ ████████████████  ░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│ ░░░░░░░░░░    ░░░░░░░░░      │
└──────────────────────────────────┘
```

- Use `animate-pulse` (Tailwind) on grey placeholder blocks
- Show 3 skeleton cards while loads are fetching
- Skeleton matches the shape/size of the real card

**Dashboard KPI cards skeleton:**
- 4 grey rectangles the same size as KPI cards, pulsing

**Table skeleton:**
- Grey rows matching expected table row height, pulsing

### Spinner (for action buttons)

When user submits a form or clicks an action button (Post Load, Accept Load, Confirm Delivery):
- Replace button text with a small spinner + "Processing…"
- Disable the button to prevent double submission
- On success: show a toast notification and navigate/refresh
- On error: restore button to original state, show error message below or in toast

### Full-page loading (initial app load / route transition)

- FreightFlow wordmark centered on white background with a small progress bar beneath
- Max display time: 3 seconds — if API hasn't responded, show an error state instead

---

## 7. API Error States (Inline)

When an API call fails inside a page (not a full-page error), show an inline error — not a full 500 redirect.

### Load list fetch fails

```
┌─────────────────────────────────────────┐
│  ⚠️  Couldn't load your loads           │
│  Check your connection and try again.   │
│  [Retry]                                │
└─────────────────────────────────────────┘
```

### Post Load form submit fails

- Show a red error banner above the submit button: *"Something went wrong. Your load was not posted. Please try again."*
- Do not clear the form — the user's input should be preserved

### Accept Load fails (race condition — another transporter accepted first)

- Toast: *"Sorry, this load was just accepted by another transporter. Browse for more loads."*
- Remove the load card from the list immediately

### AT SMS send fails

- This is **non-blocking** — the status update still succeeds in the database
- Log the failure server-side for retry
- User-facing: no error shown (avoid alarming the user over a secondary action)
- If SMS has not been delivered after 10 minutes, system queues a retry

---

*All empty states, loading states, and error states use the FreightFlow design system defined in [`design/brand/design_system.md`](../brand/design_system.md)*

*Related: [`docs/end_to_end_flow.md`](../../docs/end_to_end_flow.md)*
