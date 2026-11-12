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
  const lenisRef = useRef<Lenis | null>(null);
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
    lenisRef.current = lenis;

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

  const jumpToChapter = (chapterIdx: number) => {
    if (!lenisRef.current || !containerRef.current) return;
    const targetChapter = LANDING_CHAPTERS[chapterIdx];
    if (!targetChapter) return;
    const totalHeight = containerRef.current.scrollHeight - window.innerHeight;
    const targetScrollY = targetChapter.startProgress * totalHeight;
    lenisRef.current.scrollTo(targetScrollY, { duration: 1.4 });
  };

  const activeChapter = LANDING_CHAPTERS[activeChapterIndex] || LANDING_CHAPTERS[0];

  return (
    <div ref={containerRef} className="relative w-full h-[500vh]">
      {/* Fixed Sticky HUD Overlay */}
      <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-8 sm:p-12 z-20">
        {/* Top Progress Meter & Interactive Chapter Navigation */}
        <div className="flex items-center justify-between text-xs tracking-widest text-[var(--text-muted)] border-b border-black/10 dark:border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-brand-gold font-mono font-bold">
              {String(scrollPercent).padStart(2, '0')}%
            </span>
            <span>SPATIAL JOURNEY</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 pointer-events-auto">
            {LANDING_CHAPTERS.map((c, i) => (
              <button
                key={c.id}
                onClick={() => jumpToChapter(i)}
                className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider transition-all ${
                  activeChapterIndex === i
                    ? 'bg-brand-gold text-black shadow-glow'
                    : 'bg-black/5 dark:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/10 dark:hover:bg-white/20'
                }`}
              >
                {c.tag}: {c.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Center Chapter Glass Card */}
        <div className="max-w-xl self-start pointer-events-auto transition-all duration-500 ease-out transform">
          <div className="glass-panel rounded-glass-lg p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-widest text-brand-gold uppercase">
                {activeChapter.tag}
              </span>
              <div className="flex items-center gap-1.5">
                {LANDING_CHAPTERS.map((_, i) => (
                  <span
                    key={`dot-${i}`}
                    onClick={() => jumpToChapter(i)}
                    className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                      activeChapterIndex === i ? 'bg-brand-gold scale-125' : 'bg-black/20 dark:bg-white/30 hover:bg-brand-gold/60'
                    }`}
                  />
                ))}
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mt-1.5 uppercase font-sans">
              {activeChapter.title}
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-3 leading-relaxed">
              {activeChapter.subtitle}
            </p>

            {/* Interactive Chapter Quick-Skip Actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {activeChapterIndex < LANDING_CHAPTERS.length - 1 ? (
                <button
                  onClick={() => jumpToChapter(activeChapterIndex + 1)}
                  className="px-5 py-2.5 rounded-full bg-black/10 dark:bg-white/10 hover:bg-brand-gold hover:text-black text-[var(--text-primary)] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border border-black/10 dark:border-white/10"
                >
                  <span>Tour Next: {LANDING_CHAPTERS[activeChapterIndex + 1].title.toLowerCase()}</span>
                  <span>↓</span>
                </button>
              ) : null}

              <Link
                href="/properties"
                className="px-6 py-2.5 rounded-full bg-brand-gold text-black text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-glow flex items-center gap-2"
              >
                <span>Browse All Residences</span>
                <span>→</span>
              </Link>
            </div>
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
