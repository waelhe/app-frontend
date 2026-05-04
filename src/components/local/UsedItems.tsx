'use client';

import { useState } from 'react';
import { Package, MapPin, Tag } from 'lucide-react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import {
  ListingCard,
  getListingImages,
  formatPrice,
} from '@/components/ui/ListingCard';

const usedItems = [
  {
    id: '1',
    titleEn: 'Samsung Galaxy S22',
    titleAr: 'سامسونغ غالاكسي S22',
    price: 2500000,
    conditionEn: 'Like New',
    conditionAr: 'كالجديد',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    categoryEn: 'Phones',
    categoryAr: 'هواتف',
    category: 'electronics',
  },
  {
    id: '2',
    titleEn: 'Wooden Dining Table',
    titleAr: 'طاولة طعام خشبية',
    price: 800000,
    conditionEn: 'Good',
    conditionAr: 'جيد',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    categoryEn: 'Furniture',
    categoryAr: 'أثاث',
    category: 'furniture',
  },
  {
    id: '3',
    titleEn: 'Kids Bicycle',
    titleAr: 'دراجة أطفال',
    price: 300000,
    conditionEn: 'Good',
    conditionAr: 'جيد',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    categoryEn: 'Sports',
    categoryAr: 'رياضة',
    category: 'furniture',
  },
  {
    id: '4',
    titleEn: 'Office Desk + Chair',
    titleAr: 'مكتب عمل + كرسي',
    price: 500000,
    conditionEn: 'Fair',
    conditionAr: 'مقبول',
    locationEn: 'Riverside Road',
    locationAr: 'طريق النهر',
    categoryEn: 'Furniture',
    categoryAr: 'أثاث',
    category: 'furniture',
  },
];

export default function UsedItems() {
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {isArabic ? 'المستعمل' : 'Used Items'}
          </h2>
          <p className="text-xs text-gray-400">
            {usedItems.length} {isArabic ? 'عنصر' : 'items'}
          </p>
        </div>
      </div>

      {/* Horizontal Scrolling Cards */}
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {usedItems.map((item, idx) => (
          <ListingCard
            key={item.id}
            id={item.id}
            title={isArabic ? item.titleAr : item.titleEn}
            category={item.category}
            price={item.price}
            subtitle={`${isArabic ? item.locationAr : item.locationEn} · ${isArabic ? item.conditionAr : item.conditionEn}`}
            rating={3.5 + Math.random() * 1.5}
            reviewCount={Math.floor(Math.random() * 20) + 1}
            isFavorite={favorites.includes(item.id)}
            onToggleFavorite={toggleFavorite}
            badgeText={isArabic ? item.conditionAr : item.conditionEn}
            badgeColor={
              item.conditionEn === 'Like New'
                ? 'bg-emerald-600/90 text-white'
                : item.conditionEn === 'Good'
                  ? 'bg-blue-600/90 text-white'
                  : 'bg-gray-600/90 text-white'
            }
            imageIndex={idx}
            isScrollCard={true}
            onClick={() => navigate('listing-detail', { id: item.id })}
          />
        ))}
      </div>
    </section>
  );
}
