'use client';

import { useLanguage } from '@/stores/languageStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock } from 'lucide-react';

const events = [
  {
    id: '1',
    titleEn: 'Spring Festival',
    titleAr: 'مهرجان الربيع',
    date: '2025-04-15',
    timeEn: '4:00 PM',
    timeAr: '4:00 مساءً',
    locationEn: 'Central Park, Qudsaya',
    locationAr: 'الحديقة المركزية، قدسيا',
    categoryEn: 'Festival',
    categoryAr: 'مهرجان',
  },
  {
    id: '2',
    titleEn: 'Book Fair',
    titleAr: 'معرض الكتاب',
    date: '2025-04-20',
    timeEn: '10:00 AM',
    timeAr: '10:00 صباحاً',
    locationEn: 'Cultural Center',
    locationAr: 'المركز الثقافي',
    categoryEn: 'Culture',
    categoryAr: 'ثقافة',
  },
  {
    id: '3',
    titleEn: 'Charity Marathon',
    titleAr: 'ماراثون خيري',
    date: '2025-05-01',
    timeEn: '7:00 AM',
    timeAr: '7:00 صباحاً',
    locationEn: 'Main Street, Qudsaya',
    locationAr: 'الشارع الرئيسي، قدسيا',
    categoryEn: 'Sports',
    categoryAr: 'رياضة',
  },
  {
    id: '4',
    titleEn: 'Art Exhibition',
    titleAr: 'معرض فني',
    date: '2025-05-10',
    timeEn: '6:00 PM',
    timeAr: '6:00 مساءً',
    locationEn: 'Gallery 21',
    locationAr: 'غاليري 21',
    categoryEn: 'Art',
    categoryAr: 'فن',
  },
];

export default function Events() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      day: d.getDate().toString(),
      month: isRTL
        ? d.toLocaleDateString('ar-SA', { month: 'short' })
        : d.toLocaleDateString('en-US', { month: 'short' }),
    };
  };

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-red-500" />
        {isRTL ? 'الفعاليات' : 'Events'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {events.map((event) => {
          const { day, month } = formatDate(event.date);
          return (
            <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="shrink-0 w-14 h-14 bg-red-50 rounded-xl flex flex-col items-center justify-center border border-red-200">
                    <span className="text-xl font-bold text-red-600 leading-none">{day}</span>
                    <span className="text-xs text-red-500 font-medium">{month}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-sm truncate">
                        {isRTL ? event.titleAr : event.titleEn}
                      </h3>
                      <Badge variant="secondary" className="text-xs shrink-0 ms-2">
                        {isRTL ? event.categoryAr : event.categoryEn}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Clock className="w-3 h-3" />
                      {isRTL ? event.timeAr : event.timeEn}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {isRTL ? event.locationAr : event.locationEn}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
