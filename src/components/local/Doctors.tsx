'use client';

import { Stethoscope } from 'lucide-react';
import { CategoryListingSection } from '@/components/sections/CategoryListingSection';

export default function Doctors() {
  return (
    <CategoryListingSection
      category="medical"
      titleAr="الأطباء"
      titleEn="Doctors"
      icon={Stethoscope}
      gradientFrom="from-red-500"
      gradientTo="to-rose-500"
    />
  );
}
