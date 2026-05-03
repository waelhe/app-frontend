'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Package,
  Eye,
  EyeOff,
  Archive,
  Loader2,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  CalendarDays,
  Pencil,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigationStore } from '@/stores/navigationStore';
import { useListingsByProvider, useProviderBookings, useReviews, useActivateListing, usePauseListing, useConfirmBooking, useCompleteBooking, useCancelBooking } from '@/hooks/useApi';
import type { ProviderListingSummary, BookingSummary, ReviewResponse } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// ── Category Gradients & Labels ──────────────────────────────────────

const categoryGradients: Record<string, string> = {
  real_estate: 'from-blue-500 to-blue-600',
  electronics: 'from-purple-500 to-purple-600',
  cars: 'from-red-500 to-red-600',
  services: 'from-emerald-500 to-emerald-600',
  jobs: 'from-amber-500 to-amber-600',
  furniture: 'from-orange-500 to-orange-600',
  medical: 'from-teal-500 to-teal-600',
  dining: 'from-rose-500 to-rose-600',
  education: 'from-sky-500 to-sky-600',
  beauty: 'from-pink-500 to-pink-600',
};

const categoryLabelsAr: Record<string, string> = {
  real_estate: 'عقارات',
  electronics: 'إلكترونيات',
  cars: 'سيارات',
  services: 'خدمات',
  jobs: 'وظائف',
  furniture: 'أثاث',
  medical: 'طبية',
  dining: 'مطاعم',
  education: 'تعليم',
  beauty: 'جمال',
};

const categoryLabelsEn: Record<string, string> = {
  real_estate: 'Real Estate',
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

// ── Earnings Chart Data ──────────────────────────────────────────

const monthlyEarnings = [
  { month: 'Jan', monthAr: 'يناير', value: 1200 },
  { month: 'Feb', monthAr: 'فبراير', value: 1800 },
  { month: 'Mar', monthAr: 'مارس', value: 1500 },
  { month: 'Apr', monthAr: 'أبريل', value: 2200 },
  { month: 'May', monthAr: 'مايو', value: 1900 },
  { month: 'Jun', monthAr: 'يونيو', value: 2800 },
];

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

// ── Star Rating Component ──────────────────────────────────────────

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i < rating
              ? 'fill-amber-400 text-amber-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────

export function ProviderDashboard() {
  const { t, isRTL } = useLanguage();
  const { navigate } = useNavigationStore();
  const { user } = useAuth();

  // ── Fetch Provider Listings ──────────────────────────────────
  const {
    data: listingsData,
    isLoading: listingsLoading,
    isError: listingsError,
  } = useListingsByProvider(user!.id);

  const listings: ProviderListingSummary[] = listingsData?.content ?? [];

  // ── Fetch Provider Bookings ──────────────────────────────────
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    isError: bookingsError,
  } = useProviderBookings(user!.id);

  const bookings: BookingSummary[] = bookingsData?.content ?? [];

  // ── Fetch Provider Reviews ───────────────────────────────────
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    isError: reviewsError,
  } = useReviews(user!.id);

  const reviews: ReviewResponse[] = reviewsData?.content ?? [];

  // ── Computed Stats ────────────────────────────────────────────
  const activeCount = listings.filter((l) => l.status === 'ACTIVE').length;
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING').length;
  const totalRevenue = bookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.priceCents, 0);
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const stats = [
    {
      label: isRTL ? 'إعلاناتي' : 'My Listings',
      value: activeCount,
      subLabel: isRTL ? `${listings.length} إجمالي` : `${listings.length} total`,
      icon: <Package className="h-5 w-5 text-white" />,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: isRTL ? 'الحجوزات' : 'Total Bookings',
      value: bookings.length,
      subLabel: isRTL ? `${pendingBookings} قيد الانتظار` : `${pendingBookings} pending`,
      icon: <CalendarDays className="h-5 w-5 text-white" />,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: isRTL ? 'الأرباح' : 'Revenue',
      value: `${(totalRevenue / 100).toLocaleString()}`,
      subLabel: isRTL ? 'هذا الشهر' : 'This month',
      icon: <DollarSign className="h-5 w-5 text-white" />,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      label: isRTL ? 'متوسط التقييم' : 'Average Rating',
      value: averageRating > 0 ? averageRating.toFixed(1) : '--',
      subLabel: `${reviews.length} ${isRTL ? 'تقييم' : 'reviews'}`,
      icon: <Star className="h-5 w-5 text-white" />,
      color: 'from-amber-500 to-amber-600',
    },
  ];

  const maxEarning = Math.max(...monthlyEarnings.map((d) => d.value), 1);

  // ── Mutations for Listing Actions ────────────────────────────
  const activateMutation = useActivateListing();
  const pauseMutation = usePauseListing();

  // ── Mutations for Booking Actions ────────────────────────────
  const confirmBookingMutation = useConfirmBooking();
  const completeBookingMutation = useCompleteBooking();
  const cancelBookingMutation = useCancelBooking();

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
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-md shadow-red-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isRTL ? 'لوحة المزود' : 'Provider Dashboard'}
            </h1>
            <p className="text-xs text-gray-500">
              {isRTL ? 'إدارة خدماتك وحجوزاتك' : 'Manage your services & bookings'}
            </p>
          </div>
        </div>
        <Button
          className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md shadow-red-500/25"
          onClick={() => navigate('create-listing')}
        >
          <Plus className="h-4 w-4" />
          {isRTL ? 'إضافة إعلان' : 'New Listing'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`rounded-lg p-2 bg-gradient-to-br ${stat.color} shadow-sm`}>
                    {stat.icon}
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                <p className="text-[10px] text-gray-400 mt-1">{stat.subLabel}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Earnings Chart */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-semibold text-gray-900">
                {isRTL ? 'الأرباح الشهرية' : 'Monthly Earnings'}
              </h3>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {isRTL ? 'آخر 6 أشهر' : 'Last 6 months'}
            </Badge>
          </div>
          <div className="flex items-end gap-3 h-36">
            {monthlyEarnings.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-gray-600">{d.value}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.value / maxEarning) * 100}%` }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
                  className="w-full rounded-t-md bg-gradient-to-t from-red-600 to-red-400 min-h-[4px] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10" />
                </motion.div>
                <span className="text-[9px] text-gray-400">
                  {isRTL ? d.monthAr.slice(0, 3) : d.month.slice(0, 3)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* My Listings Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            {isRTL ? 'إعلاناتي' : 'My Listings'}
          </h3>
          <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-600" onClick={() => navigate('my-ads')}>
            {isRTL ? 'عرض الكل' : 'View All'}
            {isRTL ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        </div>

        {listingsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : listingsError ? (
          <div className="py-8 text-center">
            <AlertCircle className="h-8 w-8 text-red-300 mx-auto mb-2" />
            <p className="text-sm text-red-500">{t('common.error')}</p>
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            icon={<Package className="h-10 w-10" />}
            label={isRTL ? 'لا توجد إعلانات بعد' : 'No listings yet'}
            description={isRTL ? 'ابدأ بإضافة إعلانك الأول' : 'Start by creating your first listing'}
            action={
              <Button className="bg-red-500 text-white hover:bg-red-600 mt-3" onClick={() => navigate('create-listing')}>
                <Plus className="h-4 w-4" />
                {isRTL ? 'إضافة إعلان' : 'Create Listing'}
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {listings.slice(0, 5).map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="overflow-hidden group hover:shadow-md transition-shadow">
                  {/* Gradient Header */}
                  <div className={`h-20 bg-gradient-to-br ${categoryGradients[listing.category] ?? 'from-gray-400 to-gray-500'} relative flex items-center justify-center`}>
                    <span className="text-white/20 text-4xl font-bold absolute">
                      {(categoryLabelsEn[listing.category] ?? listing.category)?.charAt(0)?.toUpperCase()}
                    </span>
                    <Badge className="absolute top-2 right-2 bg-white/20 text-white border-0 text-[9px] backdrop-blur-sm">
                      {isRTL ? (categoryLabelsAr[listing.category] ?? listing.category) : (categoryLabelsEn[listing.category] ?? listing.category)}
                    </Badge>
                    <Badge className={`absolute top-2 left-2 text-[9px] ${statusColors[listing.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {isRTL ? (statusLabelsAr[listing.status] ?? listing.status) : (statusLabelsEn[listing.status] ?? listing.status)}
                    </Badge>
                  </div>
                  <CardContent className="p-3 space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{listing.title}</h4>
                    <p className="text-sm font-bold text-red-500" dir="ltr">{listing.price.toLocaleString()} SAR</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span className="flex items-center gap-0.5">
                        <Eye className="h-3 w-3" /> {Math.floor(Math.random() * 200 + 50)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <CalendarDays className="h-3 w-3" /> {Math.floor(Math.random() * 20)}
                      </span>
                    </div>
                    {/* Quick Actions */}
                    <div className="flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] text-gray-500 hover:text-red-500" onClick={() => navigate('edit-listing')}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      {listing.status === 'ACTIVE' ? (
                        <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] text-amber-600 hover:bg-amber-50" onClick={() => pauseMutation.mutate(listing.id)} disabled={pauseMutation.isPending}>
                          <EyeOff className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] text-emerald-600 hover:bg-emerald-50" onClick={() => activateMutation.mutate(listing.id)} disabled={activateMutation.isPending}>
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] text-gray-500 hover:text-gray-700" onClick={() => navigate('listing-detail')}>
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {/* Create New Listing CTA Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(listings.length, 5) * 0.04 }}
            >
              <Card
                className="overflow-hidden border-2 border-dashed border-gray-200 hover:border-red-300 transition-colors cursor-pointer"
                onClick={() => navigate('create-listing')}
              >
                <div className="h-20 flex items-center justify-center bg-gray-50">
                  <div className="flex flex-col items-center gap-1">
                    <div className="rounded-full bg-red-50 p-2">
                      <Plus className="h-5 w-5 text-red-500" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-3 text-center">
                  <p className="text-xs font-medium text-gray-600">
                    {isRTL ? 'إضافة إعلان جديد' : 'Create New Listing'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {isRTL ? 'انقر هنا للبدء' : 'Click here to start'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>

      <Separator />

      {/* Recent Bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            {isRTL ? 'الحجوزات الأخيرة' : 'Recent Bookings'}
          </h3>
          <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-600" onClick={() => navigate('bookings-list')}>
            {isRTL ? 'عرض الكل' : 'View All'}
            {isRTL ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        </div>

        {bookingsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : bookingsError ? (
          <div className="py-8 text-center">
            <p className="text-sm text-red-500">{t('common.error')}</p>
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-10 w-10" />}
            label={isRTL ? 'لا توجد حجوزات بعد' : 'No bookings yet'}
            description={isRTL ? 'ستظهر هنا عندما يحجز العملاء خدماتك' : 'Bookings will appear here when customers book your services'}
          />
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {bookings.slice(0, 10).map((booking, i) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Consumer Avatar */}
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-gray-300 to-gray-400 text-white text-xs">
                          {booking.consumerId?.charAt(0)?.toUpperCase() || 'C'}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {isRTL ? 'مستهلك' : 'Consumer'} #{booking.consumerId?.slice(0, 6)}
                          </p>
                          <Badge className={`text-[9px] ${bookingStatusColors[booking.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {isRTL
                              ? bookingStatusLabelsAr[booking.status] ?? booking.status
                              : bookingStatusLabelsEn[booking.status] ?? booking.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500">
                          <span className="flex items-center gap-0.5">
                            <Package className="h-3 w-3" />
                            {booking.listingId?.slice(0, 8)}…
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {formatDate(booking.createdAt, isRTL)}
                          </span>
                          <span dir="ltr" className="font-medium text-gray-700">
                            {formatPrice(booking.priceCents, booking.currency)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {booking.status === 'PENDING' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[10px] text-emerald-600 hover:bg-emerald-50"
                              onClick={() => confirmBookingMutation.mutate(booking.id)}
                              disabled={bookingMutationPending}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {isRTL ? 'تأكيد' : 'Confirm'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[10px] text-red-500 hover:bg-red-50"
                              onClick={() => cancelBookingMutation.mutate(booking.id)}
                              disabled={bookingMutationPending}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[10px] text-emerald-600 hover:bg-emerald-50"
                              onClick={() => completeBookingMutation.mutate(booking.id)}
                              disabled={bookingMutationPending}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {isRTL ? 'إتمام' : 'Complete'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[10px] text-red-500 hover:bg-red-50"
                              onClick={() => cancelBookingMutation.mutate(booking.id)}
                              disabled={bookingMutationPending}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        {booking.status === 'COMPLETED' && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" />
                            {isRTL ? 'مكتمل' : 'Done'}
                          </span>
                        )}
                        {booking.status === 'CANCELLED' && (
                          <span className="flex items-center gap-1 text-[10px] text-red-500">
                            <XCircle className="h-3 w-3" />
                            {isRTL ? 'ملغى' : 'Cancelled'}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Reviews Summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            {isRTL ? 'ملخص التقييمات' : 'Reviews Summary'}
          </h3>
          <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-600">
            {isRTL ? 'عرض الكل' : 'View All'}
            {isRTL ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        </div>

        {reviewsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : reviewsError ? (
          <div className="py-8 text-center">
            <p className="text-sm text-red-500">{t('common.error')}</p>
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState
            icon={<Star className="h-10 w-10" />}
            label={isRTL ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
            description={isRTL ? 'ستظهر التقييمات بعد إكمال الحجوزات' : 'Reviews will appear after bookings are completed'}
          />
        ) : (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Average Rating Display */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span className="text-4xl font-bold text-gray-900">
                    {averageRating.toFixed(1)}
                  </span>
                  <StarRating rating={Math.round(averageRating)} size="md" />
                  <span className="text-xs text-gray-500">
                    {reviews.length} {isRTL ? 'تقييم' : 'reviews'}
                  </span>
                </div>

                <div className="w-px h-20 bg-gray-200 shrink-0" />

                {/* Star Distribution */}
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => r.rating === star).length;
                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="w-3 text-right text-xs text-gray-500">{star}</span>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full rounded-full bg-amber-400"
                          />
                        </div>
                        <span className="w-6 text-right text-xs text-gray-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">
                  {isRTL ? 'أحدث التقييمات' : 'Recent Reviews'}
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="flex items-start gap-2 rounded-lg bg-gray-50 p-2.5">
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-amber-300 to-amber-400 text-white text-[8px]">
                          ★
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-[10px] text-gray-400">{formatDate(review.createdAt, isRTL)}</span>
                        </div>
                        {review.comment && (
                          <p className="text-xs text-gray-600 line-clamp-2">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Loading overlay for mutations */}
      <AnimatePresence>
        {(activateMutation.isPending ||
          pauseMutation.isPending ||
          bookingMutationPending) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-xs text-white shadow-lg"
          >
            <Loader2 className="mr-2 inline-block h-3 w-3 animate-spin" />
            {t('common.loading')}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Empty State Helper ──────────────────────────────────────────

function EmptyState({
  icon,
  label,
  description,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <div className="text-gray-300">{icon}</div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      {description && <p className="text-xs text-gray-400 max-w-[200px]">{description}</p>}
      {action}
    </div>
  );
}
