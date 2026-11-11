'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { useCameraStore } from '@/lib/store/useCameraStore';
import { usePropertyViewStore } from '@/lib/store/usePropertyViewStore';
import { PanoramaSphere } from '../objects/PanoramaSphere';
import { DepthPhotoPlane } from '../objects/DepthPhotoPlane';
import { HotspotMarker } from '../objects/HotspotMarker';
import * as THREE from 'three';

export function ImmersiveScene() {
  const { gl } = useThree();
  const property = usePropertyViewStore((s) => s.property);
  const activeSectionIndex = usePropertyViewStore((s) => s.activeSectionIndex);
  const setActiveSectionById = usePropertyViewStore((s) => s.setActiveSectionById);

  const [dragActive, setDragActive] = useState(false);
  const lastPointerPos = useRef<{ x: number; y: number } | null>(null);

  const currentSection = property?.sections?.[activeSectionIndex];

  // Drag to look-around listener on canvas element
  useEffect(() => {
    const domElement = gl.domElement;

    const handlePointerDown = (e: PointerEvent) => {
      // Only drag with primary mouse button or touch
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      setDragActive(true);
      lastPointerPos.current = { x: e.clientX, y: e.clientY };
      useCameraStore.getState().interruptFlight();
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!lastPointerPos.current) return;

      const deltaX = e.clientX - lastPointerPos.current.x;
      const deltaY = e.clientY - lastPointerPos.current.y;
      lastPointerPos.current = { x: e.clientX, y: e.clientY };

      // Sensitivity tuning: radians per pixel
      const sensitivity = 0.003;
      useCameraStore.getState().updateLookAngles(
        -deltaX * sensitivity,
        deltaY * sensitivity
      );
    };

    const handlePointerUp = () => {
      setDragActive(false);
      lastPointerPos.current = null;
    };

    domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [gl]);

  // Mobile Device Orientation Gyroscope support
  useEffect(() => {
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha === null || e.beta === null || e.gamma === null) return;
      const reduced = useCameraStore.getState().reducedMotion;
      if (reduced) return;

      // Subtle gyro orientation tracking
      const yaw = THREE.MathUtils.degToRad(e.alpha);
      const pitch = THREE.MathUtils.degToRad(e.beta - 45); // offset for natural viewing angle
      useCameraStore.getState().setLookAngles(yaw, pitch * 0.5);
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, []);

  // When active section changes, initialize look angles if specified
  useEffect(() => {
    if (currentSection) {
      if (currentSection.initialYaw !== undefined || currentSection.initialPitch !== undefined) {
        useCameraStore.getState().setLookAngles(
          currentSection.initialYaw ?? 0,
          currentSection.initialPitch ?? 0
        );
      }
    }
  }, [currentSection]);

  const handleHotspotClick = (targetSectionId: string, hotspotPos: [number, number, number]) => {
    const cameraStore = useCameraStore.getState();

    // 1. Calculate flight toward hotspot
    const targetDir = new THREE.Vector3(...hotspotPos).normalize();
    const flightWaypoint = {
      position: [targetDir.x * 2.5, targetDir.y * 2.5, targetDir.z * 2.5] as [number, number, number],
      target: [targetDir.x * 10, targetDir.y * 10, targetDir.z * 10] as [number, number, number],
      fov: 65,
    };

    // 2. Fly toward hotspot with FOV punch and crossfade
    cameraStore.flyTo(flightWaypoint, {
      duration: 0.75,
      fovPulse: 12,
      onComplete: () => {
        // Swap section
        setActiveSectionById(targetSectionId);
        // Reset camera position back to center
        cameraStore.setCurrentWaypoint({
          position: [0, 0, 0],
          target: [0, 0, -1],
          fov: 75,
        });
      },
    });
  };

  if (!currentSection) {
    return null;
  }

  const isPanorama = currentSection.type === 'PANORAMA';

  return (
    <group>
      {isPanorama ? (
        <PanoramaSphere imageUrl={currentSection.imageUrl} radius={40} />
      ) : (
        <DepthPhotoPlane imageUrl={currentSection.imageUrl} />
      )}

      {/* Render Hotspots */}
      {currentSection.hotspots &&
        Array.isArray(currentSection.hotspots) &&
        currentSection.hotspots.map((hs: any) => (
          <HotspotMarker
            key={hs.id || `${hs.targetSectionId}-${hs.label}`}
            hotspot={hs}
            radius={isPanorama ? 25 : 3.5}
            onClick={handleHotspotClick}
          />
        ))}
    </group>
  );
}
