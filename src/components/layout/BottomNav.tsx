'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/stores/authStore'
import { useLanguage } from '@/stores/languageStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Search,
  Heart,
  ShoppingBag,
  Phone,
  Plus,
} from 'lucide-react'
import type { AppView } from '@/lib/types'

interface NavItem {
  id: string
  view: AppView
  icon: React.ElementType
  labelAr: string
  labelEn: string
  isSpecial?: boolean
  isTel?: boolean
  badge?: number
}

export function BottomNav() {
  const { isAuthenticated } = useAuth()
  const { t, isRTL } = useLanguage()
  const { currentView, navigate } = useNavigationStore()

  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Scroll-hiding behavior
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          if (currentScrollY > lastScrollY && currentScrollY > 80) {
            setIsVisible(false)
          } else {
            setIsVisible(true)
          }
          setLastScrollY(currentScrollY)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Map currentView to active nav item id
  const getActiveTabId = (): string => {
    if (currentView === 'home' || currentView === 'notifications') return 'home'
    if (currentView === 'search') return 'explore'
    if (currentView === 'market') return 'market'
    if (currentView === 'favorites') return 'favorites'
    return ''
  }

  const activeTab = getActiveTabId()

  // Navigation items — 6 items total (4 standard + FAB + emergency)
  const navItems: NavItem[] = [
    {
      id: 'home',
      view: 'home',
      icon: Home,
      labelAr: 'الرئيسية',
      labelEn: 'Home',
    },
    {
      id: 'explore',
      view: 'search',
      icon: Search,
      labelAr: 'استكشف',
      labelEn: 'Explore',
    },
    // FAB occupies index 2 — rendered separately below
    {
      id: 'market',
      view: 'market',
      icon: ShoppingBag,
      labelAr: 'السوق',
      labelEn: 'Market',
    },
    {
      id: 'favorites',
      view: 'favorites',
      icon: Heart,
      labelAr: 'المفضلة',
      labelEn: 'Favorites',
    },
    {
      id: 'emergency',
      view: 'emergency',
      icon: Phone,
      labelAr: 'طوارئ',
      labelEn: 'Emergency',
      isTel: true,
      isSpecial: true,
    },
  ]

  const fabIndex = 2 // FAB slot position

  const handleFabClick = () => {
    if (!isAuthenticated) {
      window.dispatchEvent(
        new CustomEvent('open-login', { detail: { mode: 'register' } })
      )
    } else {
      navigate('create-listing')
    }
  }

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.nav
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 right-0 left-0 z-50 md:hidden"
          >
            {/* Airbnb-style background with blur */}
            <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
              <div className="flex justify-around items-center h-16 px-1">
                {navItems.map((item, index) => {
                  // Insert FAB at the center position
                  if (index === fabIndex) {
                    return (
                      <div key="fab" className="relative flex flex-col items-center justify-center min-w-[64px] h-full -mt-4">
                        <motion.button
                          onClick={handleFabClick}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.9 }}
                          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/40 ring-4 ring-white"
                        >
                          <Plus className="h-6 w-6" strokeWidth={2.5} />
                          {/* Pulse animation */}
                          <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20" />
                        </motion.button>
                        <span className="mt-0.5 text-[10px] font-medium text-red-500">
                          {t('أضف', 'Add')}
                        </span>
                      </div>
                    )
                  }

                  const Icon = item.icon
                  const isActive = activeTab === item.id

                  // Emergency tel:112 button — special rendering with red glow
                  if (item.isTel) {
                    return (
                      <a
                        key={item.id}
                        href="tel:112"
                        className="relative flex flex-col items-center justify-center min-w-[64px] h-full group"
                      >
                        {/* Red gradient glow effect */}
                        <div className="relative flex items-center justify-center group-active:scale-95 transition-transform">
                          <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 rounded-full blur-sm opacity-50 group-hover:opacity-70 transition-opacity" />
                          <div className="relative flex items-center justify-center w-11 h-11 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/30">
                            <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                          </div>
                        </div>
                        <span className="mt-1 text-[10px] font-semibold text-red-600">
                          {isRTL ? item.labelAr : item.labelEn}
                        </span>
                      </a>
                    )
                  }

                  // Standard nav item — emerald/teal active states
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => navigate(item.view)}
                      whileTap={{ scale: 0.9 }}
                      className="relative flex flex-col items-center justify-center min-w-[64px] h-full group"
                    >
                      {/* Active indicator — floating pill on top */}
                      {isActive && (
                        <motion.div
                          layoutId="activeNavPill"
                          className="absolute -top-1 w-10 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}

                      {/* Icon container */}
                      <div
                        className={`
                          relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300
                          ${isActive
                            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm'
                            : 'group-hover:bg-gray-100'
                          }
                          group-active:scale-90
                        `}
                      >
                        <Icon
                          className={`
                            w-5 h-5 transition-all duration-300
                            ${isActive
                              ? 'text-emerald-600 stroke-[2.5]'
                              : 'text-gray-500 group-hover:text-gray-700 stroke-[2]'
                            }
                          `}
                        />

                        {/* Badge for notifications */}
                        {item.badge && item.badge > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                            className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold rounded-full shadow-sm"
                          >
                            {item.badge > 9 ? '9+' : item.badge}
                          </motion.span>
                        )}
                      </div>

                      {/* Label */}
                      <span
                        className={`
                          mt-0.5 text-[10px] font-semibold transition-colors duration-300
                          ${isActive
                            ? 'text-emerald-600'
                            : 'text-gray-500 group-hover:text-gray-700'
                          }
                        `}
                      >
                        {isRTL ? item.labelAr : item.labelEn}
                      </span>
                    </motion.button>
                  )
                })}
              </div>

              {/* iOS Safe Area */}
              <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Spacer for bottom nav on mobile */}
      <div className="h-16 md:hidden" />
    </>
  )
}

export default BottomNav
