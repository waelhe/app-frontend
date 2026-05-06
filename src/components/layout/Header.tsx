'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useAuth } from '@/stores/authStore'
import { useLanguage } from '@/stores/languageStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { useRegion, REGIONS } from '@/stores/regionStore'
import { useSearch } from '@/hooks/useApi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search,
  MapPin,
  User,
  Heart,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  Activity,
  ShoppingCart,
  PenSquare,
  Briefcase,
  UtensilsCrossed,
  HeartPulse,
  Wrench,
  ShoppingBag,
  Newspaper,
  Coffee,
  Stethoscope,
  Pill,
  Building,
  Hotel,
  Car,
  Fuel,
  Sparkles,
  Calendar,
  Cloud,
  AlertTriangle,
  Banknote,
  Package,
  Building2,
  MapPinned,
  Tag,
  Clock,
  X,
} from 'lucide-react'

// ── Category Data ──────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: 'emergency',
    name: 'طوارئ',
    nameEn: 'Emergency',
    icon: AlertTriangle,
    color: '#E31C5F',
    groups: [
      {
        name: 'خدمات طارئة',
        nameEn: 'Emergency Services',
        items: [
          { id: 'urgent-services', name: 'خدمات عاجلة', nameEn: 'Urgent Services', icon: AlertTriangle },
          { id: 'emergency-contacts', name: 'أرقام طوارئ', nameEn: 'Emergency Contacts', icon: Heart },
        ],
      },
      {
        name: 'صحة طارئة',
        nameEn: 'Emergency Health',
        items: [
          { id: 'pharmacies', name: 'صيدليات مناوبة', nameEn: 'On-Duty Pharmacies', icon: Pill },
          { id: 'medical-centers', name: 'مراكز طبية', nameEn: 'Medical Centers', icon: HeartPulse },
        ],
      },
    ],
  },
  {
    id: 'market',
    name: 'سوق',
    nameEn: 'Market',
    icon: ShoppingBag,
    color: '#FC642D',
    groups: [
      {
        name: 'وظائف وعقارات',
        nameEn: 'Jobs & Real Estate',
        items: [
          { id: 'jobs', name: 'وظائف شاغرة', nameEn: 'Jobs', icon: Briefcase },
          { id: 'real-estate', name: 'عقارات', nameEn: 'Real Estate', icon: Building },
        ],
      },
      {
        name: 'سلع وإعلانات',
        nameEn: 'Goods & Ads',
        items: [
          { id: 'used-items', name: 'مستعمل', nameEn: 'Used Items', icon: Package },
          { id: 'classifieds', name: 'إعلانات مبوبة', nameEn: 'Classifieds', icon: Newspaper },
        ],
      },
    ],
  },
  {
    id: 'directory',
    name: 'دليل',
    nameEn: 'Directory',
    icon: MapPin,
    color: '#00A699',
    groups: [
      {
        name: 'طعام وضيافة',
        nameEn: 'Food & Hospitality',
        items: [
          { id: 'restaurants', name: 'مطاعم', nameEn: 'Restaurants', icon: UtensilsCrossed },
          { id: 'cafes', name: 'مقاهي', nameEn: 'Cafes', icon: Coffee },
          { id: 'hotels', name: 'فنادق', nameEn: 'Hotels', icon: Hotel },
        ],
      },
      {
        name: 'صحة وجمال',
        nameEn: 'Health & Beauty',
        items: [
          { id: 'doctors', name: 'أطباء', nameEn: 'Doctors', icon: Stethoscope },
          { id: 'pharmacies-dir', name: 'صيدليات', nameEn: 'Pharmacies', icon: Pill },
          { id: 'beauty', name: 'تجميل', nameEn: 'Beauty', icon: Sparkles },
        ],
      },
      {
        name: 'خدمات',
        nameEn: 'Services',
        items: [
          { id: 'craftsmen', name: 'حرفيين', nameEn: 'Craftsmen', icon: Wrench },
          { id: 'car-services', name: 'سيارات', nameEn: 'Car Services', icon: Car },
          { id: 'gas-stations', name: 'بنزين', nameEn: 'Gas Stations', icon: Fuel },
        ],
      },
      {
        name: 'تسوق',
        nameEn: 'Shopping',
        items: [
          { id: 'markets', name: 'أسواق', nameEn: 'Markets', icon: ShoppingBag },
          { id: 'retail-shops', name: 'محلات', nameEn: 'Shops', icon: ShoppingBag },
        ],
      },
    ],
  },
  {
    id: 'info',
    name: 'معلومات',
    nameEn: 'Info',
    icon: Newspaper,
    color: '#8B5CF6',
    groups: [
      {
        name: 'معلومات يومية',
        nameEn: 'Daily Info',
        items: [
          { id: 'prayer-times', name: 'أوقات الصلاة', nameEn: 'Prayer Times', icon: Calendar },
          { id: 'weather', name: 'الطقس', nameEn: 'Weather', icon: Cloud },
        ],
      },
      {
        name: 'خدمات عامة',
        nameEn: 'Public Services',
        items: [
          { id: 'government-services', name: 'خدمات حكومية', nameEn: 'Government', icon: Building },
          { id: 'market-prices', name: 'أسعار السوق', nameEn: 'Market Prices', icon: Banknote },
        ],
      },
    ],
  },
]

// ── SmartSearchBar Data ────────────────────────────────────────────

const SEARCH_REGIONS = [
  { ar: 'دمشق', en: 'Damascus' },
  { ar: 'حلب', en: 'Aleppo' },
  { ar: 'حمص', en: 'Homs' },
  { ar: 'حماة', en: 'Hama' },
  { ar: 'اللاذقية', en: 'Latakia' },
  { ar: 'طرطوس', en: 'Tartus' },
  { ar: 'إدلب', en: 'Idlib' },
  { ar: 'دير الزور', en: 'Deir ez-Zor' },
  { ar: 'الرقة', en: 'Raqqa' },
  { ar: 'درعا', en: 'Daraa' },
]

const SEARCH_DISTRICTS = [
  { ar: 'المزة', en: 'Al-Mezzeh' },
  { ar: 'كفرسوسة', en: 'Kafr Souseh' },
  { ar: 'البرامكة', en: 'Al-Baramkeh' },
  { ar: 'أبو رمانة', en: 'Abu Rummaneh' },
  { ar: 'الميدان', en: 'Al-Midan' },
  { ar: 'المهاجرين', en: 'Al-Muhajireen' },
  { ar: 'الشعلان', en: 'Al-Shaalan' },
  { ar: 'القصور', en: 'Al-Qusour' },
  { ar: 'الروضة', en: 'Al-Rawdah' },
  { ar: 'قدسيا', en: 'Qudsaya' },
]

const SEARCH_CATEGORIES: Record<string, { categoryId: string; en: string }> = {
  'عقارات': { categoryId: 'real-estate', en: 'Real Estate' },
  'شقة': { categoryId: 'real-estate', en: 'Apartment' },
  'فيلا': { categoryId: 'real-estate', en: 'Villa' },
  'أرض': { categoryId: 'real-estate', en: 'Land' },
  'سيارات': { categoryId: 'cars', en: 'Cars' },
  'سيارة': { categoryId: 'cars', en: 'Car' },
  'سيدان': { categoryId: 'cars', en: 'Sedan' },
  'دفع رباعي': { categoryId: 'cars', en: 'SUV' },
  'وظائف': { categoryId: 'jobs', en: 'Jobs' },
  'عمل': { categoryId: 'jobs', en: 'Work' },
  'توظيف': { categoryId: 'jobs', en: 'Employment' },
  'خدمات': { categoryId: 'services', en: 'Services' },
  'سباكة': { categoryId: 'services', en: 'Plumbing' },
  'كهرباء': { categoryId: 'services', en: 'Electrical' },
  'دهان': { categoryId: 'services', en: 'Painting' },
}

type ClassificationType = 'region' | 'district' | 'category' | 'keyword'

interface ClassificationResult {
  type: ClassificationType
  label: string
  labelEn: string
  emoji: string
  color: string
  categoryId?: string
}

function classifyInput(query: string): ClassificationResult | null {
  if (!query.trim()) return null
  const normalized = query.trim()
  for (const region of SEARCH_REGIONS) {
    if (region.ar.includes(normalized) || region.en.toLowerCase().includes(normalized.toLowerCase())) {
      return { type: 'region', label: 'منطقة', labelEn: 'Region', emoji: '\ud83c\udfd9\ufe0f', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
    }
  }
  for (const district of SEARCH_DISTRICTS) {
    if (district.ar.includes(normalized) || district.en.toLowerCase().includes(normalized.toLowerCase())) {
      return { type: 'district', label: 'حي', labelEn: 'District', emoji: '\ud83d\udccd', color: 'bg-amber-100 text-amber-700 border-amber-200' }
    }
  }
  for (const [keyword, meta] of Object.entries(SEARCH_CATEGORIES)) {
    if (keyword.includes(normalized) || normalized.includes(keyword) || meta.en.toLowerCase().includes(normalized.toLowerCase())) {
      return { type: 'category', label: 'فئة', labelEn: 'Category', emoji: '\ud83c\udff7\ufe0f', color: 'bg-rose-100 text-rose-700 border-rose-200', categoryId: meta.categoryId }
    }
  }
  return { type: 'keyword', label: 'كلمة مفتاحية', labelEn: 'Keyword', emoji: '\ud83d\udd0d', color: 'bg-slate-100 text-slate-600 border-slate-200' }
}

// ── Recent Searches Helpers ────────────────────────────────────────

const STORAGE_KEY = 'nabd_recent_searches'
const MAX_RECENT = 5

interface RecentSearch { query: string; type: ClassificationType; timestamp: number }

function getRecentSearches(): RecentSearch[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch { return [] }
}

function addRecentSearch(query: string, type: ClassificationType): void {
  try {
    const existing = getRecentSearches().filter((s) => s.query !== query)
    const updated = [{ query, type, timestamp: Date.now() }, ...existing].slice(0, MAX_RECENT)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch { /* ignore */ }
}

function clearRecentSearches(): void {
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
}

// ── Header Component ───────────────────────────────────────────────

export function Header() {
  const { user, isAuthenticated, signOut } = useAuth()
  const { tAr, language, setLanguage, isRTL } = useLanguage()
  const { navigate } = useNavigationStore()
  const { selectedRegion, setRegion } = useRegion()

  const tr = (ar: string, en: string) => tAr(ar, en)

  // ── Scroll state ──
  const [isScrolled, setIsScrolled] = useState(false)
  const [isScrollingDown, setIsScrollingDown] = useState(false)

  // ── Search state (desktop bar) ──
  const [searchTerm, setSearchTerm] = useState('')

  // ── Mobile search overlay ──
  const [isMobileSearchOpen, setMobileSearchOpen] = useState(false)

  // ── Location dropdown ──
  const [isLocationOpen, setIsLocationOpen] = useState(false)

  // ── Category dropdown ──
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // ── Backend status ──
  const [backendOnline, setBackendOnline] = useState(true)

  // ── Notifications ──
  const [unreadNotifications, setUnreadNotifications] = useState(3)

  // ── Refs ──
  const lastScrollYRef = useRef(0)
  const headerRef = useRef<HTMLElement>(null)

  // ── SmartSearchBar state ──
  const [smartQuery, setSmartQuery] = useState('')
  const [smartOpen, setSmartOpen] = useState(false)
  const [recentVersion, setRecentVersion] = useState(0)
  const smartInputRef = useRef<HTMLInputElement>(null)

  const { data: searchResults } = useSearch(
    smartQuery.trim().length >= 2 ? { q: smartQuery.trim(), page: 0, size: 5 } : undefined
  )

  const recentSearches = useMemo(() => getRecentSearches(), [recentVersion, smartOpen])
  const classification = useMemo(() => classifyInput(smartQuery), [smartQuery])

  const filteredRegions = useMemo(() => {
    if (!smartQuery.trim()) return SEARCH_REGIONS.slice(0, 5)
    const n = smartQuery.trim().toLowerCase()
    return SEARCH_REGIONS.filter((r) => r.ar.includes(n) || r.en.toLowerCase().includes(n))
  }, [smartQuery])

  const filteredDistricts = useMemo(() => {
    if (!smartQuery.trim()) return SEARCH_DISTRICTS.slice(0, 5)
    const n = smartQuery.trim().toLowerCase()
    return SEARCH_DISTRICTS.filter((d) => d.ar.includes(n) || d.en.toLowerCase().includes(n))
  }, [smartQuery])

  const filteredCategories = useMemo(() => {
    const items = Object.entries(SEARCH_CATEGORIES).map(([keyword, meta], idx) => ({
      id: `cat-${idx}`, ar: keyword, en: meta.en, type: 'category' as ClassificationType, categoryId: meta.categoryId,
    }))
    if (!smartQuery.trim()) return items.slice(0, 6)
    const n = smartQuery.trim().toLowerCase()
    return items.filter((c) => c.ar.includes(n) || c.en.toLowerCase().includes(n))
  }, [smartQuery])

  const apiListings = useMemo(() => {
    if (!searchResults?.content) return []
    return searchResults.content.slice(0, 3)
  }, [searchResults])

  const handleSmartSelect = useCallback((value: string, type: ClassificationType, categoryId?: string) => {
    addRecentSearch(value, type)
    setRecentVersion((v) => v + 1)
    setSmartQuery('')
    setSmartOpen(false)
    if (categoryId) {
      navigate('search', { q: value, category: categoryId })
    } else {
      navigate('search', { q: value })
    }
  }, [navigate])

  const handleSmartInputChange = useCallback((value: string) => {
    setSmartQuery(value)
    if (!smartOpen && value.trim()) setSmartOpen(true)
  }, [smartOpen])

  const handleSmartOpenChange = useCallback((nextOpen: boolean) => {
    setSmartOpen(nextOpen)
    if (!nextOpen) setSmartQuery('')
  }, [])

  // ── Track header height ──
  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    const updateHeight = () => {
      const height = header.offsetHeight
      document.documentElement.style.setProperty('--header-height', `${height}px`)
    }
    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(header)
    return () => observer.disconnect()
  }, [isScrollingDown, isMobileSearchOpen])

  // ── Scroll behavior ──
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollYRef.current && currentScrollY > 80) {
        setIsScrollingDown(true)
      } else {
        setIsScrollingDown(false)
      }
      lastScrollYRef.current = currentScrollY
      setIsScrolled(currentScrollY > 10)
      if (window.innerWidth < 768 && hoveredCategory) {
        setHoveredCategory(null)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hoveredCategory])

  // ── Backend health check ──
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/actuator/health/readiness?XTransformPort=3000', {
          method: 'GET',
          signal: AbortSignal.timeout(8000),
        })
        if (res.ok) {
          const data = await res.json()
          setBackendOnline(data.status === 'UP')
        } else {
          setBackendOnline(false)
        }
      } catch { setBackendOnline(false) }
    }
    const timer = setTimeout(checkBackend, 5000)
    const interval = setInterval(checkBackend, 120000)
    return () => { clearTimeout(timer); clearInterval(interval) }
  }, [])

  // ── Click outside ──
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isLocationOpen) {
        const target = event.target as HTMLElement
        if (!target.closest('[data-location-dropdown]')) {
          setIsLocationOpen(false)
        }
      }
      if (hoveredCategory) {
        const dropdown = document.getElementById('category-dropdown')
        const clickedElement = event.target as HTMLElement
        if (dropdown && !dropdown.contains(event.target as Node) && !clickedElement.closest('[data-category-button]')) {
          setHoveredCategory(null)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isLocationOpen, hoveredCategory])

  // ── Category dropdown position ──
  useEffect(() => {
    if (hoveredCategory && categoryRefs.current[hoveredCategory]) {
      // position not needed since we use absolute positioning relative to header
    }
  }, [hoveredCategory])

  // ── Handlers ──
  const handleDesktopSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate('search', { q: searchTerm.trim() })
    }
  }

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate('search', { q: searchTerm.trim() })
      setMobileSearchOpen(false)
    }
  }

  const userInitials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2)
    : ''

  const currentCategory = CATEGORIES.find((c) => c.id === hoveredCategory)

  // ── getTypeIcon helper for suggestions ──
  const getTypeIcon = (type: ClassificationType) => {
    switch (type) {
      case 'region': return <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
      case 'district': return <MapPinned className="w-4 h-4 text-amber-500 shrink-0" />
      case 'category': return <Tag className="w-4 h-4 text-rose-500 shrink-0" />
      default: return <Search className="w-4 h-4 text-slate-400 shrink-0" />
    }
  }

  const getTypeLabel = (type: ClassificationType) => {
    switch (type) {
      case 'region': return tr('منطقة', 'Region')
      case 'district': return tr('حي', 'District')
      case 'category': return tr('فئة', 'Category')
      default: return tr('كلمة مفتاحية', 'Keyword')
    }
  }

  const hasAnySuggestions =
    filteredRegions.length > 0 ||
    filteredDistricts.length > 0 ||
    filteredCategories.length > 0 ||
    recentSearches.length > 0 ||
    apiListings.length > 0

  // ── Render: User menu ──
  const renderUserMenu = (isMobile = false) => {
    if (isAuthenticated && user) {
      return (
        <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={`flex items-center gap-2 px-2 ${isMobile ? 'h-9 w-9 p-0' : ''}`}>
              <Avatar className={`${isMobile ? 'h-7 w-7' : 'h-8 w-8'} ring-2 ring-red-100`}>
                <AvatarImage src={user.image} alt={user.displayName} />
                <AvatarFallback className="bg-gradient-to-br from-red-400 to-red-600 text-white" style={{ fontSize: isMobile ? '10px' : '12px' }}>
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              {!isMobile && (
                <span className="max-w-[100px] truncate text-sm font-medium">{user.displayName}</span>
              )}
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
              <User className="h-4 w-4" /><span>{tr('ملفي الشخصي', 'My Profile')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('my-ads')} className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" /><span>{tr('إعلاناتي', 'My Listings')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('favorites')} className="flex items-center gap-2">
              <Heart className="h-4 w-4" /><span>{tr('المفضلة', 'Favorites')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('settings')} className="flex items-center gap-2">
              <Settings className="h-4 w-4" /><span>{tr('الإعدادات', 'Settings')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()} className="flex items-center gap-2 text-red-600 focus:text-red-600">
              <LogOut className="h-4 w-4" /><span>{tr('تسجيل الخروج', 'Sign Out')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    if (isMobile) {
      return (
        <Button variant="ghost" size="icon" className="h-9 w-9"
          onClick={() => window.dispatchEvent(new CustomEvent('open-login', { detail: { mode: 'login' } }))}>
          <User className="h-5 w-5 text-gray-600" />
        </Button>
      )
    }

    return (
      <>
        <Button variant="ghost" className="text-sm font-medium text-gray-600 hover:text-red-500"
          onClick={() => window.dispatchEvent(new CustomEvent('open-login', { detail: { mode: 'login' } }))}>
          {tr('تسجيل الدخول', 'Log In')}
        </Button>
        <Button className="bg-gradient-to-l from-red-500 to-red-600 text-sm font-medium shadow-md shadow-red-500/20 hover:from-red-600 hover:to-red-700"
          onClick={() => window.dispatchEvent(new CustomEvent('open-login', { detail: { mode: 'register' } }))}>
          {tr('إنشاء حساب', 'Sign Up')}
        </Button>
      </>
    )
  }

  // ── Render: Notification bell ──
  const renderNotificationBell = (isMobile = false) => {
    if (isMobile) {
      return (
        <Button variant="ghost" size="icon" className="relative h-9 w-9" onClick={() => navigate('notifications')}>
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadNotifications}
            </span>
          )}
        </Button>
      )
    }

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="h-5 w-5 text-gray-600" />
            {unreadNotifications > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadNotifications}
              </motion.span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-0">
          <div className="border-b p-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{tr('الإشعارات', 'Notifications')}</h4>
              {unreadNotifications > 0 && (
                <button onClick={() => setUnreadNotifications(0)} className="text-xs text-red-500 hover:text-red-600">
                  {tr('تحديد الكل كمقروء', 'Mark all read')}
                </button>
              )}
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <button onClick={() => { navigate('notifications'); setUnreadNotifications(0) }}
              className="flex w-full items-start gap-3 border-b p-3 text-right transition-colors hover:bg-gray-50">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                <Bell className="h-4 w-4 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900">{tr('إشعار جديد', 'New notification')}</p>
                <p className="text-[11px] text-gray-500">{tr('لديك إشعارات غير مقروءة', 'You have unread notifications')}</p>
              </div>
            </button>
          </div>
          <div className="p-2">
            <Button variant="ghost" size="sm" className="w-full text-xs text-red-500 hover:text-red-600" onClick={() => navigate('notifications')}>
              {tr('عرض جميع الإشعارات', 'View all notifications')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  // ── Render: SmartSearchBar suggestions content ──
  const renderSmartSuggestions = () => (
    <div className="max-h-[360px] overflow-y-auto rounded-xl" style={{ scrollbarWidth: 'thin' }}>
      {!hasAnySuggestions && smartQuery.trim() && (
        <div className="py-6 text-center">
          <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">{tr('لا توجد نتائج', 'No results found')}</p>
        </div>
      )}

      {apiListings.length > 0 && (
        <div className="mb-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            {tr('نتائج البحث', 'Search Results')}
          </div>
          {apiListings.map((listing) => (
            <button key={listing.id} onClick={() => handleSmartSelect(listing.title || listing.id, 'keyword')}
              className="flex items-center gap-2 px-3 py-2.5 w-full cursor-pointer rounded-lg hover:bg-gray-50 transition-colors text-start">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="flex-1 text-sm truncate">{listing.title}</span>
              <span className="text-[10px] text-gray-400 shrink-0">{tr('إعلان', 'Listing')}</span>
            </button>
          ))}
        </div>
      )}

      {filteredRegions.length > 0 && (
        <div className="mb-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            {tr('المناطق', 'Regions')}
          </div>
          {filteredRegions.map((region, idx) => (
            <button key={`region-${idx}`} onClick={() => handleSmartSelect(region.ar, 'region')}
              className="flex items-center gap-2 px-3 py-2.5 w-full cursor-pointer rounded-lg hover:bg-emerald-50 transition-colors text-start">
              <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="flex-1 text-sm">{isRTL ? region.ar : region.en}</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md shrink-0">{tr('منطقة', 'Region')}</span>
            </button>
          ))}
        </div>
      )}

      {filteredDistricts.length > 0 && (
        <div className="mb-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            {tr('الأحياء', 'Districts')}
          </div>
          {filteredDistricts.map((district, idx) => (
            <button key={`district-${idx}`} onClick={() => handleSmartSelect(district.ar, 'district')}
              className="flex items-center gap-2 px-3 py-2.5 w-full cursor-pointer rounded-lg hover:bg-amber-50 transition-colors text-start">
              <MapPinned className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="flex-1 text-sm">{isRTL ? district.ar : district.en}</span>
              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md shrink-0">{tr('حي', 'District')}</span>
            </button>
          ))}
        </div>
      )}

      {filteredCategories.length > 0 && (
        <div className="mb-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            {tr('الفئات', 'Categories')}
          </div>
          {filteredCategories.map((cat) => (
            <button key={cat.id} onClick={() => handleSmartSelect(cat.ar, cat.type, cat.categoryId)}
              className="flex items-center gap-2 px-3 py-2.5 w-full cursor-pointer rounded-lg hover:bg-rose-50 transition-colors text-start">
              <Tag className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="flex-1 text-sm">{isRTL ? cat.ar : cat.en}</span>
              <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md shrink-0">{tr('فئة', 'Category')}</span>
            </button>
          ))}
        </div>
      )}

      {recentSearches.length > 0 && !smartQuery.trim() && (
        <div className="mb-1">
          <div className="flex items-center justify-between w-full px-3 py-1.5">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {tr('عمليات البحث الأخيرة', 'Recent Searches')}
            </span>
            <button onClick={() => { clearRecentSearches(); setRecentVersion((v) => v + 1) }}
              className="text-[10px] text-rose-500 hover:text-rose-600 transition-colors">
              {tr('مسح الكل', 'Clear all')}
            </button>
          </div>
          {recentSearches.map((search, idx) => (
            <button key={`recent-${idx}`} onClick={() => handleSmartSelect(search.query, search.type)}
              className="flex items-center gap-2 px-3 py-2.5 w-full cursor-pointer rounded-lg hover:bg-gray-50 transition-colors text-start">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="flex-1 text-sm text-gray-600">{search.query}</span>
              {getTypeIcon(search.type)}
              <span className="text-[10px] text-gray-400 shrink-0">{getTypeLabel(search.type)}</span>
            </button>
          ))}
        </div>
      )}

      {!smartQuery.trim() && recentSearches.length === 0 && (
        <div className="mb-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            {tr('بحث سريع', 'Quick Search')}
          </div>
          {[
            { ar: 'عقارات دمشق', en: 'Damascus Real Estate', type: 'category' as ClassificationType, categoryId: 'real-estate' },
            { ar: 'سيارات حلب', en: 'Aleppo Cars', type: 'category' as ClassificationType, categoryId: 'cars' },
            { ar: 'وظائف حمص', en: 'Homs Jobs', type: 'category' as ClassificationType, categoryId: 'jobs' },
            { ar: 'خدمات سباكة', en: 'Plumbing Services', type: 'category' as ClassificationType, categoryId: 'services' },
          ].map((quick, idx) => (
            <button key={`quick-${idx}`} onClick={() => handleSmartSelect(quick.ar, quick.type, quick.categoryId)}
              className="flex items-center gap-2 px-3 py-2.5 w-full cursor-pointer rounded-lg hover:bg-gray-50 transition-colors text-start">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="flex-1 text-sm">{isRTL ? quick.ar : quick.en}</span>
              <span className="text-[10px] text-gray-400 shrink-0">{tr('بحث سريع', 'Quick')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  // ── Main Render ──
  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        isScrolled ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      {/* ── Row 1: Logo + Search + Actions ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <button onClick={() => navigate('home')} className="flex shrink-0 items-center gap-1.5">
            <motion.div className="flex items-center gap-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Activity className="h-6 w-6 text-red-500" />
              <span className="bg-gradient-to-l from-red-500 to-red-600 bg-clip-text text-2xl font-bold text-transparent">
                {tr('نبض', 'Nabd')}
              </span>
            </motion.div>
          </button>

          {/* Mini category text nav — shown when scrolling down on desktop */}
          {isScrollingDown && (
            <div className="hidden items-center gap-1 md:flex">
              {CATEGORIES.map((category) => {
                const isSelected = hoveredCategory === category.id
                return (
                  <button key={category.id} data-category-button={category.id}
                    onClick={() => setHoveredCategory(isSelected ? null : category.id)}
                    className={`px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                      isSelected ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                    }`}>
                    {tr(category.name, category.nameEn)}
                  </button>
                )
              })}
            </div>
          )}

          {/* Search Bar — Desktop */}
          <form
            onSubmit={handleDesktopSearch}
            className={`hidden flex-1 items-center md:flex ${
              isScrollingDown ? 'max-w-[40px]' : 'max-w-md mx-4'
            } transition-all duration-300`}
          >
            {isScrollingDown ? (
              <button type="button" onClick={() => navigate('search')} className="p-2 text-gray-600 hover:text-gray-900">
                <Search className="h-5 w-5" />
              </button>
            ) : (
              <div className="flex w-full items-center overflow-hidden rounded-full border border-gray-300 bg-white shadow-sm transition-colors focus-within:border-gray-500">
                <div className="flex flex-1 items-center">
                  <Search className="mx-3 h-5 w-5 shrink-0 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={tr('مطاعم، أطباء، خدمات...', 'restaurants, doctors, services...')}
                    className="flex-1 bg-white py-2.5 pl-0 pr-2 text-sm outline-none"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
                <div className="h-6 w-px bg-gray-300" />
                <div className="relative" data-location-dropdown>
                  <button type="button" onClick={() => setIsLocationOpen(!isLocationOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:text-gray-900">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span className="font-medium">{language === 'ar' ? selectedRegion.nameAr : selectedRegion.nameEn}</span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isLocationOpen && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
                        {REGIONS.map((region) => (
                          <button key={region.id} type="button"
                            onClick={() => { setRegion(region); setIsLocationOpen(false) }}
                            className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
                              selectedRegion.id === region.id ? 'bg-red-50 font-medium text-red-500' : 'text-gray-700'
                            }`}>
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{language === 'ar' ? region.nameAr : region.nameEn}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </form>

          {/* Actions — Desktop */}
          <div className="hidden items-center gap-2 md:flex">
            <div className="flex items-center gap-1.5" title={backendOnline ? 'Backend Online' : 'Backend Offline'}>
              <div className={`h-2 w-2 rounded-full ${backendOnline ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-red-500 shadow-sm shadow-red-500/50'}`} />
            </div>
            {!isScrollingDown && (
              <>
                <button onClick={() => navigate('write-review')} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900">
                  <PenSquare className="h-4 w-4" /><span>{tr('اكتب تقييم', 'Write a Review')}</span>
                </button>
                <button onClick={() => navigate('dashboard')} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900">
                  <Briefcase className="h-4 w-4" /><span>{tr('للأعمال', 'For Businesses')}</span>
                </button>
              </>
            )}
            {renderNotificationBell()}
            {renderUserMenu()}
            <Button variant="outline" size="sm" onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="min-w-[40px] text-xs font-medium">
              {language === 'ar' ? 'EN' : 'عربي'}
            </Button>
          </div>

          {/* Actions — Mobile */}
          <div className="flex items-center gap-0.5 md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileSearchOpen(!isMobileSearchOpen)} className="h-9 w-9">
              <Search className="h-5 w-5 text-gray-600" />
            </Button>
            {renderNotificationBell(true)}
            {renderUserMenu(true)}
          </div>
        </div>
      </div>

      {/* ── Row 2: Category bar (Mobile) ── */}
      <div className="border-t border-gray-100 md:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-center gap-2 py-2">
            {CATEGORIES.map((category) => {
              const isSelected = hoveredCategory === category.id
              return (
                <div key={category.id} ref={(el) => { categoryRefs.current[category.id] = el }} className="relative shrink-0"
                  onMouseEnter={() => { if (window.innerWidth >= 768) setHoveredCategory(category.id) }}
                  onMouseLeave={() => { if (window.innerWidth >= 768) setHoveredCategory(null) }}>
                  <button data-category-button={category.id}
                    onClick={() => setHoveredCategory(isSelected ? null : category.id)}
                    className="flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all group">
                    <div className={`transition-all duration-200 ${isScrollingDown ? 'h-0 overflow-hidden opacity-0' : 'h-10 opacity-100'}`}>
                      <category.icon className={`h-10 w-10 transition-all duration-200 ${isSelected ? 'scale-110' : ''}`} style={{ color: category.color }} />
                    </div>
                    <span className={`whitespace-nowrap text-sm font-medium transition-colors ${
                      isSelected ? 'font-semibold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'
                    }`}>
                      {tr(category.name, category.nameEn)}
                    </span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Row 2: Category bar (Desktop) ── */}
      {!isScrollingDown && (
        <div className="hidden border-t border-gray-100 md:block">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center justify-center gap-4 py-2">
              {CATEGORIES.map((category) => {
                const isSelected = hoveredCategory === category.id
                return (
                  <div key={category.id} ref={(el) => { categoryRefs.current[category.id] = el }} className="relative shrink-0"
                    onMouseEnter={() => setHoveredCategory(category.id)}
                    onMouseLeave={() => setHoveredCategory(null)}>
                    <button data-category-button={category.id}
                      onClick={() => setHoveredCategory(isSelected ? null : category.id)}
                      className="flex flex-col items-center gap-1.5 rounded-xl px-4 py-2 transition-all group">
                      <category.icon className={`h-12 w-12 transition-all duration-200 ${isSelected ? 'scale-110' : ''}`} style={{ color: category.color }} />
                      <span className={`whitespace-nowrap text-sm font-medium transition-colors ${
                        isSelected ? 'font-semibold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'
                      }`}>
                        {tr(category.name, category.nameEn)}
                      </span>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Row 3: Smart Search Bar (integrated, no gap) ── */}
      <div className="border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-1.5">
          <Popover open={smartOpen} onOpenChange={handleSmartOpenChange}>
            <PopoverTrigger asChild>
              <div
                className={`relative flex items-center w-full max-w-2xl mx-auto rounded-2xl border bg-white shadow-sm
                  transition-all duration-200 hover:shadow-md focus-within:shadow-md focus-within:ring-2 focus-within:ring-rose-200 focus-within:border-rose-300
                  ${smartOpen ? 'ring-2 ring-rose-200 border-rose-300 shadow-md' : 'border-gray-200'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <div className={`${isRTL ? 'pr-4' : 'pl-4'} flex items-center`}>
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  ref={smartInputRef}
                  type="text"
                  value={smartQuery}
                  onChange={(e) => handleSmartInputChange(e.target.value)}
                  onFocus={() => { if (!smartOpen) setSmartOpen(true) }}
                  placeholder={tr('ابحث في نبض...', 'Search Nabd...')}
                  className="flex-1 py-2.5 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                  aria-label={tr('البحث', 'Search')}
                  autoComplete="off"
                />
                {classification && smartQuery.trim() && (
                  <div className={`${isRTL ? 'pl-2' : 'pr-2'} flex items-center`}>
                    <Badge variant="outline" className={`${classification.color} text-[10px] px-1.5 py-0 h-6 gap-0.5 font-medium border`}>
                      <span className="text-xs">{classification.emoji}</span>
                      <span>{isRTL ? classification.label : classification.labelEn}</span>
                    </Badge>
                  </div>
                )}
                {smartQuery.trim() && (
                  <button onClick={() => { setSmartQuery(''); smartInputRef.current?.focus() }}
                    className={`${isRTL ? 'pl-3' : 'pr-3'} text-gray-400 hover:text-gray-600 transition-colors`}
                    aria-label={tr('مسح', 'Clear')}>
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="p-2 w-[var(--radix-popover-trigger-width)] rounded-2xl border border-gray-200 shadow-xl"
              align="start"
              sideOffset={4}
            >
              {renderSmartSuggestions()}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ── Mobile search bar (expandable overlay) ── */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-100 md:hidden"
          >
            <div className="px-4 py-3">
              <form onSubmit={handleMobileSearch} className="flex items-center gap-2">
                <div className="relative" data-location-dropdown>
                  <button type="button" onClick={() => setIsLocationOpen(!isLocationOpen)}
                    className="flex h-10 items-center gap-1 rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span className="max-w-[80px] truncate text-gray-700">{language === 'ar' ? selectedRegion.nameAr : selectedRegion.nameEn}</span>
                  </button>
                </div>
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={tr('ابحث...', 'Search...')}
                  className="h-10 flex-1 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-500"
                  dir={isRTL ? 'rtl' : 'ltr'} autoFocus />
                <Button type="submit" size="icon" className="h-10 w-10 bg-red-500 hover:bg-red-600">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              <AnimatePresence>
                {isLocationOpen && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="mt-2 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    {REGIONS.map((region) => (
                      <button key={region.id} type="button"
                        onClick={() => { setRegion(region); setIsLocationOpen(false) }}
                        className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
                          selectedRegion.id === region.id ? 'bg-red-50 font-medium text-red-600' : 'text-gray-700'
                        }`}>
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{language === 'ar' ? region.nameAr : region.nameEn}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Category mega-menu dropdown ── */}
      {hoveredCategory && currentCategory && (
        <div
          id="category-dropdown"
          className="absolute z-[60]"
          style={{ left: '50%', transform: 'translateX(-50%)', top: '100%' }}
          onMouseEnter={() => { if (window.innerWidth >= 768) setHoveredCategory(hoveredCategory) }}
          onMouseLeave={() => { if (window.innerWidth >= 768) setHoveredCategory(null) }}
        >
          <div className="h-[3px] w-full rounded-t-sm bg-red-500" />
          <div className="w-[360px] max-h-[70vh] overflow-y-auto rounded-b-lg border border-gray-200 border-t-0 bg-white p-4 shadow-2xl sm:w-[420px]">
            {currentCategory.groups?.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-3 last:mb-0">
                <h4 className="mb-2 px-1 text-xs font-bold uppercase text-gray-400">{tr(group.name, group.nameEn)}</h4>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon
                    return (
                      <button key={item.id}
                        onClick={() => { navigate('search', { category: item.id }); setHoveredCategory(null) }}
                        className="group flex items-center gap-2 rounded px-2 py-2 text-sm text-gray-700 transition-colors hover:bg-red-50 hover:text-red-500">
                        <ItemIcon className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-red-500" />
                        <span>{tr(item.name, item.nameEn)}</span>
                      </button>
                    )
                  })}
                </div>
                {groupIndex < (currentCategory.groups?.length || 0) - 1 && <div className="mt-3 h-px bg-gray-100" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
