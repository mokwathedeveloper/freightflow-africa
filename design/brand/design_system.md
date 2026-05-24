# FreightFlow SaaS — Design System
### Authoritative Brand & UX Guidelines

This document is the **single source of truth** for all visual design, UX strategy, and design system rules for FreightFlow SaaS. It consolidates the design style benchmark and UX research output into one authoritative reference for designers and developers.

---

## 1. Executive UX Summary

FreightFlow is a professional multi-tenant logistics SaaS connecting shippers, transporters, and logistics managers across Africa. The platform delivers real-time cargo tracking, digital load matching, and Africa's Talking-powered SMS/USSD communication — enabling every user, from smartphone-equipped office managers to feature-phone field drivers, to interact with the platform.

**Design mandate:** Build for the African logistics professional first. Prioritize clarity, speed of action, and accessibility over visual decoration.

---

## 2. Product Positioning

FreightFlow positions as the **most inclusive and transparent** freight logistics platform in East Africa — differentiated by:
1. USSD access for feature-phone drivers (no internet required)
2. Real-time SMS notifications at every cargo status change
3. Multi-tenant architecture for freight companies of any size
4. Professional SaaS UX that matches global standards while addressing local realities

---

## 3. Target User Personas

### Persona 1: The Shipper (SME / Corporate)
- **Role:** Operations manager, procurement officer, or business owner who ships goods
- **Goal:** Post loads, track cargo in real time, reduce delivery uncertainty
- **Pain Points:** Doesn't know where cargo is; can't trust informal transporter commitments
- **Device:** Desktop/laptop primarily; mobile web secondarily
- **Key feature:** Cargo tracking page + SMS alerts

### Persona 2: The Transporter
- **Role:** Owner-driver, fleet operator, or independent trucker
- **Goal:** Find loads to fill truck capacity, accept quickly, get paid
- **Pain Points:** Wastes fuel and time looking for loads; no verified load board
- **Device:** Smartphone (urban), basic feature phone (peri-urban/rural)
- **Key feature:** Marketplace + USSD status updates

### Persona 3: The Admin / Platform Operator
- **Role:** Logistics company manager running the platform for their fleet
- **Goal:** Manage users, monitor all shipments, review analytics, manage subscriptions
- **Pain Points:** No single view of all operations; reporting is manual
- **Device:** Desktop
- **Key feature:** Admin dashboard + reports

---

## 4. Chosen Design Style: Minimalist / Swiss / Flat

**Decision:** Minimalist (Swiss / Flat Design) is the primary style for all dashboards and data-heavy screens.

| Style | Used For | Reason |
|-------|----------|--------|
| Minimalist / Swiss / Flat | Dashboards, data tables, admin panel, tracking screens | Maximum clarity for operational users; professional SaaS feel |
| Claymorphism accents | Onboarding screens, empty states, marketing landing page | Adds warmth and approachability at entry points |

**Do not use:** Skeuomorphism, Neo Brutalist, Developer Terminal aesthetic for the core product (reserved for possible future admin-only power-user views).

---

## 5. Color Palette

| Token | Color | Hex | Usage |
|-------|-------|-----|-------|
| **Primary** | Navy Blue | `#1E3A8A` | Primary buttons, active nav, headings, brand identity |
| **Secondary** | Green | `#16A34A` | Success states, delivery confirmed, positive indicators, secondary CTA |
| **Accent** | Light Grey | `#F3F4F6` | Card backgrounds, table stripes, input backgrounds |
| **Background** | White | `#FFFFFF` | Page backgrounds, modal backdrops |
| **Text / Dark** | Dark Charcoal | `#111827` | Body text, headings |
| **Text / Muted** | Medium Grey | `#6B7280` | Placeholders, secondary labels, timestamps |
| **Error** | Red | `#DC2626` | Error messages, failed status, alert badges |
| **Warning** | Amber | `#D97706` | Delayed status, pending actions |
| **Border** | Border Grey | `#E5E7EB` | Card borders, table borders, dividers |

**WCAG 2.2 compliance:** All text-on-background combinations must meet a contrast ratio of ≥ 4.5:1 for normal text and ≥ 3:1 for large text.

---

## 6. Typography

| Element | Font | Weight | Size | Usage |
|---------|------|--------|------|-------|
| H1 — Page Title | Inter / sans-serif | 700 (Bold) | 32px / 2rem | Main page headings |
| H2 — Section Header | Inter / sans-serif | 600 (Semibold) | 24px / 1.5rem | Section titles |
| H3 — Card Title | Inter / sans-serif | 600 (Semibold) | 18px / 1.125rem | Card headers, modal titles |
| Body | Inter / sans-serif | 400 (Regular) | 16px / 1rem | Body copy, form labels |
| Small / Caption | Inter / sans-serif | 400 (Regular) | 14px / 0.875rem | Timestamps, secondary info |
| Micro | Inter / sans-serif | 400 (Regular) | 12px / 0.75rem | Status badges, helper text |
| Button | Inter / sans-serif | 500 (Medium) | 14–16px | CTA and action buttons |
| Code / Monospace | JetBrains Mono | 400 | 14px | Load IDs, tracking codes |

**Recommended font stack (Tailwind CSS):**
```css
font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
```

---

## 7. Spacing & Grid System

- **Base unit:** 4px (Tailwind's `space-1`)
- **Component spacing:** multiples of 4px (4, 8, 12, 16, 24, 32, 48, 64px)
- **Card padding:** 24px (`p-6`)
- **Page container:** max-width 1280px, centered, horizontal padding 24px desktop / 16px mobile
- **Grid:** 12-column grid for dashboard layouts; 1-column mobile, 2–3 column tablet, 3–4 column desktop

---

## 8. Component Rules

### Buttons
| Variant | Style | Tailwind Classes (example) |
|---------|-------|---------------------------|
| Primary | Navy Blue background, white text | `bg-blue-800 text-white hover:bg-blue-900 px-4 py-2 rounded-md font-medium` |
| Secondary | White background, navy border | `border border-blue-800 text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-md` |
| Success | Green background | `bg-green-600 text-white hover:bg-green-700` |
| Danger | Red background | `bg-red-600 text-white hover:bg-red-700` |
| Ghost | Transparent, grey text | `text-gray-600 hover:bg-gray-100` |
| Disabled | Grey, cursor-not-allowed | `bg-gray-200 text-gray-400 cursor-not-allowed` |

### Cards
- Background: `#FFFFFF`
- Border: `1px solid #E5E7EB`
- Border radius: `8px` (`rounded-lg`)
- Shadow: `0 1px 3px rgba(0,0,0,0.1)` (`shadow-sm`)
- Padding: `24px` (`p-6`)
- Hover (interactive cards): `shadow-md` transition

### Status Badges
| Status | Color | Badge Style |
|--------|-------|-------------|
| POSTED | Blue | `bg-blue-100 text-blue-800` |
| ACCEPTED | Indigo | `bg-indigo-100 text-indigo-800` |
| PICKED UP | Purple | `bg-purple-100 text-purple-800` |
| IN TRANSIT | Amber | `bg-amber-100 text-amber-800` |
| DELIVERED | Green | `bg-green-100 text-green-800` |
| DELAYED | Red | `bg-red-100 text-red-800` |
| CANCELLED | Grey | `bg-gray-100 text-gray-600` |

### Form Inputs
- Border: `1px solid #E5E7EB`
- Focus border: `2px solid #1E3A8A`
- Padding: `10px 14px`
- Border radius: `6px`
- Error state: `border-red-500` with red helper text below
- Label: above input, 14px, `text-gray-700`, 8px margin-bottom

### Notification Types
| Type | Icon | Color |
|------|------|-------|
| Info | Info circle | Navy Blue |
| Success | Checkmark | Green |
| Warning | Triangle | Amber |
| Error | X circle | Red |
| SMS sent | Phone | Navy Blue |

---

## 9. Dashboard Layout Pattern

All role dashboards (Shipper, Transporter, Admin) follow this consistent layout:

```
┌─────────────────────────────────────────────────────────┐
│  TOP NAV: Logo | [Role] | Search | Notifications (badge) │
│           | Profile avatar | Logout                       │
├──────────┬──────────────────────────────────────────────┤
│          │                                               │
│ SIDEBAR  │  MAIN CONTENT AREA                            │
│          │                                               │
│ • Dashboard  ├── KPI Cards (4-across on desktop)        │
│ • [Role page]│                                           │
│ • Tracking  ├── Data Table / List (filterable)           │
│ • Notifs    │                                           │
│ • Billing   ├── Chart / Map (where applicable)          │
│ • Profile   │                                           │
│ • Logout    └─────────────────────────────────────────  │
│          │                                               │
└──────────┴──────────────────────────────────────────────┘
```

**Mobile layout:** Sidebar collapses to bottom navigation bar (5 tabs max).

---

## 10. UX Writing & Microcopy Guidelines

**Tone:** Professional, clear, friendly, human. Never jargon-heavy or condescending.

| Context | Example |
|---------|---------|
| Empty state (no loads) | "No loads posted yet. Post your first load to get matched with a transporter." |
| Load accepted | "Your load has been accepted! You'll receive an SMS when it's picked up." |
| USSD confirmation | "Status updated to Picked Up. Your shipper has been notified." |
| Error (form) | "Please enter a valid phone number, e.g. +254712345678" |
| Error (API) | "Something went wrong. Please try again or contact support." |
| Loading state | "Loading your loads…" |
| SMS too long warning | "SMS will be split into 2 parts (>160 chars)" |
| Delivery confirmed | "Delivered! Great job. KES 20 airtime reward on its way." |

**Rules:**
- Use "you" and "your" — address the user directly
- Use active voice: "Your load was accepted" not "The load has been accepted by a transporter"
- Status labels in ALL CAPS with badge styling: DELIVERED, IN TRANSIT, DELAYED
- Avoid: "Error 422", "Null value", "Undefined", or any technical error surfaced raw to users

---

## 11. Accessibility Checklist

- [ ] All text meets WCAG 2.2 contrast ratio (≥ 4.5:1 for normal, ≥ 3:1 for large)
- [ ] All interactive elements are keyboard-navigable (Tab order logical)
- [ ] All images have descriptive `alt` text
- [ ] All form inputs have associated `<label>` elements
- [ ] ARIA roles used for modals, dialogs, alerts, and dynamic content
- [ ] Focus indicators visible for all focusable elements
- [ ] Mobile tap targets ≥ 44×44px
- [ ] No content relies solely on color to convey meaning (always pair with text or icon)
- [ ] Screen reader testing on key flows (login, post load, accept load)

---

## 12. Figma Design Prompt

For Figma design work, use this prompt to generate on-brand components:

> "Design a professional Minimalist / Swiss SaaS dashboard for FreightFlow, a freight marketplace platform. Use Navy Blue (#1E3A8A) as primary, Green (#16A34A) as secondary, Light Grey (#F3F4F6) as background accents, White (#FFFFFF) as page background, and Dark Charcoal (#111827) for text. Typography: Inter (Bold for headings, Regular for body). Include: card-based KPI summaries, a data table with status badges (POSTED, ACCEPTED, IN TRANSIT, DELIVERED, DELAYED), a left sidebar with nav icons, a top navbar with notification bell and profile avatar, and a status timeline for cargo tracking. Ensure mobile-first responsive design, WCAG 2.2 accessibility, subtle hover states, and minimal shadows. Reference mockups in `design/mockups/`."

---

## 13. Design Quality Checklist

Before any screen is considered complete, verify:

- [ ] Uses only palette colors defined in Section 5
- [ ] Typography follows sizing rules in Section 6
- [ ] Status badges match the color map in Section 8
- [ ] All CTA buttons have hover and disabled states
- [ ] Form inputs show focus, error, and success states
- [ ] Empty states and loading states are designed
- [ ] Mobile layout tested (320px minimum width)
- [ ] No lorem ipsum — all placeholder text is realistic freight data
- [ ] Notification icons correct for each type
- [ ] Microcopy follows tone guidelines in Section 10

---

*This design system is the single source of truth. All deviations require explicit team agreement.*

*Related: [`design/ux_ui_blueprint.md`](../ux_ui_blueprint.md) · [`design/features/`](../features/) · [`design/mockups/`](../mockups/)*
