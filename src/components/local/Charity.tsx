'use client';

import { useState } from 'react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ListingCard, getListingImages, formatPrice } from '@/components/ui/ListingCard';
import { Heart, MapPin, Phone } from 'lucide-react';

const charities = [
  {
    id: '1',
    nameEn: 'Good Hearts Foundation',
    nameAr: 'مؤسسة القلوب الطيبة',
    descEn: 'Supporting families in need with food, clothing, and educational resources.',
    descAr: 'دعم الأسر المحتاجة بالطعام والملابس والموارد التعليمية.',
    phone: '011-1234567',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    category: 'social',
  },
  {
    id: '2',
    nameEn: 'Al-Birr Association',
    nameAr: 'جمعية البر',
    descEn: 'Providing medical assistance and support for orphans and widows.',
    descAr: 'تقديم المساعدة الطبية ودعم الأيتام والأرامل.',
    phone: '011-2345678',
    locationEn: 'Qudsaya Dahia',
    locationAr: 'ضاحية قدسيا',
    category: 'medical',
  },
  {
    id: '3',
    nameEn: 'Future Builders',
    nameAr: 'بناة المستقبل',
    descEn: 'Empowering youth through vocational training and mentorship programs.',
    descAr: 'تمكين الشباب من خلال التدريب المهني وبرامج الإرشاد.',
    phone: '011-3456789',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    category: 'education',
  },
];

export default function Charity() {
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
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-sm">
          <Heart className="w-5 h-5 text-white" />
        </span>
        <span>{isArabic ? 'الجمعيات الخيرية' : 'Charities'}</span>
        <span className="text-sm font-normal text-muted-foreground">({charities.length})</span>
      </h2>
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {charities.map((charity, idx) => (
          <ListingCard
            key={charity.id}
            id={charity.id}
            title={isArabic ? charity.nameAr : charity.nameEn}
            category="services"
            price={0}
            subtitle={isArabic ? charity.locationAr : charity.locationEn}
            rating={4.2 + idx * 0.3}
            badgeText={isArabic ? 'خيري' : 'Charity'}
            badgeColor="bg-rose-600/90 text-white"
            features={[
              { icon: MapPin, label: isArabic ? charity.locationAr : charity.locationEn },
              { icon: Phone, label: charity.phone },
            ]}
            imageIndex={idx}
            isFavorite={favorites.includes(charity.id)}
            onToggleFavorite={toggleFavorite}
            isScrollCard={true}
            onClick={() => navigate('listing-detail', { id: charity.id })}
          />
        ))}
      </div>
    </section>
  );
}
