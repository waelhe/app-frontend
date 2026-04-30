'use client';

import { Car } from 'lucide-react';
import { CategoryListingSection } from '@/components/sections/CategoryListingSection';

export default function CarServices() {
  return (
    <CategoryListingSection
      category="car-services"
      titleAr="خدمات السيارات"
      titleEn="Car Services"
      icon={Car}
      gradientFrom="from-sky-500"
      gradientTo="to-cyan-500"
    />
  );
}
