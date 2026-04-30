'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bus, Car, Phone, MapPin, Clock } from 'lucide-react';

const transportServices = [
  {
    id: '1',
    nameEn: 'City Bus Terminal',
    nameAr: 'محطة حافلات المدينة',
    typeEn: 'Bus',
    typeAr: 'حافلات',
    locationEn: 'Central Station',
    locationAr: 'المحطة المركزية',
    phone: '011-4455667',
    hoursEn: '5 AM - 11 PM',
    hoursAr: '5 ص - 11 م',
    icon: Bus,
  },
  {
    id: '2',
    nameEn: 'Al-Safwa Taxi',
    nameAr: 'تاكسي الصفوة',
    typeEn: 'Taxi',
    typeAr: 'تاكسي',
    locationEn: 'Citywide',
    locationAr: 'أنحاء المدينة',
    phone: '011-5566778',
    hoursEn: '24 Hours',
    hoursAr: '24 ساعة',
    icon: Car,
  },
  {
    id: '3',
    nameEn: 'RideShare Service',
    nameAr: 'خدمة المشاركة بالنقل',
    typeEn: 'Ride Share',
    typeAr: 'نقل مشترك',
    locationEn: 'App-based',
    locationAr: 'عبر التطبيق',
    phone: '011-6677889',
    hoursEn: '24 Hours',
    hoursAr: '24 ساعة',
    icon: Car,
  },
  {
    id: '4',
    nameEn: 'Mini Bus Service',
    nameAr: 'خدمة الميني باص',
    typeEn: 'Mini Bus',
    typeAr: 'ميني باص',
    locationEn: 'Multiple Routes',
    locationAr: 'مسارات متعددة',
    phone: '011-7788990',
    hoursEn: '6 AM - 10 PM',
    hoursAr: '6 ص - 10 م',
    icon: Bus,
  },
];

export default function Transport() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Bus className="w-5 h-5 text-red-500" />
        {isRTL ? 'النقل والمواصلات' : 'Transport'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {transportServices.map((service) => {
          const Icon = service.icon;
          return (
            <Card key={service.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{isRTL ? service.nameAr : service.nameEn}</h3>
                    <Badge variant="outline" className="text-xs mt-0.5">
                      {isRTL ? service.typeAr : service.typeEn}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground ms-13">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    {isRTL ? service.locationAr : service.locationEn}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {isRTL ? service.hoursAr : service.hoursEn}
                  </div>
                  <div
                    className="flex items-center gap-1.5 text-red-500 cursor-pointer"
                    onClick={() => window.open(`tel:${service.phone}`, '_self')}
                  >
                    <Phone className="w-3 h-3" />
                    {service.phone}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
