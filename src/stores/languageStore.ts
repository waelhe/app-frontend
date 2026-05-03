/**
 * LanguageStore — Merged bilingual (Arabic / English) Zustand store.
 *
 * Combines functionality from:
 *   - LanguageContext.tsx  (key-based translations, document dir/lang sync, RTL support)
 *   - use-language.ts      (inline bilingual t(ar, en), Zustand persist middleware)
 *
 * Supports TWO translation patterns:
 *   1. t(key)    — key-based lookup from the translations dictionary
 *   2. tAr(ar, en) — inline bilingual translation
 *
 * Persists language preference via Zustand persist middleware (key: 'nabd-language').
 * setLanguage() updates document.documentElement.lang and dir attributes as a side effect.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ─────────────────────────────────────────────────────────

export type Language = 'ar' | 'en';

export interface LanguageState {
  language: Language;
  isRTL: boolean;
  dir: 'rtl' | 'ltr';
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  tAr: (ar: string, en: string) => string;
}

// ── Translations ──────────────────────────────────────────────────

export const translations: Record<Language, Record<string, string>> = {
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

// ── Store ─────────────────────────────────────────────────────────

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'ar' as Language,
      isRTL: true,
      dir: 'rtl' as const,

      setLanguage: (language: Language) => {
        const isRTL = language === 'ar';
        const dir = isRTL ? 'rtl' as const : 'ltr' as const;
        set({ language, isRTL, dir });

        // Update document attributes as a side effect
        if (typeof document !== 'undefined') {
          document.documentElement.lang = language;
          document.documentElement.dir = dir;
        }

        // Dispatch custom event for any legacy listeners
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('language-change', { detail: { language } }));
        }
      },

      /** Key-based translation lookup (e.g. t('nav.home'), t('hero.title')) */
      t: (key: string): string => {
        const lang = get().language;
        return translations[lang][key] ?? key;
      },

      /** Inline bilingual translation — returns Arabic or English based on current language */
      tAr: (ar: string, en: string): string => {
        const lang = get().language;
        return lang === 'ar' ? ar : en;
      },
    }),
    {
      name: 'nabd-language',
    }
  )
);

// ── Convenience alias ─────────────────────────────────────────────

/** Alias for useLanguageStore — matches the original hook name from use-language.ts */
export const useLanguage = useLanguageStore;
