'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight, Star, MapPin, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigationStore } from '@/stores/navigationStore';
import { Badge } from '@/components/ui/badge';

export interface Listing {
  id: string;
  title: string;
  titleAr?: string;
  category: string;
  categoryAr?: string;
  price: number;
  currency?: string;
  providerName: string;
  providerNameAr?: string;
  location?: string;
  locationAr?: string;
  rating?: number;
  reviewCount?: number;
  images?: string[];
  isFeatured?: boolean;
  isFavorite?: boolean;
}

interface ServiceCardProps {
  listing: Listing;
}

const placeholderGradients = [
  'from-rose-400 to-orange-300',
  'from-violet-400 to-purple-300',
  'from-emerald-400 to-teal-300',
  'from-amber-400 to-yellow-300',
  'from-sky-400 to-blue-300',
  'from-pink-400 to-fuchsia-300',
];

function formatPrice(price: number, currency: string = 'SYP'): string {
  if (currency === 'SYP') {
    return `${price.toLocaleString('ar-SA')} ل.س`;
  }
  return `${currency} ${price.toLocaleString()}`;
}

export function ServiceCard({ listing }: ServiceCardProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(listing.isFavorite ?? false);
  const { language, isRTL } = useLanguage();
  const navigate = useNavigationStore((s) => s.navigate);

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : [`gradient-${listing.id}`];

  const gradientIndex =
    listing.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    placeholderGradients.length;

  const handleClick = () => {
    navigate('listing-detail', { id: listing.id });
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const title = language === 'ar' && listing.titleAr ? listing.titleAr : listing.title;
  const category = language === 'ar' && listing.categoryAr ? listing.categoryAr : listing.category;
  const provider = language === 'ar' && listing.providerNameAr ? listing.providerNameAr : listing.providerName;
  const location = language === 'ar' && listing.locationAr ? listing.locationAr : listing.location;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group cursor-pointer"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5">
        {/* Image or Gradient Placeholder */}
        {images[currentImage]?.startsWith('gradient-') ? (
          <div
            className={`w-full h-full bg-gradient-to-br ${placeholderGradients[gradientIndex]} flex items-center justify-center`}
          >
            <span className="text-white/80 text-4xl font-bold">
              {title.charAt(0)}
            </span>
          </div>
        ) : (
          <img
            src={images[currentImage]}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavorite}
          className="absolute top-3 end-3 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'
            }`}
          />
        </button>

        {/* Featured Badge */}
        {listing.isFeatured && (
          <div className="absolute top-3 start-3 z-10">
            <Badge className="bg-amber-500 text-white border-0 gap-1 shadow-sm">
              <Award className="w-3 h-3" />
              {language === 'ar' ? 'مميز' : 'Featured'}
            </Badge>
          </div>
        )}

        {/* Navigation Arrows (visible on hover) */}
        {images.length > 1 && isHovered && (
          <>
            <button
              onClick={prevImage}
              className={`absolute top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-opacity ${
                isRTL ? 'right-2' : 'left-2'
              }`}
              aria-label="Previous image"
            >
              {isRTL ? (
                <ChevronRight className="w-3.5 h-3.5 text-gray-800" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5 text-gray-800" />
              )}
            </button>
            <button
              onClick={nextImage}
              className={`absolute top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-opacity ${
                isRTL ? 'left-2' : 'right-2'
              }`}
              aria-label="Next image"
            >
              {isRTL ? (
                <ChevronLeft className="w-3.5 h-3.5 text-gray-800" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-gray-800" />
              )}
            </button>
          </>
        )}

        {/* Carousel Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1 rounded-full transition-all duration-200 ${
                  idx === currentImage
                    ? 'w-3 bg-white'
                    : 'w-1 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="space-y-1">
        {/* Category Badge */}
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-gray-500 border-gray-200">
          {category}
        </Badge>

        {/* Title */}
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-red-500 transition-colors">
          {title}
        </h3>

        {/* Location & Rating Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-gray-500">
            {location && (
              <>
                <MapPin className="w-3 h-3" />
                <span className="text-xs line-clamp-1">{location}</span>
              </>
            )}
          </div>
          {listing.rating != null && (
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-gray-700">
                {listing.rating.toFixed(1)}
              </span>
              {listing.reviewCount != null && (
                <span className="text-xs text-gray-400">
                  ({listing.reviewCount})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Provider & Price Row */}
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-xs text-gray-500">{provider}</span>
          <span className="font-bold text-sm text-gray-900">
            {formatPrice(listing.price, listing.currency)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
