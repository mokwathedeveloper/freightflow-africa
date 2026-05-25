'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selected: string;
  onChange: (value: string) => void;
  /** Optional extra className for the trigger button */
  className?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  selected,
  onChange,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o); }
  }

  const selectedLabel = options.find((o) => o.value === selected)?.label ?? label;

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex items-center gap-2 h-8 px-3 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 transition-colors',
          open && 'border-[#1E3A8A]/40 ring-1 ring-[#1E3A8A]/20',
          className,
        )}
      >
        {selectedLabel}
        <ChevronDown
          size={13}
          className={cn('text-gray-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute left-0 top-full mt-1 z-30 min-w-[10rem] bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-sm"
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={selected === opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { onChange(opt.value); setOpen(false); }
              }}
              tabIndex={0}
              className={cn(
                'flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 outline-none transition-colors',
                selected === opt.value && 'text-[#1E3A8A] font-semibold',
              )}
            >
              {opt.label}
              {selected === opt.value && <Check size={13} className="text-[#1E3A8A]" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FilterDropdown;
