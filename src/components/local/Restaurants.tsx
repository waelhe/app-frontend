'use client';

import { Utensils } from 'lucide-react';
import { CategoryListingSection } from '@/components/sections/CategoryListingSection';

export default function Restaurants() {
  return (
    <CategoryListingSection
      category="restaurants"
      titleAr="المطاعم"
      titleEn="Restaurants"
      icon={Utensils}
      gradientFrom="from-amber-500"
      gradientTo="to-orange-500"
    />
  );
}
