'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigationStore } from '@/stores/navigationStore';
import { useAuth } from '@/store/use-auth';
import { Heart, ArrowRight, ArrowLeft, BookmarkPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FavoritesView() {
  const { t, isRTL } = useLanguage();
  const { goBack, navigate } = useNavigationStore();
  const { isAuthenticated } = useAuth();
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center min-h-[60vh]">
        <div className="rounded-full bg-red-50 p-6">
          <Heart className="h-12 w-12 text-red-300" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          {t('المفضلة', 'Favorites')}
        </h2>
        <p className="text-sm text-gray-500 max-w-xs">
          {t(
            'سجّل دخولك لحفظ الإعلانات المفضلة والعودة إليها لاحقاً',
            'Sign in to save your favorite listings and access them later'
          )}
        </p>
        <Button
          className="bg-red-500 text-white hover:bg-red-600"
          onClick={() => window.dispatchEvent(new CustomEvent('open-login', { detail: { mode: 'login' } }))}
        >
          {t('تسجيل الدخول', 'Sign In')}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack} className="h-8 w-8 shrink-0">
          <BackArrow className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          <h1 className="text-xl font-bold text-gray-900">
            {t('المفضلة', 'Favorites')}
          </h1>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="rounded-full bg-gray-100 p-6">
          <BookmarkPlus className="h-12 w-12 text-gray-300" />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gray-900">
            {t('لا توجد مفضلات', 'No favorites yet')}
          </h3>
          <p className="text-sm text-gray-500 max-w-xs">
            {t(
              'اضغط على أيقونة القلب في أي إعلان لإضافته إلى المفضلة',
              'Tap the heart icon on any listing to add it to your favorites'
            )}
          </p>
        </div>
        <Button
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50"
          onClick={() => navigate('market')}
        >
          {t('تصفح السوق', 'Browse Market')}
        </Button>
      </div>
    </div>
  );
}
