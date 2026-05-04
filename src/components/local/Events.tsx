'use client';

import { useState } from 'react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ListingCard, getListingImages, formatPrice } from '@/components/ui/ListingCard';
import { Calendar, MapPin, Clock } from 'lucide-react';

const events = [
  {
    id: '1',
    titleEn: 'Spring Festival',
    titleAr: 'مهرجان الربيع',
    date: '2025-04-15',
    timeEn: '4:00 PM',
    timeAr: '4:00 مساءً',
    locationEn: 'Central Park, Qudsaya',
    locationAr: 'الحديقة المركزية، قدسيا',
    categoryEn: 'Festival',
    categoryAr: 'مهرجان',
  },
  {
    id: '2',
    titleEn: 'Book Fair',
    titleAr: 'معرض الكتاب',
    date: '2025-04-20',
    timeEn: '10:00 AM',
    timeAr: '10:00 صباحاً',
    locationEn: 'Cultural Center',
    locationAr: 'المركز الثقافي',
    categoryEn: 'Culture',
    categoryAr: 'ثقافة',
  },
  {
    id: '3',
    titleEn: 'Charity Marathon',
    titleAr: 'ماراثون خيري',
    date: '2025-05-01',
    timeEn: '7:00 AM',
    timeAr: '7:00 صباحاً',
    locationEn: 'Main Street, Qudsaya',
    locationAr: 'الشارع الرئيسي، قدسيا',
    categoryEn: 'Sports',
    categoryAr: 'رياضة',
  },
  {
    id: '4',
    titleEn: 'Art Exhibition',
    titleAr: 'معرض فني',
    date: '2025-05-10',
    timeEn: '6:00 PM',
    timeAr: '6:00 مساءً',
    locationEn: 'Gallery 21',
    locationAr: 'غاليري 21',
    categoryEn: 'Art',
    categoryAr: 'فن',
  },
];

export default function Events() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const navigate = useNavigationStore((s) => s.navigate);
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isArabic
      ? d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <section className="py-4">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {isArabic ? 'الفعاليات' : 'Events'}
          </h2>
          <span className="text-xs text-gray-500">
            {events.length} {isArabic ? 'فعالية' : 'events'}
          </span>
        </div>
      </div>

      {/* Horizontal Scrolling Cards */}
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {events.map((event, index) => (
          <ListingCard
            key={event.id}
            id={event.id}
            title={isArabic ? event.titleAr : event.titleEn}
            category="events"
            price={0}
            subtitle={`${formatDate(event.date)} · ${isArabic ? event.locationAr : event.locationEn}`}
            rating={4.0 + Math.random() * 1.0}
            badgeText={isArabic ? event.categoryAr : event.categoryEn}
            badgeColor="bg-violet-600/90 text-white"
            secondaryBadge={formatDate(event.date)}
            features={[
              { icon: Clock, label: isArabic ? event.timeAr : event.timeEn },
              { icon: MapPin, label: isArabic ? event.locationAr : event.locationEn },
            ]}
            imageIndex={index}
            isFavorite={favorites.includes(event.id)}
            onToggleFavorite={toggleFavorite}
            isScrollCard={true}
            onClick={() => navigate('listing-detail', { id: event.id })}
          />
        ))}
      </div>
    </section>
  );
}
