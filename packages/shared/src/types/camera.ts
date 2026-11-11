export type CameraMode =
  | 'LANDING'
  | 'GALLERY'
  | 'IMMERSIVE'
  | 'VANTAGE'
  | 'CINEMATIC';

export interface CameraWaypoint {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}

export interface CameraFlightOptions {
  duration?: number; // seconds
  ease?: string; // GSAP ease string e.g. "power3.inOut"
  fovPulse?: number; // delta FOV during flight e.g. 10
  onComplete?: () => void;
  interruptible?: boolean;
}

export interface LookAngles {
  yaw: number; // horizontal radians
  pitch: number; // vertical radians
}
