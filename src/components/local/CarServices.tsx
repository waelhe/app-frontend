'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, Wrench, MapPin, Phone } from 'lucide-react';

const carServices = [
  {
    id: '1',
    nameEn: 'Al-Safwa Auto Service',
    nameAr: 'مركز الصفوة للسيارات',
    typeEn: 'Full Service',
    typeAr: 'خدمة شاملة',
    locationEn: 'Industrial Zone',
    locationAr: 'المنطقة الصناعية',
    phone: '011-5555555',
    specialty: 'mechanic',
  },
  {
    id: '2',
    nameEn: 'Quick Wash Car Wash',
    nameAr: 'كويك واش لغسيل السيارات',
    typeEn: 'Car Wash',
    typeAr: 'غسيل سيارات',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-6666666',
    specialty: 'wash',
  },
  {
    id: '3',
    nameEn: 'Tire World',
    nameAr: 'عالم الإطارات',
    typeEn: 'Tires & Batteries',
    typeAr: 'إطارات وبطاريات',
    locationEn: 'Highway Road',
    locationAr: 'طريق السريع',
    phone: '011-7777777',
    specialty: 'tires',
  },
  {
    id: '4',
    nameEn: 'Pro Mechanics',
    nameAr: 'برو ميكانيك',
    typeEn: 'Engine & AC Repair',
    typeAr: 'صيانة محركات وتكييف',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-8888888',
    specialty: 'repair',
  },
];

export default function CarServices() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Car className="w-5 h-5 text-red-500" />
        {isRTL ? 'خدمات السيارات' : 'Car Services'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {carServices.map((service) => (
          <Card key={service.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  {service.specialty === 'wash' ? (
                    <Car className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Wrench className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{isRTL ? service.nameAr : service.nameEn}</h3>
                  <Badge variant="outline" className="text-xs mt-0.5">
                    {isRTL ? service.typeAr : service.typeEn}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <MapPin className="w-3 h-3" />
                {isRTL ? service.locationAr : service.locationEn}
              </div>
              <div
                className="flex items-center gap-1.5 text-xs text-red-500 cursor-pointer"
                onClick={() => window.open(`tel:${service.phone}`, '_self')}
              >
                <Phone className="w-3 h-3" />
                {service.phone}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
