import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Region {
  id: string
  nameAr: string
  nameEn: string
}

export const REGIONS: Region[] = [
  { id: 'qudsaya', nameAr: 'قدسيا', nameEn: 'Qudsaya' },
  { id: 'dahia', nameAr: 'الضاحية', nameEn: 'Dahia' },
  { id: 'dimas', nameAr: 'الديماس', nameEn: 'Al-Dimas' },
  { id: 'all', nameAr: 'كل المناطق', nameEn: 'All Regions' },
]

interface RegionState {
  selectedRegion: Region
  setRegion: (region: Region) => void
}

export const useRegion = create<RegionState>()(
  persist(
    (set) => ({
      selectedRegion: REGIONS[REGIONS.length - 1], // "All Regions" default
      setRegion: (selectedRegion: Region) => set({ selectedRegion }),
    }),
    {
      name: 'nabd-region',
    }
  )
)
