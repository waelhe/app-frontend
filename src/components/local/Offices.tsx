'use client';

import { useState } from 'react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ListingCard, getListingImages, formatPrice } from '@/components/ui/ListingCard';
import { Building2, MapPin, Phone } from 'lucide-react';

const offices = [
  {
    id: '1',
    nameEn: 'Qudsaya Real Estate Office',
    nameAr: 'مكتب عقارات قدسيا',
    typeEn: 'Real Estate',
    typeAr: 'عقارات',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-2233445',
  },
  {
    id: '2',
    nameEn: 'Al-Wafa Recruitment Office',
    nameAr: 'مكتب الوفاء للتوظيف',
    typeEn: 'Employment',
    typeAr: 'توظيف',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-3344556',
  },
  {
    id: '3',
    nameEn: 'Travel & Tourism Agency',
    nameAr: 'وكالة السفر والسياحة',
    typeEn: 'Travel',
    typeAr: 'سفر وسياحة',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-4455667',
  },
  {
    id: '4',
    nameEn: 'Insurance Office',
    nameAr: 'مكتب التأمين',
    typeEn: 'Insurance',
    typeAr: 'تأمين',
    locationEn: 'Riverside Road',
    locationAr: 'طريق النهر',
    phone: '011-5566778',
  },
];

export default function Offices() {
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
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-sm">
          <Building2 className="w-5 h-5 text-white" />
        </span>
        <span>{isArabic ? 'المكاتب' : 'Offices'}</span>
        <span className="text-sm font-normal text-muted-foreground">({offices.length})</span>
      </h2>
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {offices.map((office, idx) => (
          <ListingCard
            key={office.id}
            id={office.id}
            title={isArabic ? office.nameAr : office.nameEn}
            category="business"
            price={0}
            subtitle={isArabic ? office.locationAr : office.locationEn}
            rating={4.1 + idx * 0.2}
            badgeText={isArabic ? office.typeAr : office.typeEn}
            badgeColor="bg-orange-600/90 text-white"
            features={[
              { icon: MapPin, label: isArabic ? office.locationAr : office.locationEn },
              { icon: Phone, label: office.phone },
            ]}
            imageIndex={idx}
            isFavorite={favorites.includes(office.id)}
            onToggleFavorite={toggleFavorite}
            isScrollCard={true}
            onClick={() => navigate('listing-detail', { id: office.id })}
          />
        ))}
      </div>
    </section>
  );
}
