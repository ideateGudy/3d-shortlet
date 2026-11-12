import * as THREE from 'three';

// Waypoints along the luxury architectural residence journey
const POSITION_POINTS = [
  new THREE.Vector3(0, 3.2, 16),     // 0.0: Arrival - exterior villa approach & reflecting pool
  new THREE.Vector3(-0.5, 2.2, 9),   // 0.2: Gliding toward the entrance glass facade
  new THREE.Vector3(-1.2, 1.5, 3.5), // 0.4: Inside Ground Floor Salon & lounge
  new THREE.Vector3(1.8, 4.6, 3.5),  // 0.6: Zooming into 2nd-floor Master Suite & Balcony
  new THREE.Vector3(0, 8.0, 2.5),    // 0.8: Rooftop Skyline Terrace & Pergola
  new THREE.Vector3(-6, 7.5, 12),    // 1.0: "Find your stay" - cinematic aerial residence overview
];

const LOOKAT_POINTS = [
  new THREE.Vector3(0, 2.8, 2),      // 0.0: Looking at the illuminated villa facade & entrance
  new THREE.Vector3(0, 1.8, 2),      // 0.2: Looking straight into the ground salon
  new THREE.Vector3(1.2, 1.4, 0.5),  // 0.4: Looking across the salon lounge furniture
  new THREE.Vector3(2.5, 4.3, 0.2),  // 0.6: Looking at the master suite king bed & balcony
  new THREE.Vector3(0, 7.4, -4),     // 0.8: Looking across rooftop pergola to horizon
  new THREE.Vector3(0, 4.0, 0),      // 1.0: Looking at the center of the illuminated estate
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
    title: 'THE VILLA FACADE',
    subtitle: 'A sanctuary sculpted in stone and glass. Heated infinity pool and private gated arrival.',
    tag: 'CHAPTER 01',
    startProgress: 0.0,
    endProgress: 0.22,
  },
  {
    id: 'living',
    title: 'GROUND FLOOR SALON',
    subtitle: 'Floor-to-ceiling glass, Italian leather sectional, oak slat acoustics, and ambient evening light.',
    tag: 'CHAPTER 02',
    startProgress: 0.23,
    endProgress: 0.45,
  },
  {
    id: 'bedroom',
    title: 'MASTER SUITE & BALCONY',
    subtitle: 'Cantilevered bedroom sanctuary with floating king bed, glass balustrade, and private sunrise view.',
    tag: 'CHAPTER 03',
    startProgress: 0.46,
    endProgress: 0.68,
  },
  {
    id: 'terrace',
    title: 'ROOFTOP SKY LOUNGE',
    subtitle: 'Open-air pergola, outdoor cocktail lounge, and panoramic skyline vistas suspended above the city.',
    tag: 'CHAPTER 04',
    startProgress: 0.69,
    endProgress: 0.88,
  },
  {
    id: 'gallery',
    title: 'FIND YOUR STAY',
    subtitle: 'Explore our full collection of shortlet estates and reserve your next escape.',
    tag: 'CHAPTER 05',
    startProgress: 0.89,
    endProgress: 1.0,
  },
];
