'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCameraStore } from '@/lib/store/useCameraStore';
import { LANDING_CHAPTERS } from '@/lib/3d/curves';

gsap.registerPlugin(ScrollTrigger);

export function ScrollJourneyOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    // 1. Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    // 2. Setup GSAP ScrollTrigger tied to CameraDirector progress
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
        onUpdate: (self) => {
          const p = self.progress;
          setScrollPercent(Math.round(p * 100));
          useCameraStore.getState().setScrollProgress(p);

          // Find current chapter
          const chapterIdx = LANDING_CHAPTERS.findIndex(
            (c) => p >= c.startProgress && p <= c.endProgress
          );
          if (chapterIdx !== -1) {
            setActiveChapterIndex(chapterIdx);
          }
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const activeChapter = LANDING_CHAPTERS[activeChapterIndex] || LANDING_CHAPTERS[0];

  return (
    <div ref={containerRef} className="relative w-full h-[500vh]">
      {/* Fixed Sticky HUD Overlay */}
      <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-8 sm:p-12 z-20">
        {/* Top Progress Meter */}
        <div className="flex items-center justify-between text-xs tracking-widest text-[var(--text-muted)] border-b border-black/10 dark:border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-brand-gold font-mono font-bold">
              {String(scrollPercent).padStart(2, '0')}%
            </span>
            <span>SPATIAL JOURNEY</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[10px]">
            {LANDING_CHAPTERS.map((c, i) => (
              <span
                key={c.id}
                className={`transition-colors ${
                  activeChapterIndex === i ? 'text-brand-gold font-bold' : 'text-black/30 dark:text-white/30'
                }`}
              >
                {c.tag}
              </span>
            ))}
          </div>
        </div>

        {/* Center Chapter Glass Card */}
        <div className="max-w-xl self-start pointer-events-auto transition-all duration-500 ease-out transform">
          <div className="glass-panel rounded-glass-lg p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
            <span className="text-[11px] font-bold tracking-widest text-brand-gold uppercase">
              {activeChapter.tag}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mt-1.5 uppercase font-sans">
              {activeChapter.title}
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-3 leading-relaxed">
              {activeChapter.subtitle}
            </p>

            {/* If on final chapter, CTA to explore properties */}
            {activeChapter.id === 'gallery' ? (
              <div className="mt-6 flex items-center gap-4">
                <Link
                  href="/properties"
                  className="px-6 py-3 rounded-full bg-brand-gold text-black text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-glow flex items-center gap-2"
                >
                  <span>Enter 3D Gallery</span>
                  <span>→</span>
                </Link>
              </div>
            ) : (
              <div className="mt-5 flex items-center gap-2 text-[11px] text-[var(--text-muted)] tracking-wider">
                <span className="animate-bounce">↓</span>
                <span>Scroll to travel through residence</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Coordinates & Mode info */}
        <div className="flex items-center justify-between text-[10px] tracking-widest text-[var(--text-muted)] border-t border-black/10 dark:border-white/10 pt-3">
          <span>COORDINATES: 40.7580° N, 73.9855° W</span>
          <span>CAMERA DIRECTOR: ACTIVE SCROLL-SCRUB</span>
        </div>
      </div>
    </div>
  );
}
