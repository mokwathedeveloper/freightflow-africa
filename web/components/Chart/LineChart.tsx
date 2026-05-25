'use client';

import React from 'react';
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';

export interface LineChartSeries {
  dataKey: string;
  label?: string;
  color?: string;
  strokeWidth?: number;
}

interface LineChartProps {
  /** Array of data objects, e.g. [{ month: 'Jan', loads: 30, revenue: 50000 }] */
  data: Record<string, string | number>[];
  /** X-axis field name */
  xKey: string;
  /** One or more lines to render */
  series: LineChartSeries[];
  /** Chart height in px */
  height?: number;
  /** Optional title rendered above the chart */
  title?: string;
  /** Show legend when multiple series */
  showLegend?: boolean;
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: <span className="text-gray-700">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

const COLORS = ['#1E3A8A', '#16A34A', '#F59E0B', '#EF4444', '#8B5CF6'];

const LineChart: React.FC<LineChartProps> = ({
  data,
  xKey,
  series,
  height = 260,
  title,
  showLegend = false,
}) => {
  return (
    <div className="w-full">
      {title && (
        <p className="text-sm font-semibold text-gray-900 mb-4">{title}</p>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ReLineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s, i) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.label ?? s.dataKey}
              stroke={s.color ?? COLORS[i % COLORS.length]}
              strokeWidth={s.strokeWidth ?? 2}
              dot={{ fill: s.color ?? COLORS[i % COLORS.length], r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
