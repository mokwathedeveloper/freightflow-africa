'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  AlertTriangle, Info, Bell, Send, Loader2, X,
  Mail, MessageSquare, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useToastStore } from '@/store/toast.store';

type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
type ReadState = 'read' | 'unread';

interface SystemAlert {
  id: number;
  severity: Severity;
  title: string;
  sub: string;
  time: string;
  read: boolean;
  description: string;
  impact: string;
  timeline: string;
}

const ALERTS: SystemAlert[] = [
  {
    id: 1,
    severity: 'Critical',
    title: 'Server CPU usage is above 90%',
    sub: 'System Performance',
    time: 'May 16, 2024 10:03 AM',
    read: false,
    description: 'The average CPU usage across application servers has exceeded 90% for the last 15 minutes. Immediate attention is recommended.',
    impact: 'High — May affect application response times and user experience.',
    timeline: 'May 16, 2024 10:03 AM – Ongoing',
  },
  {
    id: 2,
    severity: 'High',
    title: 'High API error rate detected',
    sub: 'System Performance',
    time: 'May 16, 2024 09:48 AM',
    read: false,
    description: 'API error rate has spiked to 12% over the past 30 minutes, primarily affecting load submission endpoints.',
    impact: 'Medium — Some users may experience failed requests.',
    timeline: 'May 16, 2024 09:48 AM – Ongoing',
  },
  {
    id: 3,
    severity: 'Medium',
    title: 'New login from unknown device',
    sub: 'Security',
    time: 'May 16, 2024 09:32 AM',
    read: false,
    description: 'An admin account was accessed from a new device and IP address (197.210.45.2). Verify if this is an authorized login.',
    impact: 'Low — May indicate unauthorized access attempt.',
    timeline: 'May 16, 2024 09:32 AM',
  },
  {
    id: 4,
    severity: 'Critical',
    title: 'Database connection pool is high',
    sub: 'Operations',
    time: 'May 16, 2024 09:00 AM',
    read: true,
    description: 'Database connection pool utilization reached 95%. New connections may fail if not addressed.',
    impact: 'Critical — Active connections are at risk of being dropped.',
    timeline: 'May 16, 2024 09:00 AM – Ongoing',
  },
  {
    id: 5,
    severity: 'Low',
    title: 'Shipment tracking delay detected',
    sub: 'Operations',
    time: 'May 16, 2024 08:50 AM',
    read: true,
    description: 'Tracking updates are delayed by approximately 8 minutes for loads in the East Africa region.',
    impact: 'Low — Informational only. Loads are still being tracked.',
    timeline: 'May 16, 2024 08:50 AM',
  },
  {
    id: 6,
    severity: 'Info',
    title: 'System maintenance scheduled',
    sub: 'Maintenance',
    time: 'May 16, 2024 07:00 PM',
    read: true,
    description: 'Scheduled maintenance window is planned for tonight from 11 PM to 1 AM. Expect brief downtime.',
    impact: 'Planned — Users will be notified via SMS 30 minutes before.',
    timeline: 'May 16, 2024 11:00 PM – May 17, 2024 01:00 AM',
  },
];

const SEVERITY_STYLES: Record<Severity, { bg: string; text: string; icon: string; border: string }> = {
  Critical: { bg: 'bg-red-50',    text: 'text-red-600',    icon: 'text-red-500',    border: 'border-red-200' },
  High:     { bg: 'bg-orange-50', text: 'text-orange-700', icon: 'text-orange-500', border: 'border-orange-200' },
  Medium:   { bg: 'bg-amber-50',  text: 'text-amber-700',  icon: 'text-amber-500',  border: 'border-amber-200' },
  Low:      { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: 'text-blue-500',   border: 'border-blue-200' },
  Info:     { bg: 'bg-gray-50',   text: 'text-gray-600',   icon: 'text-gray-400',   border: 'border-gray-200' },
};

function alertIcon(severity: Severity) {
  if (severity === 'Info') return Info;
  return AlertTriangle;
}

type Tab = 'Alerts Centre' | 'Send Alert' | 'Notification Settings';

export default function AdminAlertsPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [tab, setTab]                 = useState<Tab>('Alerts Centre');
  const [readFilter, setReadFilter]   = useState<'All' | 'Unread' | 'Read'>('All');
  const [severity, setSeverity]       = useState('All Severity');
  const [search, setSearch]           = useState('');
  const [selected, setSelected]       = useState<SystemAlert | null>(ALERTS[0]);
  const [alerts, setAlerts]           = useState(ALERTS);

  // Send Alert state
  const [broadcastMsg, setBroadcastMsg]     = useState('');
  const [targetRole, setTargetRole]         = useState<'ALL' | 'SHIPPER' | 'TRANSPORTER'>('ALL');

  // Notification settings state (detail panel toggles)
  const [emailEnabled, setEmailEnabled]   = useState(true);
  const [smsEnabled, setSmsEnabled]       = useState(true);

  // Notification Settings tab — global preferences
  type SettingKey = 'emailCritical' | 'smsCritical' | 'emailDigest' | 'slack' | 'inApp';
  const [notifSettings, setNotifSettings] = useState<Record<SettingKey, boolean>>({
    emailCritical: true, smsCritical: true, emailDigest: true, slack: false, inApp: true,
  });
  function toggleSetting(key: SettingKey) {
    setNotifSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const broadcastMut = useMutation({
    mutationFn: () => api.post('/admin/broadcast', { message: broadcastMsg, role: targetRole }),
    onSuccess: () => {
      addToast('success', 'Alert sent successfully via SMS');
      setBroadcastMsg('');
    },
    onError: () => addToast('error', 'Failed to send alert'),
  });

  const escalateMut = useMutation({
    mutationFn: (alert: SystemAlert) =>
      api.post('/admin/broadcast', { message: `[${alert.severity.toUpperCase()}] ${alert.title}`, role: 'ALL' }),
    onSuccess: () => addToast('success', 'Alert escalated to all users via SMS'),
    onError: () => addToast('error', 'Failed to escalate alert'),
  });

  const filtered = alerts.filter((a) => {
    const matchRead     = readFilter === 'All' || (readFilter === 'Unread' ? !a.read : a.read);
    const matchSeverity = severity === 'All Severity' || a.severity === severity;
    const matchSearch   = !search || a.title.toLowerCase().includes(search.toLowerCase());
    return matchRead && matchSeverity && matchSearch;
  });

  function markRead(id: number) {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a));
  }

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">System Alerts / Notifications</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage system alerts and keep your team informed in real-time.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200">
        {(['Alerts Centre', 'Send Alert', 'Notification Settings'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t
                ? 'border-[#1E3A8A] text-[#1E3A8A]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {t}
            {t === 'Alerts Centre' && unreadCount > 0 && (
              <span className="ml-2 text-xs font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Alerts Centre */}
      {tab === 'Alerts Centre' && (
        <div className="flex gap-5 h-full">
          {/* Left: alert list */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Filter bar */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 flex flex-wrap gap-2 items-center">
              {(['All', 'Unread', 'Read'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setReadFilter(f)}
                  className={cn(
                    'h-8 px-3 rounded-lg text-xs font-medium transition-colors',
                    readFilter === f ? 'bg-[#1E3A8A] text-white' : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {f}
                </button>
              ))}
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="ff-input h-8 text-xs w-auto pr-7"
              >
                {['All Severity', 'Critical', 'High', 'Medium', 'Low', 'Info'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <div className="relative flex-1 max-w-xs">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search alerts..."
                  className="ff-input h-8 text-xs pl-3"
                />
              </div>
            </div>

            {/* Alert rows */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">No alerts match your filters</div>
              ) : (
                filtered.map((a) => {
                  const style = SEVERITY_STYLES[a.severity];
                  const Icon  = alertIcon(a.severity);
                  return (
                    <div
                      key={a.id}
                      className={cn(
                        'flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors',
                        selected?.id === a.id && 'bg-blue-50/40'
                      )}
                      onClick={() => { setSelected(a); markRead(a.id); }}
                    >
                      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', style.bg)}>
                        <Icon size={15} className={style.icon} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={cn('text-xs font-semibold', style.text)}>{a.severity}</p>
                          {!a.read && <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A] shrink-0" />}
                        </div>
                        <p className="text-sm font-medium text-gray-900 leading-snug">{a.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{a.sub}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400">{a.time}</p>
                        <span className={cn('text-xs font-medium mt-1 inline-block', a.read ? 'text-gray-400' : 'text-[#1E3A8A]')}>
                          {a.read ? 'Read' : 'Unread'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination hint */}
            <p className="text-xs text-gray-400">
              Showing 1 to {filtered.length} of {alerts.length} alerts
            </p>
          </div>

          {/* Right: detail panel */}
          {selected && (
            <div className="w-72 shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Alert Details</p>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', SEVERITY_STYLES[selected.severity].bg, SEVERITY_STYLES[selected.severity].text)}>
                    {selected.severity}
                  </span>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{selected.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{selected.sub}</p>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed">{selected.description}</p>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">Impact</p>
                    <p className="text-xs text-gray-700">{selected.impact}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">Timeline</p>
                    <p className="text-xs text-gray-700">{selected.timeline}</p>
                  </div>
                </div>

                {/* Notification channels */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">Notification Channels</p>
                  <div className="space-y-2.5 rounded-lg border border-gray-100 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-gray-400" />
                        <span className="text-xs text-gray-700">Email</span>
                      </div>
                      <button
                        onClick={() => setEmailEnabled((v) => !v)}
                        className="relative inline-flex h-5 w-9 rounded-full transition-colors"
                        style={{ backgroundColor: emailEnabled ? '#1E3A8A' : '#D1D5DB' }}
                      >
                        <span
                          className="inline-block h-4 w-4 transform rounded-full bg-white shadow mt-0.5 ml-0.5 transition-transform"
                          style={{ transform: emailEnabled ? 'translateX(16px)' : 'translateX(0)' }}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={13} className="text-gray-400" />
                        <span className="text-xs text-gray-700">SMS</span>
                      </div>
                      <button
                        onClick={() => setSmsEnabled((v) => !v)}
                        className="relative inline-flex h-5 w-9 rounded-full transition-colors"
                        style={{ backgroundColor: smsEnabled ? '#1E3A8A' : '#D1D5DB' }}
                      >
                        <span
                          className="inline-block h-4 w-4 transform rounded-full bg-white shadow mt-0.5 ml-0.5 transition-transform"
                          style={{ transform: smsEnabled ? 'translateX(16px)' : 'translateX(0)' }}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-gray-100">
                <button
                  onClick={() => selected && escalateMut.mutate(selected)}
                  disabled={escalateMut.isPending}
                  className="w-full h-9 rounded-lg bg-[#16A34A] text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-60 transition-colors"
                >
                  {escalateMut.isPending
                    ? <><Loader2 size={13} className="animate-spin" /> Sending...</>
                    : <><Send size={13} /> Send Alert</>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Send Alert */}
      {tab === 'Send Alert' && (
        <div className="max-w-2xl bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Bell size={15} className="text-[#1E3A8A]" />
            <h3 className="text-sm font-semibold text-gray-900">Send SMS Alert</h3>
          </div>
          <p className="text-sm text-gray-500">Send an SMS message to all users of a selected role via Africa&apos;s Talking.</p>

          <div>
            <label className="ff-label">Target Audience</label>
            <div className="flex gap-2 flex-wrap">
              {(['ALL', 'SHIPPER', 'TRANSPORTER'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTargetRole(r)}
                  className={cn(
                    'px-4 h-9 rounded-lg text-sm font-medium transition-colors',
                    targetRole === r ? 'bg-[#1E3A8A] text-white' : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {r === 'ALL' ? 'All Users' : r === 'SHIPPER' ? 'Shippers' : 'Transporters'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="ff-label">Message</label>
            <textarea
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              placeholder="Type your alert message... (max 160 characters for single SMS)"
              rows={4}
              maxLength={480}
              className="ff-input h-auto resize-none py-2.5"
            />
            <p className="text-xs text-gray-400 mt-1">{broadcastMsg.length}/480 characters</p>
          </div>

          <button
            onClick={() => broadcastMut.mutate()}
            disabled={!broadcastMsg.trim() || broadcastMut.isPending}
            className="btn-primary h-10 px-6 flex items-center gap-2"
          >
            {broadcastMut.isPending
              ? <><Loader2 size={14} className="animate-spin" /> Sending...</>
              : <><Send size={14} /> Send Alert</>}
          </button>
        </div>
      )}

      {/* Tab: Notification Settings */}
      {tab === 'Notification Settings' && (
        <div className="max-w-2xl space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Global Notification Preferences</h3>
            {([
              { label: 'Email notifications for critical alerts',     key: 'emailCritical' as SettingKey },
              { label: 'SMS notifications for critical alerts',       key: 'smsCritical'   as SettingKey },
              { label: 'Email digest for daily system summary',       key: 'emailDigest'   as SettingKey },
              { label: 'Slack notifications for high severity alerts', key: 'slack'        as SettingKey },
              { label: 'In-app notifications for all alerts',         key: 'inApp'         as SettingKey },
            ]).map(({ label, key }) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">{label}</span>
                <button
                  onClick={() => toggleSetting(key)}
                  className="relative inline-flex h-5 w-9 rounded-full transition-colors"
                  style={{ backgroundColor: notifSettings[key] ? '#1E3A8A' : '#D1D5DB' }}
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white shadow mt-0.5 ml-0.5 transition-transform"
                    style={{ transform: notifSettings[key] ? 'translateX(16px)' : 'translateX(0)' }}
                  />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Notification Recipients</h3>
            <p className="text-sm text-gray-500">All Admin Users, DevOps Team, IT Support</p>
            <button className="flex items-center gap-1 text-sm text-[#1E3A8A] hover:underline">
              Manage recipients <ChevronRight size={14} />
            </button>
          </div>

          <button className="h-10 px-6 rounded-lg bg-[#1E3A8A] text-white text-sm font-medium hover:bg-[#1e3a8a]/90 transition-colors">
            Save Settings
          </button>
        </div>
      )}
    </div>
  );
}
