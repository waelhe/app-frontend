/**
 * Cart Store — Zustand store for shopping cart management.
 * Merges functionality from CartContext and use-cart into a single store.
 * Manages cart items, quantities, totals, and drawer state.
 * Persists to localStorage and provides toast notifications.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  serviceId: string;
  name: string;
  nameEn: string;
  title: string;
  price: number;
  currency: string;
  quantity: number;
  image?: string;
  providerName: string;
  providerNameEn: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (open: boolean) => void;
  cartCount: () => number;
  totalPrice: () => number;
}

// ── Store ─────────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item: CartItem) =>
        set((state) => {
          const existing = state.items.find((i) => i.serviceId === item.serviceId);
          if (existing) {
            toast.success(`Updated quantity for "${item.title || item.name}"`);
            return {
              items: state.items.map((i) =>
                i.serviceId === item.serviceId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          toast.success(`Added "${item.title || item.name}" to cart`);
          return { items: [...state.items, item] };
        }),

      removeItem: (id: string) =>
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (item) {
            toast.info(`Removed "${item.title || item.name}" from cart`);
          }
          return { items: state.items.filter((i) => i.id !== id) };
        }),

      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
        toast.info('Cart cleared');
      },

      setIsOpen: (open: boolean) => set({ isOpen: open }),

      cartCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'nabd-cart',
    }
  )
);

// ── Convenience alias ─────────────────────────────────────────────

/** Alias for useCartStore — use either name interchangeably */
export const useCart = useCartStore;
