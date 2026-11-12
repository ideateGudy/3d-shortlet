'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useThemeStore } from '@/lib/store/useThemeStore';

export function GalleryScene() {
  const groupRef = useRef<THREE.Group>(null);
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  // Floating ambient geometric particles in gallery depth
  const particles = useMemo(() => {
    const count = 90;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 8 - 2;
      positions[i * 3 + 2] = -Math.random() * 25;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * 0.15;
    groupRef.current.rotation.y = Math.sin(t) * 0.05;
  });

  const floorColor = isDark ? '#080a10' : '#e2e8f0';

  return (
    <group ref={groupRef}>
      {/* Reflective gallery floor plane */}
      <mesh position={[0, -1.8, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color={floorColor}
          roughness={isDark ? 0.2 : 0.35}
          metalness={isDark ? 0.8 : 0.2}
        />
      </mesh>

      {/* Floating golden architectural rings in depth */}
      {[-8, -15, -22].map((z, i) => (
        <group key={`ring-${z}`} position={[0, 1.2, z]}>
          <mesh>
            <torusGeometry args={[3.2 + i * 0.8, 0.03, 16, 64]} />
            <meshBasicMaterial
              color="#dfb76c"
              transparent
              opacity={isDark ? 0.35 - i * 0.08 : 0.25 - i * 0.06}
            />
          </mesh>
          <pointLight color="#dfb76c" intensity={isDark ? 0.4 : 0.6} distance={6} />
        </group>
      ))}

      {/* Atmospheric particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.length / 3}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#dfb76c"
          transparent
          opacity={isDark ? 0.5 : 0.3}
        />
      </points>
    </group>
  );
}
