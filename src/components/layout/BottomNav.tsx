'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/stores/authStore'
import { useLanguage } from '@/stores/languageStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import {
  Home,
  ShoppingCart,
  Briefcase,
  BookOpen,
  Users,
  Plus,
  Bell,
  MessageSquare,
} from 'lucide-react'

interface NavItem {
  id: string
  view: string
  icon: React.ElementType
  labelAr: string
  labelEn: string
  badge?: number
}

export function BottomNav() {
  const { user, isAuthenticated } = useAuth()
  const { t, isRTL } = useLanguage()
  const { currentView, navigate } = useNavigationStore()

  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  // Scroll-hiding behavior
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
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

  // Map currentView to nav item id for active tab detection
  const getActiveTabId = (): string => {
    if (currentView === 'home' || currentView === 'notifications') return 'home'
    if (currentView === 'market') return 'market'
    if (currentView === 'services') return 'services'
    if (currentView === 'directory') return 'directory'
    if (currentView === 'community') return 'community'
    return ''
  }

  const activeTab = getActiveTabId()

  // 5 tabs with icons + labels
  const navItems: NavItem[] = [
    {
      id: 'home',
      view: 'home',
      icon: Home,
      labelAr: 'الرئيسية',
      labelEn: 'Home',
      badge: currentView !== 'notifications' ? 3 : 0, // notification badge
    },
    {
      id: 'market',
      view: 'market',
      icon: ShoppingCart,
      labelAr: 'السوق',
      labelEn: 'Market',
    },
    // Center slot reserved for FAB
    {
      id: 'services',
      view: 'services',
      icon: Briefcase,
      labelAr: 'الخدمات',
      labelEn: 'Services',
    },
    {
      id: 'directory',
      view: 'directory',
      icon: BookOpen,
      labelAr: 'الدليل',
      labelEn: 'Directory',
    },
    {
      id: 'community',
      view: 'community',
      icon: Users,
      labelAr: 'المجتمع',
      labelEn: 'Community',
    },
  ]

  // Insert the FAB in the center position (index 2)
  const fabIndex = 2

  const handleFabClick = () => {
    if (!isAuthenticated) {
      // Open login dialog for guests
      window.dispatchEvent(
        new CustomEvent('open-login', { detail: { mode: 'register' } })
      )
    } else {
      navigate('create-listing')
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : 100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 right-0 left-0 z-50 md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Main nav bar */}
        <div className="border-t border-gray-200 bg-white/95 backdrop-blur-lg">
          <div className="mx-auto flex max-w-lg items-center justify-around px-1 pt-1 pb-1">
            {navItems.map((item, index) => {
              // Insert FAB at the center position
              if (index === fabIndex) {
                return (
                  <div key="fab" className="flex flex-col items-center -mt-5">
                    <motion.button
                      onClick={handleFabClick}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/40 ring-4 ring-white"
                    >
                      <Plus className="h-6 w-6" />
                      {/* Pulse animation */}
                      <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20" />
                    </motion.button>
                    <span className="mt-0.5 text-[10px] font-medium text-red-500">
                      {t('أضف', 'Add')}
                    </span>
                  </div>
                )
              }

              const isActive = activeTab === item.id
              const Icon = item.icon

              return (
                <motion.button
                  key={item.id}
                  onClick={() => navigate(item.view as any)}
                  whileTap={{ scale: 0.9 }}
                  className="relative flex flex-col items-center gap-0.5 py-1.5 px-2"
                >
                  {/* Icon container */}
                  <div className="relative">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                          : 'text-gray-400'
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </div>

                    {/* Badge */}
                    {item.badge && item.badge > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                        className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white"
                      >
                        {item.badge > 9 ? '9+' : item.badge}
                      </motion.span>
                    )}

                    {/* Active dot indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabDot"
                        className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-red-500"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[10px] leading-none transition-colors duration-200 ${
                      isActive
                        ? 'font-bold text-red-500'
                        : 'font-medium text-gray-400'
                    }`}
                  >
                    {t(item.labelAr, item.labelEn)}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </motion.nav>

      {/* Spacer for bottom nav on mobile */}
      <div className="h-16 md:hidden" />
    </>
  )
}
