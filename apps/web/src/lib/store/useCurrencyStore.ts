'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Currency = 'USD' | 'NGN';

interface CurrencyStore {
  currency: Currency;
  rate: number; // 1 USD = N NGN
  toggleCurrency: () => void;
  setCurrency: (c: Currency) => void;
  format: (usdAmount: number) => string;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: 'USD',
      rate: 1550,
      toggleCurrency: () =>
        set((s) => ({ currency: s.currency === 'USD' ? 'NGN' : 'USD' })),
      setCurrency: (c) => set({ currency: c }),
      format: (usdAmount: number) => {
        const { currency, rate } = get();
        if (currency === 'NGN') {
          const ngn = Math.round(usdAmount * rate);
          return `₦${ngn.toLocaleString('en-NG')}`;
        }
        return `$${usdAmount.toLocaleString('en-US')}`;
      },
    }),
    { name: 'lodgr-currency' }
  )
);
