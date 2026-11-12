'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { Shield, Zap, Star, TrendingUp, Home, ArrowRight, CheckCircle2 } from 'lucide-react';

const BENEFITS = [
  {
    icon: <Shield className="w-6 h-6 text-emerald-400" />,
    title: 'Verified Guests Only',
    desc: 'Every guest is identity-verified before booking. Your property is protected with our guest vetting system.',
  },
  {
    icon: <Zap className="w-6 h-6 text-brand-gold" />,
    title: 'Instant Payouts',
    desc: 'Earnings hit your bank account within 24 hours of check-in. Zero payment delays, full transparency.',
  },
  {
    icon: <Star className="w-6 h-6 text-blue-400" />,
    title: '24/7 Host Support',
    desc: 'Dedicated concierge support for you and your guests at any time. We handle disputes, maintenance requests, and more.',
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-purple-400" />,
    title: 'Damage Protection',
    desc: 'Refundable caution deposits collected from every guest, automatically held until check-out inspection.',
  },
];

const STEPS = [
  { step: '01', title: 'List Your Property', desc: 'Add your space with photos, amenities, and pricing in minutes.' },
  { step: '02', title: '3D Virtual Tour', desc: 'Upload 360° panoramic room photos so guests can inspect virtually before booking.' },
  { step: '03', title: 'Set Your Rules', desc: 'Define check-in time, caution deposit, cleaning fee, and house rules.' },
  { step: '04', title: 'Earn & Grow', desc: 'Receive bookings, track earnings, and manage your calendar from the Host Console.' },
];

export default function HostPage() {
  const { format } = useCurrency();
  const [nights, setNights] = useState(15);
  const [nightlyRate, setNightlyRate] = useState(300);
  const estimatedEarnings = nights * nightlyRate * 0.9; // 10% platform fee

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-16">

        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 glass-panel rounded-full px-4 py-2 text-[11px] font-bold tracking-widest text-brand-gold uppercase border border-brand-gold/30">
            <Home className="w-3.5 h-3.5" />
            Become a Lodgr 3D Host
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
            Turn Your Luxury Property<br />
            <span className="text-brand-gold">Into Steady Income</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            Join Nigeria's most premium shortlet marketplace. List your Lekki villa, Ikoyi apartment, Maitama residence, or international escape — and earn from verified guests who can virtually inspect every room before booking.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/admin"
              className="px-8 py-3.5 rounded-full bg-brand-gold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black text-sm font-black uppercase tracking-wider transition-all shadow-glow flex items-center gap-2"
            >
              <span>Launch Host Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={`https://wa.me/2348000000000?text=${encodeURIComponent('Hi! I want to list my property on Lodgr 3D. Can you help?')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-full glass-panel border border-emerald-500/40 text-emerald-500 text-sm font-bold uppercase tracking-wider hover:bg-emerald-500/10 transition-all"
            >
              💬 Talk to Us on WhatsApp
            </a>
          </div>
        </div>

        {/* Earnings Calculator */}
        <div className="glass-panel rounded-glass-lg p-6 sm:p-8 border border-black/10 dark:border-white/10 shadow-2xl">
          <h2 className="text-xl font-black text-[var(--text-primary)] mb-6">
            💰 Estimate Your Monthly Earnings
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                  Nights per Month: <span className="text-brand-gold font-bold">{nights}</span>
                </label>
                <input
                  type="range" min={5} max={30} value={nights}
                  onChange={(e) => setNights(Number(e.target.value))}
                  className="w-full accent-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                  Nightly Rate (USD): <span className="text-brand-gold font-bold">${nightlyRate}</span>
                </label>
                <input
                  type="range" min={50} max={3000} step={50} value={nightlyRate}
                  onChange={(e) => setNightlyRate(Number(e.target.value))}
                  className="w-full accent-[#D4AF37]"
                />
              </div>
            </div>
            <div className="glass-panel rounded-glass-md p-6 border border-brand-gold/20 flex flex-col justify-center text-center">
              <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Estimated Monthly Earnings</div>
              <div className="text-4xl font-black text-brand-gold">{format(estimatedEarnings)}</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-2">After 10% platform fee · {nights} nights · {format(nightlyRate)}/night</div>
              <div className="mt-4 text-[10px] text-emerald-500">
                ✓ Payouts in NGN or USD · No hidden charges
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div>
          <h2 className="text-2xl font-black text-[var(--text-primary)] mb-6 text-center">Why Host on Lodgr 3D?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="glass-panel rounded-glass-md p-5 border border-black/10 dark:border-white/10 hover:border-brand-gold/40 transition-colors">
                <div className="mb-3">{b.icon}</div>
                <h3 className="text-sm font-black text-[var(--text-primary)] mb-1.5">{b.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div>
          <h2 className="text-2xl font-black text-[var(--text-primary)] mb-6 text-center">How It Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s) => (
              <div key={s.step} className="glass-panel rounded-glass-md p-5 border border-black/10 dark:border-white/10 text-center space-y-2">
                <div className="text-3xl font-black text-brand-gold/40">{s.step}</div>
                <h3 className="text-sm font-black text-[var(--text-primary)]">{s.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="glass-panel rounded-glass-lg p-6 border border-brand-gold/20">
          <h2 className="text-lg font-black text-[var(--text-primary)] mb-4">What You'll Need to Get Started</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              'Valid property ownership or tenancy documents',
              'Government-issued host ID (NIN, passport)',
              'High-quality photos of each room (we support 360° panoramas)',
              'Bank account for Naira payouts',
              'WhatsApp number for guest communication',
              'Property location with Lagos / Abuja neighborhood details',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">Ready to Start Earning?</h2>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-brand-gold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black text-sm font-black uppercase tracking-wider transition-all shadow-glow"
          >
            Open Host Console
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
