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
  Heart,
  ArrowLeft,
  ArrowRight,
  Grid3X3,
  Star,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  PackageOpen,
  Loader2,
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
  keywords: string[]; // Arabic keywords for client-side filtering
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
    keywords: ['مكتب', 'مكاتب', 'office', 'مكتبة', 'عقار تجاري', 'commercial'],
  },
  {
    id: 'shop',
    nameAr: 'محلات',
    nameEn: 'Shops',
    icon: Store,
    image: '/images/real-estate/shop.jpg',
    color: '#FC642D',
    keywords: ['محل', 'محلات', 'shop', 'store', 'متج', 'بازار', 'سوق', ' showroom'],
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

// ════════════════════════════════════════════════════════════════════
// Airbnb-Style Category Bar Component
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
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll(isArabic ? 'right' : 'left')}
          className="absolute start-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-md flex items-center justify-center hover:bg-white hover:shadow-lg transition-all"
          aria-label={isArabic ? 'تمرير لليمين' : 'Scroll left'}
        >
          <ChevronDown
            className={`w-4 h-4 text-gray-600 ${isArabic ? '-rotate-90' : 'rotate-90'}`}
          />
        </button>
      )}

      {/* Scrollable Category Container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center gap-6 sm:gap-8 overflow-x-auto py-4 px-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {PROPERTY_TYPES.map((type) => {
          const isSelected = selectedType === type.id;
          const Icon = type.icon;

          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={`flex flex-col items-center gap-1.5 min-w-[72px] group transition-all duration-200 ${
                isSelected ? 'scale-105' : ''
              }`}
            >
              {/* Image Container */}
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
                {/* Subtle overlay for better label visibility */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to top, ${type.color}40, transparent)`,
                  }}
                />
              </div>

              {/* Label */}
              <span
                className={`text-xs font-medium transition-colors duration-200 whitespace-nowrap ${
                  isSelected
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-500 group-hover:text-gray-900'
                }`}
              >
                {isArabic ? type.nameAr : type.nameEn}
              </span>

              {/* Selection Indicator */}
              <div
                className={`h-0.5 w-6 rounded-full transition-all duration-200 ${
                  isSelected ? 'bg-gray-900' : 'bg-transparent'
                }`}
              />
            </button>
          );
        })}

        {/* "All Categories" Button (Sheet) */}
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
          <SheetContent
            side="bottom"
            className="h-[60vh] rounded-t-2xl px-4 pt-4"
          >
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
                      isSelected
                        ? 'bg-gray-100 ring-2 ring-gray-900'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${type.color}15`,
                      }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{
                          color: type.color,
                          strokeWidth: isSelected ? 2.5 : 2,
                          opacity: isSelected ? 1 : 0.7,
                        }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium text-center ${
                        isSelected ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {isArabic ? type.nameAr : type.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll(isArabic ? 'left' : 'right')}
          className="absolute end-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-md flex items-center justify-center hover:bg-white hover:shadow-lg transition-all"
          aria-label={isArabic ? 'تمرير لليسار' : 'Scroll right'}
        >
          <ChevronDown
            className={`w-4 h-4 text-gray-600 ${isArabic ? 'rotate-90' : '-rotate-90'}`}
          />
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// Property Listing Card
// ════════════════════════════════════════════════════════════════════

const placeholderGradients = [
  'from-amber-400 to-orange-300',
  'from-emerald-400 to-teal-300',
  'from-sky-400 to-cyan-300',
  'from-violet-400 to-purple-300',
  'from-rose-400 to-pink-300',
];

function PropertyCard({
  listing,
  index,
}: {
  listing: ListingSummary;
  index: number;
}) {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigationStore((s) => s.navigate);
  const [isFavorite, setIsFavorite] = useState(false);
  const gradientIndex = index % placeholderGradients.length;

  const priceFormatted =
    language === 'ar'
      ? `${listing.price.toLocaleString('ar-SA')} ل.س`
      : `${listing.price.toLocaleString('en-US')} SYP`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
      onClick={() => navigate('listing-detail', { id: listing.id })}
    >
      {/* Image Area */}
      <div className="aspect-[4/3] relative overflow-hidden">
        <div
          className={`w-full h-full bg-gradient-to-br ${placeholderGradients[gradientIndex]} flex items-center justify-center`}
        >
          <Building2 className="w-10 h-10 text-white/40" />
        </div>
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Type Badge */}
        <div className="absolute top-2.5 start-2.5">
          <Badge className="bg-white/90 text-gray-700 border-0 text-[10px] shadow-sm backdrop-blur-sm px-1.5 py-0 font-medium">
            {language === 'ar' ? 'عقارات' : 'Real Estate'}
          </Badge>
        </div>

        {/* For Sale / For Rent Badge */}
        <div className="absolute top-2.5 end-2.5">
          <Badge className="bg-emerald-500 text-white border-0 text-[10px] px-1.5 py-0 shadow-sm">
            {language === 'ar' ? 'للبيع' : 'For Sale'}
          </Badge>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute bottom-2.5 end-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-all hover:scale-110"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite
                ? 'fill-red-500 text-red-500'
                : 'text-gray-600 hover:text-red-500'
            }`}
          />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-3.5 space-y-2">
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-red-500 transition-colors">
          {listing.title}
        </h3>

        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
          <span className="text-xs text-gray-500 truncate">
            {listing.providerName}
          </span>
        </div>

        {/* Property specs (decorative, real data from backend doesn't have this) */}
        <div className="flex items-center gap-3 text-gray-400">
          <div className="flex items-center gap-1">
            <BedDouble className="w-3 h-3" />
            <span className="text-[10px]">3</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-3 h-3" />
            <span className="text-[10px]">2</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="w-3 h-3" />
            <span className="text-[10px]">150m²</span>
          </div>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-medium text-gray-600">4.8</span>
          </div>
          <span className="font-bold text-sm text-gray-900">
            {priceFormatted}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// Loading Skeleton
// ════════════════════════════════════════════════════════════════════

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
          <Skeleton className="aspect-[4/3] w-full" />
          <div className="p-3.5 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-3">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-10" />
            </div>
            <div className="flex justify-between pt-0.5">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-16" />
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

function filterByPropertyType(
  listings: ListingSummary[],
  typeId: string,
): ListingSummary[] {
  if (typeId === 'all') return listings;
  const propertyType = PROPERTY_TYPES.find((t) => t.id === typeId);
  if (!propertyType) return listings;

  // Client-side filtering by keyword matching in the title
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

  // Fetch all real-estate listings
  const { data, isLoading, isError, refetch } = useListingsByCategory(
    'real-estate',
    { page: 0, size: 20 },
  );

  const allListings = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;

  // Filter listings by selected property type
  const filteredListings = filterByPropertyType(allListings, selectedType);

  const sectionTitle = isArabic ? 'العقارات' : 'Real Estate';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // Get the label for the selected type
  const selectedTypeLabel =
    isArabic
      ? PROPERTY_TYPES.find((t) => t.id === selectedType)?.nameAr ?? sectionTitle
      : PROPERTY_TYPES.find((t) => t.id === selectedType)?.nameEn ?? sectionTitle;

  return (
    <section className="py-2">
      {/* ── Section Header ── */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {sectionTitle}
            </h2>
            {!isLoading && (
              <p className="text-xs text-gray-400">
                {isArabic
                  ? `${totalElements} عقار`
                  : `${totalElements} properties`}
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
        <RealEstateCategoryBar
          selectedType={selectedType}
          onSelect={setSelectedType}
        />
      </div>

      {/* ── Filter Label ── */}
      {selectedType !== 'all' && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-3"
        >
          <Badge
            variant="outline"
            className="text-xs px-2.5 py-1 border-emerald-200 text-emerald-700 bg-emerald-50"
          >
            {selectedTypeLabel}
          </Badge>
          <span className="text-xs text-gray-400">
            {isArabic
              ? `${filteredListings.length} نتيجة`
              : `${filteredListings.length} results`}
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
            {isArabic
              ? 'لا يمكن تحميل العقارات حالياً'
              : 'Cannot load properties right now'}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            {isArabic ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        </div>
      )}

      {/* ── Listings Grid ── */}
      {!isLoading && !isError && filteredListings.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedType}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {filteredListings.map((listing, idx) => (
              <PropertyCard key={listing.id} listing={listing} index={idx} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Empty State ── */}
      {!isLoading && !isError && filteredListings.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-2xl">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            {selectedType !== 'all'
              ? isArabic
                ? `لا توجد عقارات من نوع "${selectedTypeLabel}"`
                : `No ${selectedTypeLabel} properties found`
              : isArabic
                ? 'لا توجد عقارات حالياً'
                : 'No properties available yet'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {isArabic
              ? 'ترقبوا عقارات جديدة قريباً'
              : 'Stay tuned for new properties coming soon'}
          </p>
          {selectedType !== 'all' && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setSelectedType('all')}
            >
              {isArabic ? 'عرض كل العقارات' : 'View all properties'}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
