/**
 * API Client for the Marketplace backend.
 * Communicates with the waelhe/app-java-v3 Spring Boot REST API.
 * Uses relative paths proxied through Next.js API routes.
 *
 * Resilience features:
 * - Retry logic for transient failures (502, 503, 504, network errors)
 * - Request timeout handling
 * - Error categorization (network, auth, server, client)
 * - Response caching for GET requests (in-memory + localStorage)
 * - Graceful degradation when backend is intermittently available
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

/** Maximum number of retry attempts for transient errors */
const MAX_RETRIES = 2;

/** Base delay between retries (ms), doubled each attempt */
const RETRY_BASE_DELAY = 1000;

/** Default request timeout (ms) */
const REQUEST_TIMEOUT = 15_000;

/** Cache TTL in milliseconds (5 minutes) */
const CACHE_TTL = 5 * 60 * 1000;

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

export type ErrorCategory = 'network' | 'auth' | 'server' | 'client' | 'timeout';

export class ApiError extends Error {
  status: number;
  detail?: string;
  problem?: ProblemDetail;
  category: ErrorCategory;
  isRetryable: boolean;

  constructor(status: number, problem?: ProblemDetail, category?: ErrorCategory) {
    super(problem?.detail ?? problem?.title ?? `API Error ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.detail = problem?.detail;
    this.problem = problem;
    this.category = category ?? categorizeError(status);
    this.isRetryable = isRetryableStatus(status);
  }
}

function categorizeError(status: number): ErrorCategory {
  if (status === 401 || status === 403) return 'auth';
  if (status === 502 || status === 503 || status === 504) return 'server';
  if (status >= 400 && status < 500) return 'client';
  return 'server';
}

function isRetryableStatus(status: number): boolean {
  return status === 502 || status === 503 || status === 504 || status === 429;
}

// ── Response Cache ────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

function getCacheKey(path: string): string {
  return `nabd_api_cache:${path}`;
}

function getCachedData<T>(path: string): T | null {
  // Check memory cache first
  const memEntry = memoryCache.get(path) as CacheEntry<T> | undefined;
  if (memEntry && Date.now() - memEntry.timestamp < CACHE_TTL) {
    return memEntry.data;
  }

  // Check localStorage cache
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(getCacheKey(path));
      if (stored) {
        const entry = JSON.parse(stored) as CacheEntry<T>;
        if (Date.now() - entry.timestamp < CACHE_TTL) {
          // Restore to memory cache
          memoryCache.set(path, entry);
          return entry.data;
        }
        // Expired — clean up
        localStorage.removeItem(getCacheKey(path));
      }
    } catch {
      // Corrupted cache entry
      try { localStorage.removeItem(getCacheKey(path)); } catch {}
    }
  }

  return null;
}

function setCachedData<T>(path: string, data: T): void {
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };

  // Store in memory cache
  memoryCache.set(path, entry);

  // Store in localStorage for persistence across page loads
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(getCacheKey(path), JSON.stringify(entry));
    } catch {
      // localStorage might be full — clear old cache entries
      clearExpiredCache();
      try {
        localStorage.setItem(getCacheKey(path), JSON.stringify(entry));
      } catch {
        // Still can't store — memory cache only
      }
    }
  }
}

function clearExpiredCache(): void {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('nabd_api_cache:')) {
      try {
        const entry = JSON.parse(localStorage.getItem(key) || '{}');
        if (now - entry.timestamp > CACHE_TTL) {
          keysToRemove.push(key);
        }
      } catch {
        keysToRemove.push(key);
      }
    }
  }
  keysToRemove.forEach((key) => {
    try { localStorage.removeItem(key); } catch {}
  });
}

// ── Backend Status Tracker ────────────────────────────────────────

type BackendStatus = 'unknown' | 'online' | 'degraded' | 'offline';

let _backendStatus: BackendStatus = 'unknown';
let _lastStatusCheck = 0;
const STATUS_CHECK_INTERVAL = 30_000; // 30 seconds

const statusListeners = new Set<(status: BackendStatus) => void>();

export function getBackendStatus(): BackendStatus {
  return _backendStatus;
}

export function onBackendStatusChange(listener: (status: BackendStatus) => void): () => void {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}

function updateBackendStatus(status: BackendStatus): void {
  const prev = _backendStatus;
  _backendStatus = status;
  _lastStatusCheck = Date.now();
  if (prev !== status) {
    statusListeners.forEach((fn) => fn(status));
  }
}

/** Check if we should attempt a status check */
function shouldCheckStatus(): boolean {
  return Date.now() - _lastStatusCheck > STATUS_CHECK_INTERVAL;
}

// ── Core Fetch Helper ─────────────────────────────────────────────

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retryCount = 0,
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
  const isGetRequest = !options.method || options.method === 'GET';

  // For GET requests, try cache first when backend might be down
  if (isGetRequest && _backendStatus === 'offline') {
    const cached = getCachedData<T>(path);
    if (cached) {
      return cached;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal ?? controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let problem: ProblemDetail | undefined;
      try {
        problem = await response.json();
      } catch {
        // Non-JSON error response
      }

      const error = new ApiError(response.status, problem);

      // Retry on transient server errors
      if (error.isRetryable && retryCount < MAX_RETRIES) {
        const delay = RETRY_BASE_DELAY * Math.pow(2, retryCount);
        console.warn(`[API] Retrying ${path} (attempt ${retryCount + 1}/${MAX_RETRIES}) after ${delay}ms`);
        await sleep(delay);
        return apiFetch<T>(path, options, retryCount + 1);
      }

      // Update backend status based on error
      if (error.category === 'server') {
        updateBackendStatus('degraded');
      } else if (error.category === 'auth' && response.status === 401) {
        // Token might be expired — but don't remove it automatically
        // Let the auth context handle that
      }

      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      updateBackendStatus('online');
      return undefined as T;
    }

    const data = await response.json() as T;

    // Cache successful GET responses
    if (isGetRequest) {
      setCachedData(path, data);
    }

    // Update backend status
    if (_backendStatus !== 'online') {
      updateBackendStatus('online');
    }

    return data;
  } catch (error) {
    // Handle network errors and timeouts
    if (error instanceof ApiError) throw error;

    const isTimeout = error instanceof DOMException && error.name === 'AbortError';
    const isNetwork = error instanceof TypeError && error.message.includes('fetch');

    if (isTimeout || isNetwork) {
      // Try cache on network failure
      if (isGetRequest) {
        const cached = getCachedData<T>(path);
        if (cached) {
          updateBackendStatus('offline');
          console.warn(`[API] Using cached data for ${path} (backend unavailable)`);
          return cached;
        }
      }

      // Retry on network failure
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_BASE_DELAY * Math.pow(2, retryCount);
        console.warn(`[API] Retrying ${path} (attempt ${retryCount + 1}/${MAX_RETRIES}) after ${delay}ms — ${isTimeout ? 'timeout' : 'network error'}`);
        await sleep(delay);
        return apiFetch<T>(path, options, retryCount + 1);
      }

      updateBackendStatus('offline');

      throw new ApiError(
        isTimeout ? 504 : 502,
        {
          status: isTimeout ? 504 : 502,
          title: isTimeout ? 'Gateway Timeout' : 'Network Error',
          detail: isTimeout
            ? 'الخادم يستغرق وقتاً طويلاً للرد'
            : 'لا يمكن الاتصال بالخادم حالياً',
        },
        isTimeout ? 'timeout' : 'network',
      );
    }

    throw error;
  }
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

let healthCheckPromise: Promise<{ status: string }> | null = null;

export async function checkBackendHealth(): Promise<{ status: string }> {
  // Debounce: don't fire multiple simultaneous health checks
  if (healthCheckPromise) return healthCheckPromise;

  healthCheckPromise = apiFetch<{ status: string }>('/api/auth/health')
    .then((result) => {
      // The health endpoint may return { status: "DOWN" } due to non-critical
      // subsystems (e.g., OTLP metrics), but the API endpoints still work fine.
      // If we got a response at all, the server is reachable and functional.
      // Set to 'online' unless the server explicitly reports UP status.
      if (result.status === 'UP') {
        updateBackendStatus('online');
      } else {
        // Server responds but reports DOWN — mark as 'degraded' not 'offline'
        // because the actual API endpoints work fine.
        updateBackendStatus('degraded');
      }
      return result;
    })
    .catch((error) => {
      if (_backendStatus !== 'offline') updateBackendStatus('offline');
      // Return a graceful fallback instead of throwing
      return { status: 'DOWN' };
    })
    .finally(() => {
      healthCheckPromise = null;
    });

  return healthCheckPromise;
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
