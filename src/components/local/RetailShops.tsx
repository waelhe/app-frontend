'use client';

import { useState } from 'react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ListingCard, getListingImages, formatPrice } from '@/components/ui/ListingCard';
import { Store, Clock, Phone, MapPin } from 'lucide-react';

const retailShops = [
  {
    id: '1',
    nameEn: 'Fashion House',
    nameAr: 'بيت الأزياء',
    categoryEn: 'Clothing',
    categoryAr: 'ملابس',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-7657657',
    hoursEn: '10 AM - 9 PM',
    hoursAr: '10 ص - 9 م',
  },
  {
    id: '2',
    nameEn: 'Tech Zone',
    nameAr: 'تك زون',
    categoryEn: 'Electronics',
    categoryAr: 'إلكترونيات',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-8768768',
    hoursEn: '9 AM - 10 PM',
    hoursAr: '9 ص - 10 م',
  },
  {
    id: '3',
    nameEn: 'Home Decor Plus',
    nameAr: 'هوم دييكور بلس',
    categoryEn: 'Home & Decor',
    categoryAr: 'منزل وديكور',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-9879879',
    hoursEn: '10 AM - 8 PM',
    hoursAr: '10 ص - 8 م',
  },
  {
    id: '4',
    nameEn: 'Kids World',
    nameAr: 'عالم الأطفال',
    categoryEn: 'Kids & Toys',
    categoryAr: 'أطفال وألعاب',
    locationEn: 'Riverside Mall',
    locationAr: 'مول ريفرسايد',
    phone: '011-0980980',
    hoursEn: '10 AM - 10 PM',
    hoursAr: '10 ص - 10 م',
  },
];

export default function RetailShops() {
  const { language } = useLanguage();
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-sm">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {isArabic ? 'المتاجر التجارية' : 'Retail Shops'}
          </h2>
          <span className="text-xs text-gray-500">
            {retailShops.length} {isArabic ? 'متجر' : 'shops'}
          </span>
        </div>
      </div>

      {/* Horizontal Scrolling Cards */}
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {retailShops.map((shop, index) => (
          <ListingCard
            key={shop.id}
            id={shop.id}
            title={isArabic ? shop.nameAr : shop.nameEn}
            category="shopping"
            price={0}
            subtitle={isArabic ? shop.locationAr : shop.locationEn}
            rating={4.0 + Math.random() * 1.0}
            badgeText={isArabic ? shop.categoryAr : shop.categoryEn}
            badgeColor="bg-pink-600/90 text-white"
            features={[
              { icon: Clock, label: isArabic ? shop.hoursAr : shop.hoursEn },
              { icon: Phone, label: shop.phone },
              { icon: MapPin, label: isArabic ? shop.locationAr : shop.locationEn },
            ]}
            imageIndex={index}
            isFavorite={favorites.includes(shop.id)}
            onToggleFavorite={toggleFavorite}
            isScrollCard={true}
            onClick={() => navigate('listing-detail', { id: shop.id })}
          />
        ))}
      </div>
    </section>
  );
}
