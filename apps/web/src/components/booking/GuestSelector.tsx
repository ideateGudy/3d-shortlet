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
    <div className="glass-panel rounded-glass-sm p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-wide uppercase text-white/80">
          Guests
        </span>
        <span className="text-[11px] text-brand-gold">
          {totalGuests} / {maxGuests} Max Capacity
        </span>
      </div>

      <div className="space-y-3">
        {/* Adults row */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium">Adults</div>
            <div className="text-[10px] text-white/50">Age 13+</div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={adults <= 1}
              onClick={() => updateAdults(-1)}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              −
            </button>
            <span className="w-5 text-center text-xs font-bold">{adults}</span>
            <button
              type="button"
              disabled={!canAdd}
              onClick={() => updateAdults(1)}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              +
            </button>
          </div>
        </div>

        {/* Children row */}
        <div className="flex items-center justify-between border-t border-white/5 pt-2">
          <div>
            <div className="text-xs font-medium">Children</div>
            <div className="text-[10px] text-white/50">Ages 2–12</div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={childrenCount <= 0}
              onClick={() => updateChildren(-1)}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              −
            </button>
            <span className="w-5 text-center text-xs font-bold">{childrenCount}</span>
            <button
              type="button"
              disabled={!canAdd}
              onClick={() => updateChildren(1)}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
