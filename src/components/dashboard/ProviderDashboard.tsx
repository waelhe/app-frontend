'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Plus,
  Package,
  Eye,
  EyeOff,
  Archive,
  Loader2,
  Inbox,
  Star,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigationStore } from '@/stores/navigationStore';
import { catalogService, bookingService, reviewsService } from '@/lib/api';
import type { ProviderListingSummary, BookingSummary, ReviewResponse } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

// ── Listing Status Config ──────────────────────────────────────────

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PAUSED: 'bg-amber-100 text-amber-700',
  ARCHIVED: 'bg-gray-100 text-gray-600',
  DRAFT: 'bg-blue-100 text-blue-700',
};

const statusLabelsAr: Record<string, string> = {
  ACTIVE: 'نشط',
  PAUSED: 'متوقف',
  ARCHIVED: 'مؤرشف',
  DRAFT: 'مسودة',
};

const statusLabelsEn: Record<string, string> = {
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  ARCHIVED: 'Archived',
  DRAFT: 'Draft',
};

// ── Booking Status Config ──────────────────────────────────────────

const bookingStatusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-sky-100 text-sky-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const bookingStatusLabelsAr: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  CONFIRMED: 'مؤكد',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغى',
};

const bookingStatusLabelsEn: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

// ── Helpers ────────────────────────────────────────────────────────

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

function formatPrice(priceCents: number, currency: string): string {
  const amount = priceCents / 100;
  return `${amount.toLocaleString()} ${currency}`;
}

// ── Star Rating Component (declared outside render) ─────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? 'fill-amber-400 text-amber-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

export function ProviderDashboard() {
  const { t, isRTL } = useLanguage();
  const { navigate } = useNavigationStore();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // ── Fetch Provider Listings ──────────────────────────────────
  const {
    data: listingsData,
    isLoading: listingsLoading,
    isError: listingsError,
  } = useQuery({
    queryKey: ['provider-listings', user?.id],
    queryFn: () => catalogService.byProvider(user!.id),
    enabled: !!user?.id,
  });

  const listings: ProviderListingSummary[] = listingsData?.content ?? [];

  // ── Fetch Provider Bookings ──────────────────────────────────
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    isError: bookingsError,
  } = useQuery({
    queryKey: ['provider-bookings', user?.id],
    queryFn: () => bookingService.providerBookings(user!.id),
    enabled: !!user?.id,
  });

  const bookings: BookingSummary[] = bookingsData?.content ?? [];

  // ── Fetch Provider Reviews ───────────────────────────────────
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    isError: reviewsError,
  } = useQuery({
    queryKey: ['provider-reviews', user?.id],
    queryFn: () => reviewsService.byProvider(user!.id),
    enabled: !!user?.id,
  });

  const reviews: ReviewResponse[] = reviewsData?.content ?? [];

  // ── Stats ────────────────────────────────────────────────────
  const total = listings.length;
  const active = listings.filter((l) => l.status === 'ACTIVE').length;
  const paused = listings.filter((l) => l.status === 'PAUSED').length;
  const archived = listings.filter((l) => l.status === 'ARCHIVED').length;

  const stats = [
    {
      label: isRTL ? 'الإجمالي' : 'Total',
      value: total,
      icon: <Package className="h-5 w-5 text-blue-500" />,
      color: 'bg-blue-50',
    },
    {
      label: isRTL ? 'نشط' : 'Active',
      value: active,
      icon: <Eye className="h-5 w-5 text-emerald-500" />,
      color: 'bg-emerald-50',
    },
    {
      label: isRTL ? 'متوقف' : 'Paused',
      value: paused,
      icon: <EyeOff className="h-5 w-5 text-amber-500" />,
      color: 'bg-amber-50',
    },
    {
      label: isRTL ? 'مؤرشف' : 'Archived',
      value: archived,
      icon: <Archive className="h-5 w-5 text-gray-500" />,
      color: 'bg-gray-50',
    },
  ];

  // ── Average Rating ───────────────────────────────────────────
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // ── Mutations for Listing Actions ────────────────────────────
  const activateMutation = useMutation({
    mutationFn: (id: string) => catalogService.activate(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['provider-listings'] }),
  });

  const pauseMutation = useMutation({
    mutationFn: (id: string) => catalogService.pause(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['provider-listings'] }),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => catalogService.archive(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['provider-listings'] }),
  });

  // ── Mutations for Booking Actions ────────────────────────────
  const confirmBookingMutation = useMutation({
    mutationFn: (id: string) => bookingService.confirm(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] }),
  });

  const completeBookingMutation = useMutation({
    mutationFn: (id: string) => bookingService.complete(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] }),
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (id: string) => bookingService.cancel(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] }),
  });

  const bookingMutationPending =
    confirmBookingMutation.isPending ||
    completeBookingMutation.isPending ||
    cancelBookingMutation.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          {t('dashboard.title')}
        </h1>
        <Button
          className="bg-red-500 text-white hover:bg-red-600"
          onClick={() => navigate('create-listing')}
        >
          <Plus className="h-4 w-4" />
          {t('nav.createListing')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`rounded-lg p-2 ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="listings" dir={isRTL ? 'rtl' : 'ltr'}>
        <TabsList className="w-full">
          <TabsTrigger value="listings" className="flex-1">
            {t('dashboard.myListings')}
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex-1">
            {t('dashboard.myBookings')}
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex-1">
            {t('dashboard.reviews')}
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex-1">
            {t('messages.title')}
          </TabsTrigger>
        </TabsList>

        {/* ── Listings Tab ──────────────────────────────────── */}
        <TabsContent value="listings">
          {listingsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : listingsError ? (
            <div className="py-8 text-center">
              <p className="text-sm text-red-500">{t('common.error')}</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Package className="h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">
                {t('listing.noListings')}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? 'العنوان' : 'Title'}</TableHead>
                  <TableHead>{t('listing.category')}</TableHead>
                  <TableHead>{t('listing.price')}</TableHead>
                  <TableHead>{t('listing.status')}</TableHead>
                  <TableHead className="text-left">
                    {isRTL ? 'إجراءات' : 'Actions'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="max-w-[150px] truncate font-medium">
                      {listing.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">
                        {listing.category}
                      </Badge>
                    </TableCell>
                    <TableCell dir="ltr" className="text-sm">
                      {listing.price.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[10px] ${statusColors[listing.status] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {isRTL
                          ? statusLabelsAr[listing.status] ?? listing.status
                          : statusLabelsEn[listing.status] ?? listing.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {listing.status !== 'ACTIVE' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[10px] text-emerald-600 hover:bg-emerald-50"
                            onClick={() => activateMutation.mutate(listing.id)}
                            disabled={activateMutation.isPending}
                          >
                            <Eye className="h-3 w-3" />
                            {t('listing.activate')}
                          </Button>
                        )}
                        {listing.status === 'ACTIVE' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[10px] text-amber-600 hover:bg-amber-50"
                            onClick={() => pauseMutation.mutate(listing.id)}
                            disabled={pauseMutation.isPending}
                          >
                            <EyeOff className="h-3 w-3" />
                            {t('listing.pause')}
                          </Button>
                        )}
                        {listing.status !== 'ARCHIVED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[10px] text-gray-500 hover:bg-gray-50"
                            onClick={() => archiveMutation.mutate(listing.id)}
                            disabled={archiveMutation.isPending}
                          >
                            <Archive className="h-3 w-3" />
                            {t('listing.archive')}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* ── Bookings Tab ──────────────────────────────────── */}
        <TabsContent value="bookings">
          {bookingsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : bookingsError ? (
            <div className="py-8 text-center">
              <p className="text-sm text-red-500">{t('common.error')}</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Inbox className="h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">
                {t('booking.noBookings')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('booking.listingId')}</TableHead>
                    <TableHead>{t('booking.status')}</TableHead>
                    <TableHead>{t('booking.date')}</TableHead>
                    <TableHead>{t('booking.price')}</TableHead>
                    <TableHead className="text-left">
                      {t('booking.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="max-w-[120px] truncate font-medium">
                        <span className="font-mono text-xs">
                          {booking.listingId.slice(0, 8)}…
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-[10px] ${bookingStatusColors[booking.status] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {isRTL
                            ? bookingStatusLabelsAr[booking.status] ?? booking.status
                            : bookingStatusLabelsEn[booking.status] ?? booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(booking.createdAt, isRTL)}
                      </TableCell>
                      <TableCell dir="ltr" className="text-sm">
                        {formatPrice(booking.priceCents, booking.currency)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {booking.status === 'PENDING' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[10px] text-emerald-600 hover:bg-emerald-50"
                              onClick={() => confirmBookingMutation.mutate(booking.id)}
                              disabled={bookingMutationPending}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {t('booking.confirm')}
                            </Button>
                          )}
                          {booking.status === 'CONFIRMED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[10px] text-sky-600 hover:bg-sky-50"
                              onClick={() => completeBookingMutation.mutate(booking.id)}
                              disabled={bookingMutationPending}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {t('booking.complete')}
                            </Button>
                          )}
                          {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[10px] text-red-500 hover:bg-red-50"
                              onClick={() => cancelBookingMutation.mutate(booking.id)}
                              disabled={bookingMutationPending}
                            >
                              <XCircle className="h-3 w-3" />
                              {t('booking.cancel')}
                            </Button>
                          )}
                          {booking.status === 'COMPLETED' && (
                            <span className="flex items-center gap-1 text-[10px] text-sky-600">
                              <CheckCircle2 className="h-3 w-3" />
                              {t('booking.completed')}
                            </span>
                          )}
                          {booking.status === 'CANCELLED' && (
                            <span className="flex items-center gap-1 text-[10px] text-red-500">
                              <XCircle className="h-3 w-3" />
                              {t('booking.cancelled')}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ── Reviews Tab ───────────────────────────────────── */}
        <TabsContent value="reviews">
          {reviewsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : reviewsError ? (
            <div className="py-8 text-center">
              <p className="text-sm text-red-500">{t('common.error')}</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Star className="h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">
                {t('review.noReviews')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Average Rating Summary */}
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-gray-900">
                      {averageRating.toFixed(1)}
                    </span>
                    <StarRating rating={Math.round(averageRating)} />
                    <span className="mt-1 text-xs text-gray-500">
                      {reviews.length} {t('review.totalReviews')}
                    </span>
                  </div>
                  <div className="mx-2 h-12 w-px bg-gray-200" />
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter((r) => r.rating === star).length;
                      const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="w-3 text-right text-xs text-gray-500">{star}</span>
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-amber-400 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-6 text-right text-xs text-gray-500">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Individual Reviews */}
              <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-gray-400">
                          {formatDate(review.createdAt, isRTL)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-sm text-gray-700">
                          {review.comment}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Messages Tab ──────────────────────────────────── */}
        <TabsContent value="messages">
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="rounded-full bg-gray-100 p-4">
              <MessageCircle className="h-10 w-10 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('messages.comingSoon')}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('messages.comingSoonDesc')}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Loading overlay for mutations */}
      {(activateMutation.isPending ||
        pauseMutation.isPending ||
        archiveMutation.isPending ||
        bookingMutationPending) && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-xs text-white shadow-lg">
          <Loader2 className="mr-2 inline-block h-3 w-3 animate-spin" />
          {t('common.loading')}
        </div>
      )}
    </motion.div>
  );
}
