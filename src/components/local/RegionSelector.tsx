'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useRegion } from '@/contexts/RegionContext';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const regions = [
  { id: 'qudsaya-center' as const, labelEn: 'Qudsaya Center', labelAr: 'مركز قدسيا' },
  { id: 'qudsaya-dahia' as const, labelEn: 'Qudsaya Dahia', labelAr: 'ضاحية قدسيا' },
];

export default function RegionSelector() {
  const { language } = useLanguage();
  const { region, setRegion } = useRegion();
  const isRTL = language === 'ar';

  return (
    <div className="flex items-center gap-2">
      <MapPin className="w-4 h-4 text-red-500" />
      <div className="flex gap-1">
        {regions.map((r) => (
          <Button
            key={r.id}
            size="sm"
            variant={region === r.id ? 'default' : 'outline'}
            className={`text-xs h-7 px-3 ${region === r.id ? 'bg-red-500 hover:bg-red-600' : ''}`}
            onClick={() => setRegion(r.id)}
          >
            {isRTL ? r.labelAr : r.labelEn}
          </Button>
        ))}
      </div>
    </div>
  );
}
