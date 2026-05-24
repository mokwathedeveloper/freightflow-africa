# Notifications & Alerts — UX/UI Guide with Africa's Talking Integration

This document provides a **professional UX/UI guide** for the Notifications & Alerts module of FreightFlow SaaS, including full Africa's Talking API integration specifications for SMS, USSD, and Voice channels. FreightFlow uses Africa's Talking as its primary communication infrastructure to reach users on any device — smartphone or basic feature phone.

---

## 1. Product Overview
- **Purpose:** Deliver timely notifications and alerts to shippers, transporters, and admin users.
- **Target Users:** All FreightFlow SaaS users (Shippers, Transporters, Admin)
- **Platform:** Web-based SaaS dashboard, responsive for desktop, tablet, and mobile

---

## 2. UX/UI Design Strategy
### Key Principles
- **Visibility:** Notifications should be immediately noticeable without overwhelming the user
- **Consistency:** Follow uniform design patterns across dashboards
- **Responsiveness:** Display correctly on all screen sizes
- **Accessibility:** WCAG 2.2 compliant, readable and distinguishable status indicators
- **Efficiency:** Allow quick access to relevant load or system information

### Color Palette & Typography
- Primary Color: Navy Blue (#1E3A8A)
- Secondary Color: Green (#16A34A)
- Accent Color: Light Grey (#F3F4F6)
- Background: White (#FFFFFF)
- Typography: Sans-serif, clear hierarchy, legible font sizes

---

## 3. User Flow
1. User logs in and dashboard initializes
2. New notifications appear in **Global Notification Panel**
3. Notifications can be filtered: read/unread, type (system, load, shipment update)
4. Users click a notification to view details
5. Notifications trigger contextual actions (navigate to load, alert details, or support page)
6. SMS and email notifications sent based on user preferences
7. Users can mark notifications as read/unread or dismiss them

---

## 4. Wireframes / Page Layouts
### Notifications Panel
- **Top Navigation:** Icon for notifications, count badge
- **Sidebar Filters:** Read, Unread, Alerts, Updates
- **Main Panel:** List of notifications with summary, timestamp, and related action button
- **Action Buttons:** Mark as Read, Dismiss, View Details
- **Footer:** Help link or notification preferences

### Contextual Alerts
- Inline banners for urgent updates (delivery delays, system errors)
- Load-specific notifications attached to the respective dashboard panel
- Pop-up toasts for real-time, temporary notifications

---

## 5. Components
- Notification Drawer / Panel
- Toast messages for real-time alerts
- Filters and search bar
- Status badges: Read / Unread
- Buttons: View Details, Dismiss, Mark as Read
- Icons for notification types (system, shipment, alert)

---

## 6. Interactions & Microcopy
- Clickable notifications navigate to relevant page
- Hover states for notification items
- Real-time updates via WebSocket or API polling
- Confirmation messages when marking as read or dismissing notifications
- SMS and email copy templates for external notifications

---

## 7. Accessibility & Usability
- Keyboard navigable panel and notifications
- High contrast and readable typography for alerts
- Screen reader labels for all notification types
- Mobile-first responsive layout
- Easily distinguishable read/unread status

---

## 8. Developer Guidance
- Reusable React components for NotificationPanel, Toast, StatusBadge
- API integration for real-time notifications, read/unread updates, and contextual alerts
- Error handling for failed API calls
- Maintain consistent spacing, color, and typography according to style guide
- Africa's Talking SDK integration (see Section 8a–8d below)

---

## 8a. Africa's Talking SMS API Integration

**Purpose:** Push load status alerts and delivery confirmations to any mobile phone number.

**Trigger events and message templates:**

| Event | Recipient | SMS Template |
|-------|-----------|--------------|
| Load accepted by transporter | Shipper | `FreightFlow: Your load #[ID] from [Origin] to [Dest] has been accepted by [Transporter Name]. Track at [URL]` |
| Cargo picked up | Shipper | `FreightFlow: Cargo #[ID] has been picked up. Estimated delivery: [Date/Time]. Reply TRACK to check status.` |
| Cargo in transit (update) | Shipper | `FreightFlow: Cargo #[ID] is in transit. Current location: [Checkpoint]. ETA: [Time].` |
| Delivery confirmed | Shipper + Transporter | `FreightFlow: Cargo #[ID] delivered successfully on [Date]. Thank you for using FreightFlow!` |
| New matching load available | Transporter | `FreightFlow: New load available — [Origin] → [Dest], [Weight]kg, [Date]. Login to accept: [URL]` |
| OTP verification | User | `FreightFlow: Your verification code is [OTP]. Valid for 10 minutes. Do not share.` |

**Node.js implementation pattern:**
```javascript
const AfricasTalking = require('africastalking');
const client = AfricasTalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});
const sms = client.SMS;

async function sendLoadAcceptedSMS(shipperPhone, loadId, origin, dest, transporterName, trackUrl) {
  await sms.send({
    to: [shipperPhone],
    message: `FreightFlow: Your load #${loadId} from ${origin} to ${dest} has been accepted by ${transporterName}. Track at ${trackUrl}`,
    from: 'FreightFlow', // alphanumeric sender (where supported)
  });
}
```

**Webhook — delivery reports:** Configure `POST /api/webhooks/sms-delivery` to receive AT delivery report callbacks and update notification status in the database.

**Environment variables required:**
```
AT_API_KEY=your_api_key
AT_USERNAME=your_at_username
AT_SMS_SHORTCODE=FreightFlow
```

---

## 8b. Africa's Talking USSD API Integration

**Purpose:** Allow truck drivers and transporters on basic feature phones to update delivery status and check job assignments — no internet connection or smartphone required.

**USSD shortcode:** `*384*FreightFlow#` (sandbox: `*384*7447#`)

**USSD menu tree:**
```
CON Welcome to FreightFlow
1. Track a Load
2. Update Delivery Status
3. My Active Jobs
4. My Payments
0. Exit

[If 1 selected]
CON Enter Load ID:
[Input] → END Load #[ID]: Status [Status], Location [Checkpoint], ETA [Time]

[If 2 selected]
CON Select new status for Load #[ID]:
1. Picked Up
2. In Transit
3. Delivered
4. Delayed — Report Issue
0. Back

[If confirmed]
END Status updated to [Status]. Shipper has been notified by SMS.

[If 3 selected]
CON Your active jobs:
1. Load #[ID1] — [Origin]→[Dest] — [Status]
2. Load #[ID2] — [Origin]→[Dest] — [Status]
0. Back

[If 4 selected]
CON Your wallet: KES [Balance]
Last payout: KES [Amount] on [Date]
0. Back
```

**Node.js USSD session handler pattern:**
```javascript
app.post('/api/ussd', express.urlencoded({ extended: false }), async (req, res) => {
  const { sessionId, phoneNumber, text, serviceCode } = req.body;
  const parts = text.split('*');
  const level = parts.length;
  let response = '';

  if (text === '') {
    response = 'CON Welcome to FreightFlow\n1. Track a Load\n2. Update Delivery Status\n3. My Active Jobs\n4. My Payments\n0. Exit';
  } else if (text === '1') {
    response = 'CON Enter Load ID:';
  } else if (parts[0] === '1' && level === 2) {
    const load = await getLoadById(parts[1], phoneNumber);
    response = load
      ? `END Load #${load.id}: ${load.status}, ETA ${load.eta}`
      : 'END Load not found. Check the ID and try again.';
  } else if (text === '2') {
    const job = await getActiveJobForDriver(phoneNumber);
    response = job
      ? `CON Update status for Load #${job.id}:\n1. Picked Up\n2. In Transit\n3. Delivered\n4. Delayed\n0. Back`
      : 'END No active job found for your number.';
  }
  // ... additional levels

  res.set('Content-Type', 'text/plain');
  res.send(response);
});
```

**Key UX rules for USSD:**
- Each CON response continues the session; END terminates it
- Keep menu text under 182 characters per screen
- Always include a `0. Back` or `0. Exit` option
- Confirm status updates with a clear END message so the driver knows it worked

---

## 8c. Africa's Talking Voice API Integration

**Purpose:** Automated outbound calls for critical, time-sensitive alerts where an SMS may be missed.

**Trigger conditions:**
- Cargo delayed >2 hours without a status update
- High-value shipment (>KES 500,000) confirmed delivered
- Driver has not responded to 3 consecutive SMS alerts

**IVR call script (XML — AT Voice format):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="en-US-Standard-D" playBeep="false">
    Hello. This is an urgent alert from FreightFlow.
    Your cargo shipment [Load ID] from [Origin] to [Destination]
    has been delayed. Please contact your driver immediately
    or log in to the FreightFlow dashboard for updates.
    Press 1 to be connected to our support team.
    Press 2 to confirm you have received this message.
  </Say>
  <GetDigits timeout="30" finishOnKey="#" callbackUrl="https://your-domain.com/api/voice/callback">
    <Say>Press 1 for support, or 2 to confirm.</Say>
  </GetDigits>
</Response>
```

**Node.js call initiation pattern:**
```javascript
const voice = client.VOICE;

async function triggerDelayAlert(phoneNumber, loadId, origin, dest) {
  await voice.call({
    callFrom: '+254XXXXXXXXX', // your AT virtual number
    callTo: [phoneNumber],
  });
  // AT will hit your callbackUrl with the IVR script URL
}
```

**Webhook:** Configure `POST /api/voice/callback` to handle digit input responses (1 = connect to support, 2 = confirm receipt).

---

## 8d. Africa's Talking Airtime API (Driver Rewards)

**Purpose:** Automatically reward transporters with KES 20 airtime when they complete an on-time delivery with a rating of ≥ 4 stars — no cash handling required.

**Trigger logic:**
1. Shipper confirms delivery
2. Shipper submits rating ≥ 4 stars
3. System checks delivery was on time (actual ≤ ETA + 30 min tolerance)
4. Disburse KES 20 airtime to transporter's phone number

**Node.js airtime disbursement pattern:**
```javascript
const airtime = client.AIRTIME;

async function rewardTransporter(phoneNumber, loadId) {
  const response = await airtime.send({
    recipients: [{
      phoneNumber,
      amount: 'KES 20',
      currencyCode: 'KES',
    }],
  });

  if (response.responses[0].status === 'Success') {
    await logReward(phoneNumber, loadId, 20);
  } else {
    await scheduleRetry(phoneNumber, loadId);
  }
}
```

**Failure handling:** Log failed disbursements and retry up to 3 times with 15-minute intervals before alerting admin.

---

## 8e. API Key Management

All Africa's Talking credentials must be stored as environment variables — never hardcoded.

```bash
# .env (never commit to git)
AT_API_KEY=your_api_key_here
AT_USERNAME=sandbox             # use "sandbox" for testing, your AT username for production
AT_SENDER_ID=FreightFlow        # alphanumeric sender (subject to country support)
AT_USSD_CODE=*384*7447#         # sandbox shortcode
AT_VOICE_NUMBER=+254XXXXXXXXX   # your AT virtual number
```

**Sandbox vs Production toggle:**
- Set `AT_USERNAME=sandbox` and use [Africa's Talking Simulator](https://simulator.africastalking.com) for local testing
- Switch to your real AT username for production — no code changes needed

---

## 9. Deliverables
1. Wireframes for Global Notification Panel and Contextual Alerts
2. Interactive Figma prototype
3. Component library for NotificationPanel, Toast, and StatusBadge
4. UX copy and microcopy for all notification messages
5. Accessibility checklist
6. Africa's Talking integration: SMS service, USSD session handler, Voice IVR, Airtime disbursement
7. Webhook handlers for AT delivery reports and voice callbacks
8. Environment variable documentation (`.env.example`)

---

**This guide ensures the Notifications & Alerts module is implemented professionally, providing clear, accessible, and responsive notifications across all user roles — from smartphone web users to feature-phone drivers using USSD.**

*Full integration reference: [`docs/africas_talking_integration.md`](../../docs/africas_talking_integration.md)*