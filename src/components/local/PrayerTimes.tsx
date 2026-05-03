'use client';

import { useLanguage } from '@/stores/languageStore';
import { Card, CardContent } from '@/components/ui/card';
import { Moon, Sun, Clock } from 'lucide-react';

const prayerNames = [
  { id: 'fajr', nameEn: 'Fajr', nameAr: 'الفجر', time: '5:12', icon: Moon },
  { id: 'sunrise', nameEn: 'Sunrise', nameAr: 'الشروق', time: '6:28', icon: Sun },
  { id: 'dhuhr', nameEn: 'Dhuhr', nameAr: 'الظهر', time: '12:35', icon: Sun },
  { id: 'asr', nameEn: 'Asr', nameAr: 'العصر', time: '3:48', icon: Sun },
  { id: 'maghrib', nameEn: 'Maghrib', nameAr: 'المغرب', time: '6:22', icon: Sun },
  { id: 'isha', nameEn: 'Isha', nameAr: 'العشاء', time: '7:48', icon: Moon },
];

export default function PrayerTimes() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
      <CardContent className="p-4">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-emerald-700">
          <Moon className="w-4 h-4" />
          {isRTL ? 'أوقات الصلاة' : 'Prayer Times'}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {prayerNames.map((prayer) => {
            const Icon = prayer.icon;
            return (
              <div key={prayer.id} className="flex flex-col items-center p-2 rounded-lg bg-white/60">
                <Icon className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="text-xs font-medium text-emerald-800">
                  {isRTL ? prayer.nameAr : prayer.nameEn}
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {prayer.time}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-emerald-600 mt-2 text-center">
          {isRTL ? 'قدسيا - سوريا' : 'Qudsaya - Syria'}
        </p>
      </CardContent>
    </Card>
  );
}
