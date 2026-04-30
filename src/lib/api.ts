/**
 * API Client for the Marketplace backend.
 * Communicates with the Spring Boot 4.0.6 REST API.
 * Uses BACKEND_URL env var defaulting to http://localhost:8080.
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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

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
  return apiFetch<{ status: string }>('/actuator/health');
}

// ── Catalog Service ───────────────────────────────────────────────

export const catalogService = {
  /** List all active listings (public) */
  list(page = 0, size = 20): Promise<PagedResponse<ListingSummary>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/catalog/listings${qs}`);
  },

  /** Get listings by category */
  byCategory(category: string, page = 0, size = 20): Promise<PagedResponse<ListingSummary>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/catalog/listings/category/${encodeURIComponent(category)}${qs}`);
  },

  /** Get a single listing by ID */
  byId(id: string): Promise<ListingResponse> {
    return apiFetch(`/api/v1/catalog/listings/${encodeURIComponent(id)}`);
  },

  /** Get provider's own listings */
  myListings(page = 0, size = 20): Promise<PagedResponse<ProviderListingSummary>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/catalog/provider/listings${qs}`);
  },

  /** Create a new listing (Provider) */
  create(data: CreateListingRequest): Promise<ListingResponse> {
    return apiFetch('/api/v1/catalog/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Update a listing (Provider) */
  update(id: string, data: UpdateListingRequest): Promise<ListingResponse> {
    return apiFetch(`/api/v1/catalog/listings/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /** Activate a listing */
  activate(id: string): Promise<ListingResponse> {
    return apiFetch(`/api/v1/catalog/listings/${encodeURIComponent(id)}/activate`, {
      method: 'PATCH',
    });
  },

  /** Pause a listing */
  pause(id: string): Promise<ListingResponse> {
    return apiFetch(`/api/v1/catalog/listings/${encodeURIComponent(id)}/pause`, {
      method: 'PATCH',
    });
  },

  /** Archive a listing */
  archive(id: string): Promise<ListingResponse> {
    return apiFetch(`/api/v1/catalog/listings/${encodeURIComponent(id)}/archive`, {
      method: 'PATCH',
    });
  },

  /** Get all categories */
  categories(): Promise<string[]> {
    return apiFetch('/api/v1/catalog/categories');
  },
};

// ── Search Service ────────────────────────────────────────────────

export const searchService = {
  /** Full-text search */
  search(params: SearchParams = {}): Promise<PagedResponse<ListingSummary>> {
    const qs = buildQueryString({
      q: params.q,
      category: params.category,
      page: params.page ?? 0,
      size: params.size ?? 20,
    });
    return apiFetch(`/api/v1/search${qs}`);
  },
};

// ── Booking Service ───────────────────────────────────────────────

export const bookingService = {
  /** List bookings for current user */
  list(page = 0, size = 20): Promise<PagedResponse<BookingSummary>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/bookings${qs}`);
  },

  /** Get a booking by ID */
  byId(id: string): Promise<BookingResponse> {
    return apiFetch(`/api/v1/bookings/${encodeURIComponent(id)}`);
  },

  /** Create a new booking (Consumer) */
  create(data: CreateBookingRequest): Promise<BookingResponse> {
    return apiFetch('/api/v1/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Confirm a booking (Provider) */
  confirm(id: string): Promise<BookingResponse> {
    return apiFetch(`/api/v1/bookings/${encodeURIComponent(id)}/confirm`, {
      method: 'PATCH',
    });
  },

  /** Complete a booking (Provider) */
  complete(id: string): Promise<BookingResponse> {
    return apiFetch(`/api/v1/bookings/${encodeURIComponent(id)}/complete`, {
      method: 'PATCH',
    });
  },

  /** Cancel a booking */
  cancel(id: string): Promise<BookingResponse> {
    return apiFetch(`/api/v1/bookings/${encodeURIComponent(id)}/cancel`, {
      method: 'PATCH',
    });
  },

  /** Get bookings for a specific provider */
  providerBookings(providerId: string, page = 0, size = 20): Promise<PagedResponse<BookingSummary>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/bookings/provider/${encodeURIComponent(providerId)}${qs}`);
  },
};

// ── Reviews Service ───────────────────────────────────────────────

export const reviewsService = {
  /** Get reviews for a listing */
  byListing(listingId: string, page = 0, size = 20): Promise<PagedResponse<ReviewResponse>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/reviews/listing/${encodeURIComponent(listingId)}${qs}`);
  },

  /** Get reviews by booking */
  byBooking(bookingId: string): Promise<ReviewResponse> {
    return apiFetch(`/api/v1/reviews/booking/${encodeURIComponent(bookingId)}`);
  },

  /** Create a review (Consumer) */
  create(data: CreateReviewRequest): Promise<ReviewResponse> {
    return apiFetch('/api/v1/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Update a review */
  update(id: string, data: UpdateReviewRequest): Promise<ReviewResponse> {
    return apiFetch(`/api/v1/reviews/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /** Delete a review */
  delete(id: string): Promise<void> {
    return apiFetch(`/api/v1/reviews/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

// ── Messaging Service ─────────────────────────────────────────────

export const messagingService = {
  /** List conversations for current user */
  conversations(page = 0, size = 20): Promise<PagedResponse<ConversationResponse>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/messages/conversations${qs}`);
  },

  /** Get a conversation by ID */
  conversationById(id: string): Promise<ConversationResponse> {
    return apiFetch(`/api/v1/messages/conversations/${encodeURIComponent(id)}`);
  },

  /** Get messages in a conversation */
  messages(conversationId: string, page = 0, size = 50): Promise<PagedResponse<MessageResponse>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/messages/conversations/${encodeURIComponent(conversationId)}/messages${qs}`);
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

  /** Mark messages as read */
  markRead(conversationId: string): Promise<void> {
    return apiFetch(`/api/v1/messages/conversations/${encodeURIComponent(conversationId)}/read`, {
      method: 'PATCH',
    });
  },

  /** Get unread count */
  unreadCount(): Promise<UnreadCountResponse> {
    return apiFetch('/api/v1/messages/unread-count');
  },
};

// ── Payments Service ──────────────────────────────────────────────

export const paymentsService = {
  /** Create a payment intent */
  createIntent(data: CreateIntentRequest): Promise<PaymentIntentResponse> {
    return apiFetch('/api/v1/payments/intents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Confirm a payment intent */
  confirmIntent(intentId: string, data: ConfirmIntentRequest = {}): Promise<PaymentIntentResponse> {
    return apiFetch(`/api/v1/payments/intents/${encodeURIComponent(intentId)}/confirm`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Get a payment intent by ID */
  getIntent(intentId: string): Promise<PaymentIntentResponse> {
    return apiFetch(`/api/v1/payments/intents/${encodeURIComponent(intentId)}`);
  },

  /** Get payment by booking */
  byBooking(bookingId: string): Promise<PaymentResponse> {
    return apiFetch(`/api/v1/payments/bookings/${encodeURIComponent(bookingId)}`);
  },

  /** List payment summaries for current user */
  list(page = 0, size = 20): Promise<PagedResponse<PaymentSummary>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/payments${qs}`);
  },
};

// ── Identity Service ──────────────────────────────────────────────

export const identityService = {
  /** Get current user profile */
  me(): Promise<UserResponse> {
    return apiFetch('/api/v1/identity/me');
  },

  /** Get user summary */
  summary(): Promise<UserSummary> {
    return apiFetch('/api/v1/identity/summary');
  },

  /** Update display name */
  updateDisplayName(displayName: string): Promise<UserResponse> {
    return apiFetch('/api/v1/identity/display-name', {
      method: 'PATCH',
      body: JSON.stringify({ displayName }),
    });
  },
};

// ── Admin Service ─────────────────────────────────────────────────

export const adminService = {
  /** List all users (Admin) */
  listUsers(page = 0, size = 20): Promise<PagedResponse<UserSummary>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/admin/users${qs}`);
  },

  /** Get user by ID (Admin) */
  userById(id: string): Promise<UserSummary> {
    return apiFetch(`/api/v1/admin/users/${encodeURIComponent(id)}`);
  },

  /** List all bookings (Admin) */
  listBookings(page = 0, size = 20): Promise<PagedResponse<BookingSummary>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/admin/bookings${qs}`);
  },

  /** List all listings (Admin) */
  listListings(page = 0, size = 20): Promise<PagedResponse<ProviderListingSummary>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/admin/listings${qs}`);
  },

  /** List all payments (Admin) */
  listPayments(page = 0, size = 20): Promise<PagedResponse<PaymentSummary>> {
    const qs = buildQueryString({ page, size });
    return apiFetch(`/api/v1/admin/payments${qs}`);
  },
};
