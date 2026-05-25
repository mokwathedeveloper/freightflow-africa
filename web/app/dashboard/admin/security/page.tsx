'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield, Lock, FileCheck, Search, Trash2, Check,
  ExternalLink, AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { cn, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import { useToastStore } from '@/store/toast.store';
import DataTable, { Column } from '@/components/Table/DataTable';
import FilterDropdown from '@/components/Filters/FilterDropdown';
import Modal from '@/components/Modal/Modal';

interface AuditLog {
  id: string;
  actorName?: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  createdAt: string;
}

interface LogsResponse {
  success: boolean;
  data: { logs: AuditLog[]; total: number; page: number; limit: number };
}

function actionBadge(action: string) {
  if (action.includes('ROLE') || action.includes('ADMIN'))    return 'bg-purple-50 text-purple-700 border-purple-200';
  if (action.includes('DELETE') || action.includes('REVOKE')) return 'bg-red-50 text-red-700 border-red-200';
  if (action.includes('RESOLVED') || action.includes('CREATED')) return 'bg-green-50 text-green-700 border-green-200';
  if (action.includes('BROADCAST')) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
}

function fmtAction(action: string) {
  return action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function ComplianceCard({ icon: Icon, iconBg, iconColor, label, status, sub }: {
  icon: React.ElementType; iconBg: string; iconColor: string;
  label: string; status: string; sub: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon size={18} className={iconColor} />
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 bg-green-50 text-green-700">
          <Check size={10} /> {status}
        </span>
      </div>
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
    </div>
  );
}

const ACTION_OPTIONS = [
  { label: 'All Actions',          value: 'ALL' },
  { label: 'Role Changed',         value: 'USER_ROLE_CHANGED' },
  { label: 'User Activated',       value: 'USER_ACTIVATED' },
  { label: 'User Deactivated',     value: 'USER_DEACTIVATED' },
  { label: 'Dispute Resolved',     value: 'DISPUTE_RESOLVED' },
  { label: 'Load Status Changed',  value: 'LOAD_STATUS_CHANGED' },
  { label: 'Broadcast Sent',       value: 'BROADCAST_SENT' },
  { label: 'Subscription Changed', value: 'SUBSCRIPTION_CHANGED' },
];

export default function AdminSecurityPage() {
  const addToast  = useToastStore((s) => s.addToast);
  const qc        = useQueryClient();
  const [search,     setSearch]     = useState('');
  const [action,     setAction]     = useState('ALL');
  const [dateFrom,   setDateFrom]   = useState('');
  const [dateTo,     setDateTo]     = useState('');
  const [page,       setPage]       = useState(1);
  const [clearModal, setClearModal] = useState(false);

  const params = new URLSearchParams();
  if (action !== 'ALL') params.set('action', action);
  if (search)   params.set('search',   search);
  if (dateFrom) params.set('dateFrom', dateFrom);
  if (dateTo)   params.set('dateTo',   dateTo);
  params.set('page', String(page));

  const { data, isLoading } = useQuery<LogsResponse>({
    queryKey: ['admin-audit-logs', action, search, dateFrom, dateTo, page],
    queryFn: () => api.get(`/admin/audit-logs?${params.toString()}`).then((r) => r.data),
    staleTime: 30_000,
  });

  const logs  = data?.data?.logs  ?? [];
  const total = data?.data?.total ?? 0;
  const limit = data?.data?.limit ?? 20;
  const pages = Math.max(1, Math.ceil(total / limit));

  const clearMut = useMutation({
    mutationFn: () => api.delete('/admin/audit-logs'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-audit-logs'] });
      addToast('success', 'Audit logs cleared');
      setClearModal(false);
    },
    onError: () => addToast('error', 'Failed to clear audit logs'),
  });

  const columns: Column<AuditLog>[] = [
    {
      key: 'actorName',
      header: 'Actor',
      render: (_, l) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{l.actorName ?? 'System'}</p>
          {l.userId && <p className="text-xs text-gray-400">{l.userId.slice(0, 8)}…</p>}
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (_, l) => (
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', actionBadge(l.action))}>
          {fmtAction(l.action)}
        </span>
      ),
    },
    {
      key: 'resource',
      header: 'Resource',
      render: (_, l) => (
        <div>
          <p className="text-sm text-gray-700">{l.resource}</p>
          {l.resourceId && <p className="text-xs text-gray-400">{l.resourceId.slice(0, 8)}…</p>}
        </div>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      render: (_, l) => <span className="text-xs font-mono text-gray-500">{l.ipAddress ?? '—'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      sortable: true,
      render: (_, l) => <span className="text-xs text-gray-500">{formatDate(l.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Security & Compliance</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Platform security posture, RBAC summary, and admin audit trail
        </p>
      </div>

      {/* Compliance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ComplianceCard
          icon={Lock} iconBg="bg-blue-50" iconColor="text-[#1E3A8A]"
          label="Data Encryption" status="AES-256"
          sub="All data at rest and in transit is encrypted"
        />
        <ComplianceCard
          icon={Shield} iconBg="bg-green-50" iconColor="text-green-600"
          label="GDPR Compliance" status="Compliant"
          sub="User data handling meets GDPR requirements"
        />
        <ComplianceCard
          icon={FileCheck} iconBg="bg-purple-50" iconColor="text-purple-600"
          label="Audit Logging" status="Active"
          sub="All admin actions are logged with actor and timestamp"
        />
      </div>

      {/* RBAC summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Role-Based Access Control (RBAC)</h3>
          <Link
            href="/dashboard/admin/users"
            className="flex items-center gap-1 text-xs text-[#1E3A8A] hover:underline font-medium"
          >
            Manage Users <ExternalLink size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { role: 'Shippers',     color: 'bg-blue-50 text-blue-700',    desc: 'Post and manage cargo loads' },
            { role: 'Transporters', color: 'bg-purple-50 text-purple-700', desc: 'Browse and accept loads' },
            { role: 'Admins',       color: 'bg-gray-100 text-gray-700',   desc: 'Full platform access' },
          ].map(({ role, color, desc }) => (
            <div key={role} className={cn('rounded-lg p-3 text-center', color)}>
              <p className="text-sm font-bold">{role}</p>
              <p className="text-xs mt-0.5 opacity-70">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Permissions are enforced at the API layer. Role changes take effect immediately.
          Use the <strong>Users</strong> page to assign or revoke roles.
        </p>
      </div>

      {/* Audit log table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Audit Log</h3>
            <p className="text-xs text-gray-500 mt-0.5">{total.toLocaleString()} entries</p>
          </div>
          <button
            onClick={() => setClearModal(true)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-red-200 bg-red-50 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={12} /> Clear Logs
          </button>
        </div>

        {/* Filters */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search actor, resource, action…"
              className="ff-input pl-8 text-xs h-8"
            />
          </div>
          <FilterDropdown
            label="All Actions"
            options={ACTION_OPTIONS}
            selected={action}
            onChange={(v) => { setAction(v); setPage(1); }}
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="h-8 px-3 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]/30"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="h-8 px-3 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]/30"
          />
        </div>

        {logs.length === 0 && !isLoading ? (
          <div className="py-16 text-center">
            <Shield className="mx-auto text-gray-300 mb-3" size={36} />
            <p className="text-sm font-medium text-gray-500">No audit logs found</p>
            <p className="text-xs text-gray-400 mt-1">Admin actions will appear here</p>
          </div>
        ) : (
          <DataTable<AuditLog>
            columns={columns}
            data={logs}
            keyField="id"
            loading={isLoading}
          />
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-7 px-3 text-xs rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page === pages}
                onClick={() => setPage((p) => p + 1)}
                className="h-7 px-3 text-xs rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clear confirmation modal */}
      <Modal isOpen={clearModal} onClose={() => setClearModal(false)} title="Clear Audit Logs" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">This action is irreversible</p>
              <p className="text-xs text-red-700 mt-0.5">
                All {total.toLocaleString()} audit log entries will be permanently deleted.
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-700">
            Are you sure you want to clear all audit logs? This removes the complete admin
            activity history for this platform.
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => clearMut.mutate()}
              disabled={clearMut.isPending}
              className="flex-1 h-9 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {clearMut.isPending ? 'Clearing…' : 'Yes, Clear All Logs'}
            </button>
            <button
              onClick={() => setClearModal(false)}
              className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
