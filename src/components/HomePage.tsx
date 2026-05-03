'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/store/use-auth';
import { useLanguage } from '@/store/use-language';
import { useNavigationStore } from '@/stores/navigationStore';
import { Hero } from '@/components/ui';
import { InteractiveMarketSection } from '@/components/sections/InteractiveMarketSection';
import { InteractiveDirectorySection } from '@/components/sections/InteractiveDirectorySection';
import { ListingDetail } from '@/components/system/ListingDetail';
import { SearchView } from '@/components/system/SearchView';
import { BookingFlow } from '@/components/system/BookingFlow';
import { MessagingView } from '@/components/system/MessagingView';
import { ProfileView } from '@/components/system/ProfileView';
import { BookingsListView } from '@/components/system/BookingsListView';
import { FavoritesView } from '@/components/system/FavoritesView';
import { SettingsView } from '@/components/system/SettingsView';
import { ProviderDashboard } from '@/components/dashboard/ProviderDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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

// ── Inline CreateListingForm ───────────────────────────────────────
function CreateListingForm() {
  const { t } = useLanguage();
  const { goBack } = useNavigationStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const categories = [
    { value: 'real-estate', labelAr: 'عقارات', labelEn: 'Real Estate' },
    { value: 'electronics', labelAr: 'إلكترونيات', labelEn: 'Electronics' },
    { value: 'cars', labelAr: 'سيارات', labelEn: 'Cars' },
    { value: 'services', labelAr: 'خدمات', labelEn: 'Services' },
    { value: 'jobs', labelAr: 'وظائف', labelEn: 'Jobs' },
    { value: 'furniture', labelAr: 'أثاث', labelEn: 'Furniture' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
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

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          {t('إضافة إعلان', 'Create Listing')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('تفاصيل الإعلان', 'Listing Details')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="listing-title">
                {t('العنوان', 'Title')}
              </Label>
              <Input
                id="listing-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('أدخل عنوان الإعلان', 'Enter listing title')}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="listing-desc">
                {t('الوصف', 'Description')}
              </Label>
              <Textarea
                id="listing-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('أضف وصفاً تفصيلياً', 'Add a detailed description')}
                className="min-h-24 resize-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="listing-category">
                {t('الفئة', 'Category')}
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`rounded-lg border-2 p-2.5 text-center text-xs font-medium transition-colors ${
                      category === cat.value
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {t(cat.labelAr, cat.labelEn)}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="listing-price">
                {t('السعر', 'Price')}
              </Label>
              <div className="relative">
                <Input
                  id="listing-price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={t('أدخل السعر', 'Enter price')}
                  dir="ltr"
                  className="text-left"
                  required
                />
                <span className="absolute top-1/2 -translate-y-1/2 end-3 text-sm text-gray-400">
                  {t('ر.س', 'SAR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {submitError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {submitError}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={goBack}
          >
            {t('إلغاء', 'Cancel')}
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-red-500 text-white hover:bg-red-600"
            disabled={isSubmitting || !title || !category || !price}
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
  const isArabic = language === 'ar';

  const [emergencyExpanded, setEmergencyExpanded] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  // Listen for custom 'open-login' events from Header
  useEffect(() => {
    const handleOpenLogin = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      // Could use detail.mode to set initial tab (login vs register)
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
    // For detail views, infer tab from previous context
    return 'home';
  };

  const activeTab = getActiveTab();

  // ── Sub-views that overlay the tab content ───────────────────
  const isOverlayView = [
    'listing-detail',
    'search',
    'booking',
    'messages',
    'conversation',
    'dashboard',
    'create-listing',
    'profile',
    'bookings-list',
    'favorites',
    'settings',
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
      case 'dashboard':
        if (user?.role === 'ADMIN') return <AdminDashboard />;
        return <ProviderDashboard />;
      case 'create-listing':
        return <CreateListingForm />;
      case 'profile':
        return <ProfileView />;
      case 'bookings-list':
        return <BookingsListView />;
      case 'favorites':
        return <FavoritesView />;
      case 'settings':
        return <SettingsView />;
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
                    onClick={() => {
                      navigate('community' as any);
                    }}
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
            {/* Real Estate */}
            <InteractiveMarketSection
              category="real-estate"
              titleAr="عقارات"
              titleEn="Real Estate"
              icon={Building2}
              gradientFrom="from-amber-500"
              gradientTo="to-orange-600"
            />

            {/* Furniture */}
            <InteractiveMarketSection
              category="furniture"
              titleAr="أثاث"
              titleEn="Furniture"
              icon={Sofa}
              gradientFrom="from-rose-500"
              gradientTo="to-pink-600"
            />

            {/* Electronics */}
            <InteractiveMarketSection
              category="electronics"
              titleAr="إلكترونيات"
              titleEn="Electronics"
              icon={Smartphone}
              gradientFrom="from-blue-500"
              gradientTo="to-cyan-600"
            />

            {/* Cars */}
            <InteractiveMarketSection
              category="cars"
              titleAr="سيارات"
              titleEn="Cars"
              icon={Car}
              gradientFrom="from-gray-500"
              gradientTo="to-slate-600"
            />
          </div>
        );

      case 'services':
        return (
          <div className="pt-4">
            {/* Services */}
            <InteractiveMarketSection
              category="services"
              titleAr="خدمات"
              titleEn="Services"
              icon={Briefcase}
              gradientFrom="from-emerald-500"
              gradientTo="to-teal-600"
            />

            {/* Jobs */}
            <InteractiveMarketSection
              category="jobs"
              titleAr="وظائف"
              titleEn="Jobs"
              icon={HardHat}
              gradientFrom="from-purple-500"
              gradientTo="to-violet-600"
            />
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
      {/* ── Action Buttons (Search + Dashboard) ──────────────────── */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-2">
            {/* Search Button */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-200"
              onClick={() => {
                if (!isOverlayView) {
                  navigate('search');
                }
              }}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">
                {t('بحث', 'Search')}
              </span>
            </Button>

            {/* Dashboard Button - for provider/admin */}
            {isAuthenticated && user && (user.role === 'PROVIDER' || user.role === 'ADMIN') && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-200"
                onClick={() => {
                  if (!isOverlayView) {
                    navigate('dashboard');
                  }
                }}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {t('لوحة التحكم', 'Dashboard')}
                </span>
              </Button>
            )}

            {/* My Bookings Button - for all authenticated users */}
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-200"
                onClick={() => {
                  if (!isOverlayView) {
                    navigate('bookings-list');
                  }
                }}
              >
                <CalendarCheck className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {t('حجوزاتي', 'My Bookings')}
                </span>
              </Button>
            )}

            {/* Create Listing Button - for provider/admin */}
            {isAuthenticated && user && (user.role === 'PROVIDER' || user.role === 'ADMIN') && (
              <Button
                size="sm"
                className="gap-2 bg-red-500 text-white hover:bg-red-600 ms-auto"
                onClick={() => {
                  if (!isOverlayView) {
                    navigate('create-listing');
                  }
                }}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {t('إضافة إعلان', 'Add Listing')}
                </span>
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
                    if (isOverlayView) {
                      goHome();
                    }
                    // Navigate to the tab view
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

      {/* ── Login Dialog ─────────────────────────────────────────── */}
      <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
    </main>
  );
}
