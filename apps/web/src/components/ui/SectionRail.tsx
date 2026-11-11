'use client';

import React from 'react';
import type { PropertySection } from '@shortlet/shared';

interface SectionRailProps {
  sections: PropertySection[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function SectionRail({ sections, activeIndex, onSelect }: SectionRailProps) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
      <nav
        aria-label="Property Sections"
        className="glass-panel rounded-full p-2 flex items-center gap-1.5 sm:gap-2.5 max-w-2xl overflow-x-auto pointer-events-auto shadow-2xl"
      >
        {sections.map((section, idx) => {
          const isActive = activeIndex === idx;

          return (
            <button
              key={section.id || `${section.name}-${idx}`}
              onClick={() => onSelect(idx)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-gold text-black font-bold shadow-glow scale-105'
                  : 'bg-white/5 hover:bg-white/15 text-white/70 hover:text-white'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive ? 'bg-black' : section.type === 'PANORAMA' ? 'bg-brand-gold' : 'bg-sky-400'
                }`}
              />
              <span>{section.name}</span>
              {section.type === 'PANORAMA' && (
                <span className={`text-[9px] ${isActive ? 'text-black/60' : 'text-white/40'}`}>
                  360°
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
