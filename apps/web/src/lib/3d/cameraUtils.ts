import * as THREE from 'three';

/**
 * Converts yaw and pitch angles (radians) into a normalized look-at direction vector.
 */
export function anglesToDirection(yaw: number, pitch: number): THREE.Vector3 {
  const cosPitch = Math.cos(pitch);
  const x = Math.sin(yaw) * cosPitch;
  const y = Math.sin(pitch);
  const z = -Math.cos(yaw) * cosPitch;
  return new THREE.Vector3(x, y, z).normalize();
}

/**
 * Converts 2D equirectangular UV (0 to 1) into a 3D unit sphere normal vector.
 * Useful for admin visual hotspot placement on 360° panoramas.
 */
export function uvToSphericalVector(u: number, v: number, radius = 1): [number, number, number] {
  // Longitude theta: -PI to PI
  const theta = (u - 0.5) * 2 * Math.PI;
  // Latitude phi: -PI/2 to PI/2
  const phi = (0.5 - v) * Math.PI;

  const cosPhi = Math.cos(phi);
  const x = radius * Math.sin(theta) * cosPhi;
  const y = radius * Math.sin(phi);
  const z = -radius * Math.cos(theta) * cosPhi;

  return [x, y, z];
}

/**
 * Converts a 3D point on a sphere into 2D equirectangular UV (0 to 1).
 */
export function sphericalVectorToUV(pos: [number, number, number]): { u: number; v: number } {
  const [x, y, z] = pos;
  const r = Math.sqrt(x * x + y * y + z * z) || 1;
  const clampedY = Math.max(-1, Math.min(1, y / r));

  const phi = Math.asin(clampedY);
  const theta = Math.atan2(x, -z);

  let u = 0.5 + theta / (2 * Math.PI);
  if (u < 0) u += 1;
  if (u > 1) u -= 1;

  const v = 0.5 - phi / Math.PI;

  return { u, v };
}

/**
 * Calculates subtle procedural idle sway to add natural life to the camera.
 */
export function getIdleSway(time: number, amplitude = 0.02): { x: number; y: number } {
  const x = (Math.sin(time * 0.75) * 0.7 + Math.cos(time * 1.25) * 0.3) * amplitude;
  const y = (Math.cos(time * 0.6) * 0.7 + Math.sin(time * 1.4) * 0.3) * amplitude;
  return { x, y };
}

/**
 * Smoothly damps a current value toward a target using exponential decay.
 */
export function dampScalar(current: number, target: number, lambda: number, delta: number): number {
  return THREE.MathUtils.damp(current, target, lambda, delta);
}
