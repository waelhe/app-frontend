'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  CreditCard,
  Banknote,
  Building2,
  CalendarDays,
  Clock,
  Minus,
  Plus,
  Star,
  Sparkles,
  Shield,
  Home,
  ListChecks,
  User,
  Mail,
  Phone,
  FileText,
  Tag,
  Ticket,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigationStore } from '@/stores/navigationStore';
import { useListing, useCreateBooking, useCreatePaymentIntent } from '@/hooks/useApi';
import type { ListingResponse } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

// ── Types ───────────────────────────────────────────────────────────

type BookingStep = 'service' | 'datetime' | 'details' | 'payment' | 'confirmation';

type ServiceTier = 'standard' | 'premium' | 'vip';

type PaymentMethod = 'cash' | 'card' | 'bank';

interface ServiceOption {
  tier: ServiceTier;
  labelAr: string;
  labelEn: string;
  multiplier: number;
  descAr: string;
  descEn: string;
}

// ── Constants ───────────────────────────────────────────────────────

const SERVICE_TIERS: ServiceOption[] = [
  {
    tier: 'standard',
    labelAr: 'قياسي',
    labelEn: 'Standard',
    multiplier: 1,
    descAr: 'السعر الأساسي للخدمة',
    descEn: 'Base service price',
  },
  {
    tier: 'premium',
    labelAr: 'مميز',
    labelEn: 'Premium',
    multiplier: 1.5,
    descAr: 'أولوية في الحجز + دعم مميز',
    descEn: 'Priority booking + premium support',
  },
  {
    tier: 'vip',
    labelAr: 'VIP',
    labelEn: 'VIP',
    multiplier: 2,
    descAr: 'خدمة حصرية + ضمان الرضا',
    descEn: 'Exclusive service + satisfaction guarantee',
  },
];

const PAYMENT_METHODS: {
  id: PaymentMethod;
  labelAr: string;
  labelEn: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'cash',
    labelAr: 'نقدي',
    labelEn: 'Cash',
    icon: <Banknote className="h-5 w-5" />,
  },
  {
    id: 'card',
    labelAr: 'بطاقة',
    labelEn: 'Card',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: 'bank',
    labelAr: 'تحويل بنكي',
    labelEn: 'Bank Transfer',
    icon: <Building2 className="h-5 w-5" />,
  },
];

const SERVICE_FEE_RATE = 0.05;

// ── Helpers ─────────────────────────────────────────────────────────

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}

function generateBookingRef(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'NBD-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ── Component ───────────────────────────────────────────────────────

export function BookingFlow() {
  const { t, isRTL } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { viewParams, goBack, navigate } = useNavigationStore();

  const listingId = viewParams.listingId;
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // ── Step state ────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [selectedTier, setSelectedTier] = useState<ServiceTier>('standard');
  const [quantity, setQuantity] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState(user?.displayName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Auto-fill name/email when user loads
  const [prevUserId, setPrevUserId] = useState<string | null>(null);
  if (user && user.id !== prevUserId) {
    setPrevUserId(user.id);
    setName(user.displayName ?? '');
    setEmail(user.email ?? '');
  }

  const steps: { id: BookingStep; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    { id: 'service', labelAr: 'الخدمة', labelEn: 'Service', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'datetime', labelAr: 'التاريخ', labelEn: 'Date & Time', icon: <CalendarDays className="h-4 w-4" /> },
    { id: 'details', labelAr: 'البيانات', labelEn: 'Details', icon: <User className="h-4 w-4" /> },
    { id: 'payment', labelAr: 'الدفع', labelEn: 'Payment', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'confirmation', labelAr: 'تأكيد', labelEn: 'Confirmed', icon: <Check className="h-4 w-4" /> },
  ];

  const stepIndex = steps.findIndex((s) => s.id === currentStep);

  // ── Fetch listing ─────────────────────────────────────────────
  const {
    data: listing,
    isLoading: listingLoading,
  } = useListing(listingId);

  // ── Price calculations ────────────────────────────────────────
  const tierMultiplier = useMemo(
    () => SERVICE_TIERS.find((s) => s.tier === selectedTier)?.multiplier ?? 1,
    [selectedTier],
  );

  const unitPrice = useMemo(() => {
    if (!listing) return 0;
    return Math.round(listing.price * tierMultiplier);
  }, [listing, tierMultiplier]);

  const subtotal = unitPrice * quantity;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + serviceFee - discount;

  // ── Calendar helpers ──────────────────────────────────────────
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const calendarDays = useMemo(() => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = (firstDay.getDay() + 6) % 7; // Monday-start
    const days: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [calendarMonth]);

  const dayNames = isRTL
    ? ['إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت', 'أحد']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = 9; h <= 20; h++) {
      const ampm = h < 12 ? 'AM' : 'PM';
      const display = h > 12 ? h - 12 : h;
      slots.push(`${display}:00 ${ampm}`);
    }
    return slots;
  }, []);

  const goToPrevMonth = useCallback(() => {
    setCalendarMonth((prev) => {
      const m = prev.month === 0 ? 11 : prev.month - 1;
      const y = prev.month === 0 ? prev.year - 1 : prev.year;
      return { year: y, month: m };
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCalendarMonth((prev) => {
      const m = prev.month === 11 ? 0 : prev.month + 1;
      const y = prev.month === 11 ? prev.year + 1 : prev.year;
      return { year: y, month: m };
    });
  }, []);

  const isDateDisabled = useCallback(
    (date: Date) => {
      return date < today;
    },
    [today],
  );

  const isDateAvailable = useCallback(
    (date: Date) => {
      if (isDateDisabled(date)) return false;
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + 30);
      return date <= maxDate;
    },
    [isDateDisabled, today],
  );

  const formatDate = useCallback(
    (date: Date) => {
      return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
    [isRTL],
  );

  // ── Mutations ─────────────────────────────────────────────────
  const createBookingMutation = useCreateBooking();
  const createPaymentMutation = useCreatePaymentIntent();

  // Override onSuccess for booking mutation
  const handleCreateBooking = useCallback(() => {
    createBookingMutation.mutate(
      { listingId, notes: specialRequests || undefined },
      {
        onSuccess: (data) => {
          setBookingId(data.id);
          setBookingRef(generateBookingRef());
          setCurrentStep('confirmation');
        },
      },
    );
  }, [createBookingMutation, listingId, specialRequests]);

  const handleCreatePayment = useCallback(() => {
    createPaymentMutation.mutate(
      { bookingId },
      {
        onSuccess: () => {
          handleCreateBooking();
        },
      },
    );
  }, [createPaymentMutation, bookingId, handleCreateBooking]);

  const handleApplyPromo = useCallback(() => {
    if (promoCode.trim().length >= 3) {
      setPromoApplied(true);
    }
  }, [promoCode]);

  // ── Navigation helpers ────────────────────────────────────────
  const canProceedFromService = true;
  const canProceedFromDateTime = selectedDate !== null && selectedTime !== null;
  const canProceedFromDetails = name.trim().length > 0 && email.trim().length > 0;

  const goNext = useCallback(() => {
    const idx = stepIndex;
    if (idx < steps.length - 1) {
      setCurrentStep(steps[idx + 1].id);
    }
  }, [stepIndex, steps]);

  const goPrev = useCallback(() => {
    const idx = stepIndex;
    if (idx > 0) {
      setCurrentStep(steps[idx - 1].id);
    }
  }, [stepIndex, steps]);

  const handleFinalSubmit = useCallback(() => {
    if (paymentMethod === 'card') {
      handleCreatePayment();
    } else {
      handleCreateBooking();
    }
  }, [paymentMethod, handleCreatePayment, handleCreateBooking]);

  // ── Loading ───────────────────────────────────────────────────
  if (listingLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="h-40 animate-pulse rounded-xl bg-gray-200" />
        <div className="h-60 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  // ── Slide animation variants ─────────────────────────────────
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? (isRTL ? -40 : 40) : isRTL ? 40 : -40,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction > 0 ? (isRTL ? 40 : -40) : isRTL ? -40 : 40,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen space-y-4 p-4 pb-24"
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={goBack} className="text-gray-600">
          <BackArrow className="h-4 w-4" />
          {t('common.back')}
        </Button>
        <h1 className="text-lg font-bold text-gray-900">
          {isRTL ? 'حجز خدمة' : 'Book a Service'}
        </h1>
      </div>

      {/* ── Step Indicators ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = index < stepIndex;
          return (
            <div key={step.id} className="flex flex-1 flex-col items-center gap-1">
              <motion.div
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  isCompleted
                    ? 'bg-red-500 text-white'
                    : isActive
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-400'
                }`}
                animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.icon}
              </motion.div>
              <span
                className={`text-[10px] font-medium ${
                  isActive
                    ? 'text-red-600'
                    : isCompleted
                      ? 'text-red-500'
                      : 'text-gray-400'
                }`}
              >
                {isRTL ? step.labelAr : step.labelEn}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-full ${
                    index < stepIndex ? 'bg-red-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step Content ────────────────────────────────────────── */}
      <AnimatePresence mode="wait" custom={1}>
        {/* ━━ Step 1: Select Service ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {currentStep === 'service' && (
          <motion.div
            key="service"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Listing Card */}
            <Card className="overflow-hidden">
              <div className="relative bg-gradient-to-bl from-red-500 to-rose-600 px-5 py-6 text-white">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/10" />
                <Badge className="mb-2 bg-white/20 text-white hover:bg-white/30">
                  {listing?.category ?? ''}
                </Badge>
                <h2 className="text-xl font-bold">{listing?.title ?? (isRTL ? 'خدمة' : 'Service')}</h2>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-2xl font-extrabold">
                    {listing ? `${formatPrice(listing.price)} ${isRTL ? 'ر.س' : 'SAR'}` : '—'}
                  </span>
                  <span className="text-sm text-white/70">
                    {isRTL ? 'السعر الأساسي' : 'Base price'}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-white/80">
                  <Shield className="h-4 w-4" />
                  <span>{isRTL ? 'مزود معتمد' : 'Verified Provider'}</span>
                  <span className="mx-1">•</span>
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>4.8</span>
                </div>
              </div>
            </Card>

            {/* Service Tier Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-red-500" />
                  {isRTL ? 'اختر مستوى الخدمة' : 'Select Service Tier'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {SERVICE_TIERS.map((tier) => {
                  const isSelected = selectedTier === tier.tier;
                  const price = listing ? Math.round(listing.price * tier.multiplier) : 0;
                  return (
                    <motion.button
                      key={tier.tier}
                      type="button"
                      onClick={() => setSelectedTier(tier.tier)}
                      className={`w-full rounded-xl border-2 p-4 text-start transition-all ${
                        isSelected
                          ? 'border-red-500 bg-red-50 shadow-md'
                          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              tier.tier === 'standard'
                                ? 'bg-gray-100 text-gray-600'
                                : tier.tier === 'premium'
                                  ? 'bg-amber-100 text-amber-600'
                                  : 'bg-purple-100 text-purple-600'
                            }`}
                          >
                            {tier.tier === 'standard' ? (
                              <Check className="h-5 w-5" />
                            ) : tier.tier === 'premium' ? (
                              <Star className="h-5 w-5" />
                            ) : (
                              <Sparkles className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {isRTL ? tier.labelAr : tier.labelEn}
                            </div>
                            <div className="text-xs text-gray-500">
                              {isRTL ? tier.descAr : tier.descEn}
                            </div>
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="text-lg font-bold text-red-500">
                            {formatPrice(price)}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {isRTL ? 'ر.س' : 'SAR'}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-2 border-t border-red-100 pt-2"
                        >
                          <div className="flex items-center gap-1 text-xs text-red-600">
                            <Check className="h-3 w-3" />
                            {isRTL ? 'تم الاختيار' : 'Selected'}
                          </div>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quantity Selector */}
            <Card>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <div className="font-medium text-gray-900">
                    {isRTL ? 'الكمية' : 'Quantity'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {isRTL ? 'اختر عدد الخدمات (1-10)' : 'Select number of services (1-10)'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <motion.span
                    key={quantity}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className="min-w-[2rem] text-center text-xl font-bold text-gray-900"
                  >
                    {quantity}
                  </motion.span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    disabled={quantity >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Next */}
            <Button
              className="w-full bg-red-500 text-white hover:bg-red-600"
              onClick={goNext}
              disabled={!canProceedFromService}
            >
              {isRTL ? 'التالي: التاريخ والوقت' : 'Next: Date & Time'}
            </Button>
          </motion.div>
        )}

        {/* ━━ Step 2: Choose Date & Time ━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {currentStep === 'datetime' && (
          <motion.div
            key="datetime"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Calendar */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-red-500" />
                    {isRTL ? 'اختر التاريخ' : 'Choose Date'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToPrevMonth}>
                      {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                    <span className="min-w-[8rem] text-center text-sm font-medium">
                      {new Date(calendarMonth.year, calendarMonth.month).toLocaleDateString(
                        isRTL ? 'ar-SA' : 'en-US',
                        { month: 'long', year: 'numeric' },
                      )}
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToNextMonth}>
                      {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Day name headers */}
                <div className="mb-2 grid grid-cols-7 gap-1">
                  {dayNames.map((d) => (
                    <div key={d} className="text-center text-[10px] font-medium text-gray-400">
                      {d}
                    </div>
                  ))}
                </div>
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date, i) => {
                    if (!date) return <div key={`empty-${i}`} />;
                    const dateStr = date.toISOString().split('T')[0];
                    const disabled = isDateDisabled(date);
                    const available = isDateAvailable(date);
                    const isSelected = selectedDate === dateStr;
                    const isToday = date.getTime() === today.getTime();
                    return (
                      <motion.button
                        key={dateStr}
                        type="button"
                        disabled={disabled || !available}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-red-500 text-white shadow-md'
                            : disabled
                              ? 'text-gray-300 cursor-not-allowed'
                              : available
                                ? `text-gray-700 hover:bg-red-50 ${isToday ? 'ring-1 ring-red-200' : ''}`
                                : 'text-gray-300 cursor-not-allowed'
                        }`}
                        whileTap={available && !disabled ? { scale: 0.9 } : {}}
                      >
                        {date.getDate()}
                      </motion.button>
                    );
                  })}
                </div>
                {/* Available dates hint */}
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span>{isRTL ? 'التواريخ المتاحة (30 يوم القادمة)' : 'Available dates (next 30 days)'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Time Slots */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-red-500" />
                  {isRTL ? 'اختر الوقت' : 'Choose Time'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTime === slot;
                    return (
                      <motion.button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`rounded-lg border-2 py-2.5 text-center text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-red-500 bg-red-50 text-red-600'
                            : 'border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        {slot}
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Selected Date & Time Display */}
            {selectedDate && selectedTime && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-200 bg-red-50 p-3"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-red-700">
                  <CalendarDays className="h-4 w-4" />
                  <span>
                    {formatDate(new Date(selectedDate))} — {selectedTime}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={goPrev}>
                {t('common.back')}
              </Button>
              <Button
                className="flex-1 bg-red-500 text-white hover:bg-red-600"
                onClick={goNext}
                disabled={!canProceedFromDateTime}
              >
                {isRTL ? 'التالي: البيانات' : 'Next: Details'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ━━ Step 3: Your Details ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {currentStep === 'details' && (
          <motion.div
            key="details"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-red-500" />
                  {isRTL ? 'بياناتك' : 'Your Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="booking-name" className="text-sm font-medium text-gray-700">
                    {isRTL ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="booking-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isRTL ? 'أدخل اسمك' : 'Enter your name'}
                      className="ps-9"
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="booking-email" className="text-sm font-medium text-gray-700">
                    {isRTL ? 'البريد الإلكتروني' : 'Email'} <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="booking-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                      className="ps-9"
                      dir="ltr"
                    />
                  </div>
                  {isAuthenticated && (
                    <p className="text-[10px] text-emerald-600">
                      {isRTL ? 'تم ملؤه تلقائياً من حسابك' : 'Auto-filled from your account'}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="booking-phone" className="text-sm font-medium text-gray-700">
                    {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                  </Label>
                  <div className="relative">
                    <Phone className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="booking-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={isRTL ? '05XXXXXXXX' : '05XXXXXXXX'}
                      className="ps-9"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Special Requests */}
                <div className="space-y-1.5">
                  <Label htmlFor="booking-notes" className="text-sm font-medium text-gray-700">
                    {isRTL ? 'طلبات خاصة' : 'Special Requests'}
                  </Label>
                  <Textarea
                    id="booking-notes"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder={
                      isRTL
                        ? 'أي طلبات أو ملاحظات خاصة...'
                        : 'Any special requests or notes...'
                    }
                    className="min-h-20 resize-none"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={goPrev}>
                {t('common.back')}
              </Button>
              <Button
                className="flex-1 bg-red-500 text-white hover:bg-red-600"
                onClick={goNext}
                disabled={!canProceedFromDetails}
              >
                {isRTL ? 'التالي: الدفع' : 'Next: Payment'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ━━ Step 4: Payment Summary ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {currentStep === 'payment' && (
          <motion.div
            key="payment"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Price Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-red-500" />
                  {isRTL ? 'ملخص الفاتورة' : 'Payment Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Item */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {listing?.title ?? (isRTL ? 'الخدمة' : 'Service')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {isRTL
                        ? `${SERVICE_TIERS.find((s) => s.tier === selectedTier)?.labelAr ?? ''} × ${quantity}`
                        : `${SERVICE_TIERS.find((s) => s.tier === selectedTier)?.labelEn ?? ''} × ${quantity}`}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPrice(subtotal)} {isRTL ? 'ر.س' : 'SAR'}
                  </span>
                </div>

                <Separator />

                {/* Quantity */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{isRTL ? 'الكمية' : 'Quantity'}</span>
                  <span className="font-medium text-gray-700">{quantity}</span>
                </div>

                {/* Subtotal */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span className="font-medium text-gray-700">
                    {formatPrice(subtotal)} {isRTL ? 'ر.س' : 'SAR'}
                  </span>
                </div>

                {/* Service Fee */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {isRTL ? 'رسوم الخدمة (5%)' : 'Service Fee (5%)'}
                  </span>
                  <span className="font-medium text-gray-700">
                    {formatPrice(serviceFee)} {isRTL ? 'ر.س' : 'SAR'}
                  </span>
                </div>

                {/* Discount */}
                {promoApplied && (
                  <div className="flex items-center justify-between text-sm text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" />
                      {isRTL ? 'خصم (10%)' : 'Discount (10%)'}
                    </span>
                    <span className="font-medium">-{formatPrice(discount)} {isRTL ? 'ر.س' : 'SAR'}</span>
                  </div>
                )}

                <Separator />

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-gray-900">
                    {isRTL ? 'الإجمالي' : 'Total'}
                  </span>
                  <span className="text-xl font-extrabold text-red-500">
                    {formatPrice(total)} {isRTL ? 'ر.س' : 'SAR'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4 text-red-500" />
                  {isRTL ? 'طريقة الدفع' : 'Payment Method'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = paymentMethod === method.id;
                  return (
                    <motion.button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                        isSelected
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          isSelected ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {method.icon}
                      </div>
                      <span className={`text-sm font-medium ${isSelected ? 'text-red-700' : 'text-gray-700'}`}>
                        {isRTL ? method.labelAr : method.labelEn}
                      </span>
                      {isSelected && (
                        <Check className="ms-auto h-4 w-4 text-red-500" />
                      )}
                    </motion.button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Ticket className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        if (promoApplied) setPromoApplied(false);
                      }}
                      placeholder={isRTL ? 'كود الخصم' : 'Promo Code'}
                      className="ps-9"
                      dir="ltr"
                      disabled={promoApplied}
                    />
                  </div>
                  <Button
                    variant={promoApplied ? 'secondary' : 'default'}
                    className={promoApplied ? '' : 'bg-red-500 text-white hover:bg-red-600'}
                    onClick={handleApplyPromo}
                    disabled={promoApplied || promoCode.trim().length < 3}
                  >
                    {promoApplied ? (
                      <><Check className="h-4 w-4 me-1" />{isRTL ? 'مطبق' : 'Applied'}</>
                    ) : (
                      isRTL ? 'تطبيق' : 'Apply'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={goPrev}>
                {t('common.back')}
              </Button>
              <Button
                className="flex-1 bg-red-500 text-white hover:bg-red-600"
                onClick={handleFinalSubmit}
                disabled={createBookingMutation.isPending || createPaymentMutation.isPending}
              >
                {createBookingMutation.isPending || createPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isRTL ? 'جاري المعالجة...' : 'Processing...'}
                  </>
                ) : (
                  isRTL ? 'تأكيد الحجز' : 'Confirm Booking'
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ━━ Step 5: Confirmation ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {currentStep === 'confirmation' && (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-4 text-center"
          >
            {/* Animated Checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
              className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30"
            >
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.5, stiffness: 300 }}
              >
                <Check className="h-12 w-12 text-white" strokeWidth={3} />
              </motion.div>
            </motion.div>

            {/* Confetti-like decorative dots */}
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="absolute h-2 w-2 rounded-full"
                style={{
                  background: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'][i],
                  top: `${20 + i * 12}%`,
                  left: `${10 + i * 18}%`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.6] }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
              />
            ))}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-2xl font-extrabold text-gray-900">
                {isRTL ? 'تم تأكيد الحجز!' : 'Booking Confirmed!'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {isRTL ? 'حجزك جاهز وتم تسجيله بنجاح' : 'Your booking is ready and has been registered'}
              </p>
            </motion.div>

            {/* Booking Reference */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="w-full"
            >
              <Card className="border-red-200 bg-red-50">
                <CardContent className="py-4 text-center">
                  <div className="text-xs text-gray-500">
                    {isRTL ? 'رقم المرجع' : 'Reference Number'}
                  </div>
                  <div className="mt-1 font-mono text-2xl font-extrabold tracking-wider text-red-600">
                    {bookingRef}
                  </div>
                  {bookingId && (
                    <div className="mt-1 text-[10px] text-gray-400">
                      ID: {bookingId.slice(0, 8)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Booking Details Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="w-full"
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <ListChecks className="h-4 w-4 text-red-500" />
                    {isRTL ? 'تفاصيل الحجز' : 'Booking Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isRTL ? 'الخدمة' : 'Service'}</span>
                    <span className="font-medium text-gray-800">{listing?.title ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isRTL ? 'المستوى' : 'Tier'}</span>
                    <span className="font-medium text-gray-800">
                      {isRTL
                        ? SERVICE_TIERS.find((s) => s.tier === selectedTier)?.labelAr
                        : SERVICE_TIERS.find((s) => s.tier === selectedTier)?.labelEn}
                    </span>
                  </div>
                  {selectedDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{isRTL ? 'التاريخ' : 'Date'}</span>
                      <span className="font-medium text-gray-800">
                        {new Date(selectedDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                  {selectedTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{isRTL ? 'الوقت' : 'Time'}</span>
                      <span className="font-medium text-gray-800">{selectedTime}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isRTL ? 'المجموع' : 'Total'}</span>
                    <span className="font-bold text-red-500">
                      {formatPrice(total)} {isRTL ? 'ر.س' : 'SAR'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex w-full gap-3 pt-2"
            >
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate('bookings-list', {})}
              >
                <ListChecks className="h-4 w-4 me-1" />
                {isRTL ? 'حجوزاتي' : 'My Bookings'}
              </Button>
              <Button
                className="flex-1 bg-red-500 text-white hover:bg-red-600"
                onClick={() => navigate('home', {})}
              >
                <Home className="h-4 w-4 me-1" />
                {isRTL ? 'الرئيسية' : 'Home'}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
