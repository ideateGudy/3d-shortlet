export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface Booking {
  id: string;
  propertyId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  adults: number;
  children: number;
  checkIn: string; // ISO date string YYYY-MM-DD
  checkOut: string; // ISO date string YYYY-MM-DD
  status: BookingStatus;
  totalPrice: number;
  cleaningFee: number;
  nights: number;
  holdExpiresAt?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type BlockReason = 'MAINTENANCE' | 'OWNER_STAY' | 'OTHER';

export interface BlockedDate {
  id: string;
  propertyId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: BlockReason;
  createdAt?: string;
  updatedAt?: string;
}

export type DayAvailabilityStatus = 'available' | 'booked' | 'held' | 'blocked' | 'past';

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  status: DayAvailabilityStatus;
  price?: number;
}

export interface AvailabilityResponse {
  propertyId: string;
  month: string; // YYYY-MM
  days: DayAvailability[];
}

export interface CreateHoldDto {
  propertyId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  adults: number;
  children: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  notes?: string;
}

export interface ConfirmBookingDto {
  bookingId: string;
}

export interface CreateBlockedDateDto {
  propertyId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: BlockReason;
}
