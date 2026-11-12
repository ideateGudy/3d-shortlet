'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Users, Bed, Bath, ArrowRight, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import type { Property } from '@shortlet/shared';
import { useCameraStore } from '@/lib/store/useCameraStore';

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [bedroomFilter, setBedroomFilter] = useState<number>(0);
  const [guestFilter, setGuestFilter] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(4000);

  // Flight transition state
  const [travelingSlug, setTravelingSlug] = useState<string | null>(null);

  useEffect(() => {
    // Ensure camera is in GALLERY mode
    useCameraStore.getState().setMode('GALLERY');

    async function loadProperties() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/properties`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setProperties(data);
        setFilteredProperties(data);
      } catch {
        // Fallback default sample properties
        const fallback: Property[] = [
          {
            id: '1',
            slug: 'obsidian-penthouse',
            title: 'The Obsidian Penthouse',
            tagLine: 'Ultra-luxurious high-rise sanctuary with skyline panoramic views',
            description: '',
            location: 'Manhattan, NY',
            bedrooms: 4,
            bathrooms: 5,
            maxGuests: 8,
            pricePerNight: 2850,
            cleaningFee: 350,
            minNights: 2,
            maxNights: 14,
            isFeatured: true,
          },
          {
            id: '2',
            slug: 'azure-cliffside-villa',
            title: 'Azure Cliffside Villa',
            tagLine: 'Sculpted cliffside estate with heated infinity pool overlooking the caldera',
            description: '',
            location: 'Santorini, Greece',
            bedrooms: 5,
            bathrooms: 6,
            maxGuests: 10,
            pricePerNight: 3400,
            cleaningFee: 400,
            minNights: 3,
            maxNights: 21,
            isFeatured: true,
          },
          {
            id: '3',
            slug: 'komorebi-forest-sanctuary',
            title: 'Komorebi Forest Sanctuary',
            tagLine: 'Minimalist cedar timber pavilion nestled in historic bamboo groves',
            description: '',
            location: 'Kyoto, Japan',
            bedrooms: 3,
            bathrooms: 3,
            maxGuests: 6,
            pricePerNight: 1950,
            cleaningFee: 250,
            minNights: 2,
            maxNights: 10,
            isFeatured: true,
          },
          {
            id: '4',
            slug: 'solis-desert-pavilion',
            title: 'Solis Desert Pavilion',
            tagLine: 'Mid-century glass pavilion framing dramatic monoliths and dark skies',
            description: '',
            location: 'Joshua Tree, CA',
            bedrooms: 3,
            bathrooms: 3,
            maxGuests: 6,
            pricePerNight: 1650,
            cleaningFee: 200,
            minNights: 2,
            maxNights: 14,
            isFeatured: false,
          },
        ];
        setProperties(fallback);
        setFilteredProperties(fallback);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, []);

  // Filter evaluation
  useEffect(() => {
    let result = [...properties];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.tagLine.toLowerCase().includes(q)
      );
    }

    if (bedroomFilter > 0) {
      result = result.filter((p) => p.bedrooms >= bedroomFilter);
    }

    if (guestFilter > 0) {
      result = result.filter((p) => p.maxGuests >= guestFilter);
    }

    result = result.filter((p) => p.pricePerNight <= maxPrice);

    setFilteredProperties(result);
  }, [searchQuery, bedroomFilter, guestFilter, maxPrice, properties]);

  const handleCardClick = (slug: string) => {
    if (travelingSlug) return;
    setTravelingSlug(slug);

    // Trigger high-speed cinematic 3D camera flight into the property
    useCameraStore.getState().flyTo(
      {
        position: [0, 1.6, -6],
        target: [0, 1.6, -25],
        fov: 52,
      },
      {
        duration: 0.85,
        fovPulse: 14,
        ease: 'power3.inOut',
        onComplete: () => {
          router.push(`/properties/${slug}`);
        },
      }
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setBedroomFilter(0);
    setGuestFilter(0);
    setMaxPrice(4000);
  };

  const isFiltered = Boolean(searchQuery || bedroomFilter > 0 || guestFilter > 0 || maxPrice < 4000);

  return (
    <div className="relative min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto pointer-events-auto">
      {/* Flight transition overlay */}
      {travelingSlug && (
        <div className="fixed inset-0 z-50 pointer-events-none bg-black/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
          <div className="glass-panel px-6 py-3 rounded-full text-brand-gold text-xs uppercase tracking-widest font-mono flex items-center gap-3 shadow-glow">
            <span className="w-2 h-2 rounded-full bg-brand-gold animate-ping" />
            <span>Entering 3D Residence...</span>
          </div>
        </div>
      )}

      {/* Top Section Header */}
      <div className="mb-8 sm:mb-12">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-brand-gold" />
          <span className="text-xs uppercase tracking-widest font-mono text-brand-gold">
            Curated Shortlet Collection
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight uppercase">
          Architectural Estates
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-2 max-w-2xl">
          Immersive residences engineered for luxury living. Select any sanctuary below to travel inside and explore in full 3D.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-glass-lg p-4 sm:p-6 mb-10 shadow-2xl border border-black/10 dark:border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Search Input */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search location or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs focus:outline-none focus:border-brand-gold transition-colors"
            />
          </div>

          {/* Bedrooms Dropdown */}
          <div className="relative">
            <Bed className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            <select
              value={bedroomFilter}
              onChange={(e) => setBedroomFilter(Number(e.target.value))}
              aria-label="Filter by bedrooms"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--text-primary)] text-xs focus:outline-none focus:border-brand-gold transition-colors appearance-none cursor-pointer"
            >
              <option value={0} className="bg-white dark:bg-black text-black dark:text-white">All Bedrooms</option>
              <option value={2} className="bg-white dark:bg-black text-black dark:text-white">2+ Bedrooms</option>
              <option value={3} className="bg-white dark:bg-black text-black dark:text-white">3+ Bedrooms</option>
              <option value={4} className="bg-white dark:bg-black text-black dark:text-white">4+ Bedrooms</option>
              <option value={5} className="bg-white dark:bg-black text-black dark:text-white">5+ Bedrooms</option>
            </select>
          </div>

          {/* Guests Dropdown */}
          <div className="relative">
            <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            <select
              value={guestFilter}
              onChange={(e) => setGuestFilter(Number(e.target.value))}
              aria-label="Filter by guests"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--text-primary)] text-xs focus:outline-none focus:border-brand-gold transition-colors appearance-none cursor-pointer"
            >
              <option value={0} className="bg-white dark:bg-black text-black dark:text-white">All Guests</option>
              <option value={2} className="bg-white dark:bg-black text-black dark:text-white">2+ Guests</option>
              <option value={4} className="bg-white dark:bg-black text-black dark:text-white">4+ Guests</option>
              <option value={6} className="bg-white dark:bg-black text-black dark:text-white">6+ Guests</option>
              <option value={8} className="bg-white dark:bg-black text-black dark:text-white">8+ Guests</option>
              <option value={10} className="bg-white dark:bg-black text-black dark:text-white">10+ Guests</option>
            </select>
          </div>

          {/* Max Price Slider */}
          <div className="flex flex-col justify-center px-1">
            <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] mb-1">
              <span>Max Price</span>
              <span className="font-mono text-brand-gold font-bold">${maxPrice}/night</span>
            </div>
            <input
              type="range"
              min={1000}
              max={5000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              aria-label="Max price per night"
              className="w-full accent-brand-gold cursor-pointer h-1.5 bg-black/10 dark:bg-white/20 rounded-lg"
            />
          </div>
        </div>

        {/* Filter results status row */}
        <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs">
          <div className="text-[var(--text-secondary)]">
            Showing <span className="text-[var(--text-primary)] font-bold">{filteredProperties.length}</span> of {properties.length} residences
          </div>
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="text-brand-gold hover:underline text-xs flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Property Cards Grid */}
      {filteredProperties.length === 0 ? (
        <div className="glass-panel rounded-glass-lg p-12 text-center text-[var(--text-secondary)]">
          <p className="text-base">No residences match your current search filters.</p>
          <button
            onClick={resetFilters}
            className="mt-4 px-5 py-2 rounded-full bg-brand-gold text-black text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProperties.map((p) => {
            const heroImage =
              p.sections?.[0]?.imageUrl ||
              `/placeholders/${p.slug}-living.jpg`;

            return (
              <div
                key={p.id}
                onClick={() => handleCardClick(p.slug)}
                className="group cursor-pointer glass-panel rounded-glass-lg overflow-hidden border border-black/10 dark:border-white/10 hover:border-brand-gold/60 transition-all duration-300 hover:shadow-glow flex flex-col"
              >
                {/* Image Cover Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-black/10 dark:bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroImage}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholders/azure-cliffside-villa-living.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="glass-panel px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-brand-gold uppercase backdrop-blur-md">
                      {p.isFeatured ? '★ FEATURED' : 'LUXURY STAY'}
                    </span>
                    <span className="glass-panel px-2.5 py-1 rounded-full text-[11px] text-white backdrop-blur-md font-mono">
                      ★ 4.96
                    </span>
                  </div>

                  {/* Bottom Image Overlay: Location */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white/95 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                    <span>{p.location}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-brand-gold transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1 leading-relaxed">
                      {p.tagLine}
                    </p>
                  </div>

                  {/* Specs row */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-black/10 dark:border-white/10 text-[var(--text-secondary)] text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Bed className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span>{p.bedrooms} Beds</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bath className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span>{p.bathrooms} Baths</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span>{p.maxGuests} Guests</span>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-xl font-bold text-[var(--text-primary)] font-mono">
                        ${p.pricePerNight}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]"> / night</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(p.slug);
                      }}
                      className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/10 group-hover:bg-brand-gold group-hover:text-black text-[var(--text-primary)] text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
