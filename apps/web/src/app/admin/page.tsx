'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Property, PropertySection, Booking, BlockedDate, Hotspot } from '@shortlet/shared';
import { VisualHotspotEditor } from '@/components/admin/VisualHotspotEditor';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'PROPERTIES' | 'BOOKINGS' | 'BLOCKS'>('PROPERTIES');
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected property for section/hotspot management
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedSection, setSelectedSection] = useState<PropertySection | null>(null);

  // New Block Form
  const [blockPropId, setBlockPropId] = useState('');
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState<'MAINTENANCE' | 'OWNER_STAY' | 'OTHER'>('MAINTENANCE');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('shortlet_admin_token') : null;
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || ''}`,
    };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('shortlet_admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      // Fetch properties
      const pRes = await fetch(`${apiUrl}/properties`);
      if (pRes.ok) {
        const pData = await pRes.json();
        setProperties(pData);
        if (pData.length > 0 && !selectedProperty) {
          setSelectedProperty(pData[0]);
          if (pData[0].sections?.length > 0) {
            setSelectedSection(pData[0].sections[0]);
          }
        }
      }

      // Fetch bookings
      const bRes = await fetch(`${apiUrl}/bookings`, { headers: getHeaders() });
      if (bRes.ok) {
        const bData = await bRes.json();
        setBookings(bData);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('shortlet_admin_token');
    router.push('/admin/login');
  };

  // Save Hotspots
  const handleSaveHotspots = async (hotspots: Hotspot[]) => {
    if (!selectedProperty || !selectedSection) return;

    const res = await fetch(
      `${apiUrl}/properties/${selectedProperty.id}/sections/${selectedSection.id}`,
      {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ hotspots }),
      }
    );

    if (res.ok) {
      const updatedSection = await res.json();
      setSelectedSection(updatedSection);
      // Update in property sections
      setSelectedProperty((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sections: prev.sections?.map((s) => (s.id === updatedSection.id ? updatedSection : s)),
        };
      });
    }
  };

  // Booking status update
  const handleUpdateBookingStatus = async (id: string, status: string) => {
    const res = await fetch(`${apiUrl}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      loadData();
    }
  };

  // Create Block
  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockPropId || !blockStart || !blockEnd) return;

    const res = await fetch(`${apiUrl}/blocks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        propertyId: blockPropId,
        startDate: blockStart,
        endDate: blockEnd,
        reason: blockReason,
      }),
    });

    if (res.ok) {
      setBlockStart('');
      setBlockEnd('');
      loadData();
    } else {
      const err = await res.json();
      alert(err.message || 'Failed to create block');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto pointer-events-auto">
      {/* Top Admin Header */}
      <div className="glass-panel rounded-glass-lg p-6 mb-8 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-brand-gold shadow-glow" />
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              Operations & Concierge Portal
            </h1>
            <p className="text-xs text-white/50">
              Curate residences, place spatial hotspots, and govern reservations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            {(['PROPERTIES', 'BOOKINGS', 'BLOCKS'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                  activeTab === tab
                    ? 'bg-brand-gold text-black shadow-glow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-xs font-medium text-white/70 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* TAB 1: PROPERTIES & VISUAL HOTSPOT EDITOR */}
      {activeTab === 'PROPERTIES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Property & Section Picker */}
          <div className="glass-panel rounded-glass-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Residences
            </h3>

            <div className="space-y-2">
              {properties.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProperty(p);
                    if (p.sections && p.sections.length > 0) {
                      setSelectedSection(p.sections[0]);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    selectedProperty?.id === p.id
                      ? 'bg-brand-gold/15 border-brand-gold text-white'
                      : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <div className="text-xs font-semibold">{p.title}</div>
                  <div className="text-[11px] text-white/50">{p.location} • ${p.pricePerNight}/night</div>
                </button>
              ))}
            </div>

            {selectedProperty && (
              <div className="pt-4 border-t border-white/10 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-gold">
                  Sections in Residence
                </h4>
                <div className="space-y-1.5">
                  {selectedProperty.sections?.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => setSelectedSection(sec)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                        selectedSection?.id === sec.id
                          ? 'bg-white/20 text-white font-medium border border-white/30'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <span>{sec.name}</span>
                      <span className="text-[10px] text-brand-gold font-mono">{sec.type}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Visual Hotspot Placer */}
          <div className="lg:col-span-2 glass-panel rounded-glass-lg p-6">
            {selectedSection && selectedProperty ? (
              <VisualHotspotEditor
                key={selectedSection.id}
                section={selectedSection}
                allSections={selectedProperty.sections || []}
                onSaveHotspots={handleSaveHotspots}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-xs text-white/40">
                Select a residence section to place hotspots
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BOOKINGS MANAGEMENT */}
      {activeTab === 'BOOKINGS' && (
        <div className="glass-panel rounded-glass-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              All Reservations
            </h3>
            <span className="text-xs text-brand-gold font-mono">
              {bookings.length} Total Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/50 text-[11px] uppercase tracking-wider">
                  <th className="pb-3">Reference</th>
                  <th className="pb-3">Guest</th>
                  <th className="pb-3">Dates</th>
                  <th className="pb-3">Guests</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-mono text-[11px] text-brand-gold font-bold">
                      {b.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3">
                      <div className="font-medium text-white">{b.guestName}</div>
                      <div className="text-[10px] text-white/50">{b.guestEmail}</div>
                    </td>
                    <td className="py-3 text-white/80">
                      {b.checkIn.substring(0, 10)} → {b.checkOut.substring(0, 10)}
                    </td>
                    <td className="py-3 text-white/80">
                      {b.adults}A {b.children > 0 ? `${b.children}C` : ''}
                    </td>
                    <td className="py-3 font-semibold text-white">
                      ${b.totalPrice.toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : b.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-red-500/20 text-red-300 border border-red-500/40'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      {b.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'CONFIRMED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 text-[10px] font-bold"
                        >
                          Confirm
                        </button>
                      )}
                      {b.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')}
                          className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 text-[10px]"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CALENDAR BLOCKS (MAINTENANCE / OWNER STAY) */}
      {activeTab === 'BLOCKS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Block Form */}
          <div className="glass-panel rounded-glass-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Add Calendar Block
            </h3>
            <form onSubmit={handleCreateBlock} className="space-y-3 text-xs">
              <div>
                <label className="block text-white/70 mb-1">Residence *</label>
                <select
                  required
                  value={blockPropId}
                  onChange={(e) => setBlockPropId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-gold"
                >
                  <option value="" className="bg-space-900">Select residence...</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id} className="bg-space-900">
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/70 mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={blockStart}
                  onChange={(e) => setBlockStart(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1">End Date *</label>
                <input
                  type="date"
                  required
                  value={blockEnd}
                  onChange={(e) => setBlockEnd(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1">Reason *</label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-gold"
                >
                  <option value="MAINTENANCE" className="bg-space-900">Maintenance & Renovation</option>
                  <option value="OWNER_STAY" className="bg-space-900">Owner Exclusive Stay</option>
                  <option value="OTHER" className="bg-space-900">Other Hold</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-gold hover:bg-white text-black font-bold uppercase tracking-wider text-xs transition-all shadow-glow mt-2"
              >
                Create Calendar Block
              </button>
            </form>
          </div>

          {/* Blocked Dates Info */}
          <div className="lg:col-span-2 glass-panel rounded-glass-lg p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Active Calendar Blocks
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Blocked dates prevent guest reservations during designated maintenance periods or owner stays.
              The 3D availability calendar dynamically updates across all client viewports.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
