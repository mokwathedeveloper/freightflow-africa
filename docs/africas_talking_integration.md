# Africa's Talking API Integration — FreightFlow SaaS

This document provides the **complete integration specification** for all Africa's Talking APIs used in FreightFlow. It covers use cases, code patterns, webhook configurations, message templates, and environment setup for each API.

---

## Overview

FreightFlow integrates five Africa's Talking services as core platform infrastructure:

| API | Integration Purpose | Priority |
|-----|---------------------|----------|
| **SMS API** | Load status notifications, delivery confirmations, OTP auth | MVP (must-have) |
| **USSD API** | Feature-phone driver interface — no internet required | MVP (must-have) |
| **Voice API** | Critical alert escalation via automated phone call | Post-MVP |
| **Airtime API** | Driver performance rewards | Post-MVP |
| **Marketplace** | Publish FreightFlow as an AT customer plugin | Post-hackathon |

**SDK Installation:**
```bash
npm install africastalking
```

**SDK Initialization (used across all API services):**
```javascript
// server/services/at.js
const AfricasTalking = require('africastalking');

const AT = AfricasTalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,  // 'sandbox' for testing
});

module.exports = AT;
```

---

## 1. SMS API

### Use Cases in FreightFlow

| Trigger Event | Recipient | Priority |
|---------------|-----------|----------|
| Transporter accepts shipper's load | Shipper | MVP |
| Cargo picked up by driver | Shipper | MVP |
| Cargo in transit (location checkpoint) | Shipper | MVP |
| Cargo delivered successfully | Shipper + Transporter | MVP |
| New matching load posted | Matching Transporters | MVP |
| OTP for phone number verification | Registering User | MVP |
| Cargo delayed alert | Shipper | MVP |
| Payment confirmed | Shipper | Post-MVP |

### Message Templates

```
LOAD_ACCEPTED:
"FreightFlow: Your load #{loadId} ({origin}→{dest}) has been accepted
by {transporterName}. Track at {trackUrl}"

CARGO_PICKUP:
"FreightFlow: Cargo #{loadId} picked up at {pickupTime}.
Est. delivery: {eta}. Reply TRACK to check status."

IN_TRANSIT_UPDATE:
"FreightFlow: Cargo #{loadId} is in transit.
Checkpoint: {location}. ETA: {eta}."

DELIVERY_CONFIRMED:
"FreightFlow: Cargo #{loadId} delivered on {date}. ✓
Thank you for using FreightFlow!"

NEW_LOAD_AVAILABLE:
"FreightFlow: New load — {origin}→{dest}, {weight}kg, {date}.
Log in to accept: {dashboardUrl}"

OTP_VERIFICATION:
"FreightFlow: Your verification code is {otp}.
Valid 10 mins. Do not share."

CARGO_DELAYED:
"FreightFlow ALERT: Cargo #{loadId} is delayed.
Last known location: {location}.
Contact driver: {driverPhone}"
```

### Implementation

```javascript
// server/services/sms.service.js
const AT = require('./at');
const sms = AT.SMS;

const SMS_SENDER = process.env.AT_SENDER_ID || 'FreightFlow';

async function sendSMS(to, message) {
  const recipients = Array.isArray(to) ? to : [to];
  try {
    const result = await sms.send({
      to: recipients,
      message,
      from: SMS_SENDER,
    });
    console.log('[SMS] Sent:', result);
    return result;
  } catch (err) {
    console.error('[SMS] Failed:', err.message);
    throw err;
  }
}

async function notifyLoadAccepted({ shipperPhone, loadId, origin, dest, transporterName, trackUrl }) {
  const msg = `FreightFlow: Your load #${loadId} (${origin}→${dest}) has been accepted by ${transporterName}. Track at ${trackUrl}`;
  return sendSMS(shipperPhone, msg);
}

async function notifyCargoPickup({ shipperPhone, loadId, pickupTime, eta }) {
  const msg = `FreightFlow: Cargo #${loadId} picked up at ${pickupTime}. Est. delivery: ${eta}.`;
  return sendSMS(shipperPhone, msg);
}

async function notifyDeliveryConfirmed({ shipperPhone, transporterPhone, loadId, date }) {
  const msg = `FreightFlow: Cargo #${loadId} delivered on ${date}. Thank you for using FreightFlow!`;
  return sendSMS([shipperPhone, transporterPhone], msg);
}

async function sendOTP({ phone, otp }) {
  const msg = `FreightFlow: Your verification code is ${otp}. Valid for 10 minutes. Do not share.`;
  return sendSMS(phone, msg);
}

module.exports = { sendSMS, notifyLoadAccepted, notifyCargoPickup, notifyDeliveryConfirmed, sendOTP };
```

### Wiring SMS to Load Events

```javascript
// server/controllers/loads.controller.js (excerpt)
const smsService = require('../services/sms.service');

async function acceptLoad(req, res) {
  const { loadId } = req.params;
  const transporter = req.user;

  const load = await Load.findById(loadId);
  await load.update({ status: 'ACCEPTED', transporterId: transporter.id });

  // Fire SMS notification (non-blocking)
  smsService.notifyLoadAccepted({
    shipperPhone: load.shipper.phone,
    loadId: load.id,
    origin: load.origin,
    dest: load.destination,
    transporterName: transporter.name,
    trackUrl: `${process.env.APP_URL}/track/${load.id}`,
  }).catch(err => console.error('SMS failed (non-critical):', err.message));

  res.json({ success: true, load });
}
```

### Delivery Report Webhook

AT calls your webhook when SMS delivery status changes (delivered, failed, etc.).

```javascript
// server/routes/webhooks.js
router.post('/sms-delivery', express.urlencoded({ extended: false }), async (req, res) => {
  const { id, status, phoneNumber, networkCode, failureReason } = req.body;
  // Log to database for audit trail
  await SmsLog.create({ messageId: id, status, phoneNumber, networkCode, failureReason });
  res.sendStatus(200);
});
```

Configure the webhook URL in your AT dashboard: `https://your-domain.com/api/webhooks/sms-delivery`

---

## 2. USSD API

### Use Case

Truck drivers and transporters on **basic feature phones** dial a USSD shortcode to:
- Update delivery status (Picked Up / In Transit / Delivered / Delayed)
- Check their active job assignments
- Track a load by ID
- Check their payment wallet balance

**This removes the internet requirement** — a key barrier for East African field drivers.

**Sandbox shortcode:** `*384*7447#`
**Production shortcode:** To be registered with Africa's Talking (submit a shortcode request via your AT dashboard)

### Full USSD Menu Tree (Multi-Load Aware)

**Decision rule for "Update Delivery Status":**
- If driver has **1 active job** → go directly to the status options (skip job selection)
- If driver has **2–3 active jobs** → show a job selection list first, then status options
- Maximum 3 jobs shown (USSD screen limit ~182 chars)

```
*384*FreightFlow#  (sandbox: *384*7447#)
│
├── 1. Track a Load
│   └── CON: Enter Load ID:
│       └── [Input e.g. FF-001]
│           └── END: Load #FF-001
│                    Status: IN TRANSIT
│                    Checkpoint: Mtito Andei
│                    ETA: May 30, 5:00 PM
│
├── 2. Update Delivery Status
│   │
│   ├── [IF 1 active job] ─────────────────────────────────
│   │   └── CON: Update Load #FF-001 (Nbi→Msa)?
│   │       ├── 1. Picked Up
│   │       ├── 2. In Transit
│   │       ├── 3. Delivered
│   │       ├── 4. Delayed
│   │       └── 0. Back
│   │           └── [Selection]
│   │               └── END: Status updated to [X].
│   │                        Shipper has been notified.
│   │
│   └── [IF 2+ active jobs] ──────────────────────────────
│       └── CON: Which load to update?
│           ├── 1. FF-001 Nairobi→Mombasa
│           ├── 2. FF-002 Kisumu→Nakuru
│           └── 0. Back
│               └── [Select job index]
│                   └── CON: Update Load #FF-00X?
│                       ├── 1. Picked Up
│                       ├── 2. In Transit
│                       ├── 3. Delivered
│                       ├── 4. Delayed
│                       └── 0. Back
│                           └── [Selection]
│                               └── END: Status updated.
│                                        Shipper notified.
│
├── 3. My Active Jobs
│   └── CON: Your jobs (up to 3):
│       ├── 1. FF-001 Nairobi→Mombasa [PICKED UP]
│       ├── 2. FF-002 Kisumu→Nakuru [ACCEPTED]
│       └── 0. Back
│
├── 4. My Wallet
│   └── END: Wallet: KES 340
│                Last payout: KES 20 on May 23
│
└── 0. Exit
    └── END: Goodbye from FreightFlow.
```

### USSD Session Handler (Fixed — Multi-Load Aware)

```javascript
// server/routes/ussd.js
const express = require('express');
const router = express.Router();
const {
  getLoadById,
  getActiveJobsForDriver,
  updateLoadStatus,
  getDriverWallet,
} = require('../services/load.service');
const { sendSMS } = require('../services/sms.service');

const STATUS_MAP = {
  '1': 'PICKED_UP',
  '2': 'IN_TRANSIT',
  '3': 'DELIVERED',
  '4': 'DELAYED',
};

// Human-readable status labels for USSD display (keep short — 182 char limit)
const STATUS_LABEL = {
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  DELAYED: 'Delayed',
  ACCEPTED: 'Accepted',
  POSTED: 'Posted',
};

router.post('/', express.urlencoded({ extended: false }), async (req, res) => {
  const { sessionId, phoneNumber, text } = req.body;
  const parts = text ? text.split('*') : [''];
  let response = '';

  try {
    // ── Level 1: Main menu ─────────────────────────────────────────
    if (text === '') {
      response = 'CON Welcome to FreightFlow\n1. Track a Load\n2. Update Delivery Status\n3. My Active Jobs\n4. My Wallet\n0. Exit';

    // ── Exit ───────────────────────────────────────────────────────
    } else if (text === '0') {
      response = 'END Goodbye from FreightFlow.';

    // ── Branch 1: Track a Load ─────────────────────────────────────
    } else if (text === '1') {
      response = 'CON Enter Load ID (e.g. FF-001):';

    } else if (parts[0] === '1' && parts.length === 2) {
      const load = await getLoadById(parts[1].trim().toUpperCase());
      if (!load) {
        response = 'END Load not found. Check the ID and try again.';
      } else {
        const status = STATUS_LABEL[load.status] || load.status;
        const loc = load.lastLocation || 'Not available';
        const eta = load.eta ? new Date(load.eta).toLocaleDateString('en-KE', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : 'TBD';
        response = `END Load #${load.shortId}\nStatus: ${status}\nLocation: ${loc}\nETA: ${eta}`;
      }

    // ── Branch 2: Update Delivery Status ──────────────────────────
    } else if (text === '2') {
      const jobs = await getActiveJobsForDriver(phoneNumber);
      if (!jobs.length) {
        response = 'END No active jobs for your number. Dial again after accepting a load.';
      } else if (jobs.length === 1) {
        // Single job — skip job selection, go straight to status options
        const j = jobs[0];
        const origin = j.origin.split(',')[0]; // city only to stay under char limit
        const dest = j.destination.split(',')[0];
        response = `CON Update Load #${j.shortId} (${origin}→${dest}):\n1. Picked Up\n2. In Transit\n3. Delivered\n4. Delayed\n0. Back`;
      } else {
        // Multiple jobs — show selection list (max 3)
        const jobLines = jobs.slice(0, 3)
          .map((j, i) => `${i + 1}. ${j.shortId} ${j.origin.split(',')[0]}→${j.destination.split(',')[0]}`)
          .join('\n');
        response = `CON Which load to update?\n${jobLines}\n0. Back`;
      }

    // ── Branch 2 + single job: status selection ────────────────────
    // text = '2*1' | '2*2' | '2*3' | '2*4'  (when only 1 active job)
    } else if (parts[0] === '2' && parts.length === 2 && STATUS_MAP[parts[1]]) {
      const jobs = await getActiveJobsForDriver(phoneNumber);
      if (!jobs.length) {
        response = 'END No active jobs found. Please dial again.';
      } else if (jobs.length === 1) {
        // Single job flow — apply status directly
        const job = jobs[0];
        const newStatus = STATUS_MAP[parts[1]];
        await updateLoadStatus(job.id, newStatus, phoneNumber);
        await sendSMS(
          job.shipper.phone,
          `FreightFlow: Cargo #${job.shortId} status updated to "${STATUS_LABEL[newStatus]}" by your driver.`
        );
        response = `END Status updated to "${STATUS_LABEL[newStatus]}". Shipper has been notified.`;
      } else {
        // Multiple jobs — user picked a job index, now show status options
        const jobIndex = parseInt(parts[1], 10) - 1;
        if (isNaN(jobIndex) || jobIndex < 0 || jobIndex >= jobs.length) {
          response = 'END Invalid selection. Please dial again.';
        } else {
          const j = jobs[jobIndex];
          const origin = j.origin.split(',')[0];
          const dest = j.destination.split(',')[0];
          response = `CON Update Load #${j.shortId} (${origin}→${dest}):\n1. Picked Up\n2. In Transit\n3. Delivered\n4. Delayed\n0. Back`;
        }
      }

    // ── Branch 2 + multi-job: job selected + status selected ───────
    // text = '2*[jobIndex]*[statusKey]'
    } else if (parts[0] === '2' && parts.length === 3 && STATUS_MAP[parts[2]]) {
      const jobs = await getActiveJobsForDriver(phoneNumber);
      const jobIndex = parseInt(parts[1], 10) - 1;
      if (!jobs.length || isNaN(jobIndex) || jobIndex < 0 || jobIndex >= jobs.length) {
        response = 'END Invalid selection. Please dial again.';
      } else {
        const job = jobs[jobIndex];
        const newStatus = STATUS_MAP[parts[2]];
        await updateLoadStatus(job.id, newStatus, phoneNumber);
        await sendSMS(
          job.shipper.phone,
          `FreightFlow: Cargo #${job.shortId} status updated to "${STATUS_LABEL[newStatus]}" by your driver.`
        );
        response = `END Status updated to "${STATUS_LABEL[newStatus]}". Shipper has been notified.`;
      }

    // ── Branch 3: My Active Jobs ───────────────────────────────────
    } else if (text === '3') {
      const jobs = await getActiveJobsForDriver(phoneNumber);
      if (!jobs.length) {
        response = 'END No active jobs. Accept a load on the FreightFlow app to see it here.';
      } else {
        const jobLines = jobs.slice(0, 3)
          .map((j, i) => `${i + 1}. ${j.shortId} ${j.origin.split(',')[0]}→${j.destination.split(',')[0]} [${STATUS_LABEL[j.status] || j.status}]`)
          .join('\n');
        response = `CON Your active jobs:\n${jobLines}\n0. Back`;
      }

    // ── Branch 3: Back from jobs list ─────────────────────────────
    } else if (text === '3*0') {
      response = 'CON Welcome to FreightFlow\n1. Track a Load\n2. Update Delivery Status\n3. My Active Jobs\n4. My Wallet\n0. Exit';

    // ── Branch 4: My Wallet ────────────────────────────────────────
    } else if (text === '4') {
      const wallet = await getDriverWallet(phoneNumber);
      const lastDate = wallet.lastDate
        ? new Date(wallet.lastDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
        : 'N/A';
      response = `END Wallet: KES ${wallet.balance}\nLast payout: KES ${wallet.lastAmount || 0} on ${lastDate}`;

    } else {
      response = 'END Invalid selection. Please dial *384*7447# to start again.';
    }

  } catch (err) {
    console.error('[USSD] Error:', err.message);
    response = 'END An error occurred. Please try again. Ref: ' + (err.code || 'ERR');
  }

  res.set('Content-Type', 'text/plain');
  res.send(response);
});

module.exports = router;
```

**Register this route in your Express app:**
```javascript
app.use('/api/ussd', require('./routes/ussd'));
```

**Register the callback URL in your AT dashboard:**
`https://your-domain.com/api/ussd`

### USSD UX Rules

- `CON` responses continue the session (more menus follow)
- `END` responses terminate the session (always show a clear confirmation)
- Keep each screen under **182 characters** (AT USSD display limit)
- Always include a back option (`0. Back`) for every nested menu
- After any status update, send an SMS confirmation so the driver has a record

---

## 3. Voice API

### Use Cases

| Trigger | Call Content |
|---------|-------------|
| Cargo delayed >2 hours without update | Alert shipper, provide driver contact option |
| Driver unresponsive to 3 consecutive SMS | Escalation call to transporter |
| High-value delivery confirmed (>KES 500k) | Confirmation call to shipper |

### IVR Call Script (AT Voice XML)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="en-US-Standard-D" playBeep="false">
    Hello. This is an urgent alert from FreightFlow.
    Your cargo shipment [Load ID] from [Origin] to [Destination]
    has been delayed. The estimated delivery time has passed.
    Press 1 to be connected to your driver.
    Press 2 to speak with FreightFlow support.
    Press 3 to confirm you have received this message.
  </Say>
  <GetDigits timeout="30" finishOnKey="#"
    callbackUrl="https://your-domain.com/api/voice/callback">
    <Say>Please press 1, 2, or 3 now.</Say>
  </GetDigits>
</Response>
```

### Outbound Call Initiation

```javascript
// server/services/voice.service.js
const AT = require('./at');
const voice = AT.VOICE;

async function triggerDelayAlert({ shipperPhone, loadId, origin, dest }) {
  try {
    await voice.call({
      callFrom: process.env.AT_VOICE_NUMBER,
      callTo: [shipperPhone],
    });
    console.log(`[Voice] Delay alert call initiated for load #${loadId} to ${shipperPhone}`);
  } catch (err) {
    console.error('[Voice] Call failed:', err.message);
  }
}

module.exports = { triggerDelayAlert };
```

### Voice Callback Handler

```javascript
// server/routes/webhooks.js (add to existing webhooks router)
router.post('/voice/callback', express.urlencoded({ extended: false }), async (req, res) => {
  const { sessionId, callerNumber, dtmfDigits } = req.body;

  let xmlResponse = '';
  if (dtmfDigits === '1') {
    xmlResponse = `<Response><Say>Connecting you to your driver now.</Say><Dial><Number>${process.env.DRIVER_PHONE}</Number></Dial></Response>`;
  } else if (dtmfDigits === '2') {
    xmlResponse = `<Response><Say>Connecting you to FreightFlow support.</Say><Dial><Number>${process.env.SUPPORT_PHONE}</Number></Dial></Response>`;
  } else {
    xmlResponse = `<Response><Say>Thank you for confirming. Our team is monitoring this shipment. Goodbye.</Say></Response>`;
  }

  res.set('Content-Type', 'application/xml');
  res.send(xmlResponse);
});
```

---

## 4. Airtime API

### Use Case

Reward transporters automatically with **KES 20 airtime** for each verified on-time delivery rated ≥ 4 stars. No bank account or cash handling required — works on any mobile number.

### Trigger Logic

```
Delivery confirmed by shipper
  AND shipper submits rating ≥ 4 stars
  AND actual delivery time ≤ (ETA + 30 min tolerance)
  → Disburse KES 20 airtime to transporter's phone number
  → Log reward in database
  → Send SMS: "FreightFlow: You earned KES 20 airtime for on-time delivery of Load #{id}!"
```

### Implementation

```javascript
// server/services/airtime.service.js
const AT = require('./at');
const airtime = AT.AIRTIME;
const { sendSMS } = require('./sms.service');

async function rewardTransporter({ phoneNumber, loadId, amount = 'KES 20' }) {
  let attempt = 0;
  const maxRetries = 3;

  while (attempt < maxRetries) {
    try {
      const response = await airtime.send({
        recipients: [{
          phoneNumber,
          amount,
          currencyCode: 'KES',
        }],
      });

      const result = response.responses[0];
      if (result.status === 'Success') {
        await AirtimeLog.create({ phoneNumber, loadId, amount, status: 'SUCCESS' });
        await sendSMS(phoneNumber,
          `FreightFlow: You earned ${amount} airtime for on-time delivery of Load #${loadId}! Keep it up.`
        );
        return { success: true };
      } else {
        throw new Error(result.errorMessage || 'Disbursement failed');
      }

    } catch (err) {
      attempt++;
      console.error(`[Airtime] Attempt ${attempt} failed for ${phoneNumber}:`, err.message);
      if (attempt === maxRetries) {
        await AirtimeLog.create({ phoneNumber, loadId, amount, status: 'FAILED', error: err.message });
        // Alert admin of failed reward
        await notifyAdmin(`Airtime reward failed for driver ${phoneNumber}, load #${loadId}`);
      } else {
        await new Promise(r => setTimeout(r, 15 * 60 * 1000)); // wait 15 min before retry
      }
    }
  }
}

module.exports = { rewardTransporter };
```

### Wiring to Delivery Confirmation

```javascript
// server/controllers/deliveries.controller.js (excerpt)
const airtimeService = require('../services/airtime.service');

async function confirmDelivery(req, res) {
  const { loadId, rating } = req.body;
  const shipper = req.user;

  const load = await Load.findById(loadId);
  await load.update({ status: 'DELIVERED', rating, deliveredAt: new Date() });

  // Check if on-time and well-rated → reward driver
  const isOnTime = new Date() <= new Date(load.eta.getTime() + 30 * 60 * 1000);
  if (rating >= 4 && isOnTime) {
    airtimeService.rewardTransporter({
      phoneNumber: load.transporter.phone,
      loadId,
      amount: 'KES 20',
    }).catch(err => console.error('Airtime reward failed (non-critical):', err.message));
  }

  res.json({ success: true });
}
```

---

## 5. Africa's Talking Marketplace

### Publish FreightFlow as an AT Marketplace Plugin

The AT Marketplace allows FreightFlow to be discovered and subscribed to by existing Africa's Talking business customers — giving instant reach to transport companies already using AT infrastructure.

**Submission checklist for AT Marketplace:**
- [ ] FreightFlow is live with a stable API
- [ ] Create an AT Marketplace developer account at marketplace.africastalking.com
- [ ] Submit app profile: name, description, category (Logistics), screenshots, pricing
- [ ] Define subscription tiers: Basic (SMS notifications only) / Pro (SMS + USSD + Voice)
- [ ] Configure callback URL for new subscriber webhooks
- [ ] Complete AT Marketplace review process

**Subscriber webhook handler:**
```javascript
router.post('/marketplace/subscribe', express.json(), async (req, res) => {
  const { subscriberId, plan, phoneNumber } = req.body;
  // Provision new tenant in FreightFlow
  await createTenant({ subscriberId, plan, phoneNumber });
  res.sendStatus(200);
});
```

---

## 6. Environment Setup

### Required Environment Variables

```bash
# .env — never commit to git

# Africa's Talking credentials
AT_API_KEY=your_at_api_key_here
AT_USERNAME=sandbox                  # Use 'sandbox' for dev; your real username for prod
AT_SENDER_ID=FreightFlow             # Alphanumeric sender (country-dependent)
AT_USSD_CODE=*384*7447#              # Sandbox shortcode
AT_VOICE_NUMBER=+254XXXXXXXXX        # Your AT virtual phone number

# Database
DATABASE_URL=postgresql://user:password@db:5432/freightflow

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# M-Pesa
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-domain.com/api/webhooks/mpesa

# App
NEXT_PUBLIC_API_URL=http://localhost:4000
APP_URL=https://your-domain.com
PORT=4000
NODE_ENV=development
```

### Sandbox Testing

1. Create an account at [account.africastalking.com](https://account.africastalking.com)
2. Set `AT_USERNAME=sandbox` in your `.env`
3. Use the [AT Simulator](https://simulator.africastalking.com) to:
   - Send test SMS to sandbox numbers
   - Simulate USSD sessions using your shortcode
   - Test voice calls
4. Test USSD at: simulator.africastalking.com → Enter shortcode `*384*7447#`
5. Test SMS: send to any number in the sandbox — check the sandbox API logs

### Production Checklist

- [ ] Switch `AT_USERNAME` from `sandbox` to your real AT username
- [ ] Register production USSD shortcode via AT dashboard (takes 24-48h)
- [ ] Set `AT_SENDER_ID` to `FreightFlow` (requires registration in some countries)
- [ ] Purchase AT credits for SMS, Voice, and Airtime disbursements
- [ ] Configure all webhook URLs to production domain (HTTPS required)
- [ ] Test all flows end-to-end in production before demo day

---

*For the full feature context, see [`docs/features_and_pages.md`](features_and_pages.md) and the UX integration details in [`design/features/notifications_alerts_ux.md`](../design/features/notifications_alerts_ux.md).*
