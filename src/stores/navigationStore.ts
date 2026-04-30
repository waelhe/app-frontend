/**
 * Navigation Store — Zustand store for SPA-like client-side navigation.
 * Manages the current view, view parameters, and navigation history.
 */

import { create } from 'zustand';
import type { AppView } from '@/lib/types';

interface NavigationStore {
  /** Current active view */
  currentView: AppView;
  /** Parameters for the current view (e.g. listing ID) */
  viewParams: Record<string, string>;
  /** Stack of previous views for back-navigation */
  previousViews: Array<{ view: AppView; params: Record<string, string> }>;

  /** Navigate to a new view, pushing the current one onto the history stack */
  navigate: (view: AppView, params?: Record<string, string>) => void;
  /** Go back to the previous view */
  goBack: () => void;
  /** Reset to home view and clear history */
  goHome: () => void;
}

export const useNavigationStore = create<NavigationStore>((set, get) => ({
  currentView: 'home',
  viewParams: {},
  previousViews: [],

  navigate: (view, params = {}) => {
    const { currentView, viewParams } = get();
    set({
      previousViews: [...get().previousViews, { view: currentView, params: viewParams }],
      currentView: view,
      viewParams: params,
    });
  },

  goBack: () => {
    const { previousViews } = get();
    if (previousViews.length === 0) return;
    const last = previousViews[previousViews.length - 1];
    set({
      previousViews: previousViews.slice(0, -1),
      currentView: last.view,
      viewParams: last.params,
    });
  },

  goHome: () => {
    set({
      currentView: 'home',
      viewParams: {},
      previousViews: [],
    });
  },
}));
