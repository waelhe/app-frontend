'use client';

import { useLanguage } from '@/stores/languageStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Phone } from 'lucide-react';

const offices = [
  {
    id: '1',
    nameEn: 'Qudsaya Real Estate Office',
    nameAr: 'مكتب عقارات قدسيا',
    typeEn: 'Real Estate',
    typeAr: 'عقارات',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-2233445',
  },
  {
    id: '2',
    nameEn: 'Al-Wafa Recruitment Office',
    nameAr: 'مكتب الوفاء للتوظيف',
    typeEn: 'Employment',
    typeAr: 'توظيف',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-3344556',
  },
  {
    id: '3',
    nameEn: 'Travel & Tourism Agency',
    nameAr: 'وكالة السفر والسياحة',
    typeEn: 'Travel',
    typeAr: 'سفر وسياحة',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-4455667',
  },
  {
    id: '4',
    nameEn: 'Insurance Office',
    nameAr: 'مكتب التأمين',
    typeEn: 'Insurance',
    typeAr: 'تأمين',
    locationEn: 'Riverside Road',
    locationAr: 'طريق النهر',
    phone: '011-5566778',
  },
];

export default function Offices() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-red-500" />
        {isRTL ? 'المكاتب' : 'Offices'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {offices.map((office) => (
          <Card key={office.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{isRTL ? office.nameAr : office.nameEn}</h3>
                  <Badge variant="outline" className="text-xs mt-0.5">
                    {isRTL ? office.typeAr : office.typeEn}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1 ms-13 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  {isRTL ? office.locationAr : office.locationEn}
                </div>
                <div
                  className="flex items-center gap-1.5 text-red-500 cursor-pointer"
                  onClick={() => window.open(`tel:${office.phone}`, '_self')}
                >
                  <Phone className="w-3 h-3" />
                  {office.phone}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
