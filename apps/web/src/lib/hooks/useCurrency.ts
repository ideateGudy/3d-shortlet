'use client';

import { useState, useEffect } from 'react';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';

/**
 * Hook to safely access formatted currency without Next.js SSR hydration mismatch.
 * Before mounting on client, always formats in default USD matching SSR.
 * Once mounted on client, reacts to persisted user preference (NGN/USD).
 */
export function useCurrency() {
  const [mounted, setMounted] = useState(false);
  const currency = useCurrencyStore((s) => s.currency);
  const toggleCurrency = useCurrencyStore((s) => s.toggleCurrency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const rawFormat = useCurrencyStore((s) => s.format);

  useEffect(() => {
    setMounted(true);
  }, []);

  const format = (usdAmount: number) => {
    if (!mounted) {
      // During SSR and initial client hydration pass, render USD default
      return `$${usdAmount.toLocaleString('en-US')}`;
    }
    return rawFormat(usdAmount);
  };

  return {
    mounted,
    currency: mounted ? currency : 'USD',
    toggleCurrency,
    setCurrency,
    format,
  };
}
