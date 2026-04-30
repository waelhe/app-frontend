'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, MapPin, Phone } from 'lucide-react';

const educationCenters = [
  {
    id: '1',
    nameEn: 'Al-Noor School',
    nameAr: 'مدرسة النور',
    typeEn: 'Primary School',
    typeAr: 'مدرسة ابتدائية',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-1212121',
  },
  {
    id: '2',
    nameEn: 'Qudsaya High School',
    nameAr: 'ثانوية قدسيا',
    typeEn: 'High School',
    typeAr: 'ثانوية',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-2323232',
  },
  {
    id: '3',
    nameEn: 'Technical Institute',
    nameAr: 'المعهد التقني',
    typeEn: 'Institute',
    typeAr: 'معهد',
    locationEn: 'Industrial Zone',
    locationAr: 'المنطقة الصناعية',
    phone: '011-3434343',
  },
  {
    id: '4',
    nameEn: 'Language Center',
    nameAr: 'مركز اللغات',
    typeEn: 'Language Institute',
    typeAr: 'معهد لغات',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-4545454',
  },
  {
    id: '5',
    nameEn: 'Computer Academy',
    nameAr: 'أكاديمية الحاسوب',
    typeEn: 'Training Center',
    typeAr: 'مركز تدريب',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-5656565',
  },
];

export default function Education() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <GraduationCap className="w-5 h-5 text-red-500" />
        {isRTL ? 'التعليم' : 'Education'}
      </h2>
      <div className="space-y-3">
        {educationCenters.map((center) => (
          <Card key={center.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{isRTL ? center.nameAr : center.nameEn}</h3>
                  <Badge variant="secondary" className="text-xs mt-0.5">
                    {isRTL ? center.typeAr : center.typeEn}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 ms-13 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  {isRTL ? center.locationAr : center.locationEn}
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
