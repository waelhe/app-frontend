'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coffee, Star, MapPin, Clock } from 'lucide-react';

const cafes = [
  {
    id: '1',
    nameEn: 'Café Latte House',
    nameAr: 'كافيه لاتيه هاوس',
    rating: 4.6,
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    hoursEn: '7 AM - 12 AM',
    hoursAr: '7 ص - 12 م',
    specialtyEn: 'Specialty Coffee',
    specialtyAr: 'قهوة مختصة',
  },
  {
    id: '2',
    nameEn: 'Tea Garden',
    nameAr: 'حديقة الشاي',
    rating: 4.3,
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    hoursEn: '8 AM - 11 PM',
    hoursAr: '8 ص - 11 م',
    specialtyEn: 'Herbal Tea',
    specialtyAr: 'شاي أعشاب',
  },
  {
    id: '3',
    nameEn: 'Bean & Brew',
    nameAr: 'بين آند برو',
    rating: 4.8,
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    hoursEn: '6 AM - 1 AM',
    hoursAr: '6 ص - 1 م',
    specialtyEn: 'Cold Brew',
    specialtyAr: 'كولد برو',
  },
  {
    id: '4',
    nameEn: 'Oasis Café',
    nameAr: 'كافيه الواحة',
    rating: 4.1,
    locationEn: 'Riverside Road',
    locationAr: 'طريق النهر',
    hoursEn: '9 AM - 10 PM',
    hoursAr: '9 ص - 10 م',
    specialtyEn: 'Arabic Coffee',
    specialtyAr: 'قهوة عربية',
  },
];

export default function Cafes() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Coffee className="w-5 h-5 text-red-500" />
        {isRTL ? 'المقاهي' : 'Cafes'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cafes.map((cafe) => (
          <Card key={cafe.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="w-full h-24 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg flex items-center justify-center mb-3">
                <Coffee className="w-8 h-8 text-amber-300" />
              </div>
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-sm">{isRTL ? cafe.nameAr : cafe.nameEn}</h3>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{cafe.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <MapPin className="w-3 h-3" />
                {isRTL ? cafe.locationAr : cafe.locationEn}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <Clock className="w-3 h-3" />
                {isRTL ? cafe.hoursAr : cafe.hoursEn}
              </div>
              <Badge variant="secondary" className="text-xs">
                {isRTL ? cafe.specialtyAr : cafe.specialtyEn}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
