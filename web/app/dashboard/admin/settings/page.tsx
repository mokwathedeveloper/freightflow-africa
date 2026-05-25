'use client';

import { useState } from 'react';
import {
  Settings, Bell, Shield, Radio, Phone, MessageSquare,
  Star, Save, Eye, EyeOff, CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/store/toast.store';

const TABS = [
  { id: 'general',       label: 'General',       icon: Settings  },
  { id: 'notifications', label: 'Notifications',  icon: Bell      },
  { id: 'api',           label: 'API & Integrations', icon: Radio },
  { id: 'security',      label: 'Security',       icon: Shield    },
];

interface ToggleProps { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void; }
function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors focus:outline-none ml-4"
        style={{ backgroundColor: checked ? '#1E3A8A' : '#D1D5DB' }}
      >
        <span
          className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5 ml-0.5"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-5 py-3.5 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function SaveBar({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  return (
    <div className="flex justify-end pt-2">
      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-2 h-9 px-5 rounded-lg bg-[#1E3A8A] text-white text-sm font-medium hover:bg-[#1e3a8a]/90 transition-colors disabled:opacity-60"
      >
        {saving ? <><Save size={14} className="animate-pulse" /> Saving...</> : <><Save size={14} /> Save Changes</>}
      </button>
    </div>
  );
}

/* ─── General Tab ─── */
function GeneralTab() {
  const addToast = useToastStore((s) => s.addToast);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    platformName: 'FreightFlow',
    supportEmail: 'support@freightflow.co.ke',
    supportPhone: '+254700000000',
    timezone: 'Africa/Nairobi',
    currency: 'KES',
    maintenanceMode: false,
  });

  function save() {
    setSaving(true);
    setTimeout(() => { setSaving(false); addToast('success', 'General settings saved'); }, 800);
  }

  return (
    <div className="space-y-5">
      <SectionCard title="Platform Identity">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Platform Name',  key: 'platformName',  type: 'text' },
            { label: 'Support Email',  key: 'supportEmail',  type: 'email' },
            { label: 'Support Phone',  key: 'supportPhone',  type: 'tel' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="ff-label">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form] as string}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="ff-input"
              />
            </div>
          ))}
          <div>
            <label className="ff-label">Timezone</label>
            <select
              value={form.timezone}
              onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
              className="ff-input"
            >
              <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
              <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
              <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div>
            <label className="ff-label">Default Currency</label>
            <select
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              className="ff-input"
            >
              <option value="KES">KES — Kenyan Shilling</option>
              <option value="UGX">UGX — Ugandan Shilling</option>
              <option value="TZS">TZS — Tanzanian Shilling</option>
              <option value="USD">USD — US Dollar</option>
            </select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Maintenance">
        <div className="divide-y divide-gray-100">
          <Toggle
            label="Maintenance Mode"
            description="Disable all user-facing pages and show a maintenance notice."
            checked={form.maintenanceMode}
            onChange={(v) => setForm((f) => ({ ...f, maintenanceMode: v }))}
          />
        </div>
        {form.maintenanceMode && (
          <p className="mt-3 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            Warning: enabling this will lock out all shippers and transporters immediately.
          </p>
        )}
      </SectionCard>

      <SaveBar onSave={save} saving={saving} />
    </div>
  );
}

/* ─── Notifications Tab ─── */
function NotificationsTab() {
  const addToast = useToastStore((s) => s.addToast);
  const [saving, setSaving] = useState(false);
  const [notifs, setNotifs] = useState({
    smsLoadAccepted:   true,
    smsLoadDelivered:  true,
    smsLoadDisputed:   true,
    smsPaymentDone:    true,
    ussdStatusUpdate:  true,
    voiceCritical:     false,
    airtimeOnTime:     true,
    emailDigest:       false,
  });

  const set = (key: keyof typeof notifs) => (v: boolean) =>
    setNotifs((n) => ({ ...n, [key]: v }));

  function save() {
    setSaving(true);
    setTimeout(() => { setSaving(false); addToast('success', 'Notification settings saved'); }, 800);
  }

  return (
    <div className="space-y-5">
      <SectionCard title="SMS Notifications (Africa's Talking)">
        <div className="divide-y divide-gray-100">
          <Toggle label="Load Accepted"  description="Notify shipper when a transporter accepts their load." checked={notifs.smsLoadAccepted}  onChange={set('smsLoadAccepted')} />
          <Toggle label="Load Delivered" description="Notify shipper when cargo is marked delivered."        checked={notifs.smsLoadDelivered} onChange={set('smsLoadDelivered')} />
          <Toggle label="Dispute Raised" description="Notify admin when a dispute is opened on a load."     checked={notifs.smsLoadDisputed}  onChange={set('smsLoadDisputed')} />
          <Toggle label="Payment Confirmed" description="Notify transporter when payment is processed."     checked={notifs.smsPaymentDone}   onChange={set('smsPaymentDone')} />
        </div>
      </SectionCard>

      <SectionCard title="USSD & Voice (Africa's Talking)">
        <div className="divide-y divide-gray-100">
          <Toggle label="USSD Status Updates" description="Allow drivers to update delivery status via *384#." checked={notifs.ussdStatusUpdate} onChange={set('ussdStatusUpdate')} />
          <Toggle label="Voice Alerts for Critical Events" description="Auto-call shipper when a delivery is delayed >2 hours." checked={notifs.voiceCritical} onChange={set('voiceCritical')} />
        </div>
      </SectionCard>

      <SectionCard title="Airtime & Digest">
        <div className="divide-y divide-gray-100">
          <Toggle label="Airtime Rewards" description="Disburse KES 20 airtime to transporters for on-time deliveries." checked={notifs.airtimeOnTime} onChange={set('airtimeOnTime')} />
          <Toggle label="Daily Admin Email Digest" description="Send a daily summary of platform activity to the admin email." checked={notifs.emailDigest} onChange={set('emailDigest')} />
        </div>
      </SectionCard>

      <SaveBar onSave={save} saving={saving} />
    </div>
  );
}

/* ─── API & Integrations Tab ─── */
function ApiTab() {
  const addToast = useToastStore((s) => s.addToast);
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({
    atApiKey:       process.env.NEXT_PUBLIC_AT_API_KEY ?? '••••••••••••••••',
    atUsername:     'sandbox',
    atShortcode:    'FreightFlow',
    atUssdCode:     '*384*FreightFlow#',
    atEnv:          'sandbox',
    webhookSecret:  '••••••••••••••••',
  });

  const toggle = (k: string) => setShow((s) => ({ ...s, [k]: !s[k] }));

  function save() {
    setSaving(true);
    setTimeout(() => { setSaving(false); addToast('success', 'API settings saved'); }, 800);
  }

  const AT_SERVICES = [
    { icon: MessageSquare, label: 'SMS API',     status: 'connected', color: 'text-[#1E3A8A]', bg: 'bg-blue-50'   },
    { icon: Radio,         label: 'USSD API',    status: 'connected', color: 'text-green-600', bg: 'bg-green-50'  },
    { icon: Phone,         label: 'Voice API',   status: 'sandbox',   color: 'text-purple-600',bg: 'bg-purple-50' },
    { icon: Star,          label: 'Airtime API', status: 'sandbox',   color: 'text-amber-600', bg: 'bg-amber-50'  },
  ];

  return (
    <div className="space-y-5">
      {/* AT service status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {AT_SERVICES.map(({ icon: Icon, label, status, color, bg }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-3 flex flex-col gap-2">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon size={15} className={color} />
            </div>
            <p className="text-xs font-semibold text-gray-800">{label}</p>
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full w-fit',
              status === 'connected' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-600'
            )}>
              {status}
            </span>
          </div>
        ))}
      </div>

      <SectionCard title="Africa's Talking Credentials">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "API Key",      key: "atApiKey",     secret: true },
            { label: "Username",     key: "atUsername",   secret: false },
            { label: "SMS Shortcode",key: "atShortcode",  secret: false },
            { label: "USSD Code",    key: "atUssdCode",   secret: false },
          ].map(({ label, key, secret }) => (
            <div key={key}>
              <label className="ff-label">{label}</label>
              <div className="relative">
                <input
                  type={secret && !show[key] ? 'password' : 'text'}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className={cn('ff-input', secret && 'pr-9')}
                />
                {secret && (
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {show[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                )}
              </div>
            </div>
          ))}

          <div>
            <label className="ff-label">Environment</label>
            <select
              value={form.atEnv}
              onChange={(e) => setForm((f) => ({ ...f, atEnv: e.target.value }))}
              className="ff-input"
            >
              <option value="sandbox">Sandbox (testing)</option>
              <option value="production">Production (live)</option>
            </select>
          </div>

          <div>
            <label className="ff-label">Webhook Secret</label>
            <div className="relative">
              <input
                type={show['webhookSecret'] ? 'text' : 'password'}
                value={form.webhookSecret}
                onChange={(e) => setForm((f) => ({ ...f, webhookSecret: e.target.value }))}
                className="ff-input pr-9"
              />
              <button
                type="button"
                onClick={() => toggle('webhookSecret')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {show['webhookSecret'] ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        </div>

        {form.atEnv === 'production' && (
          <p className="mt-4 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            Production mode: all SMS, USSD, Voice, and Airtime calls will be charged to your Africa&apos;s Talking account.
          </p>
        )}
      </SectionCard>

      <SectionCard title="Webhook Endpoints">
        <div className="space-y-2">
          {[
            { label: 'SMS Delivery Report', url: '/api/webhooks/sms' },
            { label: 'USSD Session',        url: '/api/webhooks/ussd' },
            { label: 'Voice Callback',      url: '/api/webhooks/voice' },
          ].map(({ label, url }) => (
            <div key={url} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{url}</p>
              </div>
              <CheckCircle size={15} className="text-green-500 shrink-0" />
            </div>
          ))}
        </div>
      </SectionCard>

      <SaveBar onSave={save} saving={saving} />
    </div>
  );
}

/* ─── Security Tab ─── */
function SecurityTab() {
  const addToast = useToastStore((s) => s.addToast);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    sessionTimeout: '60',
    maxLoginAttempts: '5',
    requireOtp: true,
    twoFactorAdmin: true,
    ipWhitelist: '',
    auditLog: true,
  });

  function save() {
    setSaving(true);
    setTimeout(() => { setSaving(false); addToast('success', 'Security settings saved'); }, 800);
  }

  return (
    <div className="space-y-5">
      <SectionCard title="Session & Access">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="ff-label">Session Timeout (minutes)</label>
            <input
              type="number"
              min="5"
              max="1440"
              value={form.sessionTimeout}
              onChange={(e) => setForm((f) => ({ ...f, sessionTimeout: e.target.value }))}
              className="ff-input"
            />
          </div>
          <div>
            <label className="ff-label">Max Failed Login Attempts</label>
            <input
              type="number"
              min="3"
              max="20"
              value={form.maxLoginAttempts}
              onChange={(e) => setForm((f) => ({ ...f, maxLoginAttempts: e.target.value }))}
              className="ff-input"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="ff-label">Admin IP Whitelist (comma-separated, leave blank to allow all)</label>
            <input
              type="text"
              placeholder="e.g. 197.248.0.0/16, 105.163.0.0/16"
              value={form.ipWhitelist}
              onChange={(e) => setForm((f) => ({ ...f, ipWhitelist: e.target.value }))}
              className="ff-input font-mono text-xs"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Authentication">
        <div className="divide-y divide-gray-100">
          <Toggle
            label="Require Phone OTP at Registration"
            description="Users must verify their phone number via SMS OTP before logging in."
            checked={form.requireOtp}
            onChange={(v) => setForm((f) => ({ ...f, requireOtp: v }))}
          />
          <Toggle
            label="Two-Factor for Admin Accounts"
            description="Admins must complete a second factor on every login."
            checked={form.twoFactorAdmin}
            onChange={(v) => setForm((f) => ({ ...f, twoFactorAdmin: v }))}
          />
          <Toggle
            label="Full Audit Logging"
            description="Log all admin actions (user edits, dispute resolutions, setting changes)."
            checked={form.auditLog}
            onChange={(v) => setForm((f) => ({ ...f, auditLog: v }))}
          />
        </div>
      </SectionCard>

      <SectionCard title="JWT Tokens">
        <div className="space-y-3">
          {[
            { label: 'Access Token Expiry',  value: '15 minutes'  },
            { label: 'Refresh Token Expiry', value: '7 days'      },
            { label: 'Algorithm',            value: 'HS256'       },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
              <p className="text-sm text-gray-600">{label}</p>
              <p className="text-sm font-medium text-gray-900 font-mono">{value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Token secrets are configured via environment variables and cannot be edited here.</p>
      </SectionCard>

      <SaveBar onSave={save} saving={saving} />
    </div>
  );
}

/* ─── Page ─── */
export default function AdminSettingsPage() {
  const [tab, setTab] = useState('general');

  const content = {
    general:       <GeneralTab />,
    notifications: <NotificationsTab />,
    api:           <ApiTab />,
    security:      <SecurityTab />,
  }[tab];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Platform Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Configure platform behaviour, integrations, and security policies.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 w-fit flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              tab === id
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {content}
    </div>
  );
}
