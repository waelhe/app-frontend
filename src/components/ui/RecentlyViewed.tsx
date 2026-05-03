'use client';

import { useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowLeft, ArrowRight, Trash2, Eye } from 'lucide-react';
import { useLanguage } from '@/store/use-language';
import { useNavigationStore } from '@/stores/navigationStore';
import { useRecentlyViewed, type RecentlyViewedItem } from '@/store/use-recently-viewed';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ── Category helpers ────────────────────────────────────────────────

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

// ── useClientItems hook ─────────────────────────────────────────────
// Uses useSyncExternalStore to safely read from zustand persisted store
// Returns [] on server (avoiding hydration mismatch) and actual items on client

const emptyItems: RecentlyViewedItem[] = [];

function useClientItems(): RecentlyViewedItem[] {
  const store = useRecentlyViewed;

  const subscribe = (callback: () => void) => {
    const unsub = store.subscribe(callback);
    return unsub;
  };

  const getSnapshot = () => {
    return store.getState().items;
  };

  const getServerSnapshot = () => {
    return emptyItems;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// ── Component ──────────────────────────────────────────────────────

export function RecentlyViewed() {
  const { t, isRTL } = useLanguage();
  const { navigate } = useNavigationStore();
  const clearAll = useRecentlyViewed((s) => s.clearAll);
  const items = useClientItems();

  if (items.length === 0) return null;

  const ForwardArrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-sm">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {t('شاهدت مؤخراً', 'Recently Viewed')}
              </h2>
              <p className="text-xs text-gray-400">
                {t('آخر الإعلانات التي شاهدتها', 'Listings you recently viewed')}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-red-500 gap-1"
            onClick={clearAll}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="text-xs">{t('مسح', 'Clear')}</span>
          </Button>
        </div>

        {/* Horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          <AnimatePresence>
            {items.map((item, index) => {
              const gradient = categoryGradients[item.category] ?? 'from-gray-400 to-gray-600';
              const catLabel = isRTL
                ? (categoryLabelsAr[item.category] ?? item.category)
                : (categoryLabelsEn[item.category] ?? item.category);
              const timeAgo = getTimeAgo(item.viewedAt, isRTL);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.04, duration: 0.25 }}
                  className="shrink-0 w-44"
                >
                  <Card
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
                    onClick={() => navigate('listing-detail', { id: item.id })}
                  >
                    {/* Category gradient header */}
                    <div
                      className={`h-20 bg-gradient-to-br ${gradient} flex items-center justify-center relative`}
                    >
                      <Badge className="absolute top-2 start-2 bg-white/90 text-gray-700 text-[9px] px-1.5 py-0">
                        {catLabel}
                      </Badge>
                    </div>
                    <CardContent className="p-2.5 space-y-1">
                      <h4 className="text-xs font-semibold text-gray-900 line-clamp-1">
                        {item.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-500" dir="ltr">
                          {item.price.toLocaleString()} ر.س
                        </span>
                        <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {timeAgo}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// ── Helpers ────────────────────────────────────────────────────────

function getTimeAgo(dateStr: string, isRTL: boolean): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return isRTL ? 'الآن' : 'Just now';
    if (diffMin < 60) return isRTL ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`;
    if (diffHour < 24) return isRTL ? `منذ ${diffHour} ساعة` : `${diffHour}h ago`;
    if (diffDay < 7) return isRTL ? `منذ ${diffDay} يوم` : `${diffDay}d ago`;
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}
