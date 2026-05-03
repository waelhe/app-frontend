'use client';

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  AlertCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  Inbox,
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

// ── Types ──────────────────────────────────────────────────────────

interface ConversationSummary {
  conversation: ConversationResponse;
  booking: BookingSummary;
  lastMessage: MessageResponse | null;
  unreadCount: number;
}

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

    if (diffSec < 60) {
      return isRTL ? 'الآن' : 'Just now';
    }
    if (diffMin < 60) {
      return isRTL
        ? `منذ ${diffMin} دقيقة`
        : `${diffMin}m ago`;
    }
    if (diffHour < 24) {
      return isRTL
        ? `منذ ${diffHour} ساعة`
        : `${diffHour}h ago`;
    }
    if (diffDay < 7) {
      return isRTL
        ? `منذ ${diffDay} يوم`
        : `${diffDay}d ago`;
    }
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

// ── Custom hook: Fetch conversation summaries from bookings ────────

async function fetchConversationSummaries(
  userId: string,
  isProvider: boolean
): Promise<ConversationSummary[]> {
  // Step 1: Fetch bookings
  const bookingsData = isProvider
    ? await bookingService.providerBookings(userId, 0, 50)
    : await bookingService.consumerBookings(userId, 0, 50);

  const bookings: BookingSummary[] = bookingsData.content ?? [];

  if (bookings.length === 0) return [];

  // Step 2 & 3: For each booking, create/fetch conversation then get last message + unread
  const results: ConversationSummary[] = [];

  // Process bookings in batches to avoid overwhelming the API
  const BATCH_SIZE = 5;
  for (let i = 0; i < bookings.length; i += BATCH_SIZE) {
    const batch = bookings.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(async (booking): Promise<ConversationSummary | null> => {
        try {
          // Try to create a conversation for this booking.
          // If one already exists, the API should return the existing one.
          const conversation =
            await messagingService.createConversation({
              bookingId: booking.id,
            });

          // Fetch last message and unread count in parallel
          const [messagesData, unreadData] = await Promise.allSettled([
            messagingService.messages(conversation.id, 0, 1),
            messagingService.unreadCount(conversation.id),
          ]);

          const lastMessage: MessageResponse | null =
            messagesData.status === 'fulfilled'
              ? (messagesData.value.content?.[0] ?? null)
              : null;

          const unreadCount: number =
            unreadData.status === 'fulfilled'
              ? unreadData.value.unreadCount
              : 0;

          return {
            conversation,
            booking,
            lastMessage,
            unreadCount,
          };
        } catch {
          // Failed to create/fetch conversation for this booking — skip it
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

  // Sort by most recent activity (conversation updatedAt or booking updatedAt)
  results.sort((a, b) => {
    const timeA = new Date(
      a.conversation.updatedAt || a.booking.updatedAt
    ).getTime();
    const timeB = new Date(
      b.conversation.updatedAt || b.booking.updatedAt
    ).getTime();
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

  // Also fetch bookings count for the empty state messaging
  const { data: bookingsData } = useQuery({
    queryKey: ['conversations-bookings-count', user?.id, role],
    queryFn: () => {
      if (!user?.id) throw new Error('Not authenticated');
      if (isProvider) {
        return bookingService.providerBookings(user.id, 0, 1);
      }
      return bookingService.consumerBookings(user.id, 0, 1);
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 30_000,
  });

  const bookingsCount = bookingsData?.totalElements ?? 0;

  return {
    summaries,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
    bookingsCount,
  };
}

// ── Skeleton Loader ────────────────────────────────────────────────

function ConversationListSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {/* Header skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-6 w-28" />
      </div>
      {/* List skeletons */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-lg" />
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────

export function ConversationListView() {
  const { t, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { navigate, goBack } = useNavigationStore();
  const { summaries, isLoading, error, refetch, bookingsCount } =
    useConversationSummaries();

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const ForwardChevron = isRTL ? ChevronLeft : ChevronRight;

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

  // ── Loading state ──────────────────────────────────────────────
  if (isLoading) {
    return <ConversationListSkeleton />;
  }

  // ── Error state ────────────────────────────────────────────────
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          {t('common.error')}
        </h2>
        <p className="text-sm text-gray-500">
          {isRTL
            ? 'فشل تحميل المحادثات'
            : 'Failed to load conversations'}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          {t('common.retry')}
        </Button>
      </motion.div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────
  if (summaries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 p-4"
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="h-8 w-8 shrink-0"
          >
            <BackArrow className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-red-500" />
            <h1 className="text-xl font-bold text-gray-900">
              {isRTL ? 'صندوق الوارد' : 'Inbox'}
            </h1>
          </div>
        </div>

        {/* Empty content */}
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="rounded-full bg-gray-100 p-6">
            <Inbox className="h-12 w-12 text-gray-300" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-gray-900">
              {isRTL ? 'لا توجد محادثات' : 'No conversations'}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              {bookingsCount === 0
                ? isRTL
                  ? 'قم بإجراء حجز أولاً لبدء محادثة مع مزود الخدمة'
                  : 'Make a booking first to start a conversation with a service provider'
                : isRTL
                  ? 'لم يتم بدء أي محادثات بعد. تحدث مع مزود الخدمة من صفحة الحجز.'
                  : "No conversations started yet. Message a provider from your booking page."}
            </p>
          </div>
          {bookingsCount > 0 && (
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() =>
                navigate('bookings-list' as Parameters<typeof navigate>[0])
              }
            >
              {isRTL ? 'عرض الحجوزات' : 'View Bookings'}
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  // ── Conversation list ──────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="h-8 w-8 shrink-0"
        >
          <BackArrow className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-red-500" />
          <h1 className="text-xl font-bold text-gray-900">
            {isRTL ? 'صندوق الوارد' : 'Inbox'}
          </h1>
        </div>
        <Badge variant="secondary" className="ms-auto text-xs">
          {summaries.length}
        </Badge>
      </div>

      {/* Conversation items */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {summaries.map((summary, index) => {
            const { conversation, booking, lastMessage, unreadCount } = summary;
            const activityTime =
              conversation.updatedAt || booking.updatedAt;
            const hasUnread = unreadCount > 0;

            return (
              <motion.div
                key={conversation.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card
                  className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
                  onClick={() => handleConversationClick(conversation.id)}
                >
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      {/* Red accent stripe */}
                      <div
                        className={`w-1 shrink-0 ${
                          hasUnread ? 'bg-red-500' : 'bg-gray-200'
                        }`}
                      />

                      {/* Content */}
                      <div className="flex-1 p-3 min-w-0">
                        {/* Top row: Booking reference + time + unread badge */}
                        <div className="flex items-center gap-2">
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm truncate ${
                                hasUnread
                                  ? 'font-bold text-gray-900'
                                  : 'font-semibold text-gray-800'
                              }`}
                            >
                              {isRTL ? 'حجز' : 'Booking'} #
                              {booking.id.slice(0, 8)}
                            </p>
                          </div>

                          {/* Time */}
                          <span className="shrink-0 text-[11px] text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(activityTime, isRTL)}
                          </span>

                          {/* Unread badge */}
                          {hasUnread && (
                            <Badge className="h-5 min-w-[20px] shrink-0 justify-center bg-red-500 text-white text-[10px] px-1.5">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                          )}
                        </div>

                        {/* Middle row: Listing reference */}
                        <p className="mt-0.5 text-xs text-gray-400">
                          {isRTL ? 'إعلان' : 'Listing'} #
                          {booking.listingId.slice(0, 8)}
                          <span className="mx-1 text-gray-300">•</span>
                          <span
                            className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                              booking.status === 'PENDING'
                                ? 'bg-amber-50 text-amber-600'
                                : booking.status === 'CONFIRMED'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : booking.status === 'COMPLETED'
                                    ? 'bg-sky-50 text-sky-600'
                                    : booking.status === 'CANCELLED'
                                      ? 'bg-red-50 text-red-600'
                                      : 'bg-gray-50 text-gray-500'
                            }`}
                          >
                            {booking.status === 'PENDING'
                              ? isRTL
                                ? 'قيد الانتظار'
                                : 'Pending'
                              : booking.status === 'CONFIRMED'
                                ? isRTL
                                  ? 'مؤكد'
                                  : 'Confirmed'
                                : booking.status === 'COMPLETED'
                                  ? isRTL
                                    ? 'مكتمل'
                                    : 'Completed'
                                  : booking.status === 'CANCELLED'
                                    ? isRTL
                                      ? 'ملغى'
                                      : 'Cancelled'
                                    : booking.status}
                          </span>
                        </p>

                        {/* Bottom row: Last message preview */}
                        {lastMessage ? (
                          <p
                            className={`mt-1.5 text-xs leading-relaxed ${
                              hasUnread
                                ? 'text-gray-700 font-medium'
                                : 'text-gray-500'
                            }`}
                          >
                            {truncateText(lastMessage.content, 80)}
                          </p>
                        ) : (
                          <p className="mt-1.5 text-xs text-gray-300 italic">
                            {isRTL
                              ? 'لا توجد رسائل بعد'
                              : 'No messages yet'}
                          </p>
                        )}
                      </div>

                      {/* Chevron */}
                      <div className="flex items-center px-2">
                        <ForwardChevron className="h-4 w-4 text-gray-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
