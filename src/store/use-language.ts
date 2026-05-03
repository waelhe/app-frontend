import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'ar' | 'en'

interface LanguageState {
  language: Language
  setLanguage: (lang: Language) => void
  t: (ar: string, en: string) => string
  isRTL: boolean
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'ar' as Language,
      setLanguage: (language: Language) => {
        set({ language, isRTL: language === 'ar' })
        // Dispatch custom event so LanguageContext can sync
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('language-change', { detail: { language } }))
        }
      },
      t: (ar: string, en: string) => {
        const lang = get().language
        return lang === 'ar' ? ar : en
      },
      isRTL: true,
    }),
    {
      name: 'nabd-language',
    }
  )
)
