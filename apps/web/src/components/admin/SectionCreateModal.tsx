'use client';

import React, { useState } from 'react';
import { X, Layers, Image as ImageIcon } from 'lucide-react';

interface SectionCreateModalProps {
  propertyId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingSectionsCount: number;
}

const PRESET_IMAGES = [
  { label: 'Cliffside Living Room (Panorama)', url: '/placeholders/azure-cliffside-villa-living.jpg', type: 'PANORAMA' },
  { label: 'Cliffside Master Bedroom (Panorama)', url: '/placeholders/azure-cliffside-villa-bedroom.jpg', type: 'PANORAMA' },
  { label: 'Cliffside Sunset Balcony (Panorama)', url: '/placeholders/azure-cliffside-villa-terrace.jpg', type: 'PANORAMA' },
  { label: 'Penthouse Salon (Panorama)', url: '/placeholders/obsidian-penthouse-living.jpg', type: 'PANORAMA' },
  { label: 'Penthouse Master Suite (Panorama)', url: '/placeholders/obsidian-penthouse-bedroom.jpg', type: 'PANORAMA' },
  { label: 'Penthouse Skyline Terrace (Panorama)', url: '/placeholders/obsidian-penthouse-terrace.jpg', type: 'PANORAMA' },
  { label: 'Forest Pavilion Living (Panorama)', url: '/placeholders/komorebi-forest-sanctuary-living.jpg', type: 'PANORAMA' },
  { label: 'Desert Pavilion Lounge (Panorama)', url: '/placeholders/solis-desert-pavilion-living.jpg', type: 'PANORAMA' },
];

export function SectionCreateModal({
  propertyId,
  isOpen,
  onClose,
  onSuccess,
  existingSectionsCount,
}: SectionCreateModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'PANORAMA' | 'PHOTO'>('PANORAMA');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [order, setOrder] = useState(existingSectionsCount);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !imageUrl) {
      setErrorMsg('Please enter a section name and select/enter an image.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const token = typeof window !== 'undefined' ? localStorage.getItem('shortlet_admin_token') : null;

      const res = await fetch(`${apiUrl}/properties/${propertyId}/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          name,
          type,
          imageUrl,
          order: Number(order),
          hotspots: [],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to add section');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while creating section.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-md pointer-events-auto overflow-y-auto">
      <div className="glass-panel rounded-glass-lg p-6 max-w-lg w-full my-auto text-[var(--text-primary)] relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-4 pr-10 border-b border-black/10 dark:border-white/10 pb-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Add Residence Room / Section</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              360° panorama spheres or high-res depth photo planes
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-600 dark:text-red-200 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
              Section / Room Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master Sky Sanctuary, Ocean View Balcony"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-brand-gold transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                Projection Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'PANORAMA' | 'PHOTO')}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-brand-gold appearance-none"
              >
                <option value="PANORAMA" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">360° Panorama Sphere</option>
                <option value="PHOTO" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Depth Layered Photo</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                Display Order
              </label>
              <input
                type="number"
                min={0}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-brand-gold"
              />
            </div>
          </div>

          {/* Preset image selector */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
              Select Preset High-Res Equirectangular Image
            </label>
            <select
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-brand-gold appearance-none"
            >
              {PRESET_IMAGES.map((img, i) => (
                <option key={i} value={img.url} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                  {img.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
              Or Custom Image URL
            </label>
            <input
              type="text"
              placeholder="https://... or /placeholders/custom.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] font-mono placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-brand-gold"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-brand-gold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black text-xs font-bold uppercase tracking-wider transition-all shadow-glow flex items-center gap-1.5"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Adding...' : 'Add Section'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
