'use client';

import { useState, useRef } from 'react';
import {
  FileText, Upload, CheckCircle, Clock, AlertCircle, XCircle,
  Download, ChevronDown, ChevronUp, Info, File,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
type DocStatus = 'PENDING' | 'UNDER REVIEW' | 'VERIFIED' | 'REJECTED';

interface DocRecord {
  id: string;
  type: string;
  filename: string;
  uploadedAt: string;
  status: DocStatus;
  rejectionReason?: string;
}

// ─── Static data (demo) ───────────────────────────────────────────────────────
const REQUIRED_TYPES = [
  'Commercial Invoice',
  'Packing List',
  'Bill of Lading',
  'Customs Declaration',
];

const HISTORY: DocRecord[] = [
  {
    id: 'd1',
    type: 'Commercial Invoice',
    filename: 'invoice_march2026.pdf',
    uploadedAt: '2026-03-12',
    status: 'VERIFIED',
  },
  {
    id: 'd2',
    type: 'Packing List',
    filename: 'packing_list_v2.pdf',
    uploadedAt: '2026-03-12',
    status: 'VERIFIED',
  },
  {
    id: 'd3',
    type: 'Customs Declaration',
    filename: 'customs_form_jan.pdf',
    uploadedAt: '2026-01-28',
    status: 'REJECTED',
    rejectionReason: 'Signature missing on page 3. Please re-submit with all pages signed.',
  },
  {
    id: 'd4',
    type: 'Bill of Lading',
    filename: 'bol_feb_nairobi.pdf',
    uploadedAt: '2026-02-15',
    status: 'UNDER REVIEW',
  },
  {
    id: 'd5',
    type: 'Customs Declaration',
    filename: 'customs_updated.pdf',
    uploadedAt: '2026-03-20',
    status: 'PENDING',
  },
];

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

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_STYLES: Record<DocStatus, { label: string; icon: typeof CheckCircle; classes: string }> = {
  VERIFIED:     { label: 'Verified',     icon: CheckCircle,  classes: 'bg-green-50 text-green-700 border-green-200' },
  'UNDER REVIEW':{ label: 'Under Review', icon: Clock,        classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  PENDING:      { label: 'Pending',      icon: Clock,        classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  REJECTED:     { label: 'Rejected',     icon: XCircle,      classes: 'bg-red-50 text-red-700 border-red-200' },
};

function StatusBadge({ status }: { status: DocStatus }) {
  const { label, icon: Icon, classes } = STATUS_STYLES[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', classes)}>
      <Icon size={12} />
      {label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const [selectedType, setSelectedType] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [openCorridor, setOpenCorridor] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | null) {
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      alert('Only PDF, JPG, or PNG files are accepted.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB.');
      return;
    }
    setUploadedFile(file);
    setUploadSuccess(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0] ?? null);
  }

  async function handleUpload() {
    if (!uploadedFile || !selectedType) return;
    setUploading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setUploading(false);
    setUploadSuccess(true);
    setUploadedFile(null);
    setSelectedType('');
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Cross-Border Documentation</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Upload and manage customs documents for cross-border shipments
          </p>
        </div>
        <button
          onClick={() => setGuideOpen((o) => !o)}
          className="inline-flex items-center gap-2 px-4 h-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Info size={14} /> Document Guidelines
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

      {/* Upload area + history */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* Upload panel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Upload Document</h3>

          {/* Document type select */}
          <div>
            <label className="ff-label">Document Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="ff-input"
            >
              <option value="">Select document type</option>
              {REQUIRED_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
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
              dragOver ? 'border-[#1E3A8A] bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            )}
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
                <File size={18} className="text-[#1E3A8A]" />
                <span className="font-medium truncate max-w-[160px]">{uploadedFile.name}</span>
              </div>
            ) : (
              <>
                <Upload size={24} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Drop file here or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG · Max 5MB</p>
              </>
            )}
          </div>

          {uploadSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <CheckCircle size={14} /> Document uploaded successfully
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!uploadedFile || !selectedType || uploading}
            className="btn-primary w-full h-10"
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>

        {/* History table */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Submission History</h3>
          </div>

          {HISTORY.length === 0 ? (
            <div className="p-10 text-center">
              <FileText size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">No documents uploaded</p>
              <p className="text-xs text-gray-400 mt-1">Upload your customs documents for cross-border shipments.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {HISTORY.map((doc) => (
                <div key={doc.id} className="px-5 py-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <FileText size={14} className="text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.type}</p>
                        <p className="text-xs text-gray-400 truncate">{doc.filename}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={doc.status} />
                      <button
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                        title="Download"
                      >
                        <Download size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Rejection reason inline */}
                  {doc.status === 'REJECTED' && doc.rejectionReason && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                      <AlertCircle size={13} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-700 leading-relaxed">{doc.rejectionReason}</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-400">Uploaded {doc.uploadedAt}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
