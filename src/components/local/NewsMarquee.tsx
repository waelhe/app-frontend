'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Newspaper } from 'lucide-react';

const headlines = [
  { id: '1', textEn: 'New road project approved for Qudsaya city center', textAr: 'الموافقة على مشروع طريق جديد في مركز مدينة قدسيا' },
  { id: '2', textEn: 'Spring festival starts next week at Central Park', textAr: 'مهرجان الربيع يبدأ الأسبوع القادم في الحديقة المركزية' },
  { id: '3', textEn: 'School registrations now open for 2025-2026', textAr: 'التسجيل المدرسي مفتوح الآن للعام 2025-2026' },
  { id: '4', textEn: 'Market prices update: Olive oil prices rising', textAr: 'تحديث أسعار السوق: ارتفاع أسعار زيت الزيتون' },
  { id: '5', textEn: 'New pharmacy opening in Dahia District', textAr: 'افتتاح صيدلية جديدة في حي الضاحية' },
];

export default function NewsMarquee() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % headlines.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const headline = headlines[currentIndex];

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 flex items-center gap-2 overflow-hidden">
      <div className="shrink-0 flex items-center gap-1.5">
        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
          {isRTL ? 'عاجل' : 'NEWS'}
        </span>
        <Newspaper className="w-4 h-4 text-red-500" />
      </div>
      <div className="overflow-hidden flex-1">
        <p className="text-xs text-red-700 font-medium whitespace-nowrap animate-marquee">
          {isRTL ? headline.textAr : headline.textEn}
        </p>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(${isRTL ? '-100%' : '100%'}); }
          100% { transform: translateX(${isRTL ? '100%' : '-100%'}); }
        }
        .animate-marquee {
          animation: marquee 12s linear infinite;
        }
      `}</style>
    </div>
  );
}
