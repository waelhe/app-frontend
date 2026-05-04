'use client';

import { useState } from 'react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ListingCard, getListingImages, formatPrice } from '@/components/ui/ListingCard';
import { Fuel, Clock, Phone, MapPin } from 'lucide-react';

const gasStations = [
  {
    id: '1',
    nameEn: 'Al-Fayhaa Station',
    nameAr: 'محطة الفيحاء',
    locationEn: 'Highway Entry',
    locationAr: 'مدخل السريع',
    phone: '011-9999999',
    hoursEn: '24 Hours',
    hoursAr: '24 ساعة',
    fuelTypes: ['Diesel', 'Gasoline', 'Gas'],
    fuelTypesAr: ['ديزل', 'بنزين', 'غاز'],
    hasShop: true,
  },
  {
    id: '2',
    nameEn: 'National Oil Station',
    nameAr: 'محطة النفط الوطنية',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-1010101',
    hoursEn: '6 AM - 12 AM',
    hoursAr: '6 ص - 12 م',
    fuelTypes: ['Diesel', 'Gasoline'],
    fuelTypesAr: ['ديزل', 'بنزين'],
    hasShop: false,
  },
  {
    id: '3',
    nameEn: 'City Fuel Center',
    nameAr: 'مركز وقود المدينة',
    locationEn: 'Qudsaya Dahia',
    locationAr: 'ضاحية قدسيا',
    phone: '011-2020202',
    hoursEn: '24 Hours',
    hoursAr: '24 ساعة',
    fuelTypes: ['Gasoline', 'Gas'],
    fuelTypesAr: ['بنزين', 'غاز'],
    hasShop: true,
  },
];

export default function GasStations() {
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
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
          <Fuel className="w-5 h-5 text-white" />
        </span>
        <span>{isArabic ? 'محطات الوقود' : 'Gas Stations'}</span>
        <span className="text-sm font-normal text-muted-foreground">({gasStations.length})</span>
      </h2>
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {gasStations.map((station, idx) => (
          <ListingCard
            key={station.id}
            id={station.id}
            title={isArabic ? station.nameAr : station.nameEn}
            category="car-services"
            price={0}
            subtitle={isArabic ? station.locationAr : station.locationEn}
            rating={3.8 + idx * 0.5}
            badgeText={isArabic ? station.fuelTypesAr[0] : station.fuelTypes[0]}
            badgeColor="bg-green-600/90 text-white"
            secondaryBadge={station.hasShop ? (isArabic ? 'سوق' : 'Shop') : undefined}
            features={[
              { icon: Clock, label: isArabic ? station.hoursAr : station.hoursEn },
              { icon: Phone, label: station.phone },
            ]}
            imageIndex={idx}
            isFavorite={favorites.includes(station.id)}
            onToggleFavorite={toggleFavorite}
            isScrollCard={true}
            onClick={() => navigate('listing-detail', { id: station.id })}
          />
        ))}
      </div>
    </section>
  );
}
