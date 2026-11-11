'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCameraStore } from '@/lib/store/useCameraStore';
import { anglesToDirection, getIdleSway } from '@/lib/3d/cameraUtils';
import { landingPositionCurve, landingLookAtCurve } from '@/lib/3d/curves';

export function CameraDirector() {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3(0, 0, -1));
  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const prevPosition = useRef(new THREE.Vector3());
  const flightStartTime = useRef<number | null>(null);

  // Initialize camera position from store on mount
  useEffect(() => {
    const store = useCameraStore.getState();
    const wp = store.currentWaypoint;
    camera.position.set(...wp.position);
    currentPos.current.copy(camera.position);
    prevPosition.current.copy(camera.position);

    if (camera instanceof THREE.PerspectiveCamera && wp.fov) {
      camera.fov = wp.fov;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  useFrame((state, delta) => {
    const store = useCameraStore.getState();
    const {
      mode,
      scrollProgress,
      lookAngles,
      isTransitioning,
      targetWaypoint,
      currentWaypoint,
      flightOptions,
      reducedMotion,
    } = store;

    const time = state.clock.elapsedTime;
    const sway = reducedMotion ? { x: 0, y: 0 } : getIdleSway(time, 0.015);

    // 1. Scripted flight in progress
    if (isTransitioning && targetWaypoint) {
      if (flightStartTime.current === null) {
        flightStartTime.current = time;
      }

      const duration = flightOptions?.duration || 0.8;
      const elapsed = time - flightStartTime.current;
      const rawProgress = Math.min(1, elapsed / duration);

      // Smooth ease: cubic power3 in-out
      const t =
        rawProgress < 0.5
          ? 4 * rawProgress * rawProgress * rawProgress
          : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;

      // Interpolate position
      const startPos = new THREE.Vector3(...currentWaypoint.position);
      const endPos = new THREE.Vector3(...targetWaypoint.position);
      camera.position.lerpVectors(startPos, endPos, t);

      // Interpolate lookAt target
      const startTarget = new THREE.Vector3(...currentWaypoint.target);
      const endTarget = new THREE.Vector3(...targetWaypoint.target);
      const lerpedTarget = new THREE.Vector3().lerpVectors(startTarget, endTarget, t);
      camera.lookAt(lerpedTarget);

      // FOV pulse during flight (+10 at peak t=0.5)
      if (camera instanceof THREE.PerspectiveCamera) {
        const baseFov = currentWaypoint.fov || 75;
        const targetFov = targetWaypoint.fov || 75;
        const fovPulseAmount = flightOptions?.fovPulse ?? 10;
        const pulse = Math.sin(t * Math.PI) * fovPulseAmount;
        camera.fov = THREE.MathUtils.lerp(baseFov, targetFov, t) + (reducedMotion ? 0 : pulse);
        camera.updateProjectionMatrix();
      }

      store.setProgress(rawProgress);

      if (rawProgress >= 1) {
        flightStartTime.current = null;
        store.completeFlight();
      }
      return;
    }

    // Reset flight start time when not transitioning
    flightStartTime.current = null;

    // 2. Mode-specific behaviors
    if (mode === 'LANDING') {
      // Follow scroll curves
      const curvePos = landingPositionCurve.getPointAt(scrollProgress);
      const curveLook = landingLookAtCurve.getPointAt(scrollProgress);

      targetPos.current.copy(curvePos);
      targetPos.current.x += sway.x;
      targetPos.current.y += sway.y;

      targetLookAt.current.copy(curveLook);

      // Smooth exponential damping
      const dampFactor = Math.min(1, delta * 6);
      camera.position.lerp(targetPos.current, dampFactor);
      currentLookAt.current.lerp(targetLookAt.current, dampFactor);
      camera.lookAt(currentLookAt.current);

      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = THREE.MathUtils.damp(camera.fov, 75, 4, delta);
        camera.updateProjectionMatrix();
      }
    } else if (mode === 'GALLERY') {
      // Gallery lateral depth rail
      const dampFactor = Math.min(1, delta * 5);
      camera.position.lerp(new THREE.Vector3(...currentWaypoint.position), dampFactor);
      currentLookAt.current.lerp(new THREE.Vector3(...currentWaypoint.target), dampFactor);
      camera.lookAt(currentLookAt.current);

      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = THREE.MathUtils.damp(camera.fov, 70, 4, delta);
        camera.updateProjectionMatrix();
      }
    } else if (mode === 'IMMERSIVE') {
      // Centered look-around inside panorama sphere or room
      const center = new THREE.Vector3(...currentWaypoint.position);
      camera.position.copy(center);

      // Convert yaw and pitch into direction
      const dir = anglesToDirection(lookAngles.yaw + sway.x * 2, lookAngles.pitch + sway.y * 2);
      const lookTarget = new THREE.Vector3().copy(center).add(dir);

      // Damped rotation
      const dampFactor = Math.min(1, delta * 12);
      currentLookAt.current.lerp(lookTarget, dampFactor);
      camera.lookAt(currentLookAt.current);

      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = THREE.MathUtils.damp(camera.fov, currentWaypoint.fov || 75, 4, delta);
        camera.updateProjectionMatrix();
      }
    } else if (mode === 'VANTAGE') {
      // Calmed pulled-back vantage angle framing room behind booking glass
      const vantagePos = new THREE.Vector3(0, 0.2, -0.6);
      const vantageLook = new THREE.Vector3(0, 0, -5);

      const dampFactor = Math.min(1, delta * 4);
      camera.position.lerp(vantagePos, dampFactor);
      currentLookAt.current.lerp(vantageLook, dampFactor);
      camera.lookAt(currentLookAt.current);

      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = THREE.MathUtils.damp(camera.fov, 68, 3, delta);
        camera.updateProjectionMatrix();
      }
    }

    // Velocity computation for post-processing intensity
    const distMoved = camera.position.distanceTo(prevPosition.current);
    const speed = delta > 0 ? distMoved / delta : 0;
    store.setVelocity(speed);
    prevPosition.current.copy(camera.position);
  });

  return null;
}
