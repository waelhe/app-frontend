/**
 * TypeScript types matching the Spring Boot 4.0.6 backend DTOs.
 * Based on waelhe/app-java-v3 latest code.
 */

// ── Common ────────────────────────────────────────────────────────

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ProblemDetail {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  instance?: string;
}

// ── Identity ──────────────────────────────────────────────────────

export type UserRole = 'CONSUMER' | 'PROVIDER' | 'ADMIN';

export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
  role?: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// ── Catalog ───────────────────────────────────────────────────────

export type ListingStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export interface ListingResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListingSummary {
  id: string;
  title: string;
  category: string;
  price: number;
  providerName: string;
}

export interface ProviderListingSummary {
  id: string;
  title: string;
  category: string;
  price: number;
  providerId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListingRequest {
  title: string;
  description?: string;
  category: string;
  priceCents: number;
}

export interface UpdateListingRequest {
  title: string;
  description?: string;
  category: string;
  priceCents: number;
}

// ── Booking ───────────────────────────────────────────────────────

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface BookingResponse {
  id: string;
  listingId: string;
  status: BookingStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingSummary {
  id: string;
  consumerId: string;
  providerId: string;
  listingId: string;
  status: string;
  priceCents: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  listingId: string;
  notes?: string;
}

// ── Payments ──────────────────────────────────────────────────────

export type PaymentIntentStatus = 'CREATED' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface PaymentIntentResponse {
  id: string;
  bookingId: string;
  amountCents: number;
  currency: string;
  status: PaymentIntentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentResponse {
  id: string;
  amountCents: number;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSummary {
  id: string;
  bookingId: string;
  consumerId: string;
  amountCents: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIntentRequest {
  bookingId: string;
  idempotencyKey?: string;
}

export interface ConfirmIntentRequest {
  externalId?: string;
}

// ── Messaging ─────────────────────────────────────────────────────

export interface ConversationResponse {
  id: string;
  bookingId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface CreateConversationRequest {
  bookingId: string;
}

export interface SendMessageRequest {
  content: string;
}

// ── Reviews ───────────────────────────────────────────────────────

export interface ReviewResponse {
  id: string;
  bookingId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating: number;
  comment?: string;
}

// ── Search ────────────────────────────────────────────────────────

export interface SearchParams {
  q?: string;
  category?: string;
  page?: number;
  size?: number;
}

// ── Navigation / App State ────────────────────────────────────────

export type AppView =
  | 'home'
  | 'market'
  | 'services'
  | 'directory'
  | 'emergency'
  | 'community'
  | 'dashboard'
  | 'listing-detail'
  | 'booking'
  | 'bookings-list'
  | 'messages'
  | 'conversation'
  | 'inbox'
  | 'search'
  | 'profile'
  | 'create-listing'
  | 'edit-listing'
  | 'favorites'
  | 'settings'
  | 'write-review';

export interface NavigationState {
  currentView: AppView;
  viewParams: Record<string, string>;
}
