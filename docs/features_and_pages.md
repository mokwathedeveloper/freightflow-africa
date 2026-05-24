# FreightFlow SaaS — Features and Pages
### Africa's Talking Transportation & Logistics Hackathon | Freight & Cargo Logistics Track

This document provides a **professional, project-specific overview of all features and pages** for the FreightFlow SaaS platform, tailored for development, design, and investor reference.

---

## Core Features

1. **Digital Freight Marketplace**
   - Post and browse available loads
   - Match shippers with transporters
   - Load acceptance and confirmation

2. **Shipper Dashboard**
   - Load posting and tracking
   - Real-time cargo status updates
   - Notifications (SMS/email)
   - Analytics for shipment efficiency

3. **Transporter Dashboard**
   - View available loads
   - Accept/reject loads
   - Route and ETA visualization
   - Notifications for new jobs or updates

4. **Admin Dashboard**
   - Multi-tenant management
   - User and load management
   - KPI charts and analytics
   - Subscription management
   - System alerts and notifications

5. **Cargo Tracking**
   - Real-time GPS tracking
   - Status updates: in transit, delivered, delayed
   - Historical updates and timeline feed
   - Issue reporting and support contact

6. **Cross-Border Documentation**
   - Upload invoices and customs forms
   - Status tracking: pending, verified, rejected
   - History of submitted documents
   - Documentation guidelines and tips

7. **Notifications & Alerts** *(Africa's Talking SMS, USSD, Voice)*
   - Global notification panel (web)
   - **AT SMS API:** Push load status updates, delivery confirmations, and OTP codes directly to any mobile phone
   - **AT USSD API:** Drivers on basic phones dial `*384*FreightFlow#` to update delivery status and check job assignments — no internet required
   - **AT Voice API:** Automated phone calls for critical alerts (cargo delayed, high-value shipment confirmation)
   - Read/unread management for web notifications
   - Contextual alerts for actions or updates

8. **Billing & Subscription Management** *(M-Pesa / Stripe + AT Airtime)*
   - Subscription plan selection
   - Payment integration (M-Pesa for East Africa, Stripe for card payments)
   - **AT Airtime API:** Reward transporters with KES 20 airtime per verified on-time delivery — incentivizes performance without cash handling
   - Billing history and invoice management
   - Upgrade/downgrade options

9. **Profile & Settings**
   - Personal info management
   - Change password and security settings
   - Notification preferences
   - Role-specific configurations

10. **Reports & Analytics**
    - KPIs: deliveries, active users, load efficiency
    - Charts and tables for fleet, shipment, and user analytics
    - Exportable data (CSV, PDF)
    - Filter by date, user, or region

11. **Security & Compliance**
    - Role-based access control
    - Data encryption and secure storage
    - Audit logs and activity tracking
    - GDPR and data protection compliance

12. **Africa's Talking Marketplace Integration**
    - Publish FreightFlow as a plugin on the AT Marketplace
    - Transport companies subscribe to freight notification bundles via AT
    - Enables discovery by existing AT customers across East Africa
    - Allows WhatsApp/SMS-based load status subscriptions without a web account

---

## Pages / Screens

### Public Pages
1. Landing Page
2. About / Company Info
3. FAQ / Support
4. Contact Page
5. Terms & Privacy Policy

### Authentication
1. Sign Up / Registration (Shipper / Transporter)
2. Login
3. Password Recovery / Reset

### Shipper Pages
1. Shipper Dashboard
2. Post New Load
3. View / Track Shipments
4. Notifications Panel
5. Billing / Subscription Page
6. Profile & Settings

### Transporter Pages
1. Transporter Dashboard
2. Available Loads
3. Accepted Jobs
4. Route and Tracking Page
5. Notifications Panel
6. Billing / Subscription Page
7. Profile & Settings

### Admin Pages
1. Admin Dashboard (KPIs, charts)
2. User Management (Shippers, Transporters)
3. Load Management
4. Analytics / Reports
5. Subscription Management
6. System Alerts / Notifications

### Shared Pages
1. Cargo Tracking Page (interactive map)
2. Cross-Border Documentation Page
3. Notifications / Alerts Panel
4. Error Pages (404, 500)
5. Loading / Empty States

---

**This list ensures all features and pages are professionally organized and clearly defined, ready for development, hackathon demo, and investor reference.**

---

*Africa's Talking API touchpoints are highlighted in features 7 and 8. See [`docs/africas_talking_integration.md`](africas_talking_integration.md) for full integration specs.*