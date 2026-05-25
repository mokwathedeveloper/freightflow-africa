'use client';

import React from 'react';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface PieChartSlice {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartSlice[];
  height?: number;
  title?: string;
  showLegend?: boolean;
  /** Non-zero = donut; value is inner radius in px */
  innerRadius?: number;
  outerRadius?: number;
}

const COLORS = ['#1E3A8A', '#16A34A', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

const PieChart: React.FC<PieChartProps> = ({
  data,
  height = 260,
  title,
  showLegend = false,
  innerRadius = 0,
  outerRadius = 80,
}) => {
  return (
    <div className="w-full">
      {title && <p className="text-sm font-semibold text-gray-900 mb-4">{title}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <RePieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            strokeWidth={0}
          >
            {data.map((d, i) => (
              <Cell key={d.name} fill={d.color ?? COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;
