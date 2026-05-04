'use client';

import { useState } from 'react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ListingCard, getListingImages, formatPrice } from '@/components/ui/ListingCard';
import { Briefcase, Scale, Calculator, MapPin, Phone } from 'lucide-react';

const professionalTypes = [
  { id: 'lawyer', labelEn: 'Lawyers', labelAr: 'محامون', icon: Scale },
  { id: 'accountant', labelEn: 'Accountants', labelAr: 'محاسبون', icon: Calculator },
];

const professionals = [
  {
    id: '1',
    nameEn: 'Adv. Ahmad Al-Rifai',
    nameAr: 'المحامي أحمد الرفاعي',
    type: 'lawyer',
    specialtyEn: 'Civil Law',
    specialtyAr: 'القانون المدني',
    rating: 4.9,
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-8899001',
  },
  {
    id: '2',
    nameEn: 'Adv. Lina Kabbani',
    nameAr: 'المحامية لينا قباني',
    type: 'lawyer',
    specialtyEn: 'Family Law',
    specialtyAr: 'قانون الأسرة',
    rating: 4.7,
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-9900112',
  },
  {
    id: '3',
    nameEn: 'M. Hassan Nasser',
    nameAr: 'م. حسن ناصر',
    type: 'accountant',
    specialtyEn: 'Tax Consulting',
    specialtyAr: 'استشارات ضريبية',
    rating: 4.8,
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-0011223',
  },
  {
    id: '4',
    nameEn: 'M. Rania Saeed',
    nameAr: 'م. رانيا سعيد',
    type: 'accountant',
    specialtyEn: 'Audit & Accounting',
    specialtyAr: 'تدقيق ومحاسبة',
    rating: 4.6,
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-1122334',
  },
];

export default function Professionals() {
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
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-sm">
          <Briefcase className="w-5 h-5 text-white" />
        </span>
        <span>{isArabic ? 'المحترفون' : 'Professionals'}</span>
        <span className="text-sm font-normal text-muted-foreground">({professionals.length})</span>
      </h2>

      {/* Horizontal Scrolling Cards */}
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {professionals.map((pro, idx) => {
          const pt = professionalTypes.find((p) => p.id === pro.type);
          const ProIcon = pt?.icon ?? Briefcase;
          return (
            <ListingCard
              key={pro.id}
              id={pro.id}
              title={isArabic ? pro.nameAr : pro.nameEn}
              category="services"
              price={0}
              subtitle={isArabic ? pro.specialtyAr : pro.specialtyEn}
              rating={pro.rating}
              badgeText={isArabic ? pt?.labelAr : pt?.labelEn}
              badgeColor="bg-red-600/90 text-white"
              features={[
                { icon: MapPin, label: isArabic ? pro.locationAr : pro.locationEn },
              ]}
              imageIndex={idx}
              isFavorite={favorites.includes(pro.id)}
              onToggleFavorite={toggleFavorite}
              onClick={() => navigate('listing-detail', { id: pro.id })}
              isScrollCard={true}
            />
          );
        })}
      </div>
    </section>
  );
}
