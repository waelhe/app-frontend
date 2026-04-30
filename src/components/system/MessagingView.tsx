'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigationStore } from '@/stores/navigationStore';
import { messagingService } from '@/lib/api';
import type { MessageResponse } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export function MessagingView() {
  const { t, isRTL } = useLanguage();
  const { viewParams, goBack } = useNavigationStore();
  const queryClient = useQueryClient();

  const conversationId = viewParams.conversationId;
  const bookingId = viewParams.bookingId;

  const [messageText, setMessageText] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState(
    conversationId || ''
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // ── Create conversation if bookingId provided ────────────────
  const createConversationMutation = useMutation({
    mutationFn: () =>
      messagingService.createConversation({ bookingId }),
    onSuccess: (data) => {
      setCurrentConversationId(data.id);
    },
  });

  useEffect(() => {
    if (!conversationId && bookingId) {
      createConversationMutation.mutate();
    }
  }, [conversationId, bookingId]);

  // ── Fetch Messages ───────────────────────────────────────────
  const {
    data: messagesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['messages', currentConversationId],
    queryFn: () =>
      messagingService.messages(currentConversationId),
    enabled: !!currentConversationId,
    refetchInterval: 5000, // Poll for new messages
  });

  const messages: MessageResponse[] = messagesData?.content ?? [];

  // ── Mark as Read ─────────────────────────────────────────────
  const markReadMutation = useMutation({
    mutationFn: () => messagingService.markRead(currentConversationId),
  });

  useEffect(() => {
    if (currentConversationId) {
      markReadMutation.mutate();
    }
  }, [currentConversationId]);

  // ── Auto Scroll ──────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send Message ─────────────────────────────────────────────
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      messagingService.sendMessage(currentConversationId, { content }),
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({
        queryKey: ['messages', currentConversationId],
      });
    },
  });

  const handleSend = useCallback(() => {
    const trimmed = messageText.trim();
    if (!trimmed || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(trimmed);
  }, [messageText, sendMessageMutation]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // ── Loading State ────────────────────────────────────────────
  if (isLoading || createConversationMutation.isPending) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col p-4">
        <div className="flex items-center gap-2 pb-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
            >
              <Skeleton className="h-10 w-48 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error State ──────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4 p-4 text-center">
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
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="rounded-full bg-gray-100 p-4">
          <MessageCircle className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">
          {t('messages.noConversations')}
        </p>
        <Button variant="outline" size="sm" onClick={goBack}>
          {t('common.back')}
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-[calc(100vh-8rem)] flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="h-8 w-8 shrink-0"
        >
          <BackArrow className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-gray-900">
            {t('messages.title')}
          </h2>
          <p className="text-xs text-gray-500">
            {isRTL
              ? `محادثة #${currentConversationId.slice(0, 8)}`
              : `Conversation #${currentConversationId.slice(0, 8)}`}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-gray-100 p-3">
              <MessageCircle className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-400">
              {isRTL
                ? 'ابدأ المحادثة الآن'
                : 'Start the conversation'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => {
              // Simple heuristic: if message is "read" by current user, it was sent by them
              // In a real app, we'd compare senderId with current user id
              const isSent = msg.read;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      isSent
                        ? 'rounded-br-sm bg-red-500 text-white'
                        : 'rounded-bl-sm bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.content}</p>
                    <span
                      className={`mt-0.5 block text-[10px] ${
                        isSent ? 'text-red-200' : 'text-gray-400'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString(
                        isRTL ? 'ar-SA' : 'en-US',
                        { hour: '2-digit', minute: '2-digit' }
                      )}
                    </span>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t px-4 py-3">
        <div className="flex items-center gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('messages.typePlaceholder')}
            className="flex-1"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            size="icon"
            className="h-9 w-9 shrink-0 bg-red-500 text-white hover:bg-red-600"
            onClick={handleSend}
            disabled={!messageText.trim() || sendMessageMutation.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
