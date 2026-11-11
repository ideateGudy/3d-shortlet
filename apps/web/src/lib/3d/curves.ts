import * as THREE from 'three';

// Waypoints along the architectural journey
const POSITION_POINTS = [
  new THREE.Vector3(0, 1.8, 14),   // 0.0: Arrival - exterior approach
  new THREE.Vector3(0, 1.6, 9),    // 0.2: Entry portal - threshold
  new THREE.Vector3(-1.5, 1.5, 4), // 0.4: Grand Living Hall
  new THREE.Vector3(1.2, 1.4, 0),  // 0.6: Master Bedroom
  new THREE.Vector3(0, 1.5, -4),   // 0.8: Skyline Terrace
  new THREE.Vector3(0, 1.2, -9),   // 1.0: "Find your stay" - glide toward portal gallery
];

const LOOKAT_POINTS = [
  new THREE.Vector3(0, 1.5, 8),    // 0.0: looking forward at main entrance
  new THREE.Vector3(0, 1.4, 3),    // 0.2: looking through entryway
  new THREE.Vector3(0.5, 1.3, 0),  // 0.4: looking across living space
  new THREE.Vector3(-0.5, 1.4, -3),// 0.6: looking toward terrace view
  new THREE.Vector3(0, 1.2, -8),   // 0.8: looking over terrace balustrade
  new THREE.Vector3(0, 1.0, -15),  // 1.0: looking straight into property portals
];

export const landingPositionCurve = new THREE.CatmullRomCurve3(POSITION_POINTS, false, 'catmullrom', 0.5);
export const landingLookAtCurve = new THREE.CatmullRomCurve3(LOOKAT_POINTS, false, 'catmullrom', 0.5);

export interface LandingChapter {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  startProgress: number;
  endProgress: number;
}

export const LANDING_CHAPTERS: LandingChapter[] = [
  {
    id: 'arrival',
    title: 'THE ARRIVAL',
    subtitle: 'Step beyond the ordinary. Enter a world sculpted in monolithic stone and light.',
    tag: 'CHAPTER 01',
    startProgress: 0.0,
    endProgress: 0.22,
  },
  {
    id: 'living',
    title: 'THE GRAND SALON',
    subtitle: 'Unbounded horizons, acoustic serenity, and handcrafted natural finishes.',
    tag: 'CHAPTER 02',
    startProgress: 0.23,
    endProgress: 0.45,
  },
  {
    id: 'bedroom',
    title: 'THE MASTER SANCTUARY',
    subtitle: 'Where silence becomes an architectural element designed for profound rest.',
    tag: 'CHAPTER 03',
    startProgress: 0.46,
    endProgress: 0.68,
  },
  {
    id: 'terrace',
    title: 'THE SKYLINE BALCONY',
    subtitle: 'Suspended above the metropolis. Evening cocktails bathed in golden hour light.',
    tag: 'CHAPTER 04',
    startProgress: 0.69,
    endProgress: 0.88,
  },
  {
    id: 'gallery',
    title: 'FIND YOUR STAY',
    subtitle: 'Explore curated architectural estates ready for your arrival.',
    tag: 'EXPLORE',
    startProgress: 0.89,
    endProgress: 1.0,
  },
];
