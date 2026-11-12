'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Property, PropertySection, Booking, BlockedDate, Hotspot } from '@shortlet/shared';
import { VisualHotspotEditor } from '@/components/admin/VisualHotspotEditor';
import { PropertyFormModal } from '@/components/admin/PropertyFormModal';
import { SectionCreateModal } from '@/components/admin/SectionCreateModal';
import { Plus, Pencil, Trash2, Building2, Layers } from 'lucide-react';

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

  // Property CRUD Modal States
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);

  // Section CRUD Modal State
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

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
        const pData: Property[] = await pRes.json();
        setProperties(pData);
        if (pData.length > 0) {
          // If we had a selected property, keep it selected with fresh data
          const currentId = selectedProperty?.id;
          const matched = pData.find((p) => p.id === currentId) || pData[0];
          setSelectedProperty(matched);
          if (matched.sections && matched.sections.length > 0) {
            const currentSecId = selectedSection?.id;
            const matchedSec = matched.sections.find((s) => s.id === currentSecId) || matched.sections[0];
            setSelectedSection(matchedSec);
          } else {
            setSelectedSection(null);
          }
        } else {
          setSelectedProperty(null);
          setSelectedSection(null);
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

  const handleOpenCreateProperty = () => {
    setPropertyToEdit(null);
    setIsPropertyModalOpen(true);
  };

  const handleOpenEditProperty = (p: Property) => {
    setPropertyToEdit(p);
    setIsPropertyModalOpen(true);
  };

  const handleDeleteProperty = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete residence "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/properties/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        if (selectedProperty?.id === id) {
          setSelectedProperty(null);
          setSelectedSection(null);
        }
        await loadData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to delete property');
      }
    } catch {
      alert('Error deleting property');
    }
  };

  const handleDeleteSection = async (sectionId: string, sectionName: string) => {
    if (!selectedProperty) return;
    if (!confirm(`Delete section "${sectionName}"?`)) return;

    try {
      const res = await fetch(`${apiUrl}/properties/${selectedProperty.id}/sections/${sectionId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        await loadData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to delete section');
      }
    } catch {
      alert('Error deleting section');
    }
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
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Residences ({properties.length})
              </h3>
              <button
                onClick={handleOpenCreateProperty}
                className="px-3 py-1.5 rounded-lg bg-brand-gold hover:bg-white text-black text-xs font-bold uppercase tracking-wider transition-all shadow-glow flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Residence</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {properties.map((p) => (
                <div
                  key={p.id}
                  className={`w-full p-3 rounded-xl transition-all border ${
                    selectedProperty?.id === p.id
                      ? 'bg-brand-gold/15 border-brand-gold text-white'
                      : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedProperty(p);
                        if (p.sections && p.sections.length > 0) {
                          setSelectedSection(p.sections[0]);
                        } else {
                          setSelectedSection(null);
                        }
                      }}
                      className="text-left flex-1"
                    >
                      <div className="text-xs font-semibold hover:text-brand-gold transition-colors">
                        {p.title}
                      </div>
                      <div className="text-[11px] text-white/50">
                        {p.location} • ${p.pricePerNight}/night • {p.bedrooms} beds
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditProperty(p)}
                        title="Edit Residence Details"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(p.id, p.title)}
                        title="Delete Residence"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedProperty && (
              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Rooms ({selectedProperty.sections?.length || 0})</span>
                  </h4>
                  <button
                    onClick={() => setIsSectionModalOpen(true)}
                    className="px-2.5 py-1 rounded bg-white/10 hover:bg-brand-gold hover:text-black text-white text-[11px] font-medium tracking-wider transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Room</span>
                  </button>
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {selectedProperty.sections?.map((sec) => (
                    <div
                      key={sec.id}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                        selectedSection?.id === sec.id
                          ? 'bg-white/20 text-white font-medium border border-white/30'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <button
                        onClick={() => setSelectedSection(sec)}
                        className="flex items-center gap-2 text-left flex-1"
                      >
                        <span>{sec.name}</span>
                        <span className="text-[10px] text-brand-gold font-mono">{sec.type}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteSection(sec.id, sec.name)}
                        title="Delete Section"
                        className="p-1 hover:text-red-400 text-white/40 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {(!selectedProperty.sections || selectedProperty.sections.length === 0) && (
                    <div className="text-[11px] text-white/40 p-2 text-center">
                      No rooms added yet. Click &quot;Add Room&quot; above to create a 360° panorama room.
                    </div>
                  )}
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
              <div className="h-64 flex flex-col items-center justify-center text-xs text-white/40 space-y-2">
                <Building2 className="w-8 h-8 text-white/20" />
                <span>Select a residence room to place interactive 3D navigation hotspots</span>
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
            <table className="w-full text-left text-xs text-white/80">
              <thead>
                <tr className="border-b border-white/10 text-white/50 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-2">ID</th>
                  <th className="py-3 px-2">Guest</th>
                  <th className="py-3 px-2">Property</th>
                  <th className="py-3 px-2">Check-in</th>
                  <th className="py-3 px-2">Check-out</th>
                  <th className="py-3 px-2">Amount</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5">
                    <td className="py-3 px-2 font-mono text-[11px] text-white/60">
                      {b.id.substring(0, 8)}
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-medium text-white">{b.guestName}</div>
                      <div className="text-[10px] text-white/40">{b.guestEmail}</div>
                    </td>
                    <td className="py-3 px-2 text-white/80">
                      {b.property?.title || b.propertyId.substring(0, 8)}
                    </td>
                    <td className="py-3 px-2">{b.checkIn.substring(0, 10)}</td>
                    <td className="py-3 px-2">{b.checkOut.substring(0, 10)}</td>
                    <td className="py-3 px-2 font-mono font-medium text-white">
                      ${b.totalPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : b.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right space-x-2">
                      {b.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'CONFIRMED')}
                          className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 text-[10px] font-medium"
                        >
                          Confirm
                        </button>
                      )}
                      {b.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')}
                          className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-300 text-[10px] font-medium"
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

      {/* TAB 3: MANUAL BLOCKS MANAGEMENT */}
      {activeTab === 'BLOCKS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Block Form */}
          <div className="glass-panel rounded-glass-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Create Calendar Block
            </h3>
            <form onSubmit={handleCreateBlock} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1">
                  Select Residence
                </label>
                <select
                  value={blockPropId}
                  onChange={(e) => setBlockPropId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                  required
                >
                  <option value="" className="bg-black text-white">Choose residence...</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id} className="bg-black text-white">
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={blockStart}
                  onChange={(e) => setBlockStart(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={blockEnd}
                  onChange={(e) => setBlockEnd(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1">
                  Reason
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                >
                  <option value="MAINTENANCE" className="bg-black text-white">Maintenance / Deep Clean</option>
                  <option value="OWNER_STAY" className="bg-black text-white">Owner Stay</option>
                  <option value="OTHER" className="bg-black text-white">Other</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-gold hover:bg-white text-black text-xs font-bold uppercase tracking-wider transition-all shadow-glow mt-2"
              >
                Apply Block
              </button>
            </form>
          </div>

          {/* Block list */}
          <div className="lg:col-span-2 glass-panel rounded-glass-lg p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Active Calendar Blocks
            </h3>
            <div className="text-xs text-white/50">
              Blocked dates are immediately locked and rendered unselectable on the 3D guest booking calendar.
            </div>
          </div>
        </div>
      )}

      {/* Property CRUD Modal */}
      <PropertyFormModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        onSuccess={loadData}
        propertyToEdit={propertyToEdit}
      />

      {/* Section Create Modal */}
      {selectedProperty && (
        <SectionCreateModal
          propertyId={selectedProperty.id}
          isOpen={isSectionModalOpen}
          onClose={() => setIsSectionModalOpen(false)}
          onSuccess={loadData}
          existingSectionsCount={selectedProperty.sections?.length || 0}
        />
      )}
    </div>
  );
}
