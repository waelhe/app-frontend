'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/store/use-auth'
import { useLanguage } from '@/store/use-language'
import { useNavigationStore as useUiNavStore } from '@/store/use-navigation'
import { useNavigationStore } from '@/stores/navigationStore'
import { useRegion, REGIONS } from '@/store/use-region'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Search,
  MapPin,
  User,
  LayoutDashboard,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const { isSearchOpen, setSearchOpen } = useUiNavStore()
  const { navigate } = useNavigationStore()
  const { selectedRegion, setRegion } = useRegion()

  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const locationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
    }
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
      className={`fixed top-0 right-0 left-0 z-50 bg-white transition-shadow duration-200 ${
        scrolled ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        {/* Main header row */}
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-1">
            <span className="text-2xl font-bold text-red-500">نبض</span>
            <span className="text-sm font-medium text-gray-400">Nabd</span>
          </Link>

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

              {locationDropdownOpen && (
                <div className="absolute top-full right-0 z-50 mt-1 w-48 animate-scale-in rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
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
                          ? 'bg-red-50 text-red-600 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      <span>
                        {language === 'ar' ? region.nameAr : region.nameEn}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search input */}
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('ابحث عن خدمة أو مزوّد...', 'Search for a service or provider...')}
              className="h-10 rounded-none border-gray-300 bg-white focus-visible:ring-red-500"
            />
            <Button
              type="submit"
              className="h-10 rounded-l-lg rounded-r-none bg-red-500 px-4 hover:bg-red-600"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {/* Desktop right side - auth */}
          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated && user ? (
              <DropdownMenu dir="rtl">
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image} alt={user.displayName} />
                      <AvatarFallback className="bg-red-100 text-xs text-red-600">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[100px] truncate text-sm font-medium">
                      {user.displayName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem
                    onClick={() => navigate('dashboard')}
                    className="flex items-center gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>{t('لوحة التحكم', 'Dashboard')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate('profile')}
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    <span>{t('الملف الشخصي', 'Profile')}</span>
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
                    <span>{t('تسجيل الخروج', 'Log Out')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-sm font-medium text-gray-600 hover:text-red-500"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-login', { detail: { mode: 'login' } }))}
                >
                  {t('تسجيل الدخول', 'Log In')}
                </Button>
                <Button
                  className="bg-red-500 text-sm font-medium hover:bg-red-600"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-login', { detail: { mode: 'register' } }))}
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

          {/* Mobile right side */}
          <div className="flex items-center gap-1 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!isSearchOpen)}
              className="h-9 w-9"
            >
              <Search className="h-5 w-5 text-gray-600" />
            </Button>

            {isAuthenticated && user ? (
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate('profile')}>
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.image} alt={user.displayName} />
                  <AvatarFallback className="bg-red-100 text-[10px] text-red-600">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => window.dispatchEvent(new CustomEvent('open-login', { detail: { mode: 'login' } }))}>
                <User className="h-5 w-5 text-gray-600" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-600" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile search bar (expandable) */}
        {isSearchOpen && (
          <div className="animate-slide-down border-t border-gray-100 py-3 md:hidden">
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
              />
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 bg-red-500 hover:bg-red-600"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>

            {/* Mobile location dropdown */}
            {locationDropdownOpen && (
              <div className="mt-2 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
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
                        ? 'bg-red-50 text-red-600 font-medium'
                        : 'text-gray-700'
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {language === 'ar' ? region.nameAr : region.nameEn}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="animate-slide-down border-t border-gray-100 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 px-2 pb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.image} alt={user.displayName} />
                      <AvatarFallback className="bg-red-100 text-sm text-red-600">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { navigate('dashboard'); setMobileMenuOpen(false) }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {t('لوحة التحكم', 'Dashboard')}
                  </button>
                  <button
                    onClick={() => { navigate('profile'); setMobileMenuOpen(false) }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                  >
                    <User className="h-4 w-4" />
                    {t('الملف الشخصي', 'Profile')}
                  </button>
                  <button
                    onClick={() => { navigate('favorites'); setMobileMenuOpen(false) }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                  >
                    <Heart className="h-4 w-4" />
                    {t('المفضلة', 'Favorites')}
                  </button>
                  <button
                    onClick={() => { navigate('settings'); setMobileMenuOpen(false) }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                  >
                    <Settings className="h-4 w-4" />
                    {t('الإعدادات', 'Settings')}
                  </button>
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('تسجيل الخروج', 'Log Out')}
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-2">
                  <Button
                    className="w-full bg-red-500 hover:bg-red-600"
                    onClick={() => { window.dispatchEvent(new CustomEvent('open-login', { detail: { mode: 'register' } })); setMobileMenuOpen(false) }}
                  >
                    {t('إنشاء حساب', 'Sign Up')}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => { window.dispatchEvent(new CustomEvent('open-login', { detail: { mode: 'login' } })); setMobileMenuOpen(false) }}
                  >
                    {t('تسجيل الدخول', 'Log In')}
                  </Button>
                </div>
              )}

              {/* Language toggle in mobile menu */}
              <div className="mt-2 border-t border-gray-100 pt-3">
                <button
                  onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span className="text-base">
                    {language === 'ar' ? '🌐 English' : '🌐 عربي'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
