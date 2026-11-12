'use client';

import React from 'react';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { Info } from 'lucide-react';

interface PriceBreakdownProps {
  pricePerNight: number;
  cleaningFee: number;
  cautionDeposit?: number;
  checkIn: string | null;
  checkOut: string | null;
}

export function PriceBreakdown({
  pricePerNight,
  cleaningFee,
  cautionDeposit = 0,
  checkIn,
  checkOut,
}: PriceBreakdownProps) {
  const format = useCurrencyStore((s) => s.format);

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
  const serviceFee = Math.round(accommodationTotal * 0.05 * 100) / 100;
  const grandTotal = accommodationTotal + cleaningFee + serviceFee + cautionDeposit;

  return (
    <div className="glass-panel rounded-glass-sm p-4 text-[var(--text-primary)] text-xs space-y-2.5 border border-black/10 dark:border-white/10">
      {/* Nightly Rate */}
      <div className="flex items-center justify-between text-[var(--text-secondary)]">
        <span>
          {format(pricePerNight)} × {nights} {nights === 1 ? 'night' : 'nights'}
        </span>
        <span>{format(accommodationTotal)}</span>
      </div>

      {/* Cleaning Fee */}
      {cleaningFee > 0 && (
        <div className="flex items-center justify-between text-[var(--text-secondary)]">
          <span>Cleaning & Sanitize Fee</span>
          <span>{format(cleaningFee)}</span>
        </div>
      )}

      {/* Service Fee */}
      <div className="flex items-center justify-between text-[var(--text-secondary)]">
        <span>Lodgr Service Fee (5%)</span>
        <span>{format(serviceFee)}</span>
      </div>

      {/* Caution Deposit */}
      {cautionDeposit > 0 && (
        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
          <div className="flex items-center gap-1.5">
            <span>Refundable Caution Deposit</span>
            <div className="relative group">
              <Info className="w-3 h-3 cursor-help" />
              <div className="absolute left-4 bottom-0 w-44 bg-black/90 text-white text-[10px] rounded-lg p-2 leading-snug opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Fully refunded within 48hrs after check-out inspection, subject to no damage.
              </div>
            </div>
          </div>
          <span>{format(cautionDeposit)}</span>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-black/10 dark:border-white/10 pt-2.5 flex items-center justify-between font-semibold text-sm text-[var(--text-primary)]">
        <span>Total (excl. local tax)</span>
        <span className="text-brand-gold text-base">{format(grandTotal)}</span>
      </div>

      {cautionDeposit > 0 && (
        <p className="text-[10px] text-[var(--text-muted)] leading-snug">
          Excl. refundable deposit of {format(cautionDeposit)} shown above.{' '}
          <span className="text-[var(--text-secondary)]">Net stay cost: {format(grandTotal - cautionDeposit)}</span>
        </p>
      )}
    </div>
  );
}
