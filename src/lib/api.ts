/**
 * API Client for the Marketplace backend.
 * Communicates with the waelhe/app-java-v3 Spring Boot REST API.
 * Uses relative paths proxied through Next.js API routes.
 */

import type {
  PagedResponse,
  ProblemDetail,
  UserResponse,
  UserSummary,
  ListingResponse,
  ListingSummary,
  ProviderListingSummary,
  CreateListingRequest,
  UpdateListingRequest,
  BookingResponse,
  BookingSummary,
  CreateBookingRequest,
  PaymentIntentResponse,
  PaymentResponse,
  PaymentSummary,
  CreateIntentRequest,
  ConfirmIntentRequest,
  ConversationResponse,
  MessageResponse,
  UnreadCountResponse,
  CreateConversationRequest,
  SendMessageRequest,
  ReviewResponse,
  CreateReviewRequest,
  UpdateReviewRequest,
  SearchParams,
} from '@/lib/types';

// ── Configuration ─────────────────────────────────────────────────

/** Relative path — requests are proxied through Next.js API routes */
const BACKEND_URL = '';

// ── Token Management ──────────────────────────────────────────────

const TOKEN_KEY = 'marketplace_access_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

// ── API Error ─────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  detail?: string;
  problem?: ProblemDetail;

  constructor(status: number, problem?: ProblemDetail) {
    super(problem?.detail ?? problem?.title ?? `API Error ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.detail = problem?.detail;
    this.problem = problem;
  }
}

// ── Core Fetch Helper ─────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BACKEND_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let problem: ProblemDetail | undefined;
    try {
      problem = await response.json();
    } catch {
      // Non-JSON error response
    }
    throw new ApiError(response.status, problem);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ── Query String Builder ──────────────────────────────────────────

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

// ── Health Check ──────────────────────────────────────────────────

export async function checkBackendHealth(): Promise<{ status: string }> {
  return apiFetch<{ status: string }>('/api/auth/health');
}

// ── Listings Service ──────────────────────────────────────────────

export const catalogService = {
  /** List all active listings (public, paginated) */
  list(page = 0, size = 20): Promise<PagedResponse<ListingSummary>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/listings${qs}`);
  },

  /** Get listings by category (paginated) */
  byCategory(category: string, page = 0, size = 20): Promise<PagedResponse<ListingSummary>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/listings/category/${encodeURIComponent(category)}${qs}`);
  },

  /** Get listings by provider ID (paginated) */
  byProvider(providerId: string, page = 0, size = 20): Promise<PagedResponse<ProviderListingSummary>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/listings/provider/${encodeURIComponent(providerId)}${qs}`);
  },

  /** Get a single listing by ID */
  byId(id: string): Promise<ListingResponse> {
    return apiFetch(`/api/v1/listings/${encodeURIComponent(id)}`);
  },

  /** Create a new listing (PROVIDER role) */
  create(data: CreateListingRequest): Promise<ListingResponse> {
    return apiFetch('/api/v1/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Update a listing (PROVIDER role) */
  update(id: string, data: UpdateListingRequest): Promise<ListingResponse> {
    return apiFetch(`/api/v1/listings/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /** Activate a listing (POST) */
  activate(id: string): Promise<ListingResponse> {
    return apiFetch(`/api/v1/listings/${encodeURIComponent(id)}/activate`, {
      method: 'POST',
    });
  },

  /** Pause a listing (POST) */
  pause(id: string): Promise<ListingResponse> {
    return apiFetch(`/api/v1/listings/${encodeURIComponent(id)}/pause`, {
      method: 'POST',
    });
  },

  /** Archive a listing (POST) */
  archive(id: string): Promise<ListingResponse> {
    return apiFetch(`/api/v1/listings/${encodeURIComponent(id)}/archive`, {
      method: 'POST',
    });
  },
};

// ── Search Service ────────────────────────────────────────────────

export const searchService = {
  /** Full-text search (paginated) */
  search(params: SearchParams = {}): Promise<PagedResponse<ListingSummary>> {
    const qs = buildQueryString({
      q: params.q,
      category: params.category,
      page: params.page ?? 0,
      size: params.size ?? 20,
    });
    return apiFetch(`/api/v1/search${qs}`);
  },

  /** Search by category (paginated) */
  byCategory(category: string, page = 0, size = 20): Promise<PagedResponse<ListingSummary>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/search/category/${encodeURIComponent(category)}${qs}`);
  },
};

// ── Booking Service ───────────────────────────────────────────────

export const bookingService = {
  /** Get a booking by ID */
  byId(id: string): Promise<BookingResponse> {
    return apiFetch(`/api/v1/bookings/${encodeURIComponent(id)}`);
  },

  /** Get bookings for a consumer (paginated) */
  consumerBookings(consumerId: string, page = 0, size = 20): Promise<PagedResponse<BookingSummary>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/bookings/consumer/${encodeURIComponent(consumerId)}${qs}`);
  },

  /** Get bookings for a provider (paginated) */
  providerBookings(providerId: string, page = 0, size = 20): Promise<PagedResponse<BookingSummary>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/bookings/provider/${encodeURIComponent(providerId)}${qs}`);
  },

  /** Create a new booking (CONSUMER role) */
  create(data: CreateBookingRequest): Promise<BookingResponse> {
    return apiFetch('/api/v1/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Confirm a booking (PROVIDER/ADMIN) (POST) */
  confirm(id: string): Promise<BookingResponse> {
    return apiFetch(`/api/v1/bookings/${encodeURIComponent(id)}/confirm`, {
      method: 'POST',
    });
  },

  /** Complete a booking (PROVIDER/ADMIN) (POST) */
  complete(id: string): Promise<BookingResponse> {
    return apiFetch(`/api/v1/bookings/${encodeURIComponent(id)}/complete`, {
      method: 'POST',
    });
  },

  /** Cancel a booking (POST) */
  cancel(id: string): Promise<BookingResponse> {
    return apiFetch(`/api/v1/bookings/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
    });
  },
};

// ── Reviews Service ───────────────────────────────────────────────

export const reviewsService = {
  /** Get a review by ID */
  byId(id: string): Promise<ReviewResponse> {
    return apiFetch(`/api/v1/reviews/${encodeURIComponent(id)}`);
  },

  /** Get reviews for a provider (paginated) */
  byProvider(providerId: string, page = 0, size = 20): Promise<PagedResponse<ReviewResponse>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/reviews/provider/${encodeURIComponent(providerId)}${qs}`);
  },

  /** Get reviews by a reviewer (paginated) */
  byReviewer(reviewerId: string, page = 0, size = 20): Promise<PagedResponse<ReviewResponse>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/reviews/reviewer/${encodeURIComponent(reviewerId)}${qs}`);
  },

  /** Create a review (CONSUMER role) */
  create(data: CreateReviewRequest): Promise<ReviewResponse> {
    return apiFetch('/api/v1/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Update a review (CONSUMER role) */
  update(id: string, data: UpdateReviewRequest): Promise<ReviewResponse> {
    return apiFetch(`/api/v1/reviews/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ── Messaging Service ─────────────────────────────────────────────

export const messagingService = {
  /** Get a conversation by ID */
  conversationById(id: string): Promise<ConversationResponse> {
    return apiFetch(`/api/v1/messages/conversations/${encodeURIComponent(id)}`);
  },

  /** Get messages in a conversation (paginated) */
  messages(conversationId: string, page = 0, size = 50): Promise<PagedResponse<MessageResponse>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/messages/conversations/${encodeURIComponent(conversationId)}/messages${qs}`);
  },

  /** Get unread count for a conversation */
  unreadCount(conversationId: string): Promise<UnreadCountResponse> {
    return apiFetch(`/api/v1/messages/conversations/${encodeURIComponent(conversationId)}/unread`);
  },

  /** Create a conversation */
  createConversation(data: CreateConversationRequest): Promise<ConversationResponse> {
    return apiFetch('/api/v1/messages/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Send a message */
  sendMessage(conversationId: string, data: SendMessageRequest): Promise<MessageResponse> {
    return apiFetch(`/api/v1/messages/conversations/${encodeURIComponent(conversationId)}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Mark messages as read (POST) */
  markRead(conversationId: string): Promise<void> {
    return apiFetch(`/api/v1/messages/conversations/${encodeURIComponent(conversationId)}/read`, {
      method: 'POST',
    });
  },
};

// ── Payments Service ──────────────────────────────────────────────

export const paymentsService = {
  /** Get a payment intent by ID */
  getIntent(intentId: string): Promise<PaymentIntentResponse> {
    return apiFetch(`/api/v1/payments/intents/${encodeURIComponent(intentId)}`);
  },

  /** Create a payment intent (CONSUMER) */
  createIntent(data: CreateIntentRequest): Promise<PaymentIntentResponse> {
    return apiFetch('/api/v1/payments/intents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Process a payment intent (CONSUMER) */
  processIntent(intentId: string): Promise<PaymentIntentResponse> {
    return apiFetch(`/api/v1/payments/intents/${encodeURIComponent(intentId)}/process`, {
      method: 'POST',
    });
  },

  /** Confirm a payment intent with external ID (ADMIN) */
  confirmIntent(intentId: string, data: ConfirmIntentRequest = {}): Promise<PaymentIntentResponse> {
    return apiFetch(`/api/v1/payments/intents/${encodeURIComponent(intentId)}/confirm`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Cancel a payment intent (CONSUMER) */
  cancelIntent(intentId: string): Promise<PaymentIntentResponse> {
    return apiFetch(`/api/v1/payments/intents/${encodeURIComponent(intentId)}/cancel`, {
      method: 'POST',
    });
  },

  /** Refund a payment (ADMIN) */
  refund(paymentId: string): Promise<PaymentResponse> {
    return apiFetch(`/api/v1/payments/${encodeURIComponent(paymentId)}/refund`, {
      method: 'POST',
    });
  },
};

// ── Identity Service ──────────────────────────────────────────────

export const identityService = {
  /** Get current user profile */
  me(): Promise<UserResponse> {
    return apiFetch('/api/v1/users/me');
  },
};

// ── Admin Service ─────────────────────────────────────────────────

export const adminService = {
  /** List all users (ADMIN, paginated) */
  listUsers(page = 0, size = 20): Promise<PagedResponse<UserSummary>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/admin/users${qs}`);
  },

  /** List all listings (ADMIN, paginated) */
  listListings(page = 0, size = 20): Promise<PagedResponse<ProviderListingSummary>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/admin/listings${qs}`);
  },

  /** Archive any listing (ADMIN) */
  archiveListing(id: string): Promise<ListingResponse> {
    return apiFetch(`/api/v1/admin/listings/${encodeURIComponent(id)}/archive`, {
      method: 'POST',
    });
  },

  /** List bookings filterable by status (ADMIN, paginated) */
  listBookings(page = 0, size = 20, status?: string): Promise<PagedResponse<BookingSummary>> {
    const qs = buildQueryString({ page, size, status });
    return apiFetch(`/api/v1/admin/bookings${qs}`);
  },

  /** List all payments (ADMIN, paginated) */
  listPayments(page = 0, size = 20): Promise<PagedResponse<PaymentSummary>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/admin/payments${qs}`);
  },

  /** Get a payment by ID (ADMIN) */
  getPayment(id: string): Promise<PaymentResponse> {
    return apiFetch(`/api/v1/admin/payments/${encodeURIComponent(id)}`);
  },
};
