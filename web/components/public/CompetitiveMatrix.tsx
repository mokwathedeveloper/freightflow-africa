import { CheckCircle, X } from 'lucide-react';
import type { MarketStat, FeatureRow } from '@/types/landing';

interface CompetitiveMatrixProps {
  marketStats: MarketStat[];
  competitors: string[];
  featureMatrix: FeatureRow[];
}

export default function CompetitiveMatrix({ marketStats, competitors, featureMatrix }: CompetitiveMatrixProps) {
  return (
    <section className="py-16 px-5 bg-white border-t border-gray-100" id="why-us">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Market Position</p>
          <h2 className="text-2xl font-bold text-gray-900">Why FreightFlow wins</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            Africa&apos;s freight market is $184M today, growing to $303M by 2034. None of our
            competitors serve feature-phone drivers or small shippers.
          </p>
        </div>

        {/* Market stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {marketStats.map(({ value, label, icon: Icon, color }) => (
            <div key={label} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <Icon size={18} className={`${color} mx-auto mb-2`} aria-hidden="true" />
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 grid grid-cols-3 text-xs font-bold text-gray-600 uppercase tracking-wider">
            <div className="px-5 py-3">Feature</div>
            <div className="px-4 py-3 text-center border-l border-gray-200">
              <span className="text-[#1E3A8A]">FreightFlow</span>
            </div>
            <div className="px-4 py-3 text-center border-l border-gray-200 text-gray-400">
              {competitors.slice(0, 3).join(' / ')}
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {featureMatrix.map(({ feature, freightflow, others, note }) => (
              <div key={feature} className="grid grid-cols-3 items-start hover:bg-gray-50/60 transition-colors">
                <div className="px-5 py-3">
                  <p className="text-sm text-gray-800">{feature}</p>
                  {note && <p className="text-xs text-gray-400 mt-0.5">{note}</p>}
                </div>
                <div className="px-4 py-3 flex justify-center border-l border-gray-100">
                  {freightflow
                    ? <CheckCircle size={18} className="text-[#16A34A]" aria-label="Yes" />
                    : <X size={16} className="text-gray-300" aria-label="No" />}
                </div>
                <div className="px-4 py-3 flex justify-center border-l border-gray-100">
                  {others
                    ? <CheckCircle size={18} className="text-gray-400" aria-label="Yes" />
                    : <X size={16} className="text-red-400" aria-label="No" />}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#1E3A8A]/5 border-t border-gray-200 px-5 py-3">
            <p className="text-xs text-gray-500">
              * Sendy (Kenya) was the only platform with USSD — they shut down in 2024. FreightFlow fills this gap.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
