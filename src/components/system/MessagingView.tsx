'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Send,
  MessageCircle,
  Camera,
  Image as ImageIcon,
  MoreVertical,
  Flag,
  Ban,
  Check,
  CheckCheck,
  Clock,
  Package,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAuth as useAuthStore } from '@/store/use-auth';
import { useNavigationStore } from '@/stores/navigationStore';
import { useMessages, useListing, useBooking, useCreateConversation, useSendMessage, useMarkRead } from '@/hooks/useApi';
import type { MessageResponse, ConversationResponse, ListingResponse, BookingSummary } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

// ── Quick Reply Templates ────────────────────────────────────────

const quickReplies = [
  { ar: 'مرحباً، هل هذا متاح؟', en: 'Hi, is this available?' },
  { ar: 'ما هو أفضل سعر؟', en: "What's the best price?" },
  { ar: 'متى يمكنني القدوم؟', en: 'When can I come?' },
  { ar: 'شكراً!', en: 'Thanks!' },
];

// ── Helper: Date separator label ─────────────────────────────────

function getDateLabel(date: Date, isRTL: boolean): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) {
    return isRTL ? 'اليوم' : 'Today';
  }
  if (msgDate.getTime() === yesterday.getTime()) {
    return isRTL ? 'أمس' : 'Yesterday';
  }
  return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function shouldShowSeparator(prev: Date | null, curr: Date): boolean {
  if (!prev) return true;
  return (
    prev.getFullYear() !== curr.getFullYear() ||
    prev.getMonth() !== curr.getMonth() ||
    prev.getDate() !== curr.getDate()
  );
}

// ── System message detection ─────────────────────────────────────

function isSystemMessage(content: string): boolean {
  const systemPatterns = [
    'booking confirmed',
    'booking cancelled',
    'تم تأكيد الحجز',
    'تم إلغاء الحجز',
  ];
  return systemPatterns.some((p) => content.toLowerCase().includes(p));
}

// ── Component ──────────────────────────────────────────────────────

export function MessagingView() {
  const { t, isRTL } = useLanguage();
  const { user, accessToken } = useAuth();
  const authStore = useAuthStore();
  const { viewParams, goBack } = useNavigationStore();

  const conversationId = viewParams.conversationId;
  const bookingId = viewParams.bookingId;
  const listingId = viewParams.listingId;
  const recipientName = viewParams.recipientName || '';

  const [messageText, setMessageText] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState(conversationId || '');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [sentMessageIds, setSentMessageIds] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // ── Create conversation if bookingId provided ────────────────
  const createConversationMutation = useCreateConversation();

  useEffect(() => {
    if (!conversationId && bookingId) {
      createConversationMutation.mutate({ bookingId: bookingId! });
    }
  }, [conversationId, bookingId]);

  // ── Fetch Messages ───────────────────────────────────────────
  const {
    data: messagesData,
    isLoading,
    isError,
  } = useMessages(currentConversationId, { page: 0, size: 50 });

  const messages: MessageResponse[] = messagesData?.content ?? [];

  // ── Fetch listing info ───────────────────────────────────────
  const { data: listingData } = useListing(listingId!);

  // ── Fetch booking info for listing context ───────────────────
  const { data: bookingData } = useBooking(bookingId!);

  // If no listingId, try to get from booking
  const effectiveListingId = listingId || (bookingData as BookingSummary | undefined)?.listingId;
  const { data: bookingListingData } = useListing(effectiveListingId!);

  const chatListing: ListingResponse | null = listingData ?? bookingListingData ?? null;

  // ── Mark as Read ─────────────────────────────────────────────
  const markReadMutation = useMarkRead();

  useEffect(() => {
    if (currentConversationId) {
      markReadMutation.mutate(currentConversationId);
    }
  }, [currentConversationId]);

  // ── Auto Scroll ──────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send Message ─────────────────────────────────────────────
  const sendMessageMutation = useSendMessage();

  const handleSend = useCallback(() => {
    const trimmed = messageText.trim();
    if (!trimmed || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(
      { conversationId: currentConversationId, data: { content: trimmed } },
      {
        onSuccess: (data: MessageResponse) => {
          setMessageText('');
          if (data?.id) {
            setSentMessageIds((prev) => new Set(prev).add(data.id));
          }
        },
      },
    );
    setShowQuickReplies(false);
  }, [messageText, sendMessageMutation, currentConversationId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleQuickReply = useCallback((text: string) => {
    setMessageText(text);
    sendMessageMutation.mutate({ conversationId: currentConversationId, data: { content: text } });
    setShowQuickReplies(false);
  }, [sendMessageMutation, currentConversationId]);

  // ── Message grouping for date separators ─────────────────────
  const messageGroups = useMemo(() => {
    const groups: Array<{ type: 'separator'; label: string } | { type: 'message'; msg: MessageResponse; isSent: boolean }> = [];
    let prevDate: Date | null = null;

    for (const msg of messages) {
      const msgDate = new Date(msg.createdAt);
      if (shouldShowSeparator(prevDate, msgDate)) {
        groups.push({ type: 'separator', label: getDateLabel(msgDate, isRTL) });
      }
      const isSent = sentMessageIds.has(msg.id) || (!!user && msg.content !== undefined && sentMessageIds.size > 0 && sentMessageIds.has(msg.id));
      groups.push({ type: 'message', msg, isSent });
      prevDate = msgDate;
    }
    return groups;
  }, [messages, isRTL, sentMessageIds, user]);

  // ── Determine message ownership more reliably ────────────────
  const isMessageSent = useCallback((msg: MessageResponse): boolean => {
    if (sentMessageIds.has(msg.id)) return true;
    // As fallback, assume alternating messages where we don't know
    return false;
  }, [sentMessageIds]);

  // ── Loading State ────────────────────────────────────────────
  if (isLoading || createConversationMutation.isPending) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col">
        {/* Header skeleton */}
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16 mt-1" />
          </div>
        </div>
        {/* Messages skeleton */}
        <div className="flex-1 space-y-3 p-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={i % 2 === 0 ? 'flex justify-start' : 'flex justify-end'}
            >
              <Skeleton className={'h-10 ' + (i % 2 === 0 ? 'w-48' : 'w-40') + ' rounded-2xl'} />
            </div>
          ))}
        </div>
        {/* Input skeleton */}
        <div className="border-t px-4 py-3 flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 flex-1 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    );
  }

  // ── Error State ──────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="rounded-full bg-red-100 p-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <p className="text-sm text-red-500">{t('common.error')}</p>
        <Button variant="outline" size="sm" onClick={goBack}>
          {t('common.back')}
        </Button>
      </div>
    );
  }

  // ── Empty State (no conversation yet) ────────────────────────
  if (!currentConversationId) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4 p-6 text-center"
      >
        {/* Animated chat bubble illustration */}
        <div className="relative">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="rounded-full bg-red-50 p-6">
              <MessageCircle className="h-16 w-16 text-red-300" />
            </div>
          </motion.div>
          {/* Decorative dots */}
          <motion.div
            className="absolute -top-2 -end-2 h-4 w-4 rounded-full bg-red-400"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-1 -start-3 h-3 w-3 rounded-full bg-rose-300"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
        </div>

        <div className="space-y-2 mt-2">
          <h3 className="text-lg font-bold text-gray-900">
            {isRTL ? 'ابدأ محادثة' : 'Start a conversation'}
          </h3>
          <p className="text-sm text-gray-500 max-w-xs">
            {isRTL
              ? 'أرسل رسالة لمزود الخدمة للاستفسار عن الخدمات المتاحة'
              : 'Message a service provider to inquire about available services'}
          </p>
        </div>

        {/* Quick reply suggestions */}
        <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-xs">
          {quickReplies.map((qr, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
            >
              {isRTL ? qr.ar : qr.en}
            </motion.button>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={goBack} className="mt-4">
          {t('common.back')}
        </Button>
      </motion.div>
    );
  }

  // ── Recipient info derived ───────────────────────────────────
  const recipientDisplayName = recipientName || (isRTL ? 'مزود الخدمة' : 'Service Provider');
  const recipientInitial = recipientDisplayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-[calc(100vh-8rem)] flex-col"
    >
      {/* ── Chat Header ──────────────────────────────────────────── */}
      <div className="border-b bg-white shrink-0">
        {/* Main header row */}
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="h-8 w-8 shrink-0"
          >
            <BackArrow className="h-4 w-4" />
          </Button>

          {/* Recipient avatar + info */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="relative">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gradient-to-br from-red-500 to-rose-600 text-white text-xs font-bold">
                  {recipientInitial}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -end-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-gray-900">
                {recipientDisplayName}
              </h2>
              <p className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {isRTL ? 'متصل الآن' : 'Online'}
              </p>
            </div>
          </div>

          {/* Menu button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setReportDialogOpen(true)} className="gap-2 text-amber-600">
                <Flag className="h-3.5 w-3.5" />
                {isRTL ? 'إبلاغ' : 'Report'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setBlockDialogOpen(true)} className="gap-2 text-red-600">
                <Ban className="h-3.5 w-3.5" />
                {isRTL ? 'حظر' : 'Block'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Listing preview card */}
        {chatListing && (
          <div className="px-3 pb-2">
            <Card
              className="cursor-pointer bg-gray-50/80 border-gray-100 hover:bg-gray-100/80 transition-colors"
              onClick={() => {
                if (chatListing.id) {
                  // Navigate to listing detail
                  const nav = useNavigationStore.getState();
                  nav.navigate('listing-detail', { listingId: chatListing.id });
                }
              }}
            >
              <CardContent className="p-2.5 flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {chatListing.title}
                  </p>
                  <p className="text-[10px] text-red-600 font-bold">
                    {(chatListing.price / 100).toFixed(2)} {chatListing.currency || 'SYP'}
                  </p>
                </div>
                <Badge variant="secondary" className="text-[9px] shrink-0">
                  {isRTL ? 'إعلان' : 'Listing'}
                </Badge>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ── Messages Area ────────────────────────────────────────── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="rounded-full bg-red-50 p-4">
                <Sparkles className="h-6 w-6 text-red-300" />
              </div>
            </motion.div>
            <p className="text-xs text-gray-400 font-medium">
              {isRTL ? 'ابدأ المحادثة الآن' : 'Start the conversation'}
            </p>
            {/* Quick reply suggestions */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-2 max-w-xs">
              {quickReplies.map((qr, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickReply(isRTL ? qr.ar : qr.en)}
                  className="rounded-full border border-red-200 bg-white px-2.5 py-1 text-[10px] text-red-600 hover:bg-red-50 transition-colors"
                >
                  {isRTL ? qr.ar : qr.en}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {messageGroups.map((item, index) => {
              if (item.type === 'separator') {
                return (
                  <div key={`sep-${index}`} className="flex items-center justify-center py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-gray-200 min-w-8" />
                      <span className="text-[10px] text-gray-400 font-medium px-2">
                        {item.label}
                      </span>
                      <div className="h-px flex-1 bg-gray-200 min-w-8" />
                    </div>
                  </div>
                );
              }

              const { msg, isSent } = item;
              const isSystem = isSystemMessage(msg.content);
              const msgTime = new Date(msg.createdAt).toLocaleTimeString(
                isRTL ? 'ar-SA' : 'en-US',
                { hour: '2-digit', minute: '2-digit' }
              );

              // System message
              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center py-2">
                    <div className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 flex items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3 text-amber-600" />
                      <span className="text-[10px] text-amber-700 font-medium">
                        {msg.content}
                      </span>
                    </div>
                  </div>
                );
              }

              // Image attachment placeholder
              const isImagePlaceholder = msg.content.startsWith('[IMG]');

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Avatar for received messages */}
                  {!isSent && (
                    <Avatar className="h-7 w-7 mt-auto mr-1.5 shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-500 text-white text-[9px] font-bold">
                        {recipientInitial}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                      isSent
                        ? 'rounded-br-sm bg-red-500 text-white'
                        : 'rounded-bl-sm bg-gray-100 text-gray-800'
                    }`}
                  >
                    {isImagePlaceholder ? (
                      /* Image attachment placeholder */
                      <div className={`rounded-lg p-4 flex flex-col items-center gap-1.5 ${
                        isSent ? 'bg-red-400/50' : 'bg-gray-200'
                      }`}>
                        <ImageIcon className={`h-8 w-8 ${isSent ? 'text-red-200' : 'text-gray-400'}`} />
                        <span className={`text-[10px] ${isSent ? 'text-red-200' : 'text-gray-500'}`}>
                          {isRTL ? 'صورة' : 'Image'}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    )}

                    {/* Timestamp + read receipts */}
                    <div className={`flex items-center gap-1 mt-0.5 ${isSent ? 'justify-end' : 'justify-start'}`}>
                      <span
                        className={`text-[10px] ${
                          isSent ? 'text-red-200' : 'text-gray-400'
                        }`}
                      >
                        {msgTime}
                      </span>
                      {isSent && (
                        msg.read
                          ? <CheckCheck className="h-3 w-3 text-red-200" />
                          : <Check className="h-3 w-3 text-red-200" />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Quick Replies Bar ────────────────────────────────────── */}
      <AnimatePresence>
        {showQuickReplies && messages.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t bg-gray-50/80 overflow-hidden"
          >
            <div className="px-3 py-2">
              <p className="text-[10px] text-gray-400 font-medium mb-1.5">
                {isRTL ? 'ردود سريعة' : 'Quick Replies'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quickReplies.map((qr, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickReply(isRTL ? qr.ar : qr.en)}
                    className="rounded-full border border-red-200 bg-white px-2.5 py-1 text-[11px] text-red-600 hover:bg-red-50 transition-colors"
                  >
                    {isRTL ? qr.ar : qr.en}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Message Input ────────────────────────────────────────── */}
      <div className="border-t bg-white px-3 py-2.5 shrink-0">
        <div className="flex items-center gap-2">
          {/* Attachment button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-gray-400 hover:text-gray-600"
            onClick={() => {
              // Placeholder: would open file picker in production
            }}
          >
            <Camera className="h-4.5 w-4.5" />
          </Button>

          {/* Text input */}
          <div className="flex-1 relative">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRTL ? 'اكتب رسالة...' : 'Type a message...'}
              className="pr-10 rounded-full bg-gray-50 border-gray-200 focus:border-red-300 focus:ring-red-200"
              disabled={sendMessageMutation.isPending}
            />
            {/* Quick reply toggle */}
            <button
              onClick={() => setShowQuickReplies(!showQuickReplies)}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${showQuickReplies ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Send button */}
          <Button
            size="icon"
            className="h-9 w-9 shrink-0 bg-red-500 text-white hover:bg-red-600 rounded-full"
            onClick={handleSend}
            disabled={!messageText.trim() || sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Clock className="h-4 w-4" />
              </motion.div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* ── Report Dialog ────────────────────────────────────────── */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'إبلاغ عن مستخدم' : 'Report User'}</DialogTitle>
            <DialogDescription>
              {isRTL
                ? 'سيتم مراجعة البلاغ من قبل فريقنا'
                : 'Your report will be reviewed by our team'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-gray-600">
              {isRTL
                ? 'هل أنت متأكد من رغبتك في الإبلاغ عن هذا المستخدم؟'
                : 'Are you sure you want to report this user?'}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-amber-500 text-white hover:bg-amber-600"
              onClick={() => setReportDialogOpen(false)}
            >
              <Flag className="h-3.5 w-3.5" />
              {isRTL ? 'إبلاغ' : 'Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Block Dialog ─────────────────────────────────────────── */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'حظر مستخدم' : 'Block User'}</DialogTitle>
            <DialogDescription>
              {isRTL
                ? 'لن تتمكن من استقبال رسائل من هذا المستخدم'
                : "You won't receive messages from this user anymore"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-gray-600">
              {isRTL
                ? 'هل أنت متأكد من رغبتك في حظر هذا المستخدم؟'
                : 'Are you sure you want to block this user?'}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={() => setBlockDialogOpen(false)}
            >
              <Ban className="h-3.5 w-3.5" />
              {isRTL ? 'حظر' : 'Block'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
