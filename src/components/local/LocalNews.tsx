'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Newspaper, Clock, ArrowLeft, ArrowRight } from 'lucide-react';

const newsItems = [
  {
    id: '1',
    titleEn: 'New Road Project Approved for Qudsaya',
    titleAr: 'الموافقة على مشروع طريق جديد في قدسيا',
    excerptEn: 'The municipality has approved a new road expansion project that will improve traffic flow in the city center.',
    excerptAr: 'وافقت البلدية على مشروع توسعة طريق جديد سيحسّن تدفق حركة المرور في مركز المدينة.',
    date: '2025-03-04',
    categoryEn: 'Infrastructure',
    categoryAr: 'بنية تحتية',
  },
  {
    id: '2',
    titleEn: 'Local Market Festival Next Week',
    titleAr: 'مهرجان السوق المحلي الأسبوع القادم',
    excerptEn: 'The annual local market festival will feature over 50 vendors, live music, and family activities.',
    excerptAr: 'سيضم مهرجان السوق المحلي السنوي أكثر من 50 بائعاً وموسيقى حية وأنشطة عائلية.',
    date: '2025-03-03',
    categoryEn: 'Events',
    categoryAr: 'فعاليات',
  },
  {
    id: '3',
    titleEn: 'School Registration Now Open',
    titleAr: 'التسجيل المدرسي مفتوح الآن',
    excerptEn: 'Parents can now register their children for the upcoming academic year at local schools.',
    excerptAr: 'يمكن للآباء تسجيل أطفالهم في العام الدراسي القادم في المدارس المحلية.',
    date: '2025-03-02',
    categoryEn: 'Education',
    categoryAr: 'تعليم',
  },
];

export default function LocalNews() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Newspaper className="w-5 h-5 text-red-500" />
        {isRTL ? 'الأخبار المحلية' : 'Local News'}
      </h2>
      <div className="space-y-3">
        {newsItems.map((news) => (
          <Card key={news.id} className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
            <div className="w-full h-36 bg-muted flex items-center justify-center">
              <Newspaper className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {isRTL ? news.categoryAr : news.categoryEn}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {news.date}
                </span>
              </div>
              <h3 className="font-semibold text-sm mb-1.5">
                {isRTL ? news.titleAr : news.titleEn}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {isRTL ? news.excerptAr : news.excerptEn}
              </p>
              <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                {isRTL ? 'اقرأ المزيد' : 'Read More'}
                {isRTL ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
