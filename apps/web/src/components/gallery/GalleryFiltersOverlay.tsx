'use client';

import React, { useState } from 'react';

interface GalleryFiltersOverlayProps {
  onFilterChange: (filters: {
    location?: string;
    maxPrice?: number;
    bedrooms?: number;
    guests?: number;
  }) => void;
  totalResults: number;
}

export function GalleryFiltersOverlay({
  onFilterChange,
  totalResults,
}: GalleryFiltersOverlayProps) {
  const [location, setLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState(4000);
  const [bedrooms, setBedrooms] = useState(0);
  const [guests, setGuests] = useState(0);

  const applyFilters = (
    newLoc = location,
    newPrice = maxPrice,
    newBeds = bedrooms,
    newGuests = guests
  ) => {
    onFilterChange({
      location: newLoc || undefined,
      maxPrice: newPrice || undefined,
      bedrooms: newBeds > 0 ? newBeds : undefined,
      guests: newGuests > 0 ? newGuests : undefined,
    });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocation(val);
    applyFilters(val, maxPrice, bedrooms, guests);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setMaxPrice(val);
    applyFilters(location, val, bedrooms, guests);
  };

  const handleBedroomsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    setBedrooms(val);
    applyFilters(location, maxPrice, val, guests);
  };

  const handleGuestsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    setGuests(val);
    applyFilters(location, maxPrice, bedrooms, val);
  };

  const resetFilters = () => {
    setLocation('');
    setMaxPrice(4000);
    setBedrooms(0);
    setGuests(0);
    applyFilters('', 4000, 0, 0);
  };

  return (
    <div className="fixed top-24 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
      <div className="glass-panel rounded-glass-md p-3 sm:p-4 max-w-4xl w-full pointer-events-auto flex flex-wrap items-center justify-between gap-3 shadow-2xl">
        {/* Search location */}
        <div className="flex-1 min-w-[160px]">
          <input
            type="text"
            placeholder="Search location..."
            value={location}
            onChange={handleLocationChange}
            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-brand-gold/60 transition-colors"
          />
        </div>

        {/* Max price slider */}
        <div className="flex items-center gap-2.5 min-w-[170px]">
          <span className="text-[11px] text-[var(--text-secondary)]">Max:</span>
          <input
            type="range"
            min={1000}
            max={5000}
            step={250}
            value={maxPrice}
            onChange={handlePriceChange}
            className="w-24 accent-brand-gold cursor-pointer"
          />
          <span className="text-xs font-semibold text-brand-gold">
            ${maxPrice.toLocaleString()}
          </span>
        </div>

        {/* Bedrooms dropdown */}
        <select
          value={bedrooms}
          onChange={handleBedroomsChange}
          className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-brand-gold/60 cursor-pointer"
        >
          <option value={0} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">All Bedrooms</option>
          <option value={2} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">2+ Bedrooms</option>
          <option value={3} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">3+ Bedrooms</option>
          <option value={4} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">4+ Bedrooms</option>
          <option value={5} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">5+ Bedrooms</option>
        </select>

        {/* Guests dropdown */}
        <select
          value={guests}
          onChange={handleGuestsChange}
          className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-brand-gold/60 cursor-pointer"
        >
          <option value={0} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">All Guests</option>
          <option value={2} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">2+ Guests</option>
          <option value={4} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">4+ Guests</option>
          <option value={6} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">6+ Guests</option>
          <option value={8} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">8+ Guests</option>
        </select>

        {/* Result counter & reset */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold text-brand-gold">
            {totalResults} {totalResults === 1 ? 'Residence' : 'Residences'}
          </span>
          {(location || maxPrice < 4000 || bedrooms > 0 || guests > 0) && (
            <button
              onClick={resetFilters}
              className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
