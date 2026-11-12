'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { PropertySection } from '@shortlet/shared';
import { X, Layers, Image as ImageIcon, UploadCloud, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';

interface SectionEditModalProps {
  propertyId: string;
  section: PropertySection | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SectionEditModal({
  propertyId,
  section,
  isOpen,
  onClose,
  onSuccess,
}: SectionEditModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'PANORAMA' | 'PHOTO'>('PANORAMA');
  const [imageUrl, setImageUrl] = useState('');
  const [order, setOrder] = useState(0);

  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (section) {
      setName(section.name);
      setType(section.type as 'PANORAMA' | 'PHOTO');
      setImageUrl(section.imageUrl);
      setOrder(section.order);
    }
    setErrorMsg(null);
  }, [section, isOpen]);

  if (!isOpen || !section) return null;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const handleFileUpload = async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp|avif)$/)) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP, AVIF).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('Image file size must be less than 25MB.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('shortlet_admin_token') : null;
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${apiUrl}/media/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to upload to Cloudinary');
      }

      const data = await res.json();
      setImageUrl(data.url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !imageUrl.trim()) {
      setErrorMsg('Please enter a section name and upload or select an image.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('shortlet_admin_token') : null;

      const res = await fetch(`${apiUrl}/properties/${propertyId}/sections/${section.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          type,
          imageUrl: imageUrl.trim(),
          order: Number(order),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update section');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while updating section.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCloudinary = imageUrl.includes('cloudinary.com');

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
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Edit Room / Replace Image</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Update room configuration or upload new Cloudinary imagery
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
              Room / Section Name *
            </label>
            <input
              type="text"
              required
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

          {/* Cloudinary Image Dropzone */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                Room Image (Cloudinary)
              </label>
              <span className="text-[10px] text-brand-gold font-mono">
                {isCloudinary ? '☁ Hosted on Cloudinary' : '📁 Local Storage'}
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer select-none ${
                isDragging
                  ? 'border-brand-gold bg-brand-gold/10'
                  : 'border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 hover:border-brand-gold/60'
              }`}
            >
              {isUploading ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
                  <span className="text-xs font-semibold text-[var(--text-primary)]">
                    Uploading to Cloudinary CDN...
                  </span>
                </div>
              ) : imageUrl ? (
                <div className="relative group/preview">
                  <div className="relative aspect-[2/1] rounded-xl overflow-hidden shadow-lg border border-black/10 dark:border-white/10">
                    <img
                      src={imageUrl}
                      alt="Room preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{isCloudinary ? '☁ Cloudinary CDN' : 'Current Image'}</span>
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="text-xs text-white font-medium flex items-center gap-1.5 bg-black/80 px-3 py-1.5 rounded-xl border border-white/20">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Click or Drop New File to Replace
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] text-[var(--text-secondary)] truncate font-mono">
                    {imageUrl}
                  </p>
                </div>
              ) : (
                <div className="py-5 flex flex-col items-center justify-center gap-1.5">
                  <UploadCloud className="w-8 h-8 text-brand-gold" />
                  <p className="text-xs font-semibold text-[var(--text-primary)]">
                    Click to upload replacement image to Cloudinary
                  </p>
                </div>
              )}
            </div>

            <div className="mt-2">
              <input
                type="text"
                placeholder="Or paste custom image URL (https://...)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] font-mono placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-brand-gold"
              />
            </div>
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
              disabled={isSubmitting || isUploading || !imageUrl}
              className="px-5 py-2 rounded-xl bg-brand-gold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black text-xs font-bold uppercase tracking-wider transition-all shadow-glow flex items-center gap-1.5 disabled:opacity-50"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Update Room'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
