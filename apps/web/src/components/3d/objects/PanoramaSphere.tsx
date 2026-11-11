'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

interface PanoramaSphereProps {
  imageUrl: string;
  radius?: number;
}

export function PanoramaSphere({ imageUrl, radius = 50 }: PanoramaSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(imageUrl);

  // Set texture mapping properties for optimal equirectangular projection
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} scale={[-1, 1, 1]}>
      <sphereGeometry args={[radius, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}
