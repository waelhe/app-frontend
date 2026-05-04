'use client';

import { useState } from 'react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ListingCard, getListingImages, formatPrice } from '@/components/ui/ListingCard';
import { WashingMachine, Clock, Phone, MapPin } from 'lucide-react';

const laundryServices = [
  {
    id: '1',
    nameEn: 'Clean Star Laundry',
    nameAr: 'مغسلة نجمة النظافة',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-9019019',
    hoursEn: '7 AM - 9 PM',
    hoursAr: '7 ص - 9 م',
    serviceEn: 'Wash & Iron',
    serviceAr: 'غسيل وكوي',
    delivery: true,
  },
  {
    id: '2',
    nameEn: 'Fresh Dry Clean',
    nameAr: 'فريش دراي كلين',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-0120120',
    hoursEn: '8 AM - 8 PM',
    hoursAr: '8 ص - 8 م',
    serviceEn: 'Dry Cleaning',
    serviceAr: 'تنظيف جاف',
    delivery: false,
  },
  {
    id: '3',
    nameEn: 'Express Wash',
    nameAr: 'إكسبرس واش',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-1231231',
    hoursEn: '6 AM - 10 PM',
    hoursAr: '6 ص - 10 م',
    serviceEn: 'Express Service',
    serviceAr: 'خدمة سريعة',
    delivery: true,
  },
];

export default function LaundryServices() {
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
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-sm">
          <WashingMachine className="w-5 h-5 text-white" />
        </span>
        <span>{isArabic ? 'خدمات الغسيل' : 'Laundry Services'}</span>
        <span className="text-sm font-normal text-muted-foreground">({laundryServices.length})</span>
      </h2>
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {laundryServices.map((laundry, idx) => (
          <ListingCard
            key={laundry.id}
            id={laundry.id}
            title={isArabic ? laundry.nameAr : laundry.nameEn}
            category="services"
            price={0}
            subtitle={isArabic ? laundry.locationAr : laundry.locationEn}
            rating={4.1 + idx * 0.3}
            badgeText={isArabic ? laundry.serviceAr : laundry.serviceEn}
            badgeColor="bg-cyan-600/90 text-white"
            secondaryBadge={laundry.delivery ? (isArabic ? 'توصيل' : 'Delivery') : undefined}
            features={[
              { icon: Clock, label: isArabic ? laundry.hoursAr : laundry.hoursEn },
              { icon: Phone, label: laundry.phone },
            ]}
            imageIndex={idx}
            isFavorite={favorites.includes(laundry.id)}
            onToggleFavorite={toggleFavorite}
            isScrollCard={true}
            onClick={() => navigate('listing-detail', { id: laundry.id })}
          />
        ))}
      </div>
    </section>
  );
}
