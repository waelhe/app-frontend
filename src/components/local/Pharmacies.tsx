'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pill, Clock, MapPin, Phone } from 'lucide-react';

const pharmacies = [
  {
    id: '1',
    nameEn: 'Al-Hayat Pharmacy',
    nameAr: 'صيدلية الحياة',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-1111111',
    onDuty: true,
    hoursEn: '24 Hours',
    hoursAr: '24 ساعة',
  },
  {
    id: '2',
    nameEn: 'Al-Noor Pharmacy',
    nameAr: 'صيدلية النور',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-2222222',
    onDuty: false,
    hoursEn: '8 AM - 10 PM',
    hoursAr: '8 ص - 10 م',
  },
  {
    id: '3',
    nameEn: 'Shifa Pharmacy',
    nameAr: 'صيدلية الشفاء',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-3333333',
    onDuty: true,
    hoursEn: '24 Hours',
    hoursAr: '24 ساعة',
  },
  {
    id: '4',
    nameEn: 'Al-Salam Pharmacy',
    nameAr: 'صيدلية السلام',
    locationEn: 'Riverside Road',
    locationAr: 'طريق النهر',
    phone: '011-4444444',
    onDuty: false,
    hoursEn: '9 AM - 9 PM',
    hoursAr: '9 ص - 9 م',
  },
];

export default function Pharmacies() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Pill className="w-5 h-5 text-red-500" />
        {isRTL ? 'الصيدليات' : 'Pharmacies'}
      </h2>

      <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
        <p className="text-sm font-medium text-green-700 flex items-center gap-2">
          <Pill className="w-4 h-4" />
          {isRTL ? 'الصيدلية المناوبة الليلة' : 'Tonight\'s On-Duty Pharmacy'}
        </p>
      </div>

      <div className="space-y-3">
        {pharmacies.map((pharmacy) => (
          <Card
            key={pharmacy.id}
            className={`hover:shadow-md transition-shadow ${pharmacy.onDuty ? 'border-green-300' : ''}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${pharmacy.onDuty ? 'bg-green-50' : 'bg-muted'}`}>
                    <Pill className={`w-5 h-5 ${pharmacy.onDuty ? 'text-green-500' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {isRTL ? pharmacy.nameAr : pharmacy.nameEn}
                    </h3>
                  </div>
                </div>
                {pharmacy.onDuty && (
                  <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                    {isRTL ? 'مناوبة' : 'On Duty'}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground ms-12">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {isRTL ? pharmacy.hoursAr : pharmacy.hoursEn}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {isRTL ? pharmacy.locationAr : pharmacy.locationEn}
                </span>
                <span
                  className="flex items-center gap-1 text-red-500 cursor-pointer"
                  onClick={() => window.open(`tel:${pharmacy.phone}`, '_self')}
                >
                  <Phone className="w-3 h-3" />
                  {pharmacy.phone}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
