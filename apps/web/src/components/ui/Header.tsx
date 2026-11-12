'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '@/lib/store/useThemeStore';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { Sun, Moon, Home } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+2348000000000';
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const { currency, toggleCurrency, mounted: currencyMounted } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';

  return (
    <header className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="glass-panel rounded-full px-5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4 sm:gap-6 max-w-5xl w-full pointer-events-auto shadow-2xl">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-gold shadow-glow group-hover:scale-125 transition-transform" />
          <span className="text-sm font-black tracking-widest text-[var(--text-primary)] uppercase">
            LODGR <span className="text-brand-gold font-light">3D</span>
          </span>
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-3 sm:gap-5 text-[11px] font-semibold tracking-wider uppercase">
          <Link
            href="/"
            className={`transition-colors hover:text-brand-gold ${
              pathname === '/' ? 'text-brand-gold font-bold' : 'text-[var(--text-secondary)]'
            }`}
          >
            Journey
          </Link>
          <Link
            href="/properties"
            className={`transition-colors hover:text-brand-gold ${
              pathname.startsWith('/properties') ? 'text-brand-gold font-bold' : 'text-[var(--text-secondary)]'
            }`}
          >
            Stays
          </Link>
          <Link
            href="/host"
            className={`hidden sm:block transition-colors hover:text-brand-gold ${
              pathname.startsWith('/host') ? 'text-brand-gold font-bold' : 'text-[var(--text-secondary)]'
            }`}
          >
            Be a Host
          </Link>
          <Link
            href="/admin"
            className={`transition-colors hover:text-brand-gold ${
              pathname.startsWith('/admin') ? 'text-brand-gold font-bold' : 'text-[var(--text-secondary)]'
            }`}
          >
            Console
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Currency Toggle */}
          {mounted && (
            <button
              onClick={toggleCurrency}
              aria-label="Toggle currency"
              className="px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider border border-brand-gold/40 hover:border-brand-gold text-brand-gold hover:bg-brand-gold/10 transition-all"
            >
              {currency === 'USD' ? '$ USD' : '₦ NGN'}
            </button>
          )}

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[var(--text-primary)] transition-all duration-300 group"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-brand-gold group-hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-brand-gold group-hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>
          )}

          {/* WhatsApp concierge */}
          <a
            href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello! I'd like to book a luxury shortlet via Lodgr 3D.`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-gold text-black text-[11px] font-bold tracking-wide hover:bg-white transition-all shadow-glow"
          >
            <span>Concierge</span>
            <span className="text-xs">↗</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
