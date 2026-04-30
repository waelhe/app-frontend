/**
 * UI Store — Zustand store for UI state management.
 * Manages sidebar, search, category selection, and location filters.
 */

import { create } from 'zustand';

interface UIStore {
  /** Whether the mobile sidebar is open */
  sidebarOpen: boolean;
  /** Currently active section in the sidebar/nav */
  activeSection: string;
  /** Global search query */
  searchQuery: string;
  /** Selected category filter */
  selectedCategory: string;
  /** Selected location/region filter */
  selectedLocation: string;

  /** Set sidebar open state */
  setSidebarOpen: (open: boolean) => void;
  /** Toggle sidebar open/close */
  toggleSidebar: () => void;
  /** Set active navigation section */
  setActiveSection: (section: string) => void;
  /** Set search query */
  setSearchQuery: (query: string) => void;
  /** Set selected category */
  setSelectedCategory: (category: string) => void;
  /** Set selected location */
  setSelectedLocation: (location: string) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  sidebarOpen: false,
  activeSection: 'home',
  searchQuery: '',
  selectedCategory: '',
  selectedLocation: '',

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),

  setActiveSection: (section) => set({ activeSection: section }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  setSelectedLocation: (location) => set({ selectedLocation: location }),
}));
