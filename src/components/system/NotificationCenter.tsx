'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CalendarCheck,
  CalendarX,
  MessageSquare,
  Star,
  CheckCircle2,
  Megaphone,
  ArrowRight,
  ArrowLeft,
  CheckCheck,
  Filter,
  Shield,
  TrendingDown,
  Clock,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '@/store/use-language';
import { useNavigationStore } from '@/stores/navigationStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// ── Types ──────────────────────────────────────────────────────────

type NotificationType =
  | 'new_message'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_completed'
  | 'new_review'
  | 'price_drop'
  | 'system_announcement'
  | 'promotion'
  | 'expired_listing';

interface Notification {
  id: string;
  type: NotificationType;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  timeAgoAr: string;
  timeAgoEn: string;
  read: boolean;
  actionView?: string;
  actionParams?: Record<string, string>;
}

type FilterTab = 'all' | 'unread' | 'bookings' | 'messages' | 'system';

// ── Mock Notifications (10 samples) ────────────────────────────────

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'booking_confirmed',
    titleAr: 'تم تأكيد الحجز',
    titleEn: 'Booking Confirmed',
    descriptionAr: 'تم تأكيد حجزك لخدمة سباكة المنزل. سيتواصل معك مزود الخدمة قريباً.',
    descriptionEn: 'Your booking for home plumbing service has been confirmed. The provider will contact you soon.',
    timeAgoAr: 'منذ 5 دقائق',
    timeAgoEn: '5 min ago',
    read: false,
    actionView: 'bookings-list',
  },
  {
    id: '2',
    type: 'new_message',
    titleAr: 'رسالة جديدة من أحمد',
    titleEn: 'New Message from Ahmed',
    descriptionAr: 'لديك رسالة جديدة من أحمد محمد بخصوص إعلان شقة للإيجار.',
    descriptionEn: 'You have a new message from Ahmed Mohammed regarding the apartment for rent listing.',
    timeAgoAr: 'منذ 15 دقيقة',
    timeAgoEn: '15 min ago',
    read: false,
    actionView: 'inbox',
  },
  {
    id: '3',
    type: 'new_review',
    titleAr: 'تقييم جديد ⭐',
    titleEn: 'New Review ⭐',
    descriptionAr: 'قام عميل بتقييم خدمتك بـ 5 نجوم. "خدمة ممتازة وسريعة!"',
    descriptionEn: 'A client rated your service 5 stars. "Excellent and fast service!"',
    timeAgoAr: 'منذ ساعة',
    timeAgoEn: '1 hour ago',
    read: false,
    actionView: 'dashboard',
  },
  {
    id: '4',
    type: 'booking_cancelled',
    titleAr: 'تم إلغاء الحجز',
    titleEn: 'Booking Cancelled',
    descriptionAr: 'تم إلغاء حجز خدمة التنظيف المنزلي من قبل المستهلك.',
    descriptionEn: 'Your home cleaning service booking has been cancelled by the consumer.',
    timeAgoAr: 'منذ ساعتين',
    timeAgoEn: '2 hours ago',
    read: false,
    actionView: 'bookings-list',
  },
  {
    id: '5',
    type: 'price_drop',
    titleAr: 'انخفاض السعر! 📉',
    titleEn: 'Price Drop! 📉',
    descriptionAr: 'انخفض سعر "سيارة تويوتا كامري 2023" التي أضفتها للمفضلة من 95,000 إلى 89,000 ريال.',
    descriptionEn: 'The price of "Toyota Camry 2023" in your favorites dropped from 95,000 to 89,000 SAR.',
    timeAgoAr: 'منذ 3 ساعات',
    timeAgoEn: '3 hours ago',
    read: false,
    actionView: 'favorites',
  },
  {
    id: '6',
    type: 'system_announcement',
    titleAr: 'تحديث جديد في نبض',
    titleEn: 'New Update in Nabd',
    descriptionAr: 'تم إضافة ميزة المفضلات الجديدة! يمكنك الآن حفظ الإعلانات والعودة إليها لاحقاً.',
    descriptionEn: 'New favorites feature added! You can now save listings and access them later.',
    timeAgoAr: 'منذ 5 ساعات',
    timeAgoEn: '5 hours ago',
    read: true,
  },
  {
    id: '7',
    type: 'booking_completed',
    titleAr: 'حجز مكتمل ✅',
    titleEn: 'Booking Completed ✅',
    descriptionAr: 'تم إتمام حجزك لخدمة التنظيف. شاركنا تقييمك!',
    descriptionEn: 'Your cleaning service booking has been completed. Share your review!',
    timeAgoAr: 'منذ يوم',
    timeAgoEn: '1 day ago',
    read: true,
    actionView: 'bookings-list',
  },
  {
    id: '8',
    type: 'promotion',
    titleAr: 'عرض خاص! 🎉',
    titleEn: 'Special Offer! 🎉',
    descriptionAr: 'احصل على خصم 20% على جميع خدمات الصيانة هذا الأسبوع. العرض لفترة محدودة!',
    descriptionEn: 'Get 20% off all maintenance services this week. Limited time offer!',
    timeAgoAr: 'منذ يومين',
    timeAgoEn: '2 days ago',
    read: true,
  },
  {
    id: '9',
    type: 'new_message',
    titleAr: 'رسالة جديدة من سارة',
    titleEn: 'New Message from Sara',
    descriptionAr: 'لديك رسالة جديدة من سارة بخصوص خدمة التدريس.',
    descriptionEn: 'You have a new message from Sara regarding the tutoring service.',
    timeAgoAr: 'منذ 3 أيام',
    timeAgoEn: '3 days ago',
    read: true,
    actionView: 'inbox',
  },
  {
    id: '10',
    type: 'expired_listing',
    titleAr: 'إعلان منتهي الصلاحية',
    titleEn: 'Expired Listing',
    descriptionAr: 'إعلانك "شقة للإيجار في الرياض" لم يعد نشطاً. قم بتجديده الآن للوصول لمزيد من العملاء.',
    descriptionEn: 'Your listing "Apartment for Rent in Riyadh" is no longer active. Renew it now to reach more clients.',
    timeAgoAr: 'منذ أسبوع',
    timeAgoEn: '1 week ago',
    read: true,
    actionView: 'dashboard',
  },
];

// ── Helpers ────────────────────────────────────────────────────────

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'booking_confirmed':
      return CalendarCheck;
    case 'booking_cancelled':
      return CalendarX;
    case 'booking_completed':
      return CheckCircle2;
    case 'new_message':
      return MessageSquare;
    case 'new_review':
      return Star;
    case 'price_drop':
      return TrendingDown;
    case 'system_announcement':
      return Shield;
    case 'promotion':
      return Megaphone;
    case 'expired_listing':
      return Clock;
  }
}

function getNotificationColor(type: NotificationType) {
  switch (type) {
    case 'booking_confirmed':
      return 'bg-emerald-100 text-emerald-600';
    case 'booking_cancelled':
      return 'bg-red-100 text-red-600';
    case 'booking_completed':
      return 'bg-blue-100 text-blue-600';
    case 'new_message':
      return 'bg-sky-100 text-sky-600';
    case 'new_review':
      return 'bg-amber-100 text-amber-600';
    case 'price_drop':
      return 'bg-green-100 text-green-600';
    case 'system_announcement':
      return 'bg-purple-100 text-purple-600';
    case 'promotion':
      return 'bg-orange-100 text-orange-600';
    case 'expired_listing':
      return 'bg-gray-100 text-gray-600';
  }
}

function getNotificationBorder(type: NotificationType) {
  switch (type) {
    case 'booking_confirmed':
      return 'border-s-emerald-400';
    case 'booking_cancelled':
      return 'border-s-red-400';
    case 'booking_completed':
      return 'border-s-blue-400';
    case 'new_message':
      return 'border-s-sky-400';
    case 'new_review':
      return 'border-s-amber-400';
    case 'price_drop':
      return 'border-s-green-400';
    case 'system_announcement':
      return 'border-s-purple-400';
    case 'promotion':
      return 'border-s-orange-400';
    case 'expired_listing':
      return 'border-s-gray-400';
  }
}

function filterTabToTypes(tab: FilterTab): NotificationType[] | null {
  switch (tab) {
    case 'bookings':
      return ['booking_confirmed', 'booking_cancelled', 'booking_completed', 'expired_listing'];
    case 'messages':
      return ['new_message'];
    case 'system':
      return ['system_announcement', 'promotion', 'price_drop'];
    default:
      return null;
  }
}

// ── Animation variants ─────────────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const bellSwing = {
  animate: {
    rotate: [0, 15, -10, 5, 0],
    transition: { duration: 1.5, repeat: Infinity, repeatDelay: 3 },
  },
};

// ── Component ──────────────────────────────────────────────────────

export function NotificationCenter() {
  const { t, isRTL } = useLanguage();
  const { goBack, navigate } = useNavigationStore();
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [isLoading] = useState(false); // For future API integration

  const filterTabs: { id: FilterTab; labelAr: string; labelEn: string }[] = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All' },
    { id: 'unread', labelAr: 'غير مقروء', labelEn: 'Unread' },
    { id: 'bookings', labelAr: 'الحجوزات', labelEn: 'Bookings' },
    { id: 'messages', labelAr: 'الرسائل', labelEn: 'Messages' },
    { id: 'system', labelAr: 'النظام', labelEn: 'System' },
  ];

  const filteredNotifications = useMemo(() => {
    let result = notifications;

    if (activeFilter === 'unread') {
      result = result.filter((n) => !n.read);
    } else {
      const types = filterTabToTypes(activeFilter);
      if (types) {
        result = result.filter((n) => types.includes(n.type));
      }
    }

    return result;
  }, [notifications, activeFilter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.actionView) {
      navigate(notification.actionView as any, notification.actionParams);
    }
  };

  // ── Loading state ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-4 space-y-4 pb-24">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-full" />
          ))}
        </div>
        <Separator />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
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
          <motion.div {...bellSwing}>
            <Bell className="h-5 w-5 text-red-500" />
          </motion.div>
          <h1 className="text-xl font-bold text-gray-900">
            {t('الإشعارات', 'Notifications')}
          </h1>
        </div>
        {unreadCount > 0 && (
          <Badge className="bg-red-500 text-white ms-auto animate-pulse">
            {unreadCount}
          </Badge>
        )}

        {/* Mark All as Read + Clear buttons */}
        {notifications.length > 0 && (
          <div className="flex items-center gap-1 ms-auto">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1 h-7 text-[10px] px-2"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="h-3 w-3" />
                {t('تعيين الكل كمقروء', 'Mark all read')}
              </Button>
            )}
          </div>
        )}
      </motion.div>

      {/* ── Filter Tabs ─────────────────────────────────────────── */}
      <motion.div {...fadeInUp}>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <Filter className="h-4 w-4 text-gray-400 shrink-0" />
          {filterTabs.map((tab) => {
            const count = tab.id === 'unread'
              ? unreadCount
              : tab.id === 'all'
                ? notifications.length
                : (() => {
                    const types = filterTabToTypes(tab.id);
                    return types ? notifications.filter((n) => types.includes(n.type)).length : 0;
                  })();

            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  activeFilter === tab.id
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t(tab.labelAr, tab.labelEn)}
                {count > 0 && (
                  <span className={`ms-1 inline-flex items-center justify-center min-w-[16px] h-4 rounded-full text-[10px] ${
                    activeFilter === tab.id ? 'bg-white/20' : 'text-gray-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      <Separator />

      {/* ── Notifications List ──────────────────────────────────── */}
      {filteredNotifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center gap-5 py-20 text-center"
        >
          <motion.div {...bellSwing}>
            <div className="rounded-full bg-gray-100 p-8">
              <Bell className="h-16 w-16 text-gray-300" />
            </div>
          </motion.div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900">
              {t('لا توجد إشعارات', 'No notifications')}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              {t(
                'ستظهر الإشعارات هنا عند وجود تحديثات جديدة',
                'Notifications will appear here when there are new updates'
              )}
            </p>
          </div>
        </motion.div>
      ) : (
        <>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notification, index) => {
                const Icon = getNotificationIcon(notification.type);
                const colorClass = getNotificationColor(notification.type);
                const borderClass = getNotificationBorder(notification.type);

                return (
                  <motion.div
                    key={notification.id}
                    variants={fadeInUp}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: isRTL ? 100 : -100, scale: 0.9 }}
                    transition={{ delay: index * 0.04 }}
                    layout
                  >
                    <Card
                      className={`overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md ${
                        !notification.read
                          ? 'bg-white border-s-4 ' + borderClass
                          : 'bg-gray-50/50 border-s-0'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                            <Icon className="h-5 w-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`text-sm ${!notification.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                {t(notification.titleAr, notification.titleEn)}
                              </h4>
                              {!notification.read && (
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-1 animate-pulse" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                              {t(notification.descriptionAr, notification.descriptionEn)}
                            </p>
                            <div className="flex items-center justify-between mt-2.5">
                              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {t(notification.timeAgoAr, notification.timeAgoEn)}
                              </span>
                              <div className="flex items-center gap-1">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50 px-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(notification.id);
                                    }}
                                  >
                                    {t('تعيين كمقروء', 'Mark as read')}
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-[10px] text-gray-400 hover:text-red-500 hover:bg-red-50 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(notification.id);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* ── Clear All ────────────────────────────────────────── */}
          {notifications.length > 0 && (
            <div className="pt-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-gray-500 hover:text-red-500 hover:border-red-200"
                  >
                    <Trash2 className="h-4 w-4 me-2" />
                    {t('مسح جميع الإشعارات', 'Clear All Notifications')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('مسح جميع الإشعارات؟', 'Clear all notifications?')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t(
                        'سيتم حذف جميع الإشعارات بشكل دائم.',
                        'All notifications will be permanently deleted.'
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('إلغاء', 'Cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 text-white hover:bg-red-600"
                      onClick={handleClearAll}
                    >
                      {t('مسح', 'Clear')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </>
      )}
    </div>
  );
}
