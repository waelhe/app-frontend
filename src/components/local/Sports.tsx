'use client';

import { useState } from 'react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ListingCard, getListingImages, formatPrice } from '@/components/ui/ListingCard';
import { Dumbbell, Clock, Phone, MapPin } from 'lucide-react';

const sportsCenters = [
  {
    id: '1',
    nameEn: 'Power Gym',
    nameAr: 'باور جيم',
    typeEn: 'Gym',
    typeAr: 'صالة رياضية',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-6767676',
    hoursEn: '6 AM - 11 PM',
    hoursAr: '6 ص - 11 م',
  },
  {
    id: '2',
    nameEn: 'Olympic Sports Club',
    nameAr: 'نادي الأولمبي الرياضي',
    typeEn: 'Sports Club',
    typeAr: 'نادي رياضي',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-7878787',
    hoursEn: '7 AM - 10 PM',
    hoursAr: '7 ص - 10 م',
  },
  {
    id: '3',
    nameEn: 'Aqua Swimming Pool',
    nameAr: 'مسبح أكوا',
    typeEn: 'Swimming',
    typeAr: 'سباحة',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-8989898',
    hoursEn: '8 AM - 9 PM',
    hoursAr: '8 ص - 9 م',
  },
  {
    id: '4',
    nameEn: 'Karate Academy',
    nameAr: 'أكاديمية الكاراتيه',
    typeEn: 'Martial Arts',
    typeAr: 'فنون قتالية',
    locationEn: 'Riverside Road',
    locationAr: 'طريق النهر',
    phone: '011-9090909',
    hoursEn: '4 PM - 9 PM',
    hoursAr: '4 م - 9 م',
  },
];

export default function Sports() {
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-sm">
          <Dumbbell className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {isArabic ? 'الرياضة واللياقة' : 'Sports & Fitness'}
          </h2>
          <span className="text-xs text-gray-500">
            {sportsCenters.length} {isArabic ? 'مركز' : 'centers'}
          </span>
        </div>
      </div>

      {/* Horizontal Scrolling Cards */}
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {sportsCenters.map((center, index) => (
          <ListingCard
            key={center.id}
            id={center.id}
            title={isArabic ? center.nameAr : center.nameEn}
            category="sports"
            price={0}
            subtitle={isArabic ? center.locationAr : center.locationEn}
            rating={4.0 + Math.random() * 1.0}
            badgeText={isArabic ? center.typeAr : center.typeEn}
            badgeColor="bg-orange-600/90 text-white"
            features={[
              { icon: Clock, label: isArabic ? center.hoursAr : center.hoursEn },
              { icon: Phone, label: center.phone },
              { icon: MapPin, label: isArabic ? center.locationAr : center.locationEn },
            ]}
            imageIndex={index}
            isFavorite={favorites.includes(center.id)}
            onToggleFavorite={toggleFavorite}
            isScrollCard={true}
            onClick={() => navigate('listing-detail', { id: center.id })}
          />
        ))}
      </div>
    </section>
  );
}
