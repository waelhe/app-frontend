'use client';

import { useState } from 'react';
import { BedDouble, Star, MapPin, Phone, Wifi, Car as CarIcon, UtensilsCrossed, Coffee } from 'lucide-react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import {
  ListingCard,
  ViewAllCard,
  getListingImages,
  formatPrice,
} from '@/components/ui/ListingCard';

const hotels = [
  {
    id: '1',
    nameEn: 'Qudsaya Grand Hotel',
    nameAr: 'فندق قدسيا الكبير',
    rating: 4.5,
    priceFrom: 25000,
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-1112233',
    amenitiesEn: ['WiFi', 'Parking', 'Restaurant'],
    amenitiesAr: ['واي فاي', 'موقف سيارات', 'مطعم'],
    features: [
      { icon: Wifi, label: 'WiFi' },
      { icon: CarIcon, label: 'Parking' },
    ],
  },
  {
    id: '2',
    nameEn: 'Riverside Inn',
    nameAr: 'نزل ريفرسايد',
    rating: 4.2,
    priceFrom: 15000,
    locationEn: 'Riverside Road',
    locationAr: 'طريق النهر',
    phone: '011-2223344',
    amenitiesEn: ['WiFi', 'AC'],
    amenitiesAr: ['واي فاي', 'تكييف'],
    features: [
      { icon: Wifi, label: 'WiFi' },
      { icon: Coffee, label: 'Breakfast' },
    ],
  },
  {
    id: '3',
    nameEn: 'Al-Raeda Suites',
    nameAr: 'أجنحة الرائدة',
    rating: 4.8,
    priceFrom: 40000,
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-3334455',
    amenitiesEn: ['WiFi', 'Pool', 'Gym', 'Spa'],
    amenitiesAr: ['واي فاي', 'مسبح', 'صالة رياضية', 'سبا'],
    features: [
      { icon: Wifi, label: 'WiFi' },
      { icon: CarIcon, label: 'Parking' },
      { icon: UtensilsCrossed, label: 'Restaurant' },
    ],
  },
  {
    id: '4',
    nameEn: 'Dahia Plaza Hotel',
    nameAr: 'فندق ضاحية بلازا',
    rating: 4.1,
    priceFrom: 18000,
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-4445566',
    amenitiesEn: ['WiFi', 'AC', 'Parking'],
    amenitiesAr: ['واي فاي', 'تكييف', 'موقف سيارات'],
    features: [
      { icon: Wifi, label: 'WiFi' },
      { icon: CarIcon, label: 'Parking' },
    ],
  },
];

export default function Hotels() {
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-sm">
          <BedDouble className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {isArabic ? 'الفنادق' : 'Hotels'}
          </h2>
          <p className="text-xs text-gray-400">
            {hotels.length} {isArabic ? 'فندق' : 'hotels'}
          </p>
        </div>
      </div>

      {/* Horizontal Scrolling Cards */}
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {hotels.map((hotel, idx) => (
          <ListingCard
            key={hotel.id}
            id={hotel.id}
            title={isArabic ? hotel.nameAr : hotel.nameEn}
            category="hotels"
            price={hotel.priceFrom}
            subtitle={isArabic ? hotel.locationAr : hotel.locationEn}
            rating={hotel.rating}
            reviewCount={Math.floor(Math.random() * 200) + 20}
            isFavorite={favorites.includes(hotel.id)}
            onToggleFavorite={toggleFavorite}
            badgeText={isArabic ? 'فندق' : 'Hotel'}
            badgeColor="bg-purple-600/90 text-white"
            secondaryBadge={hotel.rating >= 4.5 ? (isArabic ? '⭐ مميز' : '⭐ Featured') : undefined}
            features={hotel.features.map((f) => ({ icon: f.icon, label: f.label }))}
            images={getListingImages('hotels', idx)}
            imageIndex={idx}
            isScrollCard={true}
            onClick={() => navigate('listing-detail', { id: hotel.id })}
          />
        ))}
      </div>
    </section>
  );
}
