'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Store,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  PackageOpen,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { useListingsByCategory } from '@/hooks/useApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import {
  ListingCard,
  ViewAllCard,
  getListingImages,
} from '@/components/ui/ListingCard';

// ── Props ──────────────────────────────────────────────────────────

export interface CategoryListingSectionProps {
  /** Category slug passed to catalogService.byCategory */
  category: string;
  /** Arabic section title */
  titleAr: string;
  /** English section title */
  titleEn: string;
  /** Optional Lucide icon for the section header (defaults to Store) */
  icon?: LucideIcon;
  /** Gradient colours for the icon badge (default: red-500 → red-600) */
  gradientFrom?: string;
  gradientTo?: string;
  /** Number of items to fetch per page (default: 12) */
  pageSize?: number;
}

// ── Helper: Format price ───────────────────────────────────────────

function formatPriceLocal(price: number, language: 'ar' | 'en'): string {
  const formatted = price.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US');
  return language === 'ar' ? `${formatted} ل.س` : `${formatted} SYP`;
}

// ── Sub-Components ─────────────────────────────────────────────────

function LoadingSkeleton({ count = 4, isScrollMode = false }: { count?: number; isScrollMode?: boolean }) {
  if (isScrollMode) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[200px] sm:w-[220px] md:w-[240px]">
            <Skeleton className="aspect-square rounded-xl w-full" />
            <div className="mt-2 space-y-1.5">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden border border-gray-100">
          <Skeleton className="aspect-square w-full" />
          <div className="p-3.5 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex justify-between pt-1">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({
  onRetry,
  language,
}: {
  onRetry: () => void;
  language: 'ar' | 'en';
}) {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-2xl">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
      <p className="text-gray-600 mb-4">
        {language === 'ar'
          ? 'حدث خطأ أثناء تحميل البيانات'
          : 'An error occurred while loading data'}
      </p>
      <Button variant="outline" onClick={onRetry} className="gap-1.5">
        <RefreshCw className="w-3.5 h-3.5" />
        {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
      </Button>
    </div>
  );
}

function EmptyState({
  titleAr,
  titleEn,
  language,
  Icon,
}: {
  titleAr: string;
  titleEn: string;
  language: 'ar' | 'en';
  Icon: LucideIcon;
}) {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-2xl">
      <PackageOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 font-medium">
        {language === 'ar'
          ? `لا توجد إعلانات في ${titleAr} حالياً`
          : `No listings in ${titleEn} yet`}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        {language === 'ar'
          ? 'ترقبوا إعلانات جديدة قريباً'
          : 'Stay tuned for new listings coming soon'}
      </p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────

export function CategoryListingSection({
  category,
  titleAr,
  titleEn,
  icon: Icon = Store,
  gradientFrom = 'from-red-500',
  gradientTo = 'to-red-600',
  pageSize = 12,
}: CategoryListingSectionProps) {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigationStore((s) => s.navigate);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { data, isLoading, isError, refetch } = useListingsByCategory(category, {
    page: 0,
    size: pageSize,
  });

  const listings = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const sectionTitle = isRTL ? titleAr : titleEn;
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

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
  }, [checkScroll, listings]);

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
    <section className="py-4 sm:py-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Gradient Icon Badge */}
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center shadow-sm`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {sectionTitle}
            </h2>
            {!isLoading && (
              <p className="text-xs text-gray-400">
                {isRTL
                  ? `${totalElements} إعلان`
                  : `${totalElements} listings`}
              </p>
            )}
          </div>
        </div>

        {/* View All Button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1"
          onClick={() => navigate('market', { category })}
        >
          {isRTL ? 'عرض الكل' : 'View All'}
          <ArrowIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingSkeleton count={5} isScrollMode />}

      {/* Error State */}
      {isError && <ErrorState onRetry={() => refetch()} language={language} />}

      {/* Horizontal Scrolling Cards (Airbnb Style) */}
      {!isLoading && !isError && listings.length > 0 && (
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
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {listings.map((listing, idx) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                category={category}
                price={listing.price}
                providerName={listing.providerName}
                rating={4.0 + Math.random() * 1.0}
                reviewCount={Math.floor(Math.random() * 80) + 3}
                isFavorite={favorites.includes(listing.id)}
                onToggleFavorite={toggleFavorite}
                secondaryBadge={idx < 2 ? (isRTL ? '⭐ مميز' : '⭐ Featured') : undefined}
                imageIndex={idx}
                isScrollCard={true}
              />
            ))}

            {/* View All Card */}
            {listings.length > 4 && (
              <ViewAllCard
                count={totalElements}
                labelAr="عرض الكل"
                labelEn="Show all"
                images={getListingImages(category, 0).concat(
                  getListingImages(category, 1),
                  getListingImages(category, 2),
                  getListingImages(category, 3)
                )}
                onClick={() => setShowAll(true)}
              />
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && listings.length === 0 && (
        <EmptyState
          titleAr={titleAr}
          titleEn={titleEn}
          language={language}
          Icon={Icon}
        />
      )}

      {/* ── All Listings Drawer ── */}
      <Sheet open={showAll} onOpenChange={setShowAll}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl px-4 pt-4">
          {/* Handle */}
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />

          {/* Header */}
          <div className="pb-3 border-b border-gray-100 mb-4">
            <h2 className="text-lg font-bold">
              {sectionTitle}
            </h2>
            <p className="text-sm text-gray-500">
              {totalElements} {isRTL ? 'إعلان متاح' : 'listings available'}
            </p>
          </div>

          {/* Grid */}
          <div className="overflow-y-auto pb-8" style={{ maxHeight: 'calc(90vh - 100px)' }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {listings.map((listing, idx) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  category={category}
                  price={listing.price}
                  providerName={listing.providerName}
                  rating={4.0 + Math.random() * 1.0}
                  reviewCount={Math.floor(Math.random() * 80) + 3}
                  isFavorite={favorites.includes(listing.id)}
                  onToggleFavorite={toggleFavorite}
                  secondaryBadge={idx < 2 ? (isRTL ? '⭐ مميز' : '⭐ Featured') : undefined}
                  imageIndex={idx}
                  isScrollCard={false}
                  onClick={() => {
                    setShowAll(false);
                    navigate('listing-detail', { id: listing.id });
                  }}
                />
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}

export default CategoryListingSection;
