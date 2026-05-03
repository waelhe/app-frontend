'use client';

import { useLanguage } from '@/stores/languageStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, MapPin, Clock, Phone } from 'lucide-react';

const retailShops = [
  {
    id: '1',
    nameEn: 'Fashion House',
    nameAr: 'بيت الأزياء',
    categoryEn: 'Clothing',
    categoryAr: 'ملابس',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-7657657',
    hoursEn: '10 AM - 9 PM',
    hoursAr: '10 ص - 9 م',
  },
  {
    id: '2',
    nameEn: 'Tech Zone',
    nameAr: 'تك زون',
    categoryEn: 'Electronics',
    categoryAr: 'إلكترونيات',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-8768768',
    hoursEn: '9 AM - 10 PM',
    hoursAr: '9 ص - 10 م',
  },
  {
    id: '3',
    nameEn: 'Home Decor Plus',
    nameAr: 'هوم دييكور بلس',
    categoryEn: 'Home & Decor',
    categoryAr: 'منزل وديكور',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-9879879',
    hoursEn: '10 AM - 8 PM',
    hoursAr: '10 ص - 8 م',
  },
  {
    id: '4',
    nameEn: 'Kids World',
    nameAr: 'عالم الأطفال',
    categoryEn: 'Kids & Toys',
    categoryAr: 'أطفال وألعاب',
    locationEn: 'Riverside Mall',
    locationAr: 'مول ريفرسايد',
    phone: '011-0980980',
    hoursEn: '10 AM - 10 PM',
    hoursAr: '10 ص - 10 م',
  },
];

export default function RetailShops() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Store className="w-5 h-5 text-red-500" />
        {isRTL ? 'المتاجر التجارية' : 'Retail Shops'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {retailShops.map((shop) => (
          <Card key={shop.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="w-full h-24 bg-muted rounded-lg flex items-center justify-center mb-3">
                <Store className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-sm">{isRTL ? shop.nameAr : shop.nameEn}</h3>
                <Badge variant="outline" className="text-xs shrink-0 ms-1">
                  {isRTL ? shop.categoryAr : shop.categoryEn}
                </Badge>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  {isRTL ? shop.locationAr : shop.locationEn}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {isRTL ? shop.hoursAr : shop.hoursEn}
                </div>
                <div
                  className="flex items-center gap-1.5 text-red-500 cursor-pointer"
                  onClick={() => window.open(`tel:${shop.phone}`, '_self')}
                >
                  <Phone className="w-3 h-3" />
                  {shop.phone}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
