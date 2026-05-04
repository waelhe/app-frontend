'use client';

import { useState } from 'react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ListingCard, getListingImages, formatPrice } from '@/components/ui/ListingCard';
import { Scissors, Clock } from 'lucide-react';

const beautySalons = [
  {
    id: '1',
    nameEn: 'Glamour Beauty Salon',
    nameAr: 'صالون غلامور للجمال',
    rating: 4.7,
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    hoursEn: '9 AM - 9 PM',
    hoursAr: '9 ص - 9 م',
    servicesEn: 'Hair, Nails, Makeup',
    servicesAr: 'شعر، أظافر، مكياج',
    price: 0,
  },
  {
    id: '2',
    nameEn: 'Rose Spa & Salon',
    nameAr: 'سبا وروز صالون',
    rating: 4.9,
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    hoursEn: '10 AM - 10 PM',
    hoursAr: '10 ص - 10 م',
    servicesEn: 'Spa, Massage, Facials',
    servicesAr: 'سبا، مساج، بشرة',
    price: 0,
  },
  {
    id: '3',
    nameEn: 'Elegant Cuts',
    nameAr: 'إليغانت كاتس',
    rating: 4.4,
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    hoursEn: '8 AM - 8 PM',
    hoursAr: '8 ص - 8 م',
    servicesEn: 'Haircuts, Styling',
    servicesAr: 'قص، تسريحات',
    price: 0,
  },
];

export default function Beauty() {
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
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-sm">
          <Scissors className="w-5 h-5 text-white" />
        </span>
        <span>{isArabic ? 'الجمال والعناية' : 'Beauty & Wellness'}</span>
        <span className="text-sm font-normal text-muted-foreground">({beautySalons.length})</span>
      </h2>

      {/* Horizontal Scrolling Cards */}
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {beautySalons.map((salon, idx) => (
          <ListingCard
            key={salon.id}
            id={salon.id}
            title={isArabic ? salon.nameAr : salon.nameEn}
            category="beauty"
            price={salon.price}
            subtitle={isArabic ? salon.locationAr : salon.locationEn}
            rating={salon.rating}
            badgeText={isArabic ? salon.servicesAr : salon.servicesEn}
            badgeColor="bg-pink-600/90 text-white"
            features={[
              { icon: Clock, label: isArabic ? salon.hoursAr : salon.hoursEn },
            ]}
            imageIndex={idx}
            isFavorite={favorites.includes(salon.id)}
            onToggleFavorite={toggleFavorite}
            onClick={() => navigate('listing-detail', { id: salon.id })}
            isScrollCard={true}
          />
        ))}
      </div>
    </section>
  );
}
