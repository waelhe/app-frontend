'use client'

import { useRegion as useStoreRegion } from '@/store/use-region'
import { RegionProvider as ContextRegionProvider } from '@/contexts/RegionContext'

/**
 * Combined RegionProvider that:
 * 1. Initializes the store-based region
 * 2. Provides the context-based RegionProvider (for components using useRegion from contexts)
 */
export function RegionProvider({ children }: { children: React.ReactNode }) {
  useStoreRegion()
  return (
    <ContextRegionProvider>
      {children}
    </ContextRegionProvider>
  )
}
