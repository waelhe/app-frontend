'use client';

import { useState } from 'react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ListingCard, getListingImages, formatPrice } from '@/components/ui/ListingCard';
import { Coffee, Clock } from 'lucide-react';

const cafes = [
  {
    id: '1',
    nameEn: 'Café Latte House',
    nameAr: 'كافيه لاتيه هاوس',
    rating: 4.6,
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    hoursEn: '7 AM - 12 AM',
    hoursAr: '7 ص - 12 م',
    specialtyEn: 'Specialty Coffee',
    specialtyAr: 'قهوة مختصة',
    price: 0,
  },
  {
    id: '2',
    nameEn: 'Tea Garden',
    nameAr: 'حديقة الشاي',
    rating: 4.3,
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    hoursEn: '8 AM - 11 PM',
    hoursAr: '8 ص - 11 م',
    specialtyEn: 'Herbal Tea',
    specialtyAr: 'شاي أعشاب',
    price: 0,
  },
  {
    id: '3',
    nameEn: 'Bean & Brew',
    nameAr: 'بين آند برو',
    rating: 4.8,
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    hoursEn: '6 AM - 1 AM',
    hoursAr: '6 ص - 1 م',
    specialtyEn: 'Cold Brew',
    specialtyAr: 'كولد برو',
    price: 0,
  },
  {
    id: '4',
    nameEn: 'Oasis Café',
    nameAr: 'كافيه الواحة',
    rating: 4.1,
    locationEn: 'Riverside Road',
    locationAr: 'طريق النهر',
    hoursEn: '9 AM - 10 PM',
    hoursAr: '9 ص - 10 م',
    specialtyEn: 'Arabic Coffee',
    specialtyAr: 'قهوة عربية',
    price: 0,
  },
];

export default function Cafes() {
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
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
          <Coffee className="w-5 h-5 text-white" />
        </span>
        <span>{isArabic ? 'المقاهي' : 'Cafes'}</span>
        <span className="text-sm font-normal text-muted-foreground">({cafes.length})</span>
      </h2>

      {/* Horizontal Scrolling Cards */}
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {cafes.map((cafe, idx) => (
          <ListingCard
            key={cafe.id}
            id={cafe.id}
            title={isArabic ? cafe.nameAr : cafe.nameEn}
            category="dining"
            price={cafe.price}
            subtitle={isArabic ? cafe.locationAr : cafe.locationEn}
            rating={cafe.rating}
            badgeText={isArabic ? cafe.specialtyAr : cafe.specialtyEn}
            badgeColor="bg-amber-600/90 text-white"
            features={[
              { icon: Clock, label: isArabic ? cafe.hoursAr : cafe.hoursEn },
            ]}
            imageIndex={idx}
            isFavorite={favorites.includes(cafe.id)}
            onToggleFavorite={toggleFavorite}
            onClick={() => navigate('listing-detail', { id: cafe.id })}
            isScrollCard={true}
          />
        ))}
      </div>
    </section>
  );
}
