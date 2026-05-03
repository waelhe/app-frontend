'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CalendarCheck,
  MessageSquare,
  Star,
  CheckCircle2,
  Megaphone,
  ArrowRight,
  ArrowLeft,
  CheckCheck,
  Filter,
} from 'lucide-react';
import { useLanguage } from '@/store/use-language';
import { useNavigationStore } from '@/stores/navigationStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// ── Types ──────────────────────────────────────────────────────────

type NotificationType = 'booking_confirmed' | 'new_message' | 'review_received' | 'listing_approved' | 'system_announcement';

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

// ── Mock Notifications ─────────────────────────────────────────────

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
    titleAr: 'رسالة جديدة',
    titleEn: 'New Message',
    descriptionAr: 'لديك رسالة جديدة من أحمد محمد بخصوص إعلان شقة للإيجار.',
    descriptionEn: 'You have a new message from Ahmed Mohammed regarding the apartment for rent listing.',
    timeAgoAr: 'منذ 15 دقيقة',
    timeAgoEn: '15 min ago',
    read: false,
    actionView: 'inbox',
  },
  {
    id: '3',
    type: 'review_received',
    titleAr: 'تقييم جديد',
    titleEn: 'New Review',
    descriptionAr: 'قام عميل بتقييم خدمتك بـ 5 نجوم. "خدمة ممتازة وسريعة!"',
    descriptionEn: 'A client rated your service 5 stars. "Excellent and fast service!"',
    timeAgoAr: 'منذ ساعة',
    timeAgoEn: '1 hour ago',
    read: false,
    actionView: 'dashboard',
  },
  {
    id: '4',
    type: 'listing_approved',
    titleAr: 'تمت الموافقة على الإعلان',
    titleEn: 'Listing Approved',
    descriptionAr: 'تمت الموافقة على إعلانك "سيارة تويوتا 2023" وهو الآن منشور ومتاح للجميع.',
    descriptionEn: 'Your listing "Toyota 2023" has been approved and is now published and visible to everyone.',
    timeAgoAr: 'منذ 3 ساعات',
    timeAgoEn: '3 hours ago',
    read: true,
    actionView: 'dashboard',
  },
  {
    id: '5',
    type: 'system_announcement',
    titleAr: 'تحديث جديد في نبض',
    titleEn: 'New Update in Nabd',
    descriptionAr: 'تم إضافة ميزة المفضلات الجديدة! يمكنك الآن حفظ الإعلانات والعودة إليها لاحقاً.',
    descriptionEn: 'New favorites feature added! You can now save listings and access them later.',
    timeAgoAr: 'منذ يوم',
    timeAgoEn: '1 day ago',
    read: true,
  },
  {
    id: '6',
    type: 'booking_confirmed',
    titleAr: 'حجز مكتمل',
    titleEn: 'Booking Completed',
    descriptionAr: 'تم إتمام حجزك لخدمة التنظيف. شاركنا تقييمك!',
    descriptionEn: 'Your cleaning service booking has been completed. Share your review!',
    timeAgoAr: 'منذ يومين',
    timeAgoEn: '2 days ago',
    read: true,
    actionView: 'bookings-list',
  },
  {
    id: '7',
    type: 'new_message',
    titleAr: 'رسالة جديدة',
    titleEn: 'New Message',
    descriptionAr: 'لديك رسالة جديدة من سارة بخصوص خدمة التدريس.',
    descriptionEn: 'You have a new message from Sara regarding the tutoring service.',
    timeAgoAr: 'منذ 3 أيام',
    timeAgoEn: '3 days ago',
    read: true,
    actionView: 'inbox',
  },
  {
    id: '8',
    type: 'system_announcement',
    titleAr: 'صيانة مجدولة',
    titleEn: 'Scheduled Maintenance',
    descriptionAr: 'ستخضع المنصة لصيانة مجدولة يوم الجمعة من الساعة 2-4 صباحاً.',
    descriptionEn: 'The platform will undergo scheduled maintenance on Friday from 2-4 AM.',
    timeAgoAr: 'منذ أسبوع',
    timeAgoEn: '1 week ago',
    read: true,
  },
];

// ── Helpers ────────────────────────────────────────────────────────

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'booking_confirmed':
      return CalendarCheck;
    case 'new_message':
      return MessageSquare;
    case 'review_received':
      return Star;
    case 'listing_approved':
      return CheckCircle2;
    case 'system_announcement':
      return Megaphone;
  }
}

function getNotificationColor(type: NotificationType) {
  switch (type) {
    case 'booking_confirmed':
      return 'bg-emerald-100 text-emerald-600';
    case 'new_message':
      return 'bg-blue-100 text-blue-600';
    case 'review_received':
      return 'bg-amber-100 text-amber-600';
    case 'listing_approved':
      return 'bg-green-100 text-green-600';
    case 'system_announcement':
      return 'bg-purple-100 text-purple-600';
  }
}

function getNotificationBg(type: NotificationType) {
  switch (type) {
    case 'booking_confirmed':
      return 'border-s-emerald-400';
    case 'new_message':
      return 'border-s-blue-400';
    case 'review_received':
      return 'border-s-amber-400';
    case 'listing_approved':
      return 'border-s-green-400';
    case 'system_announcement':
      return 'border-s-purple-400';
  }
}

function filterTabToTypes(tab: FilterTab): NotificationType[] | null {
  switch (tab) {
    case 'bookings':
      return ['booking_confirmed', 'listing_approved'];
    case 'messages':
      return ['new_message'];
    case 'system':
      return ['system_announcement', 'review_received'];
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

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

// ── Component ──────────────────────────────────────────────────────

export function NotificationCenter() {
  const { t, isRTL } = useLanguage();
  const { goBack, navigate } = useNavigationStore();
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

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

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.actionView) {
      navigate(notification.actionView as any, notification.actionParams);
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <motion.div {...fadeInUp} className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack} className="h-8 w-8 shrink-0">
          <BackArrow className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-red-500" />
          <h1 className="text-xl font-bold text-gray-900">
            {t('الإشعارات', 'Notifications')}
          </h1>
        </div>
        {unreadCount > 0 && (
          <Badge className="bg-red-500 text-white ms-auto">
            {unreadCount}
          </Badge>
        )}
      </motion.div>

      {/* Mark All as Read */}
      {unreadCount > 0 && (
        <motion.div {...fadeInUp} className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1.5"
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck className="h-4 w-4" />
            {t('تعيين الكل كمقروء', 'Mark all as read')}
          </Button>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <motion.div {...fadeInUp}>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <Filter className="h-4 w-4 text-gray-400 shrink-0" />
          {filterTabs.map((tab) => (
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
              {tab.id === 'unread' && unreadCount > 0 && (
                <span className="ms-1 inline-flex items-center justify-center min-w-[16px] h-4 rounded-full bg-white/20 text-[10px]">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      <Separator />

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center gap-4 py-16 text-center"
        >
          <div className="rounded-full bg-gray-100 p-6">
            <Bell className="h-12 w-12 text-gray-300" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-gray-900">
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
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((notification, index) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);
              const borderClass = getNotificationBg(notification.type);

              return (
                <motion.div
                  key={notification.id}
                  variants={fadeInUp}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: isRTL ? 100 : -100 }}
                  transition={{ delay: index * 0.04 }}
                  layout
                >
                  <Card
                    className={`overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md ${
                      !notification.read ? 'bg-white border-s-4 ' + borderClass : 'bg-gray-50/50 border-s-0'
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
                            <h4 className={`text-sm font-semibold text-gray-900 ${!notification.read ? '' : 'font-medium'}`}>
                              {t(notification.titleAr, notification.titleEn)}
                            </h4>
                            {!notification.read && (
                              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            {t(notification.descriptionAr, notification.descriptionEn)}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-gray-400">
                              {t(notification.timeAgoAr, notification.timeAgoEn)}
                            </span>
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
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
