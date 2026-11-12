'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CameraDirector } from './CameraDirector';
import { useCameraStore } from '@/lib/store/useCameraStore';
import { useThemeStore } from '@/lib/store/useThemeStore';
import { LandingScene } from './scenes/LandingScene';
import { GalleryScene } from './scenes/GalleryScene';
import { ImmersiveScene } from './scenes/ImmersiveScene';

function CanvasBackground() {
  const { gl, scene } = useThree();
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    // Elegant deep twilight blue-gray for dark mode instead of pitch black
    const bgColor = theme === 'dark' ? '#0f172a' : '#f1f5f9';
    const color = new THREE.Color(bgColor);
    gl.setClearColor(color, 1);
    scene.background = color;
  }, [gl, scene, theme]);

  return null;
}

function SceneManager() {
  const mode = useCameraStore((state) => state.mode);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  return (
    <>
      <CanvasBackground />

      {/* Adaptive ambient lighting - brightened for crisp nighttime visibility */}
      <ambientLight intensity={isDark ? 1.6 : 1.8} color={isDark ? '#cbd5e1' : '#f8fafc'} />

      {/* Primary directional sun/moonlight */}
      <directionalLight
        position={isDark ? [15, 25, 20] : [12, 28, 14]}
        intensity={isDark ? 2.2 : 2.5}
        color={isDark ? '#e2e8f0' : '#fff8ed'}
      />

      {/* Secondary fill light from opposite angle to reveal shadows */}
      <directionalLight
        position={isDark ? [-15, 18, -10] : [-12, 20, -10]}
        intensity={isDark ? 1.4 : 1.0}
        color={isDark ? '#93c5fd' : '#ffffff'}
      />

      {/* Warm architectural accent lights */}
      <pointLight
        position={[0, 4, 10]}
        intensity={isDark ? 2.5 : 1.2}
        color="#dfb76c"
        distance={25}
      />
      <pointLight
        position={[-10, 2, -5]}
        intensity={isDark ? 1.5 : 0.8}
        color={isDark ? '#38bdf8' : '#ffd17a'}
        distance={20}
      />

      {mode === 'LANDING' && <LandingScene />}
      {mode === 'GALLERY' && <GalleryScene />}
      {(mode === 'IMMERSIVE' || mode === 'VANTAGE') && <ImmersiveScene />}
    </>
  );
}

export function AppCanvas() {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [mounted, setMounted] = useState(false);
  const theme = useThemeStore((s) => s.theme);

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
    return <div className="fixed inset-0 z-0 bg-[var(--bg-primary)] transition-colors duration-300" />;
  }

  if (!hasWebGL) {
    return (
      <div className="fixed inset-0 z-0 bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-muted)] transition-colors duration-300">
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
