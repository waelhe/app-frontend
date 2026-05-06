/**
 * @license SPDX-License-Identifier: Apache-2.0
 *
 * PriceMapMarker — Villow Pattern 7: Custom map markers with price bubbles.
 *
 * Renders SVG-based price bubbles for map listings, with category-specific
 * gradient backgrounds, hover/selected states, and a cluster variant for
 * zoomed-out views showing count + price range.
 */

'use client';

import { useState, useCallback, memo } from 'react';

// ── Category Gradient Map (matches HomePage.tsx categoryGradients) ────

const categoryGradients: Record<string, { from: string; to: string; fromHex: string; toHex: string }> = {
  'real-estate': { from: 'from-amber-400', to: 'to-orange-500', fromHex: '#fbbf24', toHex: '#f97316' },
  electronics:   { from: 'from-blue-400',   to: 'to-cyan-500',   fromHex: '#60a5fa', toHex: '#06b6d4' },
  cars:          { from: 'from-gray-400',   to: 'to-slate-600',  fromHex: '#9ca3af', toHex: '#475569' },
  services:      { from: 'from-emerald-400',to: 'to-teal-500',   fromHex: '#34d399', toHex: '#14b8a6' },
  jobs:          { from: 'from-purple-400', to: 'to-violet-500', fromHex: '#c084fc', toHex: '#8b5cf6' },
  furniture:     { from: 'from-rose-400',   to: 'to-pink-500',   fromHex: '#fb7185', toHex: '#ec4899' },
  medical:       { from: 'from-red-400',    to: 'to-rose-500',   fromHex: '#f87171', toHex: '#f43f5e' },
  dining:        { from: 'from-orange-400', to: 'to-amber-500',  fromHex: '#fb923c', toHex: '#f59e0b' },
  education:     { from: 'from-indigo-400', to: 'to-blue-500',   fromHex: '#818cf8', toHex: '#3b82f6' },
  beauty:        { from: 'from-pink-400',   to: 'to-fuchsia-500',fromHex: '#f472b6', toHex: '#d946ef' },
  tourism:       { from: 'from-teal-400',   to: 'to-cyan-500',   fromHex: '#2dd4bf', toHex: '#06b6d4' },
  business:      { from: 'from-gray-500',   to: 'to-slate-400',  fromHex: '#6b7280', toHex: '#94a3b8' },
  experiences:   { from: 'from-fuchsia-400',to: 'to-pink-300',   fromHex: '#e879f9', toHex: '#f9a8d4' },
  shopping:      { from: 'from-amber-400',  to: 'to-orange-300', fromHex: '#fbbf24', toHex: '#fdba74' },
  transport:     { from: 'from-sky-400',    to: 'to-blue-300',   fromHex: '#38bdf8', toHex: '#93c5fd' },
  'car-services':{ from: 'from-slate-400',  to: 'to-zinc-500',   fromHex: '#94a3b8', toHex: '#71717a' },
};

const defaultGradient = { from: 'from-gray-400', to: 'to-gray-600', fromHex: '#9ca3af', toHex: '#4b5563' };

// ── Price Formatting ──────────────────────────────────────────────────

/**
 * Formats a price number into a shortened display string.
 * - < 1,000 → raw number (e.g. "850")
 * - 1K–999K → "XXX K" (e.g. "45 K", "1.5K")   — wait, let's use standard:
 * - 1,000–999,999 → "XXXK" (e.g. "45K", "450K")
 * - 1,000,000+ → "X.XM" (e.g. "1.5M", "2M")
 */
function formatPriceShort(price: number): string {
  if (price >= 1_000_000) {
    const millions = price / 1_000_000;
    return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
  }
  if (price >= 1_000) {
    const thousands = price / 1_000;
    return thousands % 1 === 0 ? `${thousands}K` : `${thousands.toFixed(1)}K`;
  }
  return `${price}`;
}

/**
 * Formats a price for full display (hover tooltip).
 */
function formatPriceFull(price: number): string {
  return `${price.toLocaleString('ar-SY')} ل.س`;
}

// ── SVG Gradient ID Generator ─────────────────────────────────────────

let gradientCounter = 0;
function uniqueGradientId(category: string): string {
  gradientCounter += 1;
  return `marker-grad-${category.replace(/[^a-z0-9]/gi, '')}-${gradientCounter}`;
}

// ── Types ─────────────────────────────────────────────────────────────

export interface PriceMapMarkerProps {
  listing: {
    id: string;
    title: string;
    price: number;
    category: string;
    lat?: number;
    lng?: number;
  };
  isHovered?: boolean;
  isSelected?: boolean;
  onHover?: (id: string | null) => void;
  onClick?: (id: string) => void;
}

export interface ClusterMarkerProps {
  count: number;
  minPrice: number;
  maxPrice: number;
  category: string;
  onHover?: () => void;
  onClick?: () => void;
  isHovered?: boolean;
}

// ── PriceMapMarker Component ──────────────────────────────────────────

export const PriceMapMarker = memo(function PriceMapMarker({
  listing,
  isHovered = false,
  isSelected = false,
  onHover,
  onClick,
}: PriceMapMarkerProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const gradient = categoryGradients[listing.category] ?? defaultGradient;
  const gradId = uniqueGradientId(listing.category);
  const priceText = formatPriceShort(listing.price);

  const handleMouseEnter = useCallback(() => {
    setShowTooltip(true);
    onHover?.(listing.id);
  }, [listing.id, onHover]);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
    onHover?.(null);
  }, [onHover]);

  const handleClick = useCallback(() => {
    onClick?.(listing.id);
  }, [listing.id, onClick]);

  // Dynamic dimensions based on text length
  const textWidth = priceText.length * 7 + 16; // approximate
  const bubbleWidth = Math.max(52, textWidth + 16);
  const bubbleHeight = 28;
  const pointerSize = 6;
  const svgWidth = bubbleWidth + 8; // padding for shadow
  const svgHeight = bubbleHeight + pointerSize + 12; // padding for shadow + pointer

  const scale = isHovered ? 1.15 : 1;
  const translateY = isHovered ? -4 : 0;

  return (
    <div
      className="price-map-marker"
      style={{
        position: 'relative',
        cursor: 'pointer',
        transform: `scale(${scale}) translateY(${translateY}px)`,
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${listing.title} - ${formatPriceFull(listing.price)}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
    >
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Category gradient */}
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradient.fromHex} />
            <stop offset="100%" stopColor={gradient.toHex} />
          </linearGradient>

          {/* Drop shadow filter */}
          <filter id={`shadow-${gradId}`} x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="3"
              floodColor="#000"
              floodOpacity="0.25"
            />
          </filter>
        </defs>

        {/* Bubble body with rounded rect */}
        <rect
          x="4"
          y="2"
          width={bubbleWidth}
          height={bubbleHeight}
          rx="8"
          ry="8"
          fill={`url(#${gradId})`}
          filter={`url(#shadow-${gradId})`}
        />

        {/* Pointer triangle at bottom center */}
        <polygon
          points={`${4 + bubbleWidth / 2 - pointerSize},${2 + bubbleHeight} ${4 + bubbleWidth / 2},${2 + bubbleHeight + pointerSize} ${4 + bubbleWidth / 2 + pointerSize},${2 + bubbleHeight}`}
          fill={`url(#${gradId})`}
          filter={`url(#shadow-${gradId})`}
        />

        {/* Selected ring/outline */}
        {isSelected && (
          <rect
            x="2"
            y="0"
            width={bubbleWidth + 4}
            height={bubbleHeight + 4}
            rx="10"
            ry="10"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            opacity="0.9"
          />
        )}

        {/* Hover glow ring */}
        {isHovered && !isSelected && (
          <rect
            x="2"
            y="0"
            width={bubbleWidth + 4}
            height={bubbleHeight + 4}
            rx="10"
            ry="10"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            opacity="0.5"
          />
        )}

        {/* Price text */}
        <text
          x={4 + bubbleWidth / 2}
          y={2 + bubbleHeight / 2 + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize="11"
          fontWeight="700"
          fontFamily="system-ui, -apple-system, sans-serif"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
        >
          {priceText}
        </text>
      </svg>

      {/* Title tooltip on hover */}
      {showTooltip && (
        <div
          className="absolute z-50 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg"
          style={{
            bottom: svgHeight + 4,
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        >
          <div className="font-semibold mb-0.5">{listing.title}</div>
          <div className="text-gray-300">{formatPriceFull(listing.price)}</div>
          {/* Tooltip arrow */}
          <div
            className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900"
          />
        </div>
      )}
    </div>
  );
});

// ── ClusterMarker Component ───────────────────────────────────────────

export const ClusterMarker = memo(function ClusterMarker({
  count,
  minPrice,
  maxPrice,
  category,
  onHover,
  onClick,
  isHovered = false,
}: ClusterMarkerProps) {
  const gradient = categoryGradients[category] ?? defaultGradient;
  const gradId = uniqueGradientId(`cluster-${category}`);
  const priceRange = `${formatPriceShort(minPrice)} - ${formatPriceShort(maxPrice)}`;

  const handleMouseEnter = useCallback(() => {
    onHover?.();
  }, [onHover]);

  const handleMouseLeave = useCallback(() => {
    // no-op for cluster
  }, []);

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  // Dynamic sizing based on count
  const size = count >= 50 ? 56 : count >= 20 ? 48 : count >= 10 ? 42 : 36;
  const svgSize = size + 20; // padding for label + shadow
  const scale = isHovered ? 1.1 : 1;

  return (
    <div
      className="cluster-map-marker"
      style={{
        position: 'relative',
        cursor: 'pointer',
        transform: `scale(${scale})`,
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${count} listings from ${formatPriceShort(minPrice)} to ${formatPriceShort(maxPrice)}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
    >
      <svg
        width={svgSize}
        height={svgSize + 16} // extra for price range label
        viewBox={`0 0 ${svgSize} ${svgSize + 16}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Category gradient */}
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradient.fromHex} />
            <stop offset="100%" stopColor={gradient.toHex} />
          </linearGradient>

          {/* Drop shadow */}
          <filter id={`cshadow-${gradId}`} x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="4"
              floodColor="#000"
              floodOpacity="0.3"
            />
          </filter>
        </defs>

        {/* Outer glow ring on hover */}
        {isHovered && (
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={size / 2 + 4}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            opacity="0.4"
          />
        )}

        {/* Main circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={size / 2}
          fill={`url(#${gradId})`}
          filter={`url(#cshadow-${gradId})`}
        />

        {/* Count number */}
        <text
          x={svgSize / 2}
          y={svgSize / 2 - (count >= 100 ? 2 : 0)}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize={count >= 100 ? '12' : '14'}
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
        >
          {count}
        </text>

        {/* Price range label below circle */}
        <text
          x={svgSize / 2}
          y={svgSize + 10}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#374151"
          fontSize="9"
          fontWeight="600"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {priceRange}
        </text>
      </svg>
    </div>
  );
});

// ── Default Export ─────────────────────────────────────────────────────

export default PriceMapMarker;
