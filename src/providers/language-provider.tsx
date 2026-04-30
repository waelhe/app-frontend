'use client'

import { useLanguage as useStoreLanguage } from '@/store/use-language'
import { LanguageProvider as ContextLanguageProvider } from '@/contexts/LanguageContext'
import { useEffect } from 'react'

/**
 * Combined LanguageProvider that:
 * 1. Provides the store-based language state (for Header/Footer/BottomNav)
 * 2. Provides the context-based LanguageProvider (for all other components)
 * 3. Syncs document attributes (dir, lang) with the store
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { language, isRTL } = useStoreLanguage()

  useEffect(() => {
    const html = document.documentElement
    html.lang = language
    html.dir = isRTL ? 'rtl' : 'ltr'
  }, [language, isRTL])

  return (
    <ContextLanguageProvider>
      {children}
    </ContextLanguageProvider>
  )
}
