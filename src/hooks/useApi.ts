/**
 * Comprehensive TanStack Query hooks for ALL services.
 * SINGLE source of truth for all data fetching in the نبض (Nabd) marketplace app.
 *
 * Exports:
 * - Query key factories for each service domain
 * - All query hooks (useQuery)
 * - All mutation hooks (useMutation) with automatic cache invalidation
 *
 * Adapted from waelhe/app-frontend for our api.ts which handles tokens
 * internally via getToken() — service functions do NOT take a token parameter.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  catalogService,
  searchService,
  bookingService,
  reviewsService,
  messagingService,
  paymentsService,
  getToken,
  checkBackendHealth,
} from '@/lib/api';
import type {
  PagedResponse,
  ListingResponse,
  ListingSummary,
  ProviderListingSummary,
  BookingResponse,
  BookingSummary,
  ReviewResponse,
  ConversationResponse,
  MessageResponse,
  UnreadCountResponse,
  PaymentIntentResponse,
  PaymentResponse,
  CreateListingRequest,
  UpdateListingRequest,
  CreateBookingRequest,
  CreateReviewRequest,
  UpdateReviewRequest,
  CreateConversationRequest,
  SendMessageRequest,
  CreateIntentRequest,
  ConfirmIntentRequest,
  SearchParams,
} from '@/lib/types';

// ════════════════════════════════════════════════════════════════════
// Helper
// ════════════════════════════════════════════════════════════════════

/** Throws if no access token is present — used by mutations that require auth */
function requireAuth(): string {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  return token;
}

// ════════════════════════════════════════════════════════════════════
// Query Key Factories
// ════════════════════════════════════════════════════════════════════

export const backendKeys = {
  all: ['backend'] as const,
  health: () => [...backendKeys.all, 'health'] as const,
};

export const listingKeys = {
  all: ['listings'] as const,
  lists: () => [...listingKeys.all, 'list'] as const,
  list: (params?: Record<string, unknown>) =>
    [...listingKeys.lists(), params] as const,
  byCategory: (category: string, params?: Record<string, unknown>) =>
    [...listingKeys.all, 'category', category, params] as const,
  byProvider: (providerId: string, params?: Record<string, unknown>) =>
    [...listingKeys.all, 'provider', providerId, params] as const,
  details: () => [...listingKeys.all, 'detail'] as const,
  detail: (id: string) => [...listingKeys.details(), id] as const,
};

export const searchKeys = {
  all: ['search'] as const,
  search: (params?: Record<string, unknown>) =>
    [...searchKeys.all, 'query', params] as const,
  byCategory: (category: string, params?: Record<string, unknown>) =>
    [...searchKeys.all, 'category', category, params] as const,
};

export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  byConsumer: (consumerId: string, params?: Record<string, unknown>) =>
    [...bookingKeys.all, 'consumer', consumerId, params] as const,
  byProvider: (providerId: string, params?: Record<string, unknown>) =>
    [...bookingKeys.all, 'provider', providerId, params] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
};

export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  byProvider: (providerId: string, params?: Record<string, unknown>) =>
    [...reviewKeys.all, 'provider', providerId, params] as const,
  byReviewer: (reviewerId: string, params?: Record<string, unknown>) =>
    [...reviewKeys.all, 'reviewer', reviewerId, params] as const,
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewKeys.details(), id] as const,
};

export const messagingKeys = {
  all: ['messaging'] as const,
  conversation: (id: string) =>
    [...messagingKeys.all, 'conversation', id] as const,
  messages: (conversationId: string, params?: Record<string, unknown>) =>
    [...messagingKeys.all, 'messages', conversationId, params] as const,
  unreadCount: (conversationId: string) =>
    [...messagingKeys.all, 'unread', conversationId] as const,
};

export const paymentKeys = {
  all: ['payments'] as const,
  intent: (id: string) => [...paymentKeys.all, 'intent', id] as const,
  intents: () => [...paymentKeys.all, 'intents'] as const,
};

// ════════════════════════════════════════════════════════════════════
// 1. Backend Status Hooks
// ════════════════════════════════════════════════════════════════════

/** Polls backend health every 30 seconds */
export function useBackendStatus() {
  return useQuery<{ status: string }>({
    queryKey: backendKeys.health(),
    queryFn: () => checkBackendHealth(),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

// ════════════════════════════════════════════════════════════════════
// 2. Listings / Catalog Hooks
// ════════════════════════════════════════════════════════════════════

/** GET paginated listings */
export function useListings(
  params?: { page?: number; size?: number },
) {
  return useQuery<PagedResponse<ListingSummary>>({
    queryKey: listingKeys.list(params),
    queryFn: () => catalogService.list(params?.page ?? 0, params?.size ?? 20),
  });
}

/** GET single listing by ID */
export function useListing(id: string) {
  return useQuery<ListingResponse>({
    queryKey: listingKeys.detail(id),
    queryFn: () => catalogService.byId(id),
    enabled: !!id,
  });
}

/** GET listings by category */
export function useListingsByCategory(
  category: string,
  params?: { page?: number; size?: number },
) {
  return useQuery<PagedResponse<ListingSummary>>({
    queryKey: listingKeys.byCategory(category, params),
    queryFn: () =>
      catalogService.byCategory(category, params?.page ?? 0, params?.size ?? 20),
    enabled: !!category,
  });
}

/** GET listings by provider */
export function useListingsByProvider(
  providerId: string,
  params?: { page?: number; size?: number },
) {
  return useQuery<PagedResponse<ProviderListingSummary>>({
    queryKey: listingKeys.byProvider(providerId, params),
    queryFn: () =>
      catalogService.byProvider(providerId, params?.page ?? 0, params?.size ?? 20),
    enabled: !!providerId,
  });
}

/** POST create a new listing */
export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation<ListingResponse, Error, CreateListingRequest>({
    mutationFn: (data) => {
      requireAuth();
      return catalogService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
    },
  });
}

/** PUT update an existing listing */
export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation<ListingResponse, Error, { id: string; data: UpdateListingRequest }>({
    mutationFn: ({ id, data }) => {
      requireAuth();
      return catalogService.update(id, data);
    },
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
    },
  });
}

/** DELETE (archive) a listing */
export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation<ListingResponse, Error, string>({
    mutationFn: (id) => {
      requireAuth();
      return catalogService.archive(id);
    },
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
    },
  });
}

/** POST activate a listing */
export function useActivateListing() {
  const queryClient = useQueryClient();

  return useMutation<ListingResponse, Error, string>({
    mutationFn: (id) => {
      requireAuth();
      return catalogService.activate(id);
    },
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
    },
  });
}

/** POST pause a listing */
export function usePauseListing() {
  const queryClient = useQueryClient();

  return useMutation<ListingResponse, Error, string>({
    mutationFn: (id) => {
      requireAuth();
      return catalogService.pause(id);
    },
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
    },
  });
}

// ════════════════════════════════════════════════════════════════════
// 3. Search Hooks
// ════════════════════════════════════════════════════════════════════

/** GET search with query parameters */
export function useSearch(params?: SearchParams) {
  return useQuery<PagedResponse<ListingSummary>>({
    queryKey: searchKeys.search(params),
    queryFn: () => searchService.search(params),
    enabled: !!params?.q || !!params?.category,
  });
}

/** GET search by category */
export function useSearchByCategory(
  category: string,
  params?: { page?: number; size?: number },
) {
  return useQuery<PagedResponse<ListingSummary>>({
    queryKey: searchKeys.byCategory(category, params),
    queryFn: () =>
      searchService.byCategory(category, params?.page ?? 0, params?.size ?? 20),
    enabled: !!category,
  });
}

// ════════════════════════════════════════════════════════════════════
// 4. Booking Hooks
// ════════════════════════════════════════════════════════════════════

/** GET bookings for a consumer */
export function useBookings(
  consumerId?: string,
  params?: { page?: number; size?: number },
) {
  return useQuery<PagedResponse<BookingSummary>>({
    queryKey: consumerId
      ? bookingKeys.byConsumer(consumerId, params)
      : bookingKeys.lists(),
    queryFn: () => {
      if (!consumerId) {
        throw new Error('consumerId is required when fetching bookings');
      }
      requireAuth();
      return bookingService.consumerBookings(consumerId, params?.page ?? 0, params?.size ?? 20);
    },
    enabled: !!consumerId,
  });
}

/** GET single booking by ID */
export function useBooking(id: string) {
  return useQuery<BookingResponse>({
    queryKey: bookingKeys.detail(id),
    queryFn: () => {
      requireAuth();
      return bookingService.byId(id);
    },
    enabled: !!id,
  });
}

/** GET bookings for a provider */
export function useProviderBookings(
  providerId: string,
  params?: { page?: number; size?: number },
) {
  return useQuery<PagedResponse<BookingSummary>>({
    queryKey: bookingKeys.byProvider(providerId, params),
    queryFn: () => {
      requireAuth();
      return bookingService.providerBookings(providerId, params?.page ?? 0, params?.size ?? 20);
    },
    enabled: !!providerId,
  });
}

/** POST create a new booking */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation<BookingResponse, Error, CreateBookingRequest>({
    mutationFn: (data) => {
      requireAuth();
      return bookingService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
}

/** POST confirm a booking */
export function useConfirmBooking() {
  const queryClient = useQueryClient();

  return useMutation<BookingResponse, Error, string>({
    mutationFn: (id) => {
      requireAuth();
      return bookingService.confirm(id);
    },
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
}

/** POST complete a booking */
export function useCompleteBooking() {
  const queryClient = useQueryClient();

  return useMutation<BookingResponse, Error, string>({
    mutationFn: (id) => {
      requireAuth();
      return bookingService.complete(id);
    },
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
}

/** POST cancel a booking */
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation<BookingResponse, Error, string>({
    mutationFn: (id) => {
      requireAuth();
      return bookingService.cancel(id);
    },
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
}

// ════════════════════════════════════════════════════════════════════
// 5. Review Hooks
// ════════════════════════════════════════════════════════════════════

/** GET reviews for a provider */
export function useReviews(
  providerId?: string,
  params?: { page?: number; size?: number },
) {
  return useQuery<PagedResponse<ReviewResponse>>({
    queryKey: providerId
      ? reviewKeys.byProvider(providerId, params)
      : reviewKeys.lists(),
    queryFn: () => {
      if (!providerId) throw new Error('providerId is required');
      return reviewsService.byProvider(providerId, params?.page ?? 0, params?.size ?? 20);
    },
    enabled: !!providerId,
  });
}

/** GET single review by ID */
export function useReview(id: string) {
  return useQuery<ReviewResponse>({
    queryKey: reviewKeys.detail(id),
    queryFn: () => reviewsService.byId(id),
    enabled: !!id,
  });
}

/** GET reviews by reviewer */
export function useReviewsByReviewer(
  reviewerId: string,
  params?: { page?: number; size?: number },
) {
  return useQuery<PagedResponse<ReviewResponse>>({
    queryKey: reviewKeys.byReviewer(reviewerId, params),
    queryFn: () =>
      reviewsService.byReviewer(reviewerId, params?.page ?? 0, params?.size ?? 20),
    enabled: !!reviewerId,
  });
}

/** POST create a new review */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation<ReviewResponse, Error, CreateReviewRequest>({
    mutationFn: (data) => {
      requireAuth();
      return reviewsService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
    },
  });
}

/** PUT update an existing review */
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation<ReviewResponse, Error, { id: string; data: UpdateReviewRequest }>({
    mutationFn: ({ id, data }) => {
      requireAuth();
      return reviewsService.update(id, data);
    },
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
    },
  });
}

// ════════════════════════════════════════════════════════════════════
// 6. Messaging Hooks
// ════════════════════════════════════════════════════════════════════

/** GET a single conversation by ID */
export function useConversation(id: string) {
  return useQuery<ConversationResponse>({
    queryKey: messagingKeys.conversation(id),
    queryFn: () => {
      requireAuth();
      return messagingService.conversationById(id);
    },
    enabled: !!id,
  });
}

/** GET messages for a conversation */
export function useMessages(
  conversationId: string,
  params?: { page?: number; size?: number },
) {
  return useQuery<PagedResponse<MessageResponse>>({
    queryKey: messagingKeys.messages(conversationId, params),
    queryFn: () =>
      messagingService.messages(conversationId, params?.page ?? 0, params?.size ?? 50),
    enabled: !!conversationId,
  });
}

/** GET unread count for a conversation (polls every 10s) */
export function useUnreadCount(conversationId: string) {
  return useQuery<UnreadCountResponse>({
    queryKey: messagingKeys.unreadCount(conversationId),
    queryFn: () => {
      requireAuth();
      return messagingService.unreadCount(conversationId);
    },
    enabled: !!conversationId,
    refetchInterval: 10_000,
  });
}

/** POST create a new conversation */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation<ConversationResponse, Error, CreateConversationRequest>({
    mutationFn: (data) => {
      requireAuth();
      return messagingService.createConversation(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.all });
    },
  });
}

/** POST send a message */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<
    MessageResponse,
    Error,
    { conversationId: string; data: SendMessageRequest }
  >({
    mutationFn: ({ conversationId, data }) => {
      requireAuth();
      return messagingService.sendMessage(conversationId, data);
    },
    onSuccess: (_result, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: messagingKeys.messages(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: messagingKeys.unreadCount(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: messagingKeys.conversation(conversationId),
      });
    },
  });
}

/** POST mark conversation as read */
export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (conversationId) => {
      requireAuth();
      return messagingService.markRead(conversationId);
    },
    onSuccess: (_result, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: messagingKeys.unreadCount(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: messagingKeys.messages(conversationId),
      });
    },
  });
}

// ════════════════════════════════════════════════════════════════════
// 7. Payment Hooks
// ════════════════════════════════════════════════════════════════════

/** GET a payment intent by ID */
export function usePaymentIntent(id: string) {
  return useQuery<PaymentIntentResponse>({
    queryKey: paymentKeys.intent(id),
    queryFn: () => {
      requireAuth();
      return paymentsService.getIntent(id);
    },
    enabled: !!id,
  });
}

/** POST create a payment intent */
export function useCreatePaymentIntent() {
  const queryClient = useQueryClient();

  return useMutation<PaymentIntentResponse, Error, CreateIntentRequest>({
    mutationFn: (data) => {
      requireAuth();
      return paymentsService.createIntent(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.intents() });
    },
  });
}

/** POST process a payment intent */
export function useProcessPayment() {
  const queryClient = useQueryClient();

  return useMutation<PaymentIntentResponse, Error, string>({
    mutationFn: (id) => {
      requireAuth();
      return paymentsService.processIntent(id);
    },
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.intent(id) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.intents() });
      // Also invalidate bookings since payment status affects bookings
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
}

/** POST confirm a payment intent */
export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation<
    PaymentIntentResponse,
    Error,
    { id: string; data?: ConfirmIntentRequest }
  >({
    mutationFn: ({ id, data }) => {
      requireAuth();
      return paymentsService.confirmIntent(id, data);
    },
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.intent(id) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.intents() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
}

/** POST cancel a payment intent */
export function useCancelPayment() {
  const queryClient = useQueryClient();

  return useMutation<PaymentIntentResponse, Error, string>({
    mutationFn: (id) => {
      requireAuth();
      return paymentsService.cancelIntent(id);
    },
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.intent(id) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.intents() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
}

/** POST refund a payment */
export function useRefund() {
  const queryClient = useQueryClient();

  return useMutation<PaymentResponse, Error, string>({
    mutationFn: (paymentId) => {
      requireAuth();
      return paymentsService.refund(paymentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.intents() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
}
