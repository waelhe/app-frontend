'use client';

import { useState } from 'react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ListingCard, getListingImages, formatPrice } from '@/components/ui/ListingCard';
import { Wrench, Zap, Droplets, Paintbrush, Hammer, Clock } from 'lucide-react';

const trades = [
  { id: 'plumbing', labelEn: 'Plumbing', labelAr: 'سباكة', icon: Droplets, color: 'text-blue-500' },
  { id: 'electrical', labelEn: 'Electrical', labelAr: 'كهرباء', icon: Zap, color: 'text-yellow-500' },
  { id: 'painting', labelEn: 'Painting', labelAr: 'دهان', icon: Paintbrush, color: 'text-green-500' },
  { id: 'carpentry', labelEn: 'Carpentry', labelAr: 'نجارة', icon: Hammer, color: 'text-amber-600' },
];

const craftsmen = [
  {
    id: '1',
    nameEn: 'Abu Hassan Plumbing',
    nameAr: 'سباكة أبو حسن',
    trade: 'plumbing',
    rating: 4.6,
    phone: '099-1111111',
    experience: 15,
  },
  {
    id: '2',
    nameEn: 'Al-Raee Electric',
    nameAr: 'كهرباء الراعي',
    trade: 'electrical',
    rating: 4.8,
    phone: '099-2222222',
    experience: 20,
  },
  {
    id: '3',
    nameEn: 'Perfect Paint',
    nameAr: 'الدهان المثالي',
    trade: 'painting',
    rating: 4.4,
    phone: '099-3333333',
    experience: 10,
  },
  {
    id: '4',
    nameEn: 'Heritage Carpentry',
    nameAr: 'نجارة التراث',
    trade: 'carpentry',
    rating: 4.7,
    phone: '099-4444444',
    experience: 25,
  },
];

export default function Craftsmen() {
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
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
          <Wrench className="w-5 h-5 text-white" />
        </span>
        <span>{isArabic ? 'الحرفيين' : 'Craftsmen'}</span>
        <span className="text-sm font-normal text-muted-foreground">({craftsmen.length})</span>
      </h2>

      {/* Horizontal Scrolling Cards */}
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {craftsmen.map((craftsman, idx) => {
          const trade = trades.find((t) => t.id === craftsman.trade);
          const TradeIcon = trade?.icon ?? Wrench;
          return (
            <ListingCard
              key={craftsman.id}
              id={craftsman.id}
              title={isArabic ? craftsman.nameAr : craftsman.nameEn}
              category="services"
              price={0}
              subtitle={isArabic ? trade?.labelAr : trade?.labelEn}
              rating={craftsman.rating}
              badgeText={isArabic ? trade?.labelAr : trade?.labelEn}
              badgeColor="bg-emerald-600/90 text-white"
              features={[
                { icon: TradeIcon, label: `${craftsman.experience} ${isArabic ? 'سنة خبرة' : 'yrs exp'}` },
              ]}
              imageIndex={idx}
              isFavorite={favorites.includes(craftsman.id)}
              onToggleFavorite={toggleFavorite}
              onClick={() => navigate('listing-detail', { id: craftsman.id })}
              isScrollCard={true}
            />
          );
        })}
      </div>
    </section>
  );
}
