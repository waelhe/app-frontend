'use client';

import { useLanguage } from '@/stores/languageStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, Tag } from 'lucide-react';
import UsedItem from './UsedItem';

const usedItems = [
  {
    id: '1',
    titleEn: 'Samsung Galaxy S22',
    titleAr: 'سامسونغ غالاكسي S22',
    price: '2,500,000',
    conditionEn: 'Like New',
    conditionAr: 'كالجديد',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    categoryEn: 'Phones',
    categoryAr: 'هواتف',
  },
  {
    id: '2',
    titleEn: 'Wooden Dining Table',
    titleAr: 'طاولة طعام خشبية',
    price: '800,000',
    conditionEn: 'Good',
    conditionAr: 'جيد',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    categoryEn: 'Furniture',
    categoryAr: 'أثاث',
  },
  {
    id: '3',
    titleEn: 'Kids Bicycle',
    titleAr: 'دراجة أطفال',
    price: '300,000',
    conditionEn: 'Good',
    conditionAr: 'جيد',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    categoryEn: 'Sports',
    categoryAr: 'رياضة',
  },
  {
    id: '4',
    titleEn: 'Office Desk + Chair',
    titleAr: 'مكتب عمل + كرسي',
    price: '500,000',
    conditionEn: 'Fair',
    conditionAr: 'مقبول',
    locationEn: 'Riverside Road',
    locationAr: 'طريق النهر',
    categoryEn: 'Furniture',
    categoryAr: 'أثاث',
  },
];

export default function UsedItems() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-red-500" />
        {isRTL ? 'المستعمل' : 'Used Items'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {usedItems.map((item) => (
          <UsedItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
