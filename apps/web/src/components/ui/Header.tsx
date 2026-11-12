'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '@/lib/store/useThemeStore';
import { Sun, Moon } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+1234567890';
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';

  return (
    <header className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="glass-panel rounded-full px-5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4 sm:gap-8 max-w-4xl w-full pointer-events-auto shadow-2xl">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-gold shadow-glow group-hover:scale-125 transition-transform" />
          <span className="text-sm font-bold tracking-widest text-[var(--text-primary)] uppercase">
            AURA <span className="text-brand-gold font-light">3D</span>
          </span>
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs font-medium tracking-wider uppercase">
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
            Properties
          </Link>
          <Link
            href="/admin"
            className={`transition-colors hover:text-brand-gold ${
              pathname.startsWith('/admin') ? 'text-brand-gold font-bold' : 'text-[var(--text-secondary)]'
            }`}
          >
            Admin
          </Link>
        </div>

        {/* Right Actions: Theme Toggle & Concierge */}
        <div className="flex items-center gap-2.5">
          {/* Animated Theme Toggle Button */}
          {mounted && (
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
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
            href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello! I would like to inquire about a 3D Shortlet reservation.`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-gold text-black text-xs font-semibold tracking-wide hover:bg-white transition-all shadow-glow"
          >
            <span>Concierge</span>
            <span className="text-xs">↗</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
