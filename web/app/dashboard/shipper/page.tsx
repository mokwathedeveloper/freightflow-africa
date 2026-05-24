'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Package, Truck, CheckCircle, AlertTriangle,
  PlusCircle, ChevronRight, TrendingUp,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { buttonVariants } from '@/components/ui/button';
import LoadStatusBadge from '@/components/ui/LoadStatusBadge';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Load } from '@/types';

interface MyLoadsResponse {
  data: { loads: Load[]; total: number };
}

function KpiCard({
  label, value, sub, icon: Icon, iconBg, iconColor, trend,
}: {
  label: string; value: number | string; sub?: string;
  icon: React.ElementType; iconBg: string; iconColor: string; trend?: string;
}) {
  return (
    <div className="kpi-card flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={18} className={iconColor} />
        </div>
        {trend && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <TrendingUp size={10} /> {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function buildChartData(loads: Load[]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const buckets: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets[`${months[d.getMonth()]} ${d.getFullYear()}`] = 0;
  }
  loads.forEach((l) => {
    const d = new Date(l.createdAt);
    const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
    if (key in buckets) buckets[key]++;
  });
  return Object.entries(buckets).map(([month, loads]) => ({ month: month.split(' ')[0], loads }));
}

export default function ShipperPage() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery<MyLoadsResponse>({
    queryKey: ['shipper-loads'],
    queryFn: () => api.get('/loads/my?limit=100').then((r) => r.data),
    enabled: !!user,
  });

  const loads = data?.data.loads ?? [];
  const total    = loads.length;
  const active   = loads.filter((l) => ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(l.status)).length;
  const delivered = loads.filter((l) => l.status === 'DELIVERED').length;
  const disputed  = loads.filter((l) => l.status === 'DISPUTED').length;
  const recent    = loads.slice(0, 6);
  const chartData = buildChartData(loads);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Welcome back, {user?.name.split(' ')[0]}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Here&apos;s your freight overview</p>
        </div>
        <Link href="/dashboard/shipper/post-load" className={buttonVariants({ size: 'sm' })}>
          <PlusCircle size={15} /> Post a Load
        </Link>
      </div>

      {/* KPI Cards — skeleton or real */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="kpi-card animate-pulse space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                <div className="h-5 w-12 bg-gray-100 rounded-full" />
              </div>
              <div className="space-y-1.5">
                <div className="h-7 bg-gray-100 rounded w-16" />
                <div className="h-4 bg-gray-100 rounded w-24" />
              </div>
            </div>
          ))
        ) : (
          <>
            <KpiCard label="Total Loads" value={total} sub="All time" icon={Package} iconBg="bg-blue-50" iconColor="text-[#1E3A8A]" />
            <KpiCard label="In Transit" value={active} sub="Currently active" icon={Truck} iconBg="bg-amber-50" iconColor="text-amber-600" />
            <KpiCard label="Delivered" value={delivered} sub="Successfully" icon={CheckCircle} iconBg="bg-green-50" iconColor="text-green-600" trend={delivered > 0 ? `${Math.round((delivered / Math.max(total, 1)) * 100)}%` : undefined} />
            <KpiCard label="Disputed" value={disputed} sub="Needs attention" icon={AlertTriangle} iconBg="bg-red-50" iconColor="text-red-600" />
          </>
        )}
      </div>

      {/* Chart + Recent side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Load Volume Chart */}
        <div className="xl:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Load Volume (Last 6 months)</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#111827', fontWeight: 600 }}
              />
              <Line
                type="monotone"
                dataKey="loads"
                stroke="#1E3A8A"
                strokeWidth={2}
                dot={{ fill: '#1E3A8A', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Posted',     count: loads.filter(l => l.status === 'POSTED').length,     color: 'bg-blue-500' },
              { label: 'In Transit', count: active,                                               color: 'bg-amber-500' },
              { label: 'Delivered',  count: delivered,                                            color: 'bg-green-500' },
              { label: 'Disputed',   count: disputed,                                             color: 'bg-red-500' },
            ].map(({ label, count, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Shipments table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Recent Shipments</h3>
          <Link
            href="/dashboard/shipper/shipments"
            className="text-xs text-[#1E3A8A] hover:underline flex items-center gap-0.5"
          >
            View all <ChevronRight size={12} />
          </Link>
        </div>

        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-20" />
                <div className="h-3 bg-gray-100 rounded flex-1" />
                <div className="h-5 bg-gray-100 rounded w-20" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="py-14 text-center">
            <Package className="mx-auto text-gray-300 mb-3" size={36} />
            <p className="text-sm font-medium text-gray-500">No loads posted yet</p>
            <p className="text-xs text-gray-400 mt-1">Post your first load to get matched with a transporter.</p>
            <Link href="/dashboard/shipper/post-load" className={`${buttonVariants({ size: 'sm' })} mt-4 inline-flex`}>
              Post your first load
            </Link>
          </div>
        ) : (
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Load ID</th>
                <th>Route</th>
                <th>Cargo</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recent.map((load) => (
                <tr key={load.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/dashboard/shipper/track/${load.id}`}>
                  <td className="font-mono text-xs text-gray-500">{load.shortId}</td>
                  <td className="font-medium">{load.origin} → {load.destination}</td>
                  <td className="text-gray-500">{load.cargoType}</td>
                  <td className="text-gray-500">{formatDate(load.deliveryDate)}</td>
                  <td><LoadStatusBadge status={load.status} /></td>
                  <td><ChevronRight size={14} className="text-gray-400" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
