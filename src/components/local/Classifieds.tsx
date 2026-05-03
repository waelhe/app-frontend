'use client';

import { useLanguage } from '@/stores/languageStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Newspaper, MapPin, Clock, User } from 'lucide-react';

const classifieds = [
  {
    id: '1',
    titleEn: 'Apartment for Rent - 2 Rooms',
    titleAr: 'شقة للإيجار - غرفتين',
    categoryEn: 'Real Estate',
    categoryAr: 'عقارات',
    priceEn: '300,000 SYP/mo',
    priceAr: '300,000 ل.س/شهر',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    posted: '1 hour ago',
    sellerEn: 'Abu Ahmad',
    sellerAr: 'أبو أحمد',
  },
  {
    id: '2',
    titleEn: 'Home Tutor Available',
    titleAr: 'معلم خصوصي متاح',
    categoryEn: 'Services',
    categoryAr: 'خدمات',
    priceEn: '5,000 SYP/hr',
    priceAr: '5,000 ل.س/ساعة',
    locationEn: 'Citywide',
    locationAr: 'أنحاء المدينة',
    posted: '3 hours ago',
    sellerEn: 'M. Khaled',
    sellerAr: 'م. خالد',
  },
  {
    id: '3',
    titleEn: 'Used Washing Machine',
    titleAr: 'غسالة مستعملة',
    categoryEn: 'For Sale',
    categoryAr: 'للبيع',
    priceEn: '150,000 SYP',
    priceAr: '150,000 ل.س',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    posted: '1 day ago',
    sellerEn: 'Um Hassan',
    sellerAr: 'أم حسن',
  },
  {
    id: '4',
    titleEn: 'Car for Sale - 2018 Model',
    titleAr: 'سيارة للبيع - موديل 2018',
    categoryEn: 'Vehicles',
    categoryAr: 'مركبات',
    priceEn: '25,000,000 SYP',
    priceAr: '25,000,000 ل.س',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    posted: '2 days ago',
    sellerEn: 'Youssef',
    sellerAr: 'يوسف',
  },
];

export default function Classifieds() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Newspaper className="w-5 h-5 text-red-500" />
        {isRTL ? 'الإعلانات المبوبة' : 'Classifieds'}
      </h2>
      <div className="space-y-3">
        {classifieds.map((ad) => (
          <Card key={ad.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-sm">{isRTL ? ad.titleAr : ad.titleEn}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {isRTL ? ad.categoryAr : ad.categoryEn}
                    </Badge>
                    <span className="text-red-600 font-bold text-xs">{isRTL ? ad.priceAr : ad.priceEn}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {isRTL ? ad.locationAr : ad.locationEn}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {ad.posted}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {isRTL ? ad.sellerAr : ad.sellerEn}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
