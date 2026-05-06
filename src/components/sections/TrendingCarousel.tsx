'use client';

import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { ListingCard } from '@/components/ui/ListingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/stores/languageStore';
import { useListings } from '@/hooks/useApi';

interface TrendingCarouselProps {
  titleAr?: string;
  titleEn?: string;
  subtitleAr?: string;
  subtitleEn?: string;
}

export default function TrendingCarousel({
  titleAr = 'الأكثر رواجاً',
  titleEn = 'Trending Now',
  subtitleAr = 'إعلانات رائجة في المنطقة',
  subtitleEn = 'Popular listings in the area',
}: TrendingCarouselProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const t = (ar: string, en: string) => (isArabic ? ar : en);

  const { data, isLoading } = useListings({ page: 0, size: 12 });

  const listings = data?.content || [];

  return (
    <section className="py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900">
              {t(titleAr, titleEn)}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {t(subtitleAr, subtitleEn)}
            </p>
          </div>
        </div>

        {/* Carousel */}
        <Carousel
          opts={{
            align: 'start',
            direction: isArabic ? 'rtl' : 'ltr',
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <CarouselItem key={i} className="pl-4 basis-[260px] sm:basis-[280px] md:basis-[300px]">
                    <div className="space-y-3">
                      <Skeleton className="h-[220px] w-full rounded-xl" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </CarouselItem>
                ))
              : listings.map((listing: any) => (
                  <CarouselItem key={listing.id} className="pl-4 basis-[260px] sm:basis-[280px] md:basis-[300px]">
                    <ListingCard
                      id={listing.id}
                      title={listing.title}
                      category={listing.category}
                      price={listing.price}
                      providerName={listing.providerName || listing.provider?.displayName}
                      subtitle={listing.subtitle || listing.description?.substring(0, 60)}
                      rating={listing.averageRating}
                      reviewCount={listing.reviewCount}
                      isFavorite={false}
                      onClick={() => {}}
                      onToggleFavorite={() => {}}
                      images={listing.images}
                      features={listing.features}
                    />
                  </CarouselItem>
                ))
            }
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -start-4" />
          <CarouselNext className="hidden md:flex -end-4" />
        </Carousel>
      </div>
    </section>
  );
}
