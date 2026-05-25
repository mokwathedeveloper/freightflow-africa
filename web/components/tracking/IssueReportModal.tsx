'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IssueReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string) => void;
  isPending?: boolean;
  /** Short identifier shown in the modal header (e.g. load shortId) */
  loadRef?: string;
}

const MIN_LENGTH = 20;

const IssueReportModal: React.FC<IssueReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isPending = false,
  loadRef,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus textarea when modal opens; reset text when closed
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    } else {
      setText('');
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const charCount = text.trim().length;
  const isValid = charCount >= MIN_LENGTH;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="issue-modal-title"
    >
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle size={15} className="text-red-500" />
            </div>
            <div>
              <h3 id="issue-modal-title" className="text-sm font-semibold text-gray-900">
                Report an Issue
              </h3>
              {loadRef && (
                <p className="text-[11px] text-gray-400 font-mono">{loadRef}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            aria-label="Close modal"
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          <p className="text-sm text-gray-500">
            Describe the issue with this shipment. Be as specific as possible — our team will review
            your report and contact you shortly.
          </p>

          <div>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Goods arrived damaged, wrong items delivered, significant delay without notice…"
              rows={4}
              disabled={isPending}
              aria-label="Issue description"
              aria-describedby="issue-char-hint"
              className={cn(
                'ff-input h-auto resize-none py-2.5 transition-colors',
                !isValid && text.length > 0 && 'ff-input-error',
              )}
            />
            <div id="issue-char-hint" className="flex items-center justify-between mt-1.5">
              <p className={cn(
                'text-[11px]',
                !isValid && charCount > 0 ? 'text-red-500' : 'text-gray-400',
              )}>
                {!isValid && charCount > 0
                  ? `${MIN_LENGTH - charCount} more characters required`
                  : 'Minimum 20 characters'}
              </p>
              <p className="text-[11px] text-gray-300 tabular-nums">{charCount}</p>
            </div>
          </div>

          {/* Suggestion chips */}
          <div className="flex flex-wrap gap-1.5" aria-label="Common issue suggestions">
            {[
              'Goods damaged',
              'Wrong items',
              'Late delivery',
              'Missing items',
              'No contact from transporter',
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setText((t) => (t ? `${t.trimEnd()}. ${chip}` : chip))}
                disabled={isPending}
                className="text-[11px] px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 h-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-white transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={() => isValid && onSubmit(text.trim())}
            disabled={!isValid || isPending}
            aria-disabled={!isValid || isPending}
            className="flex-1 h-9 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
          >
            {isPending
              ? <><Loader2 size={14} className="animate-spin" /> Submitting…</>
              : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueReportModal;
