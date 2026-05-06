import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FavoriteItem {
  id: string
  title: string
  category: string
  price: number
  providerName: string
  addedAt: string
}

// Placeholder API function — replace with actual backend call when favorites endpoint is available
async function toggleFavoriteAPI(item: FavoriteItem): Promise<boolean> {
  try {
    // For now, just persist locally. When backend adds favorites endpoint,
    // replace this with actual API call
    return true
  } catch {
    return false
  }
}

interface FavoritesState {
  favorites: FavoriteItem[]
  togglingIds: string[] // IDs currently being toggled (for UI loading state)
  addFavorite: (item: FavoriteItem) => void
  removeFavorite: (id: string) => void
  toggleFavorite: (item: FavoriteItem) => Promise<void> // Optimistic toggle
  isFavorite: (id: string) => boolean
  isToggling: (id: string) => boolean // Check if toggle is in progress
  clearFavorites: () => void
  getCount: () => number
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      togglingIds: [],

      addFavorite: (item: FavoriteItem) => {
        const { favorites } = get()
        if (favorites.some((f) => f.id === item.id)) return
        set({ favorites: [...favorites, { ...item, addedAt: new Date().toISOString() }] })
      },

      removeFavorite: (id: string) => {
        set({ favorites: get().favorites.filter((f) => f.id !== id) })
      },

      toggleFavorite: async (item: FavoriteItem) => {
        const { favorites, togglingIds } = get()

        // Prevent double-click
        if (togglingIds.includes(item.id)) return

        const isFav = favorites.some((f) => f.id === item.id)

        // Optimistic update
        if (isFav) {
          set({ favorites: favorites.filter((f) => f.id !== item.id), togglingIds: [...togglingIds, item.id] })
        } else {
          set({ favorites: [...favorites, { ...item, addedAt: new Date().toISOString() }], togglingIds: [...togglingIds, item.id] })
        }

        // API call (currently just a placeholder)
        const success = await toggleFavoriteAPI(item)

        // Remove from toggling list
        const currentToggling = get().togglingIds
        set({ togglingIds: currentToggling.filter((id) => id !== item.id) })

        // Rollback on failure
        if (!success) {
          if (isFav) {
            // Was favorite, removal failed - add it back
            set({ favorites: [...get().favorites, { ...item, addedAt: new Date().toISOString() }] })
          } else {
            // Was not favorite, addition failed - remove it
            set({ favorites: get().favorites.filter((f) => f.id !== item.id) })
          }
        }
      },

      isFavorite: (id: string) => {
        return get().favorites.some((f) => f.id === id)
      },

      isToggling: (id: string) => {
        return get().togglingIds.includes(id)
      },

      clearFavorites: () => {
        set({ favorites: [], togglingIds: [] })
      },

      getCount: () => {
        return get().favorites.length
      },
    }),
    {
      name: 'nabd-favorites',
    }
  )
)
