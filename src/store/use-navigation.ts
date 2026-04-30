import { create } from 'zustand'

interface NavigationState {
  activeTab: string
  isSearchOpen: boolean
  isMobileMenuOpen: boolean
  setActiveTab: (tab: string) => void
  setSearchOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  activeTab: 'home',
  isSearchOpen: false,
  isMobileMenuOpen: false,
  setActiveTab: (activeTab: string) => set({ activeTab }),
  setSearchOpen: (isSearchOpen: boolean) => set({ isSearchOpen }),
  setMobileMenuOpen: (isMobileMenuOpen: boolean) => set({ isMobileMenuOpen }),
}))
