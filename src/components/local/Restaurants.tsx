'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Utensils, Star, MapPin } from 'lucide-react';

const categories = [
  { id: 'fast', labelEn: 'Fast Food', labelAr: 'وجبات سريعة' },
  { id: 'fine', labelEn: 'Fine Dining', labelAr: 'مطاعم فاخرة' },
  { id: 'grill', labelEn: 'Grills', labelAr: 'مشاوي' },
  { id: 'seafood', labelEn: 'Seafood', labelAr: 'مأكولات بحرية' },
];

const restaurants = [
  {
    id: '1',
    nameEn: 'Damascus Grill',
    nameAr: 'مشاوي دمشق',
    category: 'grill',
    rating: 4.5,
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    priceRange: '$$',
  },
  {
    id: '2',
    nameEn: 'Burger Town',
    nameAr: 'برجر تاون',
    category: 'fast',
    rating: 4.0,
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    priceRange: '$',
  },
  {
    id: '3',
    nameEn: 'Al-Sham Palace',
    nameAr: 'قصر الشام',
    category: 'fine',
    rating: 4.8,
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    priceRange: '$$$',
  },
  {
    id: '4',
    nameEn: 'Sea Breeze',
    nameAr: 'نسيم البحر',
    category: 'seafood',
    rating: 4.3,
    locationEn: 'Riverside Road',
    locationAr: 'طريق النهر',
    priceRange: '$$',
  },
];

export default function Restaurants() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Utensils className="w-5 h-5 text-red-500" />
        {isRTL ? 'المطاعم' : 'Restaurants'}
      </h2>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {categories.map((cat) => (
          <Badge key={cat.id} variant="secondary" className="cursor-pointer hover:bg-red-100 transition-colors px-3 py-1">
            {isRTL ? cat.labelAr : cat.labelEn}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {restaurants.map((restaurant) => (
          <Card key={restaurant.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="w-full h-28 bg-muted rounded-lg flex items-center justify-center mb-3">
                <Utensils className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-sm">
                  {isRTL ? restaurant.nameAr : restaurant.nameEn}
                </h3>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{restaurant.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <MapPin className="w-3 h-3" />
                {isRTL ? restaurant.locationAr : restaurant.locationEn}
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {categories.find((c) => c.id === restaurant.category)
                    ? isRTL
                      ? categories.find((c) => c.id === restaurant.category)!.labelAr
                      : categories.find((c) => c.id === restaurant.category)!.labelEn
                    : restaurant.category}
                </Badge>
                <span className="text-xs text-muted-foreground">{restaurant.priceRange}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
