'use client';

import { useLanguage } from '@/stores/languageStore';
import { Calendar, CloudSun, Thermometer } from 'lucide-react';

export default function DailyInfoBar() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const today = new Date();
  const dateStr = isRTL
    ? today.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="bg-muted/50 rounded-lg px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5" />
        <span className="font-medium">{dateStr}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <CloudSun className="w-3.5 h-3.5 text-amber-500" />
          <span>22°C</span>
        </div>
        <div className="flex items-center gap-1">
          <Thermometer className="w-3.5 h-3.5 text-red-400" />
          <span>{isRTL ? 'صافٍ' : 'Clear'}</span>
        </div>
      </div>
    </div>
  );
}
