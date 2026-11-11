'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+1234567890';

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="glass-panel rounded-full px-6 py-3 flex items-center justify-between gap-8 max-w-4xl w-full pointer-events-auto shadow-2xl">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-gold shadow-glow group-hover:scale-125 transition-transform" />
          <span className="text-sm font-bold tracking-widest text-white uppercase">
            AURA <span className="text-brand-gold font-light">3D</span>
          </span>
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-6 text-xs font-medium tracking-wider uppercase">
          <Link
            href="/"
            className={`transition-colors hover:text-brand-gold ${
              pathname === '/' ? 'text-brand-gold' : 'text-white/70'
            }`}
          >
            Journey
          </Link>
          <Link
            href="/properties"
            className={`transition-colors hover:text-brand-gold ${
              pathname.startsWith('/properties') ? 'text-brand-gold' : 'text-white/70'
            }`}
          >
            Properties
          </Link>
          <Link
            href="/admin"
            className={`transition-colors hover:text-brand-gold ${
              pathname.startsWith('/admin') ? 'text-brand-gold' : 'text-white/70'
            }`}
          >
            Admin
          </Link>
        </div>

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
      </nav>
    </header>
  );
}
