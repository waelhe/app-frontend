'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { reviewsService, type ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// ── Props ──────────────────────────────────────────────────────────

interface WriteReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  onSuccess?: () => void;
}

// ── Rating Labels ──────────────────────────────────────────────────

const ratingLabelsAr: Record<number, string> = {
  1: 'سيء جداً',
  2: 'سيء',
  3: 'مقبول',
  4: 'جيد',
  5: 'ممتاز',
};

const ratingLabelsEn: Record<number, string> = {
  1: 'Terrible',
  2: 'Poor',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
};

// ── Component ──────────────────────────────────────────────────────

export function WriteReviewDialog({
  open,
  onOpenChange,
  bookingId,
  onSuccess,
}: WriteReviewDialogProps) {
  const { t, isRTL } = useLanguage();

  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // ── Reset state when dialog opens/closes ───────────────────────

  const resetState = useCallback(() => {
    setRating(0);
    setHoveredStar(0);
    setComment('');
    setIsSubmitting(false);
    setIsSuccess(false);
    setError('');
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) resetState();
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetState],
  );

  // ── Submit handler ─────────────────────────────────────────────

  const handleSubmit = async () => {
    if (rating === 0) {
      setError(isRTL ? 'يرجى اختيار تقييم' : 'Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await reviewsService.create({
        bookingId,
        rating,
        comment: comment.trim() || undefined,
      });

      setIsSuccess(true);
      onSuccess?.();
    } catch (err) {
      const apiErr = err as ApiError;
      if (
        apiErr?.category === 'network' ||
        apiErr?.category === 'server' ||
        apiErr?.category === 'timeout'
      ) {
        setError(
          isRTL
            ? 'الخادم غير متاح حالياً، يرجى المحاولة لاحقاً'
            : 'Server is currently unavailable, please try again later',
        );
      } else if (apiErr?.category === 'auth') {
        setError(
          isRTL
            ? 'يرجى تسجيل الدخول أولاً'
            : 'Please sign in to submit a review',
        );
      } else {
        setError(
          apiErr?.detail ||
            (isRTL
              ? 'حدث خطأ أثناء إرسال التقييم'
              : 'An error occurred while submitting your review'),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Derived values ─────────────────────────────────────────────

  const displayStar = hoveredStar || rating;
  const ratingLabel =
    displayStar > 0
      ? isRTL
        ? ratingLabelsAr[displayStar]
        : ratingLabelsEn[displayStar]
      : '';

  // ── Render ──────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {t('review.write')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isRTL
              ? 'شاركنا رأيك في تجربتك'
              : 'Share your experience with us'}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* ── Success State ─────────────────────────────────────── */}
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4 py-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.15, stiffness: 200 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50"
              >
                <CheckCircle2 className="h-10 w-10 text-red-500" />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg font-bold text-gray-900"
              >
                {isRTL ? 'تم إرسال التقييم بنجاح!' : 'Review submitted!'}
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-gray-500"
              >
                {isRTL
                  ? 'شكراً لمساهمتك، رأيك يهمنا'
                  : 'Thank you for your feedback'}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  className="bg-red-500 text-white hover:bg-red-600"
                  onClick={() => handleOpenChange(false)}
                >
                  {t('common.close')}
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            /* ── Review Form ─────────────────────────────────────── */
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Star Rating */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= displayStar;
                    return (
                      <motion.button
                        key={star}
                        type="button"
                        onClick={() => {
                          setRating(star);
                          if (error) setError('');
                        }}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="relative cursor-pointer rounded-md p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
                        aria-label={
                          isRTL
                            ? `تقييم ${star} من 5 نجوم`
                            : `Rate ${star} out of 5 stars`
                        }
                      >
                        <motion.div
                          animate={
                            isFilled
                              ? { rotate: [0, -15, 15, 0], scale: [1, 1.1, 1] }
                              : { rotate: 0, scale: 1 }
                          }
                          transition={
                            isFilled
                              ? { duration: 0.4, ease: 'easeInOut' }
                              : { duration: 0.15 }
                          }
                        >
                          <Star
                            className={`h-9 w-9 transition-colors ${
                              isFilled
                                ? 'fill-red-500 text-red-500'
                                : 'fill-transparent text-gray-300 hover:text-gray-400'
                            }`}
                          />
                        </motion.div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Rating label */}
                <AnimatePresence mode="wait">
                  {ratingLabel && (
                    <motion.span
                      key={displayStar}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="text-sm font-medium text-red-600"
                    >
                      {ratingLabel}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Comment Textarea */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('review.comment')}
                  <span className="text-gray-400">
                    {isRTL ? ' (اختياري)' : ' (optional)'}
                  </span>
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    isRTL
                      ? 'أخبرنا المزيد عن تجربتك...'
                      : 'Tell us more about your experience...'
                  }
                  className="min-h-24 resize-none"
                  maxLength={500}
                  disabled={isSubmitting}
                />
                <p className="text-right text-xs text-gray-400">
                  {comment.length}/500
                </p>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <Button
                className="w-full bg-red-500 text-white hover:bg-red-600"
                onClick={handleSubmit}
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isRTL ? 'جاري الإرسال...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {t('review.submit')}
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
