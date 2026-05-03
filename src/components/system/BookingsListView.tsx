'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  ClipboardList,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Filter,
  Star,
  MessageSquare,
  Clock,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  User,
  Building2,
  Car,
  Smartphone,
  Briefcase,
  HardHat,
  Sofa,
  Stethoscope,
  UtensilsCrossed,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/stores/languageStore';
import { useAuth } from '@/stores/authStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { useBookings, useProviderBookings, useConfirmBooking, useCompleteBooking, useCancelBooking } from '@/hooks/useApi';
import { WriteReviewDialog } from '@/components/system/WriteReviewDialog';
import type { BookingSummary, BookingStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// ── Category maps ──────────────────────────────────────────────────

const categoryIcons: Record<string, React.ReactNode> = {
  'real-estate': <Building2 className="h-5 w-5" />,
  electronics: <Smartphone className="h-5 w-5" />,
  cars: <Car className="h-5 w-5" />,
  services: <Briefcase className="h-5 w-5" />,
  jobs: <HardHat className="h-5 w-5" />,
  furniture: <Sofa className="h-5 w-5" />,
  medical: <Stethoscope className="h-5 w-5" />,
  dining: <UtensilsCrossed className="h-5 w-5" />,
  education: <GraduationCap className="h-5 w-5" />,
  beauty: <Sparkles className="h-5 w-5" />,
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
  beauty: 'جمال',
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
  beauty: 'Beauty',
};

// ── Status helpers ─────────────────────────────────────────────────

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    COMPLETED: 'bg-blue-100 text-blue-700 border-blue-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700 border-gray-200';
}

function getStatusDot(status: string) {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-500',
    CONFIRMED: 'bg-emerald-500',
    COMPLETED: 'bg-blue-500',
    CANCELLED: 'bg-red-500',
  };
  return map[status] ?? 'bg-gray-500';
}

function getStatusIcon(status: string) {
  const map: Record<string, React.ReactNode> = {
    PENDING: <Clock className="h-3.5 w-3.5" />,
    CONFIRMED: <CheckCircle2 className="h-3.5 w-3.5" />,
    COMPLETED: <CheckCircle2 className="h-3.5 w-3.5" />,
    CANCELLED: <XCircle className="h-3.5 w-3.5" />,
  };
  return map[status] ?? <ClipboardList className="h-3.5 w-3.5" />;
}

function formatPrice(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

function formatDate(iso: string, isRTL: boolean): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatTime(iso: string, isRTL: boolean): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

// ── Filter tabs ────────────────────────────────────────────────────

type StatusFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

// ── Animation variants ─────────────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

// ── Component ──────────────────────────────────────────────────────

export function BookingsListView() {
  const { t, isRTL } = useLanguage();
  const { user, role, isAuthenticated, accessToken } = useAuth();
  const { goBack, navigate } = useNavigationStore();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const isProvider = role === 'PROVIDER' || role === 'ADMIN';

  // Filter tabs definition
  const filterTabs: { id: StatusFilter; labelAr: string; labelEn: string }[] = [
    { id: 'ALL', labelAr: 'الكل', labelEn: 'All' },
    { id: 'PENDING', labelAr: 'قيد الانتظار', labelEn: 'Pending' },
    { id: 'CONFIRMED', labelAr: 'مؤكد', labelEn: 'Confirmed' },
    { id: 'COMPLETED', labelAr: 'مكتمل', labelEn: 'Completed' },
    { id: 'CANCELLED', labelAr: 'ملغى', labelEn: 'Cancelled' },
  ];

  // ── Fetch bookings ──────────────────────────────────────────
  const bookingsQueryConsumer = useBookings(user?.id, { page: 0, size: 50 });
  const bookingsQueryProvider = useProviderBookings(user?.id ?? '', { page: 0, size: 50 });

  const bookingsData = isProvider ? bookingsQueryProvider.data : bookingsQueryConsumer.data;
  const isLoading = isProvider ? bookingsQueryProvider.isLoading : bookingsQueryConsumer.isLoading;
  const error = isProvider ? bookingsQueryProvider.error : bookingsQueryConsumer.error;
  const refetch = isProvider ? bookingsQueryProvider.refetch : bookingsQueryConsumer.refetch;

  const allBookings = bookingsData?.content ?? [];

  // Apply filter
  const filteredBookings = statusFilter === 'ALL'
    ? allBookings
    : allBookings.filter((b) => b.status === statusFilter);

  // ── Stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const list = bookingsData?.content ?? [];
    const total = list.length;
    const active = list.filter((b) => b.status === 'PENDING' || b.status === 'CONFIRMED').length;
    const completed = list.filter((b) => b.status === 'COMPLETED').length;
    const cancelled = list.filter((b) => b.status === 'CANCELLED').length;
    const cancelRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;
    return { total, active, completed, cancelled, cancelRate };
  }, [bookingsData]);

  // ── Confirm booking mutation (Provider) ──────────────────────
  const confirmMutation = useConfirmBooking();

  // ── Complete booking mutation (Provider) ─────────────────────
  const completeMutation = useCompleteBooking();

  // ── Cancel booking mutation ──────────────────────────────────
  const cancelMutation = useCancelBooking();

  const isMutating = (bookingId: string) =>
    confirmMutation.isPending && confirmMutation.variables === bookingId ||
    completeMutation.isPending && completeMutation.variables === bookingId ||
    cancelMutation.isPending && cancelMutation.variables === bookingId;
  const toggleNotes = (id: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Pick a category for a booking (we infer from listingId for demo purposes)
  const categories = ['real-estate', 'electronics', 'cars', 'services', 'jobs', 'furniture', 'medical', 'dining', 'education', 'beauty'];

  const getCategoryForBooking = (booking: BookingSummary, index: number) => {
    return categories[index % categories.length];
  };

  // ── Loading skeletons ────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {/* Header skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-32" />
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        {/* Filter tabs skeleton */}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-full" />
          ))}
        </div>
        {/* Card skeletons */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-24 rounded-t-xl" />
            <Skeleton className="h-32 rounded-b-xl" />
          </div>
        ))}
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 p-8 text-center"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          {t('حدث خطأ', 'An error occurred')}
        </h2>
        <p className="text-sm text-gray-500">
          {t('فشل تحميل الحجوزات', 'Failed to load bookings')}
        </p>
        <Button variant="outline" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('إعادة المحاولة', 'Retry')}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-4 pb-24"
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <motion.div {...fadeInUp} className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack} className="h-8 w-8 shrink-0 text-gray-600">
          <BackArrow className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-red-500" />
          <h1 className="text-xl font-bold text-gray-900">
            {t('الحجوزات', 'Bookings')}
          </h1>
        </div>
        <Badge className="bg-red-500 text-white ms-auto">
          {stats.total}
        </Badge>
      </motion.div>

      {/* ── Stats Bar ───────────────────────────────────────────── */}
      <motion.div {...fadeInUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-3 text-center">
            <ClipboardList className="h-5 w-5 mx-auto text-red-500 mb-1" />
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-[10px] text-gray-500">{t('إجمالي الحجوزات', 'Total Bookings')}</p>
          </CardContent>
        </Card>
        {/* Active */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="p-3 text-center">
            <Clock className="h-5 w-5 mx-auto text-amber-500 mb-1" />
            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            <p className="text-[10px] text-gray-500">{t('نشطة', 'Active')}</p>
          </CardContent>
        </Card>
        {/* Completed */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-3 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            <p className="text-[10px] text-gray-500">{t('مكتملة', 'Completed')}</p>
          </CardContent>
        </Card>
        {/* Cancellation Rate */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="p-3 text-center">
            <TrendingDown className="h-5 w-5 mx-auto text-gray-400 mb-1" />
            <p className="text-2xl font-bold text-gray-900">{stats.cancelRate}%</p>
            <p className="text-[10px] text-gray-500">{t('نسبة الإلغاء', 'Cancel Rate')}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Status Filter Tabs ──────────────────────────────────── */}
      <motion.div {...fadeInUp}>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <Filter className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            const count = tab.id === 'ALL'
              ? allBookings.length
              : allBookings.filter((b) => b.status === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isRTL ? tab.labelAr : tab.labelEn}
                {count > 0 && (
                  <span className={`text-[10px] ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Bookings List ───────────────────────────────────────── */}
      {filteredBookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 py-16 text-center"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
            <CalendarDays className="h-12 w-12 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            {t('لا توجد حجوزات', 'No Bookings')}
          </h3>
          <p className="text-sm text-gray-500 max-w-xs">
            {isProvider
              ? t('لا توجد حجوزات واردة حالياً', 'No incoming bookings at the moment')
              : t('لم تقم بأي حجوزات بعد', "You haven't made any bookings yet")}
          </p>
          <Button
            className="bg-red-500 text-white hover:bg-red-600 gap-2"
            onClick={() => navigate('market' as any)}
          >
            <ClipboardList className="h-4 w-4" />
            {t('تصفح الإعلانات', 'Browse Listings')}
          </Button>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {filteredBookings.map((booking: BookingSummary, index: number) => {
              const cat = getCategoryForBooking(booking, index);
              const gradient = categoryGradients[cat] ?? 'from-red-400 to-red-600';
              const icon = categoryIcons[cat] ?? <ClipboardList className="h-5 w-5" />;
              const catLabel = isRTL ? (categoryLabelsAr[cat] ?? cat) : (categoryLabelsEn[cat] ?? cat);
              const hasNotes = false; // BookingSummary doesn't have notes; using expandable section for future
              const isNotesExpanded = expandedNotes.has(booking.id);

              return (
                <motion.div
                  key={booking.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    {/* ── Gradient Header with Category Icon ────────── */}
                    <div className={`relative bg-gradient-to-r ${gradient} px-4 py-3`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                            <div className="text-white">{icon}</div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-white/80">{catLabel}</p>
                            <p className="text-sm font-bold text-white">
                              {t('إعلان', 'Listing')} #{booking.listingId.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                        <div className="text-left" dir="ltr">
                          <p className="text-lg font-bold text-white">
                            {formatPrice(booking.priceCents, booking.currency)}
                          </p>
                        </div>
                      </div>
                      {/* Decorative circle */}
                      <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/10" />
                      <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-white/5" />
                    </div>

                    <CardContent className="p-4 space-y-3">
                      {/* ── Status Badge + Booking ID ──────────── */}
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-gray-400 font-mono">
                          {t('حجز', 'Booking')} #{booking.id.slice(0, 8)}
                        </p>
                        <Badge
                          variant="outline"
                          className={`shrink-0 flex items-center gap-1 ${getStatusBadge(booking.status)}`}
                        >
                          {getStatusIcon(booking.status)}
                          {isRTL
                            ? filterTabs.find(f => f.id === booking.status)?.labelAr ?? booking.status
                            : filterTabs.find(f => f.id === booking.status)?.labelEn ?? booking.status}
                        </Badge>
                      </div>

                      {/* ── Date & Time ─────────────────────── */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarCheck className="h-3.5 w-3.5 text-gray-400" />
                        <span>{formatDate(booking.createdAt, isRTL)}</span>
                        <span className="text-gray-300">•</span>
                        <span>{formatTime(booking.createdAt, isRTL)}</span>
                      </div>

                      {/* ── Consumer/Provider Info with Avatar ── */}
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-red-100 text-red-600 text-xs font-bold">
                            {isProvider
                              ? (booking.consumerId?.slice(0, 2).toUpperCase() ?? 'C')
                              : (booking.providerId?.slice(0, 2).toUpperCase() ?? 'P')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-400">
                            {isProvider ? t('المستهلك', 'Consumer') : t('مزود الخدمة', 'Provider')}
                          </p>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {isProvider
                              ? `${t('مستهلك', 'Consumer')} ${booking.consumerId?.slice(0, 6) ?? ''}`
                              : `${t('مزود', 'Provider')} ${booking.providerId?.slice(0, 6) ?? ''}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className={`h-2 w-2 rounded-full ${getStatusDot(booking.status)}`} />
                        </div>
                      </div>

                      {/* ── Action Buttons based on status ──── */}
                      {(isProvider || booking.status === 'PENDING' || booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' || booking.status === 'CANCELLED') && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {isProvider && booking.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                className="gap-1 bg-emerald-500 text-white hover:bg-emerald-600 text-xs h-8"
                                onClick={() => confirmMutation.mutate(booking.id)}
                                disabled={isMutating(booking.id)}
                              >
                                {isMutating(booking.id) ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3 w-3" />
                                )}
                                {t('تأكيد', 'Confirm')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 border-red-200 text-red-600 hover:bg-red-50 text-xs h-8"
                                onClick={() => cancelMutation.mutate(booking.id)}
                                disabled={isMutating(booking.id)}
                              >
                                {isMutating(booking.id) ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                                {t('إلغاء', 'Cancel')}
                              </Button>
                            </>
                          )}
                          {isProvider && booking.status === 'CONFIRMED' && (
                            <>
                              <Button
                                size="sm"
                                className="gap-1 bg-emerald-500 text-white hover:bg-emerald-600 text-xs h-8"
                                onClick={() => completeMutation.mutate(booking.id)}
                                disabled={isMutating(booking.id)}
                              >
                                {isMutating(booking.id) ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3 w-3" />
                                )}
                                {t('إتمام', 'Complete')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 border-red-200 text-red-600 hover:bg-red-50 text-xs h-8"
                                onClick={() => cancelMutation.mutate(booking.id)}
                                disabled={isMutating(booking.id)}
                              >
                                {isMutating(booking.id) ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                                {t('إلغاء', 'Cancel')}
                              </Button>
                            </>
                          )}
                          {!isProvider && booking.status === 'COMPLETED' && (
                            <Button
                              size="sm"
                              className="gap-1 bg-amber-500 text-white hover:bg-amber-600 text-xs h-8"
                              onClick={() => setReviewBookingId(booking.id)}
                            >
                              <Star className="h-3 w-3" />
                              {t('أضف تقييم', 'Leave Review')}
                            </Button>
                          )}
                          {booking.status === 'CANCELLED' && !isProvider && (
                            <Button
                              size="sm"
                              className="gap-1 bg-red-500 text-white hover:bg-red-600 text-xs h-8"
                              onClick={() => navigate('listing-detail' as any, { id: booking.listingId })}
                            >
                              <RefreshCw className="h-3 w-3" />
                              {t('إعادة الحجز', 'Rebook')}
                            </Button>
                          )}
                          {(booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 border-gray-200 text-gray-600 hover:bg-gray-50 text-xs h-8"
                              onClick={() => navigate('messages' as any, { bookingId: booking.id })}
                            >
                              <MessageSquare className="h-3 w-3" />
                              {t('رسالة', 'Message')}
                            </Button>
                          )}
                        </div>
                      )}

                      {/* ── Expandable Notes Section ─────────── */}
                      <button
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors w-full"
                        onClick={() => toggleNotes(booking.id)}
                      >
                        {isNotesExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        <span>{isNotesExpanded ? t('إخفاء التفاصيل', 'Hide Details') : t('عرض التفاصيل', 'Show Details')}</span>
                      </button>
                      <AnimatePresence>
                        {isNotesExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span>{t('رقم الإعلان', 'Listing ID')}</span>
                                <span className="font-mono text-gray-700">{booking.listingId.slice(0, 12)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>{t('رقم الحجز', 'Booking ID')}</span>
                                <span className="font-mono text-gray-700">{booking.id.slice(0, 12)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>{t('تاريخ الإنشاء', 'Created')}</span>
                                <span className="text-gray-700">{formatDate(booking.createdAt, isRTL)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>{t('آخر تحديث', 'Last Updated')}</span>
                                <span className="text-gray-700">{formatDate(booking.updatedAt, isRTL)}</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      {/* ── Write Review Dialog ──────────────────────────────────── */}
      <WriteReviewDialog
        open={!!reviewBookingId}
        onOpenChange={(open) => { if (!open) setReviewBookingId(null); }}
        bookingId={reviewBookingId ?? ''}
        onSuccess={() => {
          setReviewBookingId(null);
        }}
      />
    </motion.div>
  );
}
