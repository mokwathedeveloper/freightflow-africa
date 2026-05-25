const DEFAULT_COLOR_MAP: Record<string, string> = {
  // Load statuses
  POSTED:      'bg-blue-50 text-blue-700 border-blue-200',
  ACCEPTED:    'bg-purple-50 text-purple-700 border-purple-200',
  IN_TRANSIT:  'bg-amber-50 text-amber-700 border-amber-200',
  DELIVERED:   'bg-green-50 text-green-700 border-green-200',
  DISPUTED:    'bg-orange-50 text-orange-700 border-orange-200',
  CANCELLED:   'bg-gray-100 text-gray-500 border-gray-200',
  // Billing
  PAID:        'bg-green-50 text-green-700 border-green-200',
  PENDING:     'bg-amber-50 text-amber-700 border-amber-200',
  FAILED:      'bg-red-50 text-red-700 border-red-200',
  REFUNDED:    'bg-gray-100 text-gray-500 border-gray-200',
  // Documents
  VERIFIED:    'bg-green-50 text-green-700 border-green-200',
  REJECTED:    'bg-red-50 text-red-700 border-red-200',
  UNDER_REVIEW:'bg-blue-50 text-blue-700 border-blue-200',
  // Users
  ACTIVE:      'bg-green-50 text-green-700 border-green-200',
  INACTIVE:    'bg-gray-100 text-gray-500 border-gray-200',
  SUSPENDED:   'bg-red-50 text-red-700 border-red-200',
};

const DEFAULT_LABEL_MAP: Record<string, string> = {
  IN_TRANSIT:   'In Transit',
  UNDER_REVIEW: 'Under Review',
};

interface StatusBadgeProps {
  status: string;
  colorMap?: Record<string, string>;
  labelMap?: Record<string, string>;
  size?: 'sm' | 'md';
}

export default function StatusBadge({
  status,
  colorMap,
  labelMap,
  size = 'sm',
}: StatusBadgeProps) {
  const colors = { ...DEFAULT_COLOR_MAP, ...colorMap };
  const labels = { ...DEFAULT_LABEL_MAP, ...labelMap };

  const className = colors[status] ?? 'bg-gray-100 text-gray-500 border-gray-200';
  const label = labels[status] ?? status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ');
  const sizeClass = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${sizeClass} ${className}`}>
      {label}
    </span>
  );
}
