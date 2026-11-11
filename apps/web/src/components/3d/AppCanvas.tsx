'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraDirector } from './CameraDirector';
import { useCameraStore } from '@/lib/store/useCameraStore';
import { LandingScene } from './scenes/LandingScene';
import { GalleryScene } from './scenes/GalleryScene';
import { ImmersiveScene } from './scenes/ImmersiveScene';

function SceneManager() {
  const mode = useCameraStore((state) => state.mode);

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 20, 15]} intensity={1.2} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#dfb76c" />

      {mode === 'LANDING' && <LandingScene />}
      {mode === 'GALLERY' && <GalleryScene />}
      {(mode === 'IMMERSIVE' || mode === 'VANTAGE') && <ImmersiveScene />}
    </>
  );
}

export function AppCanvas() {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }

    // Detect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    useCameraStore.getState().setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      useCameraStore.getState().setReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 z-0 bg-[#06080d]" />;
  }

  if (!hasWebGL) {
    return (
      <div className="fixed inset-0 z-0 bg-[#06080d] flex items-center justify-center text-white/60">
        <p>WebGL is not supported on this device. 2D fallback mode active.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-auto">
      <Canvas
        camera={{ position: [0, 1.8, 14], fov: 75, near: 0.1, far: 1000 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <CameraDirector />
          <SceneManager />
        </Suspense>
      </Canvas>
    </div>
  );
}
