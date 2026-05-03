'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/store/use-auth';
import { useLanguage } from '@/store/use-language';
import { useNavigationStore } from '@/stores/navigationStore';
import { useFavorites } from '@/store/use-favorites';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useListings, useCreateListing } from '@/hooks/useApi';
import type { ListingSummary } from '@/lib/types';
import { Hero } from '@/components/ui';
import { InteractiveMarketSection } from '@/components/sections/InteractiveMarketSection';
import { InteractiveDirectorySection } from '@/components/sections/InteractiveDirectorySection';
import { ListingDetail } from '@/components/system/ListingDetail';
import { SearchView } from '@/components/system/SearchView';
import { BookingFlow } from '@/components/system/BookingFlow';
import { MessagingView } from '@/components/system/MessagingView';
import { ConversationListView } from '@/components/system/ConversationListView';
import { ProfileView } from '@/components/system/ProfileView';
import { BookingsListView } from '@/components/system/BookingsListView';
import { EditListingForm } from '@/components/system/EditListingForm';
import { FavoritesView } from '@/components/system/FavoritesView';
import { SettingsView } from '@/components/system/SettingsView';
import { NotificationCenter } from '@/components/system/NotificationCenter';
import { ProviderDashboard } from '@/components/dashboard/ProviderDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { QuickActions } from '@/components/ui/QuickActions';
import { RecentlyViewed } from '@/components/ui/RecentlyViewed';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  ShoppingBag,
  Wrench,
  BookOpen,
  Users,
  Search,
  LayoutDashboard,
  Plus,
  ChevronDown,
  ChevronUp,
  Building2,
  Sofa,
  Smartphone,
  Car,
  Briefcase,
  HardHat,
  Loader2,
  CalendarCheck,
  MessageSquare,
  Heart,
  Stethoscope,
  UtensilsCrossed,
  GraduationCap,
  Sparkles,
  Bell,
  Shield,
  Headphones,
  Lock,
  Star,
  TrendingUp,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Megaphone,
  CheckCircle,
  CreditCard,
  UserCheck,
  Clock,
  Flame,
  Quote,
  ImagePlus,
  Camera,
  Tag,
  X,
  MapPin,
  Phone,
  Timer,
  CalendarDays,
  Truck,
  Package,
  Handshake,
  Zap,
  Info,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';

// ── Dynamic imports for local components (export default) ──────────
const UrgentServices = dynamic(() => import('@/components/local/UrgentServices'), { ssr: false });
const EmergencyContacts = dynamic(() => import('@/components/local/EmergencyContacts'), { ssr: false });
const Community = dynamic(() => import('@/components/local/Community'), { ssr: false });
const Charity = dynamic(() => import('@/components/local/Charity'), { ssr: false });
const Events = dynamic(() => import('@/components/local/Events'), { ssr: false });
const LocalNews = dynamic(() => import('@/components/local/LocalNews'), { ssr: false });

// ── Navigation Tabs ────────────────────────────────────────────────
const mainNavItems = [
  { id: 'home' as const, icon: Home },
  { id: 'market' as const, icon: ShoppingBag },
  { id: 'services' as const, icon: Wrench },
  { id: 'directory' as const, icon: BookOpen },
  { id: 'community' as const, icon: Users },
];

// ── All categories matching the backend ──────────────────────────
const allCategories = [
  { value: 'real-estate', labelAr: 'عقارات', labelEn: 'Real Estate', icon: Building2, color: 'from-amber-400 to-orange-500' },
  { value: 'electronics', labelAr: 'إلكترونيات', labelEn: 'Electronics', icon: Smartphone, color: 'from-blue-400 to-cyan-500' },
  { value: 'cars', labelAr: 'سيارات', labelEn: 'Cars', icon: Car, color: 'from-gray-400 to-slate-600' },
  { value: 'services', labelAr: 'خدمات', labelEn: 'Services', icon: Briefcase, color: 'from-emerald-400 to-teal-500' },
  { value: 'jobs', labelAr: 'وظائف', labelEn: 'Jobs', icon: HardHat, color: 'from-purple-400 to-violet-500' },
  { value: 'furniture', labelAr: 'أثاث', labelEn: 'Furniture', icon: Sofa, color: 'from-rose-400 to-pink-500' },
  { value: 'medical', labelAr: 'طبي', labelEn: 'Medical', icon: Stethoscope, color: 'from-red-400 to-rose-500' },
  { value: 'dining', labelAr: 'مطاعم', labelEn: 'Dining', icon: UtensilsCrossed, color: 'from-orange-400 to-amber-500' },
  { value: 'education', labelAr: 'تعليم', labelEn: 'Education', icon: GraduationCap, color: 'from-indigo-400 to-blue-500' },
  { value: 'beauty', labelAr: 'جمال وعناية', labelEn: 'Beauty & Care', icon: Sparkles, color: 'from-pink-400 to-fuchsia-500' },
];

// ── Category gradients for trending section ──────────────────────────
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

// ════════════════════════════════════════════════════════════════════
// NEW SECTION 1: Stats Bar
// ════════════════════════════════════════════════════════════════════

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <div ref={ref} className="text-3xl sm:text-4xl font-bold text-white tabular-nums" dir="ltr">
      {count.toLocaleString()}{suffix}
    </div>
  );
}

function StatsBar() {
  const { t, isRTL } = useLanguage();

  const stats = [
    {
      icon: ShoppingBag,
      value: 500,
      suffix: '+',
      labelAr: 'إعلان',
      labelEn: 'Listings',
    },
    {
      icon: UserCheck,
      value: 200,
      suffix: '+',
      labelAr: 'مزود خدمة',
      labelEn: 'Service Providers',
    },
    {
      icon: Users,
      value: 10000,
      suffix: '+',
      labelAr: 'مستخدم',
      labelEn: 'Users',
    },
    {
      icon: Sparkles,
      value: 50,
      suffix: '+',
      labelAr: 'فئة',
      labelEn: 'Categories',
    },
  ];

  return (
    <section className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-gradient-to-r from-red-500 to-red-600 p-6 sm:p-8 shadow-lg shadow-red-500/20 overflow-hidden relative"
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 end-0 w-64 h-64 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 start-0 w-48 h-48 rounded-full bg-white/20 translate-y-1/3 -translate-x-1/4" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  <p className="text-white/80 text-sm mt-1 font-medium">
                    {t(stat.labelAr, stat.labelEn)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════
// NEW SECTION 2: Trending Listings Section
// ════════════════════════════════════════════════════════════════════

function TrendingListingsSection() {
  const { t, isRTL } = useLanguage();
  const { navigate } = useNavigationStore();

  const { data, isLoading } = useListings({ page: 0, size: 8 });

  const listings = data?.content ?? [];
  const ForwardArrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-sm">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {t('إعلانات رائجة', 'Trending Listings')}
              </h2>
              <p className="text-xs text-gray-400">
                {t('الأكثر طلباً هذا الأسبوع', 'Most requested this week')}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1"
            onClick={() => navigate('market')}
          >
            {t('عرض الكل', 'View All')}
            <ForwardArrow className="w-4 h-4" />
          </Button>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shrink-0 w-44 animate-pulse">
                <div className="h-24 bg-gray-200 rounded-t-xl" />
                <div className="p-2.5 bg-white rounded-b-xl border border-gray-100 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Horizontal scrollable cards */}
        {!isLoading && listings.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {listings.map((listing, index) => {
              const gradient = categoryGradients[listing.category] ?? 'from-gray-400 to-gray-600';
              const catLabel = isRTL
                ? (categoryLabelsAr[listing.category] ?? listing.category)
                : (categoryLabelsEn[listing.category] ?? listing.category);

              return (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="shrink-0 w-44"
                >
                  <Card
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
                    onClick={() => navigate('listing-detail', { id: listing.id })}
                  >
                    {/* Gradient header */}
                    <div className={`h-24 bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
                      <Badge className="absolute top-2 start-2 bg-white/90 text-gray-700 text-[9px] px-1.5 py-0 border-0">
                        {catLabel}
                      </Badge>
                      <Badge className="absolute top-2 end-2 bg-orange-500 text-white text-[9px] px-1.5 py-0 border-0 flex items-center gap-0.5">
                        <TrendingUp className="h-2.5 w-2.5" />
                        {t('رائج', 'Trending')}
                      </Badge>
                    </div>
                    <CardContent className="p-2.5 space-y-1.5">
                      <h4 className="text-xs font-semibold text-gray-900 line-clamp-1">
                        {listing.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-500" dir="ltr">
                          {listing.price.toLocaleString()} {t('ر.س', 'SAR')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && listings.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              {t('لا توجد إعلانات رائجة حالياً', 'No trending listings right now')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════
// NEW SECTION 3: Premium Listings Banner
// ════════════════════════════════════════════════════════════════════

function PremiumBanner() {
  const { t, isRTL } = useLanguage();
  const { navigate } = useNavigationStore();
  const { isAuthenticated } = useAuth();

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate('create-listing');
    } else {
      window.dispatchEvent(new CustomEvent('open-login', { detail: { mode: 'register' } }));
    }
  };

  return (
    <section className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-red-600 to-red-500 shadow-lg shadow-red-500/20"
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-[0.07]">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="premium-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="3" fill="white" />
                  <line x1="0" y1="0" x2="40" y2="40" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#premium-pattern)" />
            </svg>
          </div>

          {/* Decorative circles */}
          <div className="absolute top-0 end-0 w-72 h-72 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 start-0 w-56 h-56 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 lg:p-10">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Megaphone className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {t('إعلن عن خدماتك', 'Promote Your Services')}
                </h2>
                <p className="text-white/80 text-sm sm:text-base max-w-md leading-relaxed">
                  {t(
                    'انضم إلى آلاف مقدمي الخدمات واعرض خدماتك لملايين المستخدمين. ابدأ الآن مجاناً!',
                    'Join thousands of service providers and showcase your services to millions of users. Start for free!'
                  )}
                </p>
              </div>
            </div>
            <Button
              size="lg"
              className="shrink-0 bg-white text-red-600 hover:bg-white/90 font-semibold px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handleCTA}
            >
              {t('ابدأ الآن', 'Get Started')}
              <ArrowLeft className={`w-4 h-4 ${isRTL ? 'mr-1 rotate-180' : 'ml-1'}`} />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════
// NEW SECTION 4: Trust & Safety Section
// ════════════════════════════════════════════════════════════════════

function TrustSafetySection() {
  const { t, isRTL } = useLanguage();

  const badges = [
    {
      icon: Lock,
      titleAr: 'دفع آمن',
      titleEn: 'Secure Payment',
      descAr: 'جميع المعاملات المالية محمية بتشفير متقدم',
      descEn: 'All financial transactions are protected with advanced encryption',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      icon: ShieldCheck,
      titleAr: 'حماية المشتري',
      titleEn: 'Buyer Protection',
      descAr: 'ضمان استرداد الأموال في حالة عدم الرضا',
      descEn: 'Money-back guarantee if you\'re not satisfied',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: UserCheck,
      titleAr: 'بائعون موثوقون',
      titleEn: 'Verified Sellers',
      descAr: 'جميع البائعين موثقون ومعتمدون من فريقنا',
      descEn: 'All sellers are verified and approved by our team',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      icon: Headphones,
      titleAr: 'دعم 24/7',
      titleEn: '24/7 Support',
      descAr: 'فريق دعم متاح على مدار الساعة لمساعدتك',
      descEn: 'Support team available around the clock to help you',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <section className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-5"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {t('الثقة والأمان', 'Trust & Safety')}
            </h2>
            <p className="text-xs text-gray-400">
              {t('سوقك الآمن والموثوق', 'Your safe and trusted marketplace')}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group"
              >
                <Card className="h-full border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-gray-200">
                  <CardContent className="p-4 sm:p-5 text-center space-y-3">
                    <div className={`w-12 h-12 rounded-xl ${badge.bgColor} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-6 w-6 ${badge.iconColor}`} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {t(badge.titleAr, badge.titleEn)}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {t(badge.descAr, badge.descEn)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════
// NEW SECTION 5: Why Choose Us Section
// ════════════════════════════════════════════════════════════════════

function WhyChooseUsSection() {
  const { t, isRTL } = useLanguage();

  const features = [
    {
      icon: ShoppingBag,
      titleAr: 'سوق محلي شامل',
      titleEn: 'Complete Local Market',
      descAr: 'اكتشف آلاف الخدمات والمنتجات في منطقتك. من العقارات إلى المطاعم، كل ما تحتاجه في مكان واحد.',
      descEn: 'Discover thousands of services and products in your area. From real estate to dining, everything you need in one place.',
      gradient: 'from-red-500 to-rose-600',
    },
    {
      icon: Shield,
      titleAr: 'تجربة آمنة وموثوقة',
      titleEn: 'Safe & Trusted Experience',
      descAr: 'نضمن لك تجربة تسوق آمنة مع حماية كاملة للمشتري وبائعين موثقين ومعتمدين.',
      descEn: 'We guarantee a safe shopping experience with full buyer protection and verified, approved sellers.',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Headphones,
      titleAr: 'خدمة عملاء متميزة',
      titleEn: 'Excellent Customer Service',
      descAr: 'فريق دعم متخصص متاح على مدار الساعة لمساعدتك في أي استفسار أو مشكلة.',
      descEn: 'A dedicated support team available around the clock to help with any inquiry or issue.',
      gradient: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <section className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {t('لماذا نبض؟', 'Why Nabd?')}
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {t(
              'نقدم لك تجربة تسوق فريدة تجمع بين السهولة والأمان والتنوع',
              'We offer a unique shopping experience combining ease, safety, and variety'
            )}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                <Card className="h-full border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <CardContent className="p-6 sm:p-8 text-center space-y-4">
                    <motion.div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      {t(feature.titleAr, feature.titleEn)}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {t(feature.descAr, feature.descEn)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════
// NEW SECTION 6: Testimonials Carousel
// ════════════════════════════════════════════════════════════════════

interface Testimonial {
  nameAr: string;
  nameEn: string;
  initials: string;
  rating: number;
  quoteAr: string;
  quoteEn: string;
  roleAr: string;
  roleEn: string;
}

const testimonials: Testimonial[] = [
  {
    nameAr: 'أحمد محمد',
    nameEn: 'Ahmed Mohammed',
    initials: 'أم',
    rating: 5,
    quoteAr: 'وجدت شقة ممتازة في وقت قياسي! المنصة سهلة الاستخدام والبائعون موثوقون جداً.',
    quoteEn: 'I found an excellent apartment in record time! The platform is easy to use and the sellers are very reliable.',
    roleAr: 'مشتري عقارات',
    roleEn: 'Real Estate Buyer',
  },
  {
    nameAr: 'سارة خالد',
    nameEn: 'Sara Khalid',
    initials: 'سخ',
    rating: 5,
    quoteAr: 'خدمة عملاء رائعة ودعم سريع. أنصح الجميع باستخدام نبض لاحتياجاتهم.',
    quoteEn: 'Amazing customer service and fast support. I recommend Nabd to everyone for their needs.',
    roleAr: 'مقدمة خدمات',
    roleEn: 'Service Provider',
  },
  {
    nameAr: 'عمر حسين',
    nameEn: 'Omar Hussein',
    initials: 'عح',
    rating: 4,
    quoteAr: 'تجربة مميزة! حجزت خدمة سباكة وجاء الفني في الموعد المحدد بأسعار معقولة.',
    quoteEn: 'Great experience! I booked a plumbing service and the technician arrived on time at reasonable prices.',
    roleAr: 'مستخدم',
    roleEn: 'User',
  },
  {
    nameAr: 'فاطمة علي',
    nameEn: 'Fatima Ali',
    initials: 'فع',
    rating: 5,
    quoteAr: 'أفضل منصة محلية! الدفع الآمن والحماية للمشتري تعطيني ثقة كاملة.',
    quoteEn: 'Best local platform! Secure payment and buyer protection give me complete confidence.',
    roleAr: 'مشترية',
    roleEn: 'Buyer',
  },
  {
    nameAr: 'محمد عبدالله',
    nameEn: 'Mohammed Abdullah',
    initials: 'مع',
    rating: 5,
    quoteAr: 'زادت مبيعاتي بشكل كبير بعد الانضمام لنبض. منصة مثالية لمقدمي الخدمات.',
    quoteEn: 'My sales increased significantly after joining Nabd. Ideal platform for service providers.',
    roleAr: 'بائع',
    roleEn: 'Seller',
  },
  {
    nameAr: 'نورا سعيد',
    nameEn: 'Noura Saeed',
    initials: 'نس',
    rating: 4,
    quoteAr: 'تنوع كبير في الفئات والخدمات. أستخدمها يومياً للبحث عن أفضل العروض.',
    quoteEn: 'Great variety of categories and services. I use it daily to find the best deals.',
    roleAr: 'مستخدمة نشطة',
    roleEn: 'Active User',
  },
];

function TestimonialsCarousel() {
  const { t, isRTL } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const testimonial = testimonials[currentIndex];

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? (isRTL ? -100 : 100) : (isRTL ? 100 : -100),
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? (isRTL ? 100 : -100) : (isRTL ? -100 : 100),
      opacity: 0,
    }),
  };

  return (
    <section className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-5"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm">
            <Quote className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {t('ماذا يقول عملاؤنا', 'What Our Customers Say')}
            </h2>
            <p className="text-xs text-gray-400">
              {t('آراء حقيقية من مستخدمين حقيقيين', 'Real reviews from real users')}
            </p>
          </div>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <CardContent className="p-6 sm:p-8 lg:p-10 min-h-[220px] flex flex-col items-center text-center">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="flex flex-col items-center text-center space-y-4"
                >
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">{testimonial.initials}</span>
                  </div>

                  {/* Name & Role */}
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">
                      {t(testimonial.nameAr, testimonial.nameEn)}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {t(testimonial.roleAr, testimonial.roleEn)}
                    </p>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-lg italic">
                    &ldquo;{t(testimonial.quoteAr, testimonial.quoteEn)}&rdquo;
                  </p>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Navigation arrows */}
          <button
            onClick={goToPrev}
            className={`absolute top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md flex items-center justify-center transition-all duration-200 ${
              isRTL ? 'right-2 sm:-right-4' : 'left-2 sm:-left-4'
            }`}
            aria-label={t('السابق', 'Previous')}
          >
            <ChevronUp className={`w-4 h-4 text-gray-600 ${isRTL ? '' : '-rotate-90'}`} />
          </button>
          <button
            onClick={goToNext}
            className={`absolute top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md flex items-center justify-center transition-all duration-200 ${
              isRTL ? 'left-2 sm:-left-4' : 'right-2 sm:-right-4'
            }`}
            aria-label={t('التالي', 'Next')}
          >
            <ChevronUp className={`w-4 h-4 text-gray-600 ${isRTL ? 'rotate-90' : 'rotate-90'}`} />
          </button>

          {/* Dots indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-6 bg-red-500'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`${t('انتقل إلى الشهادة', 'Go to testimonial')} ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Sub-categories map ──────────────────────────────────────────────
const subCategoriesMap: Record<string, { value: string; labelAr: string; labelEn: string }[]> = {
  'real-estate': [
    { value: 'apartment', labelAr: 'شقة', labelEn: 'Apartment' },
    { value: 'house', labelAr: 'منزل', labelEn: 'House' },
    { value: 'land', labelAr: 'أرض', labelEn: 'Land' },
    { value: 'office', labelAr: 'مكتب', labelEn: 'Office' },
    { value: 'shop', labelAr: 'محل', labelEn: 'Shop' },
  ],
  electronics: [
    { value: 'phones', labelAr: 'هواتف', labelEn: 'Phones' },
    { value: 'laptops', labelAr: 'لابتوب', labelEn: 'Laptops' },
    { value: 'tablets', labelAr: 'أجهزة لوحية', labelEn: 'Tablets' },
    { value: 'accessories', labelAr: 'إكسسوارات', labelEn: 'Accessories' },
    { value: 'gaming', labelAr: 'ألعاب', labelEn: 'Gaming' },
  ],
  cars: [
    { value: 'sedan', labelAr: 'سيدان', labelEn: 'Sedan' },
    { value: 'suv', labelAr: 'دفع رباعي', labelEn: 'SUV' },
    { value: 'truck', labelAr: 'شاحنة', labelEn: 'Truck' },
    { value: 'motorcycle', labelAr: 'دراجة نارية', labelEn: 'Motorcycle' },
    { value: 'parts', labelAr: 'قطع غيار', labelEn: 'Parts' },
  ],
  services: [
    { value: 'home-repair', labelAr: 'إصلاح منزلي', labelEn: 'Home Repair' },
    { value: 'cleaning', labelAr: 'تنظيف', labelEn: 'Cleaning' },
    { value: 'plumbing', labelAr: 'سباكة', labelEn: 'Plumbing' },
    { value: 'electrical', labelAr: 'كهرباء', labelEn: 'Electrical' },
    { value: 'painting', labelAr: 'دهان', labelEn: 'Painting' },
  ],
  jobs: [
    { value: 'full-time', labelAr: 'دوام كامل', labelEn: 'Full-time' },
    { value: 'part-time', labelAr: 'دوام جزئي', labelEn: 'Part-time' },
    { value: 'contract', labelAr: 'عقد مؤقت', labelEn: 'Contract' },
    { value: 'freelance', labelAr: 'عمل حر', labelEn: 'Freelance' },
    { value: 'remote', labelAr: 'عن بُعد', labelEn: 'Remote' },
  ],
  furniture: [
    { value: 'living-room', labelAr: 'غرفة معيشة', labelEn: 'Living Room' },
    { value: 'bedroom', labelAr: 'غرفة نوم', labelEn: 'Bedroom' },
    { value: 'kitchen', labelAr: 'مطبخ', labelEn: 'Kitchen' },
    { value: 'office-furniture', labelAr: 'أثاث مكتبي', labelEn: 'Office Furniture' },
    { value: 'outdoor', labelAr: 'خارجي', labelEn: 'Outdoor' },
  ],
  medical: [
    { value: 'clinic', labelAr: 'عيادة', labelEn: 'Clinic' },
    { value: 'hospital', labelAr: 'مستشفى', labelEn: 'Hospital' },
    { value: 'pharmacy', labelAr: 'صيدلية', labelEn: 'Pharmacy' },
    { value: 'lab', labelAr: 'مختبر', labelEn: 'Lab' },
    { value: 'equipment', labelAr: 'معدات طبية', labelEn: 'Medical Equipment' },
  ],
  dining: [
    { value: 'restaurant', labelAr: 'مطعم', labelEn: 'Restaurant' },
    { value: 'cafe', labelAr: 'مقهى', labelEn: 'Cafe' },
    { value: 'bakery', labelAr: 'مخبز', labelEn: 'Bakery' },
    { value: 'catering', labelAr: 'تموين', labelEn: 'Catering' },
    { value: 'delivery', labelAr: 'توصيل', labelEn: 'Delivery' },
  ],
  education: [
    { value: 'school', labelAr: 'مدرسة', labelEn: 'School' },
    { value: 'university', labelAr: 'جامعة', labelEn: 'University' },
    { value: 'tutoring', labelAr: 'دروس خصوصية', labelEn: 'Tutoring' },
    { value: 'courses', labelAr: 'دورات', labelEn: 'Courses' },
    { value: 'training', labelAr: 'تدريب', labelEn: 'Training' },
  ],
  beauty: [
    { value: 'salon', labelAr: 'صالون', labelEn: 'Salon' },
    { value: 'spa', labelAr: 'سبا', labelEn: 'Spa' },
    { value: 'skincare', labelAr: 'عناية بالبشرة', labelEn: 'Skincare' },
    { value: 'haircare', labelAr: 'عناية بالشعر', labelEn: 'Haircare' },
    { value: 'makeup', labelAr: 'مكياج', labelEn: 'Makeup' },
  ],
};

// ── Predefined locations ─────────────────────────────────────────────
const predefinedLocations = [
  { value: 'riyadh', labelAr: 'الرياض', labelEn: 'Riyadh' },
  { value: 'jeddah', labelAr: 'جدة', labelEn: 'Jeddah' },
  { value: 'mecca', labelAr: 'مكة المكرمة', labelEn: 'Mecca' },
  { value: 'medina', labelAr: 'المدينة المنورة', labelEn: 'Medina' },
  { value: 'dammam', labelAr: 'الدمام', labelEn: 'Dammam' },
  { value: 'khobar', labelAr: 'الخبر', labelEn: 'Khobar' },
  { value: 'taif', labelAr: 'الطائف', labelEn: 'Taif' },
  { value: 'tabuk', labelAr: 'تبوك', labelEn: 'Tabuk' },
  { value: 'abha', labelAr: 'أبها', labelEn: 'Abha' },
  { value: 'other', labelAr: 'أخرى', labelEn: 'Other' },
];

// ── Arabic week days ─────────────────────────────────────────────────
const weekDays = [
  { value: 'sat', labelAr: 'السبت', labelEn: 'Sat' },
  { value: 'sun', labelAr: 'الأحد', labelEn: 'Sun' },
  { value: 'mon', labelAr: 'الاثنين', labelEn: 'Mon' },
  { value: 'tue', labelAr: 'الثلاثاء', labelEn: 'Tue' },
  { value: 'wed', labelAr: 'الأربعاء', labelEn: 'Wed' },
  { value: 'thu', labelAr: 'الخميس', labelEn: 'Thu' },
  { value: 'fri', labelAr: 'الجمعة', labelEn: 'Fri' },
];

// ── Inline CreateListingForm (enhanced 5-step wizard) ─────────────────
function CreateListingForm() {
  const { t, isRTL } = useLanguage();
  const { goBack } = useNavigationStore();

  // Step state
  const [step, setStep] = useState(1); // 1-5

  // Step 1: Category
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');

  // Step 2: Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('SAR');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [condition, setCondition] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Step 3: Images
  const [images, setImages] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  // Step 4: Scheduling
  const [isAvailableNow, setIsAvailableNow] = useState(true);
  const [workingHoursFrom, setWorkingHoursFrom] = useState('09:00');
  const [workingHoursTo, setWorkingHoursTo] = useState('17:00');
  const [availableDays, setAvailableDays] = useState<string[]>(['sat', 'sun', 'mon', 'tue', 'wed', 'thu']);
  const [instantBooking, setInstantBooking] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery' | 'both'>('pickup');

  // Step 5: Review
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const selectedCat = allCategories.find((c) => c.value === category);
  const subCategories = category ? (subCategoriesMap[category] ?? []) : [];
  const selectedSubCat = subCategories.find((sc) => sc.value === subCategory);

  // Categories where condition applies
  const conditionApplicable = ['electronics', 'cars', 'furniture'].includes(category);

  // Tags management
  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && tags.length < 10 && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };
  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Image placeholders
  const addPlaceholderImage = () => {
    if (images.length < 8) {
      const colors = ['from-amber-300 to-orange-400', 'from-blue-300 to-cyan-400', 'from-emerald-300 to-teal-400', 'from-rose-300 to-pink-400', 'from-purple-300 to-violet-400', 'from-gray-300 to-slate-400', 'from-red-300 to-rose-400', 'from-yellow-300 to-amber-400'];
      setImages([...images, colors[images.length % colors.length]]);
    }
  };
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    if (mainImageIndex >= newImages.length) setMainImageIndex(0);
  };

  // Available days toggle
  const toggleDay = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const { useCreateListing: createListingHook } = await import('@/hooks/useApi');
      // We can't call hooks inside a callback, so use the service directly as fallback
      const { catalogService } = await import('@/lib/api');
      await catalogService.create({
        title,
        description: description || undefined,
        category,
        priceCents: Math.round(parseFloat(price) * 100),
      });
      goBack();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : t('حدث خطأ أثناء النشر', 'Failed to publish listing')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = [
    { ar: 'الفئة', en: 'Category' },
    { ar: 'التفاصيل', en: 'Details' },
    { ar: 'الصور', en: 'Images' },
    { ar: 'الجدولة', en: 'Schedule' },
    { ar: 'مراجعة', en: 'Review' },
  ];

  const stepIcons = [LayoutDashboard, FileText, Camera, CalendarDays, CheckCircle];

  return (
    <div className="space-y-4 p-4">
      {/* Header with steps indicator */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          {t('إضافة إعلان', 'Create Listing')}
        </h1>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                step >= s ? 'w-5 bg-red-500' : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step labels with icons */}
      <div className="flex justify-between gap-1">
        {stepLabels.map((label, idx) => {
          const StepIcon = stepIcons[idx];
          const stepNum = idx + 1;
          return (
            <button
              key={stepNum}
              type="button"
              onClick={() => { if (stepNum < step) setStep(stepNum); }}
              className={`flex flex-col items-center gap-1 flex-1 transition-all duration-200 ${stepNum <= step ? 'opacity-100' : 'opacity-40'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                stepNum === step
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/30 scale-110'
                  : stepNum < step
                    ? 'bg-red-100 text-red-500'
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {stepNum < step ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <StepIcon className="h-3.5 w-3.5" />
                )}
              </div>
              <span className={`text-[10px] font-medium leading-tight text-center ${stepNum === step ? 'text-red-500' : 'text-gray-400'}`}>
                {t(label.ar, label.en)}
              </span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Category & Sub-category Selection */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-red-500" />
                  {t('اختر الفئة', 'Choose Category')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Main Category Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => {
                          setCategory(cat.value);
                          setSubCategory('');
                        }}
                        className={`relative rounded-xl border-2 p-3 text-center transition-all duration-200 ${
                          category === cat.value
                            ? 'border-red-500 bg-red-50 shadow-md shadow-red-500/10 scale-[1.02]'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        {category === cat.value && (
                          <div className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center mx-auto mb-2`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xs font-medium">
                          {t(cat.labelAr, cat.labelEn)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Sub-category selection */}
                {category && subCategories.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <Separator className="my-3" />
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('اختر الفئة الفرعية', 'Choose Sub-category')}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {subCategories.map((sub) => (
                        <button
                          key={sub.value}
                          type="button"
                          onClick={() => setSubCategory(sub.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                            subCategory === sub.value
                              ? 'bg-red-500 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {t(sub.labelAr, sub.labelEn)}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Selected category indicator */}
                {category && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-100">
                    {selectedCat && (
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedCat.color} flex items-center justify-center`}>
                        <selectedCat.icon className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900">
                        {selectedCat && t(selectedCat.labelAr, selectedCat.labelEn)}
                        {selectedSubCat && <span className="text-gray-400"> → {t(selectedSubCat.labelAr, selectedSubCat.labelEn)}</span>}
                      </p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-red-500 shrink-0" />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-red-500" />
                  {t('تفاصيل الإعلان', 'Listing Details')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="listing-title">
                    {t('العنوان', 'Title')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="listing-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 120))}
                    placeholder={t('أدخل عنوان الإعلان', 'Enter listing title')}
                    maxLength={120}
                    required
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-400">
                      {t('عنوان واضح يجذب المزيد من المهتمين', 'A clear title attracts more interest')}
                    </p>
                    <p className={`text-xs ${title.length > 100 ? 'text-red-500' : 'text-gray-400'}`}>
                      {title.length}/120
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="listing-desc">
                    {t('الوصف', 'Description')}
                  </Label>
                  <Textarea
                    id="listing-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
                    placeholder={t('أضف وصفاً تفصيلياً للإعلان. كلما كان الوصف أوضح، زادت فرص البيع.', 'Add a detailed description. The clearer, the better your chances.')}
                    className="min-h-28 resize-none"
                    maxLength={2000}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-400">
                      {t('يمكنك ذكر المواصفات والمميزات', 'Include specs and highlights')}
                    </p>
                    <p className={`text-xs ${description.length > 1800 ? 'text-red-500' : 'text-gray-400'}`}>
                      {description.length}/2000
                    </p>
                  </div>
                </div>

                {/* Price with currency */}
                <div className="space-y-2">
                  <Label htmlFor="listing-price">
                    {t('السعر', 'Price')} <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="listing-price"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder={t('أدخل السعر', 'Enter price')}
                        dir="ltr"
                        className="text-left"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAR">SAR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Negotiable */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Switch
                    checked={isNegotiable}
                    onCheckedChange={setIsNegotiable}
                    className="data-[state=checked]:bg-red-500"
                  />
                  <div>
                    <Label className="text-sm font-medium cursor-pointer">
                      {t('قابل للتفاوض', 'Negotiable')}
                    </Label>
                    <p className="text-xs text-gray-400">
                      {t('يمكن للمشترين التفاوض على السعر', 'Buyers can negotiate the price')}
                    </p>
                  </div>
                </div>

                {/* Condition selector */}
                {conditionApplicable && (
                  <div className="space-y-2">
                    <Label>{t('الحالة', 'Condition')}</Label>
                    <div className="flex gap-2">
                      {[
                        { value: 'new', labelAr: 'جديد', labelEn: 'New' },
                        { value: 'used', labelAr: 'مستعمل', labelEn: 'Used' },
                        { value: 'refurbished', labelAr: 'مجددد', labelEn: 'Refurbished' },
                      ].map((cond) => (
                        <button
                          key={cond.value}
                          type="button"
                          onClick={() => setCondition(cond.value)}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                            condition === cond.value
                              ? 'bg-red-500 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {t(cond.labelAr, cond.labelEn)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Phone */}
                <div className="space-y-2">
                  <Label htmlFor="listing-phone" className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    {t('رقم الهاتف', 'Contact Phone')}
                  </Label>
                  <Input
                    id="listing-phone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                    className="text-left"
                  />
                </div>

                {/* WhatsApp */}
                <div className="space-y-2">
                  <Label htmlFor="listing-whatsapp" className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-green-500" />
                    {t('رقم واتساب', 'WhatsApp Number')}
                  </Label>
                  <Input
                    id="listing-whatsapp"
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                    className="text-left"
                  />
                </div>

                {/* Location dropdown */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    {t('الموقع', 'Location')}
                  </Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('اختر المدينة', 'Select city')} />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedLocations.map((loc) => (
                        <SelectItem key={loc.value} value={loc.value}>
                          {t(loc.labelAr, loc.labelEn)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags input */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-gray-400" />
                    {t('الوسوم', 'Tags')}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder={t('أضف وسم ثم اضغط Enter', 'Add tag then press Enter')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addTag} className="shrink-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400">
                    {t('أضف حتى 10 وسوم لمساعدة المستخدمين في إيجاد إعلانك', 'Add up to 10 tags to help users find your listing')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Images */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="h-4 w-4 text-red-500" />
                  {t('صور الإعلان', 'Listing Photos')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload zone */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-red-400 hover:bg-red-50/50 transition-all duration-200 cursor-pointer"
                  onClick={addPlaceholderImage}
                >
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                    <ImagePlus className="h-7 w-7 text-red-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {t('اسحب الصور هنا أو اضغط للرفع', 'Drag photos here or click to upload')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('أضف حتى 8 صور (PNG, JPG)', 'Add up to 8 photos (PNG, JPG)')}
                  </p>
                </div>

                {/* Image preview grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className={`aspect-square rounded-lg bg-gradient-to-br ${img} flex items-center justify-center ${
                          index === mainImageIndex ? 'ring-2 ring-red-500 ring-offset-2' : ''
                        }`}>
                          {index === mainImageIndex && (
                            <Badge className="absolute top-1 start-1 bg-red-500 text-white text-[9px] px-1.5 py-0 border-0">
                              {t('رئيسية', 'Main')}
                            </Badge>
                          )}
                          <ImageIcon className="h-6 w-6 text-white/70" />
                        </div>
                        {/* Actions overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                          {index !== mainImageIndex && (
                            <button
                              type="button"
                              onClick={() => setMainImageIndex(index)}
                              className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center"
                              title={t('تعيين كصورة رئيسية', 'Set as main photo')}
                            >
                              <Star className="h-3 w-3 text-amber-500" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center"
                            title={t('حذف', 'Remove')}
                          >
                            <X className="h-3 w-3 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {/* Add more button */}
                    {images.length < 8 && (
                      <button
                        type="button"
                        onClick={addPlaceholderImage}
                        className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-red-400 hover:bg-red-50/50 transition-all duration-200"
                      >
                        <Plus className="h-5 w-5 text-gray-400" />
                      </button>
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-400 text-center">
                  {t(`${images.length}/8 صورة`, `${images.length}/8 photos`)}
                </p>

                {/* Tips for good photos */}
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-800">
                      {t('نصائح لصور أفضل', 'Tips for better photos')}
                    </span>
                  </div>
                  <ul className="space-y-1 text-xs text-amber-700">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle className="h-3 w-3 mt-0.5 shrink-0" />
                      {t('استخدم إضاءة طبيعية جيدة', 'Use good natural lighting')}
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle className="h-3 w-3 mt-0.5 shrink-0" />
                      {t('صوّر من زوايا متعددة', 'Take photos from multiple angles')}
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle className="h-3 w-3 mt-0.5 shrink-0" />
                      {t('أظهر أي عيوب بصدق', 'Honestly show any defects')}
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle className="h-3 w-3 mt-0.5 shrink-0" />
                      {t('الصورة الأولى هي الأهم', 'The first photo is the most important')}
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Scheduling & Availability */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-red-500" />
                  {t('الجدولة والتوفر', 'Scheduling & Availability')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Availability toggle */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Switch
                    checked={isAvailableNow}
                    onCheckedChange={setIsAvailableNow}
                    className="data-[state=checked]:bg-red-500"
                  />
                  <div>
                    <Label className="text-sm font-medium cursor-pointer">
                      {isAvailableNow ? t('متاح الآن', 'Available Now') : t('جدولة', 'Schedule')}
                    </Label>
                    <p className="text-xs text-gray-400">
                      {isAvailableNow
                        ? t('الإعلان متاح فوراً', 'Listing is available immediately')
                        : t('حدد أوقات التوفر', 'Set availability times')}
                    </p>
                  </div>
                </div>

                {/* Working hours */}
                {!isAvailableNow && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                    <Label className="flex items-center gap-1.5">
                      <Timer className="h-3.5 w-3.5 text-gray-400" />
                      {t('ساعات العمل', 'Working Hours')}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={workingHoursFrom}
                        onChange={(e) => setWorkingHoursFrom(e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-400">{t('إلى', 'to')}</span>
                      <Input
                        type="time"
                        value={workingHoursTo}
                        onChange={(e) => setWorkingHoursTo(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Available days */}
                <div className="space-y-2">
                  <Label>{t('الأيام المتاحة', 'Available Days')}</Label>
                  <div className="grid grid-cols-7 gap-1.5">
                    {weekDays.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                          availableDays.includes(day.value)
                            ? 'bg-red-500 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {t(day.labelAr, day.labelEn)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instant booking */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Switch
                    checked={instantBooking}
                    onCheckedChange={setInstantBooking}
                    className="data-[state=checked]:bg-red-500"
                  />
                  <div>
                    <Label className="text-sm font-medium cursor-pointer">
                      {t('حجز فوري', 'Instant Booking')}
                    </Label>
                    <p className="text-xs text-gray-400">
                      {t('السماح بالحجز دون الحاجة للموافقة', 'Allow booking without approval')}
                    </p>
                  </div>
                  <Zap className="h-4 w-4 text-amber-500 ms-auto shrink-0" />
                </div>

                {/* Delivery options */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-gray-400" />
                    {t('خيارات التوصيل', 'Delivery Options')}
                  </Label>
                  <div className="flex gap-2">
                    {[
                      { value: 'pickup' as const, labelAr: 'استلام', labelEn: 'Pickup', icon: Package },
                      { value: 'delivery' as const, labelAr: 'توصيل', labelEn: 'Delivery', icon: Truck },
                      { value: 'both' as const, labelAr: 'كلاهما', labelEn: 'Both', icon: Handshake },
                    ].map((opt) => {
                      const OptIcon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setDeliveryOption(opt.value)}
                          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-medium transition-all duration-200 flex flex-col items-center gap-1.5 ${
                            deliveryOption === opt.value
                              ? 'bg-red-500 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <OptIcon className="h-4 w-4" />
                          {t(opt.labelAr, opt.labelEn)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 5: Review & Publish */}
        {step === 5 && (
          <motion.div initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-red-500" />
                  {t('مراجعة ونشر', 'Review & Publish')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview Card */}
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  {/* Image preview header */}
                  {images.length > 0 ? (
                    <div className={`h-32 bg-gradient-to-br ${images[mainImageIndex]} flex items-center justify-center relative`}>
                      <ImageIcon className="h-10 w-10 text-white/70" />
                      {images.length > 1 && (
                        <Badge className="absolute bottom-2 end-2 bg-black/50 text-white text-[10px]">
                          {images.length} {t('صور', 'photos')}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-gray-400" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Category + Subcategory badge */}
                    <div className="flex items-center gap-2">
                      {selectedCat && (
                        <Badge className="bg-red-50 text-red-600 border-0 text-[10px]">
                          {t(selectedCat.labelAr, selectedCat.labelEn)}
                        </Badge>
                      )}
                      {selectedSubCat && (
                        <Badge variant="outline" className="text-[10px]">
                          {t(selectedSubCat.labelAr, selectedSubCat.labelEn)}
                        </Badge>
                      )}
                      {condition && conditionApplicable && (
                        <Badge variant="outline" className="text-[10px]">
                          {condition === 'new' ? t('جديد', 'New') : condition === 'used' ? t('مستعمل', 'Used') : t('مجددد', 'Refurbished')}
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-gray-900">{title || t('عنوان الإعلان', 'Listing Title')}</h3>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-red-500" dir="ltr">
                        {price ? `${parseFloat(price).toLocaleString()} ${currency}` : '---'}
                      </span>
                      {isNegotiable && (
                        <Badge className="bg-emerald-50 text-emerald-600 border-0 text-[9px]">
                          {t('قابل للتفاوض', 'Negotiable')}
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    {description && (
                      <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
                    )}

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                        ))}
                      </div>
                    )}

                    <Separator />

                    {/* Info row */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      {location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {predefinedLocations.find((l) => l.value === location)
                            ? t(predefinedLocations.find((l) => l.value === location)!.labelAr, predefinedLocations.find((l) => l.value === location)!.labelEn)
                            : location}
                        </span>
                      )}
                      {contactPhone && (
                        <span className="flex items-center gap-1" dir="ltr">
                          <Phone className="h-3 w-3" />
                          {contactPhone}
                        </span>
                      )}
                      {whatsappNumber && (
                        <span className="flex items-center gap-1" dir="ltr">
                          <MessageSquare className="h-3 w-3 text-green-500" />
                          {whatsappNumber}
                        </span>
                      )}
                    </div>

                    {/* Availability info */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {isAvailableNow ? (
                        <Badge className="bg-emerald-50 text-emerald-600 border-0">
                          {t('متاح الآن', 'Available Now')}
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-50 text-blue-600 border-0">
                          {workingHoursFrom} - {workingHoursTo}
                        </Badge>
                      )}
                      {instantBooking && (
                        <Badge className="bg-amber-50 text-amber-600 border-0 flex items-center gap-0.5">
                          <Zap className="h-2.5 w-2.5" />
                          {t('حجز فوري', 'Instant Booking')}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px]">
                        {deliveryOption === 'pickup' ? t('استلام', 'Pickup') : deliveryOption === 'delivery' ? t('توصيل', 'Delivery') : t('كلاهما', 'Both')}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Terms & conditions */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <Checkbox
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(checked === true)}
                    className="mt-0.5 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                  />
                  <Label className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                    {t(
                      'أوافق على شروط الاستخدام وسياسة الخصوصية وأؤكد أن المعلومات المقدمة صحيحة',
                      'I agree to the Terms of Service and Privacy Policy and confirm the information provided is accurate'
                    )}
                  </Label>
                </div>

                {/* Boost tip */}
                <div className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-800">
                      {t('عزّز إعلانك!', 'Boost Your Listing!')}
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 mt-1">
                    {t(
                      'الإعلانات المعززة تحصل على 3 أضعاف المشاهدات. ترقية إعلانك الآن للحصول على نتائج أفضل!',
                      'Boosted listings get 3x more views. Upgrade your listing now for better results!'
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {submitError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {submitError}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setStep(step - 1)}
              disabled={isSubmitting}
            >
              {t('السابق', 'Previous')}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={goBack}
            >
              {t('إلغاء', 'Cancel')}
            </Button>
          )}

          {step < 5 ? (
            <Button
              type="button"
              className="flex-1 bg-red-500 text-white hover:bg-red-600"
              disabled={
                (step === 1 && !category) ||
                (step === 2 && (!title || !price))
              }
              onClick={() => setStep(step + 1)}
            >
              {t('التالي', 'Next')}
            </Button>
          ) : (
            <Button
              type="submit"
              className="flex-1 bg-red-500 text-white hover:bg-red-600"
              disabled={isSubmitting || !agreeTerms}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('جاري النشر...', 'Publishing...')}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {t('نشر الإعلان', 'Publish Listing')}
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

// ── Main HomePage Component ────────────────────────────────────────
export function HomePage() {
  const { language, t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { currentView, navigate, goHome } = useNavigationStore();
  const { getCount: getFavoritesCount } = useFavorites();
  const isArabic = language === 'ar';

  const [emergencyExpanded, setEmergencyExpanded] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  // Listen for custom 'open-login' events from Header
  useEffect(() => {
    const handleOpenLogin = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      void detail;
      setLoginDialogOpen(true);
    };
    window.addEventListener('open-login', handleOpenLogin);
    return () => window.removeEventListener('open-login', handleOpenLogin);
  }, []);

  // Determine active tab from currentView
  const getActiveTab = (): string => {
    if (['home'].includes(currentView)) return 'home';
    if (['market'].includes(currentView)) return 'market';
    if (['services'].includes(currentView)) return 'services';
    if (['directory', 'emergency'].includes(currentView)) return 'directory';
    if (currentView === 'community') return 'community';
    return 'home';
  };

  const activeTab = getActiveTab();
  const favoritesCount = getFavoritesCount();

  // ── Sub-views that overlay the tab content ───────────────────
  const isOverlayView = [
    'listing-detail',
    'search',
    'booking',
    'messages',
    'conversation',
    'inbox',
    'dashboard',
    'create-listing',
    'edit-listing',
    'profile',
    'bookings-list',
    'favorites',
    'settings',
    'write-review',
    'notifications',
    'my-ads',
  ].includes(currentView);

  // ── Render overlay views ─────────────────────────────────────
  const renderOverlayView = () => {
    switch (currentView) {
      case 'listing-detail':
        return <ListingDetail />;
      case 'search':
        return <SearchView />;
      case 'booking':
        return <BookingFlow />;
      case 'messages':
      case 'conversation':
        return <MessagingView />;
      case 'inbox':
        return <ConversationListView />;
      case 'dashboard':
        if (user?.role === 'ADMIN') return <AdminDashboard />;
        return <ProviderDashboard />;
      case 'create-listing':
        return <CreateListingForm />;
      case 'edit-listing':
        return <EditListingForm />;
      case 'profile':
        return <ProfileView />;
      case 'bookings-list':
        return <BookingsListView />;
      case 'favorites':
        return <FavoritesView />;
      case 'settings':
        return <SettingsView />;
      case 'notifications':
        return <NotificationCenter />;
      case 'my-ads':
        if (user?.role === 'ADMIN') return <AdminDashboard />;
        return <ProviderDashboard />;
      default:
        return null;
    }
  };

  // ── Render tab content ───────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            {/* Hero Carousel */}
            <Hero />

            {/* Quick Actions */}
            <QuickActions />

            {/* Categories Showcase */}
            <section className="py-6 sm:py-8">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
                    <ShoppingBag className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      {t('تصفح الفئات', 'Browse Categories')}
                    </h2>
                    <p className="text-xs text-gray-400">
                      {t('اختر الفئة التي تهمك', 'Choose the category that interests you')}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {allCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.value}
                        onClick={() => navigate('market', { category: cat.value })}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-[10px] font-medium text-gray-600 text-center leading-tight line-clamp-1">
                          {t(cat.labelAr, cat.labelEn)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Recently Viewed */}
            <RecentlyViewed />

            {/* Main Market Section */}
            <InteractiveMarketSection
              category={undefined}
              titleAr="أحدث الإعلانات"
              titleEn="Latest Listings"
              icon={ShoppingBag}
              gradientFrom="from-red-500"
              gradientTo="to-red-600"
            />

            {/* Emergency Section - Collapsible */}
            <section className="py-6 sm:py-8">
              <div className="max-w-7xl mx-auto px-4">
                <button
                  onClick={() => setEmergencyExpanded(!emergencyExpanded)}
                  className="flex items-center justify-between w-full mb-4 group"
                >
                  <h2 className="text-lg sm:text-xl font-bold text-red-600 flex items-center gap-2">
                    <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
                      <span className="text-white text-lg">🚨</span>
                    </span>
                    {t('خدمات الطوارئ', 'Emergency Services')}
                  </h2>
                  {emergencyExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  )}
                </button>

                {emergencyExpanded && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <UrgentServices />
                    <EmergencyContacts />
                  </div>
                )}

                {!emergencyExpanded && (
                  <p className="text-sm text-gray-500 ps-12">
                    {t(
                      'اضغط لعرض أرقام الطوارئ وخدمات الإسعاف',
                      'Tap to view emergency numbers and ambulance services'
                    )}
                  </p>
                )}
              </div>
            </section>

            {/* ── NEW SECTIONS ─────────────────────────────────── */}

            {/* Stats Bar */}
            <StatsBar />

            {/* Trending Listings */}
            <TrendingListingsSection />

            {/* Premium / Promote Banner */}
            <PremiumBanner />

            {/* Trust & Safety */}
            <TrustSafetySection />

            {/* Why Choose Us */}
            <WhyChooseUsSection />

            {/* Testimonials Carousel */}
            <TestimonialsCarousel />

            {/* ── END NEW SECTIONS ─────────────────────────────── */}

            {/* Directory Section */}
            <InteractiveDirectorySection />

            {/* Community Preview */}
            <section className="py-8 sm:py-10">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        {t('المجتمع', 'Community')}
                      </h2>
                      <p className="text-xs text-gray-400">
                        {t('آخر أخبار المنطقة', 'Latest community updates')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => navigate('community' as any)}
                  >
                    {t('عرض الكل', 'View All')}
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <Community />
                  </div>
                  <div>
                    <Events />
                  </div>
                </div>
              </div>
            </section>
          </>
        );

      case 'market':
        return (
          <div className="pt-4">
            <InteractiveMarketSection category="real-estate" titleAr="عقارات" titleEn="Real Estate" icon={Building2} gradientFrom="from-amber-500" gradientTo="to-orange-600" />
            <InteractiveMarketSection category="furniture" titleAr="أثاث" titleEn="Furniture" icon={Sofa} gradientFrom="from-rose-500" gradientTo="to-pink-600" />
            <InteractiveMarketSection category="electronics" titleAr="إلكترونيات" titleEn="Electronics" icon={Smartphone} gradientFrom="from-blue-500" gradientTo="to-cyan-600" />
            <InteractiveMarketSection category="cars" titleAr="سيارات" titleEn="Cars" icon={Car} gradientFrom="from-gray-500" gradientTo="to-slate-600" />
          </div>
        );

      case 'services':
        return (
          <div className="pt-4">
            <InteractiveMarketSection category="services" titleAr="خدمات" titleEn="Services" icon={Briefcase} gradientFrom="from-emerald-500" gradientTo="to-teal-600" />
            <InteractiveMarketSection category="jobs" titleAr="وظائف" titleEn="Jobs" icon={HardHat} gradientFrom="from-purple-500" gradientTo="to-violet-600" />
            <InteractiveMarketSection category="medical" titleAr="طبي" titleEn="Medical" icon={Stethoscope} gradientFrom="from-red-500" gradientTo="to-rose-600" />
            <InteractiveMarketSection category="dining" titleAr="مطاعم" titleEn="Dining" icon={UtensilsCrossed} gradientFrom="from-orange-500" gradientTo="to-amber-600" />
            <InteractiveMarketSection category="education" titleAr="تعليم" titleEn="Education" icon={GraduationCap} gradientFrom="from-indigo-500" gradientTo="to-blue-600" />
            <InteractiveMarketSection category="beauty" titleAr="جمال وعناية" titleEn="Beauty & Care" icon={Sparkles} gradientFrom="from-pink-500" gradientTo="to-fuchsia-600" />
          </div>
        );

      case 'directory':
        return (
          <div className="pt-4">
            {currentView === 'emergency' ? (
              <div className="max-w-7xl mx-auto px-4 py-6">
                <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
                    <span className="text-white text-lg">🚨</span>
                  </span>
                  {t('خدمات الطوارئ', 'Emergency Services')}
                </h2>
                <UrgentServices />
                <EmergencyContacts />
              </div>
            ) : (
              <InteractiveDirectorySection />
            )}
          </div>
        );

      case 'community':
        return (
          <div className="pt-4 max-w-7xl mx-auto px-4 py-6">
            <Community />
            <Charity />
            <Events />
            <LocalNews />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Action Buttons ──────────────────── */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-2">
            {/* Search Button */}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-200"
              onClick={() => { if (!isOverlayView) navigate('search'); }}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">{t('بحث', 'Search')}</span>
            </Button>

            {/* Inbox Button - authenticated users */}
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-200"
                onClick={() => { if (!isOverlayView) navigate('inbox'); }}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">{t('الرسائل', 'Messages')}</span>
              </Button>
            )}

            {/* Notification Bell - authenticated users */}
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-200 relative"
                onClick={() => { if (!isOverlayView) navigate('notifications'); }}
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">{t('الإشعارات', 'Notifications')}</span>
              </Button>
            )}

            {/* Dashboard Button - for provider/admin */}
            {isAuthenticated && user && (user.role === 'PROVIDER' || user.role === 'ADMIN') && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-200"
                onClick={() => { if (!isOverlayView) navigate('dashboard'); }}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">{t('لوحة التحكم', 'Dashboard')}</span>
              </Button>
            )}

            {/* My Ads Button - for provider/admin */}
            {isAuthenticated && user && (user.role === 'PROVIDER' || user.role === 'ADMIN') && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-200"
                onClick={() => { if (!isOverlayView) navigate('my-ads'); }}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">{t('إعلاناتي', 'My Ads')}</span>
              </Button>
            )}

            {/* My Bookings Button */}
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-200"
                onClick={() => { if (!isOverlayView) navigate('bookings-list'); }}
              >
                <CalendarCheck className="w-4 h-4" />
                <span className="hidden sm:inline">{t('حجوزاتي', 'My Bookings')}</span>
              </Button>
            )}

            {/* Favorites Button */}
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-200 relative"
                onClick={() => { if (!isOverlayView) navigate('favorites'); }}
              >
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">{t('المفضلة', 'Favorites')}</span>
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -end-1 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {favoritesCount}
                  </span>
                )}
              </Button>
            )}

            {/* Create Listing Button - for ALL authenticated users */}
            {isAuthenticated && (
              <Button
                size="sm"
                className="gap-1.5 bg-red-500 text-white hover:bg-red-600 ms-auto"
                onClick={() => { if (!isOverlayView) navigate('create-listing'); }}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('إضافة إعلان', 'Add Listing')}</span>
              </Button>
            )}

            {/* Login Button - for guests */}
            {!isAuthenticated && (
              <Button
                size="sm"
                className="gap-2 bg-red-500 text-white hover:bg-red-600 ms-auto"
                onClick={() => setLoginDialogOpen(true)}
              >
                {t('تسجيل الدخول', 'Sign In')}
              </Button>
            )}
          </div>

          {/* ── Navigation Tabs ─────────────────────────────────── */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-thin">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const tabId = item.id;

              const labelMap: Record<string, { ar: string; en: string }> = {
                home: { ar: 'الرئيسية', en: 'Home' },
                market: { ar: 'السوق', en: 'Market' },
                services: { ar: 'الخدمات', en: 'Services' },
                directory: { ar: 'الدليل', en: 'Directory' },
                community: { ar: 'المجتمع', en: 'Community' },
              };

              const label = labelMap[tabId];
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isOverlayView) goHome();
                    navigate(item.id as any);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive && !isOverlayView
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(label.ar, label.en)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content Area ─────────────────────────────────────────── */}
      {isOverlayView ? renderOverlayView() : renderTabContent()}

      {/* ── Floating Action Button ──────────────────────────────── */}
      {!isOverlayView && <FloatingActionButton />}

      {/* ── Login Dialog ─────────────────────────────────────────── */}
      <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
    </main>
  );
}
