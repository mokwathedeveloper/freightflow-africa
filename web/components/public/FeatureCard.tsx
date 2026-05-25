import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  iconBg: string;
  iconColor: string;
  className?: string;
}

export default function FeatureCard({ icon: Icon, title, desc, iconBg, iconColor, className }: FeatureCardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow', className)}>
      <div
        className={cn('w-11 h-11 rounded-xl flex items-center justify-center mb-4', iconBg)}
        aria-hidden="true"
      >
        <Icon size={20} className={iconColor} />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}
