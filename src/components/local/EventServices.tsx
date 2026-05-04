'use client';

import { useState } from 'react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ListingCard, getListingImages, formatPrice } from '@/components/ui/ListingCard';
import { PartyPopper, MapPin, Phone, Star } from 'lucide-react';

const eventServices = [
  {
    id: '1',
    nameEn: 'Dream Events',
    nameAr: 'أحداث الحلم',
    typeEn: 'Wedding Planning',
    typeAr: 'تنظيم أعراس',
    rating: 4.9,
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-2342343',
  },
  {
    id: '2',
    nameEn: 'Party Hall Rental',
    nameAr: 'تأجير قاعات الحفلات',
    typeEn: 'Venue Rental',
    typeAr: 'تأجير قاعات',
    rating: 4.6,
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-3453454',
  },
  {
    id: '3',
    nameEn: 'Sweet Table Catering',
    nameAr: 'تموين طاولة الحلويات',
    typeEn: 'Catering',
    typeAr: 'تموين',
    rating: 4.7,
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-4564565',
  },
  {
    id: '4',
    nameEn: 'Flower & Decor',
    nameAr: 'زهور وديكور',
    typeEn: 'Decoration',
    typeAr: 'ديكور',
    rating: 4.5,
    locationEn: 'Riverside Road',
    locationAr: 'طريق النهر',
    phone: '011-5675676',
  },
];

export default function EventServices() {
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
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-sm">
          <PartyPopper className="w-5 h-5 text-white" />
        </span>
        <span>{isArabic ? 'خدمات الفعاليات' : 'Event Services'}</span>
        <span className="text-sm font-normal text-muted-foreground">({eventServices.length})</span>
      </h2>
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {eventServices.map((service, idx) => (
          <ListingCard
            key={service.id}
            id={service.id}
            title={isArabic ? service.nameAr : service.nameEn}
            category="experiences"
            price={0}
            subtitle={isArabic ? service.locationAr : service.locationEn}
            rating={service.rating}
            badgeText={isArabic ? service.typeAr : service.typeEn}
            badgeColor="bg-pink-600/90 text-white"
            secondaryBadge={service.rating >= 4.7 ? (isArabic ? 'مميز' : 'Featured') : undefined}
            features={[
              { icon: MapPin, label: isArabic ? service.locationAr : service.locationEn },
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
