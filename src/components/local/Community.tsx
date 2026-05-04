'use client';

import { useState } from 'react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ListingCard, getListingImages, formatPrice } from '@/components/ui/ListingCard';
import { Users, MapPin } from 'lucide-react';

const communityPosts = [
  {
    id: '1',
    titleEn: 'Community Cleanup Drive',
    titleAr: 'حملة تنظيف الحي',
    descEn: 'Join us this Saturday for a community cleanup event at the central park.',
    descAr: 'انضم إلينا يوم السبت لحملة تنظيف في الحديقة المركزية.',
    authorEn: 'Qudsaya Volunteers',
    authorAr: 'متطوعو قدسيا',
    likes: 42,
    comments: 8,
  },
  {
    id: '2',
    titleEn: 'Free Tutoring for Kids',
    titleAr: 'دروس مجانية للأطفال',
    descEn: 'Free math and science tutoring sessions available for elementary students.',
    descAr: 'جلسات مجانية لتدريس الرياضيات والعلوم لطلاب المرحلة الابتدائية.',
    authorEn: 'Education Circle',
    authorAr: 'حلقة التعليم',
    likes: 67,
    comments: 15,
  },
  {
    id: '3',
    titleEn: 'Charity Food Drive',
    titleAr: 'حملة طعام خيرية',
    descEn: 'Help us collect food packages for families in need this Ramadan.',
    descAr: 'ساعدنا في جمع طرود طعام للأسر المحتاجة هذا Ramadan.',
    authorEn: 'Good Hearts Foundation',
    authorAr: 'مؤسسة القلوب الطيبة',
    likes: 128,
    comments: 34,
  },
];

export default function Community() {
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
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-sm">
          <Users className="w-5 h-5 text-white" />
        </span>
        <span>{isArabic ? 'المجتمع' : 'Community'}</span>
        <span className="text-sm font-normal text-muted-foreground">({communityPosts.length})</span>
      </h2>
      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {communityPosts.map((post, idx) => (
          <ListingCard
            key={post.id}
            id={post.id}
            title={isArabic ? post.titleAr : post.titleEn}
            category="experiences"
            price={0}
            subtitle={isArabic ? post.authorAr : post.authorEn}
            rating={4.3 + idx * 0.2}
            badgeText={isArabic ? 'مجتمع' : 'Community'}
            badgeColor="bg-purple-600/90 text-white"
            secondaryBadge={post.likes > 50 ? (isArabic ? 'رائج' : 'Trending') : undefined}
            imageIndex={idx}
            isFavorite={favorites.includes(post.id)}
            onToggleFavorite={toggleFavorite}
            isScrollCard={true}
            onClick={() => navigate('listing-detail', { id: post.id })}
          />
        ))}
      </div>
    </section>
  );
}
