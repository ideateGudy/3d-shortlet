'use client';

import React, { useState, useEffect } from 'react';
import type { Property } from '@shortlet/shared';
import { X, Sparkles, Building2 } from 'lucide-react';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  propertyToEdit?: Property | null;
}

export function PropertyFormModal({
  isOpen,
  onClose,
  onSuccess,
  propertyToEdit,
}: PropertyFormModalProps) {
  const isEditing = Boolean(propertyToEdit);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(3);
  const [maxGuests, setMaxGuests] = useState(6);
  const [pricePerNight, setPricePerNight] = useState(1500);
  const [cleaningFee, setCleaningFee] = useState(250);
  const [minNights, setMinNights] = useState(2);
  const [maxNights, setMaxNights] = useState(14);
  const [rules, setRules] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (propertyToEdit) {
      setTitle(propertyToEdit.title);
      setSlug(propertyToEdit.slug);
      setTagLine(propertyToEdit.tagLine || '');
      setDescription(propertyToEdit.description || '');
      setLocation(propertyToEdit.location);
      setBedrooms(propertyToEdit.bedrooms);
      setBathrooms(propertyToEdit.bathrooms);
      setMaxGuests(propertyToEdit.maxGuests);
      setPricePerNight(propertyToEdit.pricePerNight);
      setCleaningFee(propertyToEdit.cleaningFee || 0);
      setMinNights(propertyToEdit.minNights);
      setMaxNights(propertyToEdit.maxNights);
      setRules(propertyToEdit.rules || '');
      setIsFeatured(Boolean(propertyToEdit.isFeatured));
    } else {
      // Reset defaults for new property
      setTitle('');
      setSlug('');
      setTagLine('');
      setDescription('');
      setLocation('');
      setBedrooms(3);
      setBathrooms(3);
      setMaxGuests(6);
      setPricePerNight(1850);
      setCleaningFee(250);
      setMinNights(2);
      setMaxNights(14);
      setRules('No smoking indoors. Quiet hours after 10:00 PM.');
      setIsFeatured(false);
    }
    setErrorMsg(null);
  }, [propertyToEdit, isOpen]);

  // Auto-generate slug from title if creating
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !location) {
      setErrorMsg('Please fill in title, slug, and location.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const token = typeof window !== 'undefined' ? localStorage.getItem('shortlet_admin_token') : null;

      const payload = {
        title,
        slug,
        tagLine,
        description,
        location,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        maxGuests: Number(maxGuests),
        pricePerNight: Number(pricePerNight),
        cleaningFee: Number(cleaningFee),
        minNights: Number(minNights),
        maxNights: Number(maxNights),
        rules,
        isFeatured,
      };

      const url = isEditing
        ? `${apiUrl}/properties/${propertyToEdit!.id}`
        : `${apiUrl}/properties`;
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save residence');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md pointer-events-auto overflow-y-auto">
      <div className="glass-panel rounded-glass-lg p-6 sm:p-8 max-w-3xl w-full my-auto text-white relative shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-4 pr-10 border-b border-white/10 pb-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {isEditing ? 'Edit Residence Details' : 'Create New Residence'}
            </h2>
            <p className="text-xs text-white/50">
              {isEditing
                ? 'Update property details, pricing, and guest capacity'
                : 'Scaffold an architectural shortlet property visible in 3D'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* Row 1: Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-white/70 mb-1">
                Property Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Solarium Cliffside Estate"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-white/70 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. solarium-cliffside-estate"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-white/30 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Tagline & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-white/70 mb-1">
                Tagline / Teaser
              </label>
              <input
                type="text"
                placeholder="e.g. Sculpted cliffside villa overlooking azure waters"
                value={tagLine}
                onChange={(e) => setTagLine(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-white/70 mb-1">
                Location (City, Country) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Amalfi Coast, Italy"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-medium text-white/70 mb-1">
              Architectural Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the aesthetic, light orientation, materials, and luxury features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-gold transition-colors"
            />
          </div>

          {/* Row 3: Specs (Bedrooms, Bathrooms, Max Guests) */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-white/70 mb-1">
                Bedrooms *
              </label>
              <input
                type="number"
                min={1}
                required
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-white/70 mb-1">
                Bathrooms *
              </label>
              <input
                type="number"
                min={1}
                required
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-white/70 mb-1">
                Max Guests *
              </label>
              <input
                type="number"
                min={1}
                required
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
              />
            </div>
          </div>

          {/* Row 4: Pricing & Fees */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-white/70 mb-1">
                Price / Night ($) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={pricePerNight}
                onChange={(e) => setPricePerNight(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-white/70 mb-1">
                Cleaning Fee ($)
              </label>
              <input
                type="number"
                min={0}
                value={cleaningFee}
                onChange={(e) => setCleaningFee(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-white/70 mb-1">
                Min Nights
              </label>
              <input
                type="number"
                min={1}
                value={minNights}
                onChange={(e) => setMinNights(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-white/70 mb-1">
                Max Nights
              </label>
              <input
                type="number"
                min={1}
                value={maxNights}
                onChange={(e) => setMaxNights(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
              />
            </div>
          </div>

          {/* Rules & Featured Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-white/70 mb-1">
                House Rules
              </label>
              <input
                type="text"
                placeholder="e.g. No pets, private gatherings require prior approval."
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div className="flex items-center gap-3 sm:pt-4">
              <input
                type="checkbox"
                id="isFeaturedToggle"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-brand-gold cursor-pointer rounded"
              />
              <label htmlFor="isFeaturedToggle" className="text-xs text-white/90 cursor-pointer flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                <span>Feature in Showcase</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-brand-gold hover:bg-white text-black text-xs font-bold uppercase tracking-wider transition-all shadow-glow flex items-center gap-2"
            >
              <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Residence' : 'Create Residence'}</span>
              <span>→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
