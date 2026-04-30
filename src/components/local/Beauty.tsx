'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scissors, Star, MapPin, Clock } from 'lucide-react';

const beautySalons = [
  {
    id: '1',
    nameEn: 'Glamour Beauty Salon',
    nameAr: 'صالون غلامور للجمال',
    rating: 4.7,
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    hoursEn: '9 AM - 9 PM',
    hoursAr: '9 ص - 9 م',
    servicesEn: 'Hair, Nails, Makeup',
    servicesAr: 'شعر، أظافر، مكياج',
  },
  {
    id: '2',
    nameEn: 'Rose Spa & Salon',
    nameAr: 'سبا وروز صالون',
    rating: 4.9,
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    hoursEn: '10 AM - 10 PM',
    hoursAr: '10 ص - 10 م',
    servicesEn: 'Spa, Massage, Facials',
    servicesAr: 'سبا، مساج، بشرة',
  },
  {
    id: '3',
    nameEn: 'Elegant Cuts',
    nameAr: 'إليغانت كاتس',
    rating: 4.4,
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    hoursEn: '8 AM - 8 PM',
    hoursAr: '8 ص - 8 م',
    servicesEn: 'Haircuts, Styling',
    servicesAr: 'قص، تسريحات',
  },
];

export default function Beauty() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Scissors className="w-5 h-5 text-red-500" />
        {isRTL ? 'الجمال والعناية' : 'Beauty & Wellness'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {beautySalons.map((salon) => (
          <Card key={salon.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="w-full h-24 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg flex items-center justify-center mb-3">
                <Scissors className="w-8 h-8 text-pink-300" />
              </div>
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-sm">{isRTL ? salon.nameAr : salon.nameEn}</h3>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{salon.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <MapPin className="w-3 h-3" />
                {isRTL ? salon.locationAr : salon.locationEn}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <Clock className="w-3 h-3" />
                {isRTL ? salon.hoursAr : salon.hoursEn}
              </div>
              <Badge variant="secondary" className="text-xs">
                {isRTL ? salon.servicesAr : salon.servicesEn}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
