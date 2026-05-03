'use client';

import { useLanguage } from '@/stores/languageStore';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ViewAllCardProps {
  sectionId: string;
  labelEn?: string;
  labelAr?: string;
  onClick?: () => void;
}

export default function ViewAllCard({ sectionId, labelEn, labelAr, onClick }: ViewAllCardProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const displayLabel = labelEn && labelAr
    ? (isRTL ? labelAr : labelEn)
    : isRTL ? 'عرض الكل' : 'View All';

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all duration-200 border-dashed border-red-300 hover:border-red-500 hover:bg-red-50/50 active:scale-95"
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center justify-center gap-2">
        <span className="text-sm font-medium text-red-500">
          {displayLabel}
        </span>
        {isRTL ? (
          <ArrowLeft className="w-4 h-4 text-red-500" />
        ) : (
          <ArrowRight className="w-4 h-4 text-red-500" />
        )}
      </CardContent>
    </Card>
  );
}
