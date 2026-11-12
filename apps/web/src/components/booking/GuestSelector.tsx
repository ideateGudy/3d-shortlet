'use client';

import React from 'react';

interface GuestSelectorProps {
  adults: number;
  childrenCount: number;
  maxGuests: number;
  onChange: (counts: { adults: number; children: number }) => void;
}

export function GuestSelector({
  adults,
  childrenCount,
  maxGuests,
  onChange,
}: GuestSelectorProps) {
  const totalGuests = adults + childrenCount;
  const canAdd = totalGuests < maxGuests;

  const updateAdults = (delta: number) => {
    const next = adults + delta;
    if (next < 1) return;
    if (delta > 0 && !canAdd) return;
    onChange({ adults: next, children: childrenCount });
  };

  const updateChildren = (delta: number) => {
    const next = childrenCount + delta;
    if (next < 0) return;
    if (delta > 0 && !canAdd) return;
    onChange({ adults, children: next });
  };

  return (
    <div className="glass-panel rounded-glass-sm p-4 text-[var(--text-primary)]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-wide uppercase text-[var(--text-secondary)]">
          Guests
        </span>
        <span className="text-[11px] text-brand-gold font-medium">
          {totalGuests} / {maxGuests} Max Capacity
        </span>
      </div>

      <div className="space-y-3">
        {/* Adults row */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium">Adults</div>
            <div className="text-[10px] text-[var(--text-muted)]">Age 13+</div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={adults <= 1}
              onClick={() => updateAdults(-1)}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-sm text-[var(--text-primary)]"
            >
              −
            </button>
            <span className="w-5 text-center text-xs font-bold text-[var(--text-primary)]">{adults}</span>
            <button
              type="button"
              disabled={!canAdd}
              onClick={() => updateAdults(1)}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-sm text-[var(--text-primary)]"
            >
              +
            </button>
          </div>
        </div>

        {/* Children row */}
        <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10">
          <div>
            <div className="text-xs font-medium">Children</div>
            <div className="text-[10px] text-[var(--text-muted)]">Ages 2–12</div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={childrenCount <= 0}
              onClick={() => updateChildren(-1)}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-sm text-[var(--text-primary)]"
            >
              −
            </button>
            <span className="w-5 text-center text-xs font-bold text-[var(--text-primary)]">{childrenCount}</span>
            <button
              type="button"
              disabled={!canAdd}
              onClick={() => updateChildren(1)}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-sm text-[var(--text-primary)]"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
