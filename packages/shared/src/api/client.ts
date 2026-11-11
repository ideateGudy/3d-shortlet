import type {
  Property,
  PropertyFilterParams,
  PropertySection,
} from '../types/property.js';
import type {
  AvailabilityResponse,
  Booking,
  CreateHoldDto,
  CreateBlockedDateDto,
  BlockedDate,
} from '../types/booking.js';
import type { AuthResponse, LoginDto } from '../types/auth.js';

export interface ApiClientConfig {
  baseUrl: string;
  getToken?: () => string | null;
}

export class ShortletApiClient {
  private baseUrl: string;
  private getToken?: () => string | null;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.getToken = config.getToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = this.getToken ? this.getToken() : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMessage = `API error ${res.status}: ${res.statusText}`;
      try {
        const errorData = await res.json();
        if (errorData.message) {
          errorMessage = Array.isArray(errorData.message)
            ? errorData.message.join(', ')
            : errorData.message;
        }
      } catch {
        // ignore JSON parse error
      }
      const error = new Error(errorMessage) as Error & { status?: number };
      error.status = res.status;
      throw error;
    }

    return res.json() as Promise<T>;
  }

  // Auth
  async login(dto: LoginDto): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async getMe(): Promise<AuthResponse['user']> {
    return this.request<AuthResponse['user']>('/auth/me');
  }

  // Properties
  async getProperties(params?: PropertyFilterParams): Promise<Property[]> {
    const query = new URLSearchParams();
    if (params) {
      if (params.location) query.set('location', params.location);
      if (params.minPrice) query.set('minPrice', params.minPrice.toString());
      if (params.maxPrice) query.set('maxPrice', params.maxPrice.toString());
      if (params.bedrooms) query.set('bedrooms', params.bedrooms.toString());
      if (params.guests) query.set('guests', params.guests.toString());
      if (params.checkIn) query.set('checkIn', params.checkIn);
      if (params.checkOut) query.set('checkOut', params.checkOut);
    }
    const qs = query.toString();
    return this.request<Property[]>(`/properties${qs ? `?${qs}` : ''}`);
  }

  async getPropertyBySlug(slug: string): Promise<Property> {
    return this.request<Property>(`/properties/${slug}`);
  }

  async createProperty(data: Partial<Property>): Promise<Property> {
    return this.request<Property>('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProperty(id: string, data: Partial<Property>): Promise<Property> {
    return this.request<Property>(`/properties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProperty(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/properties/${id}`, {
      method: 'DELETE',
    });
  }

  // Sections
  async createSection(propertyId: string, data: Partial<PropertySection>): Promise<PropertySection> {
    return this.request<PropertySection>(`/properties/${propertyId}/sections`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSection(
    propertyId: string,
    sectionId: string,
    data: Partial<PropertySection>
  ): Promise<PropertySection> {
    return this.request<PropertySection>(`/properties/${propertyId}/sections/${sectionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async reorderSections(
    propertyId: string,
    sectionOrders: { id: string; order: number }[]
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/properties/${propertyId}/sections/reorder`, {
      method: 'POST',
      body: JSON.stringify({ sectionOrders }),
    });
  }

  async deleteSection(propertyId: string, sectionId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/properties/${propertyId}/sections/${sectionId}`, {
      method: 'DELETE',
    });
  }

  // Availability & Bookings
  async getAvailability(propertyId: string, month: string): Promise<AvailabilityResponse> {
    return this.request<AvailabilityResponse>(
      `/properties/${propertyId}/availability?month=${month}`
    );
  }

  async createHold(dto: CreateHoldDto): Promise<Booking> {
    return this.request<Booking>('/bookings/hold', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async confirmBooking(bookingId: string): Promise<Booking> {
    return this.request<Booking>('/bookings/confirm', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    });
  }

  async getAllBookings(): Promise<Booking[]> {
    return this.request<Booking[]>('/bookings');
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Blocks
  async getBlockedDates(propertyId: string): Promise<BlockedDate[]> {
    return this.request<BlockedDate[]>(`/properties/${propertyId}/blocks`);
  }

  async createBlockedDate(dto: CreateBlockedDateDto): Promise<BlockedDate> {
    return this.request<BlockedDate>('/blocks', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async deleteBlockedDate(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/blocks/${id}`, {
      method: 'DELETE',
    });
  }

  // Uploads
  async uploadFile(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${this.baseUrl}/media/upload`;
    const headers: Record<string, string> = {};
    const token = this.getToken ? this.getToken() : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.statusText}`);
    }

    return res.json();
  }
}
