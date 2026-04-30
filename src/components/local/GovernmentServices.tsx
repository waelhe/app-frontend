'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Landmark, MapPin, Phone, Clock } from 'lucide-react';

const govServices = [
  {
    id: '1',
    nameEn: 'Qudsaya Municipality',
    nameAr: 'بلدية قدسيا',
    typeEn: 'Municipality',
    typeAr: 'بلدية',
    locationEn: 'City Center',
    locationAr: 'مركز المدينة',
    phone: '011-1231231',
    hoursEn: '8 AM - 3 PM',
    hoursAr: '8 ص - 3 م',
  },
  {
    id: '2',
    nameEn: 'Civil Registry Office',
    nameAr: 'دائرة الأحوال المدنية',
    typeEn: 'Civil Registry',
    typeAr: 'أحوال مدنية',
    locationEn: 'Government Complex',
    locationAr: 'مجمع الحكومة',
    phone: '011-2342342',
    hoursEn: '8 AM - 2 PM',
    hoursAr: '8 ص - 2 م',
  },
  {
    id: '3',
    nameEn: 'Traffic Department',
    nameAr: 'مديرية النقل',
    typeEn: 'Traffic',
    typeAr: 'نقل ومرور',
    locationEn: 'Highway Road',
    locationAr: 'طريق السريع',
    phone: '011-3453453',
    hoursEn: '8 AM - 2 PM',
    hoursAr: '8 ص - 2 م',
  },
  {
    id: '4',
    nameEn: 'Post Office',
    nameAr: 'مكتب البريد',
    typeEn: 'Post Office',
    typeAr: 'بريد',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-4564564',
    hoursEn: '8 AM - 4 PM',
    hoursAr: '8 ص - 4 م',
  },
];

export default function GovernmentServices() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Landmark className="w-5 h-5 text-red-500" />
        {isRTL ? 'الخدمات الحكومية' : 'Government Services'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {govServices.map((service) => (
          <Card key={service.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <Landmark className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{isRTL ? service.nameAr : service.nameEn}</h3>
                  <Badge variant="secondary" className="text-xs mt-0.5">
                    {isRTL ? service.typeAr : service.typeEn}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1 ms-13 text-xs text-muted-foreground">
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
        ))}
      </div>
    </section>
  );
}
