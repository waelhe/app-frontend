'use client';

import { useState, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Save,
  Loader2,
  Pencil,
  AlertCircle,
  Trash2,
  ImagePlus,
  X,
  MapPin,
  Phone,
  MessageCircle,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  CalendarDays,
  RefreshCw,
  Star,
  Check,
  Ban,
  Play,
  Pause,
  Archive,
  Image as ImageIcon,
  GripVertical,
  Tag,
  Shield,
} from 'lucide-react';
import { useLanguage } from '@/stores/languageStore';
import { useAuth } from '@/stores/authStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ApiError } from '@/lib/api';
import { useListing, useUpdateListing, useActivateListing, usePauseListing, useDeleteListing } from '@/hooks/useApi';
import type { ListingResponse, UpdateListingRequest, ListingStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

// ── Categories ──────────────────────────────────────────────────────

const categories = [
  { value: 'real-estate', labelAr: 'عقارات', labelEn: 'Real Estate' },
  { value: 'electronics', labelAr: 'إلكترونيات', labelEn: 'Electronics' },
  { value: 'cars', labelAr: 'سيارات', labelEn: 'Cars' },
  { value: 'services', labelAr: 'خدمات', labelEn: 'Services' },
  { value: 'jobs', labelAr: 'وظائف', labelEn: 'Jobs' },
  { value: 'furniture', labelAr: 'أثاث', labelEn: 'Furniture' },
  { value: 'medical', labelAr: 'طبي', labelEn: 'Medical' },
  { value: 'dining', labelAr: 'مطاعم', labelEn: 'Dining' },
  { value: 'education', labelAr: 'تعليم', labelEn: 'Education' },
  { value: 'beauty', labelAr: 'جمال وعناية', labelEn: 'Beauty & Care' },
] as const;

const subCategoriesMap: Record<string, { value: string; labelAr: string; labelEn: string }[]> = {
  'real-estate': [
    { value: 'apartments', labelAr: 'شقق', labelEn: 'Apartments' },
    { value: 'villas', labelAr: 'فلل', labelEn: 'Villas' },
    { value: 'land', labelAr: 'أراضي', labelEn: 'Land' },
    { value: 'commercial', labelAr: 'تجاري', labelEn: 'Commercial' },
    { value: 'office', labelAr: 'مكاتب', labelEn: 'Office' },
  ],
  electronics: [
    { value: 'phones', labelAr: 'هواتف', labelEn: 'Phones' },
    { value: 'laptops', labelAr: 'لابتوب', labelEn: 'Laptops' },
    { value: 'tablets', labelAr: 'تابلت', labelEn: 'Tablets' },
    { value: 'cameras', labelAr: 'كاميرات', labelEn: 'Cameras' },
    { value: 'accessories', labelAr: 'إكسسوارات', labelEn: 'Accessories' },
  ],
  cars: [
    { value: 'sedan', labelAr: 'سيدان', labelEn: 'Sedan' },
    { value: 'suv', labelAr: 'دفع رباعي', labelEn: 'SUV' },
    { value: 'truck', labelAr: 'شاحنة', labelEn: 'Truck' },
    { value: 'motorcycle', labelAr: 'دراجة', labelEn: 'Motorcycle' },
    { value: 'parts', labelAr: 'قطع غيار', labelEn: 'Parts' },
  ],
  services: [
    { value: 'cleaning', labelAr: 'تنظيف', labelEn: 'Cleaning' },
    { value: 'maintenance', labelAr: 'صيانة', labelEn: 'Maintenance' },
    { value: 'consulting', labelAr: 'استشارات', labelEn: 'Consulting' },
    { value: 'transport', labelAr: 'نقل', labelEn: 'Transport' },
    { value: 'events', labelAr: 'فعاليات', labelEn: 'Events' },
  ],
  jobs: [
    { value: 'fulltime', labelAr: 'دوام كامل', labelEn: 'Full-time' },
    { value: 'parttime', labelAr: 'دوام جزئي', labelEn: 'Part-time' },
    { value: 'remote', labelAr: 'عن بعد', labelEn: 'Remote' },
    { value: 'freelance', labelAr: 'حر', labelEn: 'Freelance' },
    { value: 'internship', labelAr: 'تدريب', labelEn: 'Internship' },
  ],
  furniture: [
    { value: 'living', labelAr: 'غرفة معيشة', labelEn: 'Living Room' },
    { value: 'bedroom', labelAr: 'غرفة نوم', labelEn: 'Bedroom' },
    { value: 'kitchen', labelAr: 'مطبخ', labelEn: 'Kitchen' },
    { value: 'office-furn', labelAr: 'مكتبي', labelEn: 'Office' },
    { value: 'outdoor', labelAr: 'خارجي', labelEn: 'Outdoor' },
  ],
  medical: [
    { value: 'clinic', labelAr: 'عيادة', labelEn: 'Clinic' },
    { value: 'dental', labelAr: 'أسنان', labelEn: 'Dental' },
    { value: 'pharmacy', labelAr: 'صيدلية', labelEn: 'Pharmacy' },
    { value: 'therapy', labelAr: 'علاج طبيعي', labelEn: 'Therapy' },
    { value: 'lab', labelAr: 'تحاليل', labelEn: 'Lab' },
  ],
  dining: [
    { value: 'restaurant', labelAr: 'مطعم', labelEn: 'Restaurant' },
    { value: 'cafe', labelAr: 'مقهى', labelEn: 'Cafe' },
    { value: 'catering', labelAr: 'تموين', labelEn: 'Catering' },
    { value: 'bakery', labelAr: 'مخبز', labelEn: 'Bakery' },
    { value: 'delivery', labelAr: 'توصيل', labelEn: 'Delivery' },
  ],
  education: [
    { value: 'tutoring', labelAr: 'دروس خصوصية', labelEn: 'Tutoring' },
    { value: 'courses', labelAr: 'دورات', labelEn: 'Courses' },
    { value: 'training', labelAr: 'تدريب', labelEn: 'Training' },
    { value: 'workshops', labelAr: 'ورش عمل', labelEn: 'Workshops' },
    { value: 'online', labelAr: 'أونلاين', labelEn: 'Online' },
  ],
  beauty: [
    { value: 'salon', labelAr: 'صالون', labelEn: 'Salon' },
    { value: 'spa', labelAr: 'سبا', labelEn: 'Spa' },
    { value: 'skincare', labelAr: 'عناية بالبشرة', labelEn: 'Skincare' },
    { value: 'haircare', labelAr: 'عناية بالشعر', labelEn: 'Haircare' },
    { value: 'makeup', labelAr: 'مكياج', labelEn: 'Makeup' },
  ],
};

const currencies = [
  { value: 'SAR', label: 'ر.س (SAR)' },
  { value: 'USD', label: '$ (USD)' },
  { value: 'EUR', label: '€ (EUR)' },
  { value: 'AED', label: 'د.إ (AED)' },
];

const locations = [
  { value: 'riyadh', labelAr: 'الرياض', labelEn: 'Riyadh' },
  { value: 'jeddah', labelAr: 'جدة', labelEn: 'Jeddah' },
  { value: 'mecca', labelAr: 'مكة المكرمة', labelEn: 'Mecca' },
  { value: 'medina', labelAr: 'المدينة المنورة', labelEn: 'Medina' },
  { value: 'dammam', labelAr: 'الدمام', labelEn: 'Dammam' },
  { value: 'khobar', labelAr: 'الخبر', labelEn: 'Khobar' },
  { value: 'taif', labelAr: 'الطائف', labelEn: 'Taif' },
  { value: 'tabuk', labelAr: 'تبوك', labelEn: 'Tabuk' },
  { value: 'abha', labelAr: 'أبها', labelEn: 'Abha' },
  { value: 'other', labelAr: 'أخرى', labelEn: 'Other' },
];

// ── Category color map ──────────────────────────────────────────────

const categoryGradients: Record<string, string> = {
  'real-estate': 'from-amber-500 to-amber-600',
  electronics: 'from-sky-500 to-sky-600',
  cars: 'from-slate-500 to-slate-600',
  services: 'from-emerald-500 to-emerald-600',
  jobs: 'from-violet-500 to-violet-600',
  furniture: 'from-rose-500 to-rose-600',
  medical: 'from-teal-500 to-teal-600',
  dining: 'from-orange-500 to-orange-600',
  education: 'from-cyan-500 to-cyan-600',
  beauty: 'from-pink-500 to-pink-600',
};

// ── Helpers ─────────────────────────────────────────────────────────

function centsToDisplay(cents: number): string {
  return (cents / 100).toFixed(2);
}

function displayToCents(display: string): number {
  const parsed = parseFloat(display);
  if (isNaN(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

const statusConfig: Record<string, { color: string; bg: string; labelAr: string; labelEn: string }> = {
  DRAFT: { color: 'text-gray-600', bg: 'bg-gray-100', labelAr: 'مسودة', labelEn: 'Draft' },
  ACTIVE: { color: 'text-emerald-600', bg: 'bg-emerald-100', labelAr: 'نشط', labelEn: 'Active' },
  PAUSED: { color: 'text-amber-600', bg: 'bg-amber-100', labelAr: 'متوقف', labelEn: 'Paused' },
  ARCHIVED: { color: 'text-red-600', bg: 'bg-red-100', labelAr: 'مؤرشف', labelEn: 'Archived' },
};

// ── Component ───────────────────────────────────────────────────────

export function EditListingForm() {
  const { t, isRTL } = useLanguage();
  const { isAuthenticated, role } = useAuth();
  const { viewParams, goBack } = useNavigationStore();
  const queryClient = useQueryClient();

  const listingId = viewParams.id;
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // ── Form state ─────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [priceDisplay, setPriceDisplay] = useState('');
  const [currency, setCurrency] = useState('SAR');
  const [negotiable, setNegotiable] = useState(false);
  const [discountPrice, setDiscountPrice] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [location, setLocation] = useState('');
  const [featured, setFeatured] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const [autoRenew, setAutoRenew] = useState(false);
  const [formError, setFormError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Track initial values for unsaved changes detection
  const [initialValues, setInitialValues] = useState<Record<string, string>>({});

  // ── Fetch listing ──────────────────────────────────────────────
  const {
    data: listing,
    isLoading,
    isError,
    error: fetchError,
  } = useListing(listingId);

  // ── Pre-populate form when listing data arrives ───────────────
  const [prevListingId, setPrevListingId] = useState<string | null>(null);
  if (listing && listing.id !== prevListingId) {
    setPrevListingId(listing.id);
    setTitle(listing.title);
    setDescription(listing.description ?? '');
    setCategory(listing.category);
    setPriceDisplay(centsToDisplay(listing.price));
    setCurrency(listing.currency ?? 'SAR');
    setFormError('');
    setHasChanges(false);
    setInitialValues({
      title: listing.title,
      description: listing.description ?? '',
      category: listing.category,
      priceDisplay: centsToDisplay(listing.price),
      currency: listing.currency ?? 'SAR',
    });
  }

  // ── Check for unsaved changes ────────────────────────────────
  const checkChanges = useCallback(
    (field: string, value: string) => {
      const hasChanged = value !== (initialValues[field] ?? '');
      setHasChanges(hasChanged);
    },
    [initialValues],
  );

  // ── Update mutation ────────────────────────────────────────────
  const updateMutation = useUpdateListing();

  // Wrap the mutation to add custom onSuccess/onError
  const handleUpdateListing = useCallback((data: UpdateListingRequest) => {
    updateMutation.mutate({ id: listingId, data }, {
      onSuccess: () => {
        setHasChanges(false);
        toast({
          title: isRTL ? 'تم تحديث الإعلان' : 'Listing Updated',
          description: isRTL
            ? 'تم حفظ التغييرات بنجاح'
            : 'Your changes have been saved successfully',
        });
      },
      onError: (err: Error) => {
        const apiErr = err as ApiError;
        const message = apiErr?.detail
          ? apiErr.detail
          : isRTL
            ? 'فشل تحديث الإعلان. يرجى المحاولة مرة أخرى.'
            : 'Failed to update listing. Please try again.';
        setFormError(message);
        toast({
          variant: 'destructive',
          title: isRTL ? 'خطأ' : 'Error',
          description: message,
        });
      },
    });
  }, [updateMutation, listingId, isRTL]);

  // ── Status change mutations ────────────────────────────────────
  const activateListingMutation = useActivateListing();
  const pauseListingMutation = usePauseListing();
  const archiveListingMutation = useDeleteListing();

  const statusMutation = useMutation({
    mutationFn: ({ action }: { action: 'activate' | 'pause' | 'archive' }) => {
      if (action === 'activate') return activateListingMutation.mutateAsync(listingId);
      if (action === 'pause') return pauseListingMutation.mutateAsync(listingId);
      return archiveListingMutation.mutateAsync(listingId);
    },
    onSuccess: () => {
      toast({
        title: isRTL ? 'تم تحديث الحالة' : 'Status Updated',
        description: isRTL ? 'تم تغيير حالة الإعلان بنجاح' : 'Listing status changed successfully',
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل تحديث الحالة' : 'Failed to update status',
      });
    },
  });

  // ── Delete mutation ────────────────────────────────────────────
  const deleteListingMutation = useDeleteListing();

  const deleteMutation = useMutation({
    mutationFn: () => deleteListingMutation.mutateAsync(listingId),
    onSuccess: () => {
      toast({
        title: isRTL ? 'تم حذف الإعلان' : 'Listing Deleted',
        description: isRTL ? 'تم أرشفة الإعلان بنجاح' : 'The listing has been archived',
      });
      goBack();
    },
  });

  // ── Validation ─────────────────────────────────────────────────
  const validate = useCallback((): string | null => {
    if (!title.trim()) {
      return isRTL ? 'العنوان مطلوب' : 'Title is required';
    }
    if (title.trim().length < 3) {
      return isRTL
        ? 'يجب أن يكون العنوان ٣ أحرف على الأقل'
        : 'Title must be at least 3 characters';
    }
    if (!category) {
      return isRTL ? 'يرجى اختيار فئة' : 'Please select a category';
    }
    const cents = displayToCents(priceDisplay);
    if (cents <= 0) {
      return isRTL ? 'يرجى إدخال سعر صحيح' : 'Please enter a valid price';
    }
    if (discountPrice && displayToCents(discountPrice) >= cents) {
      return isRTL ? 'سعر الخصم يجب أن يكون أقل من السعر الأصلي' : 'Discount price must be less than original price';
    }
    return null;
  }, [title, category, priceDisplay, discountPrice, isRTL]);

  // ── Submit handler ─────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError('');

    const data: UpdateListingRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priceCents: displayToCents(priceDisplay),
    };

    handleUpdateListing(data);
  };

  // ── Current status display ─────────────────────────────────────
  const currentStatus = (listing as ListingResponse & { status?: ListingStatus })?.status ?? 'ACTIVE';
  const statusInfo = statusConfig[currentStatus] ?? statusConfig.ACTIVE;

  // ── Sub-categories ─────────────────────────────────────────────
  const subCategories = useMemo(() => subCategoriesMap[category] ?? [], [category]);

  // ── Loading state ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-lg" />
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-10 flex-1 rounded-lg" />
              <Skeleton className="h-10 flex-1 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 p-8 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          {isRTL ? 'فشل تحميل الإعلان' : 'Failed to load listing'}
        </h2>
        <p className="text-sm text-gray-500">
          {(fetchError as Error)?.message ??
            (isRTL
              ? 'تعذر العثور على الإعلان المطلوب'
              : 'Could not find the requested listing')}
        </p>
        <Button variant="outline" onClick={goBack}>
          <BackArrow className="h-4 w-4" />
          {t('common.back')}
        </Button>
      </motion.div>
    );
  }

  // ── No ID / not found ─────────────────────────────────────────
  if (!listingId || !listing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 p-8 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Pencil className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          {isRTL ? 'لم يتم العثور على الإعلان' : 'Listing not found'}
        </h2>
        <Button variant="outline" onClick={goBack}>
          <BackArrow className="h-4 w-4" />
          {t('common.back')}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen space-y-4 p-4 pb-24"
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={goBack} className="text-gray-600">
            <BackArrow className="h-4 w-4" />
          </Button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
            <Pencil className="h-4 w-4 text-red-600" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">
            {isRTL ? 'تعديل الإعلان' : 'Edit Listing'}
          </h1>
        </div>
        <Badge className={`${statusInfo.bg} ${statusInfo.color} border-0`}>
          {isRTL ? statusInfo.labelAr : statusInfo.labelEn}
        </Badge>
      </div>

      {/* ── Listing Preview Card ─────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className={`relative bg-gradient-to-bl ${categoryGradients[category] ?? 'from-red-500 to-rose-600'} px-5 py-4 text-white`}>
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 h-14 w-14 rounded-full bg-white/10" />
          <div className="flex items-center justify-between">
            <div>
              <Badge className="bg-white/20 text-white hover:bg-white/30 text-[10px]">
                {categories.find((c) => c.value === category)
                  ? isRTL
                    ? categories.find((c) => c.value === category)!.labelAr
                    : categories.find((c) => c.value === category)!.labelEn
                  : category}
              </Badge>
              <h3 className="mt-1 text-base font-bold">{title || (isRTL ? 'بدون عنوان' : 'Untitled')}</h3>
            </div>
            <div className="text-end">
              <div className="text-xl font-extrabold">
                {priceDisplay ? `${priceDisplay} ${isRTL ? 'ر.س' : 'SAR'}` : '—'}
              </div>
              {discountPrice && (
                <div className="text-xs text-white/60 line-through">
                  {discountPrice} {isRTL ? 'ر.س' : 'SAR'}
                </div>
              )}
            </div>
          </div>
          <div className="mt-1 text-[10px] text-white/70">
            ID: {listing.id.slice(0, 8)}
          </div>
        </div>
      </Card>

      {/* ── Unsaved Changes Warning ──────────────────────────────── */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5"
          >
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{isRTL ? 'لديك تغييرات غير محفوظة' : 'You have unsaved changes'}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Form ─────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ── Basic Info ──────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Pencil className="h-4 w-4 text-red-500" />
              {isRTL ? 'المعلومات الأساسية' : 'Basic Info'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700">
                {isRTL ? 'العنوان' : 'Title'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  checkChanges('title', e.target.value);
                }}
                placeholder={isRTL ? 'أدخل عنوان الإعلان' : 'Enter listing title'}
                className="border-gray-200 focus:border-red-400 focus:ring-red-400"
                maxLength={120}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <p className="text-[11px] text-gray-400">
                {isRTL ? `${title.length}/١٢٠ حرف` : `${title.length}/120 characters`}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700">
                {isRTL ? 'الوصف' : 'Description'}
              </Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  checkChanges('description', e.target.value);
                }}
                placeholder={
                  isRTL
                    ? 'أدخل وصفاً تفصيلياً للإعلان...'
                    : 'Enter a detailed description of your listing...'
                }
                className="min-h-[100px] resize-y border-gray-200 focus:border-red-400 focus:ring-red-400"
                maxLength={2000}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <p className="text-[11px] text-gray-400">
                {isRTL ? `${description.length}/٢٠٠٠ حرف` : `${description.length}/2000 characters`}
              </p>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                {isRTL ? 'الفئة' : 'Category'} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={(val) => {
                  setCategory(val);
                  setSubCategory('');
                  setHasChanges(true);
                }}
              >
                <SelectTrigger className="border-gray-200 focus:ring-red-400">
                  <SelectValue placeholder={isRTL ? 'اختر فئة' : 'Select category'} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {isRTL ? cat.labelAr : cat.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sub-category */}
            {subCategories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1.5"
              >
                <Label className="text-sm font-medium text-gray-700">
                  {isRTL ? 'الفئة الفرعية' : 'Sub-category'}
                </Label>
                <Select value={subCategory} onValueChange={(val) => { setSubCategory(val); setHasChanges(true); }}>
                  <SelectTrigger className="border-gray-200 focus:ring-red-400">
                    <SelectValue placeholder={isRTL ? 'اختر فئة فرعية' : 'Select sub-category'} />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories.map((sub) => (
                      <SelectItem key={sub.value} value={sub.value}>
                        {isRTL ? sub.labelAr : sub.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* ── Pricing ────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4 text-red-500" />
              {isRTL ? 'التسعير' : 'Pricing'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Price + Currency */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="edit-price" className="text-sm font-medium text-gray-700">
                  {isRTL ? 'السعر' : 'Price'} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={priceDisplay}
                    onChange={(e) => {
                      setPriceDisplay(e.target.value);
                      checkChanges('priceDisplay', e.target.value);
                    }}
                    placeholder={isRTL ? '٠٫٠٠' : '0.00'}
                    className="border-gray-200 focus:border-red-400 focus:ring-red-400 pe-14"
                    dir="ltr"
                  />
                  <span className="absolute top-1/2 -translate-y-1/2 text-sm text-gray-400 end-3">
                    {isRTL ? 'ر.س' : 'SAR'}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  {isRTL ? 'العملة' : 'Currency'}
                </Label>
                <Select value={currency} onValueChange={(val) => { setCurrency(val); setHasChanges(true); }}>
                  <SelectTrigger className="border-gray-200 focus:ring-red-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Negotiable Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
              <div className="flex items-center gap-2">
                {negotiable ? (
                  <ToggleRight className="h-5 w-5 text-red-500" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    {isRTL ? 'قابل للتفاوض' : 'Negotiable'}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {isRTL ? 'السعر قابل للتفاوض' : 'Price is negotiable'}
                  </div>
                </div>
              </div>
              <Switch
                checked={negotiable}
                onCheckedChange={(val) => { setNegotiable(val); setHasChanges(true); }}
                className="data-[state=checked]:bg-red-500"
              />
            </div>

            {/* Discount Price */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-discount" className="text-sm font-medium text-gray-700">
                <Tag className="me-1 inline h-3.5 w-3.5" />
                {isRTL ? 'سعر الخصم (اختياري)' : 'Discount Price (optional)'}
              </Label>
              <Input
                id="edit-discount"
                type="number"
                step="0.01"
                min="0"
                value={discountPrice}
                onChange={(e) => { setDiscountPrice(e.target.value); setHasChanges(true); }}
                placeholder={isRTL ? 'اتركه فارغاً إذا لا يوجد خصم' : 'Leave empty if no discount'}
                className="border-gray-200 focus:border-red-400 focus:ring-red-400"
                dir="ltr"
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Status Management ───────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4 text-red-500" />
              {isRTL ? 'إدارة الحالة' : 'Status Management'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Current Status Display */}
            <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
              <span className="text-sm text-gray-600">{isRTL ? 'الحالة الحالية' : 'Current Status'}</span>
              <Badge className={`${statusInfo.bg} ${statusInfo.color} border-0`}>
                {isRTL ? statusInfo.labelAr : statusInfo.labelEn}
              </Badge>
            </div>

            {/* Status Actions */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex flex-col items-center gap-1 py-3 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                onClick={() => statusMutation.mutate({ action: 'activate' })}
                disabled={statusMutation.isPending || currentStatus === 'ACTIVE'}
              >
                <Play className="h-4 w-4" />
                <span className="text-[10px]">{isRTL ? 'تفعيل' : 'Activate'}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex flex-col items-center gap-1 py-3 border-amber-200 text-amber-600 hover:bg-amber-50"
                onClick={() => statusMutation.mutate({ action: 'pause' })}
                disabled={statusMutation.isPending || currentStatus === 'PAUSED'}
              >
                <Pause className="h-4 w-4" />
                <span className="text-[10px]">{isRTL ? 'إيقاف مؤقت' : 'Pause'}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex flex-col items-center gap-1 py-3 border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => statusMutation.mutate({ action: 'archive' })}
                disabled={statusMutation.isPending || currentStatus === 'ARCHIVED'}
              >
                <Archive className="h-4 w-4" />
                <span className="text-[10px]">{isRTL ? 'أرشفة' : 'Archive'}</span>
              </Button>
            </div>

            {statusMutation.isPending && (
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                {isRTL ? 'جاري تحديث الحالة...' : 'Updating status...'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Media ───────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="h-4 w-4 text-red-500" />
              {isRTL ? 'الصور والوسائط' : 'Media'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Current Images (placeholder) */}
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
                >
                  <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${categoryGradients[category] ?? 'from-red-500 to-rose-600'}`}>
                    <span className="text-2xl font-bold text-white/40">
                      {(listing.title ?? 'N')[0].toUpperCase()}
                    </span>
                  </div>
                  {/* Remove button */}
                  <button
                    type="button"
                    className="absolute top-1 end-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/80 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {/* Main badge */}
                  {i === 0 && (
                    <div className="absolute bottom-1 start-1 rounded bg-black/50 px-1.5 py-0.5 text-[8px] font-medium text-white">
                      {isRTL ? 'رئيسية' : 'Main'}
                    </div>
                  )}
                  {/* Drag handle */}
                  <div className="absolute bottom-1 end-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <GripVertical className="h-4 w-4 text-white drop-shadow" />
                  </div>
                </div>
              ))}

              {/* Add New Image */}
              <motion.button
                type="button"
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-400"
                whileTap={{ scale: 0.95 }}
              >
                <ImagePlus className="h-6 w-6" />
                <span className="text-[10px] font-medium">
                  {isRTL ? 'إضافة' : 'Add'}
                </span>
              </motion.button>
            </div>
            <p className="text-[10px] text-gray-400">
              {isRTL ? 'اسحب الصور لإعادة الترتيب • الحد الأقصى 8 صور' : 'Drag to reorder • Max 8 images'}
            </p>
          </CardContent>
        </Card>

        {/* ── Contact & Location ──────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-4 w-4 text-red-500" />
              {isRTL ? 'التواصل والموقع' : 'Contact & Location'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-contact-phone" className="text-sm font-medium text-gray-700">
                {isRTL ? 'رقم الهاتف' : 'Phone Number'}
              </Label>
              <div className="relative">
                <Phone className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="edit-contact-phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => { setContactPhone(e.target.value); setHasChanges(true); }}
                  placeholder={isRTL ? '05XXXXXXXX' : '05XXXXXXXX'}
                  className="ps-9 border-gray-200 focus:border-red-400 focus:ring-red-400"
                  dir="ltr"
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-whatsapp" className="text-sm font-medium text-gray-700">
                <MessageCircle className="me-1 inline h-3.5 w-3.5 text-emerald-500" />
                {isRTL ? 'رقم واتساب' : 'WhatsApp Number'}
              </Label>
              <div className="relative">
                <MessageCircle className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
                <Input
                  id="edit-whatsapp"
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => { setWhatsappNumber(e.target.value); setHasChanges(true); }}
                  placeholder={isRTL ? '05XXXXXXXX' : '05XXXXXXXX'}
                  className="ps-9 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                <MapPin className="me-1 inline h-3.5 w-3.5 text-red-400" />
                {isRTL ? 'الموقع / المنطقة' : 'Location / Area'}
              </Label>
              <Select value={location} onValueChange={(val) => { setLocation(val); setHasChanges(true); }}>
                <SelectTrigger className="border-gray-200 focus:ring-red-400">
                  <SelectValue placeholder={isRTL ? 'اختر المدينة' : 'Select city'} />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.value} value={loc.value}>
                      {isRTL ? loc.labelAr : loc.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* ── Visibility ──────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              {featured ? (
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              ) : (
                <Eye className="h-4 w-4 text-red-500" />
              )}
              {isRTL ? 'الظهور' : 'Visibility'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Featured Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
              <div className="flex items-center gap-2">
                <Star className={`h-5 w-5 ${featured ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    {isRTL ? 'إعلان مميز' : 'Featured Listing'}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {isRTL ? 'يظهر في أعلى النتائج' : 'Appears at the top of results'}
                  </div>
                </div>
              </div>
              <Switch
                checked={featured}
                onCheckedChange={(val) => { setFeatured(val); setHasChanges(true); }}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>

            {/* Expiration Date */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-expiration" className="text-sm font-medium text-gray-700">
                <CalendarDays className="me-1 inline h-3.5 w-3.5" />
                {isRTL ? 'تاريخ انتهاء الإعلان' : 'Listing Expiration Date'}
              </Label>
              <Input
                id="edit-expiration"
                type="date"
                value={expirationDate}
                onChange={(e) => { setExpirationDate(e.target.value); setHasChanges(true); }}
                className="border-gray-200 focus:border-red-400 focus:ring-red-400"
                dir="ltr"
              />
            </div>

            {/* Auto-renew Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
              <div className="flex items-center gap-2">
                <RefreshCw className={`h-5 w-5 ${autoRenew ? 'text-emerald-500' : 'text-gray-400'}`} />
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    {isRTL ? 'تجديد تلقائي' : 'Auto-renew'}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {isRTL ? 'تجديد الإعلان تلقائياً عند الانتهاء' : 'Automatically renew listing when expired'}
                  </div>
                </div>
              </div>
              <Switch
                checked={autoRenew}
                onCheckedChange={(val) => { setAutoRenew(val); setHasChanges(true); }}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Error message ──────────────────────────────────── */}
        {formError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <p className="text-sm text-red-600">{formError}</p>
          </motion.div>
        )}

        {/* ── Save/Cancel Actions ─────────────────────────────── */}
        <Card>
          <CardContent className="space-y-3 py-4">
            {/* Save Changes */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 disabled:opacity-60"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                </>
              )}
            </Button>

            {/* Cancel */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              onClick={goBack}
              disabled={updateMutation.isPending}
            >
              {t('common.cancel')}
            </Button>

            <Separator />

            {/* Delete Listing */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-red-500 hover:bg-red-50 hover:text-red-600"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  {isRTL ? 'حذف الإعلان' : 'Delete Listing'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </div>
                    {isRTL ? 'حذف الإعلان؟' : 'Delete Listing?'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {isRTL
                      ? 'هل أنت متأكد من حذف هذا الإعلان؟ سيتم أرشفة الإعلان ولن يظهر في نتائج البحث. هذا الإجراء يمكن التراجع عنه.'
                      : 'Are you sure you want to delete this listing? It will be archived and removed from search results. This action can be undone.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 text-white hover:bg-red-600"
                    onClick={() => deleteMutation.mutate()}
                  >
                    <Trash2 className="h-4 w-4 me-1" />
                    {isRTL ? 'حذف' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* ── Listing meta info ──────────────────────────────── */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>
                {isRTL ? 'معرّف الإعلان' : 'Listing ID'}:{' '}
                <span className="font-mono text-gray-500">{listing.id.slice(0, 8)}</span>
              </span>
              <span>
                {isRTL
                  ? `آخر تحديث: ${new Date(listing.updatedAt).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}`
                  : `Last updated: ${new Date(listing.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}`}
              </span>
            </div>
          </CardContent>
        </Card>
      </form>
    </motion.div>
  );
}
