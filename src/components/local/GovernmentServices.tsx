'use client';

import { useState } from 'react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ListingCard, getListingImages, formatPrice } from '@/components/ui/ListingCard';
import { Landmark, Clock, Phone, MapPin } from 'lucide-react';

const govServices = [
  {
    id: '1',
    nameEn: 'Qudsaya Municipality',
    nameAr: 'بلدية قدسيا',
    typeEn: 'Municipality',
    typeAr: 'بلدية',
    locationEn: 'City Center',
    locationAr: 'مركز المدينة',
    phone: '011-1231231',
    hoursEn: '8 AM - 3 PM',
    hoursAr: '8 ص - 3 م',
  },
  {
    id: '2',
    nameEn: 'Civil Registry Office',
    nameAr: 'دائرة الأحوال المدنية',
    typeEn: 'Civil Registry',
    typeAr: 'أحوال مدنية',
    locationEn: 'Government Complex',
    locationAr: 'مجمع الحكومة',
    phone: '011-2342342',
    hoursEn: '8 AM - 2 PM',
    hoursAr: '8 ص - 2 م',
  },
  {
    id: '3',
    nameEn: 'Traffic Department',
    nameAr: 'مديرية النقل',
    typeEn: 'Traffic',
    typeAr: 'نقل ومرور',
    locationEn: 'Highway Road',
    locationAr: 'طريق السريع',
    phone: '011-3453453',
    hoursEn: '8 AM - 2 PM',
    hoursAr: '8 ص - 2 م',
  },
  {
    id: '4',
    nameEn: 'Post Office',
    nameAr: 'مكتب البريد',
    typeEn: 'Post Office',
    typeAr: 'بريد',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-4564564',
    hoursEn: '8 AM - 4 PM',
    hoursAr: '8 ص - 4 م',
  },
];

export default function GovernmentServices() {
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
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center shadow-sm">
          <Landmark className="w-5 h-5 text-white" />
        </span>
        <span>{isArabic ? 'الخدمات الحكومية' : 'Government Services'}</span>
        <span className="text-sm font-normal text-muted-foreground">({govServices.length})</span>
      </h2>
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {govServices.map((service, idx) => (
          <ListingCard
            key={service.id}
            id={service.id}
            title={isArabic ? service.nameAr : service.nameEn}
            category="services"
            price={0}
            subtitle={isArabic ? service.locationAr : service.locationEn}
            rating={4.0 + idx * 0.2}
            badgeText={isArabic ? service.typeAr : service.typeEn}
            badgeColor="bg-slate-600/90 text-white"
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
