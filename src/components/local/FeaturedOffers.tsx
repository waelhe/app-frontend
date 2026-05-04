'use client';

import React from 'react';
import { Tag, Clock, Flame, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/stores/languageStore';
import { useRegion } from '@/stores/regionStore';

interface Offer {
  id: string;
  title: string;
  titleEn: string;
  store: string;
  storeEn: string;
  discount: string;
  oldPrice: string;
  newPrice: string;
  endTime: string;
  image: string;
  badge?: string;
  badgeEn?: string;
}

// ── Region-specific offer data ───────────────────────────────────────

const qudsayaCenterOffers: Offer[] = [
  {
    id: 'q1',
    title: 'عرض خاص على المنتجات الغذائية',
    titleEn: 'Special Food Offer',
    store: 'سوبر ماركت قدسيا',
    storeEn: 'Qudsaya Supermarket',
    discount: '30%',
    oldPrice: '50,000',
    newPrice: '35,000',
    endTime: 'ينتهي غداً',
    badge: 'محدود',
    badgeEn: 'Limited',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'q2',
    title: 'خصم على الملابس الشتوية',
    titleEn: 'Winter Clothes Sale',
    store: 'محل الأناقة',
    storeEn: 'Elegance Store',
    discount: '50%',
    oldPrice: '120,000',
    newPrice: '60,000',
    endTime: '3 أيام متبقية',
    badge: 'حصري',
    badgeEn: 'Exclusive',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'q3',
    title: 'عروض الأجهزة الكهربائية',
    titleEn: 'Electronics Deals',
    store: 'إلكترون قدسيا',
    storeEn: 'Qudsaya Electronics',
    discount: '25%',
    oldPrice: '200,000',
    newPrice: '150,000',
    endTime: '5 أيام متبقية',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80',
  },
];

const qudsayaDahiaOffers: Offer[] = [
  {
    id: 'd1',
    title: 'عرض خاص على المنتجات الغذائية',
    titleEn: 'Special Food Offer',
    store: 'سوبر ماركت الضاحية',
    storeEn: 'Dahia Supermarket',
    discount: '25%',
    oldPrice: '55,000',
    newPrice: '40,000',
    endTime: 'ينتهي بعد غد',
    badge: 'جديد',
    badgeEn: 'New',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'd2',
    title: 'خصم على الأجهزة الكهربائية',
    titleEn: 'Electronics Discount',
    store: 'محل الإلكترونيات',
    storeEn: 'Electronics Store',
    discount: '40%',
    oldPrice: '140,000',
    newPrice: '85,000',
    endTime: '5 أيام متبقية',
    badge: 'حصري',
    badgeEn: 'Exclusive',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'd3',
    title: 'عروض المطاعم',
    titleEn: 'Restaurant Offers',
    store: 'مطعم الليمون',
    storeEn: 'Lemon Restaurant',
    discount: '20%',
    oldPrice: '30,000',
    newPrice: '24,000',
    endTime: 'أسبوع متبقي',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80',
  },
];

const dimasOffers: Offer[] = [
  {
    id: 'dm1',
    title: 'عروض معدات البناء',
    titleEn: 'Building Supplies Sale',
    store: 'مستودع الديماس',
    storeEn: 'Dimas Warehouse',
    discount: '35%',
    oldPrice: '80,000',
    newPrice: '52,000',
    endTime: 'ينتهي غداً',
    badge: 'محدود',
    badgeEn: 'Limited',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'dm2',
    title: 'خصم على المواد الغذائية',
    titleEn: 'Grocery Discount',
    store: 'سوبرماركت الديماس',
    storeEn: 'Dimas Supermarket',
    discount: '20%',
    oldPrice: '45,000',
    newPrice: '36,000',
    endTime: '3 أيام متبقية',
    badge: 'حصري',
    badgeEn: 'Exclusive',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'dm3',
    title: 'عروض الأثاث المنزلي',
    titleEn: 'Home Furniture Deals',
    store: 'معرض الديماس',
    storeEn: 'Dimas Gallery',
    discount: '40%',
    oldPrice: '300,000',
    newPrice: '180,000',
    endTime: 'أسبوع متبقي',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
  },
];

/**
 * Map region IDs to offer arrays.
 * - 'qudsaya' → qudsayaCenterOffers
 * - 'dahia'   → qudsayaDahiaOffers
 * - 'dimas'   → dimasOffers
 * - 'all'     → qudsayaCenterOffers (default fallback)
 */
const dataByRegion: Record<string, Offer[]> = {
  qudsaya: qudsayaCenterOffers,
  dahia: qudsayaDahiaOffers,
  dimas: dimasOffers,
  all: qudsayaCenterOffers,
};

export default function FeaturedOffers() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { selectedRegion } = useRegion();

  const offers = dataByRegion[selectedRegion.id] ?? qudsayaCenterOffers;
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-rose-500/10 via-orange-500/10 to-pink-500/10 border border-rose-200/50 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">
            {isArabic ? '🔥 عروض حصرية' : '🔥 Exclusive Offers'}
          </h3>
          <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-sm rounded-full font-medium">
            {offers.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('right')}
            className="p-1.5 hover:bg-gray-200/50 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
          <button
            onClick={() => scroll('left')}
            className="p-1.5 hover:bg-gray-200/50 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Offers carousel — larger cards */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {offers.map((offer) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-shrink-0 w-52 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
          >
            {/* Image — larger */}
            <div className="relative h-32 overflow-hidden">
              <img
                src={offer.image}
                alt={isArabic ? offer.title : offer.titleEn}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

              {/* Discount badge */}
              <div className="absolute top-2 right-2 px-2.5 py-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-bold rounded-lg flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {offer.discount}
              </div>

              {/* Yellow "محدود/حصري" badge */}
              {offer.badge && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-lg">
                  {isArabic ? offer.badge : offer.badgeEn}
                </div>
              )}
            </div>

            {/* Content — expanded */}
            <div className="p-3">
              <h4 className="text-sm font-bold text-gray-800 line-clamp-1 mb-1">
                {isArabic ? offer.title : offer.titleEn}
              </h4>
              <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                <Store className="w-3 h-3" />
                {isArabic ? offer.store : offer.storeEn}
              </p>

              {/* Full pricing — old strikethrough + new price */}
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-rose-600">
                  {offer.newPrice}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  {offer.oldPrice}
                </span>
              </div>

              {/* Relative time */}
              <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                <Clock className="w-3 h-3" />
                {offer.endTime}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
