'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Sun, Cloud, Droplets, Wind, Thermometer, Eye } from 'lucide-react';

export default function WeatherWidget() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <Card className="bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm flex items-center gap-2 text-sky-700">
            <Cloud className="w-4 h-4" />
            {isRTL ? 'حالة الطقس' : 'Weather'}
          </h3>
          <span className="text-xs text-sky-600">
            {isRTL ? 'قدسيا' : 'Qudsaya'}
          </span>
        </div>

        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="flex flex-col items-center">
            <Sun className="w-12 h-12 text-amber-400" />
            <span className="text-xs text-sky-600 mt-1">
              {isRTL ? 'صافٍ' : 'Clear'}
            </span>
          </div>
          <div className="text-center">
            <span className="text-4xl font-bold text-sky-800">22°</span>
            <p className="text-xs text-sky-600">
              {isRTL ? 'درجة مئوية' : 'Celsius'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 rounded-lg bg-white/60">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-sky-600 mt-1">45%</span>
            <span className="text-[10px] text-sky-500">
              {isRTL ? 'رطوبة' : 'Humidity'}
            </span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-white/60">
            <Wind className="w-4 h-4 text-sky-400" />
            <span className="text-xs text-sky-600 mt-1">12 km/h</span>
            <span className="text-[10px] text-sky-500">
              {isRTL ? 'رياح' : 'Wind'}
            </span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-white/60">
            <Eye className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-sky-600 mt-1">10 km</span>
            <span className="text-[10px] text-sky-500">
              {isRTL ? 'رؤية' : 'Visibility'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
