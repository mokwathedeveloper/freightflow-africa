import { formatDate } from '@/lib/utils';
import DataTable, { Column } from '@/components/Table/DataTable';
import StatusBadge from '@/components/status/StatusBadge';
import type { BillingRecord } from '@/types';

interface SubscriptionTableProps {
  records: BillingRecord[];
  loading?: boolean;
}

export default function SubscriptionTable({ records, loading = false }: SubscriptionTableProps) {
  const columns: Column<BillingRecord>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (v) => <span className="text-xs text-gray-700">{formatDate(String(v))}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (v) => <span className="text-sm text-gray-900">{String(v)}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (v, row) => (
        <span className="text-sm font-semibold text-gray-900">
          {row.currency} {Number(v).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (v) => <StatusBadge status={String(v)} />,
    },
    {
      key: 'invoiceUrl',
      header: 'Invoice',
      render: (v) =>
        v ? (
          <a
            href={String(v)}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#1E3A8A] font-medium hover:underline"
          >
            Download
          </a>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
  ];

  return (
    <DataTable<BillingRecord>
      columns={columns}
      data={records}
      keyField="id"
      loading={loading}
      emptyMessage="No billing history"
    />
  );
}
