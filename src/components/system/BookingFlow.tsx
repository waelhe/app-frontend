'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  CreditCard,
  FileText,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigationStore } from '@/stores/navigationStore';
import { bookingService, paymentsService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type BookingStep = 'form' | 'confirm' | 'payment' | 'success';

const stepConfig: { id: BookingStep; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
  { id: 'form', labelAr: 'الحجز', labelEn: 'Booking', icon: <FileText className="h-4 w-4" /> },
  { id: 'confirm', labelAr: 'تأكيد', labelEn: 'Confirm', icon: <Check className="h-4 w-4" /> },
  { id: 'payment', labelAr: 'الدفع', labelEn: 'Payment', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'success', labelAr: 'تم', labelEn: 'Done', icon: <Check className="h-4 w-4" /> },
];

export function BookingFlow() {
  const { t, isRTL } = useLanguage();
  const { viewParams, goBack } = useNavigationStore();

  const listingId = viewParams.listingId;
  const [currentStep, setCurrentStep] = useState<BookingStep>('form');
  const [notes, setNotes] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');

  const stepIndex = stepConfig.findIndex((s) => s.id === currentStep);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // ── Create Booking Mutation ──────────────────────────────────
  const createBookingMutation = useMutation({
    mutationFn: () =>
      bookingService.create({
        listingId,
        notes: notes || undefined,
      }),
    onSuccess: (data) => {
      setBookingId(data.id);
      setCurrentStep('confirm');
    },
  });

  // ── Create Payment Intent Mutation ───────────────────────────
  const createPaymentMutation = useMutation({
    mutationFn: () =>
      paymentsService.createIntent({
        bookingId,
      }),
    onSuccess: (data) => {
      setPaymentIntentId(data.id);
      setCurrentStep('payment');
    },
  });

  // ── Process Payment Mutation ─────────────────────────────────
  const processPaymentMutation = useMutation({
    mutationFn: () =>
      paymentsService.confirmIntent(paymentIntentId),
    onSuccess: () => {
      setCurrentStep('success');
    },
  });

  const handleFormSubmit = () => {
    createBookingMutation.mutate();
  };

  const handleConfirm = () => {
    createPaymentMutation.mutate();
  };

  const handlePayment = () => {
    processPaymentMutation.mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
          className="text-gray-600"
        >
          <BackArrow className="h-4 w-4" />
          {t('common.back')}
        </Button>
        <h1 className="text-lg font-bold text-gray-900">
          {t('booking.new')}
        </h1>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {stepConfig.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = index < stepIndex;
          return (
            <div key={step.id} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isActive
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.icon}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? 'text-red-600' : isCompleted ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                {isRTL ? step.labelAr : step.labelEn}
              </span>
              {index < stepConfig.length - 1 && (
                <div
                  className={`absolute h-0.5 ${
                    index < stepIndex ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                  style={{
                    width: 'calc(25% - 2rem)',
                    left: `calc(${(index + 0.5) * 25}% + 1rem)`,
                    top: '2rem',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* ── Step 1: Booking Form ─────────────────────────────── */}
        {currentStep === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {isRTL ? 'تفاصيل الحجز' : 'Booking Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    {t('booking.notes')}
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      isRTL
                        ? 'أضف ملاحظاتك هنا...'
                        : 'Add your notes here...'
                    }
                    className="min-h-24 resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full bg-red-500 text-white hover:bg-red-600"
              onClick={handleFormSubmit}
              disabled={createBookingMutation.isPending}
            >
              {createBookingMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('common.next')
              )}
            </Button>
          </motion.div>
        )}

        {/* ── Step 2: Confirmation ─────────────────────────────── */}
        {currentStep === 'confirm' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t('booking.confirm')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {isRTL ? 'رقم الحجز' : 'Booking ID'}
                  </span>
                  <Badge variant="secondary" className="font-mono">
                    {bookingId.slice(0, 8)}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {t('booking.status')}
                  </span>
                  <Badge className="bg-amber-100 text-amber-700">
                    {t('booking.pending')}
                  </Badge>
                </div>
                {notes && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-sm text-gray-500">
                        {t('booking.notes')}
                      </span>
                      <p className="mt-1 text-sm text-gray-700">{notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCurrentStep('form')}
              >
                {t('common.back')}
              </Button>
              <Button
                className="flex-1 bg-red-500 text-white hover:bg-red-600"
                onClick={handleConfirm}
                disabled={createPaymentMutation.isPending}
              >
                {createPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('common.confirm')
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Payment ──────────────────────────────────── */}
        {currentStep === 'payment' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-5 w-5 text-red-500" />
                  {t('payment.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {t('payment.amount')}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    —
                  </span>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      {isRTL ? 'رقم البطاقة' : 'Card Number'}
                    </label>
                    <Input
                      placeholder="4242 4242 4242 4242"
                      dir="ltr"
                      className="text-left"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        {isRTL ? 'تاريخ الانتهاء' : 'Expiry'}
                      </label>
                      <Input placeholder="MM/YY" dir="ltr" className="text-left" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        CVC
                      </label>
                      <Input placeholder="123" dir="ltr" className="text-left" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCurrentStep('confirm')}
              >
                {t('common.back')}
              </Button>
              <Button
                className="flex-1 bg-red-500 text-white hover:bg-red-600"
                onClick={handlePayment}
                disabled={processPaymentMutation.isPending}
              >
                {processPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isRTL ? 'جاري المعالجة...' : 'Processing...'}
                  </>
                ) : (
                  t('payment.pay')
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Step 4: Success ──────────────────────────────────── */}
        {currentStep === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
            >
              <Check className="h-10 w-10 text-emerald-600" />
            </motion.div>
            <h2 className="text-xl font-bold text-gray-900">
              {t('payment.success')}
            </h2>
            <p className="text-sm text-gray-500">
              {isRTL
                ? `تم تأكيد حجزك بنجاح - #${bookingId.slice(0, 8)}`
                : `Your booking has been confirmed - #${bookingId.slice(0, 8)}`}
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => goBack()}
              >
                {t('common.back')}
              </Button>
              <Button
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={() => goBack()}
              >
                {isRTL ? 'الذهاب للرئيسية' : 'Go Home'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
