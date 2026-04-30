'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigationStore } from '@/stores/navigationStore';
import { catalogService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const categoryIcons: Record<string, React.ReactNode> = {
  'real-estate': <Building2 className="h-8 w-8" />,
  electronics: <Smartphone className="h-8 w-8" />,
  cars: <Car className="h-8 w-8" />,
  services: <Briefcase className="h-8 w-8" />,
  jobs: <HardHat className="h-8 w-8" />,
  furniture: <Sofa className="h-8 w-8" />,
};

const categoryGradients: Record<string, string> = {
  'real-estate': 'from-amber-400 to-orange-500',
  electronics: 'from-blue-400 to-cyan-500',
  cars: 'from-gray-400 to-slate-600',
  services: 'from-emerald-400 to-teal-500',
  jobs: 'from-purple-400 to-violet-500',
  furniture: 'from-rose-400 to-pink-500',
};

export function ListingDetail() {
  const { t, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { viewParams, navigate, goBack } = useNavigationStore();
  const [isFavorited, setIsFavorited] = useState(false);

  const listingId = viewParams.id;

  const {
    data: listing,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => catalogService.byId(listingId),
    enabled: !!listingId,
  });

  const handleBook = () => {
    if (!isAuthenticated) return;
    navigate('booking', { listingId: listingId ?? '' });
  };

  const handleMessage = () => {
    if (!isAuthenticated) return;
    navigate('messages', { listingId: listingId ?? '' });
  };

  const handleShare = async () => {
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
    }
  };

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // ── Loading State ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-56 w-full rounded-xl" />
        <div className="flex justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="rounded-full bg-red-100 p-4">
          <Shield className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          {t('common.error')}
        </h2>
        <p className="text-sm text-gray-500">
          {(error as Error)?.message ?? 'Failed to load listing'}
        </p>
        <Button variant="outline" onClick={goBack}>
          {t('common.back')}
        </Button>
      </div>
    );
  }

  if (!listing) return null;

  const categoryIcon = categoryIcons[listing.category] ?? <Star className="h-8 w-8" />;
  const gradient = categoryGradients[listing.category] ?? 'from-red-400 to-red-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 p-4"
    >
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={goBack}
        className="flex items-center gap-1 text-gray-600"
      >
        <BackArrow className="h-4 w-4" />
        {t('common.back')}
      </Button>

      {/* Hero Image Placeholder */}
      <div
        className={`relative flex h-56 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}
      >
        <div className="text-white/90">{categoryIcon}</div>

        {/* Favorite & Share Buttons */}
        <div className="absolute top-3 flex gap-2" style={{ [isRTL ? 'left' : 'right']: '12px' }}>
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-full bg-white/90 shadow-md"
            onClick={() => setIsFavorited(!isFavorited)}
          >
            <Heart
              className={`h-4 w-4 ${
                isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-full bg-white/90 shadow-md"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 text-gray-600" />
          </Button>
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-3" style={{ [isRTL ? 'right' : 'left']: '12px' }}>
          <Badge className="bg-white/90 text-gray-700 shadow-sm">
            {listing.category}
          </Badge>
        </div>
      </div>

      {/* Title + Price */}
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900 leading-tight">
          {listing.title}
        </h1>
        <div className="shrink-0 text-left" dir="ltr">
          <span className="text-xl font-bold text-red-500">
            {listing.price.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500"> {listing.currency}</span>
        </div>
      </div>

      <Separator />

      {/* Description Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('listing.description')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-gray-600">
            {listing.description || '—'}
          </p>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Status */}
        <Card className="text-center">
          <CardContent className="flex flex-col items-center gap-1 p-3">
            <Shield className="h-5 w-5 text-emerald-500" />
            <span className="text-xs text-gray-500">{t('listing.status')}</span>
            <Badge variant="secondary" className="text-[10px]">
              {t('listing.activate')}
            </Badge>
          </CardContent>
        </Card>

        {/* Date */}
        <Card className="text-center">
          <CardContent className="flex flex-col items-center gap-1 p-3">
            <Clock className="h-5 w-5 text-blue-500" />
            <span className="text-xs text-gray-500">
              {isRTL ? 'التاريخ' : 'Date'}
            </span>
            <span className="text-xs font-medium text-gray-700">
              {new Date(listing.createdAt).toLocaleDateString(
                isRTL ? 'ar-SA' : 'en-US',
                { month: 'short', day: 'numeric' }
              )}
            </span>
          </CardContent>
        </Card>

        {/* Rating */}
        <Card className="text-center">
          <CardContent className="flex flex-col items-center gap-1 p-3">
            <Star className="h-5 w-5 text-amber-500" />
            <span className="text-xs text-gray-500">
              {isRTL ? 'التقييم' : 'Rating'}
            </span>
            <span className="text-xs font-medium text-gray-700">4.5</span>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          className="flex-1 bg-red-500 text-white hover:bg-red-600"
          onClick={handleBook}
          disabled={!isAuthenticated}
        >
          {t('listing.bookNow')}
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
          onClick={handleMessage}
          disabled={!isAuthenticated}
        >
          {isRTL ? 'رسالة' : 'Message'}
        </Button>
      </div>
    </motion.div>
  );
}
