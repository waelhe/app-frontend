'use client';

import { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Tag, Percent } from 'lucide-react';

const offers = [
  {
    id: '1',
    titleEn: 'Super Market Sale',
    titleAr: 'تخفيضات السوبر ماركت',
    storeEn: 'Al-Madina Market',
    storeAr: 'سوق المدينة',
    discount: 30,
    validUntil: '2025-04-30',
  },
  {
    id: '2',
    titleEn: 'Restaurant Week Special',
    titleAr: 'عروض أسبوع المطاعم',
    storeEn: 'Damascus Grill',
    storeAr: 'مشاوي دمشق',
    discount: 25,
    validUntil: '2025-04-15',
  },
  {
    id: '3',
    titleEn: 'Electronics Flash Sale',
    titleAr: 'تخفيضات الإلكترونيات',
    storeEn: 'Tech Hub',
    storeAr: 'تك هب',
    discount: 40,
    validUntil: '2025-04-10',
  },
  {
    id: '4',
    titleEn: 'Beauty Package Deal',
    titleAr: 'عرض باقات الجمال',
    storeEn: 'Glamour Salon',
    storeAr: 'صالون غلامور',
    discount: 20,
    validUntil: '2025-05-01',
  },
  {
    id: '5',
    titleEn: 'Home Furniture Clearance',
    titleAr: 'تصفية أثاث المنزل',
    storeEn: 'Home Style',
    storeAr: 'ستايل هوم',
    discount: 50,
    validUntil: '2025-04-20',
  },
];

export default function FeaturedOffers() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 280;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Tag className="w-5 h-5 text-red-500" />
          {isRTL ? 'العروض المميزة' : 'Featured Offers'}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll(isRTL ? 'right' : 'left')}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
          >
            {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            onClick={() => scroll(isRTL ? 'left' : 'right')}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
          >
            {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {offers.map((offer) => (
          <Card
            key={offer.id}
            className="shrink-0 w-64 snap-start hover:shadow-md transition-shadow cursor-pointer"
          >
            <CardContent className="p-4">
              <div className="w-full h-28 bg-gradient-to-br from-red-50 to-red-100 rounded-lg flex items-center justify-center mb-3 relative">
                <Percent className="w-10 h-10 text-red-300" />
                <Badge className="absolute top-2 end-2 bg-red-500 text-white text-xs">
                  -{offer.discount}%
                </Badge>
              </div>
              <h3 className="font-semibold text-sm mb-1">
                {isRTL ? offer.titleAr : offer.titleEn}
              </h3>
              <p className="text-xs text-muted-foreground mb-1">
                {isRTL ? offer.storeAr : offer.storeEn}
              </p>
              <p className="text-xs text-muted-foreground">
                {isRTL ? `صالح حتى: ${offer.validUntil}` : `Valid until: ${offer.validUntil}`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
