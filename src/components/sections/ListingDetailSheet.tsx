'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AsymmetricGallery from '@/components/ui/AsymmetricGallery';
import { useListing } from '@/hooks/useApi';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { useFavorites } from '@/stores/favoritesStore';
import { getListingImages, getCategoryLabel, formatPrice } from '@/components/ui/ListingCard';
import {
  Star,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Building2,
  Phone,
  MessageCircle,
  Heart,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { ListingResponse } from '@/lib/types';

// ════════════════════════════════════════════════════════════════════
// Props
// ════════════════════════════════════════════════════════════════════

interface ListingDetailSheetProps {
  listingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ════════════════════════════════════════════════════════════════════
// Mobile breakpoint hook
// ════════════════════════════════════════════════════════════════════

function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  return isMobile;
}

// ════════════════════════════════════════════════════════════════════
// Category-specific spec keys
// ════════════════════════════════════════════════════════════════════

interface SpecItem {
  icon: React.ElementType;
  ar: string;
  en: string;
  getValue: (listing: ListingResponse) => string;
}

const REAL_ESTATE_SPECS: SpecItem[] = [
  { icon: Maximize, ar: 'المساحة', en: 'Area', getValue: () => '١٢٠ م²' },
  { icon: Bed, ar: 'الغرف', en: 'Rooms', getValue: () => '٣' },
  { icon: Bath, ar: 'الحمامات', en: 'Bathrooms', getValue: () => '٢' },
  { icon: Building2, ar: 'الطابق', en: 'Floor', getValue: () => '٤' },
];

const DEFAULT_SPECS: SpecItem[] = [
  { icon: Maximize, ar: 'المساحة', en: 'Area', getValue: () => '—' },
  { icon: Bed, ar: 'الغرف', en: 'Rooms', getValue: () => '—' },
  { icon: Bath, ar: 'الحمامات', en: 'Bathrooms', getValue: () => '—' },
  { icon: Building2, ar: 'الطابق', en: 'Floor', getValue: () => '—' },
];

function getSpecs(category: string): SpecItem[] {
  if (category === 'real-estate') return REAL_ESTATE_SPECS;
  return DEFAULT_SPECS;
}

// ════════════════════════════════════════════════════════════════════
// Category → gallery images
// ════════════════════════════════════════════════════════════════════

const CATEGORY_GALLERY_IMAGES: Record<string, string[]> = {
  'real-estate': [
    '/images/listings/apartment1.jpg',
    '/images/listings/villa1.jpg',
    '/images/listings/apartment2.jpg',
    '/images/listings/office1.jpg',
    '/images/listings/villa2.jpg',
  ],
  'cars': [
    '/images/listings/car1.jpg',
    '/images/listings/car2.jpg',
    '/images/listings/car1.jpg',
    '/images/listings/car2.jpg',
    '/images/listings/car1.jpg',
  ],
  'restaurants': [
    '/images/listings/restaurant1.jpg',
    '/images/listings/cafe1.jpg',
    '/images/listings/restaurant1.jpg',
    '/images/listings/cafe1.jpg',
    '/images/listings/restaurant1.jpg',
  ],
  'dining': [
    '/images/listings/restaurant1.jpg',
    '/images/listings/cafe1.jpg',
    '/images/listings/restaurant1.jpg',
    '/images/listings/cafe1.jpg',
    '/images/listings/restaurant1.jpg',
  ],
  'hotels': [
    '/images/listings/hotel1.jpg',
    '/images/listings/hotel1.jpg',
    '/images/listings/hotel1.jpg',
    '/images/listings/hotel1.jpg',
    '/images/listings/hotel1.jpg',
  ],
  'medical': [
    '/images/listings/medical1.jpg',
    '/images/listings/pharmacy1.jpg',
    '/images/listings/medical1.jpg',
    '/images/listings/pharmacy1.jpg',
    '/images/listings/medical1.jpg',
  ],
  'pharmacies': [
    '/images/listings/pharmacy1.jpg',
    '/images/listings/medical1.jpg',
    '/images/listings/pharmacy1.jpg',
    '/images/listings/medical1.jpg',
    '/images/listings/pharmacy1.jpg',
  ],
  'beauty': [
    '/images/listings/beauty1.jpg',
    '/images/listings/beauty1.jpg',
    '/images/listings/beauty1.jpg',
    '/images/listings/beauty1.jpg',
    '/images/listings/beauty1.jpg',
  ],
  'education': [
    '/images/listings/education1.jpg',
    '/images/listings/education1.jpg',
    '/images/listings/education1.jpg',
    '/images/listings/education1.jpg',
    '/images/listings/education1.jpg',
  ],
  'furniture': [
    '/images/listings/furniture1.jpg',
    '/images/listings/furniture1.jpg',
    '/images/listings/furniture1.jpg',
    '/images/listings/furniture1.jpg',
    '/images/listings/furniture1.jpg',
  ],
  'electronics': [
    '/images/listings/electronics1.jpg',
    '/images/listings/electronics1.jpg',
    '/images/listings/electronics1.jpg',
    '/images/listings/electronics1.jpg',
    '/images/listings/electronics1.jpg',
  ],
};

function getGalleryImages(category: string): string[] {
  if (CATEGORY_GALLERY_IMAGES[category]) {
    return CATEGORY_GALLERY_IMAGES[category];
  }
  // Fallback: use single category image repeated
  const fallback = getListingImages(category, 0);
  return [...fallback, ...fallback, ...fallback, ...fallback, ...fallback];
}

// ════════════════════════════════════════════════════════════════════
// Rating stars component
// ════════════════════════════════════════════════════════════════════

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
      <span className="text-sm font-medium text-gray-700 ms-1.5">{rating.toFixed(1)}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// Loading skeleton
// ════════════════════════════════════════════════════════════════════

function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-5">
      {/* Image skeleton */}
      <Skeleton className="h-[200px] w-full rounded-2xl" />

      {/* Title skeleton */}
      <Skeleton className="h-6 w-3/4" />

      {/* Price skeleton */}
      <Skeleton className="h-5 w-1/3" />

      {/* Category badge + rating skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Specs grid skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>

      {/* Description skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      {/* Location skeleton */}
      <Skeleton className="h-5 w-1/2" />

      {/* Contact buttons skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>

      {/* CTA skeleton */}
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// Sheet Content (keyed by listingId so all state resets automatically)
// ════════════════════════════════════════════════════════════════════

function SheetListingContent({ listingId }: { listingId: string }) {
  const { language, tAr } = useLanguage();
  const navigate = useNavigationStore((s) => s.navigate);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  // Fetch listing data
  const { data: listing, isLoading, isError } = useListing(listingId);

  // Description expand state — resets naturally because this component
  // is keyed by listingId (React unmounts/remounts on ID change)
  const [descExpanded, setDescExpanded] = useState(false);

  // Gallery images
  const galleryImages = useMemo(() => {
    if (!listing) return [];
    return getGalleryImages(listing.category);
  }, [listing]);

  // Simulated deterministic rating from listing ID
  const simulatedRating = useMemo(() => {
    if (!listing) return 4.0;
    const hash = listing.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return 3.5 + (hash % 15) / 10; // 3.5 – 5.0
  }, [listing]);

  // Favorite state
  const listingIsFavorite = isFavorite(listingId);

  const handleToggleFavorite = () => {
    if (!listing) return;
    if (listingIsFavorite) {
      removeFavorite(listingId);
    } else {
      addFavorite({
        id: listingId,
        title: listing.title,
        category: listing.category,
        price: listing.price,
        providerName: '',
        addedAt: new Date().toISOString(),
      });
    }
  };

  // Simulated phone number
  const phoneNumber = '+963-11-1234567';

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError || !listing) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-red-300" />
        </div>
        <p className="text-gray-500 font-medium">
          {tAr('لم يتم العثور على الإعلان', 'Listing not found')}
        </p>
        <p className="text-gray-400 text-sm">
          {tAr('قد يكون الإعلان محذوفاً أو غير متاح', 'The listing may be deleted or unavailable')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Image Gallery ── */}
      <div className="px-4 pt-4">
        <AsymmetricGallery
          images={galleryImages}
          title={listing.title}
        />
      </div>

      {/* ── Content Area ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 mt-4">
        {/* ── Quick Info ── */}
        <div>
          {/* Favorite + Title */}
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-900 leading-tight flex-1">
              {listing.title}
            </h2>
            <button
              onClick={handleToggleFavorite}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors shrink-0"
              aria-label={
                listingIsFavorite
                  ? tAr('إزالة من المفضلة', 'Remove from favorites')
                  : tAr('أضف للمفضلة', 'Add to favorites')
              }
            >
              <Heart
                className={`w-6 h-6 transition-all ${
                  listingIsFavorite
                    ? 'fill-rose-500 text-rose-500'
                    : 'text-gray-400 hover:text-rose-400'
                }`}
              />
            </button>
          </div>

          {/* Price */}
          <p className="text-lg font-bold text-emerald-600 mt-1">
            {formatPrice(listing.price, language)}
          </p>

          {/* Category Badge + Rating */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {getCategoryLabel(listing.category, language)}
            </Badge>
            <RatingStars rating={simulatedRating} />
          </div>
        </div>

        {/* ── Key Specs (2×2 grid) ── */}
        <div className="grid grid-cols-2 gap-2.5">
          {getSpecs(listing.category).map((spec, idx) => {
            const Icon = spec.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400 font-medium">
                    {language === 'ar' ? spec.ar : spec.en}
                  </p>
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {spec.getValue(listing)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Description ── */}
        {listing.description && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
              {tAr('الوصف', 'Description')}
            </h3>
            <p
              className={`text-sm text-gray-600 leading-relaxed ${
                !descExpanded ? 'line-clamp-2' : ''
              }`}
            >
              {listing.description}
            </p>
            {listing.description.length > 100 && (
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="text-emerald-600 text-sm font-medium mt-1 hover:text-emerald-700 transition-colors flex items-center gap-1"
              >
                {descExpanded
                  ? tAr('عرض أقل', 'Show less')
                  : tAr('عرض المزيد', 'Show more')}
                {descExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        )}

        {/* ── Location ── */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            {tAr('حي الورود، قدسيا', 'Al Waroud District, Qudsaya')}
          </span>
        </div>

        {/* ── Contact ── */}
        <div className="flex gap-2.5">
          <a
            href={`tel:${phoneNumber}`}
            className="flex-1"
          >
            <Button
              variant="outline"
              className="w-full gap-2 rounded-xl h-10"
            >
              <Phone className="w-4 h-4" />
              {tAr('اتصل', 'Call')}
            </Button>
          </a>
          <a
            href={`https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button
              className="w-full gap-2 rounded-xl h-10 bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="w-4 h-4" />
              {tAr('واتساب', 'WhatsApp')}
            </Button>
          </a>
        </div>
      </div>

      {/* ── CTA: View Full Details ── */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-white">
        <Button
          onClick={() => {
            navigate('listing-detail', { id: listingId });
          }}
          className="w-full h-12 rounded-xl text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          {tAr('عرض التفاصيل الكاملة', 'View Full Details')}
        </Button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// Main Component (Sheet wrapper)
// ════════════════════════════════════════════════════════════════════

export default function ListingDetailSheet({
  listingId,
  open,
  onOpenChange,
}: ListingDetailSheetProps) {
  const isMobile = useIsMobile();
  const { tAr } = useLanguage();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={
          isMobile
            ? 'h-[85vh] rounded-t-2xl overflow-y-auto p-0'
            : 'w-full sm:w-[480px] md:w-[540px] lg:w-[600px] h-full overflow-y-auto p-0'
        }
      >
        {/* Accessible title/description for screen readers */}
        <SheetHeader className="sr-only">
          <SheetTitle>
            {tAr('تفاصيل الإعلان', 'Listing Details')}
          </SheetTitle>
          <SheetDescription>
            {tAr('عرض تفاصيل الإعلان', 'View listing details')}
          </SheetDescription>
        </SheetHeader>

        {/* Keyed content — resets all local state when listingId changes */}
        {listingId ? (
          <SheetListingContent key={listingId} listingId={listingId} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium">
              {tAr('اختر إعلاناً لعرض التفاصيل', 'Select a listing to view details')}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
