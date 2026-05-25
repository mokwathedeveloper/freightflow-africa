'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText, Upload, CheckCircle, Clock, AlertCircle, XCircle,
  Download, ChevronDown, ChevronUp, Info, File, Trash2, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/store/toast.store';
import api from '@/lib/api';
import Modal from '@/components/Modal/Modal';
import ConfirmModal from '@/components/modals/ConfirmModal';
import FilterDropdown, { FilterOption } from '@/components/Filters/FilterDropdown';
import type { Document, DocStatus, DocType } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const DOC_TYPE_LABELS: Record<DocType, string> = {
  COMMERCIAL_INVOICE: 'Commercial Invoice',
  PACKING_LIST: 'Packing List',
  BILL_OF_LADING: 'Bill of Lading',
  CUSTOMS_DECLARATION: 'Customs Declaration',
  OTHER: 'Other',
};

const DOC_TYPE_VALUES: DocType[] = [
  'COMMERCIAL_INVOICE',
  'PACKING_LIST',
  'BILL_OF_LADING',
  'CUSTOMS_DECLARATION',
  'OTHER',
];

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'REJECTED', label: 'Rejected' },
];

const TYPE_OPTIONS: FilterOption[] = [
  { value: 'ALL', label: 'All Types' },
  ...DOC_TYPE_VALUES.map((v) => ({ value: v, label: DOC_TYPE_LABELS[v] })),
];

const STATUS_STYLES: Record<DocStatus, { label: string; icon: React.ElementType; classes: string }> = {
  VERIFIED:     { label: 'Verified',     icon: CheckCircle, classes: 'bg-green-50 text-green-700 border-green-200' },
  UNDER_REVIEW: { label: 'Under Review', icon: Clock,       classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  PENDING:      { label: 'Pending',      icon: Clock,       classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  REJECTED:     { label: 'Rejected',     icon: XCircle,     classes: 'bg-red-50 text-red-700 border-red-200' },
};

const GUIDELINES: { corridor: string; items: string[] }[] = [
  {
    corridor: 'Kenya → Uganda (Northern Corridor)',
    items: [
      'Commercial Invoice (3 copies, original signatures)',
      'Packing List with HS codes',
      'Certificate of Origin (if applicable)',
      'EAC Customs Form C17',
      'Transit Bond Document',
    ],
  },
  {
    corridor: 'Kenya → Tanzania',
    items: [
      'Commercial Invoice (2 copies)',
      'Packing List',
      'Import Permit from TRA',
      'SGS/PVOC Inspection Certificate',
      'KEBS Quality Mark (if applicable)',
    ],
  },
  {
    corridor: 'Kenya → Rwanda / DRC',
    items: [
      'All EAC standard documents',
      'Phytosanitary Certificate (agricultural cargo)',
      'COMESA Certificate of Origin',
      'Yellow Fever Certificate (for crew)',
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DocStatus }) {
  const { label, icon: Icon, classes } = STATUS_STYLES[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', classes)}>
      <Icon size={12} />
      {label}
    </span>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ShipperDocumentsPage() {
  const qc = useQueryClient();
  const { addToast } = useToastStore();
  const fileRef = useRef<HTMLInputElement>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Upload form state
  const [selectedType, setSelectedType] = useState<DocType | ''>('');
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');

  // UI state
  const [guideOpen, setGuideOpen] = useState(false);
  const [openCorridor, setOpenCorridor] = useState<string | null>(null);
  const [detailDoc, setDetailDoc] = useState<Document | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<Document | null>(null);

  // Row highlight on status change
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const prevStatuses = useRef<Map<string, DocStatus>>(new Map());

  // ─── Data fetching ───────────────────────────────────────────────────────
  const { data, isLoading } = useQuery<{ success: boolean; data: Document[] }>({
    queryKey: ['documents'],
    queryFn: () => api.get('/documents').then((r) => r.data),
    refetchInterval: 30_000,
  });

  const docs = data?.data ?? [];

  // Detect status changes and highlight rows
  useEffect(() => {
    const newlyChanged = new Set<string>();
    docs.forEach((doc) => {
      const prev = prevStatuses.current.get(doc.id);
      if (prev && prev !== doc.status) newlyChanged.add(doc.id);
      prevStatuses.current.set(doc.id, doc.status);
    });
    if (newlyChanged.size > 0) {
      setHighlighted((h) => new Set([...h, ...newlyChanged]));
      const timer = setTimeout(
        () => setHighlighted((h) => { const n = new Set(h); newlyChanged.forEach((id) => n.delete(id)); return n; }),
        2500,
      );
      return () => clearTimeout(timer);
    }
  }, [docs]);

  const filtered = docs.filter((d) => {
    if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && d.type !== typeFilter) return false;
    return true;
  });

  // ─── Upload mutation ─────────────────────────────────────────────────────
  const uploadMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: DocType }) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', type);
      return api.post('/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      addToast('success', 'Document uploaded successfully');
      setUploadedFile(null);
      setSelectedType('');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Upload failed';
      addToast('error', msg);
    },
  });

  // ─── Delete mutation ─────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/documents/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      addToast('success', 'Document deleted');
      setDeleteDoc(null);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Delete failed';
      addToast('error', msg);
    },
  });

  // ─── File handling ───────────────────────────────────────────────────────
  const validateFile = useCallback((file: File): string => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) return 'Only PDF, JPG, or PNG files are accepted.';
    if (file.size > 5 * 1024 * 1024) return 'File size must be under 5MB.';
    return '';
  }, []);

  function handleFile(file: File | null) {
    if (!file) return;
    const err = validateFile(file);
    if (err) { setFileError(err); return; }
    setFileError('');
    setUploadedFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0] ?? null);
  }

  function handleUpload() {
    if (!uploadedFile || !selectedType) return;
    uploadMutation.mutate({ file: uploadedFile, type: selectedType as DocType });
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Cross-Border Documentation</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Upload and manage customs documents for your cross-border shipments
          </p>
        </div>
        <button
          onClick={() => setGuideOpen((o) => !o)}
          className="inline-flex items-center gap-2 px-4 h-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
        >
          <Info size={14} />
          Guidelines
          {guideOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Guidelines panel */}
      {guideOpen && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <h3 className="font-semibold text-[#1E3A8A] mb-4 flex items-center gap-2">
            <Info size={15} /> Document Requirements by Border Crossing
          </h3>
          <div className="space-y-3">
            {GUIDELINES.map(({ corridor, items }) => (
              <div key={corridor} className="bg-white rounded-lg border border-blue-100 overflow-hidden">
                <button
                  onClick={() => setOpenCorridor(openCorridor === corridor ? null : corridor)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  {corridor}
                  {openCorridor === corridor ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {openCorridor === corridor && (
                  <ul className="px-4 pb-4 space-y-1.5 border-t border-blue-50">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600 pt-2">
                        <span className="mt-1.5 w-1.5 h-1.5 bg-[#1E3A8A] rounded-full shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload + History grid */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* Upload panel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Upload Document</h3>

          <div>
            <label htmlFor="docType" className="ff-label">Document Type</label>
            <select
              id="docType"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as DocType | '')}
              className="ff-input"
            >
              <option value="">Select document type</option>
              {DOC_TYPE_VALUES.map((t) => (
                <option key={t} value={t}>{DOC_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-colors',
              dragOver
                ? 'border-[#1E3A8A] bg-blue-50'
                : fileError
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50',
            )}
            role="button"
            aria-label="Click or drag to upload document"
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
            {uploadedFile ? (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                <File size={18} className="text-[#1E3A8A] shrink-0" />
                <span className="font-medium truncate max-w-[160px]">{uploadedFile.name}</span>
                <span className="text-gray-400 text-xs shrink-0">{formatBytes(uploadedFile.size)}</span>
              </div>
            ) : (
              <>
                <Upload size={24} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Drop file here or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG · Max 5MB</p>
              </>
            )}
          </div>

          {fileError && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle size={14} className="shrink-0" />
              {fileError}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!uploadedFile || !selectedType || uploadMutation.isPending}
            className="btn-primary w-full h-10"
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>

        {/* History table */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <h3 className="font-semibold text-gray-900">
              Submission History
              {filtered.length > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400">({filtered.length})</span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              <FilterDropdown
                label="All Statuses"
                options={STATUS_OPTIONS}
                selected={statusFilter}
                onChange={setStatusFilter}
              />
              <FilterDropdown
                label="All Types"
                options={TYPE_OPTIONS}
                selected={typeFilter}
                onChange={setTypeFilter}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="divide-y divide-gray-100">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="px-5 py-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                      <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                    </div>
                    <div className="h-6 w-20 bg-gray-100 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <FileText size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">
                {docs.length === 0 ? 'No documents uploaded' : 'No documents match filters'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {docs.length === 0
                  ? 'Upload your customs documents for cross-border shipments.'
                  : 'Try adjusting the status or type filter.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    'px-5 py-4 space-y-2 transition-colors duration-700',
                    highlighted.has(doc.id) && 'bg-amber-50',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <FileText size={14} className="text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {DOC_TYPE_LABELS[doc.type]}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {doc.fileName} · {formatBytes(doc.fileSize)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <StatusBadge status={doc.status} />
                      <button
                        onClick={() => setDetailDoc(doc)}
                        aria-label="View document details"
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#1E3A8A] hover:bg-blue-50 transition-colors"
                      >
                        <Eye size={13} />
                      </button>
                      <a
                        href={doc.fileUrl}
                        download={doc.fileName}
                        aria-label="Download document"
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Download size={13} />
                      </a>
                      {doc.status !== 'VERIFIED' && (
                        <button
                          onClick={() => setDeleteDoc(doc)}
                          aria-label="Delete document"
                          className="w-7 h-7 rounded-lg border border-red-100 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {doc.status === 'REJECTED' && doc.rejectNote && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                      <AlertCircle size={13} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-700 leading-relaxed">{doc.rejectNote}</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-400">
                    Uploaded {new Date(doc.createdAt).toLocaleDateString('en-KE', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document detail modal */}
      <Modal
        isOpen={!!detailDoc}
        onClose={() => setDetailDoc(null)}
        title="Document Details"
        size="sm"
      >
        {detailDoc && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-gray-500" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{DOC_TYPE_LABELS[detailDoc.type]}</p>
                <p className="text-sm text-gray-500 truncate">{detailDoc.fileName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <StatusBadge status={detailDoc.status} />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">File Size</p>
                <p className="font-medium text-gray-900">{formatBytes(detailDoc.fileSize)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Uploaded</p>
                <p className="font-medium text-gray-900">
                  {new Date(detailDoc.createdAt).toLocaleDateString('en-KE', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Format</p>
                <p className="font-medium text-gray-900">{detailDoc.mimeType.split('/')[1].toUpperCase()}</p>
              </div>
            </div>

            {detailDoc.status === 'REJECTED' && detailDoc.rejectNote && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason</p>
                <p className="text-sm text-red-700">{detailDoc.rejectNote}</p>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <a
                href={detailDoc.fileUrl}
                download={detailDoc.fileName}
                className="btn-primary flex-1 h-9 text-sm inline-flex items-center justify-center gap-2"
              >
                <Download size={14} /> Download
              </a>
              <button
                onClick={() => setDetailDoc(null)}
                className="flex-1 h-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={!!deleteDoc}
        onClose={() => setDeleteDoc(null)}
        title="Delete Document"
        description={deleteDoc ? `Are you sure you want to delete "${deleteDoc.fileName}"? This action cannot be undone.` : undefined}
        confirmLabel="Delete"
        isDangerous
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteDoc && deleteMutation.mutate(deleteDoc.id)}
      />
    </div>
  );
}
