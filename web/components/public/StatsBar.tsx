import type { TrustStat } from '@/types/landing';

interface StatsBarProps {
  stats: TrustStat[];
}

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="bg-gray-50 border-b border-gray-200 py-6 px-5">
      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
        {stats.map(({ value, label }) => (
          <div key={label}>
            <p className="text-2xl font-black text-[#1E3A8A]">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
