/**
 * LanguageContext — Bilingual (Arabic / English) context with full translations.
 * Persists language preference to localStorage.
 * Updates document dir and lang attributes for RTL/LTR support.
 */

'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

// ── Types ─────────────────────────────────────────────────────────

export type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
  isRTL: boolean;
}

// ── Translations ──────────────────────────────────────────────────

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.market': 'Market',
    'nav.services': 'Services',
    'nav.directory': 'Directory',
    'nav.emergency': 'Emergency',
    'nav.dashboard': 'Dashboard',
    'nav.messages': 'Messages',
    'nav.profile': 'Profile',
    'nav.search': 'Search',
    'nav.bookings': 'Bookings',
    'nav.createListing': 'Create Listing',
    'nav.signIn': 'Sign In',
    'nav.signOut': 'Sign Out',

    // Hero
    'hero.title': 'Your Local Marketplace',
    'hero.subtitle': 'Discover services, products, and professionals in your area',
    'hero.cta': 'Explore Now',
    'hero.secondaryCta': 'Become a Provider',

    // Categories
    'category.all': 'All',
    'category.homeRepair': 'Home Repair',
    'category.plumbing': 'Plumbing',
    'category.electrical': 'Electrical',
    'category.cleaning': 'Cleaning',
    'category.painting': 'Painting',
    'category.carpentry': 'Carpentry',
    'category.hvac': 'HVAC',
    'category.landscaping': 'Landscaping',
    'category.moving': 'Moving',
    'category.tutoring': 'Tutoring',
    'category.beauty': 'Beauty & Wellness',
    'category.automotive': 'Automotive',
    'category.technology': 'Technology',
    'category.health': 'Health & Medical',
    'category.legal': 'Legal',
    'category.food': 'Food & Catering',
    'category.eventPlanning': 'Event Planning',
    'category.photography': 'Photography',
    'category.fitness': 'Fitness',
    'category.other': 'Other',

    // Listing
    'listing.title': 'Listings',
    'listing.featured': 'Featured',
    'listing.popular': 'Popular',
    'listing.new': 'New',
    'listing.details': 'Listing Details',
    'listing.price': 'Price',
    'listing.provider': 'Provider',
    'listing.category': 'Category',
    'listing.description': 'Description',
    'listing.bookNow': 'Book Now',
    'listing.addToCart': 'Add to Cart',
    'listing.reviews': 'Reviews',
    'listing.noListings': 'No listings found',
    'listing.createTitle': 'Create New Listing',
    'listing.editTitle': 'Edit Listing',
    'listing.status': 'Status',
    'listing.activate': 'Activate',
    'listing.pause': 'Pause',
    'listing.archive': 'Archive',

    // Booking
    'booking.title': 'Bookings',
    'booking.new': 'New Booking',
    'booking.details': 'Booking Details',
    'booking.status': 'Status',
    'booking.confirm': 'Confirm',
    'booking.complete': 'Complete',
    'booking.cancel': 'Cancel',
    'booking.notes': 'Notes',
    'booking.noBookings': 'No bookings found',
    'booking.pending': 'Pending',
    'booking.confirmed': 'Confirmed',
    'booking.completed': 'Completed',
    'booking.cancelled': 'Cancelled',
    'booking.listingId': 'Listing',
    'booking.date': 'Date',
    'booking.price': 'Price',
    'booking.actions': 'Actions',

    // Footer
    'footer.about': 'About',
    'footer.contact': 'Contact',
    'footer.terms': 'Terms of Service',
    'footer.privacy': 'Privacy Policy',
    'footer.help': 'Help Center',
    'footer.copyright': '© 2024 Marketplace. All rights reserved.',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.retry': 'Retry',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.viewAll': 'View All',
    'common.more': 'More',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.submit': 'Submit',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.or': 'or',
    'common.and': 'and',
    'common.noResults': 'No results found',
    'common.showMore': 'Show More',
    'common.showLess': 'Show Less',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.overview': 'Overview',
    'dashboard.myListings': 'My Listings',
    'dashboard.myBookings': 'My Bookings',
    'dashboard.earnings': 'Earnings',
    'dashboard.reviews': 'Reviews',

    // Messages
    'messages.title': 'Messages',
    'messages.new': 'New Message',
    'messages.send': 'Send',
    'messages.typePlaceholder': 'Type a message...',
    'messages.noConversations': 'No conversations',
    'messages.comingSoon': 'Coming Soon',
    'messages.comingSoonDesc': 'Messaging features are being built. Stay tuned!',

    // Payments
    'payment.title': 'Payment',
    'payment.amount': 'Amount',
    'payment.status': 'Status',
    'payment.pay': 'Pay Now',
    'payment.success': 'Payment Successful',
    'payment.failed': 'Payment Failed',

    // Reviews
    'review.title': 'Review',
    'review.write': 'Write a Review',
    'review.rating': 'Rating',
    'review.comment': 'Comment',
    'review.submit': 'Submit Review',
    'review.noReviews': 'No reviews yet',
    'review.averageRating': 'Average Rating',
    'review.outOf': 'out of 5',
    'review.totalReviews': 'review(s)',

    // Emergency
    'emergency.title': 'Emergency Services',
    'emergency.subtitle': 'Quick access to essential emergency contacts',
    'emergency.police': 'Police',
    'emergency.fire': 'Fire Department',
    'emergency.medical': 'Medical Emergency',
    'emergency.call': 'Call',

    // Region
    'region.qudsayaCenter': 'Qudsaya Center',
    'region.qudsayaDahia': 'Qudsaya Dahia',
  },

  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.market': 'السوق',
    'nav.services': 'الخدمات',
    'nav.directory': 'الدليل',
    'nav.emergency': 'الطوارئ',
    'nav.dashboard': 'لوحة التحكم',
    'nav.messages': 'الرسائل',
    'nav.profile': 'الملف الشخصي',
    'nav.search': 'البحث',
    'nav.bookings': 'الحجوزات',
    'nav.createListing': 'إضافة إعلان',
    'nav.signIn': 'تسجيل الدخول',
    'nav.signOut': 'تسجيل الخروج',

    // Hero
    'hero.title': 'سوقك المحلي',
    'hero.subtitle': 'اكتشف الخدمات والمنتجات والمحترفين في منطقتك',
    'hero.cta': 'استكشف الآن',
    'hero.secondaryCta': 'كن مزود خدمة',

    // Categories
    'category.all': 'الكل',
    'category.homeRepair': 'إصلاح المنزل',
    'category.plumbing': 'سباكة',
    'category.electrical': 'كهرباء',
    'category.cleaning': 'تنظيف',
    'category.painting': 'دهان',
    'category.carpentry': 'نجارة',
    'category.hvac': 'تكييف وتدفئة',
    'category.landscaping': 'تنسيق حدائق',
    'category.moving': 'نقل وأثاث',
    'category.tutoring': 'دروس خصوصية',
    'category.beauty': 'جمال وعناية',
    'category.automotive': 'سيارات',
    'category.technology': 'تكنولوجيا',
    'category.health': 'صحة وطبية',
    'category.legal': 'قانونية',
    'category.food': 'طعام وتموين',
    'category.eventPlanning': 'تنظيم فعاليات',
    'category.photography': 'تصوير',
    'category.fitness': 'لياقة بدنية',
    'category.other': 'أخرى',

    // Listing
    'listing.title': 'الإعلانات',
    'listing.featured': 'مميز',
    'listing.popular': 'شائع',
    'listing.new': 'جديد',
    'listing.details': 'تفاصيل الإعلان',
    'listing.price': 'السعر',
    'listing.provider': 'مزود الخدمة',
    'listing.category': 'الفئة',
    'listing.description': 'الوصف',
    'listing.bookNow': 'احجز الآن',
    'listing.addToCart': 'أضف للسلة',
    'listing.reviews': 'التقييمات',
    'listing.noListings': 'لا توجد إعلانات',
    'listing.createTitle': 'إنشاء إعلان جديد',
    'listing.editTitle': 'تعديل الإعلان',
    'listing.status': 'الحالة',
    'listing.activate': 'تفعيل',
    'listing.pause': 'إيقاف مؤقت',
    'listing.archive': 'أرشفة',

    // Booking
    'booking.title': 'الحجوزات',
    'booking.new': 'حجز جديد',
    'booking.details': 'تفاصيل الحجز',
    'booking.status': 'الحالة',
    'booking.confirm': 'تأكيد',
    'booking.complete': 'إتمام',
    'booking.cancel': 'إلغاء',
    'booking.notes': 'ملاحظات',
    'booking.noBookings': 'لا توجد حجوزات',
    'booking.pending': 'قيد الانتظار',
    'booking.confirmed': 'مؤكد',
    'booking.completed': 'مكتمل',
    'booking.cancelled': 'ملغى',
    'booking.listingId': 'الإعلان',
    'booking.date': 'التاريخ',
    'booking.price': 'السعر',
    'booking.actions': 'إجراءات',

    // Footer
    'footer.about': 'عن المنصة',
    'footer.contact': 'اتصل بنا',
    'footer.terms': 'شروط الخدمة',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.help': 'مركز المساعدة',
    'footer.copyright': '© 2024 السوق. جميع الحقوق محفوظة.',

    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.retry': 'إعادة المحاولة',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.close': 'إغلاق',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.sort': 'ترتيب',
    'common.viewAll': 'عرض الكل',
    'common.more': 'المزيد',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.previous': 'السابق',
    'common.submit': 'إرسال',
    'common.confirm': 'تأكيد',
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.or': 'أو',
    'common.and': 'و',
    'common.noResults': 'لا توجد نتائج',
    'common.showMore': 'عرض المزيد',
    'common.showLess': 'عرض أقل',

    // Dashboard
    'dashboard.title': 'لوحة التحكم',
    'dashboard.overview': 'نظرة عامة',
    'dashboard.myListings': 'إعلاناتي',
    'dashboard.myBookings': 'حجوزاتي',
    'dashboard.earnings': 'الأرباح',
    'dashboard.reviews': 'التقييمات',

    // Messages
    'messages.title': 'الرسائل',
    'messages.new': 'رسالة جديدة',
    'messages.send': 'إرسال',
    'messages.typePlaceholder': 'اكتب رسالة...',
    'messages.noConversations': 'لا توجد محادثات',
    'messages.comingSoon': 'قريبًا',
    'messages.comingSoonDesc': 'ميزات المراسلة قيد التطوير. ترقبوا!',

    // Payments
    'payment.title': 'الدفع',
    'payment.amount': 'المبلغ',
    'payment.status': 'الحالة',
    'payment.pay': 'ادفع الآن',
    'payment.success': 'تم الدفع بنجاح',
    'payment.failed': 'فشل الدفع',

    // Reviews
    'review.title': 'التقييم',
    'review.write': 'اكتب تقييمًا',
    'review.rating': 'التقييم',
    'review.comment': 'التعليق',
    'review.submit': 'إرسال التقييم',
    'review.noReviews': 'لا توجد تقييمات بعد',
    'review.averageRating': 'متوسط التقييم',
    'review.outOf': 'من 5',
    'review.totalReviews': 'تقييم',

    // Emergency
    'emergency.title': 'خدمات الطوارئ',
    'emergency.subtitle': 'وصول سريع لجهات الاتصال الأساسية',
    'emergency.police': 'الشرطة',
    'emergency.fire': 'الدفاع المدني',
    'emergency.medical': 'طوارئ طبية',
    'emergency.call': 'اتصل',

    // Region
    'region.qudsayaCenter': 'مركز قدسيا',
    'region.qudsayaDahia': 'ضاحية قدسيا',
  },
};

// ── Context ───────────────────────────────────────────────────────

const LANGUAGE_KEY = 'marketplace_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'ar';
  const stored = localStorage.getItem(LANGUAGE_KEY) as Language | null;
  if (stored && (stored === 'ar' || stored === 'en')) return stored;
  return 'ar';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_KEY, lang);
      // Also update the Zustand language store so both systems stay in sync
      // We use dynamic import to avoid circular dependencies
      import('@/store/use-language').then(({ useLanguage: useZustandLanguage }) => {
        useZustandLanguage.getState().setLanguage(lang);
      }).catch(() => {
        // Zustand store not available
      });
    }
  }, []);

  // Sync from Zustand store to Context via custom event
  useEffect(() => {
    const handleLanguageChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.language && detail.language !== language) {
        setLanguageState(detail.language as Language);
        if (typeof window !== 'undefined') {
          localStorage.setItem(LANGUAGE_KEY, detail.language);
        }
      }
    };
    window.addEventListener('language-change', handleLanguageChange);
    return () => window.removeEventListener('language-change', handleLanguageChange);
  }, [language]);

  // Update document attributes when language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [language]);

  const t = useCallback(
    (key: string): string => {
      return translations[language][key] ?? key;
    },
    [language],
  );

  const dir = language === 'ar' ? 'rtl' as const : 'ltr' as const;
  const isRTL = language === 'ar';

  const value = useMemo(
    () => ({ language, setLanguage, t, dir, isRTL }),
    [language, setLanguage, t, dir, isRTL],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────────

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
