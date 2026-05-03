'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Save,
  Loader2,
  Pencil,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigationStore } from '@/stores/navigationStore';
import { catalogService, ApiError } from '@/lib/api';
import type { ListingResponse, UpdateListingRequest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
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

// ── Category color map (red-accent palette) ─────────────────────────

const categoryColors: Record<string, { bg: string; border: string; text: string; activeBg: string }> = {
  'real-estate': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', activeBg: 'bg-amber-500' },
  electronics:   { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', activeBg: 'bg-sky-500' },
  cars:          { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', activeBg: 'bg-slate-600' },
  services:      { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', activeBg: 'bg-emerald-500' },
  jobs:          { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', activeBg: 'bg-violet-500' },
  furniture:     { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', activeBg: 'bg-rose-500' },
  medical:       { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', activeBg: 'bg-teal-500' },
  dining:        { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', activeBg: 'bg-orange-500' },
  education:     { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', activeBg: 'bg-indigo-500' },
  beauty:        { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', activeBg: 'bg-pink-500' },
};

// ── Cents ↔ Display helpers ─────────────────────────────────────────

function centsToDisplay(cents: number): string {
  return (cents / 100).toFixed(2);
}

function displayToCents(display: string): number {
  const parsed = parseFloat(display);
  if (isNaN(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

// ── Component ───────────────────────────────────────────────────────

export function EditListingForm() {
  const { t, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { viewParams, goBack } = useNavigationStore();
  const queryClient = useQueryClient();

  const listingId = viewParams.id;

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // ── Form state ─────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priceDisplay, setPriceDisplay] = useState('');
  const [formError, setFormError] = useState('');

  // ── Fetch listing ──────────────────────────────────────────────
  const {
    data: listing,
    isLoading,
    isError,
    error: fetchError,
  } = useQuery<ListingResponse>({
    queryKey: ['listing', listingId],
    queryFn: () => catalogService.byId(listingId),
    enabled: !!listingId,
  });

  // ── Pre-populate form when listing data arrives ───────────────
  // React-recommended pattern: adjust state during render when
  // the source data changes (not in an effect).
  const [prevListingId, setPrevListingId] = useState<string | null>(null);
  if (listing && listing.id !== prevListingId) {
    setPrevListingId(listing.id);
    setTitle(listing.title);
    setDescription(listing.description ?? '');
    setCategory(listing.category);
    setPriceDisplay(centsToDisplay(listing.price));
    setFormError('');
  }

  // ── Update mutation ────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (data: UpdateListingRequest) =>
      catalogService.update(listingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
      queryClient.invalidateQueries({ queryKey: ['provider-listings'] });
      toast({
        title: isRTL ? 'تم تحديث الإعلان' : 'Listing Updated',
        description: isRTL
          ? 'تم حفظ التغييرات بنجاح'
          : 'Your changes have been saved successfully',
      });
      goBack();
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
    return null;
  }, [title, category, priceDisplay, isRTL]);

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

    updateMutation.mutate(data);
  };

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
      className="space-y-4 p-4"
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={goBack} className="text-gray-600">
          <BackArrow className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
            <Pencil className="h-4 w-4 text-red-600" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">
            {t('listing.editTitle')}
          </h1>
        </div>
      </div>

      {/* ── Form Card ───────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Pencil className="h-4 w-4 text-red-500" />
            {isRTL ? 'تعديل تفاصيل الإعلان' : 'Edit Listing Details'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ── Title ────────────────────────────────────────── */}
            <div className="space-y-2">
              <Label
                htmlFor="edit-title"
                className="text-sm font-medium text-gray-700"
              >
                {isRTL ? 'العنوان' : 'Title'}
                <span className="text-red-500"> *</span>
              </Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  isRTL ? 'أدخل عنوان الإعلان' : 'Enter listing title'
                }
                className="border-gray-200 focus:border-red-400 focus:ring-red-400"
                maxLength={120}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <p className="text-[11px] text-gray-400">
                {isRTL
                  ? `${title.length}/١٢٠ حرف`
                  : `${title.length}/120 characters`}
              </p>
            </div>

            {/* ── Description ───────────────────────────────────── */}
            <div className="space-y-2">
              <Label
                htmlFor="edit-description"
                className="text-sm font-medium text-gray-700"
              >
                {isRTL ? 'الوصف' : 'Description'}
              </Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  isRTL
                    ? 'أدخل وصفاً تفصيلياً للإعلان...'
                    : 'Enter a detailed description of your listing...'
                }
                className="min-h-[100px] resize-y border-gray-200 focus:border-red-400 focus:ring-red-400"
                maxLength={1000}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <p className="text-[11px] text-gray-400">
                {isRTL
                  ? `${description.length}/١٠٠٠ حرف`
                  : `${description.length}/1000 characters`}
              </p>
            </div>

            {/* ── Category ──────────────────────────────────────── */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                {isRTL ? 'الفئة' : 'Category'}
                <span className="text-red-500"> *</span>
              </Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {categories.map((cat) => {
                  const colors = categoryColors[cat.value];
                  const isSelected = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`
                        relative rounded-lg border-2 px-3 py-2.5 text-sm font-medium
                        transition-all duration-200 active:scale-[0.97]
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1
                        ${
                          isSelected
                            ? `${colors.activeBg} border-transparent text-white shadow-md`
                            : `${colors.bg} ${colors.border} ${colors.text} hover:shadow-sm`
                        }
                      `}
                    >
                      {isRTL ? cat.labelAr : cat.labelEn}
                      {isSelected && (
                        <motion.span
                          layoutId="edit-category-indicator"
                          className="absolute inset-0 rounded-lg ring-2 ring-red-400 ring-offset-1"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Price ──────────────────────────────────────────── */}
            <div className="space-y-2">
              <Label
                htmlFor="edit-price"
                className="text-sm font-medium text-gray-700"
              >
                {isRTL ? 'السعر' : 'Price'}
                <span className="text-red-500"> *</span>
                <span className="text-gray-400 font-normal text-xs mr-1 ml-1">
                  ({isRTL ? 'ريال سعودي' : 'SAR'})
                </span>
              </Label>
              <div className="relative">
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceDisplay}
                  onChange={(e) => setPriceDisplay(e.target.value)}
                  placeholder={isRTL ? '٠٫٠٠' : '0.00'}
                  className="border-gray-200 focus:border-red-400 focus:ring-red-400 pr-16 dir-ltr"
                  dir="ltr"
                />
                <span className="absolute top-1/2 -translate-y-1/2 text-sm text-gray-400 right-3">
                  {isRTL ? 'ر.س' : 'SAR'}
                </span>
              </div>
            </div>

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

            {/* ── Actions ────────────────────────────────────────── */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                onClick={goBack}
                disabled={updateMutation.isPending}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
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
                    {t('common.save')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Listing meta info ──────────────────────────────────── */}
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
    </motion.div>
  );
}
