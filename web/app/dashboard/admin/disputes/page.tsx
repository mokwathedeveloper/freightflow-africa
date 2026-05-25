'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, Loader2, FileText } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import api from '@/lib/api';
import { useToastStore } from '@/store/toast.store';
import DataTable, { Column } from '@/components/Table/DataTable';
import Modal from '@/components/Modal/Modal';
import FilterDropdown, { FilterOption } from '@/components/Filters/FilterDropdown';

interface Dispute {
  id: string;
  loadId: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
  description: string;
  resolution?: string;
  createdAt: string;
  raisedBy?: { name: string; phone: string };
  load?: { shortId: string; origin: string; destination: string };
}

interface DisputesResponse {
  data: Dispute[];
}

function statusBadge(s: string) {
  if (s === 'OPEN')         return 'bg-red-50 text-red-700 border-red-200';
  if (s === 'UNDER_REVIEW') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (s === 'RESOLVED')     return 'bg-green-50 text-green-700 border-green-200';
  return 'bg-gray-100 text-gray-500 border-gray-200';
}

const FINAL_STATUS_OPTIONS: FilterOption[] = [
  { label: 'Mark as Delivered', value: 'DELIVERED' },
  { label: 'Mark as Cancelled', value: 'CANCELLED' },
  { label: 'Keep as Disputed',  value: 'DISPUTED'  },
];

const STATUS_FILTER_TABS = [
  { label: 'Open',         value: 'OPEN' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Resolved',     value: 'RESOLVED' },
  { label: 'All',          value: 'ALL' },
];

interface ResolveModalProps {
  dispute: Dispute;
  onClose: () => void;
}

function ResolveModal({ dispute, onClose }: ResolveModalProps) {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [resolution,   setResolution]   = useState(dispute.resolution ?? '');
  const [finalStatus,  setFinalStatus]  = useState('DELIVERED');

  const resolveMut = useMutation({
    mutationFn: () =>
      api.patch(`/admin/disputes/${dispute.id}`, { resolution, finalStatus }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-disputes'] });
      addToast('success', 'Dispute resolved successfully');
      onClose();
    },
    onError: () => addToast('error', 'Failed to resolve dispute'),
  });

  const isReadOnly = dispute.status === 'RESOLVED' || dispute.status === 'CLOSED';

  return (
    <div className="space-y-5">

      {/* Load info */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Load</p>
        <p className="text-sm font-semibold text-gray-900">
          {dispute.load?.shortId ?? dispute.loadId}
          {dispute.load && (
            <span className="font-normal text-gray-500 ml-1">
              · {dispute.load.origin} → {dispute.load.destination}
            </span>
          )}
        </p>
      </div>

      {/* Description */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Dispute Description
        </p>
        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
          {dispute.description}
        </p>
        {dispute.raisedBy && (
          <p className="text-xs text-gray-400 mt-1.5">
            Raised by: {dispute.raisedBy.name} ({dispute.raisedBy.phone})
          </p>
        )}
      </div>

      {/* Raised date */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Opened: {formatDate(dispute.createdAt)}</span>
        <span className={cn('font-medium px-2 py-0.5 rounded-full border text-xs', statusBadge(dispute.status))}>
          {dispute.status.replace('_', ' ')}
        </span>
      </div>

      {/* Existing resolution */}
      {dispute.resolution && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
          <p className="font-medium mb-1">Resolution</p>
          <p>{dispute.resolution}</p>
        </div>
      )}

      {/* Resolve form — only for open disputes */}
      {!isReadOnly && (
        <>
          <div>
            <label className="ff-label">Resolution Note</label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Describe the resolution clearly..."
              rows={3}
              className="ff-input h-auto resize-none py-2.5"
            />
          </div>

          <div>
            <label className="ff-label">Final Load Status</label>
            <FilterDropdown
              label="Select outcome"
              options={FINAL_STATUS_OPTIONS}
              selected={finalStatus}
              onChange={setFinalStatus}
              className="w-full justify-between"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => resolveMut.mutate()}
              disabled={!resolution.trim() || resolveMut.isPending}
              className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-[#1E3A8A] text-white text-sm font-medium hover:bg-[#1e3a8a]/90 transition-colors disabled:opacity-50"
            >
              {resolveMut.isPending
                ? <Loader2 size={14} className="animate-spin" />
                : <CheckCircle size={14} />}
              Resolve Dispute
            </button>
            <button
              onClick={onClose}
              className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminDisputesPage() {
  const [filter,       setFilter]       = useState('OPEN');
  const [activeDispute, setActiveDispute] = useState<Dispute | null>(null);

  const { data, isLoading } = useQuery<DisputesResponse>({
    queryKey: ['admin-disputes'],
    queryFn: () => api.get('/admin/disputes').then((r) => r.data),
  });

  const disputes = (data?.data ?? []).filter(
    (d) => filter === 'ALL' || d.status === filter,
  );

  const columns: Column<Dispute>[] = [
    {
      key: 'loadId',
      header: 'Load',
      render: (_, d) => (
        <div>
          <p className="text-sm font-medium text-gray-900 font-mono">
            {d.load?.shortId ?? d.loadId}
          </p>
          {d.load && (
            <p className="text-xs text-gray-400 mt-0.5">
              {d.load.origin} → {d.load.destination}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (_, d) => (
        <p className="text-xs text-gray-600 max-w-xs truncate">{d.description}</p>
      ),
    },
    {
      key: 'raisedBy' as keyof Dispute,
      header: 'Raised By',
      render: (_, d) => (
        <div>
          <p className="text-xs font-medium text-gray-800">{d.raisedBy?.name ?? '—'}</p>
          {d.raisedBy?.phone && (
            <p className="text-xs text-gray-400 mt-0.5">{d.raisedBy.phone}</p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (_, d) => (
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', statusBadge(d.status))}>
          {d.status.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Opened',
      sortable: true,
      render: (_, d) => (
        <span className="text-xs text-gray-500">{formatDate(d.createdAt)}</span>
      ),
    },
    {
      key: 'id',
      header: 'Action',
      render: (_, d) => (
        <button
          onClick={(e) => { e.stopPropagation(); setActiveDispute(d); }}
          className="text-xs font-medium text-[#1E3A8A] hover:underline px-2 py-1 rounded hover:bg-blue-50 transition-colors"
        >
          {d.status === 'RESOLVED' || d.status === 'CLOSED' ? 'View' : 'Resolve'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Disputes</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Review and resolve shipper-transporter disputes.
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap items-center">
        {STATUS_FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              'px-3 h-8 rounded-lg text-xs font-medium transition-colors',
              filter === tab.value
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
            )}
          >
            {tab.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400">
          {disputes.length} dispute{disputes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Data table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {disputes.length === 0 && !isLoading ? (
          <div className="py-14 text-center">
            <FileText className="mx-auto text-gray-300 mb-3" size={36} />
            <p className="text-sm font-medium text-gray-500">
              No {filter !== 'ALL' ? filter.toLowerCase().replace('_', ' ') : ''} disputes
            </p>
          </div>
        ) : (
          <DataTable<Dispute>
            columns={columns}
            data={disputes}
            keyField="id"
            loading={isLoading}
            emptyMessage="No disputes found."
            onRowClick={(d) => setActiveDispute(d)}
          />
        )}
      </div>

      {/* Resolve / View modal */}
      <Modal
        isOpen={!!activeDispute}
        onClose={() => setActiveDispute(null)}
        title={
          activeDispute?.status === 'RESOLVED' || activeDispute?.status === 'CLOSED'
            ? 'Dispute Details'
            : 'Resolve Dispute'
        }
        size="md"
      >
        {activeDispute && (
          <ResolveModal
            dispute={activeDispute}
            onClose={() => setActiveDispute(null)}
          />
        )}
      </Modal>
    </div>
  );
}
