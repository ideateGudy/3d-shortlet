export type SectionType = 'PANORAMA' | 'PHOTO';

export interface Hotspot {
  id: string;
  targetSectionId: string;
  label: string;
  position: [number, number, number]; // 3D coordinates on unit sphere or plane
  normal?: [number, number, number];
}

export interface PropertySection {
  id: string;
  propertyId: string;
  name: string;
  order: number;
  type: SectionType;
  imageUrl: string;
  initialYaw?: number; // radians or degrees
  initialPitch?: number;
  hotspots: Hotspot[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Amenity {
  id: string;
  propertyId: string;
  name: string;
  icon: string;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  tagLine: string;
  description: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  cleaningFee: number;
  minNights: number;
  maxNights: number;
  rules?: string;
  isFeatured: boolean;
  sections?: PropertySection[];
  amenities?: Amenity[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyFilterParams {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  guests?: number;
  amenities?: string[];
  checkIn?: string;
  checkOut?: string;
}
