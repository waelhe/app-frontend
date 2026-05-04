'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Home,
  Landmark,
  Building,
  Store,
  Warehouse,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  ArrowLeft,
  ArrowRight,
  Grid3X3,
  Star,
  Bed,
  Bath,
  Maximize,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { useListingsByCategory } from '@/hooks/useApi';
import type { ListingSummary } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// ════════════════════════════════════════════════════════════════════
// Property Type Definitions
// ════════════════════════════════════════════════════════════════════

interface PropertyType {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: React.ElementType;
  image: string;
  color: string;
  keywords: string[];
}

const PROPERTY_TYPES: PropertyType[] = [
  {
    id: 'all',
    nameAr: 'الكل',
    nameEn: 'All',
    icon: Home,
    image: '/images/real-estate/villa.jpg',
    color: '#1a1a1a',
    keywords: [],
  },
  {
    id: 'apartment',
    nameAr: 'شقق',
    nameEn: 'Apartments',
    icon: Building,
    image: '/images/real-estate/apartments.jpg',
    color: '#FF5A5F',
    keywords: ['شقة', 'شقق', 'apartment', 'دوبلكس', 'duplex', 'استوديو', 'studio', 'بنتهاوس', 'penthouse'],
  },
  {
    id: 'villa',
    nameAr: 'فلل',
    nameEn: 'Villas',
    icon: Landmark,
    image: '/images/real-estate/villa.jpg',
    color: '#00A699',
    keywords: ['فيلا', 'فلل', 'villa', 'قصر', 'منزل', 'house', 'دار'],
  },
  {
    id: 'office',
    nameAr: 'مكاتب',
    nameEn: 'Offices',
    icon: Building2,
    image: '/images/real-estate/office.jpg',
    color: '#6366F1',
    keywords: ['مكتب', 'مكاتب', 'office', 'عقار تجاري', 'commercial'],
  },
  {
    id: 'shop',
    nameAr: 'محلات',
    nameEn: 'Shops',
    icon: Store,
    image: '/images/real-estate/shop.jpg',
    color: '#FC642D',
    keywords: ['محل', 'محلات', 'shop', 'store', 'متج', 'بازار', 'سوق', 'showroom'],
  },
  {
    id: 'land',
    nameAr: 'أراضي',
    nameEn: 'Land',
    icon: Warehouse,
    image: '/images/real-estate/land.jpg',
    color: '#767676',
    keywords: ['أرض', 'أراضي', 'land', 'plot', 'قطعة', 'مزرعة', 'farm', 'مخطط'],
  },
];

// Placeholder gradients for cards without images
const placeholderGradients = [
  'from-amber-400 to-orange-300',
  'from-emerald-400 to-teal-300',
  'from-sky-400 to-cyan-300',
  'from-violet-400 to-purple-300',
  'from-rose-400 to-pink-300',
  'from-teal-400 to-green-300',
  'from-orange-400 to-amber-300',
  'from-indigo-400 to-blue-300',
];

// ════════════════════════════════════════════════════════════════════
// Airbnb-Style Category Bar (with circular images)
// ════════════════════════════════════════════════════════════════════

function RealEstateCategoryBar({
  selectedType,
  onSelect,
}: {
  selectedType: string;
  onSelect: (id: string) => void;
}) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === 'left' ? -200 : 200,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 350);
  };

  return (
    <div className="relative real-estate-category-bar">
      {canScrollLeft && (
        <button
          onClick={() => scroll(isArabic ? 'right' : 'left')}
          className="absolute start-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-md flex items-center justify-center hover:bg-white hover:shadow-lg transition-all"
          aria-label={isArabic ? 'تمرير لليمين' : 'Scroll left'}
        >
          <ChevronDown className={`w-4 h-4 text-gray-600 ${isArabic ? '-rotate-90' : 'rotate-90'}`} />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center gap-6 sm:gap-8 overflow-x-auto py-4 px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {PROPERTY_TYPES.map((type) => {
          const isSelected = selectedType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={`flex flex-col items-center gap-1.5 min-w-[72px] group transition-all duration-200 ${
                isSelected ? 'scale-105' : ''
              }`}
            >
              <div
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden transition-all duration-200 shadow-md ${
                  isSelected
                    ? 'ring-2 ring-gray-900 ring-offset-2 shadow-lg'
                    : 'opacity-90 group-hover:opacity-100 group-hover:shadow-lg'
                }`}
              >
                <img
                  src={type.image}
                  alt={isArabic ? type.nameAr : type.nameEn}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${type.color}40, transparent)` }} />
              </div>
              <span className={`text-xs font-medium transition-colors duration-200 whitespace-nowrap ${
                isSelected ? 'text-gray-900 font-semibold' : 'text-gray-500 group-hover:text-gray-900'
              }`}>
                {isArabic ? type.nameAr : type.nameEn}
              </span>
              <div className={`h-0.5 w-6 rounded-full transition-all duration-200 ${
                isSelected ? 'bg-gray-900' : 'bg-transparent'
              }`} />
            </button>
          );
        })}

        <Sheet>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center gap-1.5 min-w-[72px] group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-gray-500 transition-colors">
                <Grid3X3 className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
              </div>
              <span className="text-xs font-medium text-gray-400 group-hover:text-gray-600 whitespace-nowrap">
                {isArabic ? 'المزيد' : 'More'}
              </span>
              <div className="h-0.5 w-6 rounded-full bg-transparent" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60vh] rounded-t-2xl px-4 pt-4">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-lg font-bold">
                {isArabic ? 'أنواع العقارات' : 'Property Types'}
              </SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 overflow-y-auto max-h-[45vh] pb-6">
              {PROPERTY_TYPES.filter((t) => t.id !== 'all').map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => onSelect(type.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                      isSelected ? 'bg-gray-100 ring-2 ring-gray-900' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${type.color}15` }}>
                      <Icon className="w-5 h-5" style={{ color: type.color, strokeWidth: isSelected ? 2.5 : 2, opacity: isSelected ? 1 : 0.7 }} />
                    </div>
                    <span className={`text-xs font-medium text-center ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                      {isArabic ? type.nameAr : type.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {canScrollRight && (
        <button
          onClick={() => scroll(isArabic ? 'left' : 'right')}
          className="absolute end-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-md flex items-center justify-center hover:bg-white hover:shadow-lg transition-all"
          aria-label={isArabic ? 'تمرير لليسار' : 'Scroll right'}
        >
          <ChevronDown className={`w-4 h-4 text-gray-600 ${isArabic ? 'rotate-90' : '-rotate-90'}`} />
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// Airbnb-Style Property Card (Square image, horizontal scroll)
// ════════════════════════════════════════════════════════════════════

function PropertyCard({
  listing,
  index,
  isFavorite,
  onToggleFavorite,
}: {
  listing: ListingSummary;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const { language, isRTL } = useLanguage();
  const isArabic = language === 'ar';
  const navigate = useNavigationStore((s) => s.navigate);
  const gradientIndex = index % placeholderGradients.length;

  // Determine if listing title suggests For Sale or For Rent
  const titleLower = listing.title.toLowerCase();
  const isForRent = /للإيجار|إيجار|rent|للأجرة/.test(titleLower);

  const priceFormatted =
    language === 'ar'
      ? `${listing.price.toLocaleString('ar-SA')} ل.س`
      : `${listing.price.toLocaleString('en-US')} SYP`;

  return (
    <div className="flex-shrink-0 w-[200px] sm:w-[220px] md:w-[240px] group cursor-pointer">
      {/* ── Image Container (Square — Airbnb Style) ── */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
        {/* Gradient placeholder */}
        <div className={`w-full h-full bg-gradient-to-br ${placeholderGradients[gradientIndex]} flex items-center justify-center`}>
          <Building2 className="w-10 h-10 text-white/40" />
        </div>
        {/* Hover zoom */}
        <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-300" />

        {/* Favorite Button (top-right) */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(listing.id); }}
          className="absolute top-2 end-2 p-1.5 transition-transform hover:scale-110 z-10"
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorite
                ? 'fill-rose-500 text-rose-500'
                : 'text-white drop-shadow-lg'
            }`}
          />
        </button>

        {/* Type Badge: For Sale / For Rent (top-left) */}
        <div className="absolute top-2 start-2">
          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full backdrop-blur-sm ${
            isForRent
              ? 'bg-amber-500/90 text-white'
              : 'bg-teal-600/90 text-white'
          }`}>
            {isForRent
              ? (isArabic ? 'للإيجار' : 'For Rent')
              : (isArabic ? 'للبيع' : 'For Sale')
            }
          </span>
        </div>

        {/* Featured Badge (bottom-left) */}
        <div className="absolute bottom-2 start-2">
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-white/90 text-gray-900 backdrop-blur-sm">
            ⭐ {isArabic ? 'مميز' : 'Featured'}
          </span>
        </div>
      </div>

      {/* ── Property Info (Airbnb Style) ── */}
      <div onClick={() => navigate('listing-detail', { id: listing.id })}>
        {/* Location */}
        <p className="text-xs text-gray-500 font-medium mb-0.5">
          {listing.providerName}
        </p>

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
          {listing.title}
        </h3>

        {/* Property Specs */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <span className="flex items-center gap-0.5">
            <Bed className="w-3 h-3" />
            3
          </span>
          <span className="flex items-center gap-0.5">
            <Bath className="w-3 h-3" />
            2
          </span>
          <span className="flex items-center gap-0.5">
            <Maximize className="w-3 h-3" />
            150م²
          </span>
        </div>

        {/* Price & Rating Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm font-bold text-gray-900">{priceFormatted}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-gray-900 text-gray-900" />
            <span className="text-xs font-medium">4.8</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// View All Card (2×2 Photo Grid — Airbnb Style)
// ════════════════════════════════════════════════════════════════════

function ViewAllCard({
  listings,
  onClick,
}: {
  listings: ListingSummary[];
  onClick: () => void;
}) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-[200px] sm:w-[220px] md:w-[240px] group cursor-pointer"
    >
      <div className="aspect-square rounded-xl overflow-hidden relative bg-gray-100">
        {/* 2×2 Photo Grid */}
        <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5">
          {listings.slice(0, 4).map((_, i) => (
            <div key={i} className={`overflow-hidden bg-gradient-to-br ${placeholderGradients[i % placeholderGradients.length]}`} />
          ))}
        </div>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="text-base font-semibold">{isArabic ? 'عرض الكل' : 'Show all'}</span>
          <span className="text-xs text-white/80 mt-0.5">
            {listings.length} {isArabic ? 'عقار' : 'properties'}
          </span>
        </div>
      </div>
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════
// All Properties Drawer (Sheet)
// ════════════════════════════════════════════════════════════════════

function AllPropertiesDrawer({
  open,
  onOpenChange,
  listings,
  favorites,
  onToggleFavorite,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listings: ListingSummary[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}) {
  const { language, isRTL } = useLanguage();
  const isArabic = language === 'ar';
  const navigate = useNavigationStore((s) => s.navigate);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl px-4 pt-4">
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />

        {/* Header */}
        <div className="pb-3 border-b border-gray-100 mb-4">
          <h2 className="text-lg font-bold">
            {isArabic ? 'جميع العقارات' : 'All Properties'}
          </h2>
          <p className="text-sm text-gray-500">
            {listings.length} {isArabic ? 'عقار متاح' : 'properties available'}
          </p>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto pb-8" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {listings.map((listing, idx) => {
              const isFavorite = favorites.includes(listing.id);
              const titleLower = listing.title.toLowerCase();
              const isForRent = /للإيجار|إيجار|rent|للأجرة/.test(titleLower);
              const gradientIndex = idx % placeholderGradients.length;

              return (
                <div
                  key={listing.id}
                  className="group cursor-pointer"
                  onClick={() => {
                    onOpenChange(false);
                    navigate('listing-detail', { id: listing.id });
                  }}
                >
                  {/* Image */}
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                    <div className={`w-full h-full bg-gradient-to-br ${placeholderGradients[gradientIndex]} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                      <Building2 className="w-8 h-8 text-white/40" />
                    </div>
                    {/* Favorite */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleFavorite(listing.id); }}
                      className="absolute top-2 end-2 p-1.5 z-10"
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`} />
                    </button>
                    {/* Type badge */}
                    <span className={`absolute top-2 start-2 px-2 py-0.5 text-[10px] font-semibold rounded-full backdrop-blur-sm ${
                      isForRent ? 'bg-amber-500/90 text-white' : 'bg-teal-600/90 text-white'
                    }`}>
                      {isForRent ? (isArabic ? 'للإيجار' : 'For Rent') : (isArabic ? 'للبيع' : 'For Sale')}
                    </span>
                  </div>

                  {/* Info */}
                  <p className="text-xs text-gray-500 font-medium">{listing.providerName}</p>
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{listing.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-0.5"><Bed className="w-3 h-3" />3</span>
                    <span className="flex items-center gap-0.5"><Bath className="w-3 h-3" />2</span>
                    <span className="flex items-center gap-0.5"><Maximize className="w-3 h-3" />150م²</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold text-gray-900">
                      {isArabic
                        ? `${listing.price.toLocaleString('ar-SA')} ل.س`
                        : `${listing.price.toLocaleString('en-US')} SYP`}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-gray-900 text-gray-900" />
                      <span className="text-xs font-medium">4.8</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ════════════════════════════════════════════════════════════════════
// Loading Skeleton (Horizontal Scroll Style)
// ════════════════════════════════════════════════════════════════════

function LoadingSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[200px] sm:w-[220px] md:w-[240px]">
          <Skeleton className="aspect-square rounded-xl w-full" />
          <div className="mt-2 space-y-1.5">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-3 w-6" />
              <Skeleton className="h-3 w-6" />
              <Skeleton className="h-3 w-10" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// Client-Side Filtering Helper
// ════════════════════════════════════════════════════════════════════

function filterByPropertyType(listings: ListingSummary[], typeId: string): ListingSummary[] {
  if (typeId === 'all') return listings;
  const propertyType = PROPERTY_TYPES.find((t) => t.id === typeId);
  if (!propertyType) return listings;
  return listings.filter((listing) => {
    const titleLower = listing.title.toLowerCase();
    return propertyType.keywords.some((kw) => titleLower.includes(kw.toLowerCase()));
  });
}

// ════════════════════════════════════════════════════════════════════
// Main RealEstate Component
// ════════════════════════════════════════════════════════════════════

export default function RealEstate() {
  const { language, isRTL } = useLanguage();
  const isArabic = language === 'ar';
  const navigate = useNavigationStore((s) => s.navigate);
  const [selectedType, setSelectedType] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Fetch all real-estate listings
  const { data, isLoading, isError, refetch } = useListingsByCategory(
    'real-estate',
    { page: 0, size: 20 },
  );

  const allListings = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const filteredListings = filterByPropertyType(allListings, selectedType);

  const sectionTitle = isArabic ? 'العقارات' : 'Real Estate';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const selectedTypeLabel = isArabic
    ? PROPERTY_TYPES.find((t) => t.id === selectedType)?.nameAr ?? sectionTitle
    : PROPERTY_TYPES.find((t) => t.id === selectedType)?.nameEn ?? sectionTitle;

  // ── Horizontal Scroll Controls ──
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [checkScroll, filteredListings]);

  const scrollCards = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -280 : 280, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <section className="py-2">
      <div className="max-w-7xl mx-auto">
        {/* ── Section Header ── */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">{sectionTitle}</h2>
              {!isLoading && (
                <p className="text-xs text-gray-400">
                  {isArabic ? `${totalElements} عقار` : `${totalElements} properties`}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1"
            onClick={() => navigate('market', { category: 'real-estate' })}
          >
            {isArabic ? 'عرض الكل' : 'View All'}
            <ArrowIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* ── Airbnb-Style Category Bar ── */}
        <div className="border-b border-gray-100 mb-4">
          <RealEstateCategoryBar selectedType={selectedType} onSelect={setSelectedType} />
        </div>

        {/* ── Filter Label ── */}
        {selectedType !== 'all' && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-3"
          >
            <Badge variant="outline" className="text-xs px-2.5 py-1 border-emerald-200 text-emerald-700 bg-emerald-50">
              {selectedTypeLabel}
            </Badge>
            <span className="text-xs text-gray-400">
              {isArabic ? `${filteredListings.length} نتيجة` : `${filteredListings.length} results`}
            </span>
            <button
              onClick={() => setSelectedType('all')}
              className="text-xs text-red-500 hover:text-red-600 font-medium ms-1"
            >
              {isArabic ? 'إلغاء الفلتر' : 'Clear filter'}
            </button>
          </motion.div>
        )}

        {/* ── Loading State ── */}
        {isLoading && <LoadingSkeleton />}

        {/* ── Error State ── */}
        {isError && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-gray-600 text-sm mb-3">
              {isArabic ? 'لا يمكن تحميل العقارات حالياً' : 'Cannot load properties right now'}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              {isArabic ? 'إعادة المحاولة' : 'Retry'}
            </Button>
          </div>
        )}

        {/* ── Horizontal Scrolling Cards (Airbnb Style) ── */}
        {!isLoading && !isError && filteredListings.length > 0 && (
          <div className="relative">
            {/* Left Nav Button */}
            {canScrollLeft && (
              <button
                onClick={() => scrollCards(isRTL ? 'right' : 'left')}
                className="absolute start-0 top-[120px] -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 hover:scale-105 transition-transform"
              >
                <ChevronRight className="w-4 h-4 text-gray-700" />
              </button>
            )}

            {/* Right Nav Button */}
            {canScrollRight && (
              <button
                onClick={() => scrollCards(isRTL ? 'left' : 'right')}
                className="absolute end-0 top-[120px] -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 hover:scale-105 transition-transform"
              >
                <ChevronLeft className="w-4 h-4 text-gray-700" />
              </button>
            )}

            {/* Scrollable Cards Container */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedType}
                ref={scrollRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredListings.map((listing, idx) => (
                  <PropertyCard
                    key={listing.id}
                    listing={listing}
                    index={idx}
                    isFavorite={favorites.includes(listing.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}

                {/* View All Card (2×2 Photo Grid) */}
                {filteredListings.length > 4 && (
                  <ViewAllCard listings={filteredListings} onClick={() => setShowAll(true)} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* ── Empty State ── */}
        {!isLoading && !isError && filteredListings.length === 0 && (
          <div className="text-center py-10 bg-gray-50 rounded-2xl">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {selectedType !== 'all'
                ? isArabic ? `لا توجد عقارات من نوع "${selectedTypeLabel}"` : `No ${selectedTypeLabel} properties found`
                : isArabic ? 'لا توجد عقارات حالياً' : 'No properties available yet'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {isArabic ? 'ترقبوا عقارات جديدة قريباً' : 'Stay tuned for new properties coming soon'}
            </p>
            {selectedType !== 'all' && (
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setSelectedType('all')}>
                {isArabic ? 'عرض كل العقارات' : 'View all properties'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── All Properties Drawer ── */}
      <AllPropertiesDrawer
        open={showAll}
        onOpenChange={setShowAll}
        listings={filteredListings}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />
    </section>
  );
}
