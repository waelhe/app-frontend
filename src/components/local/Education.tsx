'use client';

import { useState } from 'react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ListingCard, getListingImages, formatPrice } from '@/components/ui/ListingCard';
import { GraduationCap, MapPin, Phone } from 'lucide-react';

const educationCenters = [
  {
    id: '1',
    nameEn: 'Al-Noor School',
    nameAr: 'مدرسة النور',
    typeEn: 'Primary School',
    typeAr: 'مدرسة ابتدائية',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-1212121',
  },
  {
    id: '2',
    nameEn: 'Qudsaya High School',
    nameAr: 'ثانوية قدسيا',
    typeEn: 'High School',
    typeAr: 'ثانوية',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-2323232',
  },
  {
    id: '3',
    nameEn: 'Technical Institute',
    nameAr: 'المعهد التقني',
    typeEn: 'Institute',
    typeAr: 'معهد',
    locationEn: 'Industrial Zone',
    locationAr: 'المنطقة الصناعية',
    phone: '011-3434343',
  },
  {
    id: '4',
    nameEn: 'Language Center',
    nameAr: 'مركز اللغات',
    typeEn: 'Language Institute',
    typeAr: 'معهد لغات',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-4545454',
  },
  {
    id: '5',
    nameEn: 'Computer Academy',
    nameAr: 'أكاديمية الحاسوب',
    typeEn: 'Training Center',
    typeAr: 'مركز تدريب',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-5656565',
  },
];

export default function Education() {
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
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
          <GraduationCap className="w-5 h-5 text-white" />
        </span>
        <span>{isArabic ? 'التعليم' : 'Education'}</span>
        <span className="text-sm font-normal text-muted-foreground">({educationCenters.length})</span>
      </h2>

      {/* Horizontal Scrolling Cards */}
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {educationCenters.map((center, idx) => (
          <ListingCard
            key={center.id}
            id={center.id}
            title={isArabic ? center.nameAr : center.nameEn}
            category="education"
            price={0}
            subtitle={isArabic ? center.locationAr : center.locationEn}
            rating={4.0 + Math.random() * 1.0}
            badgeText={isArabic ? center.typeAr : center.typeEn}
            badgeColor="bg-indigo-600/90 text-white"
            imageIndex={idx}
            isFavorite={favorites.includes(center.id)}
            onToggleFavorite={toggleFavorite}
            onClick={() => navigate('listing-detail', { id: center.id })}
            isScrollCard={true}
          />
        ))}
      </div>
    </section>
  );
}
