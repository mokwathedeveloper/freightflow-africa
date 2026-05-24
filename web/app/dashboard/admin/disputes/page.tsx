'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import api from '@/lib/api';
import { useToastStore } from '@/store/toast.store';

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

function statusColor(s: string) {
  if (s === 'OPEN')         return 'bg-red-50 text-red-700 border-red-200';
  if (s === 'UNDER_REVIEW') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (s === 'RESOLVED')     return 'bg-green-50 text-green-700 border-green-200';
  return 'bg-gray-100 text-gray-500 border-gray-200';
}

function DisputeRow({ dispute }: { dispute: Dispute }) {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [open, setOpen] = useState(false);
  const [resolution, setResolution] = useState('');
  const [finalStatus, setFinalStatus] = useState<string>('DELIVERED');

  const resolveMut = useMutation({
    mutationFn: () => api.patch(`/admin/disputes/${dispute.id}`, { resolution, finalStatus }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-disputes'] });
      addToast('success', 'Dispute resolved');
      setOpen(false);
    },
    onError: () => addToast('error', 'Failed to resolve dispute'),
  });

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-4 min-w-0">
          <AlertTriangle size={16} className={dispute.status === 'RESOLVED' ? 'text-green-500' : 'text-amber-500'} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {dispute.load?.shortId ?? dispute.loadId}
              {dispute.load && ` · ${dispute.load.origin} → ${dispute.load.destination}`}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{dispute.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', statusColor(dispute.status))}>
            {dispute.status.replace('_', ' ')}
          </span>
          <span className="text-xs text-gray-400">{formatDate(dispute.createdAt)}</span>
          {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
        </div>
      </div>

      {open && (
        <div className="px-5 pb-5 pt-0 border-t border-gray-100 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900 mb-1">Dispute Details</p>
            <p>{dispute.description}</p>
            {dispute.raisedBy && (
              <p className="mt-2 text-xs text-gray-500">Raised by: {dispute.raisedBy.name} ({dispute.raisedBy.phone})</p>
            )}
          </div>

          {dispute.status !== 'RESOLVED' && dispute.status !== 'CLOSED' && (
            <div className="space-y-3">
              <div>
                <label className="ff-label">Resolution Note</label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe the resolution..."
                  rows={3}
                  className="ff-input h-auto resize-none py-2.5"
                />
              </div>
              <div>
                <label className="ff-label">Final Load Status</label>
                <select value={finalStatus} onChange={(e) => setFinalStatus(e.target.value)} className="ff-input">
                  <option value="DELIVERED">Mark as Delivered</option>
                  <option value="CANCELLED">Mark as Cancelled</option>
                  <option value="DISPUTED">Keep as Disputed</option>
                </select>
              </div>
              <button
                onClick={() => resolveMut.mutate()}
                disabled={!resolution || resolveMut.isPending}
                className="btn-primary h-9 px-5 flex items-center gap-2"
              >
                {resolveMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Resolve Dispute
              </button>
            </div>
          )}

          {dispute.resolution && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
              <p className="font-medium mb-1">Resolution</p>
              <p>{dispute.resolution}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminDisputesPage() {
  const [filter, setFilter] = useState<string>('OPEN');

  const { data, isLoading } = useQuery<DisputesResponse>({
    queryKey: ['admin-disputes'],
    queryFn: () => api.get('/admin/disputes').then((r) => r.data),
  });

  const disputes = (data?.data ?? []).filter((d) => filter === 'ALL' || d.status === filter);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Disputes</h2>
        <p className="text-sm text-gray-500 mt-0.5">Review and resolve shipper-transporter disputes</p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'Open',        value: 'OPEN' },
          { label: 'Under Review', value: 'UNDER_REVIEW' },
          { label: 'Resolved',    value: 'RESOLVED' },
          { label: 'All',         value: 'ALL' },
        ].map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={cn('px-3 h-8 rounded-lg text-xs font-medium transition-colors', filter === f.value ? 'bg-[#1E3A8A] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')}>
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400 self-center">{disputes.length} dispute{disputes.length !== 1 ? 's' : ''}</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 px-5 py-4 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-2/3 mt-2" />
            </div>
          ))}
        </div>
      ) : disputes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-14 text-center">
          <CheckCircle className="mx-auto text-green-400 mb-3" size={36} />
          <p className="text-sm font-medium text-gray-500">No {filter !== 'ALL' ? filter.toLowerCase().replace('_', ' ') : ''} disputes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => <DisputeRow key={d.id} dispute={d} />)}
        </div>
      )}
    </div>
  );
}
