'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  ClipboardList,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Filter,
  Star,
  MessageSquare,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigationStore } from '@/stores/navigationStore';
import { bookingService } from '@/lib/api';
import { WriteReviewDialog } from '@/components/system/WriteReviewDialog';
import type { BookingSummary, BookingStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

// ── Status helpers ─────────────────────────────────────────────────

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    COMPLETED: 'bg-sky-100 text-sky-700 border-sky-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700 border-gray-200';
}

function getStatusLabel(status: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    PENDING: t('booking.pending'),
    CONFIRMED: t('booking.confirmed'),
    COMPLETED: t('booking.completed'),
    CANCELLED: t('booking.cancelled'),
  };
  return map[status] ?? status;
}

function getStatusIcon(status: string) {
  const map: Record<string, React.ReactNode> = {
    PENDING: <CalendarCheck className="h-3.5 w-3.5" />,
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

const filterTabs: { id: StatusFilter; labelAr: string; labelEn: string }[] = [
  { id: 'ALL', labelAr: 'الكل', labelEn: 'All' },
  { id: 'PENDING', labelAr: 'قيد الانتظار', labelEn: 'Pending' },
  { id: 'CONFIRMED', labelAr: 'مؤكد', labelEn: 'Confirmed' },
  { id: 'COMPLETED', labelAr: 'مكتمل', labelEn: 'Completed' },
  { id: 'CANCELLED', labelAr: 'ملغى', labelEn: 'Cancelled' },
];

// ── Component ──────────────────────────────────────────────────────

export function BookingsListView() {
  const { t, isRTL } = useLanguage();
  const { user, role, isAuthenticated, accessToken } = useAuth();
  const { goBack, navigate } = useNavigationStore();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const isProvider = role === 'PROVIDER' || role === 'ADMIN';

  // ── Fetch bookings ──────────────────────────────────────────
  const {
    data: bookingsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['bookings-list', user?.id, role],
    queryFn: () => {
      if (!user?.id) throw new Error('Not authenticated');
      if (isProvider) {
        return bookingService.providerBookings(user.id);
      }
      return bookingService.consumerBookings(user.id);
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 10_000,
  });

  const allBookings = bookingsData?.content ?? [];

  // Apply filter
  const filteredBookings = statusFilter === 'ALL'
    ? allBookings
    : allBookings.filter((b) => b.status === statusFilter);

  // ── Confirm booking mutation (Provider) ──────────────────────
  const confirmMutation = useMutation({
    mutationFn: (bookingId: string) => bookingService.confirm(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings-list'] });
    },
  });

  // ── Complete booking mutation (Provider) ─────────────────────
  const completeMutation = useMutation({
    mutationFn: (bookingId: string) => bookingService.complete(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings-list'] });
    },
  });

  // ── Cancel booking mutation ──────────────────────────────────
  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => bookingService.cancel(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings-list'] });
    },
  });

  const isMutating = (bookingId: string) =>
    confirmMutation.isPending && confirmMutation.variables === bookingId ||
    completeMutation.isPending && completeMutation.variables === bookingId ||
    cancelMutation.isPending && cancelMutation.variables === bookingId;

  // ── Loading skeletons ────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-full" />
          ))}
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
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
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">{t('common.error')}</h2>
        <p className="text-sm text-gray-500">
          {isRTL ? 'فشل تحميل الحجوزات' : 'Failed to load bookings'}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          {t('common.retry')}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-4"
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={goBack} className="text-gray-600">
          <BackArrow className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-bold text-gray-900">{t('booking.title')}</h1>
        <Badge variant="secondary" className="ms-auto text-xs">
          {allBookings.length}
        </Badge>
      </div>

      {/* ── Status Filter Tabs ──────────────────────────────────── */}
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

      {/* ── Bookings List ───────────────────────────────────────── */}
      {filteredBookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 py-12 text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <ClipboardList className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{t('booking.noBookings')}</h3>
          <p className="text-sm text-gray-500 max-w-xs">
            {isProvider
              ? isRTL
                ? 'لا توجد حجوزات واردة حالياً'
                : 'No incoming bookings at the moment'
              : isRTL
                ? 'لم تقم بأي حجوزات بعد'
                : "You haven't made any bookings yet"}
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filteredBookings.map((booking: BookingSummary, index: number) => (
              <motion.div
                key={booking.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {/* Top row: Listing ID + Status */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {isRTL ? 'إعلان' : 'Listing'} #{booking.listingId.slice(0, 8)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {isRTL ? 'حجز' : 'Booking'} #{booking.id.slice(0, 8)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 flex items-center gap-1 ${getStatusBadge(booking.status)}`}
                      >
                        {getStatusIcon(booking.status)}
                        {getStatusLabel(booking.status, t)}
                      </Badge>
                    </div>

                    {/* Info row: Date + Price */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <CalendarCheck className="h-3.5 w-3.5" />
                        {formatDate(booking.createdAt, isRTL)}
                        <span className="text-gray-300 mx-0.5">•</span>
                        {formatTime(booking.createdAt, isRTL)}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(booking.priceCents, booking.currency)}
                      </span>
                    </div>

                    {/* Actions row (Provider or Consumer) */}
                    {(isProvider || booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <>
                        <Separator className="my-3" />
                        <div className="flex items-center gap-2 flex-wrap">
                          {isProvider && booking.status === 'PENDING' && (
                            <Button
                              size="sm"
                              className="gap-1 bg-emerald-500 text-white hover:bg-emerald-600 text-xs h-7"
                              onClick={() => confirmMutation.mutate(booking.id)}
                              disabled={isMutating(booking.id)}
                            >
                              {isMutating(booking.id) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                              {t('booking.confirm')}
                            </Button>
                          )}
                          {isProvider && booking.status === 'CONFIRMED' && (
                            <Button
                              size="sm"
                              className="gap-1 bg-sky-500 text-white hover:bg-sky-600 text-xs h-7"
                              onClick={() => completeMutation.mutate(booking.id)}
                              disabled={isMutating(booking.id)}
                            >
                              {isMutating(booking.id) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                              {t('booking.complete')}
                            </Button>
                          )}
                          {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 border-red-200 text-red-600 hover:bg-red-50 text-xs h-7"
                              onClick={() => cancelMutation.mutate(booking.id)}
                              disabled={isMutating(booking.id)}
                            >
                              {isMutating(booking.id) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                              {t('booking.cancel')}
                            </Button>
                          )}
                          {/* Write Review - for consumers with completed bookings */}
                          {!isProvider && booking.status === 'COMPLETED' && (
                            <Button
                              size="sm"
                              className="gap-1 bg-amber-500 text-white hover:bg-amber-600 text-xs h-7"
                              onClick={() => setReviewBookingId(booking.id)}
                            >
                              <Star className="h-3 w-3" />
                              {isRTL ? 'أضف تقييم' : 'Write Review'}
                            </Button>
                          )}
                          {/* Message - for any active booking */}
                          {(booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 border-red-200 text-red-600 hover:bg-red-50 text-xs h-7"
                              onClick={() => navigate('messages' as any, { bookingId: booking.id })}
                            >
                              <MessageSquare className="h-3 w-3" />
                              {isRTL ? 'رسالة' : 'Message'}
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
          queryClient.invalidateQueries({ queryKey: ['bookings-list'] });
        }}
      />
    </motion.div>
  );
}
