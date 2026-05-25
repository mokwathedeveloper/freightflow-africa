'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Briefcase, CheckCircle, Star, Truck, TrendingUp, Download, MapPin,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  totalLoads:   number;
  delivered:    number;
  inTransit:    number;
  pending:      number;
  disputed:     number;
  deliveryRate: number;
  rating:       number;
  ratingCount:  number;
  trend:        { month: string; total: number; delivered: number }[];
  topRoutes:    { origin: string; destination: string; count: number }[];
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
    ['Total Jobs', data.totalLoads],
    ['Delivered', data.delivered],
    ['In Transit', data.inTransit],
    ['Disputed', data.disputed],
    ['Delivery Rate (%)', data.deliveryRate],
    ['Average Rating', data.rating.toFixed(1)],
    ['Total Ratings', data.ratingCount],
    [],
    ['Month', 'Total Jobs', 'Delivered'],
    ...data.trend.map((t) => [t.month, t.total, t.delivered]),
    [],
    ['Route (Origin → Destination)', 'Trips'],
    ...data.topRoutes.map((r) => [`${r.origin} → ${r.destination}`, r.count]),
  ];

  const csv  = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `freightflow-transporter-analytics-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Star rating display ─────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={16}
          className={s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
        />
      ))}
      <span className="ml-1.5 text-sm font-semibold text-gray-900">{rating.toFixed(1)}</span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────
export default function TransporterAnalyticsPage() {
  const { data: res, isLoading } = useQuery<{ success: boolean; data: AnalyticsData }>({
    queryKey: ['transporter-analytics'],
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
            Job performance, delivery trends, and rating summary
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
          label="Jobs Accepted" sub="All time"
          value={isLoading ? '—' : (d?.totalLoads ?? 0).toLocaleString()}
          icon={Briefcase} iconBg="bg-blue-50" iconColor="text-[#1E3A8A]"
        />
        <KpiCard
          label="Delivered" sub="Successfully completed"
          value={isLoading ? '—' : (d?.delivered ?? 0).toLocaleString()}
          icon={CheckCircle} iconBg="bg-green-50" iconColor="text-green-600"
        />
        <KpiCard
          label="Delivery Rate" sub="Delivered ÷ Total"
          value={isLoading ? '—' : `${d?.deliveryRate ?? 0}%`}
          icon={TrendingUp} iconBg="bg-purple-50" iconColor="text-purple-600"
          trend={d && d.deliveryRate >= 90 ? 'On track' : undefined} trendUp
        />
        <KpiCard
          label="Active Jobs" sub="In transit + pending"
          value={isLoading ? '—' : ((d?.inTransit ?? 0) + (d?.pending ?? 0)).toLocaleString()}
          icon={Truck} iconBg="bg-amber-50" iconColor="text-amber-500"
        />
      </div>

      {/* Rating card */}
      {d && d.ratingCount > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Star size={22} className="fill-amber-400 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Average Transporter Rating</p>
            <StarRating rating={d.rating} />
            <p className="text-xs text-gray-400 mt-0.5">
              Based on {d.ratingCount} completed delivery review{d.ratingCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* 6-month trend */}
        <div className="xl:col-span-7 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Job Volume — 6 Months</h3>
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
                <Line dataKey="total"     name="Total Jobs" stroke="#1E3A8A" strokeWidth={2.5} dot={{ fill: '#1E3A8A', r: 3 }} activeDot={{ r: 5 }} />
                <Line dataKey="delivered" name="Delivered"  stroke="#16A34A" strokeWidth={2}   dot={{ fill: '#16A34A', r: 3 }} activeDot={{ r: 5 }} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly deliveries bar */}
        <div className="xl:col-span-5 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Deliveries per Month</h3>
          {isLoading ? (
            <div className="h-48 bg-gray-50 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={d?.trend ?? []} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="delivered" name="Delivered" fill="#16A34A" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top routes table */}
      {d && d.topRoutes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Top Routes</h3>
            <p className="text-xs text-gray-500 mt-0.5">Your most frequently driven routes</p>
          </div>
          <div className="divide-y divide-gray-100">
            {d.topRoutes.map((r, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <span className="text-xs font-bold text-gray-400 w-4 shrink-0">{i + 1}</span>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <MapPin size={12} className="text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{r.origin}</span>
                  <span className="text-gray-300 shrink-0">→</span>
                  <MapPin size={12} className="text-green-500 shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{r.destination}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 shrink-0">
                  {r.count} trip{r.count !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
