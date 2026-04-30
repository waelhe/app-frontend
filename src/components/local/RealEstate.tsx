'use client';

import { Building2 } from 'lucide-react';
import { CategoryListingSection } from '@/components/sections/CategoryListingSection';

export default function RealEstate() {
  return (
    <CategoryListingSection
      category="real-estate"
      titleAr="العقارات"
      titleEn="Real Estate"
      icon={Building2}
      gradientFrom="from-rose-500"
      gradientTo="to-orange-500"
    />
  );
}
