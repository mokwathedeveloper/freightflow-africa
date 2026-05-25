'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Package, CheckCircle, Users, Download, X, FileDown } from 'lucide-react';
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

// ─── Export helpers ──────────────────────────────────────────────
function buildCSV(stats: { totalLoads: number; delivered: number; disputed: number; activeUsers: number; deliveryRate: number }, filters: { dateFrom: string; dateTo: string; userType: string; region: string }) {
  const rows = [
    ['FreightFlow Analytics Export'],
    [`Date Range: ${filters.dateFrom} — ${filters.dateTo}`],
    [`User Type: ${filters.userType}`, `Region: ${filters.region}`],
    [],
    ['Metric', 'Value'],
    ['Total Loads',        stats.totalLoads],
    ['Delivered',          stats.delivered],
    ['Disputed',           stats.disputed],
    ['Active Users',       stats.activeUsers],
    ['Delivery Rate (%)',  stats.deliveryRate],
    [],
    ['Load Volume Trend (static demo)', 'Loads'],
    ...LOAD_TREND_DATA.map((d) => [d.date, d.loads]),
    [],
    ['Region', 'Loads'],
    ...REGION_DATA.map((d) => [d.region, d.loads]),
  ];
  return rows.map((r) => r.join(',')).join('\n');
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Export modal ────────────────────────────────────────────────
function ExportModal({ type, onConfirm, onClose }: { type: 'CSV' | 'PDF'; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-sm bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1E3A8A]/10 flex items-center justify-center">
              <FileDown size={15} className="text-[#1E3A8A]" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Export Analytics</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600">
            Download the current filtered analytics as a <strong>{type}</strong> file?
          </p>
          <p className="text-xs text-gray-400 mt-1.5">
            Includes KPI summary, load volume trend, and regional breakdown.
          </p>
        </div>
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 h-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-white transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 h-9 rounded-lg bg-[#1E3A8A] text-white text-sm font-semibold hover:bg-blue-900 transition-colors"
          >
            Download {type}
          </button>
        </div>
      </div>
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
  const [exportModal, setExportModal] = useState<'CSV' | 'PDF' | null>(null);

  const { data, isLoading } = useQuery<Analytics>({
    queryKey: ['admin-analytics', applied.dateFrom, applied.dateTo, applied.userType, applied.region],
    queryFn: () => api.get('/admin/analytics', {
      params: { dateFrom: applied.dateFrom, dateTo: applied.dateTo, userType: applied.userType, region: applied.region },
    }).then((r) => r.data),
  });

  const stats = data?.data;

  const handleExportCSV = useCallback(() => {
    if (!stats) return;
    const csv = buildCSV(stats, applied);
    downloadCSV(csv, `freightflow-analytics-${applied.dateFrom}-${applied.dateTo}.csv`);
  }, [stats, applied]);

  const handleExportPDF = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics / Reports</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track performance, analyze trends, and gain insights across your logistics operations.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setExportModal('CSV')}
            disabled={!stats}
            className="flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={() => setExportModal('PDF')}
            disabled={!stats}
            className="flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
          >
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
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Sample Data</span>
              <span className="text-xs text-gray-400">Daily</span>
            </div>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Loads by Region</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Sample Data</span>
          </div>
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Cargo Type Distribution</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Sample Data</span>
          </div>
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
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Sample Data</span>
              <span className="text-xs text-gray-400">Daily</span>
            </div>
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

      {/* Export confirmation modal */}
      {exportModal && (
        <ExportModal
          type={exportModal}
          onConfirm={exportModal === 'CSV' ? handleExportCSV : handleExportPDF}
          onClose={() => setExportModal(null)}
        />
      )}
    </div>
  );
}
