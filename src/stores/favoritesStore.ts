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

interface FavoritesState {
  favorites: FavoriteItem[]
  addFavorite: (item: FavoriteItem) => void
  removeFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  clearFavorites: () => void
  getCount: () => number
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (item: FavoriteItem) => {
        const { favorites } = get()
        if (favorites.some((f) => f.id === item.id)) return
        set({ favorites: [...favorites, { ...item, addedAt: new Date().toISOString() }] })
      },

      removeFavorite: (id: string) => {
        set({ favorites: get().favorites.filter((f) => f.id !== id) })
      },

      isFavorite: (id: string) => {
        return get().favorites.some((f) => f.id === id)
      },

      clearFavorites: () => {
        set({ favorites: [] })
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
