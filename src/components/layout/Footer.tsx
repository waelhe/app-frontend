'use client'

import Link from 'next/link'
import { useLanguage } from '@/store/use-language'
import { Facebook, Instagram, Twitter, Globe } from 'lucide-react'

export function Footer() {
  const { t, language, setLanguage } = useLanguage()

  const aboutLinks = [
    { href: '/about', ar: 'عن نبض', en: 'About Nabd' },
    { href: '/careers', ar: 'وظائف', en: 'Careers' },
    { href: '/press', ar: 'الصحافة', en: 'Press' },
    { href: '/blog', ar: 'المدونة', en: 'Blog' },
  ]

  const discoverLinks = [
    { href: '/categories', ar: 'التصنيفات', en: 'Categories' },
    { href: '/popular', ar: 'الأكثر شعبية', en: 'Popular' },
    { href: '/reviews', ar: 'التقييمات', en: 'Reviews' },
    { href: '/offers', ar: 'العروض', en: 'Offers' },
  ]

  const businessLinks = [
    { href: '/claim-business', ar: 'ادّعِ نشاطك التجاري', en: 'Claim Your Business' },
    { href: '/advertise', ar: 'أعلن معنا', en: 'Advertise' },
    { href: '/business-support', ar: 'دعم الأعمال', en: 'Business Support' },
    { href: '/provider-signup', ar: 'سجّل كمزوّد', en: 'Register as Provider' },
  ]

  const directoryLinks = [
    { href: '/directory/electricians', ar: 'كهربائيون', en: 'Electricians' },
    { href: '/directory/plumbers', ar: 'سباكون', en: 'Plumbers' },
    { href: '/directory/cleaners', ar: 'شركات تنظيف', en: 'Cleaning Services' },
    { href: '/directory/painters', ar: 'دهّانون', en: 'Painters' },
  ]

  const cityLinks = [
    { href: '/city/damascus', ar: 'دمشق', en: 'Damascus' },
    { href: '/city/aleppo', ar: 'حلب', en: 'Aleppo' },
    { href: '/city/homs', ar: 'حمص', en: 'Homs' },
    { href: '/city/latakia', ar: 'اللاذقية', en: 'Latakia' },
  ]

  const socialLinks = [
    { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
    { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
    { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
  ]

  const countries = [
    { code: 'SY', ar: 'سوريا', en: 'Syria' },
    { code: 'LB', ar: 'لبنان', en: 'Lebanon' },
    { code: 'JO', ar: 'الأردن', en: 'Jordan' },
  ]

  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Logo and social */}
        <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-red-500">نبض</span>
            <span className="text-sm font-medium text-gray-400">Nabd</span>
          </div>
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-red-500 hover:text-white"
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Links grid - 5 columns */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {/* About */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-gray-900">
              {t('عن نبض', 'About')}
            </h3>
            <ul className="flex flex-col gap-2">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-red-500"
                  >
                    {language === 'ar' ? link.ar : link.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-gray-900">
              {t('اكتشف', 'Discover')}
            </h3>
            <ul className="flex flex-col gap-2">
              {discoverLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-red-500"
                  >
                    {language === 'ar' ? link.ar : link.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Business */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-gray-900">
              {t('للأعمال', 'For Business')}
            </h3>
            <ul className="flex flex-col gap-2">
              {businessLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-red-500"
                  >
                    {language === 'ar' ? link.ar : link.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Directory */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-gray-900">
              {t('الدليل', 'Directory')}
            </h3>
            <ul className="flex flex-col gap-2">
              {directoryLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-red-500"
                  >
                    {language === 'ar' ? link.ar : link.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-gray-900">
              {t('المدن', 'Cities')}
            </h3>
            <ul className="flex flex-col gap-2">
              {cityLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-red-500"
                  >
                    {language === 'ar' ? link.ar : link.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Language and Country selectors */}
        <div className="mt-8 flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* Language selector */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-red-300 hover:text-red-600"
            >
              <Globe className="h-4 w-4" />
              {language === 'ar' ? 'English' : 'عربي'}
            </button>

            {/* Country selector */}
            <select
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-red-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              aria-label={t('اختر الدولة', 'Select Country')}
              defaultValue="SY"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {language === 'ar' ? country.ar : country.en}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-gray-500">
            {t(
              '© ٢٠٢٥ نبض. جميع الحقوق محفوظة.',
              '© 2025 Nabd. All rights reserved.'
            )}
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 bg-gray-100">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-3 sm:flex-row">
          <p className="text-xs text-gray-500">
            {t(
              '© ٢٠٢٥ نبض - سوق الخدمات المحلية',
              '© 2025 Nabd - Local Services Marketplace'
            )}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-xs text-gray-500 transition-colors hover:text-red-500"
            >
              {t('سياسة الخصوصية', 'Privacy Policy')}
            </Link>
            <Link
              href="/terms"
              className="text-xs text-gray-500 transition-colors hover:text-red-500"
            >
              {t('شروط الاستخدام', 'Terms of Service')}
            </Link>
            <Link
              href="/accessibility"
              className="text-xs text-gray-500 transition-colors hover:text-red-500"
            >
              {t('إمكانية الوصول', 'Accessibility')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
