'use client';

import React from 'react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';

export interface BarChartBarConfig {
  dataKey: string;
  label?: string;
  color?: string;
  radius?: [number, number, number, number];
}

interface BarChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  bars: BarChartBarConfig[];
  height?: number;
  title?: string;
  showLegend?: boolean;
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: <span className="text-gray-700">{p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

const COLORS = ['#1E3A8A', '#16A34A', '#F59E0B', '#EF4444', '#8B5CF6'];

const BarChart: React.FC<BarChartProps> = ({
  data,
  xKey,
  bars,
  height = 260,
  title,
  showLegend = false,
}) => {
  return (
    <div className="w-full">
      {title && <p className="text-sm font-semibold text-gray-900 mb-4">{title}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <ReBarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {bars.map((b, i) => (
            <Bar
              key={b.dataKey}
              dataKey={b.dataKey}
              name={b.label ?? b.dataKey}
              fill={b.color ?? COLORS[i % COLORS.length]}
              radius={b.radius ?? [3, 3, 0, 0]}
            />
          ))}
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
