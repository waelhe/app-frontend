'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Calendar,
  LogOut,
  Pencil,
  Check,
  X,
  Loader2,
  ClipboardList,
  AlertCircle,
  Package,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigationStore } from '@/stores/navigationStore';
import { identityService, bookingService, catalogService } from '@/lib/api';
import type { BookingSummary, ProviderListingSummary } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// ── Status badge color helper ──────────────────────────────────────

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

function getRoleBadge(role?: string) {
  const map: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
    PROVIDER: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    CONSUMER: 'bg-sky-100 text-sky-700 border-sky-200',
  };
  return map[role ?? 'CONSUMER'] ?? 'bg-gray-100 text-gray-700';
}

function getRoleLabel(role: string | undefined, isRTL: boolean): string {
  const map: Record<string, { ar: string; en: string }> = {
    ADMIN: { ar: 'مدير', en: 'Admin' },
    PROVIDER: { ar: 'مزود خدمة', en: 'Provider' },
    CONSUMER: { ar: 'مستهلك', en: 'Consumer' },
  };
  const r = role ?? 'CONSUMER';
  const label = map[r] ?? { ar: r, en: r };
  return isRTL ? label.ar : label.en;
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

// ── Component ──────────────────────────────────────────────────────

export function ProfileView() {
  const { t, isRTL, language } = useLanguage();
  const { user, role, signOut, isAuthenticated, accessToken } = useAuth();
  const { navigate, goBack } = useNavigationStore();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editError, setEditError] = useState('');

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // ── Fetch fresh profile ──────────────────────────────────────
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['profile', accessToken],
    queryFn: () => identityService.me(),
    enabled: isAuthenticated && !!accessToken,
    staleTime: 30_000,
  });

  const currentUser = profile ?? user;

  // ── Fetch bookings for consumer ──────────────────────────────
  const {
    data: consumerBookingsData,
    isLoading: consumerBookingsLoading,
  } = useQuery({
    queryKey: ['consumer-bookings', currentUser?.id],
    queryFn: () => bookingService.consumerBookings(currentUser!.id),
    enabled: !!currentUser?.id && (currentUser.role ?? role) === 'CONSUMER',
    staleTime: 15_000,
  });

  // ── Fetch bookings for provider ──────────────────────────────
  const {
    data: providerBookingsData,
    isLoading: providerBookingsLoading,
  } = useQuery({
    queryKey: ['provider-bookings', currentUser?.id],
    queryFn: () => bookingService.providerBookings(currentUser!.id),
    enabled: !!currentUser?.id && (currentUser.role ?? role) === 'PROVIDER',
    staleTime: 15_000,
  });

  // ── Fetch provider listings ──────────────────────────────────
  const {
    data: providerListingsData,
    isLoading: providerListingsLoading,
  } = useQuery({
    queryKey: ['provider-listings', currentUser?.id],
    queryFn: () => catalogService.byProvider(currentUser!.id),
    enabled: !!currentUser?.id && (currentUser.role ?? role) === 'PROVIDER',
    staleTime: 15_000,
  });

  const isProvider = (currentUser?.role ?? role) === 'PROVIDER' || (currentUser?.role ?? role) === 'ADMIN';
  const bookings = isProvider
    ? providerBookingsData?.content ?? []
    : consumerBookingsData?.content ?? [];
  const bookingsLoading = isProvider ? providerBookingsLoading : consumerBookingsLoading;
  const providerListings = providerListingsData?.content ?? [];

  // ── Stats for provider ───────────────────────────────────────
  const activeListings = providerListings.filter((l) => l.status === 'ACTIVE').length;
  const totalListings = providerListings.length;
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED').length;
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING').length;

  // ── Edit profile mutation ────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async (data: { displayName: string; phone?: string }) => {
      // Use the identity service proxy route for update
      const res = await fetch('/api/v1/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(isRTL ? 'فشل تحديث الملف' : 'Failed to update profile');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
      setEditError('');
    },
    onError: (err: Error) => {
      setEditError(err.message);
    },
  });

  const handleStartEdit = () => {
    setEditName(currentUser?.displayName ?? '');
    setEditPhone('');
    setEditError('');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      setEditError(isRTL ? 'الاسم مطلوب' : 'Name is required');
      return;
    }
    updateMutation.mutate({ displayName: editName.trim(), phone: editPhone.trim() || undefined });
  };

  const handleLogout = () => {
    signOut();
  };

  // ── Loading skeleton ─────────────────────────────────────────
  if (profileLoading && !user) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────
  if (profileError && !user) {
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
          {isRTL ? 'فشل تحميل الملف الشخصي' : 'Failed to load profile'}
        </p>
        <Button variant="outline" onClick={() => refetchProfile()}>
          {t('common.retry')}
        </Button>
      </motion.div>
    );
  }

  if (!currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 p-8 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <UserIcon className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          {isRTL ? 'يرجى تسجيل الدخول' : 'Please sign in'}
        </h2>
      </motion.div>
    );
  }

  const initials = currentUser.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

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
        <h1 className="text-lg font-bold text-gray-900">{t('nav.profile')}</h1>
      </div>

      {/* ── Profile Card ────────────────────────────────────────── */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6 pb-6">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-gradient-to-br from-red-500 to-rose-600 text-white text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-gray-900">
              {currentUser.displayName}
            </h2>
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {currentUser.email}
            </p>
            <Badge
              variant="outline"
              className={`mt-1 ${getRoleBadge(currentUser.role ?? role)}`}
            >
              <Shield className="h-3 w-3" />
              {getRoleLabel(currentUser.role ?? role, isRTL)}
            </Badge>
          </div>

          {currentUser.createdAt && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {isRTL
                ? `عضو منذ ${formatDate(currentUser.createdAt, isRTL)}`
                : `Member since ${formatDate(currentUser.createdAt, isRTL)}`}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Edit Profile Card ───────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-red-500" />
              {isRTL ? 'المعلومات الشخصية' : 'Personal Information'}
            </CardTitle>
            {!isEditing && (
              <Button variant="ghost" size="sm" onClick={handleStartEdit} className="text-red-500 hover:text-red-600">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    {isRTL ? 'الاسم' : 'Display Name'}
                  </label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder={isRTL ? 'أدخل اسمك' : 'Enter your name'}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder={isRTL ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                    dir="ltr"
                    type="tel"
                  />
                </div>

                {editError && (
                  <p className="text-xs text-red-500">{editError}</p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setIsEditing(false);
                      setEditError('');
                    }}
                    disabled={updateMutation.isPending}
                  >
                    <X className="h-3.5 w-3.5" />
                    {t('common.cancel')}
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-red-500 text-white hover:bg-red-600"
                    onClick={handleSaveEdit}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    {t('common.save')}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="display"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {isRTL ? 'الاسم' : 'Display Name'}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentUser.displayName}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{isRTL ? 'البريد الإلكتروني' : 'Email'}</span>
                  <span className="text-sm font-medium text-gray-900">{currentUser.email}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {isRTL ? 'الهاتف' : 'Phone'}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {'—'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* ── Stats Card (Provider) ───────────────────────────────── */}
      {isProvider && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-red-500" />
              {isRTL ? 'إحصائيات الإعلانات' : 'Listing Stats'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {providerListingsLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-emerald-50 p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{activeListings}</p>
                  <p className="text-[10px] font-medium text-emerald-500">
                    {isRTL ? 'إعلانات نشطة' : 'Active Listings'}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-2xl font-bold text-gray-600">{totalListings}</p>
                  <p className="text-[10px] font-medium text-gray-500">
                    {isRTL ? 'إجمالي الإعلانات' : 'Total Listings'}
                  </p>
                </div>
                <div className="rounded-lg bg-sky-50 p-3 text-center">
                  <p className="text-2xl font-bold text-sky-600">{completedBookings}</p>
                  <p className="text-[10px] font-medium text-sky-500">
                    {isRTL ? 'حجوزات مكتملة' : 'Completed Bookings'}
                  </p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600">{pendingBookings}</p>
                  <p className="text-[10px] font-medium text-amber-500">
                    {isRTL ? 'حجوزات قيد الانتظار' : 'Pending Bookings'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Recent Bookings ─────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-red-500" />
              {isProvider
                ? isRTL ? 'الحجوزات الواردة' : 'Incoming Bookings'
                : isRTL ? 'حجوزاتي' : 'My Bookings'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 text-xs"
              onClick={() => navigate('bookings-list')}
            >
              {t('common.viewAll')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {bookingsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <ClipboardList className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">{t('booking.noBookings')}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
              {bookings.slice(0, 5).map((booking: BookingSummary) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {isRTL ? 'إعلان' : 'Listing'} #{booking.listingId.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(booking.createdAt, isRTL)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-medium text-gray-700">
                      {formatPrice(booking.priceCents, booking.currency)}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${getStatusBadge(booking.status)}`}
                    >
                      {getStatusLabel(booking.status, t)}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Logout Button ───────────────────────────────────────── */}
      <Button
        variant="outline"
        className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        {t('nav.signOut')}
      </Button>
    </motion.div>
  );
}
