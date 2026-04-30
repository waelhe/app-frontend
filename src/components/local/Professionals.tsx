'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Scale, Calculator, Phone, Star, MapPin } from 'lucide-react';

const professionalTypes = [
  { id: 'lawyer', labelEn: 'Lawyers', labelAr: 'محامون', icon: Scale },
  { id: 'accountant', labelEn: 'Accountants', labelAr: 'محاسبون', icon: Calculator },
];

const professionals = [
  {
    id: '1',
    nameEn: 'Adv. Ahmad Al-Rifai',
    nameAr: 'المحامي أحمد الرفاعي',
    type: 'lawyer',
    specialtyEn: 'Civil Law',
    specialtyAr: 'القانون المدني',
    rating: 4.9,
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-8899001',
  },
  {
    id: '2',
    nameEn: 'Adv. Lina Kabbani',
    nameAr: 'المحامية لينا قباني',
    type: 'lawyer',
    specialtyEn: 'Family Law',
    specialtyAr: 'قانون الأسرة',
    rating: 4.7,
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-9900112',
  },
  {
    id: '3',
    nameEn: 'M. Hassan Nasser',
    nameAr: 'م. حسن ناصر',
    type: 'accountant',
    specialtyEn: 'Tax Consulting',
    specialtyAr: 'استشارات ضريبية',
    rating: 4.8,
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-0011223',
  },
  {
    id: '4',
    nameEn: 'M. Rania Saeed',
    nameAr: 'م. رانيا سعيد',
    type: 'accountant',
    specialtyEn: 'Audit & Accounting',
    specialtyAr: 'تدقيق ومحاسبة',
    rating: 4.6,
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-1122334',
  },
];

export default function Professionals() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-red-500" />
        {isRTL ? 'المحترفون' : 'Professionals'}
      </h2>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {professionalTypes.map((pt) => {
          const Icon = pt.icon;
          return (
            <div key={pt.id} className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
              <Icon className="w-6 h-6 text-red-500" />
              <span className="text-xs font-medium">{isRTL ? pt.labelAr : pt.labelEn}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {professionals.map((pro) => {
          const pt = professionalTypes.find((p) => p.id === pro.type);
          const ProIcon = pt?.icon ?? Briefcase;
          return (
            <Card key={pro.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <ProIcon className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{isRTL ? pro.nameAr : pro.nameEn}</h3>
                    <p className="text-xs text-red-500 font-medium">{isRTL ? pro.specialtyAr : pro.specialtyEn}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {pro.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {isRTL ? pro.locationAr : pro.locationEn}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => window.open(`tel:${pro.phone}`, '_self')}
                  >
                    <Phone className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
