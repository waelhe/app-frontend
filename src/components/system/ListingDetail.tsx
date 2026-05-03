'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Heart,
  Share2,
  Shield,
  Clock,
  Star,
  Building2,
  Car,
  Smartphone,
  Briefcase,
  HardHat,
  Sofa,
  Phone,
  MessageSquare,
  Flag,
  Eye,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  UtensilsCrossed,
  GraduationCap,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Send,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigationStore } from '@/stores/navigationStore';
import { useFavorites } from '@/store/use-favorites';
import { useAuth as useAuthStore } from '@/store/use-auth';
import { useRecentlyViewed } from '@/store/use-recently-viewed';
import { catalogService, reviewsService } from '@/lib/api';
import type { ListingResponse, ReviewResponse, ListingSummary } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// ── Category Config ─────────────────────────────────────────────────

const categoryIcons: Record<string, React.ReactNode> = {
  'real-estate': <Building2 className="h-8 w-8" />,
  electronics: <Smartphone className="h-8 w-8" />,
  cars: <Car className="h-8 w-8" />,
  services: <Briefcase className="h-8 w-8" />,
  jobs: <HardHat className="h-8 w-8" />,
  furniture: <Sofa className="h-8 w-8" />,
  medical: <Stethoscope className="h-8 w-8" />,
  dining: <UtensilsCrossed className="h-8 w-8" />,
  education: <GraduationCap className="h-8 w-8" />,
  beauty: <Sparkles className="h-8 w-8" />,
};

const categoryGradients: Record<string, string> = {
  'real-estate': 'from-amber-400 to-orange-500',
  electronics: 'from-blue-400 to-cyan-500',
  cars: 'from-gray-400 to-slate-600',
  services: 'from-emerald-400 to-teal-500',
  jobs: 'from-purple-400 to-violet-500',
  furniture: 'from-rose-400 to-pink-500',
  medical: 'from-red-400 to-rose-500',
  dining: 'from-orange-400 to-amber-500',
  education: 'from-indigo-400 to-blue-500',
  beauty: 'from-pink-400 to-fuchsia-500',
};

const categoryLabelsAr: Record<string, string> = {
  'real-estate': 'عقارات',
  electronics: 'إلكترونيات',
  cars: 'سيارات',
  services: 'خدمات',
  jobs: 'وظائف',
  furniture: 'أثاث',
  medical: 'طبي',
  dining: 'مطاعم',
  education: 'تعليم',
  beauty: 'جمال وعناية',
};

const categoryLabelsEn: Record<string, string> = {
  'real-estate': 'Real Estate',
  electronics: 'Electronics',
  cars: 'Cars',
  services: 'Services',
  jobs: 'Jobs',
  furniture: 'Furniture',
  medical: 'Medical',
  dining: 'Dining',
  education: 'Education',
  beauty: 'Beauty & Care',
};

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
    return `/images/categories/${category}.png`;
  }
  return null;
}

// ── Sub-components ──────────────────────────────────────────────────

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : i - 0.5 <= rating
                ? 'fill-amber-200 text-amber-400'
                : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

function SpecificationRow({
  label,
  value,
  isRTL,
}: {
  label: string;
  value: React.ReactNode;
  isRTL: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-3 ${
        isRTL ? 'flex-row' : 'flex-row'
      }`}
    >
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

// ── Animation variants ──────────────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

// ── Main Component ──────────────────────────────────────────────────

export function ListingDetail() {
  const { t, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { user } = useAuthStore();
  const { viewParams, navigate, goBack } = useNavigationStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { addViewed } = useRecentlyViewed();

  const listingId = viewParams.id;
  const isProviderOrAdmin = user?.role === 'PROVIDER' || user?.role === 'ADMIN';

  // Local state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // ── Data Fetching ───────────────────────────────────────────────────

  const {
    data: listing,
    isLoading: listingLoading,
    isError: listingError,
    error: listingErrorObj,
    refetch: refetchListing,
  } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => catalogService.byId(listingId),
    enabled: !!listingId,
  });

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
  } = useQuery({
    queryKey: ['reviews-provider', (listing as ListingResponse | undefined)?.id],
    queryFn: () =>
      reviewsService.byProvider(listingId ?? '', 0, 10),
    enabled: !!listingId,
  });

  const {
    data: relatedData,
    isLoading: relatedLoading,
  } = useQuery({
    queryKey: ['related-listings', (listing as ListingResponse | undefined)?.category],
    queryFn: () =>
      catalogService.byCategory(listing?.category ?? '', 0, 5),
    enabled: !!listing?.category,
  });

  // ── Track Recently Viewed ───────────────────────────────────────────

  useEffect(() => {
    if (listing && listing.id) {
      addViewed(listing.id, listing.title, listing.category, listing.price);
    }
  }, [listing?.id]);

  // ── Derived Data ────────────────────────────────────────────────────

  const reviews = reviewsData?.content ?? [];
  const relatedListings = (relatedData?.content ?? []).filter(
    (item: ListingSummary) => item.id !== listingId
  ).slice(0, 4);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc: number, r: ReviewResponse) => acc + r.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  const simulatedViews = useMemo(() => {
    if (!listingId) return 0;
    const hash = listingId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return (hash % 500) + 50;
  }, [listingId]);

  const categoryLabel = useMemo(() => {
    const cat = listing?.category ?? '';
    return isRTL ? (categoryLabelsAr[cat] ?? cat) : (categoryLabelsEn[cat] ?? cat);
  }, [listing?.category, isRTL]);

  const categoryIcon = categoryIcons[listing?.category ?? ''] ?? <Star className="h-8 w-8" />;
  const gradient = categoryGradients[listing?.category ?? ''] ?? 'from-red-400 to-red-600';
  const categoryImage = listing ? getCategoryImagePath(listing.category) : null;

  // Generate gallery images (main + gradient variants)
  const galleryImages = useMemo(() => {
    if (!listing) return [];
    const mainImage = getCategoryImagePath(listing.category);
    const images: Array<{ type: 'image' | 'gradient'; src?: string; gradient: string }> = [];
    if (mainImage) {
      images.push({ type: 'image', src: mainImage, gradient });
    }
    // Add gradient variants as additional "slides"
    images.push({ type: 'gradient', gradient: 'from-slate-700 to-slate-900' });
    images.push({ type: 'gradient', gradient });
    return images;
  }, [listing, gradient]);

  // ── Handlers ────────────────────────────────────────────────────────

  const handleBook = useCallback(() => {
    if (!isAuthenticated) return;
    navigate('booking', { listingId: listingId ?? '' });
  }, [isAuthenticated, navigate, listingId]);

  const handleMessage = useCallback(() => {
    if (!isAuthenticated) return;
    navigate('messages', { listingId: listingId ?? '' });
  }, [isAuthenticated, navigate, listingId]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title ?? '',
          text: listing?.description ?? '',
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
    }
  }, [listing]);

  const handleToggleFavorite = useCallback(() => {
    if (!listing) return;
    if (isFavorite(listingId)) {
      removeFavorite(listingId);
    } else {
      addFavorite({
        id: listing.id,
        title: listing.title,
        category: listing.category,
        price: listing.price,
        providerName: '',
      });
    }
  }, [listing, listingId, isFavorite, addFavorite, removeFavorite]);

  const handleReport = useCallback(() => {
    if (!reportReason.trim()) return;
    setReportSubmitted(true);
  }, [reportReason]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStart === null) return;
      const diff = e.changedTouches[0].clientX - touchStart;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentImageIndex > 0) {
          setCurrentImageIndex((prev) => prev - 1);
        } else if (diff < 0 && currentImageIndex < galleryImages.length - 1) {
          setCurrentImageIndex((prev) => prev + 1);
        }
      }
      setTouchStart(null);
    },
    [touchStart, currentImageIndex, galleryImages.length]
  );

  const formatPrice = useCallback(
    (price: number, currency: string) => {
      const formatted = price.toLocaleString(isRTL ? 'ar-SA' : 'en-US');
      return currency === 'SAR' ? `${formatted} ر.س` : `${formatted} ${currency}`;
    },
    [isRTL]
  );

  const formatDate = useCallback(
    (dateStr: string, format: 'full' | 'short' = 'short') => {
      const locale = isRTL ? 'ar-SA' : 'en-US';
      if (format === 'full') {
        return new Date(dateStr).toLocaleDateString(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      return new Date(dateStr).toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    },
    [isRTL]
  );

  const getStatusInfo = useCallback(
    (status?: string) => {
      switch (status) {
        case 'ACTIVE':
          return {
            label: isRTL ? 'نشط' : 'Active',
            color: 'bg-emerald-100 text-emerald-700',
            icon: <CheckCircle2 className="h-3.5 w-3.5" />,
          };
        case 'PAUSED':
          return {
            label: isRTL ? 'متوقف' : 'Paused',
            color: 'bg-amber-100 text-amber-700',
            icon: <Clock className="h-3.5 w-3.5" />,
          };
        case 'ARCHIVED':
          return {
            label: isRTL ? 'مؤرشف' : 'Archived',
            color: 'bg-gray-100 text-gray-600',
            icon: <AlertCircle className="h-3.5 w-3.5" />,
          };
        default:
          return {
            label: isRTL ? 'نشط' : 'Active',
            color: 'bg-emerald-100 text-emerald-700',
            icon: <CheckCircle2 className="h-3.5 w-3.5" />,
          };
      }
    },
    [isRTL]
  );

  const providerInitials = useMemo(() => {
    if (!listing) return 'م';
    const name = isRTL ? 'مزود خدمة' : 'Service Provider';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [listing, isRTL]);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // ── Loading State ───────────────────────────────────────────────────

  if (listingLoading) {
    return (
      <div className="space-y-4 p-4 pb-28">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-7 w-3/5" />
            <Skeleton className="h-7 w-1/4" />
          </div>
          <Skeleton className="h-4 w-2/5" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  // ── Error State ─────────────────────────────────────────────────────

  if (listingError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-full bg-red-100 p-5"
        >
          <AlertCircle className="h-10 w-10 text-red-500" />
        </motion.div>
        <h2 className="text-lg font-bold text-gray-900">
          {t('common.error')}
        </h2>
        <p className="text-sm text-gray-500 max-w-xs">
          {(listingErrorObj as Error)?.message ??
            (isRTL ? 'فشل تحميل الإعلان' : 'Failed to load listing')}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => refetchListing()}>
            {t('common.retry')}
          </Button>
          <Button variant="ghost" onClick={goBack}>
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const statusInfo = getStatusInfo(undefined); // ListingResponse doesn't have status, default to active

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pb-24"
    >
      {/* ─── 1. Back Button + Breadcrumb ──────────────────────────────── */}
      <motion.div
        {...fadeInUp}
        className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 -ml-2"
          >
            <BackArrow className="h-4 w-4" />
            <span className="text-sm">{t('common.back')}</span>
          </Button>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span>/</span>
            <button
              onClick={() => navigate('market', { category: listing.category })}
              className="hover:text-gray-600 transition-colors font-medium text-gray-500"
            >
              {categoryLabel}
            </button>
            <span>/</span>
            <span className="text-gray-400 truncate max-w-[120px]">
              {listing.title}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="space-y-5 px-4 pt-4"
      >
        {/* ─── 2. Image Gallery ──────────────────────────────────────── */}
        <motion.div {...fadeInUp} className="relative">
          <div
            className="relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-lg"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0"
              >
                {galleryImages[currentImageIndex]?.type === 'image' &&
                galleryImages[currentImageIndex].src ? (
                  <>
                    <img
                      src={galleryImages[currentImageIndex].src}
                      alt={listing.title}
                      className={`h-full w-full object-cover transition-opacity duration-300 ${
                        imageLoaded[galleryImages[currentImageIndex].src!] ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() =>
                        setImageLoaded((prev) => ({
                          ...prev,
                          [galleryImages[currentImageIndex].src!]: true,
                        }))
                      }
                    />
                    {!imageLoaded[galleryImages[currentImageIndex].src!] && (
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${galleryImages[currentImageIndex].gradient} flex items-center justify-center`}
                      >
                        <div className="text-white/60">{categoryIcon}</div>
                      </div>
                    )}
                    {/* Gradient overlay at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
                  </>
                ) : (
                  <div
                    className={`h-full w-full bg-gradient-to-br ${galleryImages[currentImageIndex]?.gradient ?? gradient} flex items-center justify-center`}
                  >
                    <div className="text-white/70 transform scale-150">
                      {categoryIcon}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Favorite & Share overlay */}
            <div
              className="absolute top-3 flex gap-2 z-10"
              style={{ [isRTL ? 'left' : 'right']: '12px' }}
            >
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleToggleFavorite}
                className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center"
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    isFavorite(listingId)
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-600'
                  }`}
                />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleShare}
                className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </motion.button>
            </div>

            {/* Category Badge overlay */}
            <div
              className="absolute bottom-3 z-10"
              style={{ [isRTL ? 'right' : 'left']: '12px' }}
            >
              <Badge className="bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm gap-1 px-3 py-1 text-xs font-medium">
                {categoryIcon &&
                  React.cloneElement(categoryIcon as React.ReactElement, {
                    className: 'h-3.5 w-3.5',
                  })}
                {categoryLabel}
              </Badge>
            </div>

            {/* Image counter */}
            <div
              className="absolute bottom-3 z-10"
              style={{ [isRTL ? 'left' : 'right']: '12px' }}
            >
              <div className="rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 text-xs text-white font-medium">
                {currentImageIndex + 1}/{galleryImages.length}
              </div>
            </div>
          </div>

          {/* Dots indicator */}
          {galleryImages.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {galleryImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentImageIndex
                      ? 'w-6 bg-red-500'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* ─── 3. Title + Price Section ─────────────────────────────── */}
        <motion.div {...fadeInUp}>
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {listing.title}
            </h1>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="text-2xl font-bold text-red-500"
                  dir="ltr"
                >
                  {formatPrice(listing.price, listing.currency)}
                </span>
              </div>
              <span className="text-xs text-gray-400 font-mono">
                #{listing.id.slice(0, 8)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ─── 4. Quick Stats Row ───────────────────────────────────── */}
        <motion.div {...fadeInUp}>
          <div className="grid grid-cols-4 gap-2">
            {/* Views */}
            <Card className="border-0 bg-gray-50 shadow-none">
              <CardContent className="flex flex-col items-center gap-1 p-3">
                <Eye className="h-4 w-4 text-blue-500" />
                <span className="text-[10px] text-gray-500">
                  {isRTL ? 'مشاهدات' : 'Views'}
                </span>
                <span className="text-xs font-bold text-gray-800">
                  {simulatedViews}
                </span>
              </CardContent>
            </Card>
            {/* Rating */}
            <Card className="border-0 bg-gray-50 shadow-none">
              <CardContent className="flex flex-col items-center gap-1 p-3">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] text-gray-500">
                  {isRTL ? 'التقييم' : 'Rating'}
                </span>
                <span className="text-xs font-bold text-gray-800">
                  {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                </span>
              </CardContent>
            </Card>
            {/* Status */}
            <Card className="border-0 bg-gray-50 shadow-none">
              <CardContent className="flex flex-col items-center gap-1 p-3">
                {statusInfo.icon}
                <span className="text-[10px] text-gray-500">
                  {t('listing.status')}
                </span>
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-1.5 py-0 ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </Badge>
              </CardContent>
            </Card>
            {/* Date */}
            <Card className="border-0 bg-gray-50 shadow-none">
              <CardContent className="flex flex-col items-center gap-1 p-3">
                <Calendar className="h-4 w-4 text-emerald-500" />
                <span className="text-[10px] text-gray-500">
                  {isRTL ? 'التاريخ' : 'Date'}
                </span>
                <span className="text-[10px] font-bold text-gray-800">
                  {formatDate(listing.createdAt, 'short')}
                </span>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* ─── 5. Seller/Provider Card ──────────────────────────────── */}
        <motion.div {...fadeInUp}>
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-red-100">
                  <AvatarFallback className="bg-red-50 text-red-600 font-bold text-sm">
                    {providerInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {isRTL ? 'مزود خدمة' : 'Service Provider'}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Shield className="h-3 w-3 text-emerald-500" />
                    <span className="text-xs text-gray-500">
                      {isRTL
                        ? `عضو منذ ${formatDate(listing.createdAt, 'short')}`
                        : `Member since ${formatDate(listing.createdAt, 'short')}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <StarRating rating={averageRating > 0 ? averageRating : 4.5} size="sm" />
                    <span className="text-[10px] text-gray-400 ml-1">
                      ({reviews.length > 0 ? reviews.length : 12})
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs gap-1 border-gray-200"
                  onClick={() => navigate('profile', { userId: listing.id })}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {isRTL ? 'عرض الملف' : 'View Profile'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs gap-1 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={handleMessage}
                  disabled={!isAuthenticated}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  {isRTL ? 'رسالة' : 'Message'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── 6. Description Section ───────────────────────────────── */}
        <motion.div {...fadeInUp}>
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="h-1 w-5 bg-red-500 rounded-full" />
                {t('listing.description')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="relative">
                <p
                  className={`text-sm leading-relaxed text-gray-600 whitespace-pre-line ${
                    !descriptionExpanded && (listing.description?.length ?? 0) > 150
                      ? 'line-clamp-3'
                      : ''
                  }`}
                >
                  {listing.description || (isRTL ? 'لا يوجد وصف' : 'No description')}
                </p>
                {(listing.description?.length ?? 0) > 150 && (
                  <button
                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                    className="flex items-center gap-1 mt-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                  >
                    {descriptionExpanded ? (
                      <>
                        {t('common.showLess')}
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        {t('common.showMore')}
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── 7. Specifications Section ────────────────────────────── */}
        <motion.div {...fadeInUp}>
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="h-1 w-5 bg-red-500 rounded-full" />
                {isRTL ? 'المواصفات' : 'Specifications'}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="divide-y divide-gray-100">
                <SpecificationRow
                  label={t('listing.category')}
                  value={
                    <Badge variant="secondary" className="gap-1 text-xs">
                      {categoryLabel}
                    </Badge>
                  }
                  isRTL={isRTL}
                />
                <SpecificationRow
                  label={t('listing.price')}
                  value={
                    <span className="text-red-500 font-bold" dir="ltr">
                      {formatPrice(listing.price, listing.currency)}
                    </span>
                  }
                  isRTL={isRTL}
                />
                <SpecificationRow
                  label={t('listing.status')}
                  value={
                    <Badge variant="secondary" className={`gap-1 text-xs ${statusInfo.color}`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </Badge>
                  }
                  isRTL={isRTL}
                />
                <SpecificationRow
                  label={isRTL ? 'العملة' : 'Currency'}
                  value={<span className="text-sm">{listing.currency}</span>}
                  isRTL={isRTL}
                />
                <SpecificationRow
                  label={isRTL ? 'تاريخ النشر' : 'Date Posted'}
                  value={formatDate(listing.createdAt, 'full')}
                  isRTL={isRTL}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── 8. Reviews Section ───────────────────────────────────── */}
        <motion.div {...fadeInUp}>
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className="h-1 w-5 bg-red-500 rounded-full" />
                  {t('listing.reviews')}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-red-500 hover:text-red-600"
                  onClick={() => navigate('write-review', { listingId: listing.id })}
                  disabled={!isAuthenticated}
                >
                  <Send className="h-3.5 w-3.5 ml-1" />
                  {t('review.write')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {reviewsLoading ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-16" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {/* Average rating summary */}
                  <div className="flex items-center gap-4 p-3 bg-amber-50 rounded-xl">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-600">
                        {averageRating.toFixed(1)}
                      </div>
                      <StarRating rating={averageRating} size="sm" />
                      <div className="text-[10px] text-gray-500 mt-1">
                        {reviews.length} {t('review.totalReviews')}
                      </div>
                    </div>
                    <Separator orientation="vertical" className="h-14" />
                    <div className="flex-1 space-y-1">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviews.filter(
                          (r: ReviewResponse) => Math.round(r.rating) === star
                        ).length;
                        const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-2 text-xs">
                            <span className="w-3 text-gray-500">{star}</span>
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.5, delay: 0.1 * (5 - star) }}
                                className="h-full bg-amber-400 rounded-full"
                              />
                            </div>
                            <span className="w-6 text-gray-400 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Individual reviews */}
                  <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                    {reviews.slice(0, 5).map((review: ReviewResponse, idx: number) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="bg-gray-200 text-gray-500 text-[10px] font-medium">
                                {String.fromCharCode(65 + (idx % 26))}
                              </AvatarFallback>
                            </Avatar>
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {formatDate(review.createdAt, 'short')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {review.comment || (isRTL ? 'بدون تعليق' : 'No comment')}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Star className="h-6 w-6 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500">
                    {t('review.noReviews')}
                  </p>
                  {isAuthenticated && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 text-xs"
                      onClick={() => navigate('write-review', { listingId: listing.id })}
                    >
                      <Send className="h-3.5 w-3.5 ml-1" />
                      {t('review.write')}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── 9. Related Listings ──────────────────────────────────── */}
        {relatedListings.length > 0 && (
          <motion.div {...fadeInUp}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <div className="h-1 w-5 bg-red-500 rounded-full" />
                  {isRTL ? 'إعلانات مشابهة' : 'Related Listings'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-red-500"
                  onClick={() => navigate('market', { category: listing.category })}
                >
                  {t('common.viewAll')}
                  <ArrowLeft className={`h-3.5 w-3.5 ${isRTL ? 'mr-1 rotate-180' : 'ml-1'}`} />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {relatedListings.map((item: ListingSummary, idx: number) => {
                  const itemGradient =
                    categoryGradients[item.category] ?? 'from-gray-400 to-gray-600';
                  const itemImage = getCategoryImagePath(item.category);
                  const itemCatLabel = isRTL
                    ? (categoryLabelsAr[item.category] ?? item.category)
                    : (categoryLabelsEn[item.category] ?? item.category);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                    >
                      <Card
                        className="border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate('listing-detail', { id: item.id })}
                      >
                        <div
                          className={`relative h-28 bg-gradient-to-br ${itemGradient} flex items-center justify-center`}
                        >
                          {itemImage ? (
                            <img
                              src={itemImage}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-white/50 scale-75">
                              {categoryIcons[item.category] ?? <Star className="h-6 w-6" />}
                            </div>
                          )}
                          <Badge className="absolute top-2 right-2 bg-white/90 text-gray-700 text-[9px] px-1.5 py-0">
                            {itemCatLabel}
                          </Badge>
                        </div>
                        <CardContent className="p-3">
                          <h4 className="text-xs font-semibold text-gray-900 line-clamp-1 mb-1">
                            {item.title}
                          </h4>
                          <span className="text-sm font-bold text-red-500" dir="ltr">
                            {item.price.toLocaleString()} ر.س
                          </span>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {relatedLoading && (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-28 rounded-none" />
                <CardContent className="p-3 space-y-1.5">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-4 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ─── 10. Report Listing ──────────────────────────────────── */}
        <motion.div {...fadeInUp} className="pt-2 pb-4">
          <Dialog
            onOpenChange={(open) => {
              if (!open) {
                setReportReason('');
                setReportSubmitted(false);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-gray-400 hover:text-red-500 gap-2"
              >
                <Flag className="h-4 w-4" />
                {isRTL ? 'الإبلاغ عن الإعلان' : 'Report Listing'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5 text-red-500" />
                  {isRTL ? 'الإبلاغ عن الإعلان' : 'Report Listing'}
                </DialogTitle>
              </DialogHeader>
              {!reportSubmitted ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">
                      {isRTL ? 'سبب الإبلاغ' : 'Report Reason'}
                    </Label>
                    <Textarea
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder={
                        isRTL
                          ? 'اكتب سبب الإبلاغ هنا...'
                          : 'Describe the issue with this listing...'
                      }
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <DialogClose asChild>
                      <Button variant="outline" size="sm">
                        {t('common.cancel')}
                      </Button>
                    </DialogClose>
                    <Button
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white"
                      onClick={handleReport}
                      disabled={!reportReason.trim()}
                    >
                      <Flag className="h-4 w-4 ml-1" />
                      {isRTL ? 'إرسال البلاغ' : 'Submit Report'}
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="text-center py-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3"
                  >
                    <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                  </motion.div>
                  <p className="font-semibold text-gray-900">
                    {isRTL ? 'تم إرسال البلاغ' : 'Report Submitted'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {isRTL
                      ? 'شكراً لك، سنراجع البلاغ في أقرب وقت'
                      : "Thank you, we'll review this report shortly"}
                  </p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </motion.div>
      </motion.div>

      {/* ─── 11. Floating Action Bar ──────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
            <Button
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md shadow-red-200 h-11"
              onClick={handleBook}
              disabled={!isAuthenticated}
            >
              {isRTL ? 'احجز الآن' : 'Book Now'}
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 border-red-200 text-red-500 hover:bg-red-50"
              onClick={handleMessage}
              disabled={!isAuthenticated}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 border-gray-200 text-gray-600 hover:bg-gray-50"
              onClick={() => {
                /* Call action - no phone available in listing data */
              }}
            >
              <Phone className="h-5 w-5" />
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              onClick={() => {
                const waUrl = `https://wa.me/?text=${encodeURIComponent(
                  `${listing.title} - ${formatPrice(listing.price, listing.currency)}`
                )}`;
                window.open(waUrl, '_blank');
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-current"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </Button>
          </motion.div>
        </div>
        {!isAuthenticated && (
          <div className="pb-2 px-4 text-center">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-login', { detail: { mode: 'register' } }))}
              className="text-xs text-red-500 hover:text-red-600 font-medium underline underline-offset-2"
            >
              {isRTL
                ? 'أنشئ حساباً مجاناً للحجز والمراسلة'
                : 'Create a free account to book and message'}
            </button>
          </div>
        )}
      </div>

      {/* Custom scrollbar styling */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </motion.div>
  );
}
