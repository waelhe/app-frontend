'use client';

import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  CalendarCheck,
  MessageSquare,
  Heart,
  LayoutDashboard,
  HelpCircle,
  User,
} from 'lucide-react';
import { useLanguage } from '@/store/use-language';
import { useAuth } from '@/store/use-auth';
import { useNavigationStore } from '@/stores/navigationStore';
import type { AppView } from '@/lib/types';

// ── Types ──────────────────────────────────────────────────────────

interface QuickAction {
  id: string;
  icon: React.ElementType;
  labelAr: string;
  labelEn: string;
  color: string;
  bgColor: string;
  view: AppView;
  requiresAuth: boolean;
}

// ── Actions Config ─────────────────────────────────────────────────

const quickActions: QuickAction[] = [
  {
    id: 'post-ad',
    icon: Plus,
    labelAr: 'إضافة إعلان',
    labelEn: 'Post Ad',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    view: 'create-listing',
    requiresAuth: true,
  },
  {
    id: 'search',
    icon: Search,
    labelAr: 'بحث',
    labelEn: 'Search',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    view: 'search',
    requiresAuth: false,
  },
  {
    id: 'my-bookings',
    icon: CalendarCheck,
    labelAr: 'حجوزاتي',
    labelEn: 'My Bookings',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    view: 'bookings-list',
    requiresAuth: true,
  },
  {
    id: 'messages',
    icon: MessageSquare,
    labelAr: 'الرسائل',
    labelEn: 'Messages',
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
    view: 'inbox',
    requiresAuth: true,
  },
  {
    id: 'favorites',
    icon: Heart,
    labelAr: 'المفضلة',
    labelEn: 'Favorites',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    view: 'favorites',
    requiresAuth: true,
  },
  {
    id: 'my-ads',
    icon: LayoutDashboard,
    labelAr: 'إعلاناتي',
    labelEn: 'My Ads',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    view: 'my-ads',
    requiresAuth: true,
  },
  {
    id: 'help',
    icon: HelpCircle,
    labelAr: 'المساعدة',
    labelEn: 'Help',
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    view: 'settings',
    requiresAuth: false,
  },
  {
    id: 'profile',
    icon: User,
    labelAr: 'حسابي',
    labelEn: 'Profile',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    view: 'profile',
    requiresAuth: true,
  },
];

// ── Component ──────────────────────────────────────────────────────

export function QuickActions() {
  const { t, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { navigate } = useNavigationStore();

  const handleActionClick = (action: QuickAction) => {
    if (action.requiresAuth && !isAuthenticated) {
      window.dispatchEvent(new CustomEvent('open-login', { detail: { mode: 'login' } }));
      return;
    }
    navigate(action.view);
  };

  return (
    <section className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {t('إجراءات سريعة', 'Quick Actions')}
            </h2>
            <p className="text-xs text-gray-400">
              {t('الوصول السريع لأهم الميزات', 'Quick access to key features')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleActionClick(action)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className={`w-10 h-10 rounded-full ${action.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <span className="text-[11px] font-medium text-gray-700 text-center leading-tight line-clamp-2">
                  {t(action.labelAr, action.labelEn)}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
