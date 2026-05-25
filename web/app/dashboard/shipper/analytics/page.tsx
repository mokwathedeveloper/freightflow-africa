'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Package, CheckCircle, Truck, AlertTriangle, TrendingUp, Download,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

// ─── Palette for pie segments ─────────────────────────────────────
const PIE_COLORS = ['#1E3A8A', '#16A34A', '#F59E0B', '#8B5CF6', '#DC2626', '#6B7280'];

interface AnalyticsData {
  totalLoads:     number;
  delivered:      number;
  inTransit:      number;
  pending:        number;
  disputed:       number;
  deliveryRate:   number;
  trend:          { month: string; total: number; delivered: number }[];
  cargoBreakdown: { name: string; count: number }[];
}

// ─── KPI card ────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, iconBg, iconColor, trend, trendUp }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; iconBg: string; iconColor: string;
  trend?: string; trendUp?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon size={18} className={iconColor} />
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5',
            trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600',
          )}>
            <TrendingUp size={9} /> {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── CSV export ──────────────────────────────────────────────────
function exportCSV(data: AnalyticsData) {
  const rows = [
    ['Metric', 'Value'],
    ['Total Loads', data.totalLoads],
    ['Delivered', data.delivered],
    ['In Transit', data.inTransit],
    ['Pending', data.pending],
    ['Disputed', data.disputed],
    ['Delivery Rate (%)', data.deliveryRate],
    [],
    ['Month', 'Total Loads', 'Delivered'],
    ...data.trend.map((t) => [t.month, t.total, t.delivered]),
    [],
    ['Cargo Type', 'Count'],
    ...data.cargoBreakdown.map((c) => [c.name, c.count]),
  ];

  const csv  = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `freightflow-shipper-analytics-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Status bar ──────────────────────────────────────────────────
const STATUS_ITEMS = [
  { key: 'delivered',  label: 'Delivered',  color: 'bg-green-500' },
  { key: 'inTransit',  label: 'In Transit', color: 'bg-blue-500' },
  { key: 'pending',    label: 'Pending',    color: 'bg-amber-500' },
  { key: 'disputed',   label: 'Disputed',   color: 'bg-red-500' },
] as const;

// ─── Page ────────────────────────────────────────────────────────
export default function ShipperAnalyticsPage() {
  const { data: res, isLoading } = useQuery<{ success: boolean; data: AnalyticsData }>({
    queryKey: ['shipper-analytics'],
    queryFn:  () => api.get('/loads/analytics').then((r) => r.data),
    staleTime: 60_000,
  });

  const d = res?.data;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Analytics</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Load performance, delivery trends, and cargo breakdown
          </p>
        </div>
        {d && (
          <button
            onClick={() => exportCSV(d)}
            className="flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download size={14} /> Export CSV
          </button>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Total Loads" sub="All time"
          value={isLoading ? '—' : (d?.totalLoads ?? 0).toLocaleString()}
          icon={Package} iconBg="bg-blue-50" iconColor="text-[#1E3A8A]"
        />
        <KpiCard
          label="Delivered" sub="Successfully completed"
          value={isLoading ? '—' : (d?.delivered ?? 0).toLocaleString()}
          icon={CheckCircle} iconBg="bg-green-50" iconColor="text-green-600"
          trend="+confirmed" trendUp
        />
        <KpiCard
          label="Delivery Rate" sub="Delivered ÷ Total"
          value={isLoading ? '—' : `${d?.deliveryRate ?? 0}%`}
          icon={TrendingUp} iconBg="bg-purple-50" iconColor="text-purple-600"
          trend={d && d.deliveryRate >= 90 ? 'On track' : undefined} trendUp
        />
        <KpiCard
          label="In Transit"
          value={isLoading ? '—' : (d?.inTransit ?? 0).toLocaleString()}
          icon={Truck} iconBg="bg-amber-50" iconColor="text-amber-500"
        />
      </div>

      {/* Status breakdown bar */}
      {d && d.totalLoads > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Load Status Breakdown</h3>
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            {STATUS_ITEMS.map(({ key, color }) => {
              const pct = d.totalLoads ? Math.round((d[key] / d.totalLoads) * 100) : 0;
              return pct > 0 ? (
                <div key={key} className={cn(color, 'transition-all')} style={{ width: `${pct}%` }} />
              ) : null;
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            {STATUS_ITEMS.map(({ key, label, color }) => (
              <div key={key} className="flex items-center gap-1.5 text-xs text-gray-600">
                <div className={cn('w-2.5 h-2.5 rounded-full', color)} />
                {label}: <span className="font-semibold text-gray-900">{d[key]}</span>
                <span className="text-gray-400">
                  ({d.totalLoads ? Math.round((d[key] / d.totalLoads) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* 6-month trend */}
        <div className="xl:col-span-7 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Load Volume — 6 Months</h3>
            <span className="text-xs text-gray-400">Monthly</span>
          </div>
          {isLoading ? (
            <div className="h-48 bg-gray-50 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={d?.trend ?? []} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }} />
                <Line dataKey="total"     name="Total"     stroke="#1E3A8A" strokeWidth={2.5} dot={{ fill: '#1E3A8A', r: 3 }} activeDot={{ r: 5 }} />
                <Line dataKey="delivered" name="Delivered" stroke="#16A34A" strokeWidth={2}   dot={{ fill: '#16A34A', r: 3 }} activeDot={{ r: 5 }} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Cargo type pie */}
        <div className="xl:col-span-5 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Cargo Type Distribution</h3>
          {isLoading ? (
            <div className="h-48 bg-gray-50 rounded-lg animate-pulse" />
          ) : !d?.cargoBreakdown?.length ? (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">No cargo data yet</div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="relative h-[150px] w-[150px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={d.cargoBreakdown} dataKey="count" cx="50%" cy="50%" innerRadius={40} outerRadius={68} strokeWidth={0}>
                      {d.cargoBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-base font-bold text-gray-900">{d.totalLoads}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                {d.cargoBreakdown.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-gray-600 truncate max-w-[90px]">{c.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Monthly delivered bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Deliveries per Month</h3>
        {isLoading ? (
          <div className="h-40 bg-gray-50 rounded-lg animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={d?.trend ?? []} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="delivered" name="Delivered" fill="#16A34A" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Disputed warning */}
      {d && d.disputed > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">
            You have <strong>{d.disputed}</strong> disputed load{d.disputed !== 1 ? 's' : ''}.
            {' '}Visit <strong>My Shipments</strong> to review.
          </p>
        </div>
      )}
    </div>
  );
}
