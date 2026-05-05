'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Clock,
  Tag,
  ShieldCheck,
  Zap,
  Camera,
  Wifi,
  Car as CarIcon,
  UtensilsCrossed,
  Coffee,
  Building2,
} from 'lucide-react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';

// ════════════════════════════════════════════════════════════════════
// Category → Image Mapping
// ════════════════════════════════════════════════════════════════════

const CATEGORY_IMAGES: Record<string, string[]> = {
  'real-estate': [
    '/images/listings/apartment1.jpg',
    '/images/listings/villa1.jpg',
    '/images/listings/apartment2.jpg',
    '/images/listings/office1.jpg',
    '/images/listings/villa2.jpg',
    '/images/listings/shop1.jpg',
    '/images/listings/apartment3.jpg',
    '/images/listings/land1.jpg',
  ],
  'cars': [
    '/images/listings/car1.jpg',
    '/images/listings/car2.jpg',
    '/images/listings/car1.jpg',
    '/images/listings/car2.jpg',
  ],
  'car-services': [
    '/images/listings/car1.jpg',
    '/images/listings/car2.jpg',
  ],
  'electronics': [
    '/images/listings/electronics1.jpg',
    '/images/listings/electronics1.jpg',
  ],
  'restaurants': [
    '/images/listings/restaurant1.jpg',
    '/images/listings/cafe1.jpg',
    '/images/listings/restaurant1.jpg',
  ],
  'dining': [
    '/images/listings/restaurant1.jpg',
    '/images/listings/cafe1.jpg',
  ],
  'hotels': [
    '/images/listings/hotel1.jpg',
    '/images/listings/hotel1.jpg',
  ],
  'medical': [
    '/images/listings/medical1.jpg',
    '/images/listings/pharmacy1.jpg',
  ],
  'pharmacies': [
    '/images/listings/pharmacy1.jpg',
    '/images/listings/pharmacy1.jpg',
  ],
  'beauty': [
    '/images/listings/beauty1.jpg',
    '/images/listings/beauty1.jpg',
  ],
  'education': [
    '/images/listings/education1.jpg',
    '/images/listings/education1.jpg',
  ],
  'furniture': [
    '/images/listings/furniture1.jpg',
    '/images/listings/furniture1.jpg',
  ],
  'services': [
    '/images/listings/service1.jpg',
    '/images/listings/service1.jpg',
  ],
  'markets': [
    '/images/listings/restaurant1.jpg',
    '/images/listings/cafe1.jpg',
    '/images/listings/restaurant1.jpg',
  ],
  'sports': [
    '/images/listings/service1.jpg',
    '/images/listings/service1.jpg',
  ],
  'tourism': [
    '/images/listings/hotel1.jpg',
    '/images/listings/hotel1.jpg',
  ],
  'events': [
    '/images/listings/service1.jpg',
    '/images/listings/service1.jpg',
  ],
  'shopping': [
    '/images/listings/beauty1.jpg',
    '/images/listings/furniture1.jpg',
  ],
  'default': [
    '/images/listings/service1.jpg',
  ],
};

/** Get images for a listing based on its category and index */
export function getListingImages(category: string, index: number = 0): string[] {
  const images = CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES['default'];
  return [images[index % images.length]];
}

// ════════════════════════════════════════════════════════════════════
// Category → Badge Color Mapping
// ════════════════════════════════════════════════════════════════════

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  'real-estate': 'bg-teal-600/90 text-white',
  'cars': 'bg-slate-600/90 text-white',
  'car-services': 'bg-sky-600/90 text-white',
  'electronics': 'bg-blue-600/90 text-white',
  'restaurants': 'bg-amber-600/90 text-white',
  'dining': 'bg-orange-600/90 text-white',
  'hotels': 'bg-purple-600/90 text-white',
  'medical': 'bg-red-600/90 text-white',
  'pharmacies': 'bg-emerald-600/90 text-white',
  'beauty': 'bg-pink-600/90 text-white',
  'education': 'bg-indigo-600/90 text-white',
  'furniture': 'bg-rose-600/90 text-white',
  'services': 'bg-emerald-600/90 text-white',
  'jobs': 'bg-violet-600/90 text-white',
};

export function getCategoryBadgeColor(category: string): string {
  return CATEGORY_BADGE_COLORS[category] ?? 'bg-gray-600/90 text-white';
}

// ════════════════════════════════════════════════════════════════════
// Category → Label Mapping
// ════════════════════════════════════════════════════════════════════

const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  'real-estate': { ar: 'عقارات', en: 'Real Estate' },
  'cars': { ar: 'سيارات', en: 'Cars' },
  'car-services': { ar: 'خدمات سيارات', en: 'Car Services' },
  'electronics': { ar: 'إلكترونيات', en: 'Electronics' },
  'restaurants': { ar: 'مطاعم', en: 'Restaurants' },
  'dining': { ar: 'مطاعم', en: 'Dining' },
  'hotels': { ar: 'فنادق', en: 'Hotels' },
  'medical': { ar: 'طبي', en: 'Medical' },
  'pharmacies': { ar: 'صيدليات', en: 'Pharmacies' },
  'beauty': { ar: 'جمال', en: 'Beauty' },
  'education': { ar: 'تعليم', en: 'Education' },
  'furniture': { ar: 'أثاث', en: 'Furniture' },
  'services': { ar: 'خدمات', en: 'Services' },
  'jobs': { ar: 'وظائف', en: 'Jobs' },
  'tourism': { ar: 'سياحة', en: 'Tourism' },
  'business': { ar: 'أعمال', en: 'Business' },
  'experiences': { ar: 'تجارب', en: 'Experiences' },
  'arts': { ar: 'فنون', en: 'Arts' },
  'shopping': { ar: 'تسوق', en: 'Shopping' },
  'food': { ar: 'طعام', en: 'Food' },
  'health': { ar: 'صحة', en: 'Health' },
  'transport': { ar: 'نقل', en: 'Transport' },
  'sports': { ar: 'رياضة', en: 'Sports' },
};

export function getCategoryLabel(category: string, language: 'ar' | 'en'): string {
  const info = CATEGORY_LABELS[category];
  return info ? (language === 'ar' ? info.ar : info.en) : category;
}

// ════════════════════════════════════════════════════════════════════
// Price Formatting
// ════════════════════════════════════════════════════════════════════

export function formatPrice(price: number, language: 'ar' | 'en'): string {
  const formatted = price.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US');
  return language === 'ar' ? `${formatted} ل.س` : `${formatted} SYP`;
}

// ════════════════════════════════════════════════════════════════════
// Shared Airbnb-Style Listing Card
// ════════════════════════════════════════════════════════════════════

export interface ListingCardProps {
  /** Unique ID */
  id: string;
  /** Listing title */
  title: string;
  /** Category slug */
  category: string;
  /** Price in minor units */
  price: number;
  /** Provider/seller name */
  providerName?: string;
  /** Subtitle (e.g. location) */
  subtitle?: string;
  /** Rating value (0-5) */
  rating?: number;
  /** Number of reviews */
  reviewCount?: number;
  /** Whether this item is favorited */
  isFavorite?: boolean;
  /** Callback when favorite toggled */
  onToggleFavorite?: (id: string) => void;
  /** Callback when card clicked */
  onClick?: () => void;
  /** Badge text to show on image (e.g. "للإيجار" / "For Rent") */
  badgeText?: string;
  /** Badge color class (e.g. "bg-amber-500/90 text-white") */
  badgeColor?: string;
  /** Secondary badge (e.g. "Featured") */
  secondaryBadge?: string;
  /** Features row (e.g. beds/baths/area) */
  features?: { icon: React.ElementType; label: string }[];
  /** Custom image URL(s). If not provided, uses category-based images */
  images?: string[];
  /** Index for deterministic image selection from category pool */
  imageIndex?: number;
  /** Card width class for horizontal scroll mode */
  widthClass?: string;
  /** Whether to show the heart/favorite button */
  showFavorite?: boolean;
  /** Whether to show the rating */
  showRating?: boolean;
  /** Whether this is a horizontal scroll card */
  isScrollCard?: boolean;
}

export function ListingCard({
  id,
  title,
  category,
  price,
  providerName,
  subtitle,
  rating,
  reviewCount,
  isFavorite = false,
  onToggleFavorite,
  onClick,
  badgeText,
  badgeColor,
  secondaryBadge,
  features,
  images: propImages,
  imageIndex = 0,
  widthClass,
  showFavorite = true,
  showRating = true,
  isScrollCard = true,
}: ListingCardProps) {
  const { language, isRTL } = useLanguage();
  const isArabic = language === 'ar';
  const navigate = useNavigationStore((s) => s.navigate);

  // Determine images to display
  const images = propImages ?? getListingImages(category, imageIndex);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const hasMultipleImages = images.length > 1;
  const categoryLabel = getCategoryLabel(category, language);
  const priceFormatted = formatPrice(price, language);

  // Determine badge
  const effectiveBadgeColor = badgeColor ?? getCategoryBadgeColor(category);

  // Navigation
  const handleClick = onClick ?? (() => navigate('listing-detail', { id }));

  // Image carousel navigation
  const nextImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    },
    [images.length]
  );

  const prevImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    },
    [images.length]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: imageIndex * 0.03 }}
      className={`group cursor-pointer ${isScrollCard ? 'flex-shrink-0' : ''} ${widthClass ?? (isScrollCard ? 'w-[200px] sm:w-[220px] md:w-[240px]' : '')}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Image Container (Square — Airbnb Style) ── */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5">
        {/* Main Image */}
        <img
          src={images[currentImageIndex]}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Carousel Arrows (only on hover with multiple images) */}
        {hasMultipleImages && isHovered && (
          <>
            <button
              onClick={prevImage}
              className="absolute start-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center hover:bg-white hover:shadow-md transition-all"
              aria-label={isArabic ? 'الصورة التالية' : 'Previous image'}
            >
              <ChevronLeft className="w-3.5 h-3.5 text-gray-700" />
            </button>
            <button
              onClick={nextImage}
              className="absolute end-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center hover:bg-white hover:shadow-md transition-all"
              aria-label={isArabic ? 'الصورة السابقة' : 'Next image'}
            >
              <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
            </button>
          </>
        )}

        {/* Image Dot Indicators */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1 rounded-full transition-all duration-200 ${
                  idx === currentImageIndex
                    ? 'w-2 bg-white scale-125'
                    : 'w-1 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

        {/* Favorite Button (top-right) */}
        {showFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(id);
            }}
            className="absolute top-2 end-2 z-10 p-1.5 transition-transform hover:scale-110"
            aria-label={isFavorite ? (isArabic ? 'إزالة من المفضلة' : 'Remove from favorites') : (isArabic ? 'أضف للمفضلة' : 'Add to favorites')}
          >
            <Heart
              className={`w-5 h-5 transition-all ${
                isFavorite
                  ? 'fill-rose-500 text-rose-500'
                  : 'text-white stroke-[2px] drop-shadow-md hover:fill-white/30'
              }`}
            />
          </button>
        )}

        {/* Primary Badge (top-left) — e.g. For Sale / For Rent / Category */}
        {badgeText && (
          <div className="absolute top-2 start-2 z-10">
            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full backdrop-blur-sm ${effectiveBadgeColor}`}>
              {badgeText}
            </span>
          </div>
        )}

        {/* Category Badge (top-left, only if no custom badge) */}
        {!badgeText && (
          <div className="absolute top-2 start-2 z-10">
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full backdrop-blur-sm bg-white/90 text-gray-700 shadow-sm">
              {categoryLabel}
            </span>
          </div>
        )}

        {/* Secondary Badge (bottom-left) — e.g. Featured / Verified */}
        {secondaryBadge && (
          <div className="absolute bottom-2 start-2 z-10">
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-white/90 text-gray-900 backdrop-blur-sm shadow-sm">
              {secondaryBadge}
            </span>
          </div>
        )}

        {/* Image Counter (bottom-right, only if multiple) */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 end-2 z-10">
            <span className="px-1.5 py-0.5 text-[9px] font-medium rounded-full bg-black/50 text-white backdrop-blur-sm flex items-center gap-0.5">
              <Camera className="w-2.5 h-2.5" />
              {currentImageIndex + 1}/{images.length}
            </span>
          </div>
        )}
      </div>

      {/* ── Card Info (Airbnb Style) ── */}
      <div>
        {/* Title & Rating Row */}
        <div className="flex items-start justify-between gap-1">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1 min-w-0">
            {title}
          </h3>
          {showRating && rating !== undefined && rating > 0 && (
            <div className="flex items-center gap-0.5 shrink-0">
              <Star className="w-3 h-3 fill-gray-900 text-gray-900" />
              <span className="text-xs font-medium text-gray-900">{rating.toFixed(1)}</span>
              {reviewCount !== undefined && (
                <span className="text-xs text-gray-400">({reviewCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Subtitle / Location */}
        {subtitle && (
          <p className="text-xs text-gray-500 font-medium mt-0.5 line-clamp-1">
            {subtitle}
          </p>
        )}

        {/* Provider Name (if no subtitle) */}
        {!subtitle && providerName && (
          <p className="text-xs text-gray-500 font-medium mt-0.5 line-clamp-1">
            {providerName}
          </p>
        )}

        {/* Features Row (e.g. beds/baths/area) */}
        {features && features.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <span key={idx} className="flex items-center gap-0.5">
                  <Icon className="w-3 h-3" />
                  {feat.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Price Row */}
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-sm font-bold text-gray-900">{priceFormatted}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// Horizontal Scrolling Container with Nav Arrows
// ════════════════════════════════════════════════════════════════════

export interface ListingCardScrollProps {
  children: React.ReactNode;
  className?: string;
}

export function ListingCardScroll({ children, className }: ListingCardScrollProps) {
  const scrollRef = useCallback((el: HTMLDivElement | null) => {
    if (el) {
      // Hide scrollbar via CSS
      el.style.scrollbarWidth = 'none';
      // @ts-expect-error msOverflowStyle is IE-specific
      el.style.msOverflowStyle = 'none';
    }
  }, []);

  return (
    <div
      ref={scrollRef}
      className={`flex gap-4 overflow-x-auto pb-2 scroll-smooth ${className ?? ''}`}
    >
      {children}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// View All Card (Airbnb 2x2 Photo Grid Style)
// ════════════════════════════════════════════════════════════════════

export interface ViewAllCardProps {
  count: number;
  labelAr?: string;
  labelEn?: string;
  images?: string[];
  onClick: () => void;
  widthClass?: string;
}

export function ViewAllCard({
  count,
  labelAr = 'عرض الكل',
  labelEn = 'Show all',
  images = [],
  onClick,
  widthClass,
}: ViewAllCardProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const displayImages = images.slice(0, 4);

  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 group cursor-pointer ${widthClass ?? 'w-[200px] sm:w-[220px] md:w-[240px]'}`}
    >
      <div className="aspect-square rounded-xl overflow-hidden relative bg-gray-100">
        {/* 2x2 Photo Grid */}
        {displayImages.length >= 4 ? (
          <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5">
            {displayImages.map((img, i) => (
              <div key={i} className="overflow-hidden">
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : displayImages.length > 0 ? (
          <img
            src={displayImages[0]}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />

        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="text-base font-semibold">
            {isArabic ? labelAr : labelEn}
          </span>
          <span className="text-xs text-white/80 mt-0.5">
            {count} {isArabic ? 'عقار' : 'properties'}
          </span>
        </div>
      </div>
    </button>
  );
}

export default ListingCard;
