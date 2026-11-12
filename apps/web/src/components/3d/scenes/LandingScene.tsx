'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

export function LandingScene() {
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

  return (
    <group>
      {/* ---------------- GROUND & LANDSCAPE ---------------- */}
      {/* Surrounding Dark Ground Plane */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#07090e" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Villa Foundation Plinth / Base Deck */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[18, 0.3, 16]} />
        <meshStandardMaterial color="#11151f" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Entrance Stepping Pavers */}
      {[-1.2, 0, 1.2].map((x, i) => (
        <mesh key={`paver-${i}`} position={[x, 0.12, 10 + i * 1.5]}>
          <boxGeometry args={[1.6, 0.08, 1.0]} />
          <meshStandardMaterial color="#1a202c" roughness={0.5} />
        </mesh>
      ))}

      {/* Infinity Reflection Pool (front-left of villa) */}
      <group position={[-5.2, 0.15, 5.5]}>
        {/* Pool basin rim */}
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[6.4, 0.25, 4.4]} />
          <meshStandardMaterial color="#0e131d" roughness={0.3} />
        </mesh>
        {/* Pool Water Surface */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6.0, 4.0]} />
          <meshStandardMaterial
            color="#0d3b4c"
            roughness={0.05}
            metalness={0.9}
            transparent
            opacity={0.88}
          />
        </mesh>
        {/* Underwater Pool Glow */}
        <pointLight color="#1de9b6" intensity={0.8} distance={5} position={[0, 0.2, 0]} />
      </group>

      {/* ---------------- GROUND FLOOR SALON (Y: 0 to 3.5) ---------------- */}
      {/* Rear & Side Concrete Enclosure */}
      <mesh position={[0, 1.8, -7]}>
        <boxGeometry args={[16, 3.4, 0.4]} />
        <meshStandardMaterial color="#151a24" roughness={0.8} />
      </mesh>
      <mesh position={[-7.8, 1.8, -1]}>
        <boxGeometry args={[0.4, 3.4, 12]} />
        <meshStandardMaterial color="#151a24" roughness={0.8} />
      </mesh>
      <mesh position={[7.8, 1.8, -1]}>
        <boxGeometry args={[0.4, 3.4, 12]} />
        <meshStandardMaterial color="#151a24" roughness={0.8} />
      </mesh>

      {/* Floor-to-Ceiling Tinted Glass Sliding Doors */}
      <mesh position={[0, 1.8, 4.8]}>
        <boxGeometry args={[15.2, 3.2, 0.08]} />
        <meshStandardMaterial
          color="#8ac7db"
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Ground Floor Architectural Columns */}
      {[-6, 6].map((x) => (
        <mesh key={`col-${x}`} position={[x, 1.8, 4.8]}>
          <boxGeometry args={[0.35, 3.4, 0.35]} />
          <meshStandardMaterial color="#2d3748" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Salon Interior Furniture */}
      <group position={[0, 0.3, 0]}>
        {/* Oak Slat Feature Wall Behind Sofa */}
        <group position={[0, 1.5, -6.6]}>
          {Array.from({ length: 14 }).map((_, i) => (
            <mesh key={`slat-${i}`} position={[(i - 6.5) * 0.4, 0, 0]}>
              <boxGeometry args={[0.08, 2.8, 0.08]} />
              <meshStandardMaterial color="#3d2a1a" roughness={0.7} />
            </mesh>
          ))}
        </group>

        {/* L-Shaped Italian Leather Sofa */}
        <group position={[0, 0.3, -1.5]}>
          {/* Main seating block */}
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[3.8, 0.45, 1.4]} />
            <meshStandardMaterial color="#20242c" roughness={0.7} />
          </mesh>
          {/* Chaise section */}
          <mesh position={[1.4, 0.2, 1.2]}>
            <boxGeometry args={[1.0, 0.45, 1.4]} />
            <meshStandardMaterial color="#20242c" roughness={0.7} />
          </mesh>
          {/* Backrest */}
          <mesh position={[0, 0.55, -0.6]}>
            <boxGeometry args={[3.8, 0.35, 0.3]} />
            <meshStandardMaterial color="#20242c" roughness={0.7} />
          </mesh>
        </group>

        {/* Modernist Marble & Brass Coffee Table */}
        <mesh position={[0, 0.3, 0.6]}>
          <boxGeometry args={[2.0, 0.2, 0.9]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.3} />
        </mesh>

        {/* Suspended Warm Chandelier / Pendant */}
        <mesh position={[0, 2.8, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
          <meshStandardMaterial color="#dfb76c" metalness={0.9} roughness={0.1} />
        </mesh>
        <pointLight color="#ffdd99" intensity={2.0} distance={9} position={[0, 2.4, 0]} />
      </group>

      {/* ---------------- LEVEL 2 FLOOR SLAB & CANTILEVER (Y: 3.5 to 3.8) ---------------- */}
      <mesh position={[0, 3.6, 0.5]}>
        <boxGeometry args={[17.5, 0.35, 16.5]} />
        <meshStandardMaterial color="#1a202c" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* ---------------- LEVEL 2: MASTER SUITE (Y: 3.8 to 7.0) ---------------- */}
      {/* Cantilevered Suite Volume */}
      <group position={[2.5, 5.2, 1.0]}>
        {/* Suite Walls */}
        <mesh position={[0, 0, -4.5]}>
          <boxGeometry args={[10, 3.0, 0.3]} />
          <meshStandardMaterial color="#181e2b" roughness={0.8} />
        </mesh>
        <mesh position={[5.0, 0, 0]}>
          <boxGeometry args={[0.3, 3.0, 9.0]} />
          <meshStandardMaterial color="#181e2b" roughness={0.8} />
        </mesh>
        <mesh position={[-5.0, 0, -1.5]}>
          <boxGeometry args={[0.3, 3.0, 6.0]} />
          <meshStandardMaterial color="#181e2b" roughness={0.8} />
        </mesh>

        {/* Master Panoramic Glass Facade */}
        <mesh position={[0, 0, 4.4]}>
          <boxGeometry args={[9.8, 2.9, 0.08]} />
          <meshStandardMaterial
            color="#8ac7db"
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Master Bedroom Platform King Bed */}
        <group position={[0.5, -1.1, -1.0]}>
          {/* Bed Frame */}
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[2.4, 0.35, 2.6]} />
            <meshStandardMaterial color="#2d3748" roughness={0.6} />
          </mesh>
          {/* White Linen Mattress & Pillows */}
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[2.2, 0.25, 2.4]} />
            <meshStandardMaterial color="#f7fafc" roughness={0.9} />
          </mesh>
          {/* Upholstered Headboard */}
          <mesh position={[0, 0.75, -1.2]}>
            <boxGeometry args={[2.6, 0.9, 0.2]} />
            <meshStandardMaterial color="#4a5568" roughness={0.7} />
          </mesh>
          {/* Bedside Warm Sconces */}
          {[-1.4, 1.4].map((side, i) => (
            <group key={`sconce-${i}`} position={[side, 0.7, -1.1]}>
              <mesh>
                <boxGeometry args={[0.1, 0.25, 0.1]} />
                <meshStandardMaterial color="#dfb76c" metalness={0.9} />
              </mesh>
              <pointLight color="#ffe4b5" intensity={0.8} distance={3.5} />
            </group>
          ))}
        </group>

        {/* Master Balcony & Glass Railing */}
        <group position={[0, -1.3, 5.5]}>
          {/* Balcony Deck */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[10, 0.15, 2.2]} />
            <meshStandardMaterial color="#2b3240" roughness={0.4} />
          </mesh>
          {/* Glass Railing */}
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
          {/* Gold Handrail Trim */}
          <mesh position={[0, 1.05, 1.05]}>
            <boxGeometry args={[10, 0.05, 0.08]} />
            <meshStandardMaterial color="#dfb76c" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* ---------------- LEVEL 3: ROOFTOP SKY LOUNGE & PERGOLA (Y: 7.0 to 10) ---------------- */}
      <group position={[0, 7.0, 0]}>
        {/* Rooftop Hardwood Deck */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[15, 0.2, 14]} />
          <meshStandardMaterial color="#1e2532" roughness={0.5} />
        </mesh>

        {/* Perimeter Glass Balustrade */}
        <mesh position={[0, 0.6, 6.8]}>
          <boxGeometry args={[14.6, 0.95, 0.05]} />
          <meshStandardMaterial color="#a0e0ff" transparent opacity={0.3} roughness={0.1} />
        </mesh>

        {/* Architectural Pergola Structure */}
        {/* Vertical Posts */}
        {[-4, 4].map((px) =>
          [-3, 3].map((pz, idx) => (
            <mesh key={`pergola-post-${px}-${pz}-${idx}`} position={[px, 1.3, pz]}>
              <boxGeometry args={[0.18, 2.6, 0.18]} />
              <meshStandardMaterial color="#2d3748" metalness={0.8} />
            </mesh>
          ))
        )}
        {/* Horizontal Pergola Louvers */}
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={`louver-${i}`} position={[0, 2.6, (i - 4) * 0.7]}>
            <boxGeometry args={[8.4, 0.08, 0.25]} />
            <meshStandardMaterial color="#1f242e" roughness={0.6} />
          </mesh>
        ))}

        {/* Rooftop Lounge Daybeds */}
        {[-2.2, 2.2].map((x, idx) => (
          <group key={`daybed-${idx}`} position={[x, 0.3, 0]}>
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[1.4, 0.3, 2.6]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Rooftop Fire Pit / Water Bowl */}
        <group position={[0, 0.3, 3.5]}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.7, 0.5, 0.4, 32]} />
            <meshStandardMaterial color="#1a202c" roughness={0.4} />
          </mesh>
          <pointLight color="#ff8c00" intensity={2.2} distance={6} position={[0, 0.5, 0]} />
        </group>
      </group>

      {/* ---------------- EXTERIOR ARCHITECTURAL ACCENTS & LIGHTING ---------------- */}
      {/* Front Entrance Canopy with Recessed Warm LED Strip */}
      <group position={[0, 3.5, 7.0]}>
        <mesh>
          <boxGeometry args={[5.0, 0.15, 3.2]} />
          <meshStandardMaterial color="#111622" metalness={0.8} roughness={0.3} />
        </mesh>
        <pointLight color="#dfb76c" intensity={1.8} distance={7} position={[0, -0.3, 0]} />
      </group>

      {/* Planter boxes with greenery silhouettes */}
      {[-7.2, 7.2].map((x, idx) => (
        <group key={`planter-${idx}`} position={[x, 0.3, 4.0]}>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[1.2, 0.5, 3.0]} />
            <meshStandardMaterial color="#1a202c" roughness={0.7} />
          </mesh>
          {/* Foliage geometry */}
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
        <pointsMaterial size={0.07} color="#dfb76c" transparent opacity={0.65} />
      </points>

      {/* Distant Golden Horizon Arc */}
      <mesh position={[0, 4.0, -22]}>
        <ringGeometry args={[6.5, 6.7, 64]} />
        <meshBasicMaterial color="#dfb76c" side={THREE.DoubleSide} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
