'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

type SortDir = 'asc' | 'desc' | null;

function DataTable<T>({
  columns,
  data,
  keyField,
  loading = false,
  emptyMessage = 'No records found.',
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  function handleSort(key: keyof T) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc'));
      if (sortDir === 'desc') setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = React.useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp =
        typeof av === 'string' && typeof bv === 'string'
          ? av.localeCompare(bv)
          : (av as number) > (bv as number)
          ? 1
          : (av as number) < (bv as number)
          ? -1
          : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  function SortIcon({ col }: { col: Column<T> }) {
    if (!col.sortable) return null;
    if (sortKey !== col.key) return <ChevronsUpDown size={13} className="text-gray-400 ml-1 shrink-0" />;
    if (sortDir === 'asc') return <ChevronUp size={13} className="text-[#1E3A8A] ml-1 shrink-0" />;
    return <ChevronDown size={13} className="text-[#1E3A8A] ml-1 shrink-0" />;
  }

  if (loading) {
    return (
      <div className="w-full overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="text-left px-4 py-3 text-xs font-semibold text-[#1E3A8A] uppercase tracking-wide"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!sorted.length) {
    return (
      <div className="py-14 text-center text-sm text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                onClick={() => col.sortable && handleSort(col.key)}
                className={cn(
                  'text-left px-4 py-3 text-xs font-semibold text-[#1E3A8A] uppercase tracking-wide whitespace-nowrap',
                  col.sortable && 'cursor-pointer select-none hover:bg-gray-100 transition-colors',
                  col.className,
                )}
              >
                <span className="inline-flex items-center">
                  {col.header}
                  <SortIcon col={col} />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map((row, idx) => (
            <tr
              key={String(row[keyField])}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'transition-colors',
                idx % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                onRowClick && 'cursor-pointer hover:bg-blue-50/40',
              )}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={cn('px-4 py-3 text-sm text-gray-700 whitespace-nowrap', col.className)}
                >
                  {col.render
                    ? col.render(row[col.key], row)
                    : String(row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
