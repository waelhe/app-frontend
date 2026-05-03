'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigationStore } from '@/stores/navigationStore';
import { useAuth } from '@/store/use-auth';
import { useFavorites, type FavoriteItem } from '@/store/use-favorites';
import {
  Heart,
  ArrowRight,
  ArrowLeft,
  BookmarkPlus,
  Trash2,
  Building2,
  Car,
  Smartphone,
  Briefcase,
  HardHat,
  Sofa,
  Stethoscope,
  UtensilsCrossed,
  GraduationCap,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

const categoryIcons: Record<string, React.ReactNode> = {
  'real-estate': <Building2 className="h-5 w-5" />,
  electronics: <Smartphone className="h-5 w-5" />,
  cars: <Car className="h-5 w-5" />,
  services: <Briefcase className="h-5 w-5" />,
  jobs: <HardHat className="h-5 w-5" />,
  furniture: <Sofa className="h-5 w-5" />,
  medical: <Stethoscope className="h-5 w-5" />,
  dining: <UtensilsCrossed className="h-5 w-5" />,
  education: <GraduationCap className="h-5 w-5" />,
  beauty: <Star className="h-5 w-5" />,
};

const categoryGradients: Record<string, string> = {
  'real-estate': 'from-amber-400 to-orange-500',
  electronics: 'from-blue-400 to-cyan-500',
  cars: 'from-gray-400 to-slate-600',
  services: 'from-emerald-400 to-teal-500',
  jobs: 'from-purple-400 to-violet-500',
  furniture: 'from-rose-400 to-pink-500',
  medical: 'from-red-400 to-rose-500',
  dining: 'from-orange-400 to-amber-500',
  education: 'from-indigo-400 to-blue-500',
  beauty: 'from-pink-400 to-fuchsia-500',
};

const categoryLabelsAr: Record<string, string> = {
  'real-estate': 'عقارات',
  electronics: 'إلكترونيات',
  cars: 'سيارات',
  services: 'خدمات',
  jobs: 'وظائف',
  furniture: 'أثاث',
  medical: 'طبي',
  dining: 'مطاعم',
  education: 'تعليم',
  beauty: 'جمال',
};

export function FavoritesView() {
  const { t, isRTL } = useLanguage();
  const { goBack, navigate } = useNavigationStore();
  const { isAuthenticated } = useAuth();
  const { favorites, removeFavorite } = useFavorites();
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
        {favorites.length > 0 && (
          <Badge variant="secondary" className="ms-auto">
            {favorites.length}
          </Badge>
        )}
      </div>

      {/* Empty State */}
      {favorites.length === 0 ? (
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
            onClick={() => navigate('market' as any)}
          >
            {t('تصفح السوق', 'Browse Market')}
          </Button>
        </div>
      ) : (
        /* Favorites Grid */
        <div className="space-y-3">
          <AnimatePresence>
            {favorites.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: isRTL ? 100 : -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate('listing-detail' as any, { id: item.id })}
                >
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      {/* Category Icon */}
                      <div
                        className={`flex items-center justify-center w-20 shrink-0 bg-gradient-to-br ${
                          categoryGradients[item.category] ?? 'from-red-400 to-red-600'
                        }`}
                      >
                        <div className="text-white/90">
                          {categoryIcons[item.category] ?? <Star className="h-5 w-5" />}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-3 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-[10px]">
                                {categoryLabelsAr[item.category] ?? item.category}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {item.providerName}
                              </span>
                            </div>
                          </div>
                          <div className="text-left shrink-0" dir="ltr">
                            <span className="text-sm font-bold text-red-500">
                              {item.price.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-gray-400"> SAR</span>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="flex items-center px-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFavorite(item.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Clear All */}
          {favorites.length > 0 && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-gray-500 hover:text-red-500 hover:border-red-200"
                onClick={() => useFavorites.getState().clearFavorites()}
              >
                <Trash2 className="h-4 w-4 me-2" />
                {t('مسح الكل', 'Clear All')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
