'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/store/use-auth'
import { useLanguage } from '@/store/use-language'
import { useNavigationStore } from '@/store/use-navigation'
import { Home, Search, PlusCircle, ShoppingCart, Phone } from 'lucide-react'

interface NavItem {
  id: string
  href: string
  icon: React.ElementType
  labelAr: string
  labelEn: string
  special?: 'add' | 'emergency'
  isExternal?: boolean
}

export function BottomNav() {
  const { user, isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const { activeTab, setActiveTab } = useNavigationStore()

  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false)
      } else {
        // Scrolling up
        setIsVisible(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const navItems: NavItem[] = [
    {
      id: 'home',
      href: '/',
      icon: Home,
      labelAr: 'الرئيسية',
      labelEn: 'Home',
    },
    {
      id: 'search',
      href: '/search',
      icon: Search,
      labelAr: 'بحث',
      labelEn: 'Search',
    },
    ...(isAuthenticated && user?.role === 'provider'
      ? [
          {
            id: 'add',
            href: '/add-service',
            icon: PlusCircle,
            labelAr: 'أضف',
            labelEn: 'Add',
            special: 'add' as const,
          },
        ]
      : []),
    {
      id: 'market',
      href: '/market',
      icon: ShoppingCart,
      labelAr: 'السوق',
      labelEn: 'Market',
    },
    {
      id: 'emergency',
      href: 'tel:112',
      icon: Phone,
      labelAr: 'طوارئ',
      labelEn: 'Emergency',
      special: 'emergency',
      isExternal: true,
    },
  ]

  const handleNavClick = (id: string) => {
    setActiveTab(id)
  }

  return (
    <nav
      className={`fixed bottom-0 right-0 left-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-md transition-transform duration-300 md:hidden safe-bottom ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          const Icon = item.icon

          // Special "Add" button for providers
          if (item.special === 'add') {
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => handleNavClick(item.id)}
                className="flex flex-col items-center gap-0.5 py-1"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium text-red-500">
                  {t(item.labelAr, item.labelEn)}
                </span>
              </Link>
            )
          }

          // Special "Emergency" button
          if (item.special === 'emergency') {
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={() => handleNavClick(item.id)}
                className="flex flex-col items-center gap-0.5 py-1"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30">
                  <Phone className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium text-red-500">
                  {t(item.labelAr, item.labelEn)}
                </span>
              </a>
            )
          }

          // Regular nav items
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => handleNavClick(item.id)}
              className="flex flex-col items-center gap-0.5 py-1"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  isActive
                    ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-500/30'
                    : 'text-gray-500'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent'
                    : 'text-gray-500'
                }`}
              >
                {t(item.labelAr, item.labelEn)}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
