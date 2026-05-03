'use client';

import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  Star,
  MapPin,
  MessageSquare,
  UserPlus,
  Package,
  Eye,
  Clock,
  ShieldCheck,
  Trash2,
  Bell,
  Lock,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/stores/languageStore';
import { useAuth } from '@/stores/authStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { identityService } from '@/lib/api';
import { useListingsByProvider, useReviews, useBookings, useProviderBookings } from '@/hooks/useApi';
import type { BookingSummary, ProviderListingSummary, ReviewResponse } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// ── Helper functions ──────────────────────────────────────────────

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

function formatPrice(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    DRAFT: 'bg-gray-100 text-gray-600',
    PAUSED: 'bg-amber-100 text-amber-700',
    ARCHIVED: 'bg-red-100 text-red-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}

function getStatusLabel(status: string, isRTL: boolean): string {
  const map: Record<string, { ar: string; en: string }> = {
    ACTIVE: { ar: 'نشط', en: 'Active' },
    DRAFT: { ar: 'مسودة', en: 'Draft' },
    PAUSED: { ar: 'متوقف', en: 'Paused' },
    ARCHIVED: { ar: 'مؤرشف', en: 'Archived' },
  };
  return isRTL ? (map[status]?.ar ?? status) : (map[status]?.en ?? status);
}

const categoryGradients: Record<string, string> = {
  'real-estate': 'from-blue-500 to-blue-600',
  electronics: 'from-purple-500 to-purple-600',
  cars: 'from-red-500 to-red-600',
  services: 'from-emerald-500 to-emerald-600',
  jobs: 'from-amber-500 to-amber-600',
  furniture: 'from-orange-500 to-orange-600',
  medical: 'from-teal-500 to-teal-600',
  dining: 'from-pink-500 to-pink-600',
  education: 'from-indigo-500 to-indigo-600',
  beauty: 'from-rose-500 to-rose-600',
};

// ── Star Rating Display ──────────────────────────────────────────

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3 w-3';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sizeClass} ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────

export function ProfileView() {
  const { t, isRTL } = useLanguage();
  const { user, role, signOut, isAuthenticated, accessToken } = useAuth();
  const authStore = useAuth();
  const { navigate, goBack, viewParams } = useNavigationStore();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editError, setEditError] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifBookings, setNotifBookings] = useState(true);
  const [notifPromos, setNotifPromos] = useState(false);
  const [activeTab, setActiveTab] = useState('listings');

  // Check if we're viewing another user's profile
  const viewingUserId = viewParams.userId;
  const isOwnProfile = !viewingUserId || viewingUserId === user?.id;

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // ── Fetch own profile ──────────────────────────────────────
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['profile', accessToken],
    queryFn: () => identityService.me(),
    enabled: isAuthenticated && !!accessToken && isOwnProfile,
    staleTime: 30_000,
  });

  const currentUser = isOwnProfile ? (profile ?? user) : null;
  const currentRole = currentUser?.role ?? role;

  // ── Fetch provider listings ──────────────────────────────────
  const targetUserId = viewingUserId ?? currentUser?.id ?? '';
  const targetRole = isOwnProfile ? currentRole : 'PROVIDER';

  const {
    data: providerListingsData,
    isLoading: providerListingsLoading,
  } = useListingsByProvider(targetUserId, { page: 0, size: 20 });

  // ── Fetch reviews ──────────────────────────────────────────
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
  } = useReviews(targetUserId, { page: 0, size: 20 });

  // ── Fetch bookings ──────────────────────────────────────────
  const {
    data: consumerBookingsData,
  } = useBookings(currentUser?.id, { page: 0, size: 50 });

  const {
    data: providerBookingsData,
  } = useProviderBookings(currentUser?.id ?? '', { page: 0, size: 50 });

  const isProvider = (currentRole === 'PROVIDER' || currentRole === 'ADMIN');
  const bookings = isOwnProfile
    ? isProvider
      ? providerBookingsData?.content ?? []
      : consumerBookingsData?.content ?? []
    : [];
  const providerListings = providerListingsData?.content ?? [];
  const reviews: ReviewResponse[] = reviewsData?.content ?? [];

  // ── Computed stats ───────────────────────────────────────────
  const activeListings = providerListings.filter((l) => l.status === 'ACTIVE').length;
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED').length;
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const responseRate = isProvider ? Math.min(95 + Math.floor(completedBookings / 2), 100) : 0;

  // ── Star distribution ───────────────────────────────────────
  const starDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0]; // 1-5 stars
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++;
    });
    return dist;
  }, [reviews]);

  // ── Edit profile mutation ────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async (data: { displayName: string; phone?: string }) => {
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
    setEditPhone(authStore.user?.phone ?? '');
    setEditBio('');
    setEditError('');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      setEditError(isRTL ? 'الاسم مطلوب' : 'Name is required');
      return;
    }
    updateMutation.mutate({ displayName: editName.trim(), phone: editPhone.trim() || undefined });
    if (authStore.user) {
      authStore.updateUser({ displayName: editName.trim(), phone: editPhone.trim() || undefined });
    }
  };

  const handlePasswordChange = () => {
    setPasswordError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(isRTL ? 'جميع الحقول مطلوبة' : 'All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }
    // In production this would call an API
    setShowPasswordSection(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // ── Loading skeleton ─────────────────────────────────────────
  if (profileLoading && isOwnProfile && !user) {
    return (
      <div className="space-y-4">
        <div className="h-36 bg-gradient-to-r from-red-400 to-rose-500 animate-pulse" />
        <div className="px-4 -mt-12 space-y-4">
          <div className="flex items-end gap-3">
            <Skeleton className="h-20 w-20 rounded-full border-4 border-white" />
            <div className="pb-1 space-y-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────
  if (profileError && isOwnProfile && !user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 p-8 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <Shield className="h-8 w-8 text-red-500" />
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

  if (!currentUser && isOwnProfile) {
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

  const displayName = isOwnProfile ? (currentUser?.displayName ?? '') : (viewParams.userName || '');
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-4"
    >
      {/* ── Cover Banner ──────────────────────────────────────── */}
      <div className="relative h-36 sm:h-44 bg-gradient-to-br from-red-500 via-rose-500 to-red-600 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-8 w-24 h-24 rounded-full bg-white/20 blur-xl" />
          <div className="absolute bottom-2 left-12 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute top-8 left-1/3 w-16 h-16 rounded-full bg-white/15 blur-lg" />
        </div>
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }} />

        {/* Back button */}
        <div className="absolute top-3 start-3 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 hover:text-white"
          >
            <BackArrow className="h-4 w-4" />
          </Button>
        </div>

        {/* Title */}
        <div className="absolute top-3 start-1/2 -translate-x-1/2 z-10">
          <h1 className="text-white font-bold text-base drop-shadow-sm">
            {isRTL ? 'الملف الشخصي' : 'Profile'}
          </h1>
        </div>
      </div>

      {/* ── Profile Info Card ──────────────────────────────────── */}
      <div className="px-4 -mt-14 relative z-10">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-end gap-3">
              {/* Avatar */}
              <div className="relative -mt-12">
                <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                  <AvatarImage src={authStore.user?.image} />
                  <AvatarFallback className="bg-gradient-to-br from-red-500 to-rose-600 text-white text-xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {/* Verified badge for providers */}
                {(isProvider || !isOwnProfile) && (
                  <div className="absolute -bottom-1 -end-1 h-7 w-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                    <ShieldCheck className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </div>

              {/* Name & details */}
              <div className="flex-1 min-w-0 pb-1">
                <h2 className="text-lg font-bold text-gray-900 truncate">
                  {displayName}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 ${getRoleBadge(isOwnProfile ? currentRole : 'PROVIDER')}`}
                  >
                    {getRoleLabel(isOwnProfile ? currentRole : 'PROVIDER', isRTL)}
                  </Badge>
                  {isOwnProfile && currentUser?.createdAt && (
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                      <Calendar className="h-2.5 w-2.5" />
                      {isRTL ? `عضو منذ ${formatDate(currentUser.createdAt, isRTL)}` : `Since ${formatDate(currentUser.createdAt, isRTL)}`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio / Location row */}
            {(isOwnProfile ? currentUser?.email : true) && (
              <div className="mt-3 space-y-1">
                {isOwnProfile && currentUser?.email && (
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Mail className="h-3 w-3" />
                    {currentUser.email}
                  </p>
                )}
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  {isRTL ? 'دمشق، سوريا' : 'Damascus, Syria'}
                </p>
              </div>
            )}

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <StarRating rating={avgRating} size="sm" />
                <span className="text-xs font-medium text-gray-700">{avgRating.toFixed(1)}</span>
                <span className="text-[10px] text-gray-400">
                  ({reviews.length} {isRTL ? 'تقييم' : 'reviews'})
                </span>
              </div>
            )}

            {/* Stats row */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-red-50 p-2.5 text-center">
                <p className="text-lg font-bold text-red-600">{isProvider ? activeListings : bookings.length}</p>
                <p className="text-[10px] font-medium text-red-500">
                  {isProvider
                    ? isRTL ? 'إعلانات' : 'Listings'
                    : isRTL ? 'حجوزات' : 'Bookings'}
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2.5 text-center">
                <p className="text-lg font-bold text-amber-600">{reviews.length}</p>
                <p className="text-[10px] font-medium text-amber-500">
                  {isRTL ? 'تقييمات' : 'Reviews'}
                </p>
              </div>
              {isProvider && (
                <div className="rounded-lg bg-emerald-50 p-2.5 text-center">
                  <p className="text-lg font-bold text-emerald-600">{responseRate}%</p>
                  <p className="text-[10px] font-medium text-emerald-500">
                    {isRTL ? 'معدل الرد' : 'Response'}
                  </p>
                </div>
              )}
              {!isProvider && (
                <div className="rounded-lg bg-emerald-50 p-2.5 text-center">
                  <p className="text-lg font-bold text-emerald-600">{completedBookings}</p>
                  <p className="text-[10px] font-medium text-emerald-500">
                    {isRTL ? 'مكتملة' : 'Completed'}
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {!isOwnProfile && (
              <div className="mt-4 flex gap-2">
                <Button
                  className="flex-1 bg-red-500 text-white hover:bg-red-600 gap-1.5"
                  onClick={() => navigate('conversation', { conversationId: '' })}
                >
                  <MessageSquare className="h-4 w-4" />
                  {isRTL ? 'رسالة' : 'Message'}
                </Button>
                <Button variant="outline" className="flex-1 gap-1.5 border-red-200 text-red-600 hover:bg-red-50">
                  <UserPlus className="h-4 w-4" />
                  {isRTL ? 'متابعة' : 'Follow'}
                </Button>
              </div>
            )}

            {isOwnProfile && !isEditing && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                onClick={handleStartEdit}
              >
                <Pencil className="h-3.5 w-3.5" />
                {isRTL ? 'تعديل الملف' : 'Edit Profile'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Edit Profile Section ───────────────────────────────── */}
      <AnimatePresence>
        {isOwnProfile && isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 mt-4 overflow-hidden"
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Pencil className="h-4 w-4 text-red-500" />
                    {isRTL ? 'تعديل المعلومات' : 'Edit Information'}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditError(''); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
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
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    {isRTL ? 'نبذة عني' : 'Bio'}
                  </label>
                  <Textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder={isRTL ? 'اكتب نبذة عنك...' : 'Write a short bio...'}
                    className="min-h-20 resize-none"
                  />
                </div>
                {editError && <p className="text-xs text-red-500">{editError}</p>}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => { setIsEditing(false); setEditError(''); }}
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
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabs Section ───────────────────────────────────────── */}
      <div className="px-4 mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="listings" className="flex-1 gap-1">
              <Package className="h-3.5 w-3.5" />
              {isRTL ? 'إعلانات' : 'Listings'}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1 gap-1">
              <Star className="h-3.5 w-3.5" />
              {isRTL ? 'تقييمات' : 'Reviews'}
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="settings" className="flex-1 gap-1">
                <Lock className="h-3.5 w-3.5" />
                {isRTL ? 'إعدادات' : 'Settings'}
              </TabsTrigger>
            )}
          </TabsList>

          {/* ── Listings Tab ──────────────────────────────────────── */}
          <TabsContent value="listings">
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3"
            >
              {providerListingsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-36 rounded-lg" />
                  ))}
                </div>
              ) : providerListings.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                    <div className="rounded-full bg-gray-100 p-4">
                      <Package className="h-8 w-8 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {isOwnProfile
                          ? isRTL ? 'لا توجد إعلانات بعد' : 'No listings yet'
                          : isRTL ? 'لا توجد إعلانات' : 'No listings'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {isOwnProfile && isProvider
                          ? isRTL ? 'ابدأ بإضافة إعلانك الأول' : 'Start by adding your first listing'
                          : ''}
                      </p>
                    </div>
                    {isOwnProfile && isProvider && (
                      <Button
                        size="sm"
                        className="bg-red-500 text-white hover:bg-red-600 gap-1"
                        onClick={() => navigate('create-listing')}
                      >
                        <Package className="h-3.5 w-3.5" />
                        {isRTL ? 'إضافة إعلان' : 'Add Listing'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {providerListings.map((listing, index) => {
                    const gradient = categoryGradients[listing.category] ?? 'from-gray-500 to-gray-600';
                    return (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card
                          className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
                          onClick={() => navigate('listing-detail', { listingId: listing.id })}
                        >
                          {/* Gradient header */}
                          <div className={`h-16 bg-gradient-to-r ${gradient} relative`}>
                            <div className="absolute inset-0 opacity-10" style={{
                              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                              backgroundSize: '16px 16px',
                            }} />
                            <div className="absolute top-2 end-2">
                              <Badge className={`text-[10px] ${getStatusBadge(listing.status)}`}>
                                {getStatusLabel(listing.status, isRTL)}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-3">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {listing.title}
                            </h3>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-sm font-bold text-red-600">
                                {formatPrice(listing.price, 'SYP')}
                              </span>
                              <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                <Eye className="h-2.5 w-2.5" />
                                {Math.floor(Math.random() * 200 + 50)}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-0.5">
                              <Calendar className="h-2.5 w-2.5" />
                              {formatDate(listing.createdAt, isRTL)}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* ── Reviews Tab ───────────────────────────────────────── */}
          <TabsContent value="reviews">
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 space-y-4"
            >
              {reviewsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-28 rounded-lg" />
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                    <div className="rounded-full bg-gray-100 p-4">
                      <Star className="h-8 w-8 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      {isRTL ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {isRTL ? 'ستظهر التقييمات هنا بعد إتمام الحجوزات' : 'Reviews will appear here after bookings are completed'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Average rating display */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
                          <StarRating rating={avgRating} size="sm" />
                          <p className="text-[10px] text-gray-400 mt-1">
                            {reviews.length} {isRTL ? 'تقييم' : 'reviews'}
                          </p>
                        </div>
                        <Separator orientation="vertical" className="h-20" />
                        {/* Star distribution chart */}
                        <div className="flex-1 space-y-1">
                          {[5, 4, 3, 2, 1].map((stars) => {
                            const count = starDistribution[stars - 1];
                            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                            return (
                              <div key={stars} className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-500 w-3 text-end">{stars}</span>
                                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                  <motion.div
                                    className="h-full bg-amber-400 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.5, delay: (5 - stars) * 0.1 }}
                                  />
                                </div>
                                <span className="text-[10px] text-gray-400 w-6 text-start">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Individual review cards */}
                  <div className="space-y-2">
                    {reviews.map((review, index) => {
                      const reviewerInitial = String.fromCharCode(65 + (index % 26));
                      return (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card>
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2.5">
                                <Avatar className="h-8 w-8 shrink-0">
                                  <AvatarFallback className="bg-gradient-to-br from-red-400 to-rose-500 text-white text-xs font-bold">
                                    {reviewerInitial}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900">
                                      {isRTL ? `مستخدم ${reviewerInitial}` : `User ${reviewerInitial}`}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      {formatDate(review.createdAt, isRTL)}
                                    </span>
                                  </div>
                                  <StarRating rating={review.rating} size="sm" />
                                  {review.comment && (
                                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                                      {review.comment}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          </TabsContent>

          {/* ── Settings Tab (own profile only) ──────────────────── */}
          {isOwnProfile && (
            <TabsContent value="settings">
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 space-y-3"
              >
                {/* Personal info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-red-500" />
                      {isRTL ? 'المعلومات الشخصية' : 'Personal Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{isRTL ? 'الاسم' : 'Name'}</span>
                      <span className="text-sm font-medium text-gray-900">{currentUser?.displayName}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{isRTL ? 'البريد' : 'Email'}</span>
                      <span className="text-sm font-medium text-gray-900">{currentUser?.email}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {isRTL ? 'الهاتف' : 'Phone'}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {authStore.user?.phone || (isRTL ? 'غير محدد' : 'Not set')}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{isRTL ? 'نوع الحساب' : 'Account Type'}</span>
                      <Badge variant="outline" className={getRoleBadge(currentRole)}>
                        {getRoleLabel(currentRole, isRTL)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Change password */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lock className="h-4 w-4 text-red-500" />
                      {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!showPasswordSection ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5"
                        onClick={() => setShowPasswordSection(true)}
                      >
                        <Lock className="h-3.5 w-3.5" />
                        {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
                      </Button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700">
                            {isRTL ? 'كلمة المرور الحالية' : 'Current Password'}
                          </label>
                          <Input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700">
                            {isRTL ? 'كلمة المرور الجديدة' : 'New Password'}
                          </label>
                          <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700">
                            {isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                          </label>
                          <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                          />
                        </div>
                        {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setShowPasswordSection(false);
                              setPasswordError('');
                              setCurrentPassword('');
                              setNewPassword('');
                              setConfirmPassword('');
                            }}
                          >
                            {t('common.cancel')}
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-red-500 text-white hover:bg-red-600"
                            onClick={handlePasswordChange}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {isRTL ? 'تحديث' : 'Update'}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>

                {/* Notification preferences */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Bell className="h-4 w-4 text-red-500" />
                      {isRTL ? 'تفضيلات الإشعارات' : 'Notification Preferences'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {isRTL ? 'رسائل جديدة' : 'New Messages'}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {isRTL ? 'إشعار عند استلام رسالة' : 'Get notified on new messages'}
                        </p>
                      </div>
                      <Switch checked={notifMessages} onCheckedChange={setNotifMessages} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {isRTL ? 'تحديثات الحجوزات' : 'Booking Updates'}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {isRTL ? 'إشعار عند تغيير حالة الحجز' : 'Get notified on booking status changes'}
                        </p>
                      </div>
                      <Switch checked={notifBookings} onCheckedChange={setNotifBookings} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {isRTL ? 'العروض الترويجية' : 'Promotions'}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {isRTL ? 'عروض وخصومات خاصة' : 'Special offers and discounts'}
                        </p>
                      </div>
                      <Switch checked={notifPromos} onCheckedChange={setNotifPromos} />
                    </div>
                  </CardContent>
                </Card>

                {/* Logout */}
                <Button
                  variant="outline"
                  className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4" />
                  {t('nav.signOut')}
                </Button>

                {/* Delete account */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full gap-2 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      {isRTL ? 'حذف الحساب' : 'Delete Account'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {isRTL ? 'حذف الحساب' : 'Delete Account'}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {isRTL
                          ? 'هل أنت متأكد من حذف حسابك؟ سيتم حذف جميع بياناتك بشكل نهائي ولا يمكن استرجاعها.'
                          : 'Are you sure you want to delete your account? All your data will be permanently deleted and cannot be recovered.'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-500 text-white hover:bg-red-600">
                        {isRTL ? 'حذف' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </motion.div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </motion.div>
  );
}
