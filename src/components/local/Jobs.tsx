'use client';

import { useLanguage } from '@/stores/languageStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, Clock, DollarSign } from 'lucide-react';

const jobs = [
  {
    id: '1',
    titleEn: 'Sales Representative',
    titleAr: 'مندوب مبيعات',
    companyEn: 'Tech Solutions',
    companyAr: 'تك سوليوشنز',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    typeEn: 'Full-time',
    typeAr: 'دوام كامل',
    salaryEn: '300,000 - 500,000 SYP',
    salaryAr: '300,000 - 500,000 ل.س',
    posted: '2 days ago',
  },
  {
    id: '2',
    titleEn: 'English Teacher',
    titleAr: 'معلم لغة إنجليزية',
    companyEn: 'Language Center',
    companyAr: 'مركز اللغات',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    typeEn: 'Part-time',
    typeAr: 'دوام جزئي',
    salaryEn: '200,000 SYP/mo',
    salaryAr: '200,000 ل.س/شهر',
    posted: '1 week ago',
  },
  {
    id: '3',
    titleEn: 'Electrician',
    titleAr: 'فني كهرباء',
    companyEn: 'Home Services Co.',
    companyAr: 'شركة خدمات منزلية',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    typeEn: 'Full-time',
    typeAr: 'دوام كامل',
    salaryEn: '250,000 - 400,000 SYP',
    salaryAr: '250,000 - 400,000 ل.س',
    posted: '3 days ago',
  },
  {
    id: '4',
    titleEn: 'Cashier',
    titleAr: 'محاسب كاشير',
    companyEn: 'Al-Madina Market',
    companyAr: 'سوق المدينة',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    typeEn: 'Full-time',
    typeAr: 'دوام كامل',
    salaryEn: '180,000 SYP/mo',
    salaryAr: '180,000 ل.س/شهر',
    posted: '5 days ago',
  },
];

export default function Jobs() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-red-500" />
        {isRTL ? 'الوظائف' : 'Jobs'}
      </h2>
      <div className="space-y-3">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-sm">{isRTL ? job.titleAr : job.titleEn}</h3>
                  <p className="text-xs text-muted-foreground">{isRTL ? job.companyAr : job.companyEn}</p>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {isRTL ? job.typeAr : job.typeEn}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {isRTL ? job.locationAr : job.locationEn}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {isRTL ? job.salaryAr : job.salaryEn}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {job.posted}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
