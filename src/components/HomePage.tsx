'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/store/use-auth';
import { useLanguage } from '@/store/use-language';
import { useNavigationStore } from '@/stores/navigationStore';
import { useFavorites } from '@/store/use-favorites';
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

// ── Inline CreateListingForm (enhanced) ───────────────────────────────
function CreateListingForm() {
  const { t, isRTL } = useLanguage();
  const { goBack } = useNavigationStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [step, setStep] = useState(1); // 1: category, 2: details, 3: review

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

  const selectedCat = allCategories.find((c) => c.value === category);

  return (
    <div className="space-y-4 p-4">
      {/* Header with steps indicator */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          {t('إضافة إعلان', 'Create Listing')}
        </h1>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                step >= s ? 'w-6 bg-red-500' : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step labels */}
      <div className="flex justify-between text-xs text-gray-400">
        <span className={step >= 1 ? 'text-red-500 font-medium' : ''}>
          {t('الفئة', 'Category')}
        </span>
        <span className={step >= 2 ? 'text-red-500 font-medium' : ''}>
          {t('التفاصيل', 'Details')}
        </span>
        <span className={step >= 3 ? 'text-red-500 font-medium' : ''}>
          {t('مراجعة', 'Review')}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Category Selection */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('اختر الفئة', 'Choose Category')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
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
            </CardContent>
          </Card>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
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
                  {t('العنوان', 'Title')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="listing-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('أدخل عنوان الإعلان', 'Enter listing title')}
                  maxLength={120}
                  required
                />
                <p className="text-xs text-gray-400 text-end">
                  {title.length}/120
                </p>
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
                  placeholder={t('أضف وصفاً تفصيلياً للإعلان', 'Add a detailed description for your listing')}
                  className="min-h-28 resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-gray-400 text-end">
                  {description.length}/1000
                </p>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="listing-price">
                  {t('السعر', 'Price')} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="listing-price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={t('أدخل السعر', 'Enter price')}
                    dir="ltr"
                    className="text-left pe-12"
                    min="0"
                    step="0.01"
                    required
                  />
                  <span className="absolute top-1/2 -translate-y-1/2 end-3 text-sm text-gray-400 font-medium">
                    {t('ر.س', 'SAR')}
                  </span>
                </div>
              </div>

              {/* Contact Phone */}
              <div className="space-y-2">
                <Label htmlFor="listing-phone">
                  {t('رقم الهاتف', 'Phone Number')}
                </Label>
                <Input
                  id="listing-phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder={t('05XXXXXXXX', '05XXXXXXXX')}
                  dir="ltr"
                  className="text-left"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="listing-location">
                  {t('الموقع', 'Location')}
                </Label>
                <Input
                  id="listing-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('المدينة، الحي', 'City, District')}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('مراجعة الإعلان', 'Review Listing')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category Preview */}
              {selectedCat && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${selectedCat.color} flex items-center justify-center`}>
                    <selectedCat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{t('الفئة', 'Category')}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {t(selectedCat.labelAr, selectedCat.labelEn)}
                    </p>
                  </div>
                </div>
              )}

              {/* Title Preview */}
              <div>
                <p className="text-xs text-gray-400">{t('العنوان', 'Title')}</p>
                <p className="text-sm font-medium text-gray-900">{title}</p>
              </div>

              {/* Description Preview */}
              {description && (
                <div>
                  <p className="text-xs text-gray-400">{t('الوصف', 'Description')}</p>
                  <p className="text-sm text-gray-700">{description}</p>
                </div>
              )}

              {/* Price Preview */}
              <div>
                <p className="text-xs text-gray-400">{t('السعر', 'Price')}</p>
                <p className="text-lg font-bold text-red-500" dir="ltr">
                  {parseFloat(price).toLocaleString()} {t('ر.س', 'SAR')}
                </p>
              </div>

              {/* Contact Preview */}
              {contactPhone && (
                <div>
                  <p className="text-xs text-gray-400">{t('رقم الهاتف', 'Phone')}</p>
                  <p className="text-sm font-medium text-gray-900" dir="ltr">{contactPhone}</p>
                </div>
              )}

              {/* Location Preview */}
              {location && (
                <div>
                  <p className="text-xs text-gray-400">{t('الموقع', 'Location')}</p>
                  <p className="text-sm font-medium text-gray-900">{location}</p>
                </div>
              )}
            </CardContent>
          </Card>
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

          {step < 3 ? (
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
              disabled={isSubmitting}
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
