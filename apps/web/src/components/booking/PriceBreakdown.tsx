'use client';

import React from 'react';

interface PriceBreakdownProps {
  pricePerNight: number;
  cleaningFee: number;
  checkIn: string | null;
  checkOut: string | null;
}

export function PriceBreakdown({
  pricePerNight,
  cleaningFee,
  checkIn,
  checkOut,
}: PriceBreakdownProps) {
  if (!checkIn || !checkOut) {
    return (
      <div className="glass-panel rounded-glass-sm p-4 text-center text-xs text-[var(--text-muted)]">
        Select check-in and check-out dates to view price breakdown.
      </div>
    );
  }

  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const nights = Math.max(
    1,
    Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 3600 * 24))
  );

  const accommodationTotal = nights * pricePerNight;
  const grandTotal = accommodationTotal + cleaningFee;

  return (
    <div className="glass-panel rounded-glass-sm p-4 text-[var(--text-primary)] text-xs space-y-2">
      <div className="flex items-center justify-between text-[var(--text-secondary)]">
        <span>
          ${pricePerNight.toLocaleString()} × {nights} {nights === 1 ? 'night' : 'nights'}
        </span>
        <span>${accommodationTotal.toLocaleString()}</span>
      </div>

      {cleaningFee > 0 && (
        <div className="flex items-center justify-between text-[var(--text-secondary)]">
          <span>Cleaning & Sanitize Fee</span>
          <span>${cleaningFee.toLocaleString()}</span>
        </div>
      )}

      <div className="border-t border-black/10 dark:border-white/10 pt-2.5 flex items-center justify-between font-semibold text-sm text-[var(--text-primary)]">
        <span>Total (excl. local tax)</span>
        <span className="text-brand-gold text-base">${grandTotal.toLocaleString()}</span>
      </div>
    </div>
  );
}
