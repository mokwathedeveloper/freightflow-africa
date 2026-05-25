'use client';

import React, { useState } from 'react';
import { ChevronDown, Globe, Phone, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LoadStatus, StatusLog } from '@/types';

export interface TimelineStep {
  key: string;
  label: string;
}

interface ProgressTimelineProps {
  steps: TimelineStep[];
  currentStatus: LoadStatus;
  timestamps: Record<string, string | undefined>;
  statusLogs?: StatusLog[];
  formatDateTime: (ts: string) => string;
}

function ChannelBadge({ channel }: { channel: 'WEB' | 'USSD' | 'SYSTEM' }) {
  if (channel === 'USSD') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        <Phone size={8} /> USSD
      </span>
    );
  }
  if (channel === 'WEB') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 text-[#1E3A8A] border border-blue-200">
        <Globe size={8} /> Web
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
      <Cpu size={8} /> System
    </span>
  );
}

const ProgressTimeline: React.FC<ProgressTimelineProps> = ({
  steps,
  currentStatus,
  timestamps,
  statusLogs,
  formatDateTime,
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const stepIndex = steps.findIndex((s) => s.key === currentStatus);

  const logsByStatus = React.useMemo(() => {
    if (!statusLogs) return {} as Record<string, StatusLog[]>;
    return statusLogs.reduce<Record<string, StatusLog[]>>((acc, log) => {
      if (!acc[log.status]) acc[log.status] = [];
      acc[log.status].push(log);
      return acc;
    }, {});
  }, [statusLogs]);

  return (
    <div>
      {/* Horizontal progress bar */}
      <div className="relative mb-6">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1E3A8A] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${(Math.max(stepIndex, 0) / (steps.length - 1)) * 100}%` }}
          />
        </div>
        <div className="flex justify-between -mt-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-3.5 h-3.5 rounded-full border-2 relative z-10 transition-all duration-300',
                i <= stepIndex
                  ? 'bg-[#1E3A8A] border-[#1E3A8A]'
                  : 'bg-white border-gray-300',
              )}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1.5 px-0.5">
          {steps.map((step, i) => (
            <span
              key={step.key}
              className={cn(
                'text-[9px] font-medium hidden sm:block',
                i <= stepIndex ? 'text-[#1E3A8A]' : 'text-gray-300',
              )}
              style={{ width: `${100 / steps.length}%`, textAlign: 'center' }}
            >
              {step.label.split(' ')[0]}
            </span>
          ))}
        </div>
      </div>

      {/* Vertical timeline */}
      <div className="space-y-0">
        {steps.map((step, i) => {
          const done = i <= stepIndex;
          const current = i === stepIndex;
          const ts = timestamps[step.key];
          const logs = logsByStatus[step.key] ?? [];
          const hasLogs = logs.length > 0;
          const isExpanded = expanded === step.key;

          return (
            <div key={step.key} className="flex gap-4">
              {/* Left connector */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300',
                    done && !current
                      ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white'
                      : current
                        ? 'bg-white border-[#1E3A8A] text-[#1E3A8A] ring-2 ring-[#1E3A8A]/20'
                        : 'bg-white border-gray-200 text-gray-300',
                  )}
                  aria-label={done ? `${step.label} completed` : step.label}
                >
                  {done && !current ? '✓' : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-0.5 flex-1 min-h-[32px] transition-colors duration-300',
                      i < stepIndex ? 'bg-[#1E3A8A]' : 'bg-gray-100',
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className="pb-5 pt-0.5 flex-1 min-w-0">
                <button
                  className={cn(
                    'w-full text-left',
                    hasLogs ? 'cursor-pointer' : 'cursor-default',
                  )}
                  onClick={() => hasLogs && setExpanded(isExpanded ? null : step.key)}
                  aria-expanded={isExpanded}
                  disabled={!hasLogs}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={cn(
                        'text-sm font-medium transition-colors',
                        current
                          ? 'text-[#1E3A8A]'
                          : done
                            ? 'text-gray-900'
                            : 'text-gray-400',
                      )}
                    >
                      {step.label}
                    </p>
                    {current && (
                      <span className="text-[10px] bg-[#1E3A8A] text-white px-2 py-0.5 rounded-full font-semibold shrink-0">
                        Current
                      </span>
                    )}
                    {hasLogs && (
                      <ChevronDown
                        size={13}
                        className={cn(
                          'ml-auto text-gray-400 transition-transform duration-200 shrink-0',
                          isExpanded && 'rotate-180',
                        )}
                      />
                    )}
                  </div>
                  {ts && (
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(ts)}</p>
                  )}
                </button>

                {/* Expandable log entries */}
                {isExpanded && hasLogs && (
                  <div className="mt-2 space-y-2" role="list" aria-label={`${step.label} activity logs`}>
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        role="listitem"
                        className="flex items-start gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2"
                      >
                        <ChannelBadge channel={log.channel} />
                        <div className="flex-1 min-w-0">
                          {log.note && (
                            <p className="text-xs text-gray-700 leading-relaxed">{log.note}</p>
                          )}
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {formatDateTime(log.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTimeline;
