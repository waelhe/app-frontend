'use client';

import { useLanguage } from '@/stores/languageStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag, Percent, Clock, MapPin } from 'lucide-react';

const offers = [
  {
    id: '1',
    titleEn: 'Buy 1 Get 1 Free',
    titleAr: 'اشترِ 1 واحصل على 1 مجاناً',
    storeEn: 'Al-Madina Market',
    storeAr: 'سوق المدينة',
    discount: '50%',
    validUntil: '2025-04-15',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
  },
  {
    id: '2',
    titleEn: '20% Off All Services',
    titleAr: 'خصم 20% على جميع الخدمات',
    storeEn: 'Glamour Salon',
    storeAr: 'صالون غلامور',
    discount: '20%',
    validUntil: '2025-04-20',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
  },
  {
    id: '3',
    titleEn: 'Free Delivery This Week',
    titleAr: 'توصيل مجاني هذا الأسبوع',
    storeEn: 'Fresh Fruits Market',
    storeAr: 'سوق الفواكه الطازجة',
    discount: 'Free',
    validUntil: '2025-04-10',
    locationEn: 'Old Market Area',
    locationAr: 'منطقة السوق القديم',
  },
  {
    id: '4',
    titleEn: 'Grand Opening: 30% Off',
    titleAr: 'افتتاح كبير: خصم 30%',
    storeEn: 'Tech Hub',
    storeAr: 'تك هب',
    discount: '30%',
    validUntil: '2025-05-01',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
  },
];

export default function Offers() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Tag className="w-5 h-5 text-red-500" />
        {isRTL ? 'العروض والصفقات' : 'Offers & Deals'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {offers.map((offer) => (
          <Card key={offer.id} className="hover:shadow-md transition-shadow cursor-pointer border-red-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <Percent className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{isRTL ? offer.titleAr : offer.titleEn}</h3>
                  <p className="text-xs text-muted-foreground">{isRTL ? offer.storeAr : offer.storeEn}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge className="bg-red-500 text-white text-sm px-3">
                  {offer.discount}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {isRTL ? `حتى ${offer.validUntil}` : `Until ${offer.validUntil}`}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {isRTL ? offer.locationAr : offer.locationEn}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
