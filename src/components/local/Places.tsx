'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Clock } from 'lucide-react';

const places = [
  {
    id: '1',
    nameEn: 'Qudsaya Old Bridge',
    nameAr: 'جسر قدسيا القديم',
    descEn: 'Historic Ottoman-era bridge with scenic river views.',
    descAr: 'جسر عثماني تاريخي بإطلالات نهرية خلابة.',
    locationEn: 'Riverside',
    locationAr: 'ضفاف النهر',
    rating: 4.7,
    categoryEn: 'Historical',
    categoryAr: 'أثري',
    hoursEn: 'Open 24h',
    hoursAr: 'مفتوح 24 ساعة',
  },
  {
    id: '2',
    nameEn: 'Central Park',
    nameAr: 'الحديقة المركزية',
    descEn: 'Family-friendly park with playground and walking paths.',
    descAr: 'حديقة عائلية مع ملعب ومسارات للمشي.',
    locationEn: 'City Center',
    locationAr: 'مركز المدينة',
    rating: 4.4,
    categoryEn: 'Park',
    categoryAr: 'حديقة',
    hoursEn: '6 AM - 10 PM',
    hoursAr: '6 ص - 10 م',
  },
  {
    id: '3',
    nameEn: 'Heritage Museum',
    nameAr: 'متحف التراث',
    descEn: 'Local heritage museum showcasing traditional crafts and artifacts.',
    descAr: 'متحف تراثي يعرض الحرف التقليدية والقطع الأثرية.',
    locationEn: 'Old Town',
    locationAr: 'المدينة القديمة',
    rating: 4.5,
    categoryEn: 'Museum',
    categoryAr: 'متحف',
    hoursEn: '9 AM - 5 PM',
    hoursAr: '9 ص - 5 م',
  },
];

export default function Places() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-red-500" />
        {isRTL ? 'الأماكن السياحية' : 'Places to Visit'}
      </h2>
      <div className="space-y-3">
        {places.map((place) => (
          <Card key={place.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="w-full h-32 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg flex items-center justify-center mb-3">
                <MapPin className="w-10 h-10 text-teal-300" />
              </div>
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-sm">{isRTL ? place.nameAr : place.nameEn}</h3>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{place.rating}</span>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs mb-1">
                {isRTL ? place.categoryAr : place.categoryEn}
              </Badge>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {isRTL ? place.descAr : place.descEn}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {isRTL ? place.locationAr : place.locationEn}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {isRTL ? place.hoursAr : place.hoursEn}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
