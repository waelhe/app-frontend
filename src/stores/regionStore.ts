/**
 * Region Store — Zustand store for region selection management.
 * Merges functionality from RegionContext and use-region into a single store.
 * Supports Arabic and English region names with localStorage persistence.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types & Constants ─────────────────────────────────────────────

export interface Region {
  id: string;
  nameAr: string;
  nameEn: string;
}

export const REGIONS: Region[] = [
  { id: 'qudsaya', nameAr: 'قدسيا', nameEn: 'Qudsaya' },
  { id: 'dahia', nameAr: 'الضاحية', nameEn: 'Dahia' },
  { id: 'dimas', nameAr: 'الديماس', nameEn: 'Al-Dimas' },
  { id: 'all', nameAr: 'كل المناطق', nameEn: 'All Regions' },
];

interface RegionState {
  selectedRegion: Region;
  setRegion: (region: Region) => void;
  regionLabel: () => string;
  regionLabelEn: () => string;
}

// ── Store ─────────────────────────────────────────────────────────

export const useRegionStore = create<RegionState>()(
  persist(
    (set, get) => ({
      selectedRegion: REGIONS[REGIONS.length - 1], // "All Regions" default

      setRegion: (region: Region) => set({ selectedRegion: region }),

      regionLabel: () => get().selectedRegion.nameAr,

      regionLabelEn: () => get().selectedRegion.nameEn,
    }),
    {
      name: 'nabd-region',
    }
  )
);

// ── Convenience alias ─────────────────────────────────────────────

/** Alias for useRegionStore — use either name interchangeably */
export const useRegion = useRegionStore;
