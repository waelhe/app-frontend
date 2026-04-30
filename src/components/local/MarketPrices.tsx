'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

const marketItems = [
  { id: '1', nameEn: 'Bread', nameAr: 'خبز', price: '2,000', unit: 'SYP/kg', change: 'up' },
  { id: '2', nameEn: 'Rice', nameAr: 'أرز', price: '12,000', unit: 'SYP/kg', change: 'down' },
  { id: '3', nameEn: 'Sugar', nameAr: 'سكر', price: '8,500', unit: 'SYP/kg', change: 'up' },
  { id: '4', nameEn: 'Olive Oil', nameAr: 'زيت زيتون', price: '45,000', unit: 'SYP/L', change: 'up' },
  { id: '5', nameEn: 'Eggs', nameAr: 'بيض', price: '15,000', unit: 'SYP/30', change: 'down' },
  { id: '6', nameEn: 'Milk', nameAr: 'حليب', price: '6,000', unit: 'SYP/L', change: 'stable' },
];

export default function MarketPrices() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <Card className="border-amber-200">
      <CardContent className="p-4">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-amber-700">
          <BarChart3 className="w-4 h-4" />
          {isRTL ? 'أسعار السوق' : 'Market Prices'}
        </h3>
        <div className="space-y-2">
          {marketItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-amber-100 last:border-0">
              <span className="text-xs font-medium">{isRTL ? item.nameAr : item.nameEn}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800">
                  {item.price} {item.unit}
                </span>
                {item.change === 'up' ? (
                  <TrendingUp className="w-3 h-3 text-red-500" />
                ) : item.change === 'down' ? (
                  <TrendingDown className="w-3 h-3 text-green-500" />
                ) : (
                  <span className="w-3 h-3 text-xs text-gray-400">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-amber-500 mt-2 text-center">
          {isRTL ? 'الأسعار تقريبية وقد تختلف' : 'Prices are approximate and may vary'}
        </p>
      </CardContent>
    </Card>
  );
}
