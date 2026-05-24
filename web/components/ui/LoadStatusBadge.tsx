import { LoadStatus } from '@/types';
import { STATUS_LABELS, STATUS_COLORS, cn } from '@/lib/utils';

interface Props {
  status: LoadStatus;
  className?: string;
}

export default function LoadStatusBadge({ status, className }: Props) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', STATUS_COLORS[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}
