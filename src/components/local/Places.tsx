'use client';

import { useState } from 'react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ListingCard, getListingImages, formatPrice } from '@/components/ui/ListingCard';
import { MapPin, Clock, Star } from 'lucide-react';

const places = [
  {
    id: '1',
    nameEn: 'Qudsaya Old Bridge',
    nameAr: 'جسر قدسيا القديم',
    descEn: 'Historic Ottoman-era bridge with scenic river views.',
    descAr: 'جسر عثماني تاريخي بإطلالات نهرية خلابة.',
    locationEn: 'Riverside',
    locationAr: 'ضفاف النهر',
    rating: 4.7,
    categoryEn: 'Historical',
    categoryAr: 'أثري',
    hoursEn: 'Open 24h',
    hoursAr: 'مفتوح 24 ساعة',
  },
  {
    id: '2',
    nameEn: 'Central Park',
    nameAr: 'الحديقة المركزية',
    descEn: 'Family-friendly park with playground and walking paths.',
    descAr: 'حديقة عائلية مع ملعب ومسارات للمشي.',
    locationEn: 'City Center',
    locationAr: 'مركز المدينة',
    rating: 4.4,
    categoryEn: 'Park',
    categoryAr: 'حديقة',
    hoursEn: '6 AM - 10 PM',
    hoursAr: '6 ص - 10 م',
  },
  {
    id: '3',
    nameEn: 'Heritage Museum',
    nameAr: 'متحف التراث',
    descEn: 'Local heritage museum showcasing traditional crafts and artifacts.',
    descAr: 'متحف تراثي يعرض الحرف التقليدية والقطع الأثرية.',
    locationEn: 'Old Town',
    locationAr: 'المدينة القديمة',
    rating: 4.5,
    categoryEn: 'Museum',
    categoryAr: 'متحف',
    hoursEn: '9 AM - 5 PM',
    hoursAr: '9 ص - 5 م',
  },
];

export default function Places() {
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-sm">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {isArabic ? 'الأماكن السياحية' : 'Places to Visit'}
          </h2>
          <span className="text-xs text-gray-500">
            {places.length} {isArabic ? 'مكان' : 'places'}
          </span>
        </div>
      </div>

      {/* Horizontal Scrolling Cards */}
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {places.map((place, index) => (
          <ListingCard
            key={place.id}
            id={place.id}
            title={isArabic ? place.nameAr : place.nameEn}
            category="tourism"
            price={0}
            subtitle={isArabic ? place.descAr : place.descEn}
            rating={place.rating}
            badgeText={isArabic ? place.categoryAr : place.categoryEn}
            badgeColor="bg-teal-600/90 text-white"
            features={[
              { icon: Clock, label: isArabic ? place.hoursAr : place.hoursEn },
              { icon: MapPin, label: isArabic ? place.locationAr : place.locationEn },
            ]}
            imageIndex={index}
            isFavorite={favorites.includes(place.id)}
            onToggleFavorite={toggleFavorite}
            isScrollCard={true}
            onClick={() => navigate('listing-detail', { id: place.id })}
          />
        ))}
      </div>
    </section>
  );
}
