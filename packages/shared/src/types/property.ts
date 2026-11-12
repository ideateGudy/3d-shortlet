export type SectionType = 'PANORAMA' | 'PHOTO';

export type PropertyCategory =
  | 'LUXURY_APARTMENT'
  | 'WATERFRONT_VILLA'
  | 'PENTHOUSE'
  | 'BOUTIQUE_SHORTLET'
  | 'COZY_STUDIO';

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
  initialYaw?: number;
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

export interface HostProfile {
  name: string;
  avatar?: string;
  isSuperhost: boolean;
  responseTime?: string;
  responseRate?: string;
}

export interface Review {
  id: string;
  propertyId: string;
  guestName: string;
  guestAvatar?: string;
  rating: number;
  comment: string;
  stayDate?: string;
  createdAt?: string;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  tagLine: string;
  description: string;
  location: string;
  city?: string;
  neighborhood?: string;
  category?: PropertyCategory;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  cleaningFee: number;
  cautionDeposit?: number;
  serviceFeePercent?: number;
  minNights: number;
  maxNights: number;
  rules?: string;
  isFeatured: boolean;
  has247Power?: boolean;
  hasSecurity?: boolean;
  hasPool?: boolean;
  hasChef?: boolean;
  hasWifi?: boolean;
  rating?: number;
  reviewCount?: number;
  hostName?: string;
  hostAvatar?: string;
  hostIsSuperhost?: boolean;
  hostResponseTime?: string;
  neighborhoodHighlights?: string[];
  sections?: PropertySection[];
  amenities?: Amenity[];
  reviews?: Review[];
  createdAt?: string;
  updatedAt?: string;
}


export interface PropertyFilterParams {
  location?: string;
  city?: string;
  category?: PropertyCategory;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  guests?: number;
  amenities?: string[];
  has247Power?: boolean;
  hasPool?: boolean;
  hasSecurity?: boolean;
  hasChef?: boolean;
  checkIn?: string;
  checkOut?: string;
}
