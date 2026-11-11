'use client';

import React, { useState, useEffect } from 'react';
import { GalleryFiltersOverlay } from '@/components/gallery/GalleryFiltersOverlay';
import type { Property } from '@shortlet/shared';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
            tagLine: 'Ultra-luxurious high-rise sanctuary',
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
            tagLine: 'Sculpted cliffside estate',
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
            tagLine: 'Minimalist cedar timber pavilion',
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
            tagLine: 'Mid-century glass pavilion',
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

  const handleFilterChange = (filters: {
    location?: string;
    maxPrice?: number;
    bedrooms?: number;
    guests?: number;
  }) => {
    let result = [...properties];

    if (filters.location) {
      const q = filters.location.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.tagLine.toLowerCase().includes(q)
      );
    }
    if (filters.maxPrice) {
      result = result.filter((p) => p.pricePerNight <= (filters.maxPrice as number));
    }
    if (filters.bedrooms) {
      result = result.filter((p) => p.bedrooms >= (filters.bedrooms as number));
    }
    if (filters.guests) {
      result = result.filter((p) => p.maxGuests >= (filters.guests as number));
    }

    setFilteredProperties(result);
  };

  return (
    <div className="relative min-h-screen">
      {/* Interactive Filter Bar */}
      <GalleryFiltersOverlay
        onFilterChange={handleFilterChange}
        totalResults={filteredProperties.length}
      />

      {/* Floating Spatial Instructions */}
      <div className="fixed bottom-8 left-0 right-0 z-20 flex justify-center pointer-events-none">
        <div className="glass-panel rounded-full px-5 py-2 text-[11px] text-white/70 tracking-widest uppercase flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
          <span>Drag or hover portals to aim • Click to fly inside</span>
        </div>
      </div>
    </div>
  );
}
