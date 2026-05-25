import React from 'react';
import { TrendingUp } from 'lucide-react';

interface KPIcardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
  trend?: string;
  iconBg?: string;
  iconColor?: string;
}

const KPIcard: React.FC<KPIcardProps> = ({
  title,
  value,
  icon,
  sub,
  trend,
  iconBg = 'bg-blue-50',
  iconColor = 'text-[#1E3A8A]',
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        {trend && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <TrendingUp size={10} />
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{title}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

export default KPIcard;
