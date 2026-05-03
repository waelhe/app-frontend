'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/stores/languageStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import {
  Activity,
  Facebook,
  Instagram,
  Twitter,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Send,
  CreditCard,
  Shield,
  Globe,
  ChevronLeft,
  Smartphone,
  Apple,
} from 'lucide-react'

export function Footer() {
  const { t, language, setLanguage, isRTL } = useLanguage()
  const { navigate } = useNavigationStore()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  const socialLinks = [
    { href: 'https://twitter.com', icon: Twitter, label: 'Twitter', color: 'hover:bg-sky-500' },
    { href: 'https://instagram.com', icon: Instagram, label: 'Instagram', color: 'hover:bg-pink-500' },
    { href: 'https://facebook.com', icon: Facebook, label: 'Facebook', color: 'hover:bg-blue-600' },
    { href: 'https://wa.me/', icon: MessageCircle, label: 'WhatsApp', color: 'hover:bg-emerald-500' },
  ]

  const quickLinks = [
    { ar: 'الرئيسية', en: 'Home', view: 'home' as const },
    { ar: 'السوق', en: 'Market', view: 'market' as const },
    { ar: 'الخدمات', en: 'Services', view: 'services' as const },
    { ar: 'الدليل', en: 'Directory', view: 'directory' as const },
    { ar: 'المجتمع', en: 'Community', view: 'community' as const },
  ]

  const serviceLinks = [
    { ar: 'عقارات', en: 'Real Estate' },
    { ar: 'سيارات', en: 'Cars' },
    { ar: 'إلكترونيات', en: 'Electronics' },
    { ar: 'وظائف', en: 'Jobs' },
    { ar: 'أثاث', en: 'Furniture' },
  ]

  const contactInfo = [
    { icon: Mail, ar: 'info@nabd.app', en: 'info@nabd.app', href: 'mailto:info@nabd.app' },
    { icon: Phone, ar: '+963 11 123 4567', en: '+963 11 123 4567', href: 'tel:+963111234567' },
    { icon: MapPin, ar: 'دمشق، سوريا', en: 'Damascus, Syria', href: '#' },
  ]

  const paymentMethods = [
    { label: 'Visa', icon: CreditCard },
    { label: 'Mastercard', icon: CreditCard },
    { label: 'Apple Pay', icon: Apple },
    { label: 'Mada', icon: Smartphone },
  ]

  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-900 text-gray-300">
      {/* Top Section - 4 columns desktop, 2 tablet, stacked mobile */}
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About نبض */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-6 w-6 text-red-500" />
              <span className="bg-gradient-to-l from-red-400 to-red-600 bg-clip-text text-2xl font-bold text-transparent">
                نبض
              </span>
              <span className="text-xs font-medium text-gray-500">Nabd</span>
            </div>
            <p className="mb-5 text-sm leading-relaxed text-gray-400">
              {t(
                'نبض هو سوق الخدمات المحلية الأول. نوفر لك منصة موثوقة للبحث عن الخدمات والحجز الآمن والتواصل المباشر مع مزوّدي الخدمات في منطقتك.',
                'Nabd is the premier local services marketplace. We provide a trusted platform for finding services, secure booking, and direct communication with service providers in your area.'
              )}
            </p>
            {/* Social links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-colors hover:text-white ${social.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.a>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
              <ChevronLeft className="h-4 w-4 text-red-500" />
              {t('روابط سريعة', 'Quick Links')}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <li key={link.en}>
                  <button
                    onClick={() => navigate(link.view)}
                    className="text-sm text-gray-400 transition-colors hover:text-red-400"
                  >
                    {t(link.ar, link.en)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
              <ChevronLeft className="h-4 w-4 text-red-500" />
              {t('خدمات', 'Services')}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {serviceLinks.map((link) => (
                <li key={link.en}>
                  <button
                    onClick={() => navigate('market')}
                    className="text-sm text-gray-400 transition-colors hover:text-red-400"
                  >
                    {t(link.ar, link.en)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
              <ChevronLeft className="h-4 w-4 text-red-500" />
              {t('تواصل معنا', 'Contact Us')}
            </h3>
            <ul className="mb-4 flex flex-col gap-3">
              {contactInfo.map((info, idx) => {
                const Icon = info.icon
                return (
                  <li key={idx}>
                    <a
                      href={info.href}
                      className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-red-400"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-red-500" />
                      <span>{t(info.ar, info.en)}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
            <Button
              size="sm"
              className="bg-gradient-to-l from-red-500 to-red-600 text-xs shadow-md shadow-red-500/20 hover:from-red-600 hover:to-red-700"
              onClick={() => navigate('inbox')}
            >
              <Send className="me-1.5 h-3.5 w-3.5" />
              {t('أرسل رسالة', 'Send Message')}
            </Button>
          </div>
        </div>
      </div>

      {/* Middle Section - Newsletter */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
            {/* Newsletter */}
            <div className="w-full max-w-md">
              <h4 className="mb-2 text-sm font-bold text-white">
                {t('اشترك في نشرتنا البريدية', 'Subscribe to our newsletter')}
              </h4>
              <p className="mb-3 text-xs text-gray-400">
                {t(
                  'احصل على آخر العروض والأخبار مباشرة في بريدك الإلكتروني',
                  'Get the latest deals and news straight to your inbox'
                )}
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('بريدك الإلكتروني', 'Your email address')}
                  className="h-9 flex-1 border-gray-700 bg-gray-800 text-sm text-white placeholder:text-gray-500 focus-visible:ring-red-500"
                  dir="ltr"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 bg-gradient-to-l from-red-500 to-red-600 px-4 hover:from-red-600 hover:to-red-700"
                >
                  {subscribed ? (
                    <Shield className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              {subscribed && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-xs text-emerald-400"
                >
                  {t('تم الاشتراك بنجاح!', 'Subscribed successfully!')}
                </motion.p>
              )}
            </div>

            {/* App Download Badges */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-gray-400">
                  {t('حمّل التطبيق', 'Download the app')}
                </p>
                <div className="flex gap-2">
                  {/* App Store badge placeholder */}
                  <div className="flex h-10 w-28 items-center justify-center gap-1.5 rounded-lg bg-gray-800 text-xs text-gray-400 transition-colors hover:bg-gray-700">
                    <Apple className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-[8px] leading-none">Download on the</span>
                      <span className="text-[11px] font-semibold leading-tight">App Store</span>
                    </div>
                  </div>
                  {/* Google Play badge placeholder */}
                  <div className="flex h-10 w-28 items-center justify-center gap-1.5 rounded-lg bg-gray-800 text-xs text-gray-400 transition-colors hover:bg-gray-700">
                    <Smartphone className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-[8px] leading-none">GET IT ON</span>
                      <span className="text-[11px] font-semibold leading-tight">Google Play</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            {/* Copyright */}
            <p className="text-xs text-gray-500">
              © 2024 {t('نبض. جميع الحقوق محفوظة', 'Nabd. All rights reserved.')}
            </p>

            {/* Payment methods */}
            <div className="flex items-center gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                return (
                  <div
                    key={method.label}
                    className="flex h-7 w-12 items-center justify-center rounded bg-gray-800"
                    title={method.label}
                  >
                    <Icon className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                )
              })}
            </div>

            {/* Language toggle + Links */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="flex items-center gap-1.5 rounded-lg border border-gray-700 px-2.5 py-1 text-xs text-gray-400 transition-colors hover:border-red-500/50 hover:text-red-400"
              >
                <Globe className="h-3.5 w-3.5" />
                {language === 'ar' ? 'English' : 'عربي'}
              </button>
              <Link
                href="/privacy"
                className="text-xs text-gray-500 transition-colors hover:text-red-400"
              >
                {t('سياسة الخصوصية', 'Privacy Policy')}
              </Link>
              <span className="text-gray-700">•</span>
              <Link
                href="/terms"
                className="text-xs text-gray-500 transition-colors hover:text-red-400"
              >
                {t('شروط الاستخدام', 'Terms of Service')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
