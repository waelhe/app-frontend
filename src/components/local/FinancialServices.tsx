'use client';

import { useState } from 'react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ListingCard, getListingImages, formatPrice } from '@/components/ui/ListingCard';
import { Banknote, Clock, Phone } from 'lucide-react';

const financialServices = [
  {
    id: '1',
    nameEn: 'Syrian Commercial Bank',
    nameAr: 'المصرف التجاري السوري',
    typeEn: 'Bank',
    typeAr: 'مصرف',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-6677889',
    hoursEn: '8 AM - 2 PM',
    hoursAr: '8 ص - 2 م',
  },
  {
    id: '2',
    nameEn: 'Al-Baraka Exchange',
    nameAr: 'صرافة البركة',
    typeEn: 'Exchange',
    typeAr: 'صرافة',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-7788990',
    hoursEn: '8 AM - 6 PM',
    hoursAr: '8 ص - 6 م',
  },
  {
    id: '3',
    nameEn: 'Western Union Agent',
    nameAr: 'وكيل ويسترن يونيون',
    typeEn: 'Money Transfer',
    typeAr: 'تحويل أموال',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-8899001',
    hoursEn: '9 AM - 5 PM',
    hoursAr: '9 ص - 5 م',
  },
  {
    id: '4',
    nameEn: 'Micro Finance Office',
    nameAr: 'مكتب التمويل الصغير',
    typeEn: 'Micro Finance',
    typeAr: 'تمويل صغير',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-9900112',
    hoursEn: '9 AM - 4 PM',
    hoursAr: '9 ص - 4 م',
  },
];

export default function FinancialServices() {
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
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
          <Banknote className="w-5 h-5 text-white" />
        </span>
        <span>{isArabic ? 'الخدمات المالية' : 'Financial Services'}</span>
        <span className="text-sm font-normal text-muted-foreground">({financialServices.length})</span>
      </h2>
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {financialServices.map((service, idx) => (
          <ListingCard
            key={service.id}
            id={service.id}
            title={isArabic ? service.nameAr : service.nameEn}
            category="services"
            price={0}
            subtitle={isArabic ? service.locationAr : service.locationEn}
            rating={4.0 + Math.random() * 1.0}
            badgeText={isArabic ? service.typeAr : service.typeEn}
            badgeColor="bg-emerald-600/90 text-white"
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
