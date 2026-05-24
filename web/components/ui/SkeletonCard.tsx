import { cn } from '@/lib/utils';

interface Props { className?: string; lines?: number; }

export default function SkeletonCard({ className, lines = 3 }: Props) {
  return (
    <div className={cn('p-4 border border-gray-200 rounded-xl bg-white', className)}>
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        {Array.from({ length: lines - 1 }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 rounded" style={{ width: `${60 + i * 10}%` }} />
        ))}
      </div>
    </div>
  );
}
