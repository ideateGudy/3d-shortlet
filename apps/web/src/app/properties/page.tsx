'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Users, Bed, Bath, ArrowRight, Search, Zap, ShieldCheck, Wifi, ChefHat, Waves } from 'lucide-react';
import type { Property, PropertyCategory } from '@shortlet/shared';
import { useCameraStore } from '@/lib/store/useCameraStore';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';

const CITY_TABS = [
  { label: 'All Stays', value: '' },
  { label: '🇳🇬 Lagos', value: 'Lagos' },
  { label: '🇳🇬 Abuja', value: 'Abuja' },
  { label: '🌍 International', value: 'International' },
];

const CATEGORY_PILLS: { label: string; value: PropertyCategory | '' }[] = [
  { label: 'All Types', value: '' },
  { label: 'Luxury Apartment', value: 'LUXURY_APARTMENT' },
  { label: 'Penthouse', value: 'PENTHOUSE' },
  { label: 'Waterfront Villa', value: 'WATERFRONT_VILLA' },
  { label: 'Boutique Shortlet', value: 'BOUTIQUE_SHORTLET' },
];

const AMENITY_FILTERS = [
  { label: '🔋 24/7 Power', key: 'has247Power' },
  { label: '🏊 Pool', key: 'hasPool' },
  { label: '👮 Security', key: 'hasSecurity' },
  { label: '👨‍🍳 Chef Kitchen', key: 'hasChef' },
];

function AmenityBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full border border-black/5 dark:border-white/5">
      {icon}<span>{label}</span>
    </span>
  );
}

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [travelingSlug, setTravelingSlug] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [cityFilter, setCityFilter] = useState(searchParams.get('city') || '');
  const [categoryFilter, setCategoryFilter] = useState<PropertyCategory | ''>(
    (searchParams.get('category') as PropertyCategory) || ''
  );
  const [amenityFilters, setAmenityFilters] = useState<Record<string, boolean>>({});
  const [bedroomFilter, setBedroomFilter] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);

  const format = useCurrencyStore((s) => s.format);
  const currency = useCurrencyStore((s) => s.currency);

  useEffect(() => {
    useCameraStore.getState().setMode('GALLERY');
    async function load() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/properties`);
        if (!res.ok) throw new Error('Failed to fetch');
        setProperties(await res.json());
      } catch {
        setProperties(FALLBACK_PROPERTIES);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = properties.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !p.title.toLowerCase().includes(q) &&
        !p.location.toLowerCase().includes(q) &&
        !(p.city || '').toLowerCase().includes(q)
      )
        return false;
    }
    if (cityFilter) {
      if (cityFilter === 'International') {
        const intl = !['Lagos', 'Abuja'].includes(p.city || '');
        if (!intl) return false;
      } else {
        if ((p.city || '').toLowerCase() !== cityFilter.toLowerCase()) return false;
      }
    }
    if (categoryFilter && p.category && p.category !== categoryFilter) return false;
    if (amenityFilters.has247Power && !p.has247Power) return false;
    if (amenityFilters.hasPool && !p.hasPool) return false;
    if (amenityFilters.hasSecurity && !p.hasSecurity) return false;
    if (amenityFilters.hasChef && !p.hasChef) return false;
    if (bedroomFilter > 0 && p.bedrooms < bedroomFilter) return false;
    const priceUSD = p.pricePerNight;
    const maxUSD = currency === 'NGN' ? maxPrice / 1550 : maxPrice;
    if (priceUSD > maxUSD) return false;
    return true;
  });

  const toggleAmenity = (key: string) =>
    setAmenityFilters((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleCardClick = (slug: string) => {
    if (travelingSlug) return;
    setTravelingSlug(slug);
    useCameraStore.getState().setMode('IMMERSIVE');
    setTimeout(() => router.push(`/properties/${slug}`), 700);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight uppercase">
              Lodgr Stays
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {filtered.length} verified shortlet{filtered.length !== 1 ? 's' : ''} · 3D virtual inspection
            </p>
          </div>
          {/* Search bar */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city, property..."
              className="w-full pl-9 pr-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-brand-gold/50 transition-colors"
            />
          </div>
        </div>

        {/* City Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CITY_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setCityFilter(tab.value)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
                cityFilter === tab.value
                  ? 'bg-brand-gold text-black shadow-glow'
                  : 'glass-panel text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-black/10 dark:border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category + Amenity filters */}
        <div className="flex flex-wrap gap-2">
          {CATEGORY_PILLS.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategoryFilter(c.value)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border ${
                categoryFilter === c.value
                  ? 'bg-[var(--text-primary)] text-[var(--bg-base)] border-transparent'
                  : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-[var(--text-secondary)] hover:border-brand-gold/40'
              }`}
            >
              {c.label}
            </button>
          ))}

          <div className="w-px bg-black/10 dark:bg-white/10 mx-1" />

          {AMENITY_FILTERS.map((af) => (
            <button
              key={af.key}
              onClick={() => toggleAmenity(af.key)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border ${
                amenityFilters[af.key]
                  ? 'bg-brand-gold/20 border-brand-gold text-brand-gold'
                  : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-[var(--text-secondary)] hover:border-brand-gold/40'
              }`}
            >
              {af.label}
            </button>
          ))}

          {/* Bedrooms */}
          <div className="flex items-center gap-1 ml-auto">
            {[0, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setBedroomFilter(n)}
                className={`px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all border ${
                  bedroomFilter === n
                    ? 'bg-[var(--text-primary)] text-[var(--bg-base)] border-transparent'
                    : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-[var(--text-secondary)]'
                }`}
              >
                {n === 0 ? 'Any Beds' : `${n}+ Beds`}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-xs text-[var(--text-muted)]">
            <span className="w-2 h-2 rounded-full bg-brand-gold animate-ping" />
            Loading luxury stays…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[var(--text-muted)] text-sm">
            No stays match your filters. <button className="text-brand-gold underline" onClick={() => { setCityFilter(''); setCategoryFilter(''); setAmenityFilters({}); }}>Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => {
              const heroImage = p.sections?.[0]?.imageUrl || `/placeholders/${p.slug}-living.jpg`;
              const rating = p.rating ?? 4.96;
              const reviewCount = p.reviewCount ?? 0;
              const isTraveling = travelingSlug === p.slug;

              return (
                <div
                  key={p.id}
                  onClick={() => handleCardClick(p.slug)}
                  className={`group cursor-pointer glass-panel rounded-glass-lg overflow-hidden border border-black/10 dark:border-white/10 hover:border-brand-gold/60 transition-all duration-300 hover:shadow-glow flex flex-col ${isTraveling ? 'scale-95 opacity-60' : ''}`}
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-black/10 dark:bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={heroImage}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholders/azure-cliffside-villa-living.jpg'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="glass-panel px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest text-emerald-400 uppercase backdrop-blur-md border border-emerald-500/30">
                          🛡️ Verified by Lodgr
                        </span>
                        {p.hostIsSuperhost && (
                          <span className="glass-panel px-2.5 py-1 rounded-full text-[10px] font-bold text-brand-gold uppercase backdrop-blur-md border border-brand-gold/20">
                            ⭐ Superhost
                          </span>
                        )}
                      </div>
                      <span className="glass-panel px-2.5 py-1 rounded-full text-[11px] text-white backdrop-blur-md font-mono shrink-0">
                        ★ {rating.toFixed(2)}{reviewCount > 0 ? ` (${reviewCount})` : ''}
                      </span>
                    </div>

                    {/* Amenity micro-badges */}
                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                      {p.has247Power && (
                        <span className="text-[10px] bg-black/60 text-yellow-300 px-2 py-0.5 rounded-full backdrop-blur-sm font-semibold">🔋 24/7 Power</span>
                      )}
                      {p.hasPool && (
                        <span className="text-[10px] bg-black/60 text-blue-300 px-2 py-0.5 rounded-full backdrop-blur-sm font-semibold">🏊 Pool</span>
                      )}
                      {p.hasSecurity && (
                        <span className="text-[10px] bg-black/60 text-green-300 px-2 py-0.5 rounded-full backdrop-blur-sm font-semibold">👮 Security</span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] mb-1">
                        <MapPin className="w-3 h-3 text-brand-gold" />
                        <span>{p.neighborhood ? `${p.neighborhood}, ` : ''}{p.city || p.location}</span>
                      </div>
                      <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-brand-gold transition-colors leading-tight">
                        {p.title}
                      </h3>
                      <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">{p.tagLine}</p>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-3 gap-1.5 py-2.5 border-y border-black/10 dark:border-white/10 text-[var(--text-secondary)] text-[11px]">
                      <div className="flex items-center gap-1">
                        <Bed className="w-3 h-3 text-[var(--text-muted)]" />
                        <span>{p.bedrooms} Beds</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-3 h-3 text-[var(--text-muted)]" />
                        <span>{p.bathrooms} Baths</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-[var(--text-muted)]" />
                        <span>{p.maxGuests} Guests</span>
                      </div>
                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-black text-[var(--text-primary)] font-mono">
                          {format(p.pricePerNight)}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)]"> / night</span>
                        {p.cautionDeposit && p.cautionDeposit > 0 && (
                          <div className="text-[10px] text-emerald-500 mt-0.5">+ {format(p.cautionDeposit)} refundable deposit</div>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCardClick(p.slug); }}
                        className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/10 group-hover:bg-brand-gold group-hover:text-black text-[var(--text-primary)] text-[11px] font-bold tracking-wide uppercase transition-all flex items-center gap-1.5"
                      >
                        <span>Inspect 3D</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Fallback data
const FALLBACK_PROPERTIES: Property[] = [
  {
    id: '1', slug: 'obsidian-penthouse', title: 'The Obsidian Penthouse',
    tagLine: 'Ultra-luxurious high-rise with 360° skyline panoramic views',
    description: '', location: 'Manhattan, NY', city: 'New York', category: 'PENTHOUSE',
    bedrooms: 4, bathrooms: 5, maxGuests: 8, pricePerNight: 2850, cleaningFee: 350,
    minNights: 2, maxNights: 14, isFeatured: true, rating: 4.98, reviewCount: 42,
    has247Power: true, hasSecurity: true, hasPool: false,
  },
  {
    id: '2', slug: 'azure-cliffside-villa', title: 'Azure Cliffside Villa',
    tagLine: 'Sculpted cliffside estate with infinity pool over the caldera',
    description: '', location: 'Santorini, Greece', city: 'Santorini', category: 'WATERFRONT_VILLA',
    bedrooms: 5, bathrooms: 6, maxGuests: 10, pricePerNight: 3400, cleaningFee: 400,
    minNights: 3, maxNights: 21, isFeatured: true, rating: 4.97, reviewCount: 38,
    has247Power: false, hasSecurity: true, hasPool: true,
  },
];

export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center text-white/50 text-xs">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-brand-gold animate-ping" />
          <span>Loading Lodgr Stays…</span>
        </div>
      </div>
    }>
      <PropertiesContent />
    </Suspense>
  );
}
