'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  AlertCircle,
  Clock,
  Search,
  Plus,
  Inbox,
  Archive,
  Filter,
  PenSquare,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigationStore } from '@/stores/navigationStore';
import { bookingService, messagingService } from '@/lib/api';
import type {
  BookingSummary,
  ConversationResponse,
  MessageResponse,
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// ── Types ──────────────────────────────────────────────────────────

interface ConversationSummary {
  conversation: ConversationResponse;
  booking: BookingSummary;
  lastMessage: MessageResponse | null;
  unreadCount: number;
}

type FilterTab = 'all' | 'unread' | 'archived';

// ── Category Gradients ─────────────────────────────────────────────

const categoryGradients: Record<string, string> = {
  'real-estate': 'from-amber-500 to-orange-600',
  'electronics': 'from-blue-500 to-cyan-600',
  'cars': 'from-red-500 to-rose-600',
  'services': 'from-emerald-500 to-green-600',
  'jobs': 'from-violet-500 to-purple-600',
  'furniture': 'from-yellow-500 to-amber-600',
  'medical': 'from-teal-500 to-cyan-600',
  'dining': 'from-orange-500 to-red-600',
  'education': 'from-indigo-500 to-blue-600',
  'beauty': 'from-pink-500 to-rose-600',
};

const categoryLabelsAr: Record<string, string> = {
  'real-estate': 'عقارات',
  'electronics': 'إلكترونيات',
  'cars': 'سيارات',
  'services': 'خدمات',
  'jobs': 'وظائف',
  'furniture': 'أثاث',
  'medical': 'طبية',
  'dining': 'مطاعم',
  'education': 'تعليم',
  'beauty': 'جمال',
};

const categoryLabelsEn: Record<string, string> = {
  'real-estate': 'Real Estate',
  'electronics': 'Electronics',
  'cars': 'Cars',
  'services': 'Services',
  'jobs': 'Jobs',
  'furniture': 'Furniture',
  'medical': 'Medical',
  'dining': 'Dining',
  'education': 'Education',
  'beauty': 'Beauty',
};

// ── Mock conversations for when API returns empty ──────────────────

const mockConversations: ConversationSummary[] = [
  {
    conversation: { id: 'mock-1', bookingId: 'book-1', createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: new Date(Date.now() - 300000).toISOString() },
    booking: { id: 'book-1', consumerId: 'c1', providerId: 'p1', listingId: 'listing-1', status: 'CONFIRMED', priceCents: 50000, currency: 'SAR', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 300000).toISOString() },
    lastMessage: { id: 'msg-1', conversationId: 'mock-1', content: 'مرحباً، هل هذه الخدمة متاحة هذا الأسبوع؟', read: false, createdAt: new Date(Date.now() - 300000).toISOString(), updatedAt: new Date(Date.now() - 300000).toISOString() },
    unreadCount: 3,
  },
  {
    conversation: { id: 'mock-2', bookingId: 'book-2', createdAt: new Date(Date.now() - 7200000).toISOString(), updatedAt: new Date(Date.now() - 7200000).toISOString() },
    booking: { id: 'book-2', consumerId: 'c2', providerId: 'p2', listingId: 'listing-2', status: 'PENDING', priceCents: 150000, currency: 'SAR', createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date(Date.now() - 7200000).toISOString() },
    lastMessage: { id: 'msg-2', conversationId: 'mock-2', content: 'تم تأكيد الحجز، سنتواصل معك قريباً', read: true, createdAt: new Date(Date.now() - 7200000).toISOString(), updatedAt: new Date(Date.now() - 7200000).toISOString() },
    unreadCount: 0,
  },
  {
    conversation: { id: 'mock-3', bookingId: 'book-3', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
    booking: { id: 'book-3', consumerId: 'c3', providerId: 'p3', listingId: 'listing-3', status: 'COMPLETED', priceCents: 75000, currency: 'SAR', createdAt: new Date(Date.now() - 259200000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
    lastMessage: { id: 'msg-3', conversationId: 'mock-3', content: 'شكراً لك! الخدمة كانت ممتازة', read: true, createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
    unreadCount: 1,
  },
  {
    conversation: { id: 'mock-4', bookingId: 'book-4', createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date(Date.now() - 172800000).toISOString() },
    booking: { id: 'book-4', consumerId: 'c4', providerId: 'p4', listingId: 'listing-4', status: 'CONFIRMED', priceCents: 200000, currency: 'SAR', createdAt: new Date(Date.now() - 345600000).toISOString(), updatedAt: new Date(Date.now() - 172800000).toISOString() },
    lastMessage: null,
    unreadCount: 0,
  },
];

const mockNamesAr = ['أحمد العلي', 'سارة المحمد', 'خالد الراشد', 'فاطمة السعيد'];
const mockNamesEn = ['Ahmad Ali', 'Sara Mohammed', 'Khalid Rashid', 'Fatima Saeed'];
const mockOnlineStatus = [true, false, true, false];
const mockCategories = ['services', 'real-estate', 'cars', 'electronics'];

// ── Helpers ────────────────────────────────────────────────────────

function formatRelativeTime(iso: string, isRTL: boolean): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return isRTL ? 'الآن' : 'Just now';
    if (diffMin < 60) return isRTL ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`;
    if (diffHour < 24) return isRTL ? `منذ ${diffHour} ساعة` : `${diffHour}h ago`;
    if (diffDay < 7) return isRTL ? `منذ ${diffDay} يوم` : `${diffDay}d ago`;
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

// ── Custom hook: Fetch conversation summaries ──────────────────────

async function fetchConversationSummaries(
  userId: string,
  isProvider: boolean
): Promise<ConversationSummary[]> {
  const bookingsData = isProvider
    ? await bookingService.providerBookings(userId, 0, 50)
    : await bookingService.consumerBookings(userId, 0, 50);

  const bookings: BookingSummary[] = bookingsData.content ?? [];
  if (bookings.length === 0) return [];

  const results: ConversationSummary[] = [];
  const BATCH_SIZE = 5;

  for (let i = 0; i < bookings.length; i += BATCH_SIZE) {
    const batch = bookings.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(async (booking): Promise<ConversationSummary | null> => {
        try {
          const conversation = await messagingService.createConversation({ bookingId: booking.id });
          const [messagesData, unreadData] = await Promise.allSettled([
            messagingService.messages(conversation.id, 0, 1),
            messagingService.unreadCount(conversation.id),
          ]);
          const lastMessage: MessageResponse | null =
            messagesData.status === 'fulfilled' ? (messagesData.value.content?.[0] ?? null) : null;
          const unreadCount: number =
            unreadData.status === 'fulfilled' ? unreadData.value.unreadCount : 0;
          return { conversation, booking, lastMessage, unreadCount };
        } catch {
          return null;
        }
      })
    );

    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value);
      }
    }
  }

  results.sort((a, b) => {
    const timeA = new Date(a.conversation.updatedAt || a.booking.updatedAt).getTime();
    const timeB = new Date(b.conversation.updatedAt || b.booking.updatedAt).getTime();
    return timeB - timeA;
  });

  return results;
}

function useConversationSummaries() {
  const { user, role, isAuthenticated } = useAuth();
  const isProvider = role === 'PROVIDER' || role === 'ADMIN';
  const {
    data: summaries = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['conversation-summaries', user?.id, role],
    queryFn: () => {
      if (!user?.id) throw new Error('Not authenticated');
      return fetchConversationSummaries(user.id, isProvider);
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 30_000,
  });

  return { summaries, isLoading, error: error ? (error as Error).message : null, refetch };
}

// ── Skeleton Loader ────────────────────────────────────────────────

function ConversationListSkeleton() {
  return (
    <div className="space-y-2 px-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ── Animated Empty State ───────────────────────────────────────────

function AnimatedEmptyState({ isRTL, onStartConversation }: { isRTL: boolean; onStartConversation: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-6 py-20 px-8 text-center"
    >
      {/* Animated bubbles */}
      <div className="relative h-28 w-28">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-red-100"
            style={{
              width: 40 - i * 8,
              height: 40 - i * 8,
              top: 10 + i * 16,
              left: 10 + i * 20,
            }}
            animate={{
              y: [0, -8, 0],
              scale: [1, 1.1, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              delay: i * 0.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="flex items-center justify-center h-full">
              <MessageSquare className="text-red-400" style={{ width: 16 - i * 3, height: 16 - i * 3 }} />
            </div>
          </motion.div>
        ))}
        {/* Main bubble */}
        <motion.div
          className="absolute bottom-0 right-0 h-14 w-14 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Inbox className="h-6 w-6 text-white" />
        </motion.div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-gray-900">
          {isRTL ? 'لا توجد محادثات' : 'No conversations'}
        </h3>
        <p className="text-sm text-gray-500 max-w-xs">
          {isRTL
            ? 'ابدأ محادثة جديدة مع مزودي الخدمة للتواصل حول الخدمات والحجوزات'
            : 'Start a new conversation with service providers to communicate about services and bookings'}
        </p>
      </div>

      <Button
        className="bg-red-500 text-white hover:bg-red-600 gap-2 rounded-full px-6"
        onClick={onStartConversation}
      >
        <PenSquare className="h-4 w-4" />
        {isRTL ? 'ابدأ محادثة جديدة' : 'Start a new conversation'}
      </Button>
    </motion.div>
  );
}

// ── Conversation Item ──────────────────────────────────────────────

function ConversationItem({
  summary,
  index,
  isRTL,
  isMock,
  mockIndex,
  onClick,
}: {
  summary: ConversationSummary;
  index: number;
  isRTL: boolean;
  isMock: boolean;
  mockIndex: number;
  onClick: () => void;
}) {
  const { conversation, booking, lastMessage, unreadCount } = summary;
  const activityTime = conversation.updatedAt || booking.updatedAt;
  const hasUnread = unreadCount > 0;

  // For mock data, use the mock arrays
  const recipientName = isMock
    ? (isRTL ? mockNamesAr[mockIndex] : mockNamesEn[mockIndex])
    : (isRTL ? 'حجز' : 'Booking') + ' #' + booking.id.slice(0, 8);
  const isOnline = isMock ? mockOnlineStatus[mockIndex] : false;
  const category = isMock ? mockCategories[mockIndex] : 'services';
  const gradient = categoryGradients[category] || 'from-gray-400 to-gray-500';
  const categoryLabel = isRTL ? (categoryLabelsAr[category] || category) : (categoryLabelsEn[category] || category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: isRTL ? 100 : -100, opacity: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      <Card
        className="cursor-pointer overflow-hidden transition-all hover:shadow-md active:scale-[0.98]"
        onClick={onClick}
      >
        <CardContent className="p-0">
          <div className="flex items-center gap-3 p-3">
            {/* Avatar with online indicator */}
            <div className="relative shrink-0">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white text-sm font-bold`}>
                  {recipientName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Top row: Name + Time + Unread badge */}
              <div className="flex items-center gap-2">
                <p className={`text-sm truncate flex-1 ${hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                  {recipientName}
                </p>
                <span className="shrink-0 text-[11px] text-gray-400 flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(activityTime, isRTL)}
                </span>
                {hasUnread && (
                  <Badge className="h-5 min-w-[20px] shrink-0 justify-center bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </div>

              {/* Middle row: Last message preview */}
              {lastMessage ? (
                <p className={`mt-0.5 text-xs leading-relaxed truncate ${hasUnread ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                  {truncateText(lastMessage.content, 60)}
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-gray-300 italic truncate">
                  {isRTL ? 'لا توجد رسائل بعد' : 'No messages yet'}
                </p>
              )}

              {/* Bottom row: Booking status badge */}
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`inline-block rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                  booking.status === 'PENDING' ? 'bg-amber-50 text-amber-600'
                    : booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600'
                      : booking.status === 'COMPLETED' ? 'bg-sky-50 text-sky-600'
                        : booking.status === 'CANCELLED' ? 'bg-red-50 text-red-600'
                          : 'bg-gray-50 text-gray-500'
                }`}>
                  {booking.status === 'PENDING' ? (isRTL ? 'قيد الانتظار' : 'Pending')
                    : booking.status === 'CONFIRMED' ? (isRTL ? 'مؤكد' : 'Confirmed')
                      : booking.status === 'COMPLETED' ? (isRTL ? 'مكتمل' : 'Completed')
                        : booking.status === 'CANCELLED' ? (isRTL ? 'ملغى' : 'Cancelled')
                          : booking.status}
                </span>
                <span className="text-[9px] text-gray-300">·</span>
                <span className="text-[9px] text-gray-400">{categoryLabel}</span>
              </div>
            </div>

            {/* Listing thumbnail */}
            <div className={`shrink-0 h-12 w-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
              <span className="text-white text-lg font-bold">
                {categoryLabel.charAt(0)}
              </span>
            </div>
          </div>

          {/* Swipe to archive visual indicator */}
          <div className={`h-0.5 bg-gradient-to-l from-red-500/0 ${hasUnread ? 'via-red-500/30' : 'via-gray-200/50'} to-transparent`} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────

export function ConversationListView() {
  const { t, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { navigate, goBack } = useNavigationStore();
  const { summaries, isLoading, error, refetch } = useConversationSummaries();

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  // Use mock data if API returns empty results
  const displaySummaries = summaries.length > 0 ? summaries : mockConversations;
  const isUsingMock = summaries.length === 0 && !isLoading && !error;

  // Total unread count
  const totalUnread = useMemo(() => {
    return displaySummaries.reduce((sum, s) => sum + s.unreadCount, 0);
  }, [displaySummaries]);

  // Filtered conversations
  const filteredSummaries = useMemo(() => {
    let filtered = displaySummaries;

    // Apply filter tab
    if (activeFilter === 'unread') {
      filtered = filtered.filter((s) => s.unreadCount > 0);
    } else if (activeFilter === 'archived') {
      filtered = []; // No archived conversations in mock
    }

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((s) => {
        const name = isRTL ? mockNamesAr[displaySummaries.indexOf(s)] : mockNamesEn[displaySummaries.indexOf(s)];
        const msgContent = s.lastMessage?.content?.toLowerCase() || '';
        const bookingId = s.booking.id.toLowerCase();
        return (name && name.toLowerCase().includes(q)) || msgContent.includes(q) || bookingId.includes(q);
      });
    }

    return filtered;
  }, [displaySummaries, activeFilter, searchQuery, isRTL]);

  // ── Handle conversation click ──────────────────────────────────
  const handleConversationClick = useCallback(
    (conversationId: string) => {
      navigate('conversation', { conversationId });
    },
    [navigate]
  );

  // ── Auth required state ────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center"
      >
        <div className="rounded-full bg-red-50 p-6">
          <MessageSquare className="h-12 w-12 text-red-300" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          {isRTL ? 'الرسائل' : 'Messages'}
        </h2>
        <p className="text-sm text-gray-500 max-w-xs">
          {isRTL
            ? 'سجّل دخولك لعرض محادثاتك والتواصل مع مزودي الخدمة'
            : 'Sign in to view your conversations and communicate with service providers'}
        </p>
        <Button
          className="bg-red-500 text-white hover:bg-red-600"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent('open-login', { detail: { mode: 'login' } })
            )
          }
        >
          {isRTL ? 'تسجيل الدخول' : 'Sign In'}
        </Button>
      </motion.div>
    );
  }

  // ── Main Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/50 relative">
      {/* ── Header ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100"
      >
        <div className="max-w-2xl mx-auto px-4 py-3">
          {/* Top row: back + title + unread badge */}
          <div className="flex items-center gap-2 mb-3">
            <Button variant="ghost" size="icon" onClick={goBack} className="h-9 w-9 shrink-0">
              <BackArrow className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 flex-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                {isRTL ? 'الرسائل' : 'Messages'}
              </h1>
              {totalUnread > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                  <Badge className="h-5 min-w-[22px] justify-center bg-red-500 text-white text-[11px] px-1.5 rounded-full">
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </Badge>
                </motion.div>
              )}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-3">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? 'بحث في المحادثات...' : 'Search conversations...'}
              className="ps-10 h-9 text-sm bg-gray-50 border-gray-100 focus:bg-white"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Filter tabs */}
          <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as FilterTab)}>
            <TabsList className="w-full h-9 bg-gray-50 p-0.5">
              <TabsTrigger
                value="all"
                className="flex-1 h-8 text-xs data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm"
              >
                {isRTL ? 'الكل' : 'All'}
                <Badge variant="secondary" className="ms-1 h-4 min-w-[18px] text-[9px] px-1 bg-gray-100">
                  {displaySummaries.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="flex-1 h-8 text-xs data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm"
              >
                {isRTL ? 'غير مقروء' : 'Unread'}
                {totalUnread > 0 && (
                  <Badge className="ms-1 h-4 min-w-[18px] text-[9px] px-1 bg-red-100 text-red-600 border-0">
                    {totalUnread}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="archived"
                className="flex-1 h-8 text-xs data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm"
              >
                <Archive className="h-3 w-3 me-1" />
                {isRTL ? 'المؤرشفة' : 'Archived'}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto">
        {/* Loading state */}
        {isLoading && <ConversationListSkeleton />}

        {/* Error state */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-8 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {isRTL ? 'خطأ' : 'Error'}
            </h2>
            <p className="text-sm text-gray-500">
              {isRTL ? 'فشل تحميل المحادثات' : 'Failed to load conversations'}
            </p>
            <Button variant="outline" onClick={() => refetch()} className="border-red-200 text-red-600 hover:bg-red-50">
              {isRTL ? 'إعادة المحاولة' : 'Retry'}
            </Button>
          </motion.div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredSummaries.length === 0 && searchQuery === '' && activeFilter === 'all' && (
          <AnimatedEmptyState
            isRTL={isRTL}
            onStartConversation={() => navigate('market')}
          />
        )}

        {/* No search results */}
        {!isLoading && !error && filteredSummaries.length === 0 && (searchQuery !== '' || activeFilter !== 'all') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center gap-3 py-16 text-center"
          >
            <div className="rounded-full bg-gray-100 p-4">
              <Filter className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500">
              {searchQuery
                ? (isRTL ? 'لا توجد نتائج للبحث' : 'No results found')
                : (isRTL ? 'لا توجد محادثات في هذا التصنيف' : 'No conversations in this filter')}
            </p>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500"
                onClick={() => setSearchQuery('')}
              >
                {isRTL ? 'مسح البحث' : 'Clear search'}
              </Button>
            )}
          </motion.div>
        )}

        {/* Conversation list */}
        {!isLoading && !error && filteredSummaries.length > 0 && (
          <div className="p-4 space-y-2 pb-24">
            <AnimatePresence mode="popLayout">
              {filteredSummaries.map((summary, index) => (
                <ConversationItem
                  key={summary.conversation.id}
                  summary={summary}
                  index={index}
                  isRTL={isRTL}
                  isMock={isUsingMock}
                  mockIndex={displaySummaries.indexOf(summary)}
                  onClick={() => handleConversationClick(summary.conversation.id)}
                />
              ))}
            </AnimatePresence>

            {/* Mock data notice */}
            {isUsingMock && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-[11px] text-gray-300 pt-4"
              >
                {isRTL ? 'محادثات تجريبية — أجرِ حجزاً لبدء محادثة حقيقية' : 'Demo conversations — make a booking to start a real conversation'}
              </motion.p>
            )}
          </div>
        )}
      </div>

      {/* ── FAB: New Message ─────────────────────────────────────── */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
        className="fixed bottom-24 right-6 z-30"
      >
        <Button
          className="h-14 w-14 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all"
          size="icon"
          onClick={() => navigate('market')}
        >
          <Plus className="h-6 w-6" />
        </Button>
        <span className="sr-only">{isRTL ? 'رسالة جديدة' : 'New message'}</span>
      </motion.div>
    </div>
  );
}
