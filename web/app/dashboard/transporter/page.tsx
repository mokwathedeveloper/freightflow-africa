'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Briefcase, CheckCircle, Star, Search,
  ChevronRight, TrendingUp, Truck,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
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
    buckets[`${months[d.getMonth()]}`] = 0;
  }
  loads
    .filter((l) => l.status === 'DELIVERED')
    .forEach((l) => {
      const d = new Date(l.createdAt);
      const key = months[d.getMonth()];
      if (key in buckets) buckets[key]++;
    });
  return Object.entries(buckets).map(([month, jobs]) => ({ month, jobs }));
}

export default function TransporterPage() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery<MyLoadsResponse>({
    queryKey: ['transporter-jobs'],
    queryFn: () => api.get('/loads/my?limit=100').then((r) => r.data),
    enabled: !!user,
  });

  const loads    = data?.data.loads ?? [];
  const active   = loads.filter((l) => ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'AWAITING_CONFIRMATION'].includes(l.status)).length;
  const delivered = loads.filter((l) => l.status === 'DELIVERED').length;
  const rating    = user?.rating?.toFixed(1) ?? '—';
  const ratingCount = user?.ratingCount ?? 0;
  const recent    = loads.slice(0, 6);
  const chartData = buildChartData(loads);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Welcome banner */}
      <div className="bg-[#1E3A8A] rounded-xl p-6 text-white flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Welcome back, {user?.name.split(' ')[0]}</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {user?.vehicleType ?? 'Transporter'} · {user?.numberPlate ?? 'Registered'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
          <Truck size={20} className="text-white" />
          <span className="text-sm font-medium text-white">{active} active {active === 1 ? 'job' : 'jobs'}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Active Jobs"
          value={isLoading ? '—' : active}
          sub="In progress"
          icon={Briefcase}
          iconBg="bg-blue-50"
          iconColor="text-[#1E3A8A]"
        />
        <KpiCard
          label="Delivered"
          value={isLoading ? '—' : delivered}
          sub="All time"
          icon={CheckCircle}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          trend={delivered > 0 ? `${delivered}` : undefined}
        />
        <KpiCard
          label="My Rating"
          value={isLoading ? '—' : rating}
          sub={`${ratingCount} reviews`}
          icon={Star}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
        />
        <KpiCard
          label="Total Jobs"
          value={isLoading ? '—' : loads.length}
          sub="All time"
          icon={Truck}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Chart + jobs */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Deliveries chart */}
        <div className="xl:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Deliveries Completed (Last 6 months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: '#F3F4F6' }}
              />
              <Bar dataKey="jobs" fill="#16A34A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
          <Link href="/dashboard/transporter/loads" className={buttonVariants({ variant: 'default', size: 'sm' }) + ' w-full justify-center'}>
            <Search size={14} /> Browse Available Loads
          </Link>
          <Link href="/dashboard/transporter/jobs" className={buttonVariants({ variant: 'secondary', size: 'sm' }) + ' w-full justify-center'}>
            <Briefcase size={14} /> My Jobs
          </Link>
          <Link href="/dashboard/transporter/track" className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' w-full justify-center'}>
            Track a Route
          </Link>

          <div className="mt-2 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">USSD Alternative</p>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm font-mono font-bold text-[#1E3A8A]">*384*7447#</p>
              <p className="text-xs text-gray-500 mt-1">Update status from any phone</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Jobs Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Recent Jobs</h3>
          <Link href="/dashboard/transporter/jobs" className="text-xs text-[#1E3A8A] hover:underline flex items-center gap-0.5">
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
            <Briefcase className="mx-auto text-gray-300 mb-3" size={36} />
            <p className="text-sm font-medium text-gray-500">No jobs yet</p>
            <p className="text-xs text-gray-400 mt-1">Browse available loads to start earning.</p>
            <Link href="/dashboard/transporter/loads" className={`${buttonVariants({ size: 'sm' })} mt-4 inline-flex`}>
              Browse Loads
            </Link>
          </div>
        ) : (
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Load ID</th>
                <th>Route</th>
                <th>Cargo</th>
                <th>Due Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recent.map((load) => (
                <tr
                  key={load.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => window.location.href = `/dashboard/transporter/track/${load.id}`}
                >
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
