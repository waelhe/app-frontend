'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BedDouble, Star, MapPin, Phone } from 'lucide-react';

const hotels = [
  {
    id: '1',
    nameEn: 'Qudsaya Grand Hotel',
    nameAr: 'فندق قدسيا الكبير',
    rating: 4.5,
    priceFrom: '25,000',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-1112233',
    amenitiesEn: ['WiFi', 'Parking', 'Restaurant'],
    amenitiesAr: ['واي فاي', 'موقف سيارات', 'مطعم'],
  },
  {
    id: '2',
    nameEn: 'Riverside Inn',
    nameAr: 'نزل ريفرسايد',
    rating: 4.2,
    priceFrom: '15,000',
    locationEn: 'Riverside Road',
    locationAr: 'طريق النهر',
    phone: '011-2223344',
    amenitiesEn: ['WiFi', 'AC'],
    amenitiesAr: ['واي فاي', 'تكييف'],
  },
  {
    id: '3',
    nameEn: 'Al-Raeda Suites',
    nameAr: 'أجنحة الرائدة',
    rating: 4.8,
    priceFrom: '40,000',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-3334455',
    amenitiesEn: ['WiFi', 'Pool', 'Gym', 'Spa'],
    amenitiesAr: ['واي فاي', 'مسبح', 'صالة رياضية', 'سبا'],
  },
];

export default function Hotels() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <BedDouble className="w-5 h-5 text-red-500" />
        {isRTL ? 'الفنادق' : 'Hotels'}
      </h2>
      <div className="space-y-3">
        {hotels.map((hotel) => (
          <Card key={hotel.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="w-full h-28 bg-muted rounded-lg flex items-center justify-center mb-3">
                <BedDouble className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm">{isRTL ? hotel.nameAr : hotel.nameEn}</h3>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{hotel.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <MapPin className="w-3 h-3" />
                {isRTL ? hotel.locationAr : hotel.locationEn}
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {(isRTL ? hotel.amenitiesAr : hotel.amenitiesEn).map((amenity, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-600 font-bold text-sm">
                  {isRTL ? 'من' : 'From'} {hotel.priceFrom} SYP
                </span>
                <span
                  className="flex items-center gap-1 text-xs text-red-500 cursor-pointer"
                  onClick={() => window.open(`tel:${hotel.phone}`, '_self')}
                >
                  <Phone className="w-3 h-3" />
                  {hotel.phone}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
