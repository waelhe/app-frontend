'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  WifiOff,
  RefreshCw,
  ImageIcon,
  UserCircle,
} from 'lucide-react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { useListings, useListingsByCategory } from '@/hooks/useApi';
import { ApiError } from '@/lib/api';
import type { ListingSummary } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// ── Props ───────────────────────────────────────────────────────────

interface InteractiveMarketSectionProps {
  category?: string;
  titleAr?: string;
  titleEn?: string;
  icon?: React.ElementType;
  gradientFrom?: string;
  gradientTo?: string;
}

// ── Category Translations (Arabic + English) ────────────────────────

const categoryNames: Record<string, { ar: string; en: string }> = {
  beauty: { ar: 'جمال وعناية', en: 'Beauty' },
  cars: { ar: 'سيارات', en: 'Cars' },
  dining: { ar: 'مطاعم وطعام', en: 'Dining' },
  education: { ar: 'تعليم', en: 'Education' },
  electronics: { ar: 'إلكترونيات', en: 'Electronics' },
  furniture: { ar: 'أثاث', en: 'Furniture' },
  jobs: { ar: 'وظائف', en: 'Jobs' },
  'real-estate': { ar: 'عقارات', en: 'Real Estate' },
  services: { ar: 'خدمات', en: 'Services' },
  tourism: { ar: 'سياحة', en: 'Tourism' },
  medical: { ar: 'طبية', en: 'Medical' },
  business: { ar: 'أعمال', en: 'Business' },
  experiences: { ar: 'تجارب', en: 'Experiences' },
  arts: { ar: 'فنون', en: 'Arts' },
  shopping: { ar: 'تسوق', en: 'Shopping' },
  food: { ar: 'طعام', en: 'Food' },
  health: { ar: 'صحة', en: 'Health' },
};

// ── Fallback Gradients per Category ─────────────────────────────────

const categoryGradients: Record<string, string> = {
  beauty: 'from-pink-400 to-rose-300',
  cars: 'from-slate-500 to-zinc-400',
  dining: 'from-orange-400 to-amber-300',
  education: 'from-emerald-400 to-teal-300',
  electronics: 'from-sky-400 to-cyan-300',
  furniture: 'from-amber-500 to-yellow-400',
  jobs: 'from-violet-400 to-purple-300',
  'real-estate': 'from-emerald-500 to-green-400',
  services: 'from-rose-400 to-pink-300',
  tourism: 'from-teal-400 to-cyan-300',
  medical: 'from-red-400 to-rose-300',
  business: 'from-gray-500 to-slate-400',
  experiences: 'from-fuchsia-400 to-pink-300',
  arts: 'from-purple-400 to-violet-300',
  shopping: 'from-amber-400 to-orange-300',
  food: 'from-lime-400 to-green-300',
  health: 'from-emerald-400 to-teal-300',
};

const defaultGradient = 'from-gray-400 to-gray-300';

// ── Category Image Path Builder ─────────────────────────────────────

const categoriesWithImages = new Set([
  'cars',
  'electronics',
  'furniture',
  'beauty',
  'jobs',
  'services',
  'real-estate',
  'education',
  'dining',
]);

function getCategoryImagePath(category: string): string | null {
  if (categoriesWithImages.has(category)) {
    return `/images/categories/${category}.webp`;
  }
  return null;
}

// ── Category Icon (shown in fallback) ───────────────────────────────

const categoryIcons: Record<string, string> = {
  beauty: '💎',
  cars: '🚗',
  dining: '🍽️',
  education: '🎓',
  electronics: '📱',
  furniture: '🛋️',
  jobs: '💼',
  'real-estate': '🏠',
  services: '🔧',
  tourism: '✈️',
  medical: '🏥',
  business: '📊',
  experiences: '🎯',
  arts: '🎨',
  shopping: '🛍️',
  food: '🍕',
  health: '❤️',
};

// ── Price Formatting ────────────────────────────────────────────────

function formatPrice(price: number): string {
  return `${price.toLocaleString('ar-SA')} ر.س`;
}

// ── Listing Card ────────────────────────────────────────────────────

function ListingCard({ listing, index }: { listing: ListingSummary; index: number }) {
  const { language } = useLanguage();
  const navigate = useNavigationStore((s) => s.navigate);
  const [imageError, setImageError] = useState(false);

  const catInfo = categoryNames[listing.category];
  const categoryLabel =
    language === 'ar'
      ? catInfo?.ar ?? listing.category
      : catInfo?.en ?? listing.category;

  const imagePath = getCategoryImagePath(listing.category);
  const gradient = categoryGradients[listing.category] ?? defaultGradient;
  const icon = categoryIcons[listing.category] ?? '📋';

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const showImage = imagePath && !imageError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
      onClick={() => navigate('listing-detail', { id: listing.id })}
    >
      {/* Image Area */}
      <div className="aspect-[4/3] relative overflow-hidden">
        {showImage ? (
          <>
            <img
              src={imagePath}
              alt={categoryLabel}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={handleImageError}
              loading="lazy"
            />
            {/* Overlay gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </>
        ) : (
          <>
            {/* Fallback gradient with icon */}
            <div
              className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
            >
              <span className="text-4xl drop-shadow-lg">{icon}</span>
            </div>
            {/* Overlay gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </>
        )}

        {/* Category Badge */}
        <div className="absolute top-2.5 start-2.5">
          <Badge className="bg-white/90 text-gray-700 border-0 text-xs shadow-sm backdrop-blur-sm font-medium">
            {categoryLabel}
          </Badge>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3.5 space-y-2">
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-red-500 transition-colors">
          {listing.title}
        </h3>

        {/* Provider with avatar */}
        <div className="flex items-center gap-1.5">
          <Avatar className="h-4 w-4">
            <AvatarFallback className="bg-gray-100 text-[8px] text-gray-500 font-medium">
              {listing.providerName?.charAt(0)?.toUpperCase() ?? 'P'}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-gray-500 truncate">{listing.providerName}</span>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between pt-0.5">
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 border-gray-200 text-gray-400"
          >
            {categoryLabel}
          </Badge>
          <span className="font-bold text-sm text-gray-900">{formatPrice(listing.price)}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Loading Skeleton ────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
          <Skeleton className="aspect-[4/3] w-full" />
          <div className="p-3.5 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="flex justify-between pt-0.5">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function InteractiveMarketSection({
  category,
  titleAr,
  titleEn,
  icon: IconProp = Store,
  gradientFrom = 'from-red-500',
  gradientTo = 'to-red-600',
}: InteractiveMarketSectionProps) {
  const { language } = useLanguage();
  const navigate = useNavigationStore((s) => s.navigate);

  // Both hooks must be called unconditionally (rules of hooks)
  const categoryResult = useListingsByCategory(category ?? '', { page: 0, size: 12 });
  const allResult = useListings({ page: 0, size: 12 });

  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } = category
    ? categoryResult
    : allResult;

  const listings = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const sectionTitle =
    language === 'ar'
      ? (titleAr ?? (category ? categoryNames[category]?.ar ?? category : 'السوق'))
      : (titleEn ?? (category ? categoryNames[category]?.en ?? category : 'Market'));

  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  // Determine error type for better messaging
  const isBackendDown = error instanceof ApiError && (error.category === 'server' || error.category === 'network' || error.category === 'timeout');
  const isAuthError = error instanceof ApiError && error.category === 'auth';
  const isStaleData = !!data && isFetching; // Showing data while refreshing

  // If we have cached/stale data and the error is just a refetch failure,
  // don't show the error state — keep showing the data
  const showBackendDownError = isError && isBackendDown && listings.length === 0;

  return (
    <section className="py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center shadow-sm`}
            >
              <IconProp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {sectionTitle}
              </h2>
              {!isLoading && (
                <p className="text-xs text-gray-400">
                  {language === 'ar'
                    ? `${totalElements} إعلان`
                    : `${totalElements} listings`}
                </p>
              )}
            </div>
          </div>

          {totalElements > 12 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1"
              onClick={() => navigate('market', category ? { category } : {})}
            >
              {language === 'ar' ? 'عرض الكل' : 'View All'}
              <ArrowIcon className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && <LoadingSkeleton />}

        {/* Error State - Backend Down (subtle banner, not full replacement) */}
        {isError && showBackendDownError && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col items-center text-center gap-3">
              <WifiOff className="w-8 h-8 text-amber-500" />
              <div>
                <p className="text-gray-700 font-medium text-sm">
                  {language === 'ar'
                    ? 'لا يمكن الاتصال بالخادم حالياً'
                    : 'Cannot connect to the server right now'}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {language === 'ar'
                    ? 'يتم عرض البيانات المحفوظة، حاول مرة أخرى'
                    : 'Showing cached data, please try again'}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs">
                <RefreshCw className="w-3.5 h-3.5" />
                {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
              </Button>
            </div>
          </div>
        )}

        {/* Error State - Auth Required (subtle banner) */}
        {isError && isAuthError && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col items-center text-center gap-3">
              <AlertCircle className="w-8 h-8 text-blue-500" />
              <p className="text-gray-600 text-sm">
                {language === 'ar'
                  ? 'يجب تسجيل الدخول لعرض هذا المحتوى'
                  : 'Sign in to view this content'}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
                {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
              </Button>
            </div>
          </div>
        )}

        {/* Error State - Generic (subtle banner) */}
        {isError && !showBackendDownError && !isAuthError && listings.length === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col items-center text-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-gray-600 text-sm">
                {language === 'ar'
                  ? 'حدث خطأ أثناء تحميل البيانات'
                  : 'An error occurred while loading data'}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
                {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
              </Button>
            </div>
          </div>
        )}

        {/* Listings Grid — show if we have data, even if a background refetch failed */}
        {!isLoading && listings.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing, idx) => (
              <ListingCard key={listing.id} listing={listing} index={idx} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && listings.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {language === 'ar'
                ? 'لا توجد إعلانات في هذه الفئة حالياً'
                : 'No listings in this category yet'}
            </p>
          </div>
        )}

        {/* View All button if more than 12 */}
        {!isLoading && !isError && totalElements > 12 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={() => navigate('market', category ? { category } : {})}
            >
              {language === 'ar' ? 'عرض الكل' : 'View All'} ({totalElements})
              <ArrowIcon className="w-4 h-4 ms-1" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
