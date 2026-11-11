import { create } from 'zustand';
import type { Property, PropertySection } from '@shortlet/shared';

interface PropertyViewState {
  property: Property | null;
  activeSectionIndex: number;
  isBookingOpen: boolean;
  isDragging: boolean;

  setProperty: (property: Property | null) => void;
  setActiveSectionIndex: (index: number) => void;
  setActiveSectionById: (sectionId: string) => void;
  setBookingOpen: (open: boolean) => void;
  setIsDragging: (dragging: boolean) => void;
}

export const usePropertyViewStore = create<PropertyViewState>((set, get) => ({
  property: null,
  activeSectionIndex: 0,
  isBookingOpen: false,
  isDragging: false,

  setProperty: (property) => {
    set({
      property,
      activeSectionIndex: 0,
      isBookingOpen: false,
    });
  },

  setActiveSectionIndex: (activeSectionIndex) => {
    set({ activeSectionIndex });
  },

  setActiveSectionById: (sectionId) => {
    const property = get().property;
    if (!property?.sections) return;
    const index = property.sections.findIndex((s) => s.id === sectionId);
    if (index !== -1) {
      set({ activeSectionIndex: index });
    }
  },

  setBookingOpen: (isBookingOpen) => {
    set({ isBookingOpen });
  },

  setIsDragging: (isDragging) => {
    set({ isDragging });
  },
}));
