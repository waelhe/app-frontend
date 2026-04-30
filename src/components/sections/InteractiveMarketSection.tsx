'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Store, AlertCircle, ArrowLeft, ArrowRight, WifiOff, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigationStore } from '@/stores/navigationStore';
import { catalogService, ApiError } from '@/lib/api';
import type { ListingSummary } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface InteractiveMarketSectionProps {
  category?: string;
  titleAr?: string;
  titleEn?: string;
  icon?: React.ElementType;
  gradientFrom?: string;
  gradientTo?: string;
}

const placeholderGradients = [
  'from-rose-400 to-orange-300',
  'from-violet-400 to-purple-300',
  'from-emerald-400 to-teal-300',
  'from-amber-400 to-yellow-300',
  'from-sky-400 to-blue-300',
  'from-pink-400 to-fuchsia-300',
  'from-lime-400 to-green-300',
  'from-indigo-400 to-blue-300',
];

const categoryNames: Record<string, { ar: string; en: string }> = {
  tourism: { ar: 'سياحة', en: 'Tourism' },
  medical: { ar: 'طبية', en: 'Medical' },
  'real-estate': { ar: 'عقارات', en: 'Real Estate' },
  education: { ar: 'تعليم', en: 'Education' },
  business: { ar: 'أعمال', en: 'Business' },
  experiences: { ar: 'تجارب', en: 'Experiences' },
  dining: { ar: 'مطاعم', en: 'Dining' },
  arts: { ar: 'فنون', en: 'Arts' },
  shopping: { ar: 'تسوق', en: 'Shopping' },
  food: { ar: 'طعام', en: 'Food' },
  health: { ar: 'صحة', en: 'Health' },
  services: { ar: 'خدمات', en: 'Services' },
};

function ListingCard({ listing, index }: { listing: ListingSummary; index: number }) {
  const { language } = useLanguage();
  const navigate = useNavigationStore((s) => s.navigate);
  const gradientIndex = index % placeholderGradients.length;

  const catInfo = categoryNames[listing.category];
  const categoryLabel =
    language === 'ar'
      ? catInfo?.ar ?? listing.category
      : catInfo?.en ?? listing.category;

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ar-SA')} ل.س`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      onClick={() => navigate('listing-detail', { id: listing.id })}
    >
      {/* Gradient Placeholder Image */}
      <div
        className={`aspect-[4/3] bg-gradient-to-br ${placeholderGradients[gradientIndex]} flex items-center justify-center relative`}
      >
        <span className="text-white/60 text-5xl font-bold">
          {listing.title.charAt(0)}
        </span>
        {/* Category Badge */}
        <div className="absolute top-2.5 start-2.5">
          <Badge className="bg-white/90 text-gray-700 border-0 text-xs shadow-sm backdrop-blur-sm">
            {categoryLabel}
          </Badge>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-1.5">
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-red-500 transition-colors">
          {listing.title}
        </h3>
        <p className="text-xs text-gray-500">{listing.providerName}</p>
        <div className="flex items-center justify-between pt-1">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200 text-gray-400">
            {categoryLabel}
          </Badge>
          <span className="font-bold text-sm text-gray-900">
            {formatPrice(listing.price)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden">
          <Skeleton className="aspect-[4/3] w-full" />
          <div className="p-4 space-y-2">
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

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['listings', category ?? 'all', 0, 12],
    queryFn: () =>
      category
        ? catalogService.byCategory(category, 0, 12)
        : catalogService.list(0, 12),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, err) => {
      // Don't retry on 401 (auth required) — these endpoints should be public
      // but if they require auth, retrying won't help
      if (err instanceof ApiError && err.status === 401) return false;
      // Retry up to 2 times for other errors (backend might be starting up)
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const listings = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const sectionTitle =
    language === 'ar'
      ? (titleAr ?? (category ? categoryNames[category]?.ar ?? category : 'السوق'))
      : (titleEn ?? (category ? categoryNames[category]?.en ?? category : 'Market'));

  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  // Determine error type for better messaging
  const isBackendDown = error instanceof ApiError && (error.status === 502 || error.status === 0);
  const isAuthError = error instanceof ApiError && error.status === 401;

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

        {/* Error State - Backend Down */}
        {isError && isBackendDown && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <WifiOff className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-1 font-medium">
              {language === 'ar'
                ? 'الخادم غير متاح حالياً'
                : 'Server is temporarily unavailable'}
            </p>
            <p className="text-gray-400 text-sm mb-3">
              {language === 'ar'
                ? 'يتم إعادة تشغيل الخادم، يرجى المحاولة مرة أخرى'
                : 'The server is restarting, please try again'}
            </p>
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </Button>
          </div>
        )}

        {/* Error State - Auth Required */}
        {isError && isAuthError && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <AlertCircle className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-3">
              {language === 'ar'
                ? 'يجب تسجيل الدخول لعرض هذا المحتوى'
                : 'Sign in to view this content'}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </Button>
          </div>
        )}

        {/* Error State - Generic */}
        {isError && !isBackendDown && !isAuthError && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-3">
              {language === 'ar'
                ? 'حدث خطأ أثناء تحميل البيانات'
                : 'An error occurred while loading data'}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </Button>
          </div>
        )}

        {/* Listings Grid */}
        {!isLoading && !isError && listings.length > 0 && (
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
