'use client';

import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  CalendarCheck,
  MessageSquare,
  Heart,
  LayoutDashboard,
  UserPlus,
  User,
  ShoppingBag,
  Wrench,
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
  gradient?: string;
  view: AppView;
  requiresAuth: boolean;
  /** Show even when not authenticated (with login prompt) */
  showForGuest: boolean;
  /** Whether this is a primary/prominent action */
  isPrimary?: boolean;
}

// ── Actions Config ─────────────────────────────────────────────────

const authenticatedActions: QuickAction[] = [
  {
    id: 'post-ad',
    icon: Plus,
    labelAr: 'إضافة إعلان',
    labelEn: 'Post Ad',
    color: 'text-white',
    bgColor: 'bg-red-500',
    gradient: 'from-red-500 to-rose-600',
    view: 'create-listing',
    requiresAuth: true,
    showForGuest: true,
    isPrimary: true,
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
    showForGuest: true,
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
    showForGuest: false,
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
    showForGuest: false,
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
    showForGuest: false,
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
    showForGuest: false,
  },
  {
    id: 'market',
    icon: ShoppingBag,
    labelAr: 'السوق',
    labelEn: 'Market',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    view: 'market',
    requiresAuth: false,
    showForGuest: true,
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
    showForGuest: false,
  },
];

const guestActions: QuickAction[] = [
  {
    id: 'post-ad-guest',
    icon: Plus,
    labelAr: 'إضافة إعلان',
    labelEn: 'Post Ad',
    color: 'text-white',
    bgColor: 'bg-red-500',
    gradient: 'from-red-500 to-rose-600',
    view: 'create-listing',
    requiresAuth: true,
    showForGuest: true,
    isPrimary: true,
  },
  {
    id: 'register',
    icon: UserPlus,
    labelAr: 'إنشاء حساب',
    labelEn: 'Sign Up',
    color: 'text-white',
    bgColor: 'bg-emerald-500',
    gradient: 'from-emerald-500 to-teal-600',
    view: 'create-listing' as AppView,
    requiresAuth: false,
    showForGuest: true,
    isPrimary: true,
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
    showForGuest: true,
  },
  {
    id: 'market',
    icon: ShoppingBag,
    labelAr: 'السوق',
    labelEn: 'Market',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    view: 'market',
    requiresAuth: false,
    showForGuest: true,
  },
  {
    id: 'services',
    icon: Wrench,
    labelAr: 'الخدمات',
    labelEn: 'Services',
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    view: 'services',
    requiresAuth: false,
    showForGuest: true,
  },
  {
    id: 'login',
    icon: User,
    labelAr: 'تسجيل الدخول',
    labelEn: 'Log In',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    view: 'home',
    requiresAuth: false,
    showForGuest: true,
  },
];

// ── Component ──────────────────────────────────────────────────────

export function QuickActions() {
  const { t, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { navigate } = useNavigationStore();

  const actions = isAuthenticated ? authenticatedActions : guestActions;

  const handleActionClick = (action: QuickAction) => {
    // Guest-specific actions
    if (!isAuthenticated) {
      if (action.id === 'register') {
        window.dispatchEvent(new CustomEvent('open-login', { detail: { mode: 'register' } }));
        return;
      }
      if (action.id === 'login') {
        window.dispatchEvent(new CustomEvent('open-login', { detail: { mode: 'login' } }));
        return;
      }
      if (action.id === 'post-ad-guest') {
        window.dispatchEvent(new CustomEvent('open-login', { detail: { mode: 'register' } }));
        return;
      }
    }

    // Auth-required actions for non-authenticated users
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
              {isAuthenticated
                ? t('إجراءات سريعة', 'Quick Actions')
                : t('ابدأ الآن', 'Get Started')}
            </h2>
            <p className="text-xs text-gray-400">
              {isAuthenticated
                ? t('الوصول السريع لأهم الميزات', 'Quick access to key features')
                : t('أنشئ حساباً وانشر إعلانك مجاناً', 'Create an account and post your ad for free')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {actions.map((action, index) => {
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
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-shadow duration-200 ${
                  action.isPrimary
                    ? `bg-gradient-to-br ${action.gradient} shadow-md hover:shadow-lg text-white`
                    : 'bg-white border border-gray-100 shadow-sm hover:shadow-md'
                }`}
              >
                <div className={`w-10 h-10 rounded-full ${action.isPrimary ? 'bg-white/20' : action.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${action.isPrimary ? 'text-white' : action.color}`} />
                </div>
                <span className={`text-[11px] font-medium text-center leading-tight line-clamp-2 ${
                  action.isPrimary ? 'text-white' : 'text-gray-700'
                }`}>
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
