'use client';

import { useLanguage } from '@/stores/languageStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, MapPin, Phone, Clock } from 'lucide-react';

const sportsCenters = [
  {
    id: '1',
    nameEn: 'Power Gym',
    nameAr: 'باور جيم',
    typeEn: 'Gym',
    typeAr: 'صالة رياضية',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-6767676',
    hoursEn: '6 AM - 11 PM',
    hoursAr: '6 ص - 11 م',
  },
  {
    id: '2',
    nameEn: 'Olympic Sports Club',
    nameAr: 'نادي الأولمبي الرياضي',
    typeEn: 'Sports Club',
    typeAr: 'نادي رياضي',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-7878787',
    hoursEn: '7 AM - 10 PM',
    hoursAr: '7 ص - 10 م',
  },
  {
    id: '3',
    nameEn: 'Aqua Swimming Pool',
    nameAr: 'مسبح أكوا',
    typeEn: 'Swimming',
    typeAr: 'سباحة',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-8989898',
    hoursEn: '8 AM - 9 PM',
    hoursAr: '8 ص - 9 م',
  },
  {
    id: '4',
    nameEn: 'Karate Academy',
    nameAr: 'أكاديمية الكاراتيه',
    typeEn: 'Martial Arts',
    typeAr: 'فنون قتالية',
    locationEn: 'Riverside Road',
    locationAr: 'طريق النهر',
    phone: '011-9090909',
    hoursEn: '4 PM - 9 PM',
    hoursAr: '4 م - 9 م',
  },
];

export default function Sports() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Dumbbell className="w-5 h-5 text-red-500" />
        {isRTL ? 'الرياضة واللياقة' : 'Sports & Fitness'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sportsCenters.map((center) => (
          <Card key={center.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="w-full h-20 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg flex items-center justify-center mb-3">
                <Dumbbell className="w-8 h-8 text-emerald-300" />
              </div>
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-sm">{isRTL ? center.nameAr : center.nameEn}</h3>
                <Badge variant="outline" className="text-xs shrink-0 ms-1">
                  {isRTL ? center.typeAr : center.typeEn}
                </Badge>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  {isRTL ? center.locationAr : center.locationEn}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {isRTL ? center.hoursAr : center.hoursEn}
                </div>
                <div
                  className="flex items-center gap-1.5 text-red-500 cursor-pointer"
                  onClick={() => window.open(`tel:${center.phone}`, '_self')}
                >
                  <Phone className="w-3 h-3" />
                  {center.phone}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
