'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Phone, MapPin } from 'lucide-react';

const charities = [
  {
    id: '1',
    nameEn: 'Good Hearts Foundation',
    nameAr: 'مؤسسة القلوب الطيبة',
    descEn: 'Supporting families in need with food, clothing, and educational resources.',
    descAr: 'دعم الأسر المحتاجة بالطعام والملابس والموارد التعليمية.',
    phone: '011-1234567',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    category: 'social',
  },
  {
    id: '2',
    nameEn: 'Al-Birr Association',
    nameAr: 'جمعية البر',
    descEn: 'Providing medical assistance and support for orphans and widows.',
    descAr: 'تقديم المساعدة الطبية ودعم الأيتام والأرامل.',
    phone: '011-2345678',
    locationEn: 'Qudsaya Dahia',
    locationAr: 'ضاحية قدسيا',
    category: 'medical',
  },
  {
    id: '3',
    nameEn: 'Future Builders',
    nameAr: 'بناة المستقبل',
    descEn: 'Empowering youth through vocational training and mentorship programs.',
    descAr: 'تمكين الشباب من خلال التدريب المهني وبرامج الإرشاد.',
    phone: '011-3456789',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    category: 'education',
  },
];

export default function Charity() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Heart className="w-5 h-5 text-red-500" />
        {isRTL ? 'الجمعيات الخيرية' : 'Charities'}
      </h2>
      <div className="space-y-3">
        {charities.map((charity) => (
          <Card key={charity.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-base">
                  {isRTL ? charity.nameAr : charity.nameEn}
                </h3>
                <Badge variant="outline" className="text-xs shrink-0 border-red-300 text-red-600">
                  <Heart className="w-3 h-3 mr-1" />
                  {isRTL ? 'خيري' : 'Charity'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {isRTL ? charity.descAr : charity.descEn}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <MapPin className="w-3.5 h-3.5" />
                {isRTL ? charity.locationAr : charity.locationEn}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-3.5 h-3.5" />
                {charity.phone}
              </div>
            </CardContent>
            <CardFooter className="px-4 pb-4 pt-0">
              <Button
                size="sm"
                className="w-full bg-red-500 hover:bg-red-600 text-white"
                onClick={() => window.open(`tel:${charity.phone}`, '_self')}
              >
                <Phone className="w-4 h-4 me-2" />
                {isRTL ? 'اتصل الآن' : 'Call Now'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
