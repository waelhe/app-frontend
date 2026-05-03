'use client';

import { useLanguage } from '@/stores/languageStore';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Heart, MessageCircle, Share2 } from 'lucide-react';

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
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-red-500" />
        {isRTL ? 'المجتمع' : 'Community'}
      </h2>
      <div className="space-y-3">
        {communityPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-base">
                  {isRTL ? post.titleAr : post.titleEn}
                </h3>
                <Badge variant="secondary" className="text-xs shrink-0">
                  <Users className="w-3 h-3 mr-1" />
                  {isRTL ? post.authorAr : post.authorEn}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isRTL ? post.descAr : post.descEn}
              </p>
              <div className="w-full h-32 bg-muted rounded-lg mt-3 flex items-center justify-center">
                <Users className="w-8 h-8 text-muted-foreground/40" />
              </div>
            </CardContent>
            <CardFooter className="px-4 pb-4 pt-0 gap-4">
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors">
                <Heart className="w-4 h-4" />
                {post.likes}
              </button>
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-blue-500 transition-colors">
                <MessageCircle className="w-4 h-4" />
                {post.comments}
              </button>
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-green-500 transition-colors ms-auto">
                <Share2 className="w-4 h-4" />
                {isRTL ? 'مشاركة' : 'Share'}
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
