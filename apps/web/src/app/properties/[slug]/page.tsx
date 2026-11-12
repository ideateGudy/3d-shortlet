'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usePropertyViewStore } from '@/lib/store/usePropertyViewStore';
import { SectionRail } from '@/components/ui/SectionRail';
import { BookingModal } from '@/components/booking/BookingModal';
import type { Property } from '@shortlet/shared';

export default function PropertyDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const activeSectionIndex = usePropertyViewStore((s) => s.activeSectionIndex);
  const setActiveSectionIndex = usePropertyViewStore((s) => s.setActiveSectionIndex);

  useEffect(() => {
    async function fetchProperty() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/properties/${slug}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setProperty(data);
        usePropertyViewStore.getState().setProperty(data);
      } catch {
        // Fallback property data if API not reachable
        const fallback: Property = {
          id: 'prop-1',
          slug: slug || 'obsidian-penthouse',
          title: slug === 'azure-cliffside-villa' ? 'Azure Cliffside Villa' : 'The Obsidian Penthouse',
          tagLine: 'Ultra-luxurious architectural sanctuary',
          description:
            'Suspended 60 storeys above the vibrant city lights, this estate embodies contemporary dark-glass architecture with monolithic Italian marble, bespoke acoustic isolation, and an unobstructed 360-degree skyline horizon.',
          location: 'Manhattan Sky District, NY',
          bedrooms: 4,
          bathrooms: 5,
          maxGuests: 8,
          pricePerNight: 2850,
          cleaningFee: 350,
          minNights: 2,
          maxNights: 14,
          rules: 'No smoking, private cocktail events permitted upon prior concierge approval.',
          isFeatured: true,
          amenities: [
            { id: '1', propertyId: 'prop-1', name: 'Private Helipad Access', icon: 'plane' },
            { id: '2', propertyId: 'prop-1', name: '360° Skyline Terrace', icon: 'compass' },
            { id: '3', propertyId: 'prop-1', name: 'Private Sommelier Wine Cellar', icon: 'wine' },
            { id: '4', propertyId: 'prop-1', name: 'Private Wellness Spa & Sauna', icon: 'flame' },
          ],
          sections: [
            {
              id: 'sec-1',
              propertyId: 'prop-1',
              name: 'Exterior Arrival',
              order: 0,
              type: 'PANORAMA',
              imageUrl: `/placeholders/${slug || 'obsidian-penthouse'}-arrival.jpg`,
              hotspots: [
                {
                  id: 'hs-1',
                  targetSectionId: 'sec-2',
                  label: 'Enter Residence',
                  position: [0.8, -0.1, -0.6],
                },
              ],
            },
            {
              id: 'sec-2',
              propertyId: 'prop-1',
              name: 'Living Room',
              order: 1,
              type: 'PANORAMA',
              imageUrl: `/placeholders/${slug || 'obsidian-penthouse'}-living.jpg`,
              hotspots: [
                {
                  id: 'hs-2',
                  targetSectionId: 'sec-3',
                  label: 'Master Suite',
                  position: [-0.85, 0.05, -0.5],
                },
                {
                  id: 'hs-3',
                  targetSectionId: 'sec-4',
                  label: 'Skyline Terrace',
                  position: [0.0, 0.0, 1.0],
                },
              ],
            },
            {
              id: 'sec-3',
              propertyId: 'prop-1',
              name: 'Master Bedroom',
              order: 2,
              type: 'PANORAMA',
              imageUrl: `/placeholders/${slug || 'obsidian-penthouse'}-bedroom.jpg`,
              hotspots: [
                {
                  id: 'hs-4',
                  targetSectionId: 'sec-2',
                  label: 'Return to Living Room',
                  position: [0, 0, -1],
                },
              ],
            },
            {
              id: 'sec-4',
              propertyId: 'prop-1',
              name: 'Skyline Terrace',
              order: 3,
              type: 'PANORAMA',
              imageUrl: `/placeholders/${slug || 'obsidian-penthouse'}-terrace.jpg`,
              hotspots: [
                {
                  id: 'hs-5',
                  targetSectionId: 'sec-2',
                  label: 'Return to Living Room',
                  position: [0, 0, -1],
                },
              ],
            },
          ],
        };
        setProperty(fallback);
        usePropertyViewStore.getState().setProperty(fallback);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchProperty();
    }
  }, [slug]);

  if (loading || !property) {
    return (
      <div className="fixed inset-0 flex items-center justify-center text-white/50 text-xs">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-brand-gold animate-ping" />
          <span>Entering 3D Space...</span>
        </div>
      </div>
    );
  }

  const sections = property.sections || [];
  const currentSection = sections[activeSectionIndex];

  return (
    <div className="relative min-h-screen">
      {/* Top Left: Property Title Glass Card */}
      <div className="fixed top-24 left-4 sm:left-6 z-30 pointer-events-auto max-w-sm sm:max-w-md max-h-[calc(100vh-140px)] flex flex-col">
        <div className="glass-panel rounded-glass-md p-5 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold">
              {property.location}
            </span>
            <span className="text-xs text-white/50">
              {property.bedrooms} Bed • {property.bathrooms} Bath • Max {property.maxGuests} Guests
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            {property.title}
          </h1>

          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
            <div>
              <span className="text-xs text-white/60">From </span>
              <span className="text-lg font-bold text-white">
                ${property.pricePerNight.toLocaleString()}
              </span>
              <span className="text-[11px] text-white/50"> / night</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white transition-colors"
              >
                {showDetails ? 'Hide Info' : 'Details'}
              </button>
              <button
                type="button"
                onClick={() => setIsBookingOpen(true)}
                className="px-4 py-1.5 rounded-full bg-brand-gold hover:bg-white text-black text-xs font-bold uppercase tracking-wider transition-all shadow-glow"
              >
                Book Now
              </button>
            </div>
          </div>

          {/* Expanded details panel */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/80 space-y-3 max-h-60 overflow-y-auto pr-1">
              <p className="leading-relaxed">{property.description}</p>

              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-gold mb-1.5">
                    Curated Amenities
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {property.amenities.map((am) => (
                      <div
                        key={am.id || am.name}
                        className="flex items-center gap-2 text-white/70"
                      >
                        <span className="text-brand-gold text-[10px]">✦</span>
                        <span>{am.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {property.rules && (
                <div className="text-[11px] text-white/50 border-t border-white/5 pt-2">
                  <strong>House Rules:</strong> {property.rules}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top Right: Spatial Interaction HUD */}
      <div className="fixed top-24 right-6 z-30 pointer-events-none hidden md:block">
        <div className="glass-panel rounded-full px-4 py-2 text-[10px] text-white/70 tracking-widest uppercase flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Drag to look around • Click hotspots to travel</span>
        </div>
      </div>

      {/* Bottom Section Rail */}
      <SectionRail
        sections={sections}
        activeIndex={activeSectionIndex}
        onSelect={(idx) => setActiveSectionIndex(idx)}
      />

      {/* 3D Booking Modal & Calendar (Camera glides to VANTAGE) */}
      <BookingModal
        property={property}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
}
