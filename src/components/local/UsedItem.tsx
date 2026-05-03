'use client';

import { useLanguage } from '@/stores/languageStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin } from 'lucide-react';

interface UsedItemProps {
  item: {
    id: string;
    titleEn: string;
    titleAr: string;
    price: string;
    conditionEn: string;
    conditionAr: string;
    locationEn: string;
    locationAr: string;
    categoryEn: string;
    categoryAr: string;
  };
}

export default function UsedItem({ item }: UsedItemProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="w-full h-28 bg-muted rounded-lg flex items-center justify-center mb-3">
          <Package className="w-8 h-8 text-muted-foreground/30" />
        </div>
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-sm">{isRTL ? item.titleAr : item.titleEn}</h3>
          <Badge variant="outline" className="text-xs shrink-0 ms-1">
            {isRTL ? item.categoryAr : item.categoryEn}
          </Badge>
        </div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-red-600 font-bold text-sm">{item.price} SYP</span>
          <Badge variant="secondary" className="text-xs">
            {isRTL ? item.conditionAr : item.conditionEn}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {isRTL ? item.locationAr : item.locationEn}
        </div>
      </CardContent>
    </Card>
  );
}
