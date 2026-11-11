'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Hotspot } from '@shortlet/shared';

interface HotspotMarkerProps {
  hotspot: Hotspot;
  radius?: number;
  onClick: (targetSectionId: string, position: [number, number, number]) => void;
}

export function HotspotMarker({ hotspot, radius = 25, onClick }: HotspotMarkerProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Normalize position to specified sphere radius
  const rawPos = new THREE.Vector3(...hotspot.position);
  const pos = rawPos.normalize().multiplyScalar(radius);

  useFrame((state) => {
    if (ringRef.current) {
      // Pulse animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
      ringRef.current.scale.set(scale, scale, scale);
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation?.();
    onClick(hotspot.targetSectionId, hotspot.position);
  };

  return (
    <group position={[pos.x, pos.y, pos.z]}>
      {/* Outer pulsating ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.7, 0.9, 32]} />
        <meshBasicMaterial
          color={hovered ? '#ffffff' : '#dfb76c'}
          side={THREE.DoubleSide}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Inner glowing core button */}
      <mesh
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial
          color={hovered ? '#dfb76c' : '#ffffff'}
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* HTML Glass Billboard Label */}
      <Html
        position={[0, 1.2, 0]}
        center
        distanceFactor={30}
        style={{
          transition: 'all 0.25s ease',
          opacity: hovered ? 1 : 0.85,
          transform: `scale(${hovered ? 1.05 : 1})`,
          pointerEvents: 'auto',
        }}
      >
        <button
          onClick={handleClick}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 hover:border-brand-gold text-white text-xs font-medium tracking-wide shadow-lg whitespace-nowrap cursor-pointer transition-all"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold group-hover:scale-125 transition-transform" />
          <span>{hotspot.label}</span>
          <span className="text-white/50 text-[10px]">→</span>
        </button>
      </Html>
    </group>
  );
}
