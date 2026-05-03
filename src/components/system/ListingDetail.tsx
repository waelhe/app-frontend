'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
  ThumbsUp,
  Zap,
  Maximize2,
  X,
  ShieldCheck,
  Navigation,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '@/stores/languageStore';
import { useAuth } from '@/stores/authStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { useFavorites } from '@/stores/favoritesStore';
import { useRecentlyViewed } from '@/stores/recentlyViewedStore';
import { useListing, useReviews, useListingsByCategory } from '@/hooks/useApi';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

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
  'cars', 'electronics', 'furniture', 'beauty', 'jobs',
  'services', 'real-estate', 'education', 'dining',
]);

function getCategoryImagePath(category: string): string | null {
  if (categoriesWithImages.has(category)) {
    return `/images/categories/${category}.png`;
  }
  return null;
}

// ── Report reasons ──────────────────────────────────────────────────

const reportReasons = [
  { value: 'inappropriate', labelAr: 'محتوى غير لائق', labelEn: 'Inappropriate Content' },
  { value: 'fraud', labelAr: 'احتيال', labelEn: 'Fraud / Scam' },
  { value: 'misleading', labelAr: 'مضلل', labelEn: 'Misleading' },
  { value: 'duplicate', labelAr: 'مكرر', labelEn: 'Duplicate' },
  { value: 'other', labelAr: 'أخرى', labelEn: 'Other' },
];

// ── Sample Q&A data ─────────────────────────────────────────────────

const sampleQA = [
  {
    id: 'q1',
    questionAr: 'هل يمكنني زيارة المكان قبل الحجز؟',
    questionEn: 'Can I visit the place before booking?',
    answerAr: 'نعم بالتأكيد! يمكنك التواصل معنا لترتيب زيارة في أي وقت مناسب.',
    answerEn: 'Absolutely! You can contact us to arrange a visit at any convenient time.',
    date: '2025-01-15',
    helpful: 12,
  },
  {
    id: 'q2',
    questionAr: 'ما هي طرق الدفع المتاحة؟',
    questionEn: 'What payment methods are available?',
    answerAr: 'نقبل الدفع نقداً وعبر التحويل البنكي وبطاقات الائتمان.',
    answerEn: 'We accept cash, bank transfers, and credit cards.',
    date: '2025-01-10',
    helpful: 8,
  },
  {
    id: 'q3',
    questionAr: 'هل يوجد ضمان على الخدمة؟',
    questionEn: 'Is there a warranty on the service?',
    answerAr: 'نعم، نقدم ضمان لمدة 30 يوماً على جميع خدماتنا.',
    answerEn: 'Yes, we offer a 30-day warranty on all our services.',
    date: '2025-01-05',
    helpful: 15,
  },
];

// ── Category-specific spec fields ───────────────────────────────────

function getCategorySpecs(category: string, listing: ListingResponse, isRTL: boolean) {
  const specs: Array<{ label: string; value: string }> = [];

  switch (category) {
    case 'real-estate':
      specs.push(
        { label: isRTL ? 'الغرف' : 'Rooms', value: isRTL ? '٣ غرف' : '3 Rooms' },
        { label: isRTL ? 'المساحة' : 'Area', value: '150 m²' },
        { label: isRTL ? 'الطابق' : 'Floor', value: isRTL ? 'الثالث' : '3rd' },
        { label: isRTL ? 'التأثيث' : 'Furnishing', value: isRTL ? 'مؤثث' : 'Furnished' },
      );
      break;
    case 'cars':
      specs.push(
        { label: isRTL ? 'الماركة' : 'Make', value: isRTL ? 'تويوتا' : 'Toyota' },
        { label: isRTL ? 'الموديل' : 'Model', value: 'Camry' },
        { label: isRTL ? 'السنة' : 'Year', value: '2023' },
        { label: isRTL ? 'الممشى' : 'Mileage', value: '25,000 km' },
        { label: isRTL ? 'الحالة' : 'Condition', value: isRTL ? 'مستعمل ممتاز' : 'Used - Excellent' },
      );
      break;
    case 'electronics':
      specs.push(
        { label: isRTL ? 'الماركة' : 'Brand', value: isRTL ? 'سامسونج' : 'Samsung' },
        { label: isRTL ? 'الحالة' : 'Condition', value: isRTL ? 'جديد' : 'New' },
        { label: isRTL ? 'الضمان' : 'Warranty', value: isRTL ? 'سنة واحدة' : '1 Year' },
      );
      break;
    case 'services':
      specs.push(
        { label: isRTL ? 'نوع الخدمة' : 'Service Type', value: isRTL ? 'احترافي' : 'Professional' },
        { label: isRTL ? 'المدة' : 'Duration', value: isRTL ? '٢-٣ ساعات' : '2-3 Hours' },
        { label: isRTL ? 'التوفر' : 'Availability', value: isRTL ? 'يومياً' : 'Daily' },
      );
      break;
    case 'jobs':
      specs.push(
        { label: isRTL ? 'نوع الوظيفة' : 'Job Type', value: isRTL ? 'دوام كامل' : 'Full-time' },
        { label: isRTL ? 'الراتب' : 'Salary Range', value: isRTL ? '٥,٠٠٠ - ٨,٠٠٠ ر.س' : '5,000 - 8,000 SAR' },
        { label: isRTL ? 'المتطلبات' : 'Requirements', value: isRTL ? 'خبرة ٣ سنوات' : '3 years exp.' },
      );
      break;
    default:
      break;
  }

  // Always add generic specs
  specs.push(
    { label: isRTL ? 'الفئة' : 'Category', value: isRTL ? (categoryLabelsAr[category] ?? category) : (categoryLabelsEn[category] ?? category) },
    { label: isRTL ? 'السعر' : 'Price', value: `${listing.price.toLocaleString(isRTL ? 'ar-SA' : 'en-US')} ${listing.currency === 'SAR' ? 'ر.س' : listing.currency}` },
    { label: isRTL ? 'تاريخ النشر' : 'Date Posted', value: new Date(listing.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
    { label: isRTL ? 'الموقع' : 'Location', value: isRTL ? 'قدسيا، دمشق' : 'Qudsaya, Damascus' },
  );

  return specs;
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

function SectionHeader({ title, accent }: { title: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {accent && <div className="h-1 w-5 bg-red-500 rounded-full" />}
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
    </div>
  );
}

function SpecificationRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
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

// ── Time ago helper ─────────────────────────────────────────────────

function timeAgo(dateStr: string, isRTL: boolean): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return isRTL ? 'اليوم' : 'Today';
  if (diffDays === 1) return isRTL ? 'أمس' : 'Yesterday';
  if (diffDays < 7) return isRTL ? `منذ ${diffDays} أيام` : `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return isRTL ? `منذ ${weeks} أسبوع` : `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return isRTL ? `منذ ${months} شهر` : `${months} month${months > 1 ? 's' : ''} ago`;
  }
  const years = Math.floor(diffDays / 365);
  return isRTL ? `منذ ${years} سنة` : `${years} year${years > 1 ? 's' : ''} ago`;
}

// ── Main Component ──────────────────────────────────────────────────

export function ListingDetail() {
  const { t, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { user } = useAuth();
  const { viewParams, navigate, goBack } = useNavigationStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { addViewed } = useRecentlyViewed();

  const listingId = viewParams.id;

  // Local state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [safetyExpanded, setSafetyExpanded] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<number | null>(null);
  const [questionInput, setQuestionInput] = useState('');
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // ── Scroll detection for sticky header ─────────────────────────────

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Data Fetching ───────────────────────────────────────────────────

  const {
    data: listing,
    isLoading: listingLoading,
    isError: listingError,
    error: listingErrorObj,
    refetch: refetchListing,
  } = useListing(listingId);

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
  } = useReviews(listingId, { page: 0, size: 20 });

  const {
    data: relatedData,
    isLoading: relatedLoading,
  } = useListingsByCategory(listing?.category ?? '', { page: 0, size: 8 });

  // ── Track Recently Viewed (useEffect, not during render) ────────────

  const trackedId = useRef<string | null>(null);

  useEffect(() => {
    if (listing?.id && trackedId.current !== listing.id) {
      trackedId.current = listing.id;
      addViewed(listing.id, listing.title, listing.category, listing.price);
    }
  }, [listing?.id, addViewed]);

  // ── Derived Data ────────────────────────────────────────────────────

  const reviews = reviewsData?.content ?? [];
  const relatedListings = (relatedData?.content ?? []).filter(
    (item: ListingSummary) => item.id !== listingId
  ).slice(0, 6);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 4.2;
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

  const galleryImages = useMemo(() => {
    if (!listing) return [];
    const mainImage = getCategoryImagePath(listing.category);
    const images: Array<{ type: 'image' | 'gradient'; src?: string; gradient: string }> = [];
    if (mainImage) {
      images.push({ type: 'image', src: mainImage, gradient });
    }
    images.push({ type: 'gradient', gradient: 'from-slate-700 to-slate-900' });
    images.push({ type: 'gradient', gradient });
    images.push({ type: 'gradient', gradient: 'from-gray-600 to-gray-800' });
    return images;
  }, [listing, gradient]);

  const categorySpecs = useMemo(() => {
    if (!listing) return [];
    return getCategorySpecs(listing.category, listing, isRTL);
  }, [listing, isRTL]);

  const filteredReviews = useMemo(() => {
    if (reviewFilter === null) return reviews;
    return reviews.filter((r: ReviewResponse) => Math.round(r.rating) === reviewFilter);
  }, [reviews, reviewFilter]);

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
        // User cancelled
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
    const name = isRTL ? 'مزود خدمة' : 'Service Provider';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [isRTL]);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // ── Loading State ───────────────────────────────────────────────────

  if (listingLoading) {
    return (
      <div className="space-y-4 p-4 pb-28">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-8 w-3/5" />
            <Skeleton className="h-8 w-1/4" />
          </div>
          <Skeleton className="h-4 w-2/5" />
        </div>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 flex-1 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
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
        <h2 className="text-lg font-bold text-gray-900">{t('common.error')}</h2>
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

  const statusInfo = getStatusInfo(undefined);

  // ── Render helper for gallery slide ─────────────────────────────────

  const renderGallerySlide = (index: number, forLightbox = false) => {
    const slide = galleryImages[index];
    if (!slide) return null;

    if (slide.type === 'image' && slide.src) {
      return (
        <>
          <img
            src={slide.src}
            alt={listing.title}
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              imageLoaded[slide.src] ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded((prev) => ({ ...prev, [slide.src!]: true }))}
          />
          {!imageLoaded[slide.src] && (
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} flex items-center justify-center`}>
              <div className="text-white/60">{React.cloneElement(categoryIcon as React.ReactElement, { className: 'h-16 w-16' })}</div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
        </>
      );
    }

    return (
      <div className={`h-full w-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center`}>
        <div className="text-white/70 transform scale-150">
          {React.cloneElement(categoryIcon as React.ReactElement, { className: forLightbox ? 'h-20 w-20' : 'h-16 w-16' })}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
      </div>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pb-24"
    >
      {/* ═══ 1. Sticky Header Bar ══════════════════════════════════════ */}
      <motion.div
        className={`sticky top-0 z-30 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-sm py-2'
            : 'bg-white/80 backdrop-blur-md py-3'
        }`}
      >
        <div className="px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 shrink-0 -ml-2"
            >
              <BackArrow className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">{t('common.back')}</span>
            </Button>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0">
              <span>/</span>
              <button
                onClick={() => navigate('market', { category: listing.category })}
                className="hover:text-gray-600 transition-colors font-medium text-gray-500 truncate"
              >
                {categoryLabel}
              </button>
              <span>/</span>
              <AnimatePresence mode="wait">
                {scrolled && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-gray-700 font-semibold truncate max-w-[140px] sm:max-w-[200px]"
                  >
                    {listing.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleToggleFavorite}
              className="h-9 w-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  isFavorite(listingId) ? 'fill-red-500 text-red-500' : 'text-gray-500'
                }`}
              />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleShare}
              className="h-9 w-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <Share2 className="h-5 w-5 text-gray-500" />
            </motion.button>
            <Dialog
              onOpenChange={(open) => {
                if (!open) {
                  setReportReason('');
                  setReportDescription('');
                  setReportSubmitted(false);
                }
              }}
            >
              <DialogTrigger asChild>
                <button className="h-9 w-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                  <Flag className="h-4 w-4 text-gray-400" />
                </button>
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
                    <RadioGroup
                      value={reportReason}
                      onValueChange={setReportReason}
                      className="space-y-2"
                    >
                      {reportReasons.map((reason) => (
                        <div key={reason.value} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <RadioGroupItem value={reason.value} id={`report-${reason.value}`} />
                          <Label htmlFor={`report-${reason.value}`} className="text-sm cursor-pointer flex-1">
                            {isRTL ? reason.labelAr : reason.labelEn}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <div className="space-y-2">
                      <Label className="text-sm">
                        {isRTL ? 'تفاصيل إضافية (اختياري)' : 'Additional details (optional)'}
                      </Label>
                      <Textarea
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        placeholder={
                          isRTL
                            ? 'اكتب المزيد من التفاصيل هنا...'
                            : 'Provide more details here...'
                        }
                        className="min-h-[80px] resize-none"
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
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {isRTL ? 'تم إرسال البلاغ بنجاح' : 'Report Submitted'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {isRTL
                        ? 'شكراً لك، سنراجع البلاغ في أقرب وقت'
                        : "Thank you, we'll review this report shortly"}
                    </p>
                    <DialogClose asChild>
                      <Button variant="outline" size="sm" className="mt-4">
                        {t('common.close')}
                      </Button>
                    </DialogClose>
                  </motion.div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="space-y-5 px-4 pt-4"
        ref={contentRef}
      >
        {/* ═══ 2. Image Gallery ════════════════════════════════════════ */}
        <motion.div {...fadeInUp} className="relative">
          <div
            className="relative h-72 sm:h-96 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={() => setLightboxOpen(true)}
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
                {renderGallerySlide(currentImageIndex)}
              </motion.div>
            </AnimatePresence>

            {/* Favorite overlay */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={(e) => { e.stopPropagation(); handleToggleFavorite(); }}
              className="absolute top-3 z-10 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center"
              style={{ [isRTL ? 'left' : 'right']: '12px' }}
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  isFavorite(listingId) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
            </motion.button>

            {/* Share overlay */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={(e) => { e.stopPropagation(); handleShare(); }}
              className="absolute top-3 z-10 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center"
              style={{ [isRTL ? 'right' : 'left']: '12px' }}
            >
              <Share2 className="h-5 w-5 text-gray-600" />
            </motion.button>

            {/* Fullscreen button */}
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
              className="absolute bottom-14 z-10 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
              style={{ [isRTL ? 'left' : 'right']: '12px' }}
            >
              <Maximize2 className="h-4 w-4 text-white" />
            </button>

            {/* Category badge */}
            <div className="absolute bottom-3 z-10" style={{ [isRTL ? 'right' : 'left']: '12px' }}>
              <Badge className="bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm gap-1 px-3 py-1 text-xs font-medium">
                {React.cloneElement(categoryIcon as React.ReactElement, { className: 'h-3.5 w-3.5' })}
                {categoryLabel}
              </Badge>
            </div>

            {/* Image counter */}
            <div className="absolute bottom-3 z-10" style={{ [isRTL ? 'left' : 'right']: '12px' }}>
              <div className="rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 text-xs text-white font-medium">
                {currentImageIndex + 1}/{galleryImages.length}
              </div>
            </div>
          </div>

          {/* Thumbnail strip */}
          {galleryImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 custom-scrollbar">
              {galleryImages.map((img, idx) => (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative h-16 w-20 rounded-lg overflow-hidden shrink-0 transition-all duration-200 ${
                    idx === currentImageIndex
                      ? 'ring-2 ring-red-500 ring-offset-1'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  {img.type === 'image' && img.src ? (
                    <img src={img.src} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className={`h-full w-full bg-gradient-to-br ${img.gradient}`} />
                  )}
                </motion.button>
              ))}
            </div>
          )}

          {/* Lightbox Dialog */}
          <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
            <DialogContent className="sm:max-w-3xl p-0 bg-black border-0 overflow-hidden rounded-xl">
              <div className="relative h-[70vh] sm:h-[80vh]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {renderGallerySlide(currentImageIndex, true)}
                  </motion.div>
                </AnimatePresence>
                {/* Nav arrows */}
                {currentImageIndex > 0 && (
                  <button
                    onClick={() => setCurrentImageIndex((p) => p - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <ChevronDown className="h-6 w-6 text-white rotate-90" />
                  </button>
                )}
                {currentImageIndex < galleryImages.length - 1 && (
                  <button
                    onClick={() => setCurrentImageIndex((p) => p + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <ChevronUp className="h-6 w-6 text-white rotate-90" />
                  </button>
                )}
                {/* Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <div className="rounded-full bg-black/60 backdrop-blur-sm px-4 py-1.5 text-sm text-white font-medium">
                    {currentImageIndex + 1} / {galleryImages.length}
                  </div>
                </div>
                {/* Close */}
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* ═══ 3. Title + Price Card ═══════════════════════════════════ */}
        <motion.div {...fadeInUp}>
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                      {listing.title}
                    </h1>
                    <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className={`gap-1 text-xs ${statusInfo.color}`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </Badge>
                    {simulatedViews > 200 && (
                      <Badge className="bg-red-50 text-red-600 gap-1 text-xs">
                        <Zap className="h-3 w-3" />
                        {isRTL ? 'مميز' : 'Featured'}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs text-gray-400 font-mono">
                      #{listing.id.slice(0, 8)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-3xl font-bold text-red-500" dir="ltr">
                  {formatPrice(listing.price, listing.currency)}
                </span>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={handleToggleFavorite}
                    className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        isFavorite(listingId) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                      }`}
                    />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={handleShare}
                    className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="h-5 w-5 text-gray-400" />
                  </motion.button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ 4. Quick Info Bar ═══════════════════════════════════════ */}
        <motion.div {...fadeInUp}>
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {/* Views */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-2 shrink-0">
              <Eye className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-gray-500">{isRTL ? 'مشاهدات' : 'Views'}</span>
              <span className="text-xs font-bold text-gray-800">{simulatedViews}</span>
            </div>
            {/* Rating */}
            <div className="flex items-center gap-2 bg-amber-50 rounded-full px-3 py-2 shrink-0">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-gray-800">{averageRating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({reviews.length > 0 ? reviews.length : 12})</span>
            </div>
            {/* Listing Age */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-2 shrink-0">
              <Clock className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-gray-800 font-medium">
                {timeAgo(listing.createdAt, isRTL)}
              </span>
            </div>
            {/* Status */}
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-2 shrink-0 ${statusInfo.color}`}>
              {statusInfo.icon}
              <span className="text-xs font-medium">{statusInfo.label}</span>
            </div>
          </div>
        </motion.div>

        {/* ═══ 5. Seller/Provider Card ═════════════════════════════════ */}
        <motion.div {...fadeInUp}>
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-14 w-14 border-2 border-red-100">
                    <AvatarFallback className="bg-gradient-to-br from-red-400 to-red-600 text-white font-bold text-base">
                      {providerInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {isRTL ? 'مزود خدمة معتمد' : 'Verified Provider'}
                    </h3>
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {isRTL
                        ? `عضو منذ ${formatDate(listing.createdAt, 'short')}`
                        : `Member since ${formatDate(listing.createdAt, 'short')}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <StarRating rating={averageRating > 0 ? averageRating : 4.5} size="sm" />
                    <span className="text-[10px] text-gray-400">
                      ({reviews.length > 0 ? reviews.length : 12} {isRTL ? 'تقييم' : 'reviews'})
                    </span>
                  </div>
                </div>
              </div>
              {/* Response time */}
              <div className="flex items-center gap-2 mt-3 p-2 bg-emerald-50 rounded-lg">
                <Zap className="h-4 w-4 text-emerald-600" />
                <span className="text-xs text-emerald-700 font-medium">
                  {isRTL ? 'يرد خلال ساعة' : 'Responds within an hour'}
                </span>
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
                  {isRTL ? 'أرسل رسالة' : 'Message'}
                </Button>
              </div>
              <button
                onClick={() => navigate('market', { category: listing.category })}
                className="w-full mt-2 text-xs text-red-500 hover:text-red-600 font-medium text-center py-1"
              >
                {isRTL ? 'عرض جميع إعلانات المزود' : 'View All Provider Listings'} →
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ 6. Description Section ═════════════════════════════════ */}
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
                      <>{t('common.showLess')} <ChevronUp className="h-4 w-4" /></>
                    ) : (
                      <>{t('common.showMore')} <ChevronDown className="h-4 w-4" /></>
                    )}
                  </button>
                )}
              </div>
              {/* Key highlights */}
              {listing.description && listing.description.length > 50 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    {isRTL ? 'أبرز النقاط' : 'Key Highlights'}
                  </p>
                  <div className="space-y-1.5">
                    {listing.description.split(/[.،,\n]/).filter(s => s.trim().length > 10).slice(0, 3).map((point, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-xs text-gray-600">{point.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ 7. Specifications/Details Table ═════════════════════════ */}
        <motion.div {...fadeInUp}>
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="h-1 w-5 bg-red-500 rounded-full" />
                {isRTL ? 'المواصفات والتفاصيل' : 'Specifications & Details'}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="divide-y divide-gray-100">
                {categorySpecs.map((spec, i) => (
                  <SpecificationRow
                    key={i}
                    label={spec.label}
                    value={
                      spec.label === (isRTL ? 'الفئة' : 'Category') ? (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          {spec.value}
                        </Badge>
                      ) : spec.label === (isRTL ? 'السعر' : 'Price') ? (
                        <span className="text-red-500 font-bold" dir="ltr">{spec.value}</span>
                      ) : (
                        <span className="text-sm">{spec.value}</span>
                      )
                    }
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ 8. Location Section ═════════════════════════════════════ */}
        <motion.div {...fadeInUp}>
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="h-1 w-5 bg-red-500 rounded-full" />
                {isRTL ? 'الموقع' : 'Location'}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {/* Map placeholder */}
              <div className="relative h-40 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-100 via-emerald-50 to-blue-50 mb-3">
                {/* Simulated map grid lines */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-1/4 right-0 h-px bg-emerald-400" />
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-emerald-400" />
                  <div className="absolute top-2/3 left-0 right-0 h-px bg-emerald-400" />
                  <div className="absolute top-0 left-1/3 bottom-0 w-px bg-emerald-400" />
                  <div className="absolute top-0 left-2/3 bottom-0 w-px bg-emerald-400" />
                </div>
                {/* Pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className="relative"
                  >
                    <MapPin className="h-10 w-10 text-red-500 fill-red-200" />
                    <motion.div
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-red-200/50"
                    />
                  </motion.div>
                </div>
                {/* Label overlay */}
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-xs font-medium text-gray-700">
                      {isRTL ? 'قدسيا، دمشق' : 'Qudsaya, Damascus'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Navigation className="h-3.5 w-3.5" />
                  <span>{isRTL ? 'على بُعد 2 كم' : '2 km away'}</span>
                </div>
                <Button variant="outline" size="sm" className="text-xs gap-1 h-8">
                  <Navigation className="h-3.5 w-3.5" />
                  {isRTL ? 'اتجاهات' : 'Get Directions'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ 9. Reviews Section ══════════════════════════════════════ */}
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
                    <Skeleton className="h-12 w-16" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Rating summary */}
                  <div className="flex items-center gap-4 p-3 bg-amber-50/80 rounded-xl">
                    <div className="text-center min-w-[60px]">
                      <div className="text-3xl font-bold text-amber-600">{averageRating.toFixed(1)}</div>
                      <StarRating rating={averageRating} size="sm" />
                      <div className="text-[10px] text-gray-500 mt-1">
                        {reviews.length > 0 ? reviews.length : 12} {t('review.totalReviews')}
                      </div>
                    </div>
                    <Separator orientation="vertical" className="h-14" />
                    <div className="flex-1 space-y-1">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviews.filter(
                          (r: ReviewResponse) => Math.round(r.rating) === star
                        ).length;
                        const total = reviews.length > 0 ? reviews.length : 1;
                        const pct = reviews.length > 0 ? (count / total) * 100 : (star === 5 ? 60 : star === 4 ? 25 : 10);
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

                  {/* Filter by rating */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                    <button
                      onClick={() => setReviewFilter(null)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                        reviewFilter === null ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isRTL ? 'الكل' : 'All'}
                    </button>
                    {[5, 4, 3, 2, 1].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewFilter(star)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 flex items-center gap-1 ${
                          reviewFilter === star ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {star}<Star className="h-3 w-3" />
                      </button>
                    ))}
                  </div>

                  {/* Individual reviews */}
                  {filteredReviews.length > 0 ? (
                    <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                      {filteredReviews.slice(0, 5).map((review: ReviewResponse, idx: number) => (
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
                  ) : (
                    <div className="text-center py-6">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Star className="h-6 w-6 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-500">
                        {reviewFilter !== null
                          ? (isRTL ? `لا توجد تقييمات ${reviewFilter} نجوم` : `No ${reviewFilter}-star reviews`)
                          : t('review.noReviews')
                        }
                      </p>
                      {isAuthenticated && reviewFilter === null && (
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
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ 10. Q&A Section ════════════════════════════════════════ */}
        <motion.div {...fadeInUp}>
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="h-1 w-5 bg-red-500 rounded-full" />
                <HelpCircle className="h-5 w-5 text-gray-400" />
                {isRTL ? 'الأسئلة والأجوبة' : 'Questions & Answers'}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-4">
                {sampleQA.map((qa, idx) => (
                  <motion.div
                    key={qa.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-blue-600">Q</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {isRTL ? qa.questionAr : qa.questionEn}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-emerald-600">A</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">
                          {isRTL ? qa.answerAr : qa.answerEn}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-gray-400">
                            {formatDate(qa.date, 'short')}
                          </span>
                          <button className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-emerald-500 transition-colors">
                            <ThumbsUp className="h-3 w-3" />
                            {qa.helpful}
                          </button>
                        </div>
                      </div>
                    </div>
                    {idx < sampleQA.length - 1 && <Separator />}
                  </motion.div>
                ))}

                {/* Ask a question */}
                <div className="pt-3 border-t border-gray-100">
                  {questionSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-4"
                    >
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">
                        {isRTL ? 'تم إرسال سؤالك بنجاح!' : 'Your question has been submitted!'}
                      </p>
                    </motion.div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={questionInput}
                        onChange={(e) => setQuestionInput(e.target.value)}
                        placeholder={isRTL ? 'اكتب سؤالك هنا...' : 'Ask a question...'}
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                      />
                      <Button
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 text-white shrink-0"
                        onClick={() => {
                          if (questionInput.trim()) setQuestionSubmitted(true);
                        }}
                        disabled={!questionInput.trim() || !isAuthenticated}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ 11. Similar Listings Carousel ═══════════════════════════ */}
        {(relatedListings.length > 0 || relatedLoading) && (
          <motion.div {...fadeInUp}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <div className="h-1 w-5 bg-red-500 rounded-full" />
                  {isRTL ? 'إعلانات مشابهة' : 'Similar Listings'}
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
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar -mx-4 px-4">
                {relatedLoading ? (
                  [0, 1, 2, 3].map((i) => (
                    <Card key={i} className="shrink-0 w-44 overflow-hidden">
                      <Skeleton className="h-28 rounded-none" />
                      <CardContent className="p-3 space-y-1.5">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-4 w-16" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  relatedListings.map((item: ListingSummary, idx: number) => {
                    const itemGradient = categoryGradients[item.category] ?? 'from-gray-400 to-gray-600';
                    const itemImage = getCategoryImagePath(item.category);
                    const itemCatLabel = isRTL
                      ? (categoryLabelsAr[item.category] ?? item.category)
                      : (categoryLabelsEn[item.category] ?? item.category);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="shrink-0 w-44"
                      >
                        <Card
                          className="border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => {
                            navigate('listing-detail', { id: item.id });
                            setCurrentImageIndex(0);
                          }}
                        >
                          <div className={`relative h-28 bg-gradient-to-br ${itemGradient} flex items-center justify-center`}>
                            {itemImage ? (
                              <img src={itemImage} alt={item.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="text-white/50 scale-75">
                                {React.cloneElement(
                                  (categoryIcons[item.category] ?? <Star className="h-6 w-6" />) as React.ReactElement,
                                  { className: 'h-6 w-6' }
                                )}
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
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span className="text-[10px] text-gray-400">
                                {(item.id.charCodeAt(0) % 2 + 4)}.{item.id.charCodeAt(1) % 10}
                              </span>
                              <span className="text-[10px] text-gray-300 mx-0.5">•</span>
                              <MapPin className="h-2.5 w-2.5 text-gray-300" />
                              <span className="text-[10px] text-gray-400">
                                {isRTL ? 'قدسيا' : 'Qudsaya'}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ 12. Safety Tips Section ════════════════════════════════ */}
        <motion.div {...fadeInUp}>
          <Collapsible open={safetyExpanded} onOpenChange={setSafetyExpanded}>
            <Card className="border border-amber-200/50 bg-amber-50/30 shadow-sm">
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-2 pt-4 px-4 cursor-pointer hover:bg-amber-50/50 transition-colors rounded-t-lg">
                  <CardTitle className="text-base font-semibold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-amber-600" />
                      {isRTL ? 'نصائح الأمان' : 'Safety Tips'}
                    </div>
                    <motion.div
                      animate={{ rotate: safetyExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-5 w-5 text-amber-600" />
                    </motion.div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-3">
                    {[
                      { icon: <MapPin className="h-4 w-4" />, ar: 'التقِ في مكان عام آمن', en: 'Meet in a safe public place' },
                      { icon: <AlertTriangle className="h-4 w-4" />, ar: 'لا تدفع مبلغاً مقدماً', en: "Don't pay in advance" },
                      { icon: <Eye className="h-4 w-4" />, ar: 'افحص المنتج قبل الدفع', en: 'Inspect the item before paying' },
                      { icon: <Flag className="h-4 w-4" />, ar: 'أبلغ عن الإعلانات المشبوهة', en: 'Report suspicious listings' },
                    ].map((tip, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 bg-white/70 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                          {tip.icon}
                        </div>
                        <span className="text-sm text-gray-700">
                          {isRTL ? tip.ar : tip.en}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </motion.div>

        {/* ═══ Spacer for bottom bar ══════════════════════════════════ */}
        <div className="h-4" />
      </motion.div>

      {/* ═══ 6. Sticky Bottom Action Bar ═══════════════════════════════ */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          {/* Price display */}
          <div className="shrink-0 min-w-0">
            <p className="text-[10px] text-gray-400 truncate">{isRTL ? 'السعر' : 'Price'}</p>
            <p className="text-base font-bold text-red-500 truncate" dir="ltr">
              {formatPrice(listing.price, listing.currency)}
            </p>
          </div>
          <Separator orientation="vertical" className="h-10 mx-1" />
          {/* Book Now */}
          <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
            <Button
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md shadow-red-200 h-11"
              onClick={handleBook}
              disabled={!isAuthenticated}
            >
              {isRTL ? 'احجز الآن' : 'Book Now'}
            </Button>
          </motion.div>
          {/* Message */}
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
          {/* Call */}
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <Phone className="h-5 w-5" />
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
          height: 4px;
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
