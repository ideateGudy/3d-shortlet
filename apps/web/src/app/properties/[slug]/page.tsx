'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { usePropertyViewStore } from '@/lib/store/usePropertyViewStore';
import { SectionRail } from '@/components/ui/SectionRail';
import { BookingModal } from '@/components/booking/BookingModal';
import { useCurrency } from '@/lib/hooks/useCurrency';
import type { Property } from '@shortlet/shared';
import { MapPin, Star, ChevronLeft, MessageCircle, Zap, Shield, Waves, ChefHat, Wifi } from 'lucide-react';

type TabId = 'overview' | 'amenities' | 'reviews' | 'rules';

const REVIEW_DEFAULTS = [
  {
    name: 'Adaeze O.', avatar: '👩🏾', rating: 5,
    comment: 'Absolutely stunning! The 24/7 power and security gave us total peace of mind. Easily the best shortlet in Lagos.',
    stayDate: 'Oct 2026',
  },
  {
    name: 'Chukwuemeka B.', avatar: '👨🏿', rating: 5,
    comment: 'Incredible space. The panoramic views are even better in person. Host responded within minutes every time.',
    stayDate: 'Sep 2026',
  },
  {
    name: 'Fatima A.', avatar: '👩🏽', rating: 4,
    comment: 'Very luxurious and well-maintained. The virtual tour before booking was spot on — no surprises.',
    stayDate: 'Aug 2026',
  },
];

export default function PropertyDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const activeSectionIndex = usePropertyViewStore((s) => s.activeSectionIndex);
  const setActiveSectionIndex = usePropertyViewStore((s) => s.setActiveSectionIndex);
  const { format } = useCurrency();

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
        const fallback: Property = {
          id: 'prop-1', slug: slug || 'obsidian-penthouse',
          title: 'The Obsidian Penthouse', tagLine: 'Ultra-luxurious architectural sanctuary',
          description: 'Suspended 60 storeys above the city, this estate embodies contemporary dark-glass architecture with monolithic Italian marble, acoustic isolation, and 360° skyline horizon.',
          location: 'Manhattan Sky District, NY', city: 'New York', neighborhood: 'Midtown',
          category: 'PENTHOUSE', bedrooms: 4, bathrooms: 5, maxGuests: 8,
          pricePerNight: 2850, cleaningFee: 350, cautionDeposit: 500,
          minNights: 2, maxNights: 14, isFeatured: true,
          has247Power: true, hasSecurity: true, hasPool: false, hasChef: false, hasWifi: true,
          rating: 4.98, reviewCount: 42,
          hostName: 'James A.', hostIsSuperhost: true, hostResponseTime: 'within 1 hour',
          rules: 'No smoking. Private cocktail events permitted with prior concierge approval.',
          amenities: [
            { id: '1', propertyId: 'prop-1', name: 'Private Helipad Access', icon: 'plane' },
            { id: '2', propertyId: 'prop-1', name: '360° Skyline Terrace', icon: 'compass' },
            { id: '3', propertyId: 'prop-1', name: 'Private Sommelier Wine Cellar', icon: 'wine' },
            { id: '4', propertyId: 'prop-1', name: 'Private Wellness Spa & Sauna', icon: 'flame' },
          ],
          sections: [
            { id: 'sec-1', propertyId: 'prop-1', name: 'Arrival', order: 0, type: 'PANORAMA', imageUrl: `/placeholders/${slug}-arrival.jpg`, hotspots: [{ id: 'hs-1', targetSectionId: 'sec-2', label: 'Enter Residence', position: [0.8, -0.1, -0.6] }] },
            { id: 'sec-2', propertyId: 'prop-1', name: 'Living Room', order: 1, type: 'PANORAMA', imageUrl: `/placeholders/${slug}-living.jpg`, hotspots: [{ id: 'hs-2', targetSectionId: 'sec-3', label: 'Master Suite', position: [-0.85, 0.05, -0.5] }] },
          ],
        };
        setProperty(fallback);
        usePropertyViewStore.getState().setProperty(fallback);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchProperty();
  }, [slug]);

  if (loading || !property) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="w-2 h-2 rounded-full bg-brand-gold animate-ping" />
          <span>Entering 3D Space…</span>
        </div>
      </div>
    );
  }

  const sections = property.sections || [];
  const reviews = (property as any).reviews?.length ? (property as any).reviews : REVIEW_DEFAULTS;
  const rating = property.rating ?? 4.96;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^0-9]/g, '') || '2348000000000';
  const whatsappMsg = encodeURIComponent(`Hi! I'm interested in "${property.title}" on Lodgr 3D. Can you assist?`);

  const TABS: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'reviews', label: `Reviews (${reviews.length})` },
    { id: 'rules', label: 'House Rules' },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Top breadcrumb */}
      <div className="fixed top-20 left-4 sm:left-6 z-30 pointer-events-auto">
        <Link
          href="/properties"
          className="flex items-center gap-1.5 glass-panel rounded-full px-3 py-1.5 text-[11px] text-[var(--text-secondary)] hover:text-brand-gold transition-colors border border-black/10 dark:border-white/10"
        >
          <ChevronLeft className="w-3 h-3" />
          Back to Stays
        </Link>
      </div>

      {/* Top Right: Spatial Interaction HUD */}
      <div className="fixed top-20 right-6 z-30 pointer-events-none hidden md:block">
        <div className="glass-panel rounded-full px-4 py-2 text-[10px] text-[var(--text-secondary)] tracking-widest uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Drag to look around · Click hotspots to explore</span>
        </div>
      </div>

      {/* Main Left Panel: Property Info + Tabs */}
      <div className="fixed top-28 left-4 sm:left-6 z-30 pointer-events-auto max-w-sm sm:max-w-md max-h-[calc(100vh-160px)] flex flex-col">
        <div className="glass-panel rounded-glass-md shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden">

          {/* Header */}
          <div className="p-5 border-b border-black/10 dark:border-white/10 shrink-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                <MapPin className="w-3 h-3 text-brand-gold" />
                <span>{property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city || property.location}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-brand-gold font-bold">
                <Star className="w-3 h-3 fill-brand-gold" />
                <span>{rating.toFixed(2)}</span>
                {(property.reviewCount ?? 0) > 0 && (
                  <span className="text-[var(--text-muted)] font-normal">({property.reviewCount})</span>
                )}
              </div>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-[var(--text-primary)] leading-tight">{property.title}</h1>

            {/* Amenity Quick Icons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {property.has247Power && <span className="text-[10px] bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30 font-semibold">🔋 24/7 Power</span>}
              {property.hasPool && <span className="text-[10px] bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 font-semibold">🏊 Pool</span>}
              {property.hasSecurity && <span className="text-[10px] bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 font-semibold">👮 Security</span>}
              {property.hasChef && <span className="text-[10px] bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30 font-semibold">👨‍🍳 Chef</span>}
              {property.hasWifi !== false && <span className="text-[10px] bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30 font-semibold">📶 Fiber WiFi</span>}
            </div>

            {/* Price + Book */}
            <div className="flex items-center justify-between mt-3">
              <div>
                <span className="text-xl font-black text-[var(--text-primary)] font-mono">{format(property.pricePerNight)}</span>
                <span className="text-[11px] text-[var(--text-muted)]"> / night</span>
              </div>
              <button
                onClick={() => setIsBookingOpen(true)}
                className="px-5 py-2 rounded-full bg-brand-gold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black text-xs font-black uppercase tracking-wider transition-all shadow-glow"
              >
                Book Now
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-black/10 dark:border-white/10 shrink-0 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2.5 text-[11px] font-semibold tracking-wide shrink-0 transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-brand-gold text-brand-gold'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="overflow-y-auto flex-1 p-4 text-xs text-[var(--text-secondary)] space-y-3">
            {activeTab === 'overview' && (
              <>
                <p className="leading-relaxed">{property.description || property.tagLine}</p>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {[
                    { label: 'Bedrooms', val: property.bedrooms },
                    { label: 'Bathrooms', val: property.bathrooms },
                    { label: 'Max Guests', val: property.maxGuests },
                    { label: 'Min Nights', val: property.minNights },
                    { label: 'Max Nights', val: property.maxNights },
                    { label: 'Category', val: (property.category || 'LUXURY').replace(/_/g, ' ') },
                  ].map(({ label, val }) => (
                    <div key={label} className="glass-panel rounded-xl p-2.5 border border-black/5 dark:border-white/5">
                      <div className="text-[10px] text-[var(--text-muted)]">{label}</div>
                      <div className="font-bold text-[var(--text-primary)] capitalize">{val}</div>
                    </div>
                  ))}
                </div>
                {(property.cautionDeposit ?? 0) > 0 && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-emerald-600 dark:text-emerald-400 leading-relaxed">
                    <strong>🛡️ Refundable Caution Deposit:</strong> {format(property.cautionDeposit!)} returned within 48hrs after check-out inspection.
                  </div>
                )}
              </>
            )}

            {activeTab === 'amenities' && (
              <div className="space-y-3">
                {property.amenities && property.amenities.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1.5">
                    {property.amenities.map((am) => (
                      <div key={am.id || am.name} className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <span className="text-brand-gold">✦</span>
                        <span>{am.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Amenities details provided upon booking confirmation.</p>
                )}
                <div className="pt-2 border-t border-black/10 dark:border-white/10 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-brand-gold mb-2">Essential Utilities</div>
                  {[
                    [property.has247Power, '🔋 24/7 Power Backup', 'Industrial generator + solar inverter system'],
                    [property.hasSecurity, '👮 24/7 Gated Security', 'Armed guards + CCTV surveillance'],
                    [property.hasPool, '🏊 Private Swimming Pool', 'Heated or temperature-controlled'],
                    [property.hasChef, '👨‍🍳 Private Chef / Full Kitchen', 'Professional kitchen with optional chef service'],
                    [property.hasWifi !== false, '📶 High-Speed Fiber WiFi', '100Mbps+ dedicated connection'],
                  ].map(([has, name, desc]) => (
                    <div key={String(name)} className={`flex items-start gap-2 ${has ? 'opacity-100' : 'opacity-40'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${has ? 'bg-emerald-500/20 text-emerald-500' : 'bg-black/10 dark:bg-white/10 text-[var(--text-muted)]'}`}>
                        {has ? '✓' : '✗'}
                      </span>
                      <div>
                        <div className="font-semibold text-[var(--text-primary)] text-[11px]">{String(name)}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">{String(desc)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {/* Rating summary */}
                <div className="flex items-center gap-3 glass-panel rounded-xl p-3 border border-black/10 dark:border-white/10">
                  <div className="text-center">
                    <div className="text-3xl font-black text-[var(--text-primary)]">{rating.toFixed(2)}</div>
                    <div className="flex">{'★'.repeat(5)}</div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-0.5">out of 5</div>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[
                      ['Cleanliness', 5.0], ['Power Reliability', 5.0],
                      ['Location', 4.9], ['Accuracy', 4.9],
                    ].map(([label, val]) => (
                      <div key={String(label)} className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--text-muted)] w-28 shrink-0">{label}</span>
                        <div className="flex-1 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-gold rounded-full" style={{ width: `${(Number(val) / 5) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-[var(--text-primary)] w-6">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-[10px] text-emerald-500 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                  <Shield className="w-3 h-3" />
                  Only guests who completed a verified stay can leave a review.
                </div>
                {reviews.map((r: any, i: number) => (
                  <div key={i} className="glass-panel rounded-xl p-3 border border-black/10 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{r.guestAvatar || r.avatar || '👤'}</span>
                        <div>
                          <div className="font-semibold text-[var(--text-primary)] text-[11px]">{r.guestName || r.name}</div>
                          <div className="text-[10px] text-[var(--text-muted)]">{r.stayDate}</div>
                        </div>
                      </div>
                      <div className="text-brand-gold text-[11px]">{'★'.repeat(Math.round(r.rating))}</div>
                    </div>
                    <p className="leading-relaxed text-[var(--text-secondary)]">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="space-y-3">
                {[
                  ['🕐 Check-in', '2:00 PM (Flexible with prior notice)'],
                  ['🕚 Check-out', '11:00 AM'],
                  ['🚭 No Smoking', 'Strictly no smoking indoors'],
                  ['🔇 Quiet Hours', '11:00 PM – 7:00 AM'],
                  ['🐾 Pets', 'Not permitted'],
                  ['🎉 Events', 'Small private gatherings with concierge approval'],
                ].map(([rule, detail]) => (
                  <div key={String(rule)} className="flex items-start gap-3">
                    <span className="text-sm shrink-0 mt-0.5">{String(rule).split(' ')[0]}</span>
                    <div>
                      <div className="font-semibold text-[var(--text-primary)] text-[11px]">{String(rule).substring(2).trim()}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{String(detail)}</div>
                    </div>
                  </div>
                ))}
                {property.rules && (
                  <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 leading-relaxed text-[var(--text-muted)]">
                    {property.rules}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Right: Host Profile Card */}
      {(property.hostName) && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-30 pointer-events-auto max-w-[220px]">
          <div className="glass-panel rounded-glass-md p-4 shadow-xl backdrop-blur-2xl border border-black/10 dark:border-white/10 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{property.hostAvatar || '🏠'}</span>
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)]">{property.hostName}</div>
                {property.hostIsSuperhost && (
                  <div className="text-[10px] text-brand-gold font-semibold">⭐ Verified Superhost</div>
                )}
              </div>
            </div>
            {property.hostResponseTime && (
              <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-brand-gold" />
                <span>Responds {property.hostResponseTime}</span>
              </div>
            )}
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-500 text-[11px] font-bold transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Chat with Host
            </a>
          </div>
        </div>
      )}

      {/* Section Rail */}
      <SectionRail
        sections={sections}
        activeIndex={activeSectionIndex}
        onSelect={(idx) => setActiveSectionIndex(idx)}
      />

      {/* Booking Modal */}
      <BookingModal
        property={property}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
}
