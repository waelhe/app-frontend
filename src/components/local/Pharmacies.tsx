'use client';

import { Pill } from 'lucide-react';
import { CategoryListingSection } from '@/components/sections/CategoryListingSection';

export default function Pharmacies() {
  return (
    <CategoryListingSection
      category="pharmacies"
      titleAr="الصيدليات"
      titleEn="Pharmacies"
      icon={Pill}
      gradientFrom="from-emerald-500"
      gradientTo="to-teal-500"
    />
  );
}
