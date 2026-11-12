'use client';

import React, { useState, useRef } from 'react';
import type { Hotspot, PropertySection } from '@shortlet/shared';
import { uvToSphericalVector, sphericalVectorToUV } from '@/lib/3d/cameraUtils';

interface VisualHotspotEditorProps {
  section: PropertySection;
  allSections: PropertySection[];
  onSaveHotspots: (hotspots: Hotspot[]) => Promise<void>;
}

export function VisualHotspotEditor({
  section,
  allSections,
  onSaveHotspots,
}: VisualHotspotEditorProps) {
  const [hotspots, setHotspots] = useState<Hotspot[]>(section.hotspots || []);
  const [pendingHotspot, setPendingHotspot] = useState<{
    u: number;
    v: number;
    pos: [number, number, number];
  } | null>(null);

  const [label, setLabel] = useState('');
  const [targetSectionId, setTargetSectionId] = useState(
    allSections.find((s) => s.id !== section.id)?.id || ''
  );
  const [isSaving, setIsSaving] = useState(false);

  const imageRef = useRef<HTMLDivElement>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const u = (e.clientX - rect.left) / rect.width;
    const v = (e.clientY - rect.top) / rect.height;

    const sphericalPos = uvToSphericalVector(u, v);
    setPendingHotspot({ u, v, pos: sphericalPos });
    setLabel('');
  };

  const handleAddHotspot = async () => {
    if (!pendingHotspot || !label.trim()) return;

    const newHotspot: Hotspot = {
      id: `hs-${Date.now()}`,
      targetSectionId,
      label: label.trim(),
      position: pendingHotspot.pos,
    };

    const updated = [...hotspots, newHotspot];
    setHotspots(updated);
    setPendingHotspot(null);

    setIsSaving(true);
    try {
      await onSaveHotspots(updated);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHotspot = async (id: string) => {
    const updated = hotspots.filter((h) => h.id !== id);
    setHotspots(updated);
    setIsSaving(true);
    try {
      await onSaveHotspots(updated);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs">
        <div>
          <h4 className="font-semibold text-[var(--text-primary)]">Visual Hotspot Placement</h4>
          <p className="text-[var(--text-secondary)] text-[11px]">
            Click anywhere on the preview to position a spatial portal
          </p>
        </div>
        {isSaving && <span className="text-brand-gold animate-pulse text-[11px]">Saving changes...</span>}
      </div>

      {/* Interactive 2D Preview Frame */}
      <div
        ref={imageRef}
        onClick={handleImageClick}
        className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden cursor-crosshair border border-black/10 dark:border-white/20 select-none bg-black/5 dark:bg-black/40 group"
      >
        <img
          src={section.imageUrl}
          alt={section.name}
          className="w-full h-full object-cover pointer-events-none"
        />

        {/* Existing Hotspot Markers */}
        {hotspots.map((hs) => {
          const uv = sphericalVectorToUV(hs.position);
          const targetName =
            allSections.find((s) => s.id === hs.targetSectionId)?.name || 'Unknown';

          return (
            <div
              key={hs.id}
              style={{
                left: `${uv.u * 100}%`,
                top: `${uv.v * 100}%`,
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group/marker"
            >
              <div className="w-6 h-6 rounded-full bg-brand-gold/80 border-2 border-white flex items-center justify-center text-[10px] text-black font-bold shadow-glow">
                ✦
              </div>

              {/* Hover tooltip with delete option */}
              <div className="hidden group-hover/marker:flex items-center gap-2 absolute top-7 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-black/90 border border-white/20 whitespace-nowrap text-[10px] text-white z-20 shadow-xl">
                <span>
                  <strong>{hs.label}</strong> → {targetName}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteHotspot(hs.id)}
                  className="text-red-400 hover:text-red-200 ml-1 font-bold"
                  title="Delete hotspot"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}

        {/* Pending Click Pin */}
        {pendingHotspot && (
          <div
            style={{
              left: `${pendingHotspot.u * 100}%`,
              top: `${pendingHotspot.v * 100}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-emerald-400 border-2 border-white animate-bounce flex items-center justify-center text-xs text-black font-bold shadow-glow"
          >
            +
          </div>
        )}
      </div>

      {/* Pending Hotspot Form Drawer */}
      {pendingHotspot && (
        <div className="glass-panel rounded-glass-sm p-4 space-y-3 border-emerald-500/40">
          <div className="text-xs font-semibold text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5">
            <span>✦</span>
            <span>Configure New Hotspot</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Hotspot Label *</label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Master Bedroom, Chef's Kitchen..."
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Target Section *</label>
              <select
                value={targetSectionId}
                onChange={(e) => setTargetSectionId(e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-brand-gold"
              >
                {allSections.map((sec) => (
                  <option key={sec.id} value={sec.id} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                    {sec.name} ({sec.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setPendingHotspot(null)}
              className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!label.trim()}
              onClick={handleAddHotspot}
              className="px-4 py-1.5 rounded-lg bg-brand-gold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black text-xs font-bold uppercase transition-all shadow-glow"
            >
              Place Hotspot
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
