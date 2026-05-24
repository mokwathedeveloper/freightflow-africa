# FreightFlow SaaS — Authentication Pages
### Phone-First Design with Africa's Talking SMS OTP

FreightFlow uses **phone number as the primary identifier** for all users. This decision reflects the reality that many East African transporters and drivers do not have or regularly use email, but every user has a mobile phone number. Email is collected as optional secondary contact.

---

## Auth Flow Overview

```
NEW USER
    │
    ▼
[Role Selection Screen]
    ├── "I'm a Shipper" ──────────────────┐
    └── "I'm a Transporter / Driver" ──┐  │
                                        ▼  ▼
                              [Sign Up Form]
                                    │
                              [AT SMS OTP sent]
                                    │
                              [OTP Entry Screen]
                                    │
                              [OTP verified ✓]
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
          [Shipper Dashboard]           [Transporter Dashboard]

RETURNING USER
    │
    ▼
[Login Screen — Phone + Password]
    │
    ├── Success → redirect to role dashboard
    └── Forgot PIN → [Phone entry] → [AT SMS OTP] → [Set new PIN]
```

---

## Page 1 — Role Selection Screen

**Purpose:** First screen a new user sees. Sets role before the signup form — prevents confusion about which fields are required.

**Layout:**
```
┌─────────────────────────────────────┐
│          FreightFlow                │
│    Move cargo. Track everything.    │
│                                     │
│  ┌─────────────┐  ┌─────────────┐  │
│  │     📦      │  │     🚛      │  │
│  │  I'm a      │  │  I'm a      │  │
│  │  Shipper    │  │ Transporter │  │
│  │             │  │  / Driver   │  │
│  └─────────────┘  └─────────────┘  │
│                                     │
│  Already have an account? Log in    │
└─────────────────────────────────────┘
```

**Behaviour:**
- Tapping a card highlights it and navigates to the matching Sign Up form
- "Log in" link goes directly to the Login page (no role selection needed at login)
- No back button trap — user can always switch role from sign-up form

---

## Page 2 — Sign Up Form

Two variants: **Shipper** and **Transporter**. Same layout, different required fields.

### Shipper Sign Up Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Full Name | Text | Yes | Min 2 chars |
| Phone Number | Tel | **Yes — Primary ID** | E.164 format, e.g. `+254712345678` |
| Company Name | Text | No | — |
| Email Address | Email | No | Valid email format |
| Password | Password | Yes | Min 8 chars, 1 number, 1 uppercase |
| Confirm Password | Password | Yes | Must match Password |

### Transporter Sign Up Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Full Name | Text | Yes | Min 2 chars |
| Phone Number | Tel | **Yes — Primary ID** | E.164 format |
| Email Address | Email | No | Valid email format |
| Vehicle Type | Select | Yes | Pickup / 3-ton truck / 7-ton truck / 14-ton truck / Semi-trailer |
| Number Plate | Text | Yes | Kenyan format validation |
| Password | Password | Yes | Min 8 chars, 1 number, 1 uppercase |
| Confirm Password | Password | Yes | Must match |

**CTA:** "Send Verification Code" (not "Create Account" — because account is not yet confirmed until OTP is verified)

**On submit:**
1. Validate all fields client-side
2. POST to `/api/auth/register` with form data + role
3. Backend calls **AT SMS API** — sends 6-digit OTP to the phone number
4. Navigate to OTP Entry Screen, passing phone number as state
5. Show: *"We sent a code to +254 *** *** 678. Didn't get it? Resend in 60s"*

**Inline validation rules:**
- Phone field: format as user types (`+254` prefix auto-added for KE numbers)
- Password strength indicator (weak / medium / strong)
- Number plate: uppercase, no spaces
- All error messages appear below the field in red (`#DC2626`), not in a toast

---

## Page 3 — OTP Verification Screen

**Purpose:** Confirms the user owns the phone number they registered with.

**Layout:**
```
┌──────────────────────────────────────┐
│  ← Back                              │
│                                      │
│  Verify your number                  │
│                                      │
│  Enter the 6-digit code sent to      │
│  +254 *** *** 678                    │
│                                      │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐│
│  │   │ │   │ │   │ │   │ │   │ │   ││
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘│
│                                      │
│  Resend code (60s)                   │
│                                      │
│  [Verify]                            │
└──────────────────────────────────────┘
```

**Behaviour:**
- 6 individual input boxes — focus auto-advances on each digit entry
- Paste support: pasting a 6-digit string fills all boxes at once
- Countdown timer for resend (60 seconds)
- After 3 wrong attempts → show "Too many attempts. Request a new code."
- On correct OTP → POST to `/api/auth/verify-otp` → receive JWT → store in httpOnly cookie → redirect to dashboard

**AT SMS OTP code (backend):**
```javascript
// server/services/auth.service.js
const { sendSMS } = require('./sms.service');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

async function sendPhoneOTP(phone) {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await OTPRecord.upsert({ phone, otp, expiresAt }); // store hashed in DB
  await sendSMS(phone, `FreightFlow: Your verification code is ${otp}. Valid for 10 minutes. Do not share.`);
  return { sent: true };
}

async function verifyOTP(phone, inputOtp) {
  const record = await OTPRecord.findOne({ phone, used: false });
  if (!record) throw new Error('No OTP found for this number');
  if (new Date() > record.expiresAt) throw new Error('OTP expired');
  if (record.otp !== inputOtp) throw new Error('Incorrect code');
  await record.update({ used: true });
  return true;
}
```

**Error microcopy:**
| State | Message |
|-------|---------|
| Wrong code | "That code doesn't match. X attempts remaining." |
| Expired code | "This code has expired. Request a new one." |
| Too many attempts | "Too many attempts. Please request a new code." |
| SMS not received | "Didn't receive it? Check your number or resend." |

---

## Page 4 — Login Screen

**Primary identifier: Phone Number** (not email — this is the key change from email-first auth).

**Layout:**
```
┌──────────────────────────────────────┐
│          FreightFlow                 │
│                                      │
│  Welcome back                        │
│                                      │
│  Phone Number                        │
│  ┌──────────────────────────────┐   │
│  │ +254 │ 7XX XXX XXX           │   │
│  └──────────────────────────────┘   │
│                                      │
│  Password                            │
│  ┌──────────────────────────────┐   │
│  │ ••••••••••                   │ 👁│
│  └──────────────────────────────┘   │
│                                      │
│  [Log In]                            │
│                                      │
│  Forgot password?   New here? Sign up│
└──────────────────────────────────────┘
```

**Behaviour:**
- Phone number field auto-formats to E.164
- Password field has show/hide toggle
- On success: POST `/api/auth/login` → receive JWT → store in httpOnly cookie
- JWT payload includes `{ userId, role, tenantId }` → redirect:
  - `role === 'SHIPPER'` → `/dashboard/shipper`
  - `role === 'TRANSPORTER'` → `/dashboard/transporter`
  - `role === 'ADMIN'` → `/dashboard/admin`
- Failed login: show *"Incorrect phone number or password"* (do not specify which is wrong — security)
- After 5 failed attempts: 15-minute lockout with countdown

**No social login for MVP** — USSD users cannot use Google OAuth; keep auth simple and consistent.

---

## Page 5 — Forgot Password / PIN Reset

**Flow:** Phone number → AT SMS OTP → New password form

**Step 1 — Enter registered phone:**
```
Forgot password?

Enter your registered phone number.
We'll send a reset code.

┌──────────────────────────────────┐
│ +254 │ 7XX XXX XXX               │
└──────────────────────────────────┘

[Send Reset Code]
```

**Step 2 — OTP entry:** Same OTP screen as registration (Page 3)

**Step 3 — Set new password:**
```
Set new password

┌──────────────────────────────────┐
│ New Password                      │
└──────────────────────────────────┘
┌──────────────────────────────────┐
│ Confirm New Password              │
└──────────────────────────────────┘

[Update Password]
```

On success → auto-login → redirect to dashboard.

**Security rules:**
- Reset token (OTP) is single-use and expires in 10 minutes
- New password cannot be the same as the last 3 passwords
- All existing sessions invalidated on password reset

---

## Auth UX Rules (applies to all auth pages)

1. **Phone is the primary identifier everywhere** — no "email or phone" ambiguity
2. **Country code auto-set to +254 (Kenya)** with dropdown to change for other countries
3. **OTP is always via AT SMS** — no email OTP, no authenticator app (too complex for feature phone users)
4. **Never reveal which field failed at login** — only "Incorrect phone or password"
5. **JWT stored in httpOnly cookie** — never localStorage (XSS protection)
6. **All auth API endpoints are rate-limited** (5 req/min per IP)
7. **Redirect after login is role-aware** — shipper and transporter never share a dashboard URL
8. **Back button on OTP screen returns to sign-up** (does not re-submit form)

---

*Related: [`docs/africas_talking_integration.md`](../../docs/africas_talking_integration.md) — SMS OTP implementation · [`design/features/security_compliance_ux.md`](../features/security_compliance_ux.md)*
