'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, MapPin, Clock, Phone } from 'lucide-react';

const markets = [
  {
    id: '1',
    nameEn: 'Al-Madina Supermarket',
    nameAr: 'سوبرماركت المدينة',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-3213213',
    hoursEn: '7 AM - 11 PM',
    hoursAr: '7 ص - 11 م',
    typeEn: 'Supermarket',
    typeAr: 'سوبرماركت',
  },
  {
    id: '2',
    nameEn: 'Al-Baraka Market',
    nameAr: 'سوق البركة',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-4324324',
    hoursEn: '6 AM - 10 PM',
    hoursAr: '6 ص - 10 م',
    typeEn: 'Grocery',
    typeAr: 'بقالة',
  },
  {
    id: '3',
    nameEn: 'Fresh Fruits Market',
    nameAr: 'سوق الفواكه الطازجة',
    locationEn: 'Old Market Area',
    locationAr: 'منطقة السوق القديم',
    phone: '011-5435435',
    hoursEn: '5 AM - 8 PM',
    hoursAr: '5 ص - 8 م',
    typeEn: 'Fruits & Vegetables',
    typeAr: 'خضار وفواكه',
  },
  {
    id: '4',
    nameEn: 'Butcher Shop Al-Safa',
    nameAr: 'ملحمة الصفا',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-6546546',
    hoursEn: '7 AM - 9 PM',
    hoursAr: '7 ص - 9 م',
    typeEn: 'Butcher',
    typeAr: 'ملحمة',
  },
];

export default function Markets() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-red-500" />
        {isRTL ? 'الأسواق' : 'Markets'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {markets.map((market) => (
          <Card key={market.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{isRTL ? market.nameAr : market.nameEn}</h3>
                  <Badge variant="secondary" className="text-xs mt-0.5">
                    {isRTL ? market.typeAr : market.typeEn}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1 ms-13 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  {isRTL ? market.locationAr : market.locationEn}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {isRTL ? market.hoursAr : market.hoursEn}
                </div>
                <div
                  className="flex items-center gap-1.5 text-red-500 cursor-pointer"
                  onClick={() => window.open(`tel:${market.phone}`, '_self')}
                >
                  <Phone className="w-3 h-3" />
                  {market.phone}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
