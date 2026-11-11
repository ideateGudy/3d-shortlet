'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

export function LandingScene() {
  // Dust motes / atmospheric ambient particles
  const particles = useMemo(() => {
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 35;
    }
    return positions;
  }, []);

  return (
    <group>
      {/* Reflective dark architectural floor */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial
          color="#06080d"
          roughness={0.15}
          metalness={0.8}
        />
      </mesh>

      {/* Ceiling canopy with subtle recessed lighting slots */}
      <mesh position={[0, 4.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial
          color="#0c0f17"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Architectural Pillars & Glass Panels along the journey */}
      {[-6, 6].map((x) =>
        [12, 6, 0, -6, -12].map((z, idx) => (
          <group key={`${x}-${z}-${idx}`} position={[x, 2.2, z]}>
            <mesh>
              <boxGeometry args={[0.3, 4.5, 0.3]} />
              <meshStandardMaterial
                color="#141923"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            {/* Soft accent glow on pillars */}
            <pointLight
              color="#dfb76c"
              intensity={0.4}
              distance={4}
              position={[x > 0 ? -0.3 : 0.3, 0, 0]}
            />
          </group>
        ))
      )}

      {/* Ambient floating light particles */}
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
          opacity={0.6}
        />
      </points>

      {/* Golden accent horizon line at the far end of the journey */}
      <mesh position={[0, 1.8, -16]}>
        <ringGeometry args={[2.8, 2.9, 64]} />
        <meshBasicMaterial color="#dfb76c" side={THREE.DoubleSide} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
