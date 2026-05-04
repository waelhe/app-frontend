'use client';

import { useState } from 'react';
import { Newspaper, MapPin, Clock, User, Tag, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import {
  ListingCard,
  getListingImages,
  formatPrice,
} from '@/components/ui/ListingCard';

const classifieds = [
  {
    id: '1',
    titleEn: 'Apartment for Rent - 2 Rooms',
    titleAr: 'شقة للإيجار - غرفتين',
    categoryEn: 'Real Estate',
    categoryAr: 'عقارات',
    category: 'real-estate',
    price: 300000,
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    posted: '1 hour ago',
    sellerEn: 'Abu Ahmad',
    sellerAr: 'أبو أحمد',
    isUrgent: false,
    isVerified: true,
  },
  {
    id: '2',
    titleEn: 'Home Tutor Available',
    titleAr: 'معلم خصوصي متاح',
    categoryEn: 'Services',
    categoryAr: 'خدمات',
    category: 'services',
    price: 5000,
    locationEn: 'Citywide',
    locationAr: 'أنحاء المدينة',
    posted: '3 hours ago',
    sellerEn: 'M. Khaled',
    sellerAr: 'م. خالد',
    isUrgent: true,
    isVerified: false,
  },
  {
    id: '3',
    titleEn: 'Used Washing Machine',
    titleAr: 'غسالة مستعملة',
    categoryEn: 'For Sale',
    categoryAr: 'للبيع',
    category: 'furniture',
    price: 150000,
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    posted: '1 day ago',
    sellerEn: 'Um Hassan',
    sellerAr: 'أم حسن',
    isUrgent: false,
    isVerified: true,
  },
  {
    id: '4',
    titleEn: 'Car for Sale - 2018 Model',
    titleAr: 'سيارة للبيع - موديل 2018',
    categoryEn: 'Vehicles',
    categoryAr: 'مركبات',
    category: 'cars',
    price: 25000000,
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    posted: '2 days ago',
    sellerEn: 'Youssef',
    sellerAr: 'يوسف',
    isUrgent: false,
    isVerified: true,
  },
];

export default function Classifieds() {
  const { language, isRTL } = useLanguage();
  const isArabic = language === 'ar';
  const navigate = useNavigationStore((s) => s.navigate);
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <section className="py-4">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
          <Newspaper className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {isArabic ? 'الإعلانات المبوبة' : 'Classifieds'}
          </h2>
          <p className="text-xs text-gray-400">
            {classifieds.length} {isArabic ? 'إعلان' : 'ads'}
          </p>
        </div>
      </div>

      {/* Horizontal Scrolling Cards */}
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {classifieds.map((ad, idx) => (
          <ListingCard
            key={ad.id}
            id={ad.id}
            title={isArabic ? ad.titleAr : ad.titleEn}
            category={ad.category}
            price={ad.price}
            subtitle={`${isArabic ? ad.locationAr : ad.locationEn} · ${ad.posted}`}
            rating={3.5 + Math.random() * 1.5}
            reviewCount={Math.floor(Math.random() * 30) + 1}
            isFavorite={favorites.includes(ad.id)}
            onToggleFavorite={toggleFavorite}
            badgeText={isArabic ? ad.categoryAr : ad.categoryEn}
            badgeColor="bg-violet-600/90 text-white"
            secondaryBadge={
              ad.isVerified
                ? (isArabic ? '✓ موثق' : '✓ Verified')
                : ad.isUrgent
                  ? (isArabic ? '🔴 عاجل' : '🔴 Urgent')
                  : undefined
            }
            imageIndex={idx}
            isScrollCard={true}
            onClick={() => navigate('listing-detail', { id: ad.id })}
          />
        ))}
      </div>
    </section>
  );
}
