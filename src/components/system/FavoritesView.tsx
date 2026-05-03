'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '@/store/use-language';
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
  Eye,
  Share2,
  SortAsc,
  SortDesc,
  Clock,
  ArrowUpDown,
  X,
  CheckCircle2,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { motion, AnimatePresence } from 'framer-motion';

// ── Category maps ──────────────────────────────────────────────────

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

const categoryLabelsEn: Record<string, string> = {
  'real-estate': 'Real Estate',
  electronics: 'Electronics',
  cars: 'Cars',
  services: 'Services',
  jobs: 'Jobs',
  furniture: 'Furniture',
  medical: 'Medical',
  dining: 'Dining',
  education: 'Education',
  beauty: 'Beauty',
};

// ── Sort types ─────────────────────────────────────────────────────

type SortOption = 'newest' | 'price-low' | 'price-high';

const sortOptions: { id: SortOption; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
  { id: 'newest', labelAr: 'الأحدث', labelEn: 'Newest', icon: <Clock className="h-3 w-3" /> },
  { id: 'price-low', labelAr: 'السعر: الأقل', labelEn: 'Price: Low', icon: <SortAsc className="h-3 w-3" /> },
  { id: 'price-high', labelAr: 'السعر: الأعلى', labelEn: 'Price: High', icon: <SortDesc className="h-3 w-3" /> },
];

// ── Animation variants ─────────────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const heartPulse = {
  animate: {
    scale: [1, 1.2, 1],
    transition: { duration: 1.5, repeat: Infinity, repeatDelay: 1 },
  },
};

// ── Component ──────────────────────────────────────────────────────

export function FavoritesView() {
  const { t, isRTL } = useLanguage();
  const { goBack, navigate } = useNavigationStore();
  const { isAuthenticated } = useAuth();
  const { favorites, removeFavorite } = useFavorites();
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // ── Get unique categories from favorites ──────────────────────
  const availableCategories = useMemo(() => {
    const cats = new Set(favorites.map((f) => f.category));
    return Array.from(cats);
  }, [favorites]);

  // ── Filter and sort ──────────────────────────────────────────
  const filteredAndSorted = useMemo(() => {
    let result = [...favorites];

    // Filter by category
    if (categoryFilter !== 'all') {
      result = result.filter((f) => f.category === categoryFilter);
    }

    // Sort
    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [favorites, categoryFilter, sortOption]);

  // ── Share wishlist ───────────────────────────────────────────
  const handleShare = async () => {
    const text = t(
      `مفضلتي من نبض: ${favorites.map((f) => f.title).join('، ')}`,
      `My Nabd Wishlist: ${favorites.map((f) => f.title).join(', ')}`
    );
    if (navigator.share) {
      try {
        await navigator.share({ title: t('مفضلتي من نبض', 'My Nabd Wishlist'), text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  // ── Format date ──────────────────────────────────────────────
  const formatAddedDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  // ── Unauthenticated state ────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center min-h-[60vh]">
        <motion.div {...heartPulse}>
          <div className="rounded-full bg-red-50 p-6">
            <Heart className="h-12 w-12 text-red-300" />
          </div>
        </motion.div>
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
    <div className="p-4 space-y-4 pb-24">
      {/* ── Header ──────────────────────────────────────────────── */}
      <motion.div {...fadeInUp} className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack} className="h-8 w-8 shrink-0">
          <BackArrow className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          <h1 className="text-xl font-bold text-gray-900">
            {t('المفضلة', 'My Favorites')}
          </h1>
        </div>
        {favorites.length > 0 && (
          <Badge className="bg-red-500 text-white ms-auto">
            {favorites.length}
          </Badge>
        )}
      </motion.div>

      {/* ── Empty State ──────────────────────────────────────────── */}
      {favorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center gap-5 py-20 text-center"
        >
          <motion.div {...heartPulse}>
            <div className="rounded-full bg-gray-100 p-8">
              <BookmarkPlus className="h-16 w-16 text-gray-300" />
            </div>
          </motion.div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900">
              {t('لم تضف أي مفضلات بعد', 'No favorites yet')}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              {t(
                'اضغط على أيقونة القلب في أي إعلان لإضافته إلى المفضلة',
                'Tap the heart icon on any listing to add it to your favorites'
              )}
            </p>
          </div>
          <Button
            className="bg-red-500 text-white hover:bg-red-600 gap-2"
            onClick={() => navigate('market' as any)}
          >
            <ShoppingCart className="h-4 w-4" />
            {t('تصفح الإعلانات', 'Browse Listings')}
          </Button>
        </motion.div>
      ) : (
        <>
          {/* ── Filter Chips ──────────────────────────────────────── */}
          <motion.div {...fadeInUp} className="space-y-3">
            {/* Category filter chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  categoryFilter === 'all'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('الكل', 'All')}
              </button>
              {availableCategories.map((cat) => {
                const isActive = categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isRTL ? (categoryLabelsAr[cat] ?? cat) : (categoryLabelsEn[cat] ?? cat)}
                  </button>
                );
              })}
            </div>

            {/* Sort + Actions Row */}
            <div className="flex items-center gap-2">
              {/* Sort toggle */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-8"
                  onClick={() => setShowSortMenu(!showSortMenu)}
                >
                  <ArrowUpDown className="h-3 w-3" />
                  {isRTL
                    ? sortOptions.find((s) => s.id === sortOption)?.labelAr
                    : sortOptions.find((s) => s.id === sortOption)?.labelEn}
                </Button>
                <AnimatePresence>
                  {showSortMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden min-w-[160px]"
                    >
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => { setSortOption(opt.id); setShowSortMenu(false); }}
                          className={`flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                            sortOption === opt.id ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-600'
                          }`}
                        >
                          {opt.icon}
                          {isRTL ? opt.labelAr : opt.labelEn}
                          {sortOption === opt.id && <CheckCircle2 className="h-3 w-3 ms-auto" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Share Wishlist */}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8"
                onClick={handleShare}
              >
                <Share2 className="h-3 w-3" />
                {t('مشاركة المفضلة', 'Share Wishlist')}
              </Button>

              {/* Remove All */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-8 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    {t('مسح الكل', 'Remove All')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('مسح جميع المفضلات؟', 'Remove all favorites?')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t(
                        'سيتم إزالة جميع الإعلانات من المفضلة. لا يمكن التراجع عن هذا الإجراء.',
                        'All listings will be removed from your favorites. This action cannot be undone.'
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('إلغاء', 'Cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 text-white hover:bg-red-600"
                      onClick={() => useFavorites.getState().clearFavorites()}
                    >
                      {t('مسح الكل', 'Remove All')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>

          {/* ── Favorites Grid ──────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredAndSorted.map((item, index) => {
                const gradient = categoryGradients[item.category] ?? 'from-red-400 to-red-600';
                const icon = categoryIcons[item.category] ?? <Star className="h-5 w-5" />;
                const catLabel = isRTL ? (categoryLabelsAr[item.category] ?? item.category) : (categoryLabelsEn[item.category] ?? item.category);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, x: isRTL ? 50 : -50 }}
                    transition={{ delay: index * 0.03, duration: 0.25 }}
                  >
                    <Card
                      className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group"
                      onClick={() => navigate('listing-detail' as any, { id: item.id })}
                    >
                      <CardContent className="p-0">
                        {/* ── Gradient Header ────────────────── */}
                        <div className={`relative bg-gradient-to-br ${gradient} px-3 py-6 flex items-center justify-center`}>
                          <div className="text-white/90">{icon}</div>
                          {/* Category Badge */}
                          <Badge className="absolute top-2 start-2 bg-white/20 text-white border-0 text-[9px] backdrop-blur-sm">
                            {catLabel}
                          </Badge>
                          {/* Remove Heart Button */}
                          <button
                            className="absolute top-2 end-2 h-7 w-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500 hover:text-white transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFavorite(item.id);
                            }}
                          >
                            <Heart className="h-3.5 w-3.5 fill-current" />
                          </button>
                          {/* Decorative circles */}
                          <div className="absolute -bottom-3 -end-3 h-12 w-12 rounded-full bg-white/10" />
                        </div>

                        {/* ── Card Body ──────────────────────── */}
                        <div className="p-3 space-y-2">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {item.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <div className="text-left" dir="ltr">
                              <span className="text-sm font-bold text-red-500">
                                {item.price.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-gray-400"> SAR</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {formatAddedDate(item.addedAt)}
                            </span>
                            <span className="text-[10px] text-gray-400 truncate max-w-[80px]">
                              {item.providerName}
                            </span>
                          </div>

                          {/* View Listing Button (visible on hover/tap) */}
                          <Button
                            size="sm"
                            className="w-full gap-1 bg-red-500 text-white hover:bg-red-600 text-[10px] h-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('listing-detail' as any, { id: item.id });
                            }}
                          >
                            <Eye className="h-3 w-3" />
                            {t('عرض الإعلان', 'View Listing')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* ── Results count ────────────────────────────────────── */}
          <div className="text-center">
            <p className="text-xs text-gray-400">
              {t(
                `عرض ${filteredAndSorted.length} من ${favorites.length} مفضلة`,
                `Showing ${filteredAndSorted.length} of ${favorites.length} favorites`
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
