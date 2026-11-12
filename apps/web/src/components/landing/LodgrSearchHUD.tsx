'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCameraStore } from '@/lib/store/useCameraStore';
import { Search, MapPin, Calendar, Users, Zap } from 'lucide-react';

const CITIES = [
  { label: 'All Destinations', value: '' },
  { label: '🇳🇬 Lagos — Lekki', value: 'Lagos' },
  { label: '🇳🇬 Lagos — Ikoyi', value: 'Lagos' },
  { label: '🇳🇬 Lagos — Victoria Island', value: 'Lagos' },
  { label: '🇳🇬 Abuja — Maitama', value: 'Abuja' },
  { label: '🌍 International Escapes', value: 'International' },
];

const TYPES = [
  { label: 'Any Type', value: '' },
  { label: 'Luxury Apartment', value: 'LUXURY_APARTMENT' },
  { label: 'Penthouse', value: 'PENTHOUSE' },
  { label: 'Waterfront Villa', value: 'WATERFRONT_VILLA' },
  { label: 'Boutique Shortlet', value: 'BOUTIQUE_SHORTLET' },
];

export function LodgrSearchHUD() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [flying, setFlying] = useState(false);

  const handleSearch = () => {
    if (flying) return;
    setFlying(true);
    useCameraStore.getState().setMode('GALLERY');

    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (category) params.set('category', category);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests > 1) params.set('guests', String(guests));

    setTimeout(() => {
      router.push(`/properties?${params.toString()}`);
    }, 600);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 pointer-events-auto">
      <div className="glass-panel rounded-glass-lg p-4 shadow-2xl backdrop-blur-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-brand-gold" />
          <span className="text-[11px] font-bold tracking-widest text-brand-gold uppercase">
            Find Your 3D Stay
          </span>
        </div>

        {/* Search Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {/* Where */}
          <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2.5 border border-black/10 dark:border-white/10 hover:border-brand-gold/50 transition-colors">
            <MapPin className="w-3.5 h-3.5 text-brand-gold shrink-0" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-transparent text-[var(--text-primary)] text-xs font-medium w-full outline-none cursor-pointer"
            >
              {CITIES.map((c) => (
                <option key={c.label} value={c.value} className="bg-[var(--bg-panel)]">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Stay Type */}
          <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2.5 border border-black/10 dark:border-white/10 hover:border-brand-gold/50 transition-colors">
            <span className="text-sm shrink-0">🏠</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-[var(--text-primary)] text-xs font-medium w-full outline-none cursor-pointer"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value} className="bg-[var(--bg-panel)]">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Check-in */}
          <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2.5 border border-black/10 dark:border-white/10 hover:border-brand-gold/50 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-brand-gold shrink-0" />
            <input
              type="date"
              value={checkIn}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setCheckIn(e.target.value)}
              placeholder="Check-in"
              className="bg-transparent text-[var(--text-primary)] text-xs font-medium w-full outline-none cursor-pointer"
            />
          </div>

          {/* Check-out */}
          <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2.5 border border-black/10 dark:border-white/10 hover:border-brand-gold/50 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
            <input
              type="date"
              value={checkOut}
              min={checkIn || new Date().toISOString().split('T')[0]}
              onChange={(e) => setCheckOut(e.target.value)}
              placeholder="Check-out"
              className="bg-transparent text-[var(--text-primary)] text-xs font-medium w-full outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Guests + Search Row */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2.5 border border-black/10 dark:border-white/10 flex-1">
            <Users className="w-3.5 h-3.5 text-brand-gold shrink-0" />
            <span className="text-xs text-[var(--text-secondary)] mr-auto">Guests</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                className="w-5 h-5 rounded-full bg-black/10 dark:bg-white/10 hover:bg-brand-gold/30 text-[var(--text-primary)] text-xs font-bold flex items-center justify-center transition-colors"
              >
                −
              </button>
              <span className="text-sm font-bold text-[var(--text-primary)] w-5 text-center">{guests}</span>
              <button
                onClick={() => setGuests((g) => Math.min(20, g + 1))}
                className="w-5 h-5 rounded-full bg-black/10 dark:bg-white/10 hover:bg-brand-gold/30 text-[var(--text-primary)] text-xs font-bold flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={flying}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black text-xs font-bold uppercase tracking-wider transition-all shadow-glow disabled:opacity-60"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{flying ? 'Flying...' : 'Search 3D Stays'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
