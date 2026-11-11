'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useCameraStore } from '@/lib/store/useCameraStore';

interface DepthPhotoPlaneProps {
  imageUrl: string;
}

export function DepthPhotoPlane({ imageUrl }: DepthPhotoPlaneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useTexture(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  useFrame((state) => {
    if (!groupRef.current) return;
    const reduced = useCameraStore.getState().reducedMotion;
    if (reduced) return;

    // Subtle parallax response to pointer
    const mouseX = state.pointer.x * 0.15;
    const mouseY = state.pointer.y * 0.15;

    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      mouseX,
      4,
      0.016
    );
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      -mouseY,
      4,
      0.016
    );
  });

  return (
    <group ref={groupRef} position={[0, 0, -4]}>
      {/* Main photo plane with 16:9 ratio */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[8, 4.5]} />
        <meshBasicMaterial map={texture} />
      </mesh>

      {/* Glass border frame */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[8.3, 4.8]} />
        <meshStandardMaterial
          color="#161c28"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Subtle reflective floor plane */}
      <mesh position={[0, -2.25, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial
          color="#06080d"
          roughness={0.1}
          metalness={0.6}
        />
      </mesh>
    </group>
  );
}
