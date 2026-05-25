import { AT_API_FEATURES } from '@/data/features';
import FeatureCard from './FeatureCard';

export default function ATAPIsSection() {
  return (
    <section id="apis" className="py-16 px-5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Powered by</p>
          <h2 className="text-2xl font-bold text-gray-900">Africa&apos;s Talking APIs</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            Every notification, OTP, status update, and reward runs through Africa&apos;s Talking infrastructure.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AT_API_FEATURES.map((f) => (
            <FeatureCard
              key={f.label}
              title={f.label}
              desc={f.desc}
              icon={f.icon}
              iconBg={f.iconBg}
              iconColor={f.iconColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
