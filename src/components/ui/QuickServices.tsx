'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface QuickSection {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: string;
  isNew?: boolean;
}

interface QuickGroup {
  id: string;
  labelAr: string;
  labelEn: string;
  sections: QuickSection[];
}

interface QuickPart {
  id: string;
  labelAr: string;
  labelEn: string;
  groups: QuickGroup[];
}

const parts: QuickPart[] = [
  {
    id: 'discover',
    labelAr: 'اكتشف',
    labelEn: 'Discover',
    groups: [
      {
        id: 'food',
        labelAr: 'طعام وضيافة',
        labelEn: 'Food & Hospitality',
        sections: [
          { id: 'restaurants', labelAr: 'مطاعم', labelEn: 'Restaurants', icon: '🍽️' },
          { id: 'cafes', labelAr: 'مقاهي', labelEn: 'Cafes', icon: '☕' },
          { id: 'catering', labelAr: 'تموين', labelEn: 'Catering', icon: '🥘' },
          { id: 'bakeries', labelAr: 'مخابز', labelEn: 'Bakeries', icon: '🥖' },
        ],
      },
      {
        id: 'health',
        labelAr: 'صحة وعافية',
        labelEn: 'Health & Wellness',
        sections: [
          { id: 'doctors', labelAr: 'أطباء', labelEn: 'Doctors', icon: '👨‍⚕️' },
          { id: 'pharmacies', labelAr: 'صيدليات', labelEn: 'Pharmacies', icon: '💊' },
          { id: 'dental', labelAr: 'طب أسنان', labelEn: 'Dental', icon: '🦷' },
          { id: 'physiotherapy', labelAr: 'علاج طبيعي', labelEn: 'Physiotherapy', icon: '🏃', isNew: true },
        ],
      },
      {
        id: 'services',
        labelAr: 'خدمات',
        labelEn: 'Services',
        sections: [
          { id: 'plumbing', labelAr: 'سباكة', labelEn: 'Plumbing', icon: '🔧' },
          { id: 'electrical', labelAr: 'كهرباء', labelEn: 'Electrical', icon: '⚡' },
          { id: 'painting', labelAr: 'دهان', labelEn: 'Painting', icon: '🎨' },
          { id: 'cleaning', labelAr: 'تنظيف', labelEn: 'Cleaning', icon: '🧹' },
          { id: 'moving', labelAr: 'نقل', labelEn: 'Moving', icon: '🚚' },
        ],
      },
      {
        id: 'shopping',
        labelAr: 'تسوق',
        labelEn: 'Shopping',
        sections: [
          { id: 'grocery', labelAr: 'بقالة', labelEn: 'Grocery', icon: '🛒' },
          { id: 'clothing', labelAr: 'ملابس', labelEn: 'Clothing', icon: '👕' },
          { id: 'electronics', labelAr: 'إلكترونيات', labelEn: 'Electronics', icon: '📱' },
          { id: 'furniture', labelAr: 'أثاث', labelEn: 'Furniture', icon: '🛋️', isNew: true },
        ],
      },
      {
        id: 'tourism',
        labelAr: 'سياحة وسفر',
        labelEn: 'Travel & Tourism',
        sections: [
          { id: 'hotels', labelAr: 'فنادق', labelEn: 'Hotels', icon: '🏨' },
          { id: 'trips', labelAr: 'رحلات', labelEn: 'Trips', icon: '✈️' },
          { id: 'car-rental', labelAr: 'تأجير سيارات', labelEn: 'Car Rental', icon: '🚗' },
          { id: 'tour-guides', labelAr: 'مرشدين سياحيين', labelEn: 'Tour Guides', icon: '🗺️', isNew: true },
        ],
      },
    ],
  },
];

// Flat list of all sections for the horizontal bar
const allSections: QuickSection[] = parts.flatMap((p) =>
  p.groups.flatMap((g) => g.sections)
);

export function QuickServices() {
  const { language } = useLanguage();
  const navigate = useNavigationStore((s) => s.navigate);
  const [selected, setSelected] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = direction === 'left' ? -200 : 200;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const handleSelect = (sectionId: string) => {
    setSelected(sectionId === selected ? null : sectionId);
    navigate('market', { category: sectionId });
  };

  return (
    <section className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative flex items-center py-3 gap-2">
          {/* Left scroll button */}
          <button
            onClick={() => scrollBy('left')}
            className="hidden sm:flex absolute start-0 z-10 w-8 h-8 rounded-full bg-white shadow-md items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Scroll left"
          >
            {language === 'ar' ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>

          {/* Scrollable categories bar */}
          <div
            ref={scrollRef}
            className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-1 px-8 w-full"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* All button with Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[70px] group"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-md">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 group-hover:text-red-500 whitespace-nowrap">
                    {language === 'ar' ? 'الكل' : 'All'}
                  </span>
                </motion.button>
              </SheetTrigger>
              <SheetContent side={language === 'ar' ? 'right' : 'left'} className="w-[360px] sm:w-[420px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-right">
                    {language === 'ar' ? 'جميع الفئات' : 'All Categories'}
                  </SheetTitle>
                  <SheetDescription className="text-right">
                    {language === 'ar'
                      ? 'اختر الفئة التي تبحث عنها'
                      : 'Choose the category you are looking for'}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-6 px-4">
                  {parts.map((part) => (
                    <div key={part.id}>
                      <h3 className="font-bold text-base mb-3 text-gray-800">
                        {language === 'ar' ? part.labelAr : part.labelEn}
                      </h3>
                      {part.groups.map((group) => (
                        <div key={group.id} className="mb-4">
                          <h4 className="font-semibold text-sm text-gray-600 mb-2">
                            {language === 'ar' ? group.labelAr : group.labelEn}
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {group.sections.map((section) => (
                              <button
                                key={section.id}
                                onClick={() => handleSelect(section.id)}
                                className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors text-right"
                              >
                                <span className="text-xl">{section.icon}</span>
                                <span className="text-sm font-medium text-gray-700">
                                  {language === 'ar' ? section.labelAr : section.labelEn}
                                </span>
                                {section.isNew && (
                                  <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 border-0">
                                    {language === 'ar' ? 'جديد' : 'New'}
                                  </Badge>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            {/* Separator */}
            <div className="w-px h-10 bg-gray-200 flex-shrink-0" />

            {/* Category items */}
            {allSections.map((section) => (
              <motion.button
                key={section.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(section.id)}
                className={`flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[70px] group cursor-pointer ${
                  selected === section.id ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    selected === section.id
                      ? 'bg-red-50 ring-2 ring-red-500 shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl sm:text-2xl">{section.icon}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-xs font-medium whitespace-nowrap transition-colors ${
                      selected === section.id
                        ? 'text-red-500'
                        : 'text-gray-600 group-hover:text-gray-900'
                    }`}
                  >
                    {language === 'ar' ? section.labelAr : section.labelEn}
                  </span>
                  {section.isNew && (
                    <Badge className="bg-red-500 text-white text-[9px] px-1 py-0 border-0 leading-none">
                      {language === 'ar' ? 'جديد' : 'New'}
                    </Badge>
                  )}
                </div>
                {selected === section.id && (
                  <span className="h-0.5 w-4 bg-red-500 rounded-full" />
                )}
              </motion.button>
            ))}
          </div>

          {/* Right scroll button */}
          <button
            onClick={() => scrollBy('right')}
            className="hidden sm:flex absolute end-0 z-10 w-8 h-8 rounded-full bg-white shadow-md items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Scroll right"
          >
            {language === 'ar' ? (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
