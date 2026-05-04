'use client';

import { useState } from 'react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ListingCard, getListingImages, formatPrice } from '@/components/ui/ListingCard';
import { Bus, Clock, Phone, MapPin } from 'lucide-react';

const transportServices = [
  {
    id: '1',
    nameEn: 'City Bus Terminal',
    nameAr: 'محطة حافلات المدينة',
    typeEn: 'Bus',
    typeAr: 'حافلات',
    locationEn: 'Central Station',
    locationAr: 'المحطة المركزية',
    phone: '011-4455667',
    hoursEn: '5 AM - 11 PM',
    hoursAr: '5 ص - 11 م',
  },
  {
    id: '2',
    nameEn: 'Al-Safwa Taxi',
    nameAr: 'تاكسي الصفوة',
    typeEn: 'Taxi',
    typeAr: 'تاكسي',
    locationEn: 'Citywide',
    locationAr: 'أنحاء المدينة',
    phone: '011-5566778',
    hoursEn: '24 Hours',
    hoursAr: '24 ساعة',
  },
  {
    id: '3',
    nameEn: 'RideShare Service',
    nameAr: 'خدمة المشاركة بالنقل',
    typeEn: 'Ride Share',
    typeAr: 'نقل مشترك',
    locationEn: 'App-based',
    locationAr: 'عبر التطبيق',
    phone: '011-6677889',
    hoursEn: '24 Hours',
    hoursAr: '24 ساعة',
  },
  {
    id: '4',
    nameEn: 'Mini Bus Service',
    nameAr: 'خدمة الميني باص',
    typeEn: 'Mini Bus',
    typeAr: 'ميني باص',
    locationEn: 'Multiple Routes',
    locationAr: 'مسارات متعددة',
    phone: '011-7788990',
    hoursEn: '6 AM - 10 PM',
    hoursAr: '6 ص - 10 م',
  },
];

export default function Transport() {
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
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-sm">
          <Bus className="w-5 h-5 text-white" />
        </span>
        <span>{isArabic ? 'النقل والمواصلات' : 'Transport'}</span>
        <span className="text-sm font-normal text-muted-foreground">({transportServices.length})</span>
      </h2>
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {transportServices.map((service, idx) => (
          <ListingCard
            key={service.id}
            id={service.id}
            title={isArabic ? service.nameAr : service.nameEn}
            category="transport"
            price={0}
            subtitle={isArabic ? service.locationAr : service.locationEn}
            rating={4.0 + idx * 0.25}
            badgeText={isArabic ? service.typeAr : service.typeEn}
            badgeColor="bg-sky-600/90 text-white"
            features={[
              { icon: Clock, label: isArabic ? service.hoursAr : service.hoursEn },
              { icon: Phone, label: service.phone },
            ]}
            imageIndex={idx}
            isFavorite={favorites.includes(service.id)}
            onToggleFavorite={toggleFavorite}
            isScrollCard={true}
            onClick={() => navigate('listing-detail', { id: service.id })}
          />
        ))}
      </div>
    </section>
  );
}
