'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Store, AlertCircle, ArrowLeft, ArrowRight, PackageOpen } from 'lucide-react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { useListingsByCategory } from '@/hooks/useApi';
import type { ListingSummary } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

// ── Animation Variants ─────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// ── Gradient Palette for Placeholder Images ────────────────────────

const placeholderGradients = [
  'from-rose-400 to-orange-300',
  'from-violet-400 to-purple-300',
  'from-emerald-400 to-teal-300',
  'from-amber-400 to-yellow-300',
  'from-sky-400 to-cyan-300',
  'from-pink-400 to-fuchsia-300',
  'from-lime-400 to-green-300',
  'from-teal-400 to-emerald-300',
];

// ── Helper: Category display names ─────────────────────────────────

const categoryLabels: Record<string, { ar: string; en: string }> = {
  'real-estate': { ar: 'عقارات', en: 'Real Estate' },
  medical: { ar: 'طبية', en: 'Medical' },
  pharmacies: { ar: 'صيدليات', en: 'Pharmacies' },
  restaurants: { ar: 'مطاعم', en: 'Restaurants' },
  'car-services': { ar: 'خدمات سيارات', en: 'Car Services' },
  tourism: { ar: 'سياحة', en: 'Tourism' },
  education: { ar: 'تعليم', en: 'Education' },
  business: { ar: 'أعمال', en: 'Business' },
  experiences: { ar: 'تجارب', en: 'Experiences' },
  dining: { ar: 'مطاعم', en: 'Dining' },
  arts: { ar: 'فنون', en: 'Arts' },
  shopping: { ar: 'تسوق', en: 'Shopping' },
  food: { ar: 'طعام', en: 'Food' },
  health: { ar: 'صحة', en: 'Health' },
  services: { ar: 'خدمات', en: 'Services' },
  beauty: { ar: 'جمال', en: 'Beauty' },
  hotels: { ar: 'فنادق', en: 'Hotels' },
  transport: { ar: 'نقل', en: 'Transport' },
  sports: { ar: 'رياضة', en: 'Sports' },
};

function getCategoryLabel(category: string, language: 'ar' | 'en'): string {
  const info = categoryLabels[category];
  return info ? (language === 'ar' ? info.ar : info.en) : category;
}

// ── Helper: Format price ───────────────────────────────────────────

function formatPrice(price: number, language: 'ar' | 'en'): string {
  const formatted = price.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US');
  return language === 'ar' ? `${formatted} ل.س` : `${formatted} SYP`;
}

// ── Sub-Components ─────────────────────────────────────────────────

function ListingCard({
  listing,
  index,
}: {
  listing: ListingSummary;
  index: number;
}) {
  const { language } = useLanguage();
  const navigate = useNavigationStore((s) => s.navigate);
  const gradientIndex = index % placeholderGradients.length;
  const categoryLabel = getCategoryLabel(listing.category, language);

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group cursor-pointer"
      onClick={() => navigate('listing-detail', { id: listing.id })}
    >
      <Card className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-shadow py-0 gap-0">
        {/* Gradient Placeholder Image */}
        <div
          className={`aspect-[4/3] bg-gradient-to-br ${placeholderGradients[gradientIndex]} flex items-center justify-center relative`}
        >
          <span className="text-white/50 text-4xl font-bold select-none">
            {listing.title.charAt(0)}
          </span>
          {/* Category Badge Overlay */}
          <div className="absolute top-2.5 start-2.5">
            <Badge className="bg-white/90 text-gray-700 border-0 text-[10px] shadow-sm backdrop-blur-sm px-1.5 py-0">
              {categoryLabel}
            </Badge>
          </div>
        </div>

        {/* Card Content */}
        <CardContent className="p-3.5 space-y-1">
          <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-red-500 transition-colors">
            {listing.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1">
            {listing.providerName}
          </p>
          <div className="flex items-center justify-between pt-1">
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 border-gray-200 text-gray-400"
            >
              {categoryLabel}
            </Badge>
            <span className="font-bold text-sm text-gray-900">
              {formatPrice(listing.price, language)}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LoadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden border border-gray-100">
          <Skeleton className="aspect-[4/3] w-full" />
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
  messageAr,
  messageEn,
  onRetry,
  language,
}: {
  messageAr?: string;
  messageEn?: string;
  onRetry: () => void;
  language: 'ar' | 'en';
}) {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-2xl">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
      <p className="text-gray-600 mb-4">
        {language === 'ar'
          ? (messageAr ?? 'حدث خطأ أثناء تحميل البيانات')
          : (messageEn ?? 'An error occurred while loading data')}
      </p>
      <Button variant="outline" onClick={onRetry}>
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

  const { data, isLoading, isError, refetch } = useListingsByCategory(category, {
    page: 0,
    size: pageSize,
  });

  const listings = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const sectionTitle = isRTL ? titleAr : titleEn;
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="py-6 sm:py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
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
      {isLoading && <LoadingSkeleton count={4} />}

      {/* Error State */}
      {isError && (
        <ErrorState
          onRetry={() => refetch()}
          language={language}
        />
      )}

      {/* Listings Grid */}
      {!isLoading && !isError && listings.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {listings.map((listing, idx) => (
            <ListingCard key={listing.id} listing={listing} index={idx} />
          ))}
        </motion.div>
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

      {/* Bottom View All (when many items) */}
      {!isLoading && !isError && totalElements > pageSize && (
        <div className="mt-5 text-center">
          <Button
            variant="outline"
            className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => navigate('market', { category })}
          >
            {isRTL ? 'عرض الكل' : 'View All'} ({totalElements})
            <ArrowIcon className="w-4 h-4 ms-1" />
          </Button>
        </div>
      )}
    </section>
  );
}

export default CategoryListingSection;
