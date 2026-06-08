import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IoChevronDown, IoClose } from 'react-icons/io5';
import { BET_FILTER_OPTIONS } from '../../utils/betCategory';

function BetTypeFilters({ value = ['all'], onChange, counts = {} }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selected = useMemo(() => {
    const list = Array.isArray(value) ? value : value ? [value] : ['all'];
    if (list.includes('all') || !list.length) return ['all'];
    return list.filter((k) => k !== 'all');
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('touchstart', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const toggleKey = (key) => {
    if (key === 'all') {
      onChange(['all']);
      return;
    }
    let next = selected.includes('all') ? [] : [...selected];
    if (next.includes(key)) {
      next = next.filter((k) => k !== key);
    } else {
      next = [...next, key];
    }
    onChange(next.length ? next : ['all']);
  };

  const selectAllTypes = () => onChange(['all']);

  const summaryLabel = useMemo(() => {
    if (selected.includes('all') || selected.length === 0) {
      return 'All bet types';
    }
    if (selected.length === 1) {
      const opt = BET_FILTER_OPTIONS.find((o) => o.key === selected[0]);
      return opt?.label || 'Filtered';
    }
    return `${selected.length} types selected`;
  }, [selected]);

  const selectedCount = selected.includes('all') ? 0 : selected.length;

  return (
    <div ref={rootRef} className="relative w-full py-2 z-20">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="w-full flex items-center justify-between gap-2 min-h-[44px] px-3 py-2.5 rounded-lg border border-gray-600 bg-[#262c32] text-left text-sm text-white touch-manipulation"
      >
        <span className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
            Bet type
          </span>
          <span className="truncate font-medium text-[13px]">{summaryLabel}</span>
        </span>
        <IoChevronDown
          className={`shrink-0 text-lg text-gray-400 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[30] sm:hidden"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            role="listbox"
            aria-multiselectable="true"
            className="z-[40] flex flex-col overflow-hidden border border-gray-600 bg-[#1b1f23] shadow-xl
              fixed inset-x-0 bottom-0 max-h-[75vh] rounded-t-xl
              sm:absolute sm:inset-x-auto sm:left-0 sm:right-0 sm:bottom-auto sm:top-full sm:mt-1 sm:w-full sm:max-h-[min(70vh,320px)] sm:rounded-lg"
          >
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-700 sm:hidden">
              <span className="text-sm font-semibold text-white">Filter bet types</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 -mr-1 text-gray-400 touch-manipulation"
                aria-label="Close"
              >
                <IoClose className="text-xl" />
              </button>
            </div>

            <div className="overflow-y-auto overscroll-contain flex-1 p-2 space-y-0.5">
              {BET_FILTER_OPTIONS.map(({ key, label }) => {
                const isAll = key === 'all';
                const checked = isAll
                  ? selected.includes('all') || selected.length === 0
                  : selected.includes(key);
                const count = counts[key];

                return (
                  <label
                    key={key}
                    className={`flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-md cursor-pointer touch-manipulation select-none ${
                      checked ? 'bg-[#17934e]/20' : 'hover:bg-[#262c32]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleKey(key)}
                      className="w-4 h-4 shrink-0 accent-[#17934e]"
                    />
                    <span className="flex-1 text-sm text-gray-100">{label}</span>
                    {typeof count === 'number' && (
                      <span className="text-xs text-gray-500 tabular-nums">{count}</span>
                    )}
                  </label>
                );
              })}
            </div>

            <div className="flex gap-2 p-2 border-t border-gray-700 bg-[#141515] safe-area-pb">
              <button
                type="button"
                onClick={selectAllTypes}
                className="flex-1 min-h-[44px] px-3 py-2 text-xs font-semibold rounded-md border border-gray-600 text-gray-200 touch-manipulation"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 min-h-[44px] px-3 py-2 text-xs font-semibold rounded-md bg-[#17934e] text-white touch-manipulation"
              >
                Apply{selectedCount > 0 ? ` (${selectedCount})` : ''}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default BetTypeFilters;
