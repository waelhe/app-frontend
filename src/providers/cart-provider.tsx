'use client'

import { useCart as useStoreCart } from '@/store/use-cart'
import { CartProvider as ContextCartProvider } from '@/contexts/CartContext'

/**
 * Combined CartProvider that:
 * 1. Initializes the store-based cart
 * 2. Provides the context-based CartProvider (for components using useCart from contexts)
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  useStoreCart()
  return (
    <ContextCartProvider>
      {children}
    </ContextCartProvider>
  )
}
