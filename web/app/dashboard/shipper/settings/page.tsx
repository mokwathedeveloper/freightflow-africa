'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  User, Lock, Bell, Sliders, Building2, Phone, Mail,
  Loader2, CheckCircle,
} from 'lucide-react';
import { SecurityTab } from '@/components/settings/SecurityTab';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useToastStore } from '@/store/toast.store';

type Tab = 'profile' | 'security' | 'notifications' | 'preferences';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'security',      label: 'Security',       icon: Lock },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'preferences',   label: 'Preferences',    icon: Sliders },
];

/* ── Profile Tab ───────────────────────────────────────────────── */
function ProfileTab() {
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);
  const [name,    setName]    = useState(user?.name    ?? '');
  const [email,   setEmail]   = useState(user?.email   ?? '');
  const [company, setCompany] = useState(user?.company ?? '');

  const mut = useMutation({
    mutationFn: () => api.patch('/users/me', { name, email, company }),
    onSuccess: () => addToast('success', 'Profile updated successfully'),
    onError:   () => addToast('error',   'Failed to update profile'),
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-4">
        <div>
          <label className="ff-label">Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="ff-input"
          />
        </div>
        <div>
          <label className="ff-label">Phone Number</label>
          <input
            value={user?.phone ?? ''}
            readOnly
            className="ff-input bg-gray-50 text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Phone number cannot be changed. Contact support if needed.</p>
        </div>
        <div>
          <label className="ff-label">Email Address <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            className="ff-input"
          />
        </div>
        <div>
          <label className="ff-label">Company Name <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Your company name"
            className="ff-input"
          />
        </div>
        <div className="pt-1">
          <button
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            className="btn-primary h-10 px-6 flex items-center gap-2"
          >
            {mut.isPending ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Company card */}
      <div className="lg:col-span-2">
        <div className="bg-[#1E3A8A]/5 border border-[#1E3A8A]/10 rounded-xl p-5">
          <div className="w-12 h-12 rounded-xl bg-[#1E3A8A]/10 flex items-center justify-center mb-4">
            <Building2 size={22} className="text-[#1E3A8A]" />
          </div>
          <h4 className="font-semibold text-gray-900">{company || 'Your Company'}</h4>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone size={13} className="text-gray-400" /> {user?.phone}
            </div>
            {email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={13} className="text-gray-400" /> {email}
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-[#1E3A8A]/10">
            <p className="text-xs text-gray-500">Account type</p>
            <span className="text-xs font-semibold text-[#1E3A8A] bg-[#1E3A8A]/10 rounded-full px-2 py-0.5 mt-1 inline-block">
              Shipper
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Notifications Tab ─────────────────────────────────────────── */
type NotifPrefs = {
  smsOnAccepted: boolean;
  smsOnPickedUp: boolean;
  smsOnDelivered: boolean;
  smsOnDispute: boolean;
  emailDigest: boolean;
};

function NotificationsTab() {
  const addToast = useToastStore((s) => s.addToast);
  const [prefs, setPrefs] = useState<NotifPrefs>({
    smsOnAccepted:  true,
    smsOnPickedUp:  true,
    smsOnDelivered: true,
    smsOnDispute:   true,
    emailDigest:    false,
  });

  const mut = useMutation({
    mutationFn: () => api.patch('/users/notification-prefs', prefs),
    onSuccess: () => addToast('success', 'Notification preferences saved'),
    onError:   () => addToast('error',   'Failed to save preferences'),
  });

  function toggle(key: keyof NotifPrefs) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  const items: { key: keyof NotifPrefs; label: string; desc: string }[] = [
    { key: 'smsOnAccepted',  label: 'Load Accepted',     desc: 'SMS when a transporter accepts your load' },
    { key: 'smsOnPickedUp',  label: 'Cargo Picked Up',   desc: 'SMS when the transporter picks up cargo' },
    { key: 'smsOnDelivered', label: 'Delivery Update',   desc: 'SMS when driver reports delivery' },
    { key: 'smsOnDispute',   label: 'Dispute Alerts',    desc: 'SMS when a dispute is raised or resolved' },
    { key: 'emailDigest',    label: 'Weekly Email Digest', desc: 'Summary of all load activity (requires email)' },
  ];

  return (
    <div className="max-w-xl space-y-5">
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
        SMS notifications are delivered via Africa&apos;s Talking and work even on feature phones.
      </div>
      <div className="space-y-1 divide-y divide-gray-100">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-3.5">
            <div>
              <p className="text-sm font-medium text-gray-900">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={cn(
                'relative w-10 h-5.5 rounded-full transition-colors shrink-0',
                prefs[key] ? 'bg-[#1E3A8A]' : 'bg-gray-200'
              )}
              style={{ height: '22px' }}
              role="switch"
              aria-checked={prefs[key]}
            >
              <span className={cn(
                'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                prefs[key] && 'translate-x-4.5'
              )} style={{ transform: prefs[key] ? 'translateX(18px)' : undefined }} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => mut.mutate()}
        disabled={mut.isPending}
        className="btn-primary h-10 px-6 flex items-center gap-2"
      >
        {mut.isPending ? <Loader2 size={15} className="animate-spin" /> : 'Save Preferences'}
      </button>
    </div>
  );
}

/* ── Preferences Tab ───────────────────────────────────────────── */
function PreferencesTab() {
  const addToast = useToastStore((s) => s.addToast);
  const [defaultOrigin, setDefaultOrigin] = useState('');
  const [currency,      setCurrency]      = useState('KES');
  const [weightUnit,    setWeightUnit]    = useState('tonnes');

  const mut = useMutation({
    mutationFn: () => api.patch('/users/preferences', { defaultOrigin, currency, weightUnit }),
    onSuccess: () => addToast('success', 'Preferences saved'),
    onError:   () => addToast('error',   'Failed to save preferences'),
  });

  return (
    <div className="max-w-sm space-y-4">
      <div>
        <label className="ff-label">Default Origin City</label>
        <input
          value={defaultOrigin}
          onChange={(e) => setDefaultOrigin(e.target.value)}
          placeholder="e.g. Nairobi"
          className="ff-input"
        />
        <p className="text-xs text-gray-400 mt-1">Pre-fills the origin field when posting a new load.</p>
      </div>
      <div>
        <label className="ff-label">Currency</label>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="ff-input">
          <option value="KES">KES — Kenyan Shilling</option>
          <option value="USD">USD — US Dollar</option>
        </select>
      </div>
      <div>
        <label className="ff-label">Weight Unit</label>
        <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)} className="ff-input">
          <option value="tonnes">Tonnes (t)</option>
          <option value="kg">Kilograms (kg)</option>
        </select>
      </div>
      <div className="pt-1">
        <button
          onClick={() => mut.mutate()}
          disabled={mut.isPending}
          className="btn-primary h-10 px-6 flex items-center gap-2"
        >
          {mut.isPending ? <Loader2 size={15} className="animate-spin" /> : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile');

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account, security, and preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors whitespace-nowrap',
                tab === id
                  ? 'text-[#1E3A8A] border-b-2 border-[#1E3A8A] bg-blue-50/40'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              )}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {tab === 'profile'       && <ProfileTab />}
          {tab === 'security'      && <SecurityTab />}
          {tab === 'notifications' && <NotificationsTab />}
          {tab === 'preferences'   && <PreferencesTab />}
        </div>
      </div>
    </div>
  );
}
