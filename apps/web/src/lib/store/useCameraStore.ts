import { create } from 'zustand';
import type { CameraMode, CameraWaypoint, CameraFlightOptions, LookAngles } from '@shortlet/shared';

export interface CameraState {
  mode: CameraMode;
  currentWaypoint: CameraWaypoint;
  targetWaypoint: CameraWaypoint | null;
  flightOptions: CameraFlightOptions | null;
  progress: number;
  scrollProgress: number;
  lookAroundEnabled: boolean;
  lookAngles: LookAngles;
  velocity: number;
  isTransitioning: boolean;
  reducedMotion: boolean;
  flightQueue: Array<{ waypoint: CameraWaypoint; options?: CameraFlightOptions }>;

  // Actions
  setMode: (mode: CameraMode) => void;
  flyTo: (waypoint: CameraWaypoint, options?: CameraFlightOptions) => void;
  setScrollProgress: (progress: number) => void;
  setProgress: (progress: number) => void;
  setLookAroundEnabled: (enabled: boolean) => void;
  updateLookAngles: (deltaYaw: number, deltaPitch: number) => void;
  setLookAngles: (yaw: number, pitch: number) => void;
  setVelocity: (velocity: number) => void;
  interruptFlight: () => void;
  completeFlight: () => void;
  setReducedMotion: (reduced: boolean) => void;
  setCurrentWaypoint: (wp: CameraWaypoint) => void;
}

const DEFAULT_WAYPOINT: CameraWaypoint = {
  position: [0, 0, 5],
  target: [0, 0, 0],
  fov: 75,
};

export const useCameraStore = create<CameraState>((set, get) => ({
  mode: 'LANDING',
  currentWaypoint: DEFAULT_WAYPOINT,
  targetWaypoint: null,
  flightOptions: null,
  progress: 0,
  scrollProgress: 0,
  lookAroundEnabled: false,
  lookAngles: { yaw: 0, pitch: 0 },
  velocity: 0,
  isTransitioning: false,
  reducedMotion: false,
  flightQueue: [],

  setMode: (mode) => {
    const currentMode = get().mode;
    if (currentMode === mode) return;

    // Reset mode-specific states cleanly
    set({
      mode,
      lookAroundEnabled: mode === 'IMMERSIVE',
    });
  },

  flyTo: (waypoint, options) => {
    const state = get();

    // Check if target is already identical to current or pending target
    if (
      state.targetWaypoint &&
      state.targetWaypoint.position[0] === waypoint.position[0] &&
      state.targetWaypoint.position[1] === waypoint.position[1] &&
      state.targetWaypoint.position[2] === waypoint.position[2]
    ) {
      return;
    }

    if (state.reducedMotion) {
      // In reduced motion mode, snap immediately or perform fast crossfade
      set({
        currentWaypoint: waypoint,
        targetWaypoint: null,
        isTransitioning: false,
        progress: 1,
      });
      options?.onComplete?.();
      return;
    }

    // Set target waypoint and begin flight
    set({
      targetWaypoint: waypoint,
      flightOptions: options || null,
      isTransitioning: true,
      progress: 0,
    });
  },

  setScrollProgress: (scrollProgress) => {
    set({ scrollProgress: Math.max(0, Math.min(1, scrollProgress)) });
  },

  setProgress: (progress) => {
    set({ progress: Math.max(0, Math.min(1, progress)) });
  },

  setLookAroundEnabled: (lookAroundEnabled) => {
    set({ lookAroundEnabled });
  },

  updateLookAngles: (deltaYaw, deltaPitch) => {
    set((state) => {
      // Clamp pitch to prevent flipping (approx -85° to +85°)
      const maxPitch = (Math.PI / 2) * 0.95;
      const newPitch = Math.max(-maxPitch, Math.min(maxPitch, state.lookAngles.pitch + deltaPitch));
      const newYaw = (state.lookAngles.yaw + deltaYaw) % (Math.PI * 2);

      return {
        lookAngles: {
          yaw: newYaw,
          pitch: newPitch,
        },
      };
    });
  },

  setLookAngles: (yaw, pitch) => {
    const maxPitch = (Math.PI / 2) * 0.95;
    const clampedPitch = Math.max(-maxPitch, Math.min(maxPitch, pitch));
    set({
      lookAngles: { yaw, pitch: clampedPitch },
    });
  },

  setVelocity: (velocity) => {
    set({ velocity });
  },

  interruptFlight: () => {
    const { isTransitioning } = get();
    if (!isTransitioning) return;

    set({
      isTransitioning: false,
      targetWaypoint: null,
      flightOptions: null,
      flightQueue: [],
    });
  },

  completeFlight: () => {
    const state = get();
    if (!state.isTransitioning) return;

    const completedWaypoint = state.targetWaypoint || state.currentWaypoint;
    const onComplete = state.flightOptions?.onComplete;

    // Check if there are queued flights
    const nextFlight = state.flightQueue[0];
    const remainingQueue = state.flightQueue.slice(1);

    set({
      currentWaypoint: completedWaypoint,
      targetWaypoint: nextFlight ? nextFlight.waypoint : null,
      flightOptions: nextFlight ? nextFlight.options || null : null,
      isTransitioning: !!nextFlight,
      progress: 0,
      flightQueue: remainingQueue,
    });

    onComplete?.();
  },

  setReducedMotion: (reducedMotion) => {
    set({ reducedMotion });
  },

  setCurrentWaypoint: (currentWaypoint) => {
    set({ currentWaypoint });
  },
}));
