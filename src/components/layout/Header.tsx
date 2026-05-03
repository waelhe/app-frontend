'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/store/use-auth'
import { useLanguage } from '@/store/use-language'
import { useNavigationStore } from '@/stores/navigationStore'
import { useRegion, REGIONS } from '@/store/use-region'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  MapPin,
  User,
  Heart,
  Settings,
  LogOut,
  X,
  ChevronDown,
  Bell,
  Activity,
  ShoppingCart,
} from 'lucide-react'

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { t, language, setLanguage, isRTL } = useLanguage()
  const { navigate } = useNavigationStore()
  const { selectedRegion, setRegion } = useRegion()

  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setSearchOpen] = useState(false)
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
  const [backendOnline, setBackendOnline] = useState(true)
  const [unreadNotifications, setUnreadNotifications] = useState(3)
  const locationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Check backend status
  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Use the auth health proxy which correctly handles 503→200 conversion
        // and forwards to the Railway backend (not localhost:8080)
        const res = await fetch('/api/auth/health', {
          method: 'GET',
          signal: AbortSignal.timeout(10000), // 10s for Railway cold start
        })
        if (res.ok) {
          const data = await res.json().catch(() => ({}))
          // Backend responds but may report DOWN status due to non-critical subsystems
          // If we get a response at all, the API is functional
          setBackendOnline(true)
        } else {
          setBackendOnline(false)
        }
      } catch {
        setBackendOnline(false)
      }
    }
    checkBackend()
    const interval = setInterval(checkBackend, 60000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setLocationDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate('search', { q: searchQuery.trim() })
      setSearchOpen(false)
    }
  }

  const handleSearchClick = () => {
    navigate('search')
  }

  const userInitials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
    : ''

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 shadow-md backdrop-blur-xl'
          : 'bg-white shadow-sm'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        {/* Main header row */}
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <button
            onClick={() => navigate('home')}
            className="flex shrink-0 items-center gap-1.5"
          >
            <motion.div
              className="flex items-center gap-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Activity className="h-6 w-6 text-red-500" />
              <span className="bg-gradient-to-l from-red-500 to-red-600 bg-clip-text text-2xl font-bold text-transparent">
                نبض
              </span>
            </motion.div>
            <span className="hidden text-xs font-medium text-gray-400 sm:inline">
              Nabd
            </span>
          </button>

          {/* Desktop search bar */}
          <form
            onSubmit={handleSearch}
            className="hidden flex-1 items-center gap-0 md:flex"
          >
            {/* Location dropdown */}
            <div className="relative" ref={locationRef}>
              <button
                type="button"
                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                className="flex h-10 items-center gap-1.5 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm transition-colors hover:bg-gray-100"
              >
                <MapPin className="h-4 w-4 text-red-500" />
                <span className="max-w-[100px] truncate text-gray-700">
                  {language === 'ar'
                    ? selectedRegion.nameAr
                    : selectedRegion.nameEn}
                </span>
                <ChevronDown
                  className={`h-3 w-3 text-gray-400 transition-transform ${
                    locationDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {locationDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                  >
                    {REGIONS.map((region) => (
                      <button
                        key={region.id}
                        type="button"
                        onClick={() => {
                          setRegion(region)
                          setLocationDropdownOpen(false)
                        }}
                        className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
                          selectedRegion.id === region.id
                            ? 'bg-red-50 font-medium text-red-600'
                            : 'text-gray-700'
                        }`}
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        <span>
                          {language === 'ar' ? region.nameAr : region.nameEn}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search input */}
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(
                'ابحث عن خدمة أو مزوّد...',
                'Search for a service or provider...'
              )}
              className="h-10 rounded-none border-gray-300 bg-white focus-visible:ring-red-500"
            />
            <Button
              type="submit"
              className="h-10 rounded-l-lg rounded-r-none bg-red-500 px-4 hover:bg-red-600"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {/* Desktop right side */}
          <div className="hidden items-center gap-2 md:flex">
            {/* Backend Status */}
            <div className="flex items-center gap-1.5" title={backendOnline ? 'Backend Online' : 'Backend Offline'}>
              <div
                className={`h-2 w-2 rounded-full ${
                  backendOnline
                    ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                    : 'bg-red-500 shadow-sm shadow-red-500/50'
                }`}
              />
            </div>

            {/* Notification Bell */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadNotifications > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
                    >
                      {unreadNotifications}
                    </motion.span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-0">
                <div className="border-b p-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">
                      {t('الإشعارات', 'Notifications')}
                    </h4>
                    {unreadNotifications > 0 && (
                      <button
                        onClick={() => setUnreadNotifications(0)}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        {t('تحديد الكل كمقروء', 'Mark all read')}
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <button
                    onClick={() => { navigate('notifications'); setUnreadNotifications(0) }}
                    className="flex w-full items-start gap-3 border-b p-3 text-right transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                      <Bell className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900">
                        {t('إشعار جديد', 'New notification')}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {t('لديك إشعارات غير مقروءة', 'You have unread notifications')}
                      </p>
                    </div>
                  </button>
                </div>
                <div className="p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-red-500 hover:text-red-600"
                    onClick={() => navigate('notifications')}
                  >
                    {t('عرض جميع الإشعارات', 'View all notifications')}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Auth Section */}
            {isAuthenticated && user ? (
              <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-red-100">
                      <AvatarImage src={user.image} alt={user.displayName} />
                      <AvatarFallback className="bg-gradient-to-br from-red-400 to-red-600 text-xs text-white">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[100px] truncate text-sm font-medium">
                      {user.displayName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{user.displayName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate('profile')}
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    <span>{t('ملفي الشخصي', 'My Profile')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate('my-ads')}
                    className="flex items-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>{t('إعلاناتي', 'My Listings')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate('favorites')}
                    className="flex items-center gap-2"
                  >
                    <Heart className="h-4 w-4" />
                    <span>{t('المفضلة', 'Favorites')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate('settings')}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>{t('الإعدادات', 'Settings')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="flex items-center gap-2 text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('تسجيل الخروج', 'Sign Out')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-sm font-medium text-gray-600 hover:text-red-500"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent('open-login', { detail: { mode: 'login' } })
                    )
                  }
                >
                  {t('تسجيل الدخول', 'Log In')}
                </Button>
                <Button
                  className="bg-gradient-to-l from-red-500 to-red-600 text-sm font-medium shadow-md shadow-red-500/20 hover:from-red-600 hover:to-red-700"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent('open-login', { detail: { mode: 'register' } })
                    )
                  }
                >
                  {t('إنشاء حساب', 'Sign Up')}
                </Button>
              </>
            )}

            {/* Language toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="min-w-[40px] text-xs font-medium"
            >
              {language === 'ar' ? 'EN' : 'عربي'}
            </Button>
          </div>

          {/* Mobile right side - compact */}
          <div className="flex items-center gap-0.5 md:hidden">
            {/* Search icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!isSearchOpen)}
              className="h-9 w-9"
            >
              <Search className="h-5 w-5 text-gray-600" />
            </Button>

            {/* Notification bell (mobile) */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              onClick={() => navigate('notifications')}
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadNotifications}
                </span>
              )}
            </Button>

            {/* Avatar / Login */}
            {isAuthenticated && user ? (
              <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Avatar className="h-7 w-7 ring-2 ring-red-100">
                      <AvatarImage src={user.image} alt={user.displayName} />
                      <AvatarFallback className="bg-gradient-to-br from-red-400 to-red-600 text-[10px] text-white">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{user.displayName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('profile')} className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{t('ملفي الشخصي', 'My Profile')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('my-ads')} className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span>{t('إعلاناتي', 'My Listings')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('favorites')} className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span>{t('المفضلة', 'Favorites')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('settings')} className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>{t('الإعدادات', 'Settings')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="flex items-center gap-2 text-red-600 focus:text-red-600">
                    <LogOut className="h-4 w-4" />
                    <span>{t('تسجيل الخروج', 'Sign Out')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('open-login', { detail: { mode: 'login' } })
                  )
                }
              >
                <User className="h-5 w-5 text-gray-600" />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile search bar (expandable) */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-gray-100 md:hidden"
            >
              <div className="py-3">
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                      className="flex h-10 items-center gap-1 rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm"
                    >
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span className="max-w-[80px] truncate text-gray-700">
                        {language === 'ar'
                          ? selectedRegion.nameAr
                          : selectedRegion.nameEn}
                      </span>
                    </button>
                  </div>
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('ابحث...', 'Search...')}
                    className="h-10 flex-1 border-gray-300"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-10 w-10 bg-red-500 hover:bg-red-600"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setSearchOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </form>

                {/* Mobile location dropdown */}
                <AnimatePresence>
                  {locationDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-2 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                    >
                      {REGIONS.map((region) => (
                        <button
                          key={region.id}
                          type="button"
                          onClick={() => {
                            setRegion(region)
                            setLocationDropdownOpen(false)
                          }}
                          className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
                            selectedRegion.id === region.id
                              ? 'bg-red-50 font-medium text-red-600'
                              : 'text-gray-700'
                          }`}
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          <span>
                            {language === 'ar' ? region.nameAr : region.nameEn}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


    </header>
  )
}
