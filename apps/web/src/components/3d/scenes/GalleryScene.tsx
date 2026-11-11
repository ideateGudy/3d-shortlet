'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import { useCameraStore } from '@/lib/store/useCameraStore';
import type { Property } from '@shortlet/shared';

interface PropertyPortalProps {
  property: Property;
  index: number;
  isActive: boolean;
  onHover: (index: number) => void;
  onSelect: (slug: string, position: [number, number, number]) => void;
}

function PropertyPortal({
  property,
  index,
  isActive,
  onHover,
  onSelect,
}: PropertyPortalProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const xPos = index * 4.6 - 6.9; // Center 4 properties nicely
  const previewImage =
    property.sections?.[0]?.imageUrl ||
    `/placeholders/${property.slug}-living.jpg`;

  const texture = useTexture(previewImage);
  texture.colorSpace = THREE.SRGBColorSpace;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const targetScale = hovered || isActive ? 1.05 : 1.0;
    const targetZ = hovered || isActive ? 0.3 : 0;

    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);
    meshRef.current.position.z = THREE.MathUtils.damp(meshRef.current.position.z, targetZ, 8, delta);
  });

  return (
    <group
      ref={meshRef}
      position={[xPos, 1.2, 0]}
      onPointerOver={() => {
        setHovered(true);
        onHover(index);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={() => onSelect(property.slug, [xPos, 1.2, 0])}
    >
      {/* Portal Image Plane */}
      <mesh position={[0, 0.4, 0]}>
        <planeGeometry args={[3.6, 2.4]} />
        <meshBasicMaterial map={texture} />
      </mesh>

      {/* Glass frame */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[3.8, 3.4, 0.08]} />
        <meshStandardMaterial
          color="#0f1420"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Golden accent border on hover */}
      <mesh position={[0, 0, -0.01]}>
        <ringGeometry args={[1.9, 1.93, 32]} />
        <meshBasicMaterial
          color="#dfb76c"
          transparent
          opacity={hovered || isActive ? 0.9 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glass card HTML info label */}
      <Html
        position={[0, -1.0, 0.1]}
        center
        distanceFactor={18}
        style={{ pointerEvents: 'auto' }}
      >
        <button
          onClick={() => onSelect(property.slug, [xPos, 1.2, 0])}
          className="w-64 p-3.5 rounded-2xl bg-black/70 backdrop-blur-md border border-white/20 hover:border-brand-gold/80 text-left transition-all shadow-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-brand-gold font-medium">
              {property.location}
            </span>
            <span className="text-xs text-white/50">{property.bedrooms} Bed</span>
          </div>
          <h3 className="text-sm font-semibold text-white mt-1 group-hover:text-brand-gold transition-colors">
            {property.title}
          </h3>
          <div className="mt-2 flex items-baseline justify-between border-t border-white/10 pt-2">
            <span className="text-xs text-white/70">From</span>
            <span className="text-sm font-bold text-white">
              ${property.pricePerNight} <span className="text-[10px] font-normal text-white/50">/ night</span>
            </span>
          </div>
        </button>
      </Html>
    </group>
  );
}

interface GallerySceneProps {
  properties?: Property[];
}

export function GalleryScene({ properties }: GallerySceneProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  // Fallback default sample properties if not loaded yet
  const items: Property[] = properties && properties.length > 0 ? properties : [
    {
      id: '1',
      slug: 'obsidian-penthouse',
      title: 'The Obsidian Penthouse',
      tagLine: 'Ultra-luxurious high-rise sanctuary',
      description: '',
      location: 'Manhattan, NY',
      bedrooms: 4,
      bathrooms: 5,
      maxGuests: 8,
      pricePerNight: 2850,
      cleaningFee: 350,
      minNights: 2,
      maxNights: 14,
      isFeatured: true,
    },
    {
      id: '2',
      slug: 'azure-cliffside-villa',
      title: 'Azure Cliffside Villa',
      tagLine: 'Sculpted cliffside estate',
      description: '',
      location: 'Santorini, Greece',
      bedrooms: 5,
      bathrooms: 6,
      maxGuests: 10,
      pricePerNight: 3400,
      cleaningFee: 400,
      minNights: 3,
      maxNights: 21,
      isFeatured: true,
    },
    {
      id: '3',
      slug: 'komorebi-forest-sanctuary',
      title: 'Komorebi Forest Sanctuary',
      tagLine: 'Minimalist cedar timber pavilion',
      description: '',
      location: 'Kyoto, Japan',
      bedrooms: 3,
      bathrooms: 3,
      maxGuests: 6,
      pricePerNight: 1950,
      cleaningFee: 250,
      minNights: 2,
      maxNights: 10,
      isFeatured: true,
    },
    {
      id: '4',
      slug: 'solis-desert-pavilion',
      title: 'Solis Desert Pavilion',
      tagLine: 'Mid-century glass pavilion',
      description: '',
      location: 'Joshua Tree, CA',
      bedrooms: 3,
      bathrooms: 3,
      maxGuests: 6,
      pricePerNight: 1650,
      cleaningFee: 200,
      minNights: 2,
      maxNights: 14,
      isFeatured: false,
    },
  ];

  const handleHover = (index: number) => {
    setActiveIndex(index);
    const xPos = index * 4.6 - 6.9;
    // Aim camera toward hovered portal
    useCameraStore.getState().flyTo(
      {
        position: [xPos * 0.7, 1.2, 4.2],
        target: [xPos, 1.2, 0],
        fov: 68,
      },
      { duration: 0.5, fovPulse: 2 }
    );
  };

  const handleSelect = (slug: string, portalPos: [number, number, number]) => {
    // Fly straight through the portal into the property!
    useCameraStore.getState().flyTo(
      {
        position: [portalPos[0], portalPos[1], -0.5],
        target: [portalPos[0], portalPos[1], -10],
        fov: 55,
      },
      {
        duration: 0.9,
        fovPulse: 14,
        onComplete: () => {
          router.push(`/properties/${slug}`);
        },
      }
    );
  };

  return (
    <group>
      {/* Depth Rail Line */}
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[25, 0.04]} />
        <meshBasicMaterial color="#dfb76c" transparent opacity={0.4} />
      </mesh>

      {/* Floating property portals */}
      {items.map((item, idx) => (
        <PropertyPortal
          key={item.id || item.slug}
          property={item}
          index={idx}
          isActive={activeIndex === idx}
          onHover={handleHover}
          onSelect={handleSelect}
        />
      ))}
    </group>
  );
}
