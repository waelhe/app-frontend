'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigationStore } from '@/stores/navigationStore';
import { Button } from '@/components/ui/button';

interface Slide {
  id: number;
  image: string;
  categoryAr: string;
  categoryEn: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&h=600&fit=crop&q=80',
    categoryAr: 'مطاعم',
    categoryEn: 'Restaurants',
    titleAr: 'أفضل المطاعم في منطقتك',
    titleEn: 'Best Restaurants Near You',
    subtitleAr: 'اكتشف أشهى المأكولات والمشروبات في المطاعم المحلية المميزة',
    subtitleEn: 'Discover the most delicious food and drinks at featured local restaurants',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1400&h=600&fit=crop&q=80',
    categoryAr: 'طبية',
    categoryEn: 'Medical',
    titleAr: 'خدمات طبية موثوقة',
    titleEn: 'Trusted Medical Services',
    subtitleAr: 'أطباء وعيادات ومختبرات طبية بمعايير عالية من الجودة',
    subtitleEn: 'Doctors, clinics, and labs with high quality standards',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&h=600&fit=crop&q=80',
    categoryAr: 'عقارات',
    categoryEn: 'Real Estate',
    titleAr: 'عقاراتك في المكان المناسب',
    titleEn: 'Your Real Estate in the Right Place',
    subtitleAr: 'شقق ومنازل ومكاتب للبيع والإيجار بأفضل الأسعار',
    subtitleEn: 'Apartments, houses, and offices for sale and rent at best prices',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400&h=600&fit=crop&q=80',
    categoryAr: 'حرفيين',
    categoryEn: 'Craftsmen',
    titleAr: 'حرفيون محترفون',
    titleEn: 'Professional Craftsmen',
    subtitleAr: 'سباكة وكهرباء ودهان وجميع الحرف بأيدي خبراء موثوقين',
    subtitleEn: 'Plumbing, electrical, painting, and all crafts by trusted experts',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=600&fit=crop&q=80',
    categoryAr: 'أسواق',
    categoryEn: 'Markets',
    titleAr: 'تسوق من الأسواق المحلية',
    titleEn: 'Shop from Local Markets',
    subtitleAr: 'منتجات محلية طازجة وبضائع متنوعة من أقرب سوق إليك',
    subtitleEn: 'Fresh local products and diverse goods from the nearest market',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1400&h=600&fit=crop&q=80',
    categoryAr: 'وظائف',
    categoryEn: 'Jobs',
    titleAr: 'فرص عمل متنوعة',
    titleEn: 'Diverse Job Opportunities',
    subtitleAr: 'اعثر على الوظيفة المناسبة لك أو أعلن عن حاجتك لموظفين',
    subtitleEn: 'Find the right job for you or post your hiring needs',
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { language, t, isRTL } = useLanguage();
  const navigate = useNavigationStore((s) => s.navigate);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [goToNext]);

  const slide = slides[currentSlide];

  return (
    <section className="relative w-full h-[350px] sm:h-[400px] md:h-[480px] lg:h-[550px] overflow-hidden">
      {/* Background Image with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10"
        >
          {/* Category Badge */}
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block bg-red-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4"
          >
            {language === 'ar' ? slide.categoryAr : slide.categoryEn}
          </motion.span>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 max-w-3xl leading-tight">
            {language === 'ar' ? slide.titleAr : slide.titleEn}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-white/80 mb-6 max-w-2xl leading-relaxed">
            {language === 'ar' ? slide.subtitleAr : slide.subtitleEn}
          </p>

          {/* CTA Button */}
          <Button
            size="lg"
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-full text-base shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => navigate('market')}
          >
            {t('hero.cta')}
          </Button>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className={`absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 flex items-center justify-center transition-all duration-300 ${
          isRTL ? 'right-4 sm:right-8' : 'left-4 sm:left-8'
        }`}
        aria-label="Previous slide"
      >
        {isRTL ? (
          <ChevronRight className="w-5 h-5 text-white" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-white" />
        )}
      </button>
      <button
        onClick={goToNext}
        className={`absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 flex items-center justify-center transition-all duration-300 ${
          isRTL ? 'left-4 sm:left-8' : 'right-4 sm:right-8'
        }`}
        aria-label="Next slide"
      >
        {isRTL ? (
          <ChevronLeft className="w-5 h-5 text-white" />
        ) : (
          <ChevronRight className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentSlide
                ? 'w-8 bg-red-500'
                : 'w-2 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
