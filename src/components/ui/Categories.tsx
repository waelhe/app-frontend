'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Palmtree,
  Stethoscope,
  Building2,
  GraduationCap,
  Briefcase,
  Sparkles,
  UtensilsCrossed,
  Palette,
  ShoppingBag,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigationStore } from '@/stores/navigationStore';

interface CategoryItem {
  id: string;
  icon: React.ElementType;
  labelAr: string;
  labelEn: string;
  color: string;
  bgColor: string;
}

const categories: CategoryItem[] = [
  {
    id: 'tourism',
    icon: Palmtree,
    labelAr: 'سياحة',
    labelEn: 'Tourism',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100',
  },
  {
    id: 'medical',
    icon: Stethoscope,
    labelAr: 'طبية',
    labelEn: 'Medical',
    color: 'text-red-500',
    bgColor: 'bg-red-50 hover:bg-red-100',
  },
  {
    id: 'real-estate',
    icon: Building2,
    labelAr: 'عقارات',
    labelEn: 'Real Estate',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 hover:bg-amber-100',
  },
  {
    id: 'education',
    icon: GraduationCap,
    labelAr: 'تعليم',
    labelEn: 'Education',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
  },
  {
    id: 'business',
    icon: Briefcase,
    labelAr: 'أعمال',
    labelEn: 'Business',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
  },
  {
    id: 'experiences',
    icon: Sparkles,
    labelAr: 'تجارب',
    labelEn: 'Experiences',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 hover:bg-pink-100',
  },
  {
    id: 'dining',
    icon: UtensilsCrossed,
    labelAr: 'مطاعم',
    labelEn: 'Dining',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
  },
  {
    id: 'arts',
    icon: Palette,
    labelAr: 'فنون',
    labelEn: 'Arts',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50 hover:bg-violet-100',
  },
  {
    id: 'shopping',
    icon: ShoppingBag,
    labelAr: 'تسوق',
    labelEn: 'Shopping',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 hover:bg-teal-100',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function Categories() {
  const { language } = useLanguage();
  const navigate = useNavigationStore((s) => s.navigate);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = (categoryId: string) => {
    navigate('market', { category: categoryId });
  };

  return (
    <section className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          ref={scrollRef}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-3 sm:gap-4 py-3 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.id}
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryClick(cat.id)}
                className="flex flex-col items-center gap-1.5 min-w-[70px] sm:min-w-[80px] group cursor-pointer"
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-colors duration-200 ${cat.bgColor}`}
                >
                  <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${cat.color}`} />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-gray-900 whitespace-nowrap">
                  {language === 'ar' ? cat.labelAr : cat.labelEn}
                </span>
                {/* Underline animation on hover */}
                <span className="h-0.5 w-0 group-hover:w-6 bg-red-500 rounded-full transition-all duration-300" />
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
