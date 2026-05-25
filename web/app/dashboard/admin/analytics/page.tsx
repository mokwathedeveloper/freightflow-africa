'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Package, CheckCircle, Users, Download } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api from '@/lib/api';
import FilterDropdown, { FilterOption } from '@/components/Filters/FilterDropdown';

interface Analytics {
  data: {
    totalLoads: number;
    delivered: number;
    disputed: number;
    activeUsers: number;
    deliveryRate: number;
  };
}

const LOAD_TREND_DATA = [
  { date: 'May 10', loads: 320 },
  { date: 'May 11', loads: 410 },
  { date: 'May 12', loads: 380 },
  { date: 'May 13', loads: 520 },
  { date: 'May 14', loads: 460 },
  { date: 'May 15', loads: 550 },
  { date: 'May 16', loads: 490 },
];

const REGION_DATA = [
  { region: 'East Africa',   loads: 980 },
  { region: 'West Africa',   loads: 720 },
  { region: 'North Africa',  loads: 540 },
  { region: 'South Africa',  loads: 860 },
  { region: 'Central Africa', loads: 521 },
];

const CARGO_PIE_DATA = [
  { name: 'Electronics',     value: 826,  color: '#1E3A8A' },
  { name: 'Furniture',       value: 613,  color: '#16A34A' },
  { name: 'Food & Beverage', value: 534,  color: '#F59E0B' },
  { name: 'Machinery',       value: 421,  color: '#8B5CF6' },
  { name: 'Automotive',      value: 312,  color: '#DC2626' },
  { name: 'Other',           value: 915,  color: '#6B7280' },
];

const USER_ACTIVITY_DATA = [
  { date: 'May 10', users: 1820 },
  { date: 'May 11', users: 2050 },
  { date: 'May 12', users: 1960 },
  { date: 'May 13', users: 2280 },
  { date: 'May 14', users: 2150 },
  { date: 'May 15', users: 2400 },
  { date: 'May 16', users: 2458 },
];

const USER_TYPE_OPTIONS: FilterOption[] = [
  { label: 'All User Types', value: 'ALL' },
  { label: 'Shipper',        value: 'SHIPPER' },
  { label: 'Transporter',    value: 'TRANSPORTER' },
  { label: 'Admin',          value: 'ADMIN' },
];
const REGION_OPTIONS: FilterOption[] = [
  { label: 'All Regions',    value: 'ALL' },
  { label: 'East Africa',    value: 'East Africa' },
  { label: 'West Africa',    value: 'West Africa' },
  { label: 'North Africa',   value: 'North Africa' },
  { label: 'South Africa',   value: 'South Africa' },
  { label: 'Central Africa', value: 'Central Africa' },
];

function KpiCard({ label, value, trend, trendUp, icon: Icon, iconBg, iconColor, sub }: {
  label: string; value: string; trend: string; trendUp: boolean; sub?: string;
  icon: React.ElementType; iconBg: string; iconColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={18} className={iconColor} />
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5 ${trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          <TrendingUp size={9} /> {trend}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  const [dateFrom, setDateFrom] = useState(weekAgo);
  const [dateTo, setDateTo]     = useState(today);
  const [userType, setUserType] = useState('ALL');
  const [region, setRegion]     = useState('ALL');
  const [applied, setApplied]   = useState({ dateFrom: weekAgo, dateTo: today, userType: 'ALL', region: 'ALL' });

  const { data, isLoading } = useQuery<Analytics>({
    queryKey: ['admin-analytics', applied.dateFrom, applied.dateTo, applied.userType, applied.region],
    queryFn: () => api.get('/admin/analytics', {
      params: { dateFrom: applied.dateFrom, dateTo: applied.dateTo, userType: applied.userType, region: applied.region },
    }).then((r) => r.data),
  });

  const stats = data?.data;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics / Reports</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track performance, analyze trends, and gain insights across your logistics operations.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={14} /> Export CSV
          </button>
          <button className="flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-500 shrink-0">Date Range</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="ff-input h-8 text-xs w-auto"
          />
          <span className="text-xs text-gray-400">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="ff-input h-8 text-xs w-auto"
          />
        </div>
        <FilterDropdown
          label="All User Types"
          options={USER_TYPE_OPTIONS}
          selected={userType}
          onChange={setUserType}
        />
        <FilterDropdown
          label="All Regions"
          options={REGION_OPTIONS}
          selected={region}
          onChange={setRegion}
        />
        <button
          onClick={() => setApplied({ dateFrom, dateTo, userType, region })}
          className="h-8 px-4 rounded-lg bg-[#16A34A] text-white text-xs font-medium hover:bg-green-700 transition-colors"
        >
          Apply
        </button>
        <button
          onClick={() => {
            setDateFrom(weekAgo); setDateTo(today);
            setUserType('ALL'); setRegion('ALL');
            setApplied({ dateFrom: weekAgo, dateTo: today, userType: 'ALL', region: 'ALL' });
          }}
          className="h-8 px-4 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Total Loads" sub="vs May 3 – May 9"
          value={isLoading ? '—' : (stats?.totalLoads ?? 3621).toLocaleString()}
          trend="+5.2%" trendUp
          icon={Package} iconBg="bg-blue-50" iconColor="text-[#1E3A8A]"
        />
        <KpiCard
          label="Delivery Success Rate" sub="vs May 3 – May 9"
          value={isLoading ? '—' : `${stats?.deliveryRate ?? 97.8}%`}
          trend="+1.2%" trendUp
          icon={CheckCircle} iconBg="bg-green-50" iconColor="text-green-600"
        />
        <KpiCard
          label="Load Efficiency" sub="vs May 3 – May 9"
          value="89.3%"
          trend="+0.8%" trendUp
          icon={TrendingUp} iconBg="bg-purple-50" iconColor="text-purple-600"
        />
        <KpiCard
          label="Active Users" sub="vs May 3 – May 9"
          value={isLoading ? '—' : (stats?.activeUsers ?? 2458).toLocaleString()}
          trend="+3.1%" trendUp
          icon={Users} iconBg="bg-amber-50" iconColor="text-amber-500"
        />
      </div>

      {/* Top charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* Load Volume Trend */}
        <div className="xl:col-span-7 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Load Volume Trend</h3>
            <span className="text-xs text-gray-400">Daily</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={LOAD_TREND_DATA} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }} />
              <Line dataKey="loads" name="Loads" stroke="#1E3A8A" strokeWidth={2.5} dot={{ fill: '#1E3A8A', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Loads by Region */}
        <div className="xl:col-span-5 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Loads by Region</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={REGION_DATA} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="region" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="loads" name="Loads" fill="#16A34A" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* Cargo Type Distribution */}
        <div className="xl:col-span-5 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Cargo Type Distribution</h3>
          <div className="flex items-center gap-4">
            <div className="relative h-[160px] w-[160px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CARGO_PIE_DATA}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={72}
                    strokeWidth={0}
                  >
                    {CARGO_PIE_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-base font-bold text-gray-900">3,621</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              {CARGO_PIE_DATA.map((d) => (
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
        </div>

        {/* User Activity */}
        <div className="xl:col-span-7 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">User Activity (Logins)</h3>
            <span className="text-xs text-gray-400">Daily</span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={USER_ACTIVITY_DATA} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }} />
              <Line dataKey="users" name="Active Users" stroke="#16A34A" strokeWidth={2.5} dot={{ fill: '#16A34A', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
