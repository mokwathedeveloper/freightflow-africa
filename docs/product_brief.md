# FreightFlow SaaS — Product Design Brief
### Africa's Talking Transportation & Logistics Hackathon | Freight & Cargo Logistics Track

## 1. Product Identity

**Product Name:** FreightFlow SaaS  
**Product Type:** SaaS Web Application  
**Industry:** Logistics / Freight / Supply Chain  
**Short Description:** Multi-tenant platform connecting shippers, transporters, and logistics managers with real-time cargo tracking, load matching, analytics dashboards, and cross-border documentation.  
**Current Stage:** MVP  
**Main Business Goal:** Streamline freight operations, improve transparency, and provide a scalable SaaS solution.  
**Main User Goal:** Post and accept loads, track shipments in real-time, and access operational analytics.  
**Primary Platform:** Web app, responsive design for desktop and mobile.

---

## 2. Target Users

**Who is this for:** Freight companies, independent transporters, shippers, logistics managers, and platform admins.  
**Age Range:** 25–60  
**Location/Market:** Africa, scalable globally  
**User Lifestyle:** Busy logistics operators, SME managers, field transporters  
**User Problem:** Inefficient load matching, fragmented freight networks, limited tracking visibility, manual documentation  
**User Desire:** Efficient cargo operations, reliable tracking, actionable analytics  
**User Fears/Objections:** Delays, complex platform, unclear pricing  
**Trust Builders:** Verified transporters, SMS/USSD notifications, transparent pricing, analytics dashboards

---

## 3. Product Value

**Main Problem Solved:** Inefficient freight operations and lack of transparency  
**Main Benefit:** Reduced delays, optimized load matching, enhanced logistics visibility  
**Unique Selling Point:** Multi-tenant SaaS with integrated tracking, analytics, and cross-border documentation  
**Emotional Promise:** Users feel in control, confident, and empowered  
**Top 3 Benefits:** Real-time tracking, AI-driven load matching, operational dashboards  
**Proof Points:** Pilot testing results, transporters and shippers feedback, API integration with SMS/USSD

---

## 4. Product Features

1. Digital freight marketplace for shippers and transporters  
2. Shipper dashboard with load posting, tracking, and notifications  
3. Transporter dashboard for job acceptance, route optimization, and tracking  
4. Admin dashboard for multi-tenant management and analytics  
5. Real-time GPS cargo tracking  
6. SMS/USSD notifications for low-tech users  
7. Subscription and tiered payment management  
8. Cross-border documentation and compliance tools  
9. Reporting and analytics dashboards  
10. Mobile-first responsive design  
**Main User Actions:** Post/load management, track cargo, accept shipments  
**Payment:** Yes, subscription and transaction fees  
**Login/Account:** Yes, multi-role  
**Admin Dashboard:** Yes  
**Search/Filtering:** Yes, for loads, shipments, and reports  
**Notifications:** Yes, SMS, email, web

---

## 5. Pages / Screens Needed

- Landing Page  
- Signup/Login  
- Shipper Dashboard  
- Transporter Dashboard  
- Admin Dashboard  
- Cargo Tracking Page  
- Cross-Border Documentation Page  
- Notifications Center  
- Billing/Subscription Page  
- Reports/Analytics Page  
- Profile/Settings  
- Support/Contact  
**Extra Screens:** Load Posting Page, Tracking Map, Analytics Charts

---

## 6. Brand and Visual Style

**Brand Personality:** Professional, Modern, Premium, Human-Centered  
**Preferred Colors:** Navy Blue (#1E3A8A), Green (#16A34A), Light Grey (#F3F4F6), White (#FFFFFF)  
**Typography:** Clean, sans-serif for headings and body  
**Image Style:** Realistic photography of trucks, cargo handling, dashboards  
**Design Style Preference:** Minimalist / Swiss / Flat Design  
**Style Notes:** Focus on clarity, readability, and usability for professional SaaS users  
**Avoid:** Cartoonish style, clutter, neon colors, fake 3D effects

---

## 7. Human Touch

**Story:** Connecting African freight operators with a professional SaaS platform  
**Real-world Details:** Trucks, shippers, transporters, dashboard operations  
**Trust Elements:** Verified transporters, analytics, reliable notifications  
**Tone of Voice:** Professional, clear, friendly, trustworthy  
**Microcopy Feeling:** Helpful, human, concise

---

## 8. Research and Competitors

**Competitors:** Kobo360, Lori Systems, Twiga Transport Logistics, Sendy, Truckr, Fleeti  
**What’s Liked:** Load matching, mobile accessibility, real-time tracking  
**What to Improve:** SaaS subscription model, multi-user dashboards, cross-border documentation, analytics

---

## 9. Platform and Build Direction

**Design:** Mobile-first, responsive web app  
**Build Tools/Tech:** Next.js + React + TypeScript, Tailwind CSS, Node.js/Express, PostgreSQL, Prisma ORM, Auth.js/JWT, M-Pesa/Stripe for payments, Vercel/Render/Railway for hosting, Docker for containerization  
**Core Communication Infrastructure:** Africa's Talking SDK (Node.js) — SMS API, USSD API, Voice API, Airtime API  
**Output Needed:** UX strategy, wireframes, dashboards, Figma prompt, developer-ready feature list  
**Deadline/Priority:** MVP demo-ready for Africa's Talking Hackathon, May 28, 2026

---

## 10. Wireframe Summary

**Landing Page:** Hero, features, 3-step how it works, testimonials, footer  
**Shipper Dashboard:** Top nav, sidebar, cargo list, notifications, footer  
**Transporter Dashboard:** Top nav, sidebar, load list, notifications  
**Admin Dashboard:** Multi-tenant KPIs, charts, alerts  
**Cargo Tracking Page:** Map, status panel, updates feed, actions  
**Cross-Border Documentation:** Upload section, status, history, help panel

---

## 11. Developer-Ready Features

1. User Authentication  
2. Load Posting & Management  
3. Job Acceptance & Route Tracking  
4. Real-time Cargo Tracking  
5. Admin Multi-Tenant Dashboard  
6. Notifications (SMS/USSD/Email)  
7. Subscription & Payment Management  
8. Cross-Border Documentation  
9. Reporting & Analytics  
10. Responsive Frontend Design

---

## 12. UX/UI Quality Checklist

- Clear product clarity  
- Easy navigation and onboarding  
- Responsive across devices  
- Consistent visual hierarchy  
- Accessibility compliance (WCAG 2.2)  
- Strong CTAs and microcopy  
- Professional, premium look  
- Human-touch design elements

---

## 13. Figma Prompt Summary

Prepare components, dashboards, and pages using brand colors and typography, mobile-first design, card-based layouts, realistic freight images, charts, microcopy, and multi-role dashboards for developers and designers.

---

## 14. Africa's Talking API Integration

FreightFlow uses Africa's Talking APIs as core platform infrastructure — not optional add-ons. These APIs enable FreightFlow to serve the 70%+ of East African transporters who rely on basic mobile phones.

| API | Role in FreightFlow | Key Trigger |
|-----|---------------------|-------------|
| **SMS API** | Load status alerts, delivery confirmations, OTP authentication | Load accepted, cargo picked up, delivered, payment confirmed |
| **USSD API** | Low-tech driver status updates and load tracking (no internet required) | Driver dials `*384*FreightFlow#` to update delivery status |
| **Voice API** | Automated dispatch calls for critical alerts | Cargo delayed >2 hrs, high-value delivery confirmation |
| **Airtime API** | Driver performance rewards — KES 20 airtime per on-time delivery | Delivery confirmed + rating ≥ 4 stars |
| **Marketplace** | Publish FreightFlow as a subscribable service for AT customers | Transport companies subscribe to freight notification bundles |

**Why Africa's Talking:** Africa's Talking provides carrier-grade SMS, USSD, and Voice access across East Africa, enabling FreightFlow to reach transporters with basic phones in rural and peri-urban areas — a population underserved by internet-only logistics platforms.

See [`docs/africas_talking_integration.md`](africas_talking_integration.md) for full implementation specifications including code patterns, webhook configs, message templates, and USSD session flows.

