'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useThemeStore } from '@/lib/store/useThemeStore';

export function LandingScene() {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  // Atmospheric dust motes / fireflies
  const particles = useMemo(() => {
    const count = 160;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 1] = Math.random() * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 35;
    }
    return positions;
  }, []);

  // Theme-adaptive color palette - tuned for clarity and rich architectural contrast
  const colors = {
    ground: isDark ? '#1e293b' : '#cbd5e1',
    groundRoughness: isDark ? 0.4 : 0.45,
    plinth: isDark ? '#334155' : '#e2e8f0',
    pavers: isDark ? '#475569' : '#f8fafc',
    poolBasin: isDark ? '#1e293b' : '#94a3b8',
    poolWater: isDark ? '#0284c7' : '#00b4d8',
    poolOpacity: isDark ? 0.9 : 0.75,
    poolGlow: isDark ? '#38bdf8' : '#00f5d4',
    poolGlowIntensity: isDark ? 2.5 : 1.4,
    wallRear: isDark ? '#475569' : '#e2e8f0',
    columns: isDark ? '#94a3b8' : '#64748b',
    glassTint: isDark ? '#bae6fd' : '#bde0fe',
    glassOpacity: isDark ? 0.35 : 0.35,
    oakSlat: isDark ? '#d97706' : '#a77a4c',
    sofa: isDark ? '#f8fafc' : '#f1f5f9',
    tableMarble: isDark ? '#ffffff' : '#ffffff',
    cantileverWalls: isDark ? '#3b4252' : '#f1f5f9',
    bedFrame: isDark ? '#64748b' : '#cbd5e1',
    bedLinen: isDark ? '#ffffff' : '#ffffff',
    headboard: isDark ? '#d97706' : '#94a3b8',
    balconyDeck: isDark ? '#475569' : '#e2e8f0',
    pergolaPost: isDark ? '#94a3b8' : '#64748b',
    pergolaLouver: isDark ? '#cbd5e1' : '#94a3b8',
    daybed: isDark ? '#ffffff' : '#ffffff',
    firePit: isDark ? '#f97316' : '#00b4d8',
    canopy: isDark ? '#475569' : '#cbd5e1',
    particleColor: '#facc15',
    particleOpacity: isDark ? 0.8 : 0.4,
  };

  return (
    <group>
      {/* ---------------- GROUND & LANDSCAPE ---------------- */}
      {/* Surrounding Ground Plane */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial
          color={colors.ground}
          roughness={colors.groundRoughness}
          metalness={isDark ? 0.7 : 0.15}
        />
      </mesh>

      {/* Villa Foundation Plinth / Base Deck */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[18, 0.3, 16]} />
        <meshStandardMaterial
          color={colors.plinth}
          roughness={0.4}
          metalness={isDark ? 0.6 : 0.2}
        />
      </mesh>

      {/* Entrance Stepping Pavers */}
      {[-1.2, 0, 1.2].map((x, i) => (
        <mesh key={`paver-${i}`} position={[x, 0.12, 10 + i * 1.5]}>
          <boxGeometry args={[1.6, 0.08, 1.0]} />
          <meshStandardMaterial color={colors.pavers} roughness={0.5} />
        </mesh>
      ))}

      {/* Infinity Reflection Pool (front-left of villa) */}
      <group position={[-5.2, 0.15, 5.5]}>
        {/* Pool basin rim */}
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[6.4, 0.25, 4.4]} />
          <meshStandardMaterial color={colors.poolBasin} roughness={0.3} />
        </mesh>
        {/* Pool Water Surface */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6.0, 4.0]} />
          <meshStandardMaterial
            color={colors.poolWater}
            roughness={0.05}
            metalness={isDark ? 0.9 : 0.5}
            transparent
            opacity={colors.poolOpacity}
          />
        </mesh>
        {/* Underwater Pool Glow */}
        <pointLight
          color={colors.poolGlow}
          intensity={colors.poolGlowIntensity}
          distance={6}
          position={[0, 0.2, 0]}
        />
      </group>

      {/* ---------------- GROUND FLOOR SALON (Y: 0 to 3.5) ---------------- */}
      {/* Rear & Side Concrete Enclosure */}
      <mesh position={[0, 1.8, -7]}>
        <boxGeometry args={[16, 3.4, 0.4]} />
        <meshStandardMaterial color={colors.wallRear} roughness={0.8} />
      </mesh>
      <mesh position={[-7.8, 1.8, -1]}>
        <boxGeometry args={[0.4, 3.4, 12]} />
        <meshStandardMaterial color={colors.wallRear} roughness={0.8} />
      </mesh>
      <mesh position={[7.8, 1.8, -1]}>
        <boxGeometry args={[0.4, 3.4, 12]} />
        <meshStandardMaterial color={colors.wallRear} roughness={0.8} />
      </mesh>

      {/* Floor-to-Ceiling Tinted Glass Sliding Doors */}
      <mesh position={[0, 1.8, 4.8]}>
        <boxGeometry args={[15.2, 3.2, 0.08]} />
        <meshStandardMaterial
          color={colors.glassTint}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={colors.glassOpacity}
        />
      </mesh>

      {/* Ground Floor Architectural Columns */}
      {[-6, 6].map((x) => (
        <mesh key={`col-${x}`} position={[x, 1.8, 4.8]}>
          <boxGeometry args={[0.35, 3.4, 0.35]} />
          <meshStandardMaterial color={colors.columns} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Salon Interior Furniture */}
      <group position={[0, 0.3, 0]}>
        {/* Oak Slat Feature Wall Behind Sofa */}
        <group position={[0, 1.5, -6.6]}>
          {Array.from({ length: 14 }).map((_, i) => (
            <mesh key={`slat-${i}`} position={[(i - 6.5) * 0.4, 0, 0]}>
              <boxGeometry args={[0.08, 2.8, 0.08]} />
              <meshStandardMaterial color={colors.oakSlat} roughness={0.7} />
            </mesh>
          ))}
        </group>

        {/* L-Shaped Sectional Sofa */}
        <group position={[0, 0.3, -1.5]}>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[3.8, 0.45, 1.4]} />
            <meshStandardMaterial color={colors.sofa} roughness={0.7} />
          </mesh>
          <mesh position={[1.4, 0.2, 1.2]}>
            <boxGeometry args={[1.0, 0.45, 1.4]} />
            <meshStandardMaterial color={colors.sofa} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.55, -0.6]}>
            <boxGeometry args={[3.8, 0.35, 0.3]} />
            <meshStandardMaterial color={colors.sofa} roughness={0.7} />
          </mesh>
        </group>

        {/* Modernist Marble & Brass Coffee Table */}
        <mesh position={[0, 0.3, 0.6]}>
          <boxGeometry args={[2.0, 0.2, 0.9]} />
          <meshStandardMaterial color={colors.tableMarble} roughness={0.2} metalness={0.3} />
        </mesh>

        {/* Suspended Warm Chandelier / Pendant */}
        <mesh position={[0, 2.8, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
          <meshStandardMaterial color="#dfb76c" metalness={0.9} roughness={0.1} />
        </mesh>
        <pointLight
          color="#ffdd99"
          intensity={isDark ? 2.0 : 1.3}
          distance={9}
          position={[0, 2.4, 0]}
        />
      </group>

      {/* ---------------- LEVEL 2 FLOOR SLAB & CANTILEVER (Y: 3.5 to 3.8) ---------------- */}
      <mesh position={[0, 3.6, 0.5]}>
        <boxGeometry args={[17.5, 0.35, 16.5]} />
        <meshStandardMaterial color={colors.plinth} roughness={0.3} metalness={isDark ? 0.7 : 0.2} />
      </mesh>

      {/* ---------------- LEVEL 2: MASTER SUITE (Y: 3.8 to 7.0) ---------------- */}
      <group position={[2.5, 5.2, 1.0]}>
        {/* Suite Walls */}
        <mesh position={[0, 0, -4.5]}>
          <boxGeometry args={[10, 3.0, 0.3]} />
          <meshStandardMaterial color={colors.cantileverWalls} roughness={0.8} />
        </mesh>
        <mesh position={[5.0, 0, 0]}>
          <boxGeometry args={[0.3, 3.0, 9.0]} />
          <meshStandardMaterial color={colors.cantileverWalls} roughness={0.8} />
        </mesh>
        <mesh position={[-5.0, 0, -1.5]}>
          <boxGeometry args={[0.3, 3.0, 6.0]} />
          <meshStandardMaterial color={colors.cantileverWalls} roughness={0.8} />
        </mesh>

        {/* Master Panoramic Glass Facade */}
        <mesh position={[0, 0, 4.4]}>
          <boxGeometry args={[9.8, 2.9, 0.08]} />
          <meshStandardMaterial
            color={colors.glassTint}
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={colors.glassOpacity}
          />
        </mesh>

        {/* Master Bedroom Platform King Bed */}
        <group position={[0.5, -1.1, -1.0]}>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[2.4, 0.35, 2.6]} />
            <meshStandardMaterial color={colors.bedFrame} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[2.2, 0.25, 2.4]} />
            <meshStandardMaterial color={colors.bedLinen} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.75, -1.2]}>
            <boxGeometry args={[2.6, 0.9, 0.2]} />
            <meshStandardMaterial color={colors.headboard} roughness={0.7} />
          </mesh>
          {/* Bedside Warm Sconces */}
          {[-1.4, 1.4].map((side, i) => (
            <group key={`sconce-${i}`} position={[side, 0.7, -1.1]}>
              <mesh>
                <boxGeometry args={[0.1, 0.25, 0.1]} />
                <meshStandardMaterial color="#dfb76c" metalness={0.9} />
              </mesh>
              <pointLight color="#ffe4b5" intensity={isDark ? 0.8 : 0.5} distance={3.5} />
            </group>
          ))}
        </group>

        {/* Master Balcony & Glass Railing */}
        <group position={[0, -1.3, 5.5]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[10, 0.15, 2.2]} />
            <meshStandardMaterial color={colors.balconyDeck} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.55, 1.05]}>
            <boxGeometry args={[9.8, 0.95, 0.05]} />
            <meshStandardMaterial
              color="#a0e0ff"
              transparent
              opacity={0.35}
              roughness={0.05}
              metalness={0.9}
            />
          </mesh>
          <mesh position={[0, 1.05, 1.05]}>
            <boxGeometry args={[10, 0.05, 0.08]} />
            <meshStandardMaterial color="#dfb76c" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* ---------------- LEVEL 3: ROOFTOP SKY LOUNGE & PERGOLA (Y: 7.0 to 10) ---------------- */}
      <group position={[0, 7.0, 0]}>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[15, 0.2, 14]} />
          <meshStandardMaterial color={colors.plinth} roughness={0.5} />
        </mesh>

        <mesh position={[0, 0.6, 6.8]}>
          <boxGeometry args={[14.6, 0.95, 0.05]} />
          <meshStandardMaterial color="#a0e0ff" transparent opacity={0.3} roughness={0.1} />
        </mesh>

        {/* Pergola Posts & Louvers */}
        {[-4, 4].map((px) =>
          [-3, 3].map((pz, idx) => (
            <mesh key={`pergola-post-${px}-${pz}-${idx}`} position={[px, 1.3, pz]}>
              <boxGeometry args={[0.18, 2.6, 0.18]} />
              <meshStandardMaterial color={colors.pergolaPost} metalness={0.8} />
            </mesh>
          ))
        )}
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={`louver-${i}`} position={[0, 2.6, (i - 4) * 0.7]}>
            <boxGeometry args={[8.4, 0.08, 0.25]} />
            <meshStandardMaterial color={colors.pergolaLouver} roughness={0.6} />
          </mesh>
        ))}

        {/* Rooftop Daybeds */}
        {[-2.2, 2.2].map((x, idx) => (
          <group key={`daybed-${idx}`} position={[x, 0.3, 0]}>
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[1.4, 0.3, 2.6]} />
              <meshStandardMaterial color={colors.daybed} roughness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Rooftop Fire Pit / Water Feature */}
        <group position={[0, 0.3, 3.5]}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.7, 0.5, 0.4, 32]} />
            <meshStandardMaterial color={colors.pergolaPost} roughness={0.4} />
          </mesh>
          <pointLight
            color={colors.firePit}
            intensity={isDark ? 2.2 : 1.6}
            distance={6}
            position={[0, 0.5, 0]}
          />
        </group>
      </group>

      {/* ---------------- EXTERIOR ARCHITECTURAL ACCENTS & LIGHTING ---------------- */}
      <group position={[0, 3.5, 7.0]}>
        <mesh>
          <boxGeometry args={[5.0, 0.15, 3.2]} />
          <meshStandardMaterial color={colors.canopy} metalness={0.8} roughness={0.3} />
        </mesh>
        <pointLight
          color="#dfb76c"
          intensity={isDark ? 1.8 : 1.2}
          distance={7}
          position={[0, -0.3, 0]}
        />
      </group>

      {/* Planter boxes with greenery silhouettes */}
      {[-7.2, 7.2].map((x, idx) => (
        <group key={`planter-${idx}`} position={[x, 0.3, 4.0]}>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[1.2, 0.5, 3.0]} />
            <meshStandardMaterial color={colors.columns} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <coneGeometry args={[0.5, 0.9, 8]} />
            <meshStandardMaterial color="#1c3a27" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Ambient Floating Dust / Light motes */}
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
          size={0.07}
          color={colors.particleColor}
          transparent
          opacity={colors.particleOpacity}
        />
      </points>

      {/* Distant Golden Horizon Arc */}
      <mesh position={[0, 4.0, -22]}>
        <ringGeometry args={[6.5, 6.7, 64]} />
        <meshBasicMaterial
          color="#dfb76c"
          side={THREE.DoubleSide}
          transparent
          opacity={isDark ? 0.35 : 0.2}
        />
      </mesh>
    </group>
  );
}
