'use client';

import { useLanguage } from '@/stores/languageStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Banknote, MapPin, Phone, Clock } from 'lucide-react';

const financialServices = [
  {
    id: '1',
    nameEn: 'Syrian Commercial Bank',
    nameAr: 'المصرف التجاري السوري',
    typeEn: 'Bank',
    typeAr: 'مصرف',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-6677889',
    hoursEn: '8 AM - 2 PM',
    hoursAr: '8 ص - 2 م',
  },
  {
    id: '2',
    nameEn: 'Al-Baraka Exchange',
    nameAr: 'صرافة البركة',
    typeEn: 'Exchange',
    typeAr: 'صرافة',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-7788990',
    hoursEn: '8 AM - 6 PM',
    hoursAr: '8 ص - 6 م',
  },
  {
    id: '3',
    nameEn: 'Western Union Agent',
    nameAr: 'وكيل ويسترن يونيون',
    typeEn: 'Money Transfer',
    typeAr: 'تحويل أموال',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-8899001',
    hoursEn: '9 AM - 5 PM',
    hoursAr: '9 ص - 5 م',
  },
  {
    id: '4',
    nameEn: 'Micro Finance Office',
    nameAr: 'مكتب التمويل الصغير',
    typeEn: 'Micro Finance',
    typeAr: 'تمويل صغير',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-9900112',
    hoursEn: '9 AM - 4 PM',
    hoursAr: '9 ص - 4 م',
  },
];

export default function FinancialServices() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Banknote className="w-5 h-5 text-red-500" />
        {isRTL ? 'الخدمات المالية' : 'Financial Services'}
      </h2>
      <div className="space-y-3">
        {financialServices.map((service) => (
          <Card key={service.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{isRTL ? service.nameAr : service.nameEn}</h3>
                  <Badge variant="secondary" className="text-xs mt-0.5">
                    {isRTL ? service.typeAr : service.typeEn}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 ms-13 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  {isRTL ? service.locationAr : service.locationEn}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {isRTL ? service.hoursAr : service.hoursEn}
                </span>
                <span
                  className="flex items-center gap-1.5 text-red-500 cursor-pointer"
                  onClick={() => window.open(`tel:${service.phone}`, '_self')}
                >
                  <Phone className="w-3 h-3" />
                  {service.phone}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
