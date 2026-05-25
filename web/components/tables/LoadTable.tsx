import { formatDate } from '@/lib/utils';
import DataTable, { Column } from '@/components/Table/DataTable';
import StatusBadge from '@/components/status/StatusBadge';
import type { Load } from '@/types';

interface LoadTableProps {
  loads: Load[];
  loading?: boolean;
  onRowClick?: (load: Load) => void;
  showShipper?: boolean;
  showTransporter?: boolean;
}

export default function LoadTable({
  loads,
  loading = false,
  onRowClick,
  showShipper = true,
  showTransporter = true,
}: LoadTableProps) {
  const columns: Column<Load>[] = [
    {
      key: 'shortId',
      header: 'Load ID',
      render: (v) => (
        <span className="font-mono text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
          {String(v)}
        </span>
      ),
    },
    {
      key: 'origin',
      header: 'Route',
      render: (_, row) => (
        <div className="text-xs">
          <p className="font-medium text-gray-900">{row.origin}</p>
          <p className="text-gray-400">→ {row.destination}</p>
        </div>
      ),
    },
    { key: 'cargoType', header: 'Cargo' },
    {
      key: 'status',
      header: 'Status',
      render: (v) => <StatusBadge status={String(v)} />,
    },
    ...(showShipper
      ? [{
          key: 'shipperId' as keyof Load,
          header: 'Shipper',
          render: (_: unknown, row: Load) => (
            <span className="text-xs text-gray-700">{row.shipper?.company ?? row.shipper?.name ?? '—'}</span>
          ),
        }]
      : []),
    ...(showTransporter
      ? [{
          key: 'transporterId' as keyof Load,
          header: 'Transporter',
          render: (_: unknown, row: Load) => (
            <span className="text-xs text-gray-700">{row.transporter?.name ?? 'Unassigned'}</span>
          ),
        }]
      : []),
    {
      key: 'createdAt',
      header: 'Created',
      render: (v) => <span className="text-xs text-gray-500">{formatDate(String(v))}</span>,
    },
  ];

  return (
    <DataTable<Load>
      columns={columns}
      data={loads}
      keyField="id"
      loading={loading}
      emptyMessage="No loads found"
      onRowClick={onRowClick}
    />
  );
}
