'use client';

import { useState } from 'react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ListingCard, getListingImages, formatPrice } from '@/components/ui/ListingCard';
import { Hospital, Clock, Phone, MapPin } from 'lucide-react';

const medicalCenters = [
  {
    id: '1',
    nameEn: 'Qudsaya General Hospital',
    nameAr: 'مستشفى قدسيا العام',
    typeEn: 'Hospital',
    typeAr: 'مستشفى',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-5675675',
    hoursEn: '24 Hours',
    hoursAr: '24 ساعة',
    emergency: true,
  },
  {
    id: '2',
    nameEn: 'Al-Rahma Medical Center',
    nameAr: 'مركز الرحمة الطبي',
    typeEn: 'Medical Center',
    typeAr: 'مركز طبي',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-6786786',
    hoursEn: '8 AM - 10 PM',
    hoursAr: '8 ص - 10 م',
    emergency: false,
  },
  {
    id: '3',
    nameEn: 'Dental Care Clinic',
    nameAr: 'عيادة العناية بالأسنان',
    typeEn: 'Dental Clinic',
    typeAr: 'عيادة أسنان',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-7897897',
    hoursEn: '9 AM - 8 PM',
    hoursAr: '9 ص - 8 م',
    emergency: false,
  },
  {
    id: '4',
    nameEn: 'Diagnostic Lab',
    nameAr: 'مختبر التشخيص',
    typeEn: 'Laboratory',
    typeAr: 'مختبر',
    locationEn: 'Riverside Road',
    locationAr: 'طريق النهر',
    phone: '011-8908908',
    hoursEn: '7 AM - 6 PM',
    hoursAr: '7 ص - 6 م',
    emergency: false,
  },
];

export default function MedicalCenters() {
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-sm">
          <Hospital className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {isArabic ? 'المراكز الطبية' : 'Medical Centers'}
          </h2>
          <span className="text-xs text-gray-500">
            {medicalCenters.length} {isArabic ? 'مركز' : 'centers'}
          </span>
        </div>
      </div>

      {/* Horizontal Scrolling Cards */}
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {medicalCenters.map((center, index) => (
          <ListingCard
            key={center.id}
            id={center.id}
            title={isArabic ? center.nameAr : center.nameEn}
            category="medical"
            price={0}
            subtitle={isArabic ? center.locationAr : center.locationEn}
            rating={center.emergency ? 4.8 : 4.0 + Math.random() * 1.0}
            badgeText={center.emergency ? (isArabic ? 'طوارئ' : 'ER') : (isArabic ? center.typeAr : center.typeEn)}
            badgeColor={center.emergency ? 'bg-red-600/90 text-white' : 'bg-red-500/90 text-white'}
            secondaryBadge={center.emergency ? (isArabic ? '24 ساعة' : '24/7') : undefined}
            features={[
              { icon: Clock, label: isArabic ? center.hoursAr : center.hoursEn },
              { icon: Phone, label: center.phone },
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
