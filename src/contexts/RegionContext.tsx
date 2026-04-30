/**
 * RegionContext — Region selection context.
 * Supports 'qudsaya-center' and 'qudsaya-dahia' regions.
 */

'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

// ── Types ─────────────────────────────────────────────────────────

export type Region = 'qudsaya-center' | 'qudsaya-dahia';

interface RegionContextType {
  region: Region;
  setRegion: (region: Region) => void;
  regionLabel: string;
}

// ── Region Labels ─────────────────────────────────────────────────

const regionLabels: Record<Region, string> = {
  'qudsaya-center': 'Qudsaya Center',
  'qudsaya-dahia': 'Qudsaya Dahia',
};

// ── Context ───────────────────────────────────────────────────────

const REGION_KEY = 'marketplace_region';

const RegionContext = createContext<RegionContextType | undefined>(undefined);

function getInitialRegion(): Region {
  if (typeof window === 'undefined') return 'qudsaya-center';
  const stored = localStorage.getItem(REGION_KEY) as Region | null;
  if (stored && (stored === 'qudsaya-center' || stored === 'qudsaya-dahia')) return stored;
  return 'qudsaya-center';
}

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegionState] = useState<Region>(getInitialRegion);

  const setRegion = useCallback((newRegion: Region) => {
    setRegionState(newRegion);
    if (typeof window !== 'undefined') {
      localStorage.setItem(REGION_KEY, newRegion);
    }
  }, []);

  // Sync if another tab changes the region
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === REGION_KEY && e.newValue) {
        const val = e.newValue as Region;
        if (val === 'qudsaya-center' || val === 'qudsaya-dahia') {
          setRegionState(val);
        }
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const regionLabel = regionLabels[region];

  const value = useMemo(
    () => ({ region, setRegion, regionLabel }),
    [region, setRegion, regionLabel],
  );

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────────

export function useRegion(): RegionContextType {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}
