'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Building, Car, ShoppingBag, Briefcase, Wrench } from 'lucide-react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';

const CTA_CARDS = [
  {
    id: 'real-estate',
    titleAr: 'عقارات',
    titleEn: 'Real Estate',
    descAr: 'شقق، فلل، أراضي — كل ما تحتاج في مكان واحد',
    descEn: 'Apartments, villas, land — everything you need in one place',
    image: '/images/cta/real-estate.webp',
    icon: Building,
    color: '#00A699',
    gradient: 'from-teal-600 to-emerald-700',
    navigateTo: 'market',
  },
  {
    id: 'cars',
    titleAr: 'سيارات',
    titleEn: 'Cars',
    descAr: 'سيارات جديدة ومستعملة بأسعار مناسبة',
    descEn: 'New and used cars at great prices',
    image: '/images/cta/cars.webp',
    icon: Car,
    color: '#428BFF',
    gradient: 'from-blue-600 to-indigo-700',
    navigateTo: 'market',
  },
  {
    id: 'marketplace',
    titleAr: 'سلع مستعملة',
    titleEn: 'Marketplace',
    descAr: 'بيع واشتري سلع مستعملة في منطقتك',
    descEn: 'Buy and sell used items in your area',
    image: '/images/cta/marketplace.webp',
    icon: ShoppingBag,
    color: '#FC642D',
    gradient: 'from-orange-500 to-red-600',
    navigateTo: 'market',
  },
  {
    id: 'services',
    titleAr: 'خدمات',
    titleEn: 'Services',
    descAr: 'حرفيين ومهنيين موثوقين لكل احتياجاتك',
    descEn: 'Trusted craftsmen and professionals for all your needs',
    image: '/images/cta/services.webp',
    icon: Wrench,
    color: '#78716C',
    gradient: 'from-stone-600 to-stone-800',
    navigateTo: 'directory',
  },
  {
    id: 'jobs',
    titleAr: 'وظائف',
    titleEn: 'Jobs',
    descAr: 'وظائف شاغرة في مختلف المجالات',
    descEn: 'Job openings across various fields',
    image: '/images/cta/jobs.webp',
    icon: Briefcase,
    color: '#8B5CF6',
    gradient: 'from-violet-600 to-purple-700',
    navigateTo: 'market',
  },
];

export default function CategoryCTACards() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { navigate } = useNavigationStore();

  const t = (ar: string, en: string) => (isArabic ? ar : en);

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
            {t('اكتشف حسب القسم', 'Explore by Category')}
          </h2>
          <p className="text-sm md:text-base text-gray-500">
            {t('ابحث عما تحتاجه في الأقسام الرئيسية', 'Find what you need in our main categories')}
          </p>
        </div>

        {/* Cards — Horizontal scroll on mobile, grid on desktop */}
        <div
          className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 xl:grid-cols-5 lg:overflow-x-visible lg:pb-0 md:gap-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CTA_CARDS.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(card.navigateTo)}
                className="group cursor-pointer shrink-0 w-[160px] sm:w-[180px] lg:w-auto"
              >
                <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 h-full">
                  {/* Image */}
                  <div className="relative h-32 sm:h-40 md:h-48 lg:h-56 overflow-hidden">
                    <Image
                      src={card.image}
                      alt={t(card.titleAr, card.titleEn)}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Dark overlay gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${card.gradient} opacity-60 group-hover:opacity-70 transition-opacity duration-300`} />

                    {/* Icon */}
                    <div className="absolute top-3 start-3 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative p-3 sm:p-4 bg-white">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                      {t(card.titleAr, card.titleEn)}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {t(card.descAr, card.descEn)}
                    </p>

                    {/* CTA Button */}
                    <div className="mt-2 sm:mt-3 flex items-center gap-1.5">
                      <span
                        className="text-xs font-semibold transition-colors"
                        style={{ color: card.color }}
                      >
                        {t('تصفح الآن', 'Browse Now')}
                      </span>
                      <svg
                        className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`}
                        style={{ color: card.color }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
