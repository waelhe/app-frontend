'use client';

import { useLanguage } from '@/stores/languageStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Hospital, MapPin, Phone, Clock } from 'lucide-react';

const medicalCenters = [
  {
    id: '1',
    nameEn: 'Qudsaya General Hospital',
    nameAr: 'مستشفى قدسيا العام',
    typeEn: 'Hospital',
    typeAr: 'مستشفى',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-5675675',
    hoursEn: '24 Hours',
    hoursAr: '24 ساعة',
    emergency: true,
  },
  {
    id: '2',
    nameEn: 'Al-Rahma Medical Center',
    nameAr: 'مركز الرحمة الطبي',
    typeEn: 'Medical Center',
    typeAr: 'مركز طبي',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-6786786',
    hoursEn: '8 AM - 10 PM',
    hoursAr: '8 ص - 10 م',
    emergency: false,
  },
  {
    id: '3',
    nameEn: 'Dental Care Clinic',
    nameAr: 'عيادة العناية بالأسنان',
    typeEn: 'Dental Clinic',
    typeAr: 'عيادة أسنان',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-7897897',
    hoursEn: '9 AM - 8 PM',
    hoursAr: '9 ص - 8 م',
    emergency: false,
  },
  {
    id: '4',
    nameEn: 'Diagnostic Lab',
    nameAr: 'مختبر التشخيص',
    typeEn: 'Laboratory',
    typeAr: 'مختبر',
    locationEn: 'Riverside Road',
    locationAr: 'طريق النهر',
    phone: '011-8908908',
    hoursEn: '7 AM - 6 PM',
    hoursAr: '7 ص - 6 م',
    emergency: false,
  },
];

export default function MedicalCenters() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Hospital className="w-5 h-5 text-red-500" />
        {isRTL ? 'المراكز الطبية' : 'Medical Centers'}
      </h2>
      <div className="space-y-3">
        {medicalCenters.map((center) => (
          <Card
            key={center.id}
            className={`hover:shadow-md transition-shadow cursor-pointer ${center.emergency ? 'border-red-300' : ''}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${center.emergency ? 'bg-red-50' : 'bg-blue-50'}`}>
                  <Hospital className={`w-5 h-5 ${center.emergency ? 'text-red-500' : 'text-blue-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{isRTL ? center.nameAr : center.nameEn}</h3>
                    {center.emergency && (
                      <Badge className="bg-red-500 text-xs shrink-0">
                        {isRTL ? 'طوارئ' : 'ER'}
                      </Badge>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs mt-0.5">
                    {isRTL ? center.typeAr : center.typeEn}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 ms-13 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  {isRTL ? center.locationAr : center.locationEn}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {isRTL ? center.hoursAr : center.hoursEn}
                </span>
                <span
                  className="flex items-center gap-1.5 text-red-500 cursor-pointer"
                  onClick={() => window.open(`tel:${center.phone}`, '_self')}
                >
                  <Phone className="w-3 h-3" />
                  {center.phone}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
