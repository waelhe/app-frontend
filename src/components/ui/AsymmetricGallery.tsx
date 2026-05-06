'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { useLanguage } from '@/stores/languageStore';

interface AsymmetricGalleryProps {
  images: string[];
  title?: string;
}

export default function AsymmetricGallery({ images, title }: AsymmetricGalleryProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Need at least 1 image
  if (!images || images.length === 0) return null;

  const displayImages = images.slice(0, 5);
  const remainingCount = images.length - 5;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goToPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : images.length - 1);
    }
  };

  const goToNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex < images.length - 1 ? lightboxIndex + 1 : 0);
    }
  };

  return (
    <>
      {/* ── Asymmetric Grid (Zillow/Villow Style) ─────────────────── */}
      <div className="w-full rounded-2xl overflow-hidden shadow-lg">
        {images.length === 1 ? (
          /* Single image */
          <div
            className="relative h-[300px] md:h-[450px] cursor-pointer group"
            onClick={() => openLightbox(0)}
          >
            <Image
              src={images[0]}
              alt={title || ''}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        ) : images.length === 2 ? (
          /* Two images — side by side */
          <div className="grid grid-cols-2 h-[300px] md:h-[450px] gap-0.5">
            {displayImages.map((img, i) => (
              <div
                key={i}
                className="relative cursor-pointer group"
                onClick={() => openLightbox(i)}
              >
                <Image
                  src={img}
                  alt={`${title} - ${i + 1}`}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        ) : (
          /* 3+ images — asymmetric Zillow grid */
          <div className="grid grid-cols-4 grid-rows-2 h-[300px] md:h-[450px] gap-0.5">
            {/* Large hero image — spans 2 cols, 2 rows */}
            <div
              className="col-span-2 row-span-2 relative cursor-pointer group"
              onClick={() => openLightbox(0)}
            >
              <Image
                src={displayImages[0]}
                alt={`${title} - 1`}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
              {/* Start border radius */}
              <div className={`absolute inset-0 ${isArabic ? 'rounded-r-2xl' : 'rounded-l-2xl'}`} />
            </div>

            {/* Small images — 1 col each */}
            {displayImages.slice(1).map((img, i) => (
              <div
                key={i + 1}
                className="relative cursor-pointer group"
                onClick={() => openLightbox(i + 1)}
              >
                <Image
                  src={img}
                  alt={`${title} - ${i + 2}`}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                {/* Show "+X more" overlay on last visible image */}
                {i === 3 && remainingCount > 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      +{remainingCount} {isArabic ? 'صورة' : 'more'}
                    </span>
                  </div>
                )}
                {/* End border radius on last image */}
                {i === 3 && (
                  <div className={`absolute inset-0 ${isArabic ? 'rounded-l-2xl' : 'rounded-r-2xl'}`} />
                )}
              </div>
            ))}

            {/* Fill empty cells if less than 5 images */}
            {Array.from({ length: Math.max(0, 4 - displayImages.length + 1) }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-gray-200" />
            ))}
          </div>
        )}

        {/* Photo count badge */}
        {images.length > 1 && (
          <button
            onClick={() => openLightbox(0)}
            className="absolute bottom-4 end-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 text-white text-sm font-medium backdrop-blur-sm hover:bg-black/80 transition-colors"
          >
            <Camera className="w-4 h-4" />
            {images.length}
          </button>
        )}
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 start-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image counter */}
            <div className="absolute top-4 end-4 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-white text-sm font-medium">
              {lightboxIndex + 1} / {images.length}
            </div>

            {/* Previous button */}
            <button
              onClick={(e) => { e.stopPropagation(); goToPrev(); }}
              className={`absolute ${isArabic ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors`}
            >
              <ChevronLeft className={`w-6 h-6 ${isArabic ? '' : 'rotate-180'}`} />
            </button>

            {/* Next button */}
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className={`absolute ${isArabic ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors`}
            >
              <ChevronRight className={`w-6 h-6 ${isArabic ? '' : 'rotate-180'}`} />
            </button>

            {/* Main image */}
            <div
              className="relative w-[90vw] h-[80vh] max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[lightboxIndex]}
                alt={`${title} - ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>

            {/* Thumbnail strip */}
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-2 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                    i === lightboxIndex ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
