'use client';

import { useState } from 'react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ListingCard, getListingImages, formatPrice } from '@/components/ui/ListingCard';
import { Briefcase, MapPin, Clock, DollarSign } from 'lucide-react';

const jobs = [
  {
    id: '1',
    titleEn: 'Sales Representative',
    titleAr: 'مندوب مبيعات',
    companyEn: 'Tech Solutions',
    companyAr: 'تك سوليوشنز',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    typeEn: 'Full-time',
    typeAr: 'دوام كامل',
    salaryEn: '300,000 - 500,000 SYP',
    salaryAr: '300,000 - 500,000 ل.س',
    posted: '2 days ago',
  },
  {
    id: '2',
    titleEn: 'English Teacher',
    titleAr: 'معلم لغة إنجليزية',
    companyEn: 'Language Center',
    companyAr: 'مركز اللغات',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    typeEn: 'Part-time',
    typeAr: 'دوام جزئي',
    salaryEn: '200,000 SYP/mo',
    salaryAr: '200,000 ل.س/شهر',
    posted: '1 week ago',
  },
  {
    id: '3',
    titleEn: 'Electrician',
    titleAr: 'فني كهرباء',
    companyEn: 'Home Services Co.',
    companyAr: 'شركة خدمات منزلية',
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    typeEn: 'Full-time',
    typeAr: 'دوام كامل',
    salaryEn: '250,000 - 400,000 SYP',
    salaryAr: '250,000 - 400,000 ل.س',
    posted: '3 days ago',
  },
  {
    id: '4',
    titleEn: 'Cashier',
    titleAr: 'محاسب كاشير',
    companyEn: 'Al-Madina Market',
    companyAr: 'سوق المدينة',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    typeEn: 'Full-time',
    typeAr: 'دوام كامل',
    salaryEn: '180,000 SYP/mo',
    salaryAr: '180,000 ل.س/شهر',
    posted: '5 days ago',
  },
];

export default function Jobs() {
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
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
          <Briefcase className="w-5 h-5 text-white" />
        </span>
        <span>{isArabic ? 'الوظائف' : 'Jobs'}</span>
        <span className="text-sm font-normal text-muted-foreground">({jobs.length})</span>
      </h2>

      {/* Horizontal Scrolling Cards */}
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {jobs.map((job, idx) => (
          <ListingCard
            key={job.id}
            id={job.id}
            title={isArabic ? job.titleAr : job.titleEn}
            category="jobs"
            price={0}
            subtitle={isArabic ? job.companyAr : job.companyEn}
            rating={4.0 + Math.random() * 1.0}
            badgeText={isArabic ? job.typeAr : job.typeEn}
            badgeColor="bg-violet-600/90 text-white"
            features={[
              { icon: MapPin, label: isArabic ? job.locationAr : job.locationEn },
              { icon: Clock, label: job.posted },
            ]}
            imageIndex={idx}
            isFavorite={favorites.includes(job.id)}
            onToggleFavorite={toggleFavorite}
            onClick={() => navigate('listing-detail', { id: job.id })}
            isScrollCard={true}
          />
        ))}
      </div>
    </section>
  );
}
