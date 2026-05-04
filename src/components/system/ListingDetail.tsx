'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Heart,
  Share2,
  Shield,
  Clock,
  Star,
  Building2,
  Car,
  Smartphone,
  Briefcase,
  HardHat,
  Sofa,
  Phone,
  MessageSquare,
  Flag,
  Eye,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  UtensilsCrossed,
  GraduationCap,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Send,
  ExternalLink,
  ThumbsUp,
  Zap,
  Maximize2,
  X,
  ShieldCheck,
  Navigation,
  HelpCircle,
  AlertTriangle,
  Wifi,
  Wind,
  Car as CarIcon,
  UtensilsCrossed as Kitchen,
  Tv,
  Waves,
  ArrowUpRight,
  Home,
  Users,
  Award,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Snowflake,
  TreePalm,
  Lock,
  Bed,
  Bath,
  Fuel,
  Gauge,
  Palette,
  Cog,
  Sun,
  Monitor,
  Headphones,
  Battery,
  Printer,
  Wrench,
  Hammer,
  PaintBucket,
  ShieldAlert,
  Radio,
  Camera,
  Globe,
  Baby,
  Dumbbell,
  Coffee,
  Wine,
  ShoppingBag,
  BookOpen,
  Stethoscope as Medical,
  Pill,
  Thermometer,
} from 'lucide-react';
import { useLanguage } from '@/stores/languageStore';
import { useAuth } from '@/stores/authStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { useFavorites } from '@/stores/favoritesStore';
import { useRecentlyViewed } from '@/stores/recentlyViewedStore';
import { useListing, useReviews, useListingsByCategory } from '@/hooks/useApi';
import type { ListingResponse, ReviewResponse, ListingSummary } from '@/lib/types';
import { ListingCard, getListingImages } from '@/components/ui/ListingCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// ═══════════════════════════════════════════════════════════════════════
// Category Config
// ═══════════════════════════════════════════════════════════════════════

const categoryIcons: Record<string, React.ReactNode> = {
  'real-estate': <Building2 className="h-8 w-8" />,
  electronics: <Smartphone className="h-8 w-8" />,
  cars: <Car className="h-8 w-8" />,
  services: <Briefcase className="h-8 w-8" />,
  jobs: <HardHat className="h-8 w-8" />,
  furniture: <Sofa className="h-8 w-8" />,
  medical: <Stethoscope className="h-8 w-8" />,
  dining: <UtensilsCrossed className="h-8 w-8" />,
  education: <GraduationCap className="h-8 w-8" />,
  beauty: <Sparkles className="h-8 w-8" />,
};

const categoryGradients: Record<string, string> = {
  'real-estate': 'from-amber-400 to-orange-500',
  electronics: 'from-blue-400 to-cyan-500',
  cars: 'from-gray-400 to-slate-600',
  services: 'from-emerald-400 to-teal-500',
  jobs: 'from-purple-400 to-violet-500',
  furniture: 'from-rose-400 to-pink-500',
  medical: 'from-red-400 to-rose-500',
  dining: 'from-orange-400 to-amber-500',
  education: 'from-indigo-400 to-blue-500',
  beauty: 'from-pink-400 to-fuchsia-500',
};

const categoryLabelsAr: Record<string, string> = {
  'real-estate': 'عقارات',
  electronics: 'إلكترونيات',
  cars: 'سيارات',
  services: 'خدمات',
  jobs: 'وظائف',
  furniture: 'أثاث',
  medical: 'طبي',
  dining: 'مطاعم',
  education: 'تعليم',
  beauty: 'جمال وعناية',
};

const categoryLabelsEn: Record<string, string> = {
  'real-estate': 'Real Estate',
  electronics: 'Electronics',
  cars: 'Cars',
  services: 'Services',
  jobs: 'Jobs',
  furniture: 'Furniture',
  medical: 'Medical',
  dining: 'Dining',
  education: 'Education',
  beauty: 'Beauty & Care',
};

const categoriesWithImages = new Set([
  'cars', 'electronics', 'furniture', 'beauty', 'jobs',
  'services', 'real-estate', 'education', 'dining',
]);

function getCategoryImagePath(category: string): string | null {
  if (categoriesWithImages.has(category)) {
    return `/images/categories/${category}.png`;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════
// Report reasons
// ═══════════════════════════════════════════════════════════════════════

const reportReasons = [
  { value: 'inappropriate', labelAr: 'محتوى غير لائق', labelEn: 'Inappropriate Content' },
  { value: 'fraud', labelAr: 'احتيال', labelEn: 'Fraud / Scam' },
  { value: 'misleading', labelAr: 'مضلل', labelEn: 'Misleading' },
  { value: 'duplicate', labelAr: 'مكرر', labelEn: 'Duplicate' },
  { value: 'other', labelAr: 'أخرى', labelEn: 'Other' },
];

// ═══════════════════════════════════════════════════════════════════════
// Category-specific expanded specs
// ═══════════════════════════════════════════════════════════════════════

function getCategorySpecs(category: string, listing: ListingResponse, isRTL: boolean) {
  const specs: Array<{ label: string; value: string }> = [];

  switch (category) {
    case 'real-estate':
      specs.push(
        { label: isRTL ? 'الغرف' : 'Rooms', value: isRTL ? '٣ غرف' : '3 Rooms' },
        { label: isRTL ? 'المساحة' : 'Area', value: '150 m²' },
        { label: isRTL ? 'الطابق' : 'Floor', value: isRTL ? 'الثالث' : '3rd' },
        { label: isRTL ? 'التأثيث' : 'Furnishing', value: isRTL ? 'مؤثث بالكامل' : 'Fully Furnished' },
        { label: isRTL ? 'عمر المبنى' : 'Building Age', value: isRTL ? '٥ سنوات' : '5 Years' },
        { label: isRTL ? 'الاتجاه' : 'Orientation', value: isRTL ? 'شرقي' : 'East-facing' },
        { label: isRTL ? 'شرفة' : 'Balcony', value: isRTL ? 'نعم - شرفة كبيرة' : 'Yes - Large Balcony' },
        { label: isRTL ? 'مصعد' : 'Elevator', value: isRTL ? 'نعم' : 'Yes' },
        { label: isRTL ? 'موقف سيارات' : 'Parking', value: isRTL ? 'موقف خاص' : 'Private Parking' },
        { label: isRTL ? 'الحمامات' : 'Bathrooms', value: isRTL ? '٢' : '2' },
      );
      break;
    case 'cars':
      specs.push(
        { label: isRTL ? 'الماركة' : 'Make', value: isRTL ? 'تويوتا' : 'Toyota' },
        { label: isRTL ? 'الموديل' : 'Model', value: 'Camry' },
        { label: isRTL ? 'السنة' : 'Year', value: '2023' },
        { label: isRTL ? 'الممشى' : 'Mileage', value: '25,000 km' },
        { label: isRTL ? 'الحالة' : 'Condition', value: isRTL ? 'مستعمل ممتاز' : 'Used - Excellent' },
        { label: isRTL ? 'ناقل الحركة' : 'Transmission', value: isRTL ? 'أوتوماتيك' : 'Automatic' },
        { label: isRTL ? 'نوع الوقود' : 'Fuel Type', value: isRTL ? 'بنزين' : 'Gasoline' },
        { label: isRTL ? 'اللون' : 'Color', value: isRTL ? 'أبيض لؤلؤي' : 'Pearl White' },
        { label: isRTL ? 'قوة المحرك' : 'Engine Power', value: '203 HP' },
      );
      break;
    case 'electronics':
      specs.push(
        { label: isRTL ? 'الماركة' : 'Brand', value: isRTL ? 'سامسونج' : 'Samsung' },
        { label: isRTL ? 'الحالة' : 'Condition', value: isRTL ? 'جديد - مغلف' : 'New - Sealed' },
        { label: isRTL ? 'الضمان' : 'Warranty', value: isRTL ? 'سنة واحدة' : '1 Year' },
        { label: isRTL ? 'رقم الموديل' : 'Model Number', value: 'SM-S928B' },
        { label: isRTL ? 'التخزين' : 'Storage', value: '256 GB' },
        { label: isRTL ? 'الشاشة' : 'Screen', value: '6.8" Dynamic AMOLED' },
      );
      break;
    case 'services':
      specs.push(
        { label: isRTL ? 'نوع الخدمة' : 'Service Type', value: isRTL ? 'احترافي' : 'Professional' },
        { label: isRTL ? 'المدة' : 'Duration', value: isRTL ? '٢-٣ ساعات' : '2-3 Hours' },
        { label: isRTL ? 'التوفر' : 'Availability', value: isRTL ? 'يومياً ٩ص-٦م' : 'Daily 9AM-6PM' },
        { label: isRTL ? 'سنوات الخبرة' : 'Experience', value: isRTL ? '٨ سنوات' : '8 Years' },
        { label: isRTL ? 'الترخيص' : 'Licensed', value: isRTL ? 'مرخص ومعتمد' : 'Licensed & Certified' },
      );
      break;
    case 'jobs':
      specs.push(
        { label: isRTL ? 'نوع الوظيفة' : 'Job Type', value: isRTL ? 'دوام كامل' : 'Full-time' },
        { label: isRTL ? 'الراتب' : 'Salary Range', value: isRTL ? '٥,٠٠٠ - ٨,٠٠٠ ر.س' : '5,000 - 8,000 SAR' },
        { label: isRTL ? 'المتطلبات' : 'Requirements', value: isRTL ? 'خبرة ٣ سنوات' : '3 years exp.' },
        { label: isRTL ? 'المزايا' : 'Benefits', value: isRTL ? 'تأمين صحي + نقل' : 'Health Insurance + Transport' },
        { label: isRTL ? 'مكان العمل' : 'Workplace', value: isRTL ? 'مكتب - قدسيا' : 'Office - Qudsaya' },
      );
      break;
    default:
      break;
  }

  // Always add generic specs
  specs.push(
    { label: isRTL ? 'الفئة' : 'Category', value: isRTL ? (categoryLabelsAr[category] ?? category) : (categoryLabelsEn[category] ?? category) },
    { label: isRTL ? 'السعر' : 'Price', value: `${listing.price.toLocaleString(isRTL ? 'ar-SA' : 'en-US')} ${listing.currency === 'SAR' ? 'ر.س' : listing.currency}` },
    { label: isRTL ? 'تاريخ النشر' : 'Date Posted', value: new Date(listing.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
    { label: isRTL ? 'الموقع' : 'Location', value: isRTL ? 'قدسيا، دمشق' : 'Qudsaya, Damascus' },
  );

  return specs;
}

// ═══════════════════════════════════════════════════════════════════════
// Category-specific highlights/features
// ═══════════════════════════════════════════════════════════════════════

interface FeatureItem {
  icon: React.ElementType;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
}

function getCategoryHighlights(category: string): FeatureItem[] {
  switch (category) {
    case 'real-estate':
      return [
        { icon: Kitchen, titleAr: 'مطبخ مجهز', titleEn: 'Equipped Kitchen', descAr: 'مطبخ كامل مع أحدث الأجهزة', descEn: 'Full kitchen with latest appliances' },
        { icon: Wifi, titleAr: 'واي فاي', titleEn: 'WiFi', descAr: 'إنترنت سريع مجاني', descEn: 'Free high-speed internet' },
        { icon: CarIcon, titleAr: 'موقف سيارات', titleEn: 'Parking', descAr: 'موقف خاص وآمن', descEn: 'Private secure parking' },
        { icon: Snowflake, titleAr: 'تكييف مركزي', titleEn: 'Central AC', descAr: 'تكييف وتدفئة مركزية', descEn: 'Central AC & heating' },
        { icon: ShieldCheck, titleAr: 'أمن ٢٤ ساعة', titleEn: '24/7 Security', descAr: 'حراسة ونظام مراقبة', descEn: 'Guards & surveillance system' },
        { icon: TreePalm, titleAr: 'حديقة خاصة', titleEn: 'Private Garden', descAr: 'حديقة خضراء واسعة', descEn: 'Spacious green garden' },
      ];
    case 'cars':
      return [
        { icon: ShieldCheck, titleAr: 'وسائد هوائية', titleEn: 'Airbags', descAr: 'نظام وسائد هوائية شامل', descEn: 'Comprehensive airbag system' },
        { icon: Camera, titleAr: 'كاميرا خلفية', titleEn: 'Rear Camera', descAr: 'كاميرا ركن خلفية', descEn: 'Rear parking camera' },
        { icon: Radio, titleAr: 'بلوتوث', titleEn: 'Bluetooth', descAr: 'اتصال بلوتوث و Apple CarPlay', descEn: 'Bluetooth & Apple CarPlay' },
        { icon: Sun, titleAr: 'سقف زجاجي', titleEn: 'Sunroof', descAr: 'سقف زجاجي بانورامي', descEn: 'Panoramic sunroof' },
        { icon: Cog, titleAr: 'مثبت سرعة', titleEn: 'Cruise Control', descAr: 'مثبت سرعة ذكي', descEn: 'Smart cruise control' },
        { icon: Fuel, titleAr: 'اقتصادي بالوقود', titleEn: 'Fuel Efficient', descAr: 'استهلاك منخفض للوقود', descEn: 'Low fuel consumption' },
      ];
    case 'electronics':
      return [
        { icon: ShieldCheck, titleAr: 'ضمان شامل', titleEn: 'Full Warranty', descAr: 'ضمان لمدة سنة كاملة', descEn: 'One year full warranty' },
        { icon: Battery, titleAr: 'بطارية طويلة', titleEn: 'Long Battery', descAr: 'بطارية تدوم طوال اليوم', descEn: 'All-day battery life' },
        { icon: Monitor, titleAr: 'شاشة عالية الدقة', titleEn: 'HD Display', descAr: 'شاشة بدقة عالية', descEn: 'High resolution display' },
        { icon: Globe, titleAr: 'اتصال 5G', titleEn: '5G Connectivity', descAr: 'دعم شبكات الجيل الخامس', descEn: '5G network support' },
      ];
    case 'services':
      return [
        { icon: Award, titleAr: 'معتمد ومرخص', titleEn: 'Licensed', descAr: 'ترخيص رسمي واعتماد', descEn: 'Official license & certification' },
        { icon: Clock, titleAr: 'استجابة سريعة', titleEn: 'Fast Response', descAr: 'رد خلال ساعة واحدة', descEn: 'Response within one hour' },
        { icon: Users, titleAr: 'فريق محترف', titleEn: 'Professional Team', descAr: 'فريق ذو خبرة عالية', descEn: 'Highly experienced team' },
        { icon: ShieldCheck, titleAr: 'ضمان الخدمة', titleEn: 'Service Guarantee', descAr: 'ضمان ٣٠ يوم على الخدمة', descEn: '30-day service guarantee' },
      ];
    case 'jobs':
      return [
        { icon: Briefcase, titleAr: 'بيئة عمل ممتازة', titleEn: 'Great Workplace', descAr: 'مكاتب حديثة ومريحة', descEn: 'Modern comfortable offices' },
        { icon: Heart, titleAr: 'تأمين صحي', titleEn: 'Health Insurance', descAr: 'تأمين صحي شامل', descEn: 'Comprehensive health insurance' },
        { icon: GraduationCap, titleAr: 'تدريب وتطوير', titleEn: 'Training', descAr: 'برامج تدريب مستمرة', descEn: 'Ongoing training programs' },
        { icon: Clock, titleAr: 'ساعات مرنة', titleEn: 'Flexible Hours', descAr: 'ساعات عمل مرنة', descEn: 'Flexible working hours' },
      ];
    default:
      return [
        { icon: CheckCircle2, titleAr: 'جودة مضمونة', titleEn: 'Quality Guaranteed', descAr: 'منتج/خدمة عالية الجودة', descEn: 'High quality product/service' },
        { icon: ShieldCheck, titleAr: 'موثوق', titleEn: 'Trusted', descAr: 'بائع موثوق ومعتمد', descEn: 'Trusted & verified seller' },
        { icon: Clock, titleAr: 'استجابة سريعة', titleEn: 'Quick Response', descAr: 'رد سريع على الاستفسارات', descEn: 'Fast response to inquiries' },
        { icon: MapPin, titleAr: 'موقع مركزي', titleEn: 'Central Location', descAr: 'موقع سهل الوصول', descEn: 'Easy to reach location' },
      ];
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Category-specific amenities
// ═══════════════════════════════════════════════════════════════════════

interface AmenityItem {
  icon: React.ElementType;
  labelAr: string;
  labelEn: string;
}

function getCategoryAmenities(category: string): AmenityItem[] {
  switch (category) {
    case 'real-estate':
      return [
        { icon: Wifi, labelAr: 'واي فاي', labelEn: 'WiFi' },
        { icon: Snowflake, labelAr: 'تكييف', labelEn: 'AC' },
        { icon: CarIcon, labelAr: 'موقف سيارات', labelEn: 'Parking' },
        { icon: Kitchen, labelAr: 'مطبخ مجهز', labelEn: 'Kitchen' },
        { icon: Tv, labelAr: 'تلفاز', labelEn: 'TV' },
        { icon: Waves, labelAr: 'غسالة', labelEn: 'Washer' },
        { icon: TreePalm, labelAr: 'حديقة', labelEn: 'Garden' },
        { icon: ArrowUpRight, labelAr: 'مصعد', labelEn: 'Elevator' },
        { icon: Wind, labelAr: 'تدفئة', labelEn: 'Heating' },
        { icon: Coffee, labelAr: 'شرفة', labelEn: 'Balcony' },
        { icon: Lock, labelAr: 'أمن', labelEn: 'Security' },
        { icon: Dumbbell, labelAr: 'صالة رياضية', labelEn: 'Gym' },
      ];
    case 'cars':
      return [
        { icon: ShieldCheck, labelAr: 'وسائد هوائية', labelEn: 'Airbags' },
        { icon: Shield, labelAr: 'ABS', labelEn: 'ABS' },
        { icon: Camera, labelAr: 'كاميرا خلفية', labelEn: 'Rear Camera' },
        { icon: Navigation, labelAr: 'نظام ملاحة', labelEn: 'Navigation' },
        { icon: Radio, labelAr: 'بلوتوث', labelEn: 'Bluetooth' },
        { icon: Sun, labelAr: 'سقف زجاجي', labelEn: 'Sunroof' },
        { icon: Sofa, labelAr: 'مقاعد جلد', labelEn: 'Leather Seats' },
        { icon: Gauge, labelAr: 'مثبت سرعة', labelEn: 'Cruise Control' },
      ];
    case 'electronics':
      return [
        { icon: Battery, labelAr: 'بطارية طويلة', labelEn: 'Long Battery' },
        { icon: Monitor, labelAr: 'شاشة عالية الدقة', labelEn: 'HD Display' },
        { icon: Wifi, labelAr: 'واي فاي', labelEn: 'WiFi' },
        { icon: Camera, labelAr: 'كاميرا متطورة', labelEn: 'Advanced Camera' },
        { icon: Globe, labelAr: '5G', labelEn: '5G' },
        { icon: Headphones, labelAr: 'سماعات', labelEn: 'Headphones' },
      ];
    default:
      return [
        { icon: Clock, labelAr: 'متاح يومياً', labelEn: 'Available Daily' },
        { icon: Phone, labelAr: 'دعم هاتفي', labelEn: 'Phone Support' },
        { icon: ShieldCheck, labelAr: 'موثوق', labelEn: 'Verified' },
        { icon: MapPin, labelAr: 'موقع مركزي', labelEn: 'Central Location' },
        { icon: Wifi, labelAr: 'واي فاي', labelEn: 'WiFi' },
        { icon: CarIcon, labelAr: 'موقف سيارات', labelEn: 'Parking' },
      ];
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Simulated review data
// ═══════════════════════════════════════════════════════════════════════

const simulatedReviews = [
  { id: 'sr1', nameAr: 'أحمد محمد', nameEn: 'Ahmed M.', rating: 5, commentAr: 'تجربة ممتازة! المكان نظيف ومريح جداً. أنصح به بشدة.', commentEn: 'Excellent experience! Very clean and comfortable. Highly recommended.', date: '2025-01-20', initials: 'أم' },
  { id: 'sr2', nameAr: 'سارة خالد', nameEn: 'Sara K.', rating: 4, commentAr: 'مكان لطيف والخدمة جيدة. كان هناك بعض التأخير لكن بشكل عام تجربة إيجابية.', commentEn: 'Nice place and good service. There was some delay but overall positive.', date: '2025-01-15', initials: 'سخ' },
  { id: 'sr3', nameAr: 'عمر حسن', nameEn: 'Omar H.', rating: 5, commentAr: 'من أفضل الأماكن التي زرتها. الخدمة ممتازة والأسعار معقولة.', commentEn: 'One of the best places I visited. Excellent service and reasonable prices.', date: '2025-01-10', initials: 'عح' },
  { id: 'sr4', nameAr: 'ليلى عبدالله', nameEn: 'Layla A.', rating: 3, commentAr: 'مكان جيد لكن يحتاج بعض التحسينات. التواصل كان صعباً قليلاً.', commentEn: 'Good place but needs some improvements. Communication was a bit difficult.', date: '2025-01-05', initials: 'لع' },
  { id: 'sr5', nameAr: 'يوسف إبراهيم', nameEn: 'Youssef I.', rating: 4, commentAr: 'تجربة جيدة عموماً. الموقع ممتاز والخدمة سريعة.', commentEn: 'Good experience overall. Great location and fast service.', date: '2024-12-28', initials: 'يإ' },
];

// ═══════════════════════════════════════════════════════════════════════
// Simulated host data
// ═══════════════════════════════════════════════════════════════════════

function getHostData(listingId: string, isRTL: boolean) {
  const hash = listingId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const namesAr = ['أبو أحمد', 'أم يوسف', 'سعيد الحسن', 'فاطمة الزهراء', 'خالد العلي'];
  const namesEn = ['Abu Ahmad', 'Om Youssef', 'Saeed Al-Hassan', 'Fatima Al-Zahra', 'Khaled Al-Ali'];
  const idx = hash % namesAr.length;
  return {
    nameAr: namesAr[idx],
    nameEn: namesEn[idx],
    initials: isRTL ? namesAr[idx].split(' ').map(w => w[0]).join('').slice(0, 2) : namesEn[idx].split(' ').map(w => w[0]).join('').slice(0, 2),
    responseRate: 95 + (hash % 5),
    responseTimeAr: 'خلال ساعة',
    responseTimeEn: 'Within an hour',
    memberSince: '2023',
    isSuperhost: hash % 3 !== 0,
    listingCount: 2 + (hash % 6),
  };
}

// ═══════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : i - 0.5 <= rating
                ? 'fill-amber-200 text-amber-400'
                : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

function SpecificationRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Animation variants
// ═══════════════════════════════════════════════════════════════════════

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

// ═══════════════════════════════════════════════════════════════════════
// Time ago helper
// ═══════════════════════════════════════════════════════════════════════

function timeAgo(dateStr: string, isRTL: boolean): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return isRTL ? 'اليوم' : 'Today';
  if (diffDays === 1) return isRTL ? 'أمس' : 'Yesterday';
  if (diffDays < 7) return isRTL ? `منذ ${diffDays} أيام` : `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return isRTL ? `منذ ${weeks} أسبوع` : `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return isRTL ? `منذ ${months} شهر` : `${months} month${months > 1 ? 's' : ''} ago`;
  }
  const years = Math.floor(diffDays / 365);
  return isRTL ? `منذ ${years} سنة` : `${years} year${years > 1 ? 's' : ''} ago`;
}

// ═══════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════

export function ListingDetail() {
  const { t, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { user } = useAuth();
  const { viewParams, navigate, goBack } = useNavigationStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { addViewed } = useRecentlyViewed();

  const listingId = viewParams.id;

  // Local state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [safetyExpanded, setSafetyExpanded] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<number | null>(null);
  const [amenitiesExpanded, setAmenitiesExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [mobileBarVisible, setMobileBarVisible] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  // ── Scroll to top on mount ────────────────────────────────────────────
  useEffect(() => {
    // Aggressive scroll-to-top: run multiple times to beat async content loading
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      document.scrollingElement && (document.scrollingElement.scrollTop = 0);
    };
    
    // Immediate
    scrollToTop();
    
    // After paint
    requestAnimationFrame(scrollToTop);
    
    // After potential dynamic content loads
    const timers = [
      setTimeout(scrollToTop, 50),
      setTimeout(scrollToTop, 150),
      setTimeout(scrollToTop, 300),
      setTimeout(scrollToTop, 500),
    ];
    
    return () => timers.forEach(clearTimeout);
  }, [listingId]);

  // ── Scroll detection ────────────────────────────────────────────────

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
      setTitleVisible(window.scrollY > 300);
      setMobileBarVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Data Fetching ───────────────────────────────────────────────────

  const {
    data: listing,
    isLoading: listingLoading,
    isError: listingError,
    error: listingErrorObj,
    refetch: refetchListing,
  } = useListing(listingId);

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
  } = useReviews(listingId, { page: 0, size: 20 });

  const {
    data: relatedData,
    isLoading: relatedLoading,
  } = useListingsByCategory(listing?.category ?? '', { page: 0, size: 8 });

  // ── Track Recently Viewed ───────────────────────────────────────────

  const trackedId = useRef<string | null>(null);

  useEffect(() => {
    if (listing?.id && trackedId.current !== listing.id) {
      trackedId.current = listing.id;
      addViewed(listing.id, listing.title, listing.category, listing.price);
    }
  }, [listing?.id, addViewed]);

  // ── Derived Data ────────────────────────────────────────────────────

  const reviews = reviewsData?.content ?? [];
  const relatedListings = (relatedData?.content ?? []).filter(
    (item: ListingSummary) => item.id !== listingId
  ).slice(0, 6);

  const allReviews = useMemo(() => {
    if (reviews.length > 0) return reviews;
    return simulatedReviews.map(r => ({
      id: r.id,
      bookingId: '',
      rating: r.rating,
      comment: isRTL ? r.commentAr : r.commentEn,
      createdAt: r.date,
      updatedAt: r.date,
    }));
  }, [reviews, isRTL]);

  const averageRating = useMemo(() => {
    if (allReviews.length === 0) return 4.2;
    const sum = allReviews.reduce((acc: number, r: ReviewResponse) => acc + r.rating, 0);
    return sum / allReviews.length;
  }, [allReviews]);

  const totalReviews = allReviews.length;

  const ratingDistribution = useMemo(() => {
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach((r: ReviewResponse) => {
      const rounded = Math.round(r.rating);
      if (rounded >= 1 && rounded <= 5) dist[rounded]++;
    });
    return dist;
  }, [allReviews]);

  const simulatedViews = useMemo(() => {
    if (!listingId) return 0;
    const hash = listingId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return (hash % 500) + 50;
  }, [listingId]);

  const categoryLabel = useMemo(() => {
    const cat = listing?.category ?? '';
    return isRTL ? (categoryLabelsAr[cat] ?? cat) : (categoryLabelsEn[cat] ?? cat);
  }, [listing?.category, isRTL]);

  const categoryIcon = categoryIcons[listing?.category ?? ''] ?? <Star className="h-8 w-8" />;
  const gradient = categoryGradients[listing?.category ?? ''] ?? 'from-red-400 to-red-600';

  const galleryImages = useMemo(() => {
    if (!listing) return [];
    const mainImage = getCategoryImagePath(listing.category);
    const listingImages = getListingImages(listing.category, 0);
    const images: Array<{ type: 'image' | 'gradient'; src?: string; gradient: string }> = [];
    if (mainImage) {
      images.push({ type: 'image', src: mainImage, gradient });
    }
    if (listingImages.length > 0 && listingImages[0] !== mainImage) {
      images.push({ type: 'image', src: listingImages[0], gradient });
    }
    images.push({ type: 'gradient', gradient: 'from-slate-700 to-slate-900' });
    images.push({ type: 'gradient', gradient });
    images.push({ type: 'gradient', gradient: 'from-gray-600 to-gray-800' });
    return images;
  }, [listing, gradient]);

  const categorySpecs = useMemo(() => {
    if (!listing) return [];
    return getCategorySpecs(listing.category, listing, isRTL);
  }, [listing, isRTL]);

  const categoryHighlights = useMemo(() => {
    if (!listing) return [];
    return getCategoryHighlights(listing.category);
  }, [listing]);

  const categoryAmenities = useMemo(() => {
    if (!listing) return [];
    return getCategoryAmenities(listing.category);
  }, [listing]);

  const hostData = useMemo(() => {
    if (!listingId) return getHostData('default', isRTL);
    return getHostData(listingId, isRTL);
  }, [listingId, isRTL]);

  const filteredReviews = useMemo(() => {
    if (reviewFilter === null) return allReviews;
    return allReviews.filter((r: ReviewResponse) => Math.round(r.rating) === reviewFilter);
  }, [allReviews, reviewFilter]);

  const isRealEstate = listing?.category === 'real-estate';

  // ── Handlers ────────────────────────────────────────────────────────

  const handleBook = useCallback(() => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('show-login-dialog'));
      return;
    }
    navigate('booking', { listingId: listingId ?? '' });
  }, [isAuthenticated, navigate, listingId]);

  const handleMessage = useCallback(() => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('show-login-dialog'));
      return;
    }
    navigate('messages', { listingId: listingId ?? '' });
  }, [isAuthenticated, navigate, listingId]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title ?? '',
          text: listing?.description ?? '',
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
    }
  }, [listing]);

  const handleToggleFavorite = useCallback(() => {
    if (!listing) return;
    if (isFavorite(listingId)) {
      removeFavorite(listingId);
    } else {
      addFavorite({
        id: listing.id,
        title: listing.title,
        category: listing.category,
        price: listing.price,
        providerName: '',
      });
    }
  }, [listing, listingId, isFavorite, addFavorite, removeFavorite]);

  const handleReport = useCallback(() => {
    if (!reportReason.trim()) return;
    setReportSubmitted(true);
  }, [reportReason]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStart === null) return;
      const diff = e.changedTouches[0].clientX - touchStart;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentImageIndex > 0) {
          setCurrentImageIndex((prev) => prev - 1);
        } else if (diff < 0 && currentImageIndex < galleryImages.length - 1) {
          setCurrentImageIndex((prev) => prev + 1);
        }
      }
      setTouchStart(null);
    },
    [touchStart, currentImageIndex, galleryImages.length]
  );

  const formatPrice = useCallback(
    (price: number, currency: string) => {
      const formatted = price.toLocaleString(isRTL ? 'ar-SA' : 'en-US');
      return currency === 'SAR' ? `${formatted} ر.س` : `${formatted} ${currency}`;
    },
    [isRTL]
  );

  const formatDate = useCallback(
    (dateStr: string, format: 'full' | 'short' = 'short') => {
      const locale = isRTL ? 'ar-SA' : 'en-US';
      if (format === 'full') {
        return new Date(dateStr).toLocaleDateString(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      return new Date(dateStr).toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    },
    [isRTL]
  );

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // ── Loading State ───────────────────────────────────────────────────

  if (listingLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 space-y-6 pb-28">
        {/* Image skeleton */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:grid-rows-2 gap-2 h-[400px] rounded-2xl overflow-hidden">
          <Skeleton className="lg:col-span-2 lg:row-span-2 h-full rounded-none" />
          {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-full rounded-none" />)}
        </div>
        <Skeleton className="lg:hidden h-72 rounded-2xl" />
        <div className="lg:flex lg:gap-8">
          <div className="lg:flex-1 space-y-4">
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/5" />
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <div className="hidden lg:block lg:w-[380px]">
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error State ─────────────────────────────────────────────────────

  if (listingError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-full bg-red-100 p-5"
        >
          <AlertCircle className="h-10 w-10 text-red-500" />
        </motion.div>
        <h2 className="text-lg font-bold text-gray-900">{t('common.error')}</h2>
        <p className="text-sm text-gray-500 max-w-xs">
          {(listingErrorObj as Error)?.message ??
            (isRTL ? 'فشل تحميل الإعلان' : 'Failed to load listing')}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => refetchListing()}>
            {t('common.retry')}
          </Button>
          <Button variant="ghost" onClick={goBack}>
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  // ── Render helper for gallery slide ─────────────────────────────────

  const renderGallerySlide = (index: number, forLightbox = false) => {
    const slide = galleryImages[index];
    if (!slide) return null;

    if (slide.type === 'image' && slide.src) {
      return (
        <>
          <img
            src={slide.src}
            alt={listing.title}
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              imageLoaded[slide.src] ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded((prev) => ({ ...prev, [slide.src!]: true }))}
          />
          {!imageLoaded[slide.src] && (
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} flex items-center justify-center`}>
              <div className="text-white/60">{React.cloneElement(categoryIcon as React.ReactElement, { className: 'h-16 w-16' })}</div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
        </>
      );
    }

    return (
      <div className={`h-full w-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center`}>
        <div className="text-white/70 transform scale-150">
          {React.cloneElement(categoryIcon as React.ReactElement, { className: forLightbox ? 'h-20 w-20' : 'h-16 w-16' })}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
      </div>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pb-20 lg:pb-8"
    >
      {/* ═══ 1. Sticky Navigation Header ═══════════════════════════ */}
      <motion.div
        className={`sticky top-0 z-30 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-sm py-2'
            : 'bg-transparent py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 shrink-0 -ml-2"
            >
              <BackArrow className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">{t('common.back')}</span>
            </Button>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0">
              <button
                onClick={() => navigate('home')}
                className="hover:text-gray-600 transition-colors font-medium text-gray-500"
              >
                {isRTL ? 'الرئيسية' : 'Home'}
              </button>
              <span>/</span>
              <button
                onClick={() => navigate('market', { category: listing.category })}
                className="hover:text-gray-600 transition-colors font-medium text-gray-500 truncate"
              >
                {categoryLabel}
              </button>
              <AnimatePresence mode="wait">
                {titleVisible && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex items-center gap-1.5 min-w-0"
                  >
                    <span>/</span>
                    <span className="text-gray-700 font-semibold truncate max-w-[120px] sm:max-w-[200px]">
                      {listing.title}
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleToggleFavorite}
              className="h-9 w-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  isFavorite(listingId) ? 'fill-rose-500 text-rose-500' : 'text-gray-500'
                }`}
              />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleShare}
              className="h-9 w-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <Share2 className="h-5 w-5 text-gray-500" />
            </motion.button>
            <Dialog
              onOpenChange={(open) => {
                if (!open) {
                  setReportReason('');
                  setReportDescription('');
                  setReportSubmitted(false);
                }
              }}
            >
              <DialogTrigger asChild>
                <button className="h-9 w-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                  <Flag className="h-4 w-4 text-gray-400" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Flag className="h-5 w-5 text-red-500" />
                    {isRTL ? 'الإبلاغ عن الإعلان' : 'Report Listing'}
                  </DialogTitle>
                </DialogHeader>
                {!reportSubmitted ? (
                  <div className="space-y-4">
                    <RadioGroup value={reportReason} onValueChange={setReportReason} className="space-y-2">
                      {reportReasons.map((reason) => (
                        <div key={reason.value} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <RadioGroupItem value={reason.value} id={`report-${reason.value}`} />
                          <Label htmlFor={`report-${reason.value}`} className="text-sm cursor-pointer flex-1">
                            {isRTL ? reason.labelAr : reason.labelEn}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <div className="space-y-2">
                      <Label className="text-sm">
                        {isRTL ? 'تفاصيل إضافية (اختياري)' : 'Additional details (optional)'}
                      </Label>
                      <Textarea
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        placeholder={isRTL ? 'اكتب المزيد من التفاصيل هنا...' : 'Provide more details here...'}
                        className="min-h-[80px] resize-none"
                      />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                      <DialogClose asChild>
                        <Button variant="outline" size="sm">{t('common.cancel')}</Button>
                      </DialogClose>
                      <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={handleReport} disabled={!reportReason.trim()}>
                        <Flag className="h-4 w-4 ml-1" />
                        {isRTL ? 'إرسال البلاغ' : 'Submit Report'}
                      </Button>
                    </DialogFooter>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                    <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <p className="font-semibold text-gray-900 text-lg">{isRTL ? 'تم إرسال البلاغ بنجاح' : 'Report Submitted'}</p>
                    <p className="text-sm text-gray-500 mt-2">{isRTL ? 'شكراً لك، سنراجع البلاغ في أقرب وقت' : "Thank you, we'll review this report shortly"}</p>
                    <DialogClose asChild><Button variant="outline" size="sm" className="mt-4">{t('common.close')}</Button></DialogClose>
                  </motion.div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>

      {/* ═══ Main Content ═══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-4">
        <div className="lg:flex lg:gap-8">
          {/* ═══ Left Column ════════════════════════════════════════ */}
          <div className="lg:flex-1 lg:max-w-[calc(100%-400px)]">

            {/* ═══ 2. Image Gallery — Airbnb Grid ═════════════════ */}
            <motion.div {...fadeInUp} className="relative mb-6">
              {/* Desktop: 1 large + 4 small grid */}
              <div className="hidden lg:grid lg:grid-cols-4 lg:grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[400px]">
                {/* Main large image */}
                <div
                  className="lg:col-span-2 lg:row-span-2 relative cursor-pointer group"
                  onClick={() => { setCurrentImageIndex(0); setLightboxOpen(true); }}
                >
                  {renderGallerySlide(0)}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                {/* 4 smaller images */}
                {galleryImages.slice(1, 5).map((img, idx) => (
                  <div
                    key={idx}
                    className="relative cursor-pointer group"
                    onClick={() => { setCurrentImageIndex(idx + 1); setLightboxOpen(true); }}
                  >
                    {img.type === 'image' && img.src ? (
                      <img src={img.src} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className={`h-full w-full bg-gradient-to-br ${img.gradient} flex items-center justify-center`}>
                        <div className="text-white/40">{React.cloneElement(categoryIcon as React.ReactElement, { className: 'h-8 w-8' })}</div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    {idx === 3 && galleryImages.length > 5 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          +{galleryImages.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {/* Show all photos button */}
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md hover:bg-white transition-colors text-sm font-medium text-gray-700"
                >
                  <Maximize2 className="h-4 w-4" />
                  {isRTL ? 'عرض جميع الصور' : 'Show all photos'}
                </button>
              </div>

              {/* Mobile: Full-width carousel */}
              <div className="lg:hidden relative">
                <div
                  className="relative h-72 sm:h-80 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onClick={() => setLightboxOpen(true)}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0"
                    >
                      {renderGallerySlide(currentImageIndex)}
                    </motion.div>
                  </AnimatePresence>

                  {/* Favorite overlay */}
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(); }}
                    className="absolute top-3 z-10 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center"
                    style={{ [isRTL ? 'left' : 'right']: '12px' }}
                  >
                    <Heart className={`h-5 w-5 transition-colors ${isFavorite(listingId) ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`} />
                  </motion.button>

                  {/* Share overlay */}
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => { e.stopPropagation(); handleShare(); }}
                    className="absolute top-3 z-10 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center"
                    style={{ [isRTL ? 'right' : 'left']: '12px' }}
                  >
                    <Share2 className="h-5 w-5 text-gray-600" />
                  </motion.button>

                  {/* Category badge */}
                  <div className="absolute bottom-3 z-10" style={{ [isRTL ? 'right' : 'left']: '12px' }}>
                    <Badge className="bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm gap-1 px-3 py-1 text-xs font-medium">
                      {React.cloneElement(categoryIcon as React.ReactElement, { className: 'h-3.5 w-3.5' })}
                      {categoryLabel}
                    </Badge>
                  </div>

                  {/* Image counter */}
                  <div className="absolute bottom-3 z-10" style={{ [isRTL ? 'left' : 'right']: '12px' }}>
                    <div className="rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 text-xs text-white font-medium">
                      {currentImageIndex + 1}/{galleryImages.length}
                    </div>
                  </div>

                  {/* Show all photos button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md text-xs font-medium text-gray-700"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    {isRTL ? 'عرض الكل' : 'Show all'}
                  </button>
                </div>

                {/* Dot indicators */}
                {galleryImages.length > 1 && (
                  <div className="flex justify-center gap-1.5 mt-3">
                    {galleryImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-200 ${
                          idx === currentImageIndex ? 'w-6 bg-gray-800' : 'w-1.5 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Lightbox Dialog */}
              <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                <DialogContent className="sm:max-w-4xl p-0 bg-black border-0 overflow-hidden rounded-xl">
                  <div className="relative h-[70vh] sm:h-[80vh]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        {renderGallerySlide(currentImageIndex, true)}
                      </motion.div>
                    </AnimatePresence>
                    {currentImageIndex > 0 && (
                      <button onClick={() => setCurrentImageIndex((p) => p - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                        <ChevronLeft className="h-6 w-6 text-white" />
                      </button>
                    )}
                    {currentImageIndex < galleryImages.length - 1 && (
                      <button onClick={() => setCurrentImageIndex((p) => p + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                        <ChevronRight className="h-6 w-6 text-white" />
                      </button>
                    )}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                      <div className="rounded-full bg-black/60 backdrop-blur-sm px-4 py-1.5 text-sm text-white font-medium">
                        {currentImageIndex + 1} / {galleryImages.length}
                      </div>
                    </div>
                    <button onClick={() => setLightboxOpen(false)} className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors">
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>

            {/* ═══ 3. Title Section ═════════════════════════════════ */}
            <motion.div {...fadeInUp} ref={titleRef}>
              <div className="mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {listing.title}
                </h1>
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{isRTL ? 'قدسيا، دمشق' : 'Qudsaya, Damascus'}</span>
                </div>
                <span className="text-gray-300">·</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-gray-900">{averageRating.toFixed(1)}</span>
                  <span>({totalReviews} {isRTL ? 'تقييم' : 'reviews'})</span>
                </div>
                <span className="text-gray-300">·</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-blue-400" />
                  <span>{simulatedViews} {isRTL ? 'مشاهدة' : 'views'}</span>
                </div>
                {isRealEstate && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="font-medium text-gray-700">
                      {isRTL ? '٣ غرف · ١٥٠ م² · الطابق الثالث' : '3 rooms · 150 m² · 3rd floor'}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">{isRTL ? 'إعلان موثق' : 'Verified listing'}</span>
                <Badge variant="secondary" className="text-xs gap-1 bg-gray-100 text-gray-600">
                  {React.cloneElement(categoryIcon as React.ReactElement, { className: 'h-3 w-3' })}
                  {categoryLabel}
                </Badge>
                <Badge className="bg-amber-50 text-amber-700 gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {timeAgo(listing.createdAt, isRTL)}
                </Badge>
              </div>
              {/* Share/Favorite row */}
              <div className="flex items-center gap-2 mt-4 lg:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2 text-sm"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  {isRTL ? 'مشاركة' : 'Share'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex-1 gap-2 text-sm ${isFavorite(listingId) ? 'border-rose-200 text-rose-500 bg-rose-50' : ''}`}
                  onClick={handleToggleFavorite}
                >
                  <Heart className={`h-4 w-4 ${isFavorite(listingId) ? 'fill-rose-500' : ''}`} />
                  {isFavorite(listingId) ? (isRTL ? 'محفوظ' : 'Saved') : (isRTL ? 'حفظ' : 'Save')}
                </Button>
              </div>
              <Separator className="my-6" />
            </motion.div>

            {/* ═══ 4. Host Information Card ═════════════════════════ */}
            <motion.div {...fadeInUp} className="mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                    <AvatarFallback className="bg-gradient-to-br from-rose-400 to-rose-600 text-white font-bold text-lg">
                      {hostData.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-base">
                      {isRTL ? hostData.nameAr : hostData.nameEn}
                    </h3>
                    {hostData.isSuperhost && (
                      <Badge className="bg-amber-100 text-amber-700 gap-1 text-[10px] px-2 py-0.5">
                        <Award className="h-3 w-3" />
                        {isRTL ? 'مضيف مميز' : 'Superhost'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{isRTL ? 'الهوية موثقة' : 'Identity verified'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{isRTL ? 'الهاتف موثق' : 'Phone verified'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{isRTL ? `معدل الرد ${hostData.responseRate}%` : `${hostData.responseRate}% response rate`}</span>
                    <span className="text-gray-300">·</span>
                    <span>{isRTL ? hostData.responseTimeAr : hostData.responseTimeEn}</span>
                    <span className="text-gray-300">·</span>
                    <span>{isRTL ? `عضو منذ ${hostData.memberSince}` : `Member since ${hostData.memberSince}`}</span>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-sm border-gray-200"
                    onClick={handleMessage}
                  >
                    <MessageCircle className="h-4 w-4" />
                    {isRTL ? 'تواصل' : 'Contact'}
                  </Button>
                </div>
              </div>
              <div className="sm:hidden mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-sm border-gray-200"
                  onClick={handleMessage}
                >
                  <MessageCircle className="h-4 w-4" />
                  {isRTL ? 'تواصل مع المضيف' : 'Contact Host'}
                </Button>
              </div>
              <Separator className="my-6" />
            </motion.div>

            {/* ═══ 5. Highlights / Key Features ═════════════════════ */}
            <motion.div {...fadeInUp} className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categoryHighlights.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-rose-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          {isRTL ? feature.titleAr : feature.titleEn}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {isRTL ? feature.descAr : feature.descEn}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <Separator className="my-6" />
            </motion.div>

            {/* ═══ 6. Description Section ═══════════════════════════ */}
            <motion.div {...fadeInUp} className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                {isRTL ? 'عن هذا المكان' : 'About this place'}
              </h2>
              <div className="relative">
                <p
                  className={`text-sm leading-relaxed text-gray-600 whitespace-pre-line ${
                    !descriptionExpanded && (listing.description?.length ?? 0) > 200
                      ? 'line-clamp-4'
                      : ''
                  }`}
                >
                  {listing.description || (isRTL ? 'لا يوجد وصف متاح لهذا الإعلان.' : 'No description available for this listing.')}
                </p>
                {(listing.description?.length ?? 0) > 200 && (
                  <button
                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                    className="flex items-center gap-1 mt-2 text-sm font-semibold text-gray-900 hover:underline"
                  >
                    {descriptionExpanded ? (
                      <>{isRTL ? 'عرض أقل' : 'Show less'} <ChevronUp className="h-4 w-4" /></>
                    ) : (
                      <>{isRTL ? 'عرض المزيد' : 'Show more'} <ChevronDown className="h-4 w-4" /></>
                    )}
                  </button>
                )}
              </div>
              <Separator className="my-6" />
            </motion.div>

            {/* ═══ 7. Detailed Specifications Table ═════════════════ */}
            <motion.div {...fadeInUp} className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                {isRTL ? 'المواصفات والتفاصيل' : 'Specifications & Details'}
              </h2>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {categorySpecs.map((spec, i) => (
                    <SpecificationRow
                      key={i}
                      label={spec.label}
                      value={
                        spec.label === (isRTL ? 'الفئة' : 'Category') ? (
                          <Badge variant="secondary" className="gap-1 text-xs">{spec.value}</Badge>
                        ) : spec.label === (isRTL ? 'السعر' : 'Price') ? (
                          <span className="text-rose-500 font-bold" dir="ltr">{spec.value}</span>
                        ) : (
                          <span className="text-sm">{spec.value}</span>
                        )
                      }
                    />
                  ))}
                </div>
              </div>
              <Separator className="my-6" />
            </motion.div>

            {/* ═══ 8. Amenities Grid ═════════════════════════════════ */}
            {categoryAmenities.length > 0 && (
              <motion.div {...fadeInUp} className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {isRTL ? 'المرافق' : 'Amenities'}
                </h2>
                <div className={`grid ${amenitiesExpanded ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'} gap-3`}>
                  {categoryAmenities
                    .slice(0, amenitiesExpanded ? categoryAmenities.length : 6)
                    .map((amenity, idx) => {
                      const Icon = amenity.icon;
                      return (
                        <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                          <Icon className="h-5 w-5 text-gray-400 shrink-0" />
                          <span className="text-sm text-gray-700">{isRTL ? amenity.labelAr : amenity.labelEn}</span>
                        </div>
                      );
                    })}
                </div>
                {categoryAmenities.length > 6 && (
                  <button
                    onClick={() => setAmenitiesExpanded(!amenitiesExpanded)}
                    className="mt-3 flex items-center gap-1 text-sm font-semibold text-gray-900 hover:underline"
                  >
                    {amenitiesExpanded
                      ? (isRTL ? 'عرض أقل' : 'Show less')
                      : (isRTL ? `عرض جميع المرافق (${categoryAmenities.length})` : `Show all amenities (${categoryAmenities.length})`)
                    }
                    {amenitiesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                )}
                <Separator className="my-6" />
              </motion.div>
            )}

            {/* ═══ 9. Location Section ═══════════════════════════════ */}
            <motion.div {...fadeInUp} className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                {isRTL ? 'الموقع' : 'Location'}
              </h2>
              {/* Map placeholder */}
              <div className="relative h-52 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-100 via-emerald-50 to-blue-50 mb-4">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/4 left-0 right-0 h-px bg-emerald-400" />
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-400" />
                  <div className="absolute top-3/4 left-0 right-0 h-px bg-emerald-400" />
                  <div className="absolute top-0 left-1/4 bottom-0 w-px bg-emerald-400" />
                  <div className="absolute top-0 left-1/2 bottom-0 w-px bg-emerald-400" />
                  <div className="absolute top-0 left-3/4 bottom-0 w-px bg-emerald-400" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className="relative"
                  >
                    <MapPin className="h-12 w-12 text-rose-500 fill-rose-200 drop-shadow-md" />
                    <motion.div
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-rose-200/50"
                    />
                  </motion.div>
                </div>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-rose-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {isRTL ? 'الموقع التقريبي' : 'Approximate location'}
                    </span>
                  </div>
                </div>
              </div>
              {/* Neighborhood highlights */}
              <div className="space-y-2">
                {[
                  { icon: Navigation, labelAr: 'وسط المدينة', labelEn: 'City Center', distAr: 'على بُعد ٢ كم', distEn: '2 km away' },
                  { icon: Coffee, labelAr: 'مطاعم ومقاهي', labelEn: 'Restaurants & Cafes', distAr: 'على بُعد ٥٠٠ م', distEn: '500m away' },
                  { icon: ShoppingBag, labelAr: 'متاجر', labelEn: 'Shops', distAr: 'على بُعد ٣٠٠ م', distEn: '300m away' },
                ].map((poi, i) => {
                  const PoiIcon = poi.icon;
                  return (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <PoiIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{isRTL ? poi.labelAr : poi.labelEn}</span>
                      </div>
                      <span className="text-xs text-gray-400">{isRTL ? poi.distAr : poi.distEn}</span>
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3 gap-2 text-sm">
                <Navigation className="h-4 w-4" />
                {isRTL ? 'الحصول على اتجاهات' : 'Get Directions'}
              </Button>
              <Separator className="my-6" />
            </motion.div>

            {/* ═══ 10. Reviews Section ═══════════════════════════════ */}
            <motion.div {...fadeInUp} className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  {averageRating.toFixed(1)} · {totalReviews} {isRTL ? 'تقييم' : 'reviews'}
                </h2>
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() => navigate('write-review', { listingId: listing.id })}
                  >
                    <Send className="h-3.5 w-3.5" />
                    {t('review.write')}
                  </Button>
                )}
              </div>

              {/* Rating breakdown bars */}
              <div className="p-4 bg-gray-50 rounded-xl mb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                    <StarRating rating={averageRating} size="md" />
                    <div className="text-xs text-gray-400 mt-1">{totalReviews} {isRTL ? 'تقييم' : 'reviews'}</div>
                  </div>
                  <Separator orientation="vertical" className="h-20" />
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingDistribution[star] ?? 0;
                      const pct = totalReviews > 0 ? (count / totalReviews) * 100 : (star === 5 ? 60 : star === 4 ? 25 : 10);
                      return (
                        <button
                          key={star}
                          onClick={() => setReviewFilter(reviewFilter === star ? null : star)}
                          className={`w-full flex items-center gap-2 text-xs group cursor-pointer ${reviewFilter === star ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
                        >
                          <span className="w-3 text-gray-500 font-medium">{star}</span>
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5, delay: 0.1 * (5 - star) }}
                              className={`h-full rounded-full ${reviewFilter === star ? 'bg-rose-500' : 'bg-amber-400'}`}
                            />
                          </div>
                          <span className="w-6 text-gray-400 text-right">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Filter chips */}
                {reviewFilter !== null && (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-rose-100 text-rose-700 gap-1 text-xs cursor-pointer" onClick={() => setReviewFilter(null)}>
                      {reviewFilter}★ <X className="h-3 w-3" />
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {filteredReviews.length} {isRTL ? 'تقييم' : 'reviews'}
                    </span>
                  </div>
                )}
              </div>

              {/* Individual review cards */}
              {filteredReviews.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {filteredReviews.slice(0, 10).map((review: ReviewResponse, idx: number) => {
                    const simReview = simulatedReviews[idx % simulatedReviews.length];
                    return (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-medium">
                                {simReview.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{isRTL ? simReview.nameAr : simReview.nameEn}</p>
                              <p className="text-[10px] text-gray-400">{formatDate(review.createdAt, 'short')}</p>
                            </div>
                          </div>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {review.comment || (isRTL ? 'بدون تعليق' : 'No comment')}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Star className="h-6 w-6 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500">
                    {reviewFilter !== null
                      ? (isRTL ? `لا توجد تقييمات ${reviewFilter} نجوم` : `No ${reviewFilter}-star reviews`)
                      : t('review.noReviews')
                    }
                  </p>
                </div>
              )}
              <Separator className="my-6" />
            </motion.div>

            {/* ═══ 11. Related Listings Section ═════════════════════ */}
            {(relatedListings.length > 0 || relatedLoading) && (
              <motion.div {...fadeInUp} className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    {isRealEstate
                      ? (isRTL ? 'عقارات مشابهة' : 'Similar properties')
                      : (isRTL ? 'إعلانات مشابهة' : 'Similar listings')
                    }
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-rose-500 hover:text-rose-600"
                    onClick={() => navigate('market', { category: listing.category })}
                  >
                    {t('common.viewAll')}
                    <ArrowLeft className={`h-3.5 w-3.5 ${isRTL ? 'mr-1 rotate-180' : 'ml-1'}`} />
                  </Button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
                  {relatedLoading ? (
                    [0, 1, 2, 3].map((i) => (
                      <div key={i} className="shrink-0 w-[200px] sm:w-[220px]">
                        <Skeleton className="aspect-square rounded-xl mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-1" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))
                  ) : (
                    relatedListings.map((item: ListingSummary, idx: number) => (
                      <ListingCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        category={item.category}
                        price={item.price}
                        providerName={item.providerName}
                        rating={3.5 + (idx % 15) / 10}
                        reviewCount={5 + (idx * 3) % 20}
                        isFavorite={isFavorite(item.id)}
                        onToggleFavorite={() => {
                          if (isFavorite(item.id)) removeFavorite(item.id);
                          else addFavorite({ id: item.id, title: item.title, category: item.category, price: item.price, providerName: item.providerName });
                        }}
                        imageIndex={idx}
                        subtitle={isRTL ? 'قدسيا، دمشق' : 'Qudsaya, Damascus'}
                      />
                    ))
                  )}
                </div>
                <Separator className="my-6" />
              </motion.div>
            )}

            {/* ═══ 12. Safety/Tips Section ═══════════════════════════ */}
            <motion.div {...fadeInUp} className="mb-6">
              <Collapsible open={safetyExpanded} onOpenChange={setSafetyExpanded}>
                <div className="border border-amber-200/50 rounded-xl overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between p-4 hover:bg-amber-50/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-amber-600" />
                        <h2 className="text-base font-semibold text-gray-900">
                          {isRTL ? 'نصائح الأمان' : 'Safety Tips'}
                        </h2>
                      </div>
                      <motion.div animate={{ rotate: safetyExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="h-5 w-5 text-amber-600" />
                      </motion.div>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-2.5">
                      {[
                        { icon: MapPin, ar: 'التقِ في مكان عام آمن', en: 'Meet in a safe public place' },
                        { icon: AlertTriangle, ar: 'لا تدفع مبلغاً مقدماً', en: "Don't pay in advance" },
                        { icon: Eye, ar: 'افحص المنتج قبل الدفع', en: 'Inspect the item before paying' },
                        { icon: Flag, ar: 'أبلغ عن الإعلانات المشبوهة', en: 'Report suspicious listings' },
                        { icon: Shield, ar: 'استخدم طرق دفع آمنة', en: 'Use secure payment methods' },
                      ].map((tip, i) => {
                        const TipIcon = tip.icon;
                        return (
                          <div key={i} className="flex items-center gap-3 p-2.5 bg-amber-50/50 rounded-lg">
                            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                              <TipIcon className="h-4 w-4" />
                            </div>
                            <span className="text-sm text-gray-700">{isRTL ? tip.ar : tip.en}</span>
                          </div>
                        );
                      })}
                      <Dialog
                        onOpenChange={(open) => {
                          if (!open) { setReportReason(''); setReportDescription(''); setReportSubmitted(false); }
                        }}
                      >
                        <DialogTrigger asChild>
                          <button className="flex items-center gap-2 text-sm font-medium text-rose-500 hover:text-rose-600 mt-2">
                            <Flag className="h-4 w-4" />
                            {isRTL ? 'الإبلاغ عن هذا الإعلان' : 'Report this listing'}
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Flag className="h-5 w-5 text-red-500" />
                              {isRTL ? 'الإبلاغ عن الإعلان' : 'Report Listing'}
                            </DialogTitle>
                          </DialogHeader>
                          {!reportSubmitted ? (
                            <div className="space-y-4">
                              <RadioGroup value={reportReason} onValueChange={setReportReason} className="space-y-2">
                                {reportReasons.map((reason) => (
                                  <div key={reason.value} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                                    <RadioGroupItem value={reason.value} id={`safety-report-${reason.value}`} />
                                    <Label htmlFor={`safety-report-${reason.value}`} className="text-sm cursor-pointer flex-1">
                                      {isRTL ? reason.labelAr : reason.labelEn}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                              <DialogFooter className="gap-2 sm:gap-0">
                                <DialogClose asChild><Button variant="outline" size="sm">{t('common.cancel')}</Button></DialogClose>
                                <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={handleReport} disabled={!reportReason.trim()}>
                                  {isRTL ? 'إرسال' : 'Submit'}
                                </Button>
                              </DialogFooter>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                              <p className="font-semibold">{isRTL ? 'تم الإرسال بنجاح' : 'Report Submitted'}</p>
                              <DialogClose asChild><Button variant="outline" size="sm" className="mt-3">{t('common.close')}</Button></DialogClose>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </motion.div>

          </div>

          {/* ═══ Right Column: Sticky Booking Sidebar (Desktop) ═══ */}
          <div className="hidden lg:block lg:w-[380px] shrink-0">
            <div className="sticky top-20">
              <Card className="border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-bold text-gray-900" dir="ltr">
                      {formatPrice(listing.price, listing.currency)}
                    </span>
                    {isRealEstate && (
                      <span className="text-sm text-gray-500">
                        {isRTL ? '/ شهرياً' : '/ month'}
                      </span>
                    )}
                  </div>

                  {/* Date pickers placeholder */}
                  <div className="grid grid-cols-2 border border-gray-300 rounded-xl overflow-hidden mb-4">
                    <div className="p-3 border-l border-gray-300">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                        {isRTL ? 'تاريخ الوصول' : 'Check-in'}
                      </label>
                      <p className="text-sm text-gray-400 mt-0.5">{isRTL ? 'أضف تاريخ' : 'Add date'}</p>
                    </div>
                    <div className="p-3">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                        {isRTL ? 'تاريخ المغادرة' : 'Checkout'}
                      </label>
                      <p className="text-sm text-gray-400 mt-0.5">{isRTL ? 'أضف تاريخ' : 'Add date'}</p>
                    </div>
                  </div>

                  {/* Guests placeholder */}
                  <div className="border border-gray-300 rounded-xl p-3 mb-4">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                      {isRTL ? 'الضيوف' : 'Guests'}
                    </label>
                    <p className="text-sm text-gray-400 mt-0.5">1 {isRTL ? 'ضيف' : 'guest'}</p>
                  </div>

                  {/* Reserve / Contact button */}
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button
                      className="w-full h-12 text-base font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-200"
                      onClick={isRealEstate ? handleBook : handleMessage}
                    >
                      {isRealEstate
                        ? (isRTL ? 'احجز الآن' : 'Reserve')
                        : (isRTL ? 'تواصل مع البائع' : 'Contact Seller')
                      }
                    </Button>
                  </motion.div>

                  <p className="text-center text-xs text-gray-400 mt-2">
                    {isRTL ? 'لن يتم سحب أي مبلغ الآن' : "You won't be charged yet"}
                  </p>

                  {/* Price breakdown */}
                  {isRealEstate && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 underline decoration-dotted">
                          {formatPrice(listing.price, listing.currency)} × 1 {isRTL ? 'شهر' : 'month'}
                        </span>
                        <span className="text-gray-900" dir="ltr">{formatPrice(listing.price, listing.currency)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 underline decoration-dotted">
                          {isRTL ? 'رسوم الخدمة' : 'Service fee'}
                        </span>
                        <span className="text-gray-900" dir="ltr">{formatPrice(Math.round(listing.price * 0.05), listing.currency)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm font-bold">
                        <span>{isRTL ? 'المجموع' : 'Total'}</span>
                        <span dir="ltr">{formatPrice(Math.round(listing.price * 1.05), listing.currency)}</span>
                      </div>
                    </div>
                  )}

                  {/* Quick actions for non-real-estate */}
                  {!isRealEstate && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                      <Button
                        variant="outline"
                        className="w-full gap-2 text-sm"
                        onClick={handleMessage}
                      >
                        <MessageCircle className="h-4 w-4" />
                        {isRTL ? 'أرسل رسالة' : 'Send Message'}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full gap-2 text-sm"
                        onClick={handleShare}
                      >
                        <Share2 className="h-4 w-4" />
                        {isRTL ? 'مشاركة الإعلان' : 'Share Listing'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick host info below sidebar */}
              <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-rose-400 to-rose-600 text-white text-sm font-bold">
                    {hostData.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{isRTL ? hostData.nameAr : hostData.nameEn}</p>
                  <p className="text-xs text-gray-400">
                    {hostData.listingCount} {isRTL ? 'إعلان' : 'listings'}
                  </p>
                </div>
                {hostData.isSuperhost && (
                  <Badge className="bg-amber-100 text-amber-700 gap-1 text-[10px] shrink-0">
                    <Award className="h-3 w-3" />
                    {isRTL ? 'مميز' : 'Super'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 14. Mobile Bottom Action Bar ══════════════════════════ */}
      <AnimatePresence>
        {mobileBarVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
          >
            <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
              <div className="shrink-0 min-w-0">
                <p className="text-[10px] text-gray-400">{isRTL ? 'السعر' : 'Price'}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-gray-900" dir="ltr">
                    {formatPrice(listing.price, listing.currency)}
                  </span>
                  {isRealEstate && (
                    <span className="text-xs text-gray-400">{isRTL ? '/شهر' : '/mo'}</span>
                  )}
                </div>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                <Button
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-md shadow-rose-200 h-11"
                  onClick={isRealEstate ? handleBook : handleMessage}
                >
                  {isRealEstate
                    ? (isRTL ? 'احجز الآن' : 'Book Now')
                    : (isRTL ? 'تواصل' : 'Contact')
                  }
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
