'use client';

import { useState } from 'react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ListingCard, getListingImages, formatPrice } from '@/components/ui/ListingCard';
import { ShoppingCart, Clock, Phone, MapPin } from 'lucide-react';

const markets = [
  {
    id: '1',
    nameEn: 'Al-Madina Supermarket',
    nameAr: 'سوبرماركت المدينة',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-3213213',
    hoursEn: '7 AM - 11 PM',
    hoursAr: '7 ص - 11 م',
    typeEn: 'Supermarket',
    typeAr: 'سوبرماركت',
  },
  {
    id: '2',
    nameEn: 'Al-Baraka Market',
    nameAr: 'سوق البركة',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-4324324',
    hoursEn: '6 AM - 10 PM',
    hoursAr: '6 ص - 10 م',
    typeEn: 'Grocery',
    typeAr: 'بقالة',
  },
  {
    id: '3',
    nameEn: 'Fresh Fruits Market',
    nameAr: 'سوق الفواكه الطازجة',
    locationEn: 'Old Market Area',
    locationAr: 'منطقة السوق القديم',
    phone: '011-5435435',
    hoursEn: '5 AM - 8 PM',
    hoursAr: '5 ص - 8 م',
    typeEn: 'Fruits & Vegetables',
    typeAr: 'خضار وفواكه',
  },
  {
    id: '4',
    nameEn: 'Butcher Shop Al-Safa',
    nameAr: 'ملحمة الصفا',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-6546546',
    hoursEn: '7 AM - 9 PM',
    hoursAr: '7 ص - 9 م',
    typeEn: 'Butcher',
    typeAr: 'ملحمة',
  },
];

export default function Markets() {
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
          <ShoppingCart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {isArabic ? 'الأسواق' : 'Markets'}
          </h2>
          <span className="text-xs text-gray-500">
            {markets.length} {isArabic ? 'سوق' : 'markets'}
          </span>
        </div>
      </div>

      {/* Horizontal Scrolling Cards */}
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {markets.map((market, index) => (
          <ListingCard
            key={market.id}
            id={market.id}
            title={isArabic ? market.nameAr : market.nameEn}
            category="markets"
            price={0}
            subtitle={isArabic ? market.locationAr : market.locationEn}
            rating={4.0 + Math.random() * 1.0}
            badgeText={isArabic ? market.typeAr : market.typeEn}
            badgeColor="bg-emerald-600/90 text-white"
            features={[
              { icon: Clock, label: isArabic ? market.hoursAr : market.hoursEn },
              { icon: Phone, label: market.phone },
              { icon: MapPin, label: isArabic ? market.locationAr : market.locationEn },
            ]}
            imageIndex={index}
            isFavorite={favorites.includes(market.id)}
            onToggleFavorite={toggleFavorite}
            isScrollCard={true}
            onClick={() => navigate('listing-detail', { id: market.id })}
          />
        ))}
      </div>
    </section>
  );
}
