'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Users, Package, CheckCircle, DollarSign,
  TrendingUp, ChevronRight, AlertTriangle, Shield, Calendar,
  MessageSquare, Radio, Phone, Star,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import PieChartComponent from '@/components/charts/PieChart';
import api from '@/lib/api';

interface Analytics {
  data: {
    totalLoads: number;
    delivered: number;
    disputed: number;
    activeUsers: number;
    deliveryRate: number;
  };
}

// Static AT API activity data (reflects Africa's Talking integration)
const AT_STATS = [
  { label: 'SMS Sent Today',     value: '1,284',  delta: '+12%',  icon: MessageSquare, color: 'text-[#1E3A8A]', bg: 'bg-blue-50'   },
  { label: 'USSD Sessions',      value: '347',    delta: '+8%',   icon: Radio,         color: 'text-green-600', bg: 'bg-green-50'  },
  { label: 'Voice Alerts',       value: '23',     delta: '+2',    icon: Phone,         color: 'text-purple-600',bg: 'bg-purple-50' },
  { label: 'Airtime Disbursed',  value: 'KES 4.6k', delta: '+18%', icon: Star,        color: 'text-amber-600', bg: 'bg-amber-50'  },
];

const LOAD_ACTIVITY = [
  { day: 'May 10', loads: 320 },
  { day: 'May 11', loads: 380 },
  { day: 'May 12', loads: 420 },
  { day: 'May 13', loads: 350 },
  { day: 'May 14', loads: 490 },
  { day: 'May 15', loads: 460 },
  { day: 'May 16', loads: 510 },
];

const DONUT_DATA = [
  { name: 'Delivered',         value: 3174, color: '#1E3A8A' },
  { name: 'Delivered in Time', value: 360,  color: '#16A34A' },
  { name: 'Pending',           value: 87,   color: '#F59E0B' },
];

const SYSTEM_ALERTS_DATA = [
  { id: 1, severity: 'Critical', title: 'Server CPU usage is above 90%',  sub: 'System Performance', time: 'May 16, 2024 10:03 AM', count: 3 },
  { id: 2, severity: 'High',     title: 'High API error rate detected',    sub: 'System Performance', time: 'May 16, 2024 09:48 AM', count: 7 },
  { id: 3, severity: 'Warning',  title: 'Database connection pool is high', sub: 'Operations',        time: 'May 16, 2024 09:30 AM', count: 12 },
];

function severityStyle(s: string) {
  if (s === 'Critical') return { bg: 'bg-red-100', text: 'text-red-700', dot: '#EF4444' };
  if (s === 'High')     return { bg: 'bg-orange-100', text: 'text-orange-700', dot: '#F97316' };
  return                       { bg: 'bg-amber-100', text: 'text-amber-700', dot: '#F59E0B' };
}

function KpiCard({ label, value, trend, icon: Icon, iconBg, iconColor, sub }: {
  label: string; value: string | number; trend?: string; sub?: string;
  icon: React.ElementType; iconBg: string; iconColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={18} className={iconColor} />
        </div>
        {trend && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
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

export default function AdminOverviewPage() {
  const { data: analytics, isLoading } = useQuery<Analytics>({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get('/admin/analytics').then((r) => r.data),
  });

  const stats = analytics?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back! here&apos;s what&apos;s happening with your platform</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
          <Calendar size={13} className="text-gray-400" />
          May 10 – 16, 2024
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Total Users" sub="vs last 7 days"
          value={isLoading ? '—' : (stats?.activeUsers ?? 2458).toLocaleString()}
          trend="+8.2%"
          icon={Users} iconBg="bg-blue-50" iconColor="text-[#1E3A8A]"
        />
        <KpiCard
          label="Active Loads" sub="vs last 7 days"
          value={isLoading ? '—' : (stats?.totalLoads ?? 1286).toLocaleString()}
          trend="+1.8%"
          icon={Package} iconBg="bg-purple-50" iconColor="text-purple-600"
        />
        <KpiCard
          label="Completed Deliveries" sub="vs last 7 days"
          value={isLoading ? '—' : (stats?.delivered ?? 0).toLocaleString()}
          trend="+6.8%"
          icon={CheckCircle} iconBg="bg-green-50" iconColor="text-green-600"
        />
        <KpiCard
          label="Subscription Revenue" sub="vs last 7 days"
          value="$245,490"
          trend="+9%"
          icon={DollarSign} iconBg="bg-amber-50" iconColor="text-amber-500"
        />
      </div>

      {/* Africa's Talking API Activity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-[#1E3A8A]/5 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <h3 className="text-sm font-semibold text-gray-900">Africa&apos;s Talking API Activity</h3>
            <span className="text-xs text-gray-400 font-normal">· Today</span>
          </div>
          <span className="text-[10px] font-bold bg-[#1E3A8A] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Live</span>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 divide-x divide-gray-100">
          {AT_STATS.map(({ label, value, delta, icon: Icon, color, bg }) => (
            <div key={label} className="px-5 py-4 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                <Icon size={16} className={color} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
                <p className="text-xs text-gray-500 leading-tight">{label}</p>
                <p className="text-xs text-green-600 font-medium mt-0.5">{delta} vs yesterday</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* Load Activity line chart */}
        <div className="xl:col-span-5 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Load Activity (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={LOAD_ACTIVITY} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }} />
              <Line dataKey="loads" stroke="#1E3A8A" strokeWidth={2.5} dot={{ fill: '#1E3A8A', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Deliveries donut */}
        <div className="xl:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Deliveries</h3>
          <div className="relative h-[160px]">
            <PieChartComponent
              data={DONUT_DATA}
              height={160}
              innerRadius={50}
              outerRadius={72}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">3,621</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          </div>
          <div className="space-y-1.5 mt-3">
            {DONUT_DATA.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts panel */}
        <div className="xl:col-span-4 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">System Alerts</h3>
            <Link href="/dashboard/admin/alerts" className="text-xs text-[#1E3A8A] hover:underline">
              View all alerts
            </Link>
          </div>
          <div className="space-y-3">
            {SYSTEM_ALERTS_DATA.map((a) => {
              const { bg, text } = severityStyle(a.severity);
              return (
                <div key={a.id} className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <AlertTriangle
                      size={14}
                      className={`${text} shrink-0 mt-0.5`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 leading-snug">{a.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded min-w-[22px] text-center ${bg} ${text} shrink-0`}>
                    {a.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              href: '/dashboard/admin/users',
              icon: Users,
              iconBg: 'bg-blue-50',
              iconColor: 'text-[#1E3A8A]',
              label: 'User Management',
              desc: 'Manage users, assign roles and their permissions.',
            },
            {
              href: '/dashboard/admin/loads',
              icon: Package,
              iconBg: 'bg-purple-50',
              iconColor: 'text-purple-600',
              label: 'Load Management',
              desc: 'Manage loads, assign drivers, and track deliveries.',
            },
            {
              href: '/dashboard/admin/subscriptions',
              icon: Shield,
              iconBg: 'bg-green-50',
              iconColor: 'text-green-600',
              label: 'Subscription Management',
              desc: 'View and manage customer subscriptions and billing.',
            },
          ].map(({ href, icon: Icon, iconBg, iconColor, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-[#1E3A8A]/30 transition-all flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                  <Icon size={18} className={iconColor} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-gray-400 shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
