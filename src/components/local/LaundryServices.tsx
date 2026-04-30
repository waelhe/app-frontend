'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WashingMachine, MapPin, Phone, Clock } from 'lucide-react';

const laundryServices = [
  {
    id: '1',
    nameEn: 'Clean Star Laundry',
    nameAr: 'مغسلة نجمة النظافة',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-9019019',
    hoursEn: '7 AM - 9 PM',
    hoursAr: '7 ص - 9 م',
    serviceEn: 'Wash & Iron',
    serviceAr: 'غسيل وكوي',
    delivery: true,
  },
  {
    id: '2',
    nameEn: 'Fresh Dry Clean',
    nameAr: 'فريش دراي كلين',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-0120120',
    hoursEn: '8 AM - 8 PM',
    hoursAr: '8 ص - 8 م',
    serviceEn: 'Dry Cleaning',
    serviceAr: 'تنظيف جاف',
    delivery: false,
  },
  {
    id: '3',
    nameEn: 'Express Wash',
    nameAr: 'إكسبرس واش',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-1231231',
    hoursEn: '6 AM - 10 PM',
    hoursAr: '6 ص - 10 م',
    serviceEn: 'Express Service',
    serviceAr: 'خدمة سريعة',
    delivery: true,
  },
];

export default function LaundryServices() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <WashingMachine className="w-5 h-5 text-red-500" />
        {isRTL ? 'خدمات الغسيل' : 'Laundry Services'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {laundryServices.map((laundry) => (
          <Card key={laundry.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <WashingMachine className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{isRTL ? laundry.nameAr : laundry.nameEn}</h3>
                  <Badge variant="outline" className="text-xs mt-0.5">
                    {isRTL ? laundry.serviceAr : laundry.serviceEn}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1 ms-13 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  {isRTL ? laundry.locationAr : laundry.locationEn}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {isRTL ? laundry.hoursAr : laundry.hoursEn}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="flex items-center gap-1.5 text-red-500 cursor-pointer"
                    onClick={() => window.open(`tel:${laundry.phone}`, '_self')}
                  >
                    <Phone className="w-3 h-3" />
                    {laundry.phone}
                  </span>
                  {laundry.delivery && (
                    <Badge variant="secondary" className="text-xs">
                      {isRTL ? 'توصيل' : 'Delivery'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
