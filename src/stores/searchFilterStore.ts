/**
 * @license SPDX-License-Identifier: Apache-2.0
 *
 * SearchFilterStore — Zustand store with persist middleware for search/filter state.
 *
 * Persists all search and filter parameters to localStorage under the key
 * 'nabd-search-filters', so users returning to the app find their previous
 * filter selections intact.
 *
 * Usage:
 *   const { query, category, setQuery, clearFilters, hasActiveFilters } = useSearchFilters();
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ─────────────────────────────────────────────────────────────

export type SortOption = 'price-asc' | 'price-desc' | 'newest' | 'popular';

export interface PriceRange {
  min: number;
  max: number;
}

export interface SearchFilterState {
  // ── State ───────────────────────────────────────────────────────
  /** Search query string */
  query: string;
  /** Selected category filter (null = all categories) */
  category: string | null;
  /** Price range filter */
  priceRange: PriceRange;
  /** Selected location/region filter (null = all locations) */
  location: string | null;
  /** Property type filter (null = all types) */
  propertyType: string | null;
  /** Rooms count filter (null = any) */
  rooms: number | null;
  /** Sort order */
  sortBy: SortOption;
  /** Current page number (0-indexed) */
  page: number;

  // ── Actions ─────────────────────────────────────────────────────
  /** Set the search query string */
  setQuery: (q: string) => void;
  /** Set the selected category filter */
  setCategory: (cat: string | null) => void;
  /** Set the price range filter */
  setPriceRange: (min: number, max: number) => void;
  /** Set the location/region filter */
  setLocation: (loc: string | null) => void;
  /** Set the property type filter */
  setPropertyType: (type: string | null) => void;
  /** Set the rooms count filter */
  setRooms: (rooms: number | null) => void;
  /** Set the sort order */
  setSortBy: (sort: SortOption) => void;
  /** Set the current page number */
  setPage: (page: number) => void;
  /** Reset all filters to their default values */
  clearFilters: () => void;
  /** Returns true if any filter is set to a non-default value */
  hasActiveFilters: () => boolean;
}

// ── Default Values ────────────────────────────────────────────────────

const DEFAULT_STATE = {
  query: '',
  category: null as string | null,
  priceRange: { min: 0, max: 0 } as PriceRange,  // 0,0 means "no filter"
  location: null as string | null,
  propertyType: null as string | null,
  rooms: null as number | null,
  sortBy: 'newest' as SortOption,
  page: 0,
};

// ── Store ─────────────────────────────────────────────────────────────

export const useSearchFilters = create<SearchFilterState>()(
  persist(
    (set, get) => ({
      // ── Initial state ──────────────────────────────────────────
      ...DEFAULT_STATE,

      // ── Actions ────────────────────────────────────────────────

      setQuery: (q: string) => {
        set({ query: q, page: 0 });
      },

      setCategory: (cat: string | null) => {
        set({ category: cat, page: 0 });
      },

      setPriceRange: (min: number, max: number) => {
        set({ priceRange: { min, max }, page: 0 });
      },

      setLocation: (loc: string | null) => {
        set({ location: loc, page: 0 });
      },

      setPropertyType: (type: string | null) => {
        set({ propertyType: type, page: 0 });
      },

      setRooms: (rooms: number | null) => {
        set({ rooms, page: 0 });
      },

      setSortBy: (sort: SortOption) => {
        set({ sortBy: sort, page: 0 });
      },

      setPage: (page: number) => {
        set({ page });
      },

      clearFilters: () => {
        set(DEFAULT_STATE);
      },

      hasActiveFilters: () => {
        const state = get();
        return (
          state.query !== '' ||
          state.category !== null ||
          state.priceRange.min !== 0 ||
          state.priceRange.max !== 0 ||
          state.location !== null ||
          state.propertyType !== null ||
          state.rooms !== null ||
          state.sortBy !== 'newest'
        );
      },
    }),
    {
      name: 'nabd-search-filters',
      // Only persist the data fields, not the action functions
      partialize: (state) => ({
        query: state.query,
        category: state.category,
        priceRange: state.priceRange,
        location: state.location,
        propertyType: state.propertyType,
        rooms: state.rooms,
        sortBy: state.sortBy,
        page: state.page,
      }),
    }
  )
);
