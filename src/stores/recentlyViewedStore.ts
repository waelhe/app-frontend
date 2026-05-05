import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentlyViewedItem {
  id: string;
  title: string;
  category: string;
  price: number;
  viewedAt: string;
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[];
  addViewed: (id: string, title: string, category: string, price: number) => void;
  getRecentlyViewed: () => RecentlyViewedItem[];
  clearAll: () => void;
}

const MAX_ITEMS = 20;

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],

      addViewed: (id: string, title: string, category: string, price: number) => {
        const { items } = get();

        // Remove existing entry for the same id (to update it)
        const filtered = items.filter((item) => item.id !== id);

        // Add new entry at the beginning
        const newItem: RecentlyViewedItem = {
          id,
          title,
          category,
          price,
          viewedAt: new Date().toISOString(),
        };

        // Keep only MAX_ITEMS
        const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);

        set({ items: updated });
      },

      getRecentlyViewed: () => {
        return get().items;
      },

      clearAll: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'nabd-recently-viewed',
    }
  )
);
