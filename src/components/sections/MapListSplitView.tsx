'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
  MapPin,
  Map,
  X,
  SlidersHorizontal,
  Building2,
  Home,
  LandPlot,
  Briefcase,
  ChevronDown,
} from 'lucide-react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { useListings } from '@/hooks/useApi';
import { ListingCard } from '@/components/ui/ListingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ════════════════════════════════════════════════════════════════════
// Filter Configuration
// ════════════════════════════════════════════════════════════════════

interface FilterChip {
  id: string;
  labelAr: string;
  labelEn: string;
  group: 'price' | 'type' | 'rooms';
}

const PRICE_FILTERS: FilterChip[] = [
  { id: 'price-1', labelAr: 'أقل من 50M', labelEn: 'Under 50M', group: 'price' },
  { id: 'price-2', labelAr: '50M-200M', labelEn: '50M-200M', group: 'price' },
  { id: 'price-3', labelAr: '200M-500M', labelEn: '200M-500M', group: 'price' },
  { id: 'price-4', labelAr: '500M+', labelEn: '500M+', group: 'price' },
];

const TYPE_FILTERS: FilterChip[] = [
  { id: 'type-apt', labelAr: 'شقة', labelEn: 'Apartment', group: 'type' },
  { id: 'type-villa', labelAr: 'فيلا', labelEn: 'Villa', group: 'type' },
  { id: 'type-land', labelAr: 'أرض', labelEn: 'Land', group: 'type' },
  { id: 'type-office', labelAr: 'مكتب', labelEn: 'Office', group: 'type' },
];

const ROOMS_FILTERS: FilterChip[] = [
  { id: 'rooms-1', labelAr: '1', labelEn: '1', group: 'rooms' },
  { id: 'rooms-2', labelAr: '2', labelEn: '2', group: 'rooms' },
  { id: 'rooms-3', labelAr: '3', labelEn: '3', group: 'rooms' },
  { id: 'rooms-4', labelAr: '4+', labelEn: '4+', group: 'rooms' },
];

const ALL_FILTERS = [...PRICE_FILTERS, ...TYPE_FILTERS, ...ROOMS_FILTERS];

// ════════════════════════════════════════════════════════════════════
// City Definitions & Filtering
// ════════════════════════════════════════════════════════════════════

interface SyrianCity {
  id: string;
  nameAr: string;
  nameEn: string;
  keywords: string[];
  mapRegion?: { x: number; y: number; w: number; h: number };
}

const SYRIAN_CITIES: SyrianCity[] = [
  { id: 'all', nameAr: 'كل المدن', nameEn: 'All Cities', keywords: [] },
  { id: 'damascus', nameAr: 'دمشق', nameEn: 'Damascus', keywords: ['دمشق', 'damascus', 'شام', 'الشام'], mapRegion: { x: 35, y: 30, w: 40, h: 40 } },
  { id: 'aleppo', nameAr: 'حلب', nameEn: 'Aleppo', keywords: ['حلب', 'aleppo'], mapRegion: { x: 30, y: 5, w: 40, h: 25 } },
  { id: 'homs', nameAr: 'حمص', nameEn: 'Homs', keywords: ['حمص', 'homs'], mapRegion: { x: 30, y: 30, w: 20, h: 15 } },
  { id: 'hama', nameAr: 'حماة', nameEn: 'Hama', keywords: ['حماة', 'hama'], mapRegion: { x: 30, y: 18, w: 20, h: 15 } },
  { id: 'latakia', nameAr: 'اللاذقية', nameEn: 'Latakia', keywords: ['اللاذقية', 'latakia', 'لاذقية'], mapRegion: { x: 5, y: 20, w: 25, h: 20 } },
  { id: 'tartus', nameAr: 'طرطوس', nameEn: 'Tartus', keywords: ['طرطوس', 'tartus'], mapRegion: { x: 5, y: 35, w: 25, h: 20 } },
  { id: 'idlib', nameAr: 'إدلب', nameEn: 'Idlib', keywords: ['إدلب', 'idlib', 'ادلب'], mapRegion: { x: 15, y: 10, w: 20, h: 15 } },
  { id: 'deir-ez-zor', nameAr: 'دير الزور', nameEn: 'Deir ez-Zor', keywords: ['دير الزور', 'deir ez-zor', 'ديرالزور', 'دير'], mapRegion: { x: 70, y: 30, w: 25, h: 25 } },
  { id: 'raqqa', nameAr: 'الرقة', nameEn: 'Raqqa', keywords: ['الرقة', 'raqqa', 'رقة'], mapRegion: { x: 60, y: 15, w: 25, h: 20 } },
  { id: 'daraa', nameAr: 'درعا', nameEn: 'Daraa', keywords: ['درعا', 'daraa'], mapRegion: { x: 25, y: 65, w: 25, h: 20 } },
  { id: 'hasakah', nameAr: 'الحسكة', nameEn: 'Hasakah', keywords: ['الحسكة', 'hasakah', 'حسكة'], mapRegion: { x: 75, y: 10, w: 20, h: 20 } },
  { id: 'sweida', nameAr: 'السويداء', nameEn: 'Sweida', keywords: ['السويداء', 'sweida', 'سويداء'], mapRegion: { x: 30, y: 70, w: 25, h: 20 } },
];

function filterByCity(listings: { id: string; title: string; providerName?: string; category: string; price: number }[], cityId: string) {
  if (cityId === 'all') return listings;
  const city = SYRIAN_CITIES.find((c) => c.id === cityId);
  if (!city) return listings;
  return listings.filter((listing) => {
    const text = `${listing.title} ${listing.providerName ?? ''}`.toLowerCase();
    return city.keywords.some((kw) => text.includes(kw.toLowerCase()));
  });
}

function groupByCity(listings: { id: string; title: string; providerName?: string; category: string; price: number }[]) {
  const groups: Record<string, { city: SyrianCity; listings: typeof listings }> = {};
  for (const listing of listings) {
    const text = `${listing.title} ${listing.providerName ?? ''}`.toLowerCase();
    let matched = false;
    for (const city of SYRIAN_CITIES) {
      if (city.id === 'all') continue;
      if (city.keywords.some((kw) => text.includes(kw.toLowerCase()))) {
        if (!groups[city.id]) groups[city.id] = { city, listings: [] };
        groups[city.id].listings.push(listing);
        matched = true;
        break;
      }
    }
    if (!matched) {
      if (!groups['other']) groups['other'] = { city: { id: 'other', nameAr: 'أخرى', nameEn: 'Other', keywords: [] }, listings: [] };
      groups['other'].listings.push(listing);
    }
  }
  return groups;
}

// ════════════════════════════════════════════════════════════════════
// SVG Map — Damascus & Surrounding Areas Visualization
// ════════════════════════════════════════════════════════════════════

interface MapDot {
  id: string;
  x: number;
  y: number;
  color: string;
  price: string;
  category: string;
  listingId: string;
}

/** Deterministic map dots based on listing data */
function generateMapDots(listings: { id: string; category: string; price: number }[]): MapDot[] {
  const categoryColors: Record<string, string> = {
    'real-estate': '#0d9488',
    'cars': '#475569',
    'electronics': '#2563eb',
    'restaurants': '#d97706',
    'hotels': '#7c3aed',
    'medical': '#dc2626',
    'beauty': '#db2777',
    'education': '#4f46e5',
    'services': '#059669',
    default: '#6b7280',
  };

  // Damascus area district positions (approximate SVG coordinates)
  const districtPositions = [
    { x: 45, y: 40 },   // المزة (Al-Mezzeh)
    { x: 55, y: 35 },   // كفرسوسة (Kafr Souseh)
    { x: 35, y: 45 },   // أبو رمانة (Abu Rummaneh)
    { x: 60, y: 50 },   // البرامكة (Al-Baramkeh)
    { x: 50, y: 55 },   // الميدان (Al-Midan)
    { x: 40, y: 30 },   // المهاجرين (Al-Muhajireen)
    { x: 65, y: 40 },   // الشعلان (Al-Shaalan)
    { x: 30, y: 55 },   // كفرسوسة التحتا (Kafr Souseh Lower)
    { x: 70, y: 55 },   // القصور (Al-Qusour)
    { x: 75, y: 30 },   // الروضة (Al-Rawdah)
    { x: 25, y: 35 },   // قدسيا (Qudsaya)
    { x: 20, y: 50 },   // الديماس (Al-Dimas)
    { x: 80, y: 45 },   // جرمانا (Jaramana)
    { x: 55, y: 70 },   // داريا (Daraya)
    { x: 85, y: 60 },   // الضاحية (Dahia)
    { x: 50, y: 20 },   // بلودان (Bloudan)
  ];

  return listings.slice(0, 16).map((listing, i) => {
    const pos = districtPositions[i % districtPositions.length];
    const jitterX = (Math.sin(i * 137.5) * 4);
    const jitterY = (Math.cos(i * 97.3) * 4);

    return {
      id: `dot-${listing.id}`,
      x: pos.x + jitterX,
      y: pos.y + jitterY,
      color: categoryColors[listing.category] ?? categoryColors.default,
      price: `ل.س ${(listing.price / 100).toLocaleString('ar-SY')}`,
      category: listing.category,
      listingId: listing.id,
    };
  });
}

function MapPlaceholder({
  dots,
  hoveredDotId,
  onDotHover,
  onDotClick,
}: {
  dots: MapDot[];
  hoveredDotId: string | null;
  onDotHover: (id: string | null) => void;
  onDotClick: (listingId: string) => void;
}) {
  const { isRTL } = useLanguage();

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 overflow-hidden">
      {/* SVG Map */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        {/* Grid pattern — roads */}
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path
              d="M 10 0 L 0 0 0 10"
              fill="none"
              stroke="#d1d5db"
              strokeWidth="0.15"
              opacity="0.6"
            />
          </pattern>
          <pattern id="mainRoads" width="25" height="25" patternUnits="userSpaceOnUse">
            <path
              d="M 25 0 L 0 0 0 25"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="0.3"
              opacity="0.4"
            />
          </pattern>
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background grid */}
        <rect width="100" height="100" fill="url(#grid)" />
        <rect width="100" height="100" fill="url(#mainRoads)" />

        {/* Damascus Ring Road */}
        <ellipse
          cx="50"
          cy="52"
          rx="38"
          ry="36"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="0.6"
          opacity="0.4"
          strokeDasharray="2 1"
        />

        {/* Autostrad Road (vertical) */}
        <line
          x1="50"
          y1="5"
          x2="50"
          y2="95"
          stroke="#f59e0b"
          strokeWidth="0.5"
          opacity="0.5"
        />

        {/* Mezzeh Autostrad (horizontal) */}
        <line
          x1="5"
          y1="50"
          x2="95"
          y2="50"
          stroke="#f59e0b"
          strokeWidth="0.5"
          opacity="0.5"
        />

        {/* District labels */}
        <text x="50" y="18" textAnchor="middle" fontSize="2.2" fill="#6b7280" fontWeight="600" fontFamily="sans-serif">
          شمال دمشق
        </text>
        <text x="20" y="52" textAnchor="middle" fontSize="2" fill="#9ca3af" fontFamily="sans-serif">
          قدسيا
        </text>
        <text x="75" y="35" textAnchor="middle" fontSize="2" fill="#9ca3af" fontFamily="sans-serif">
          المزة
        </text>
        <text x="50" y="85" textAnchor="middle" fontSize="2.2" fill="#6b7280" fontWeight="600" fontFamily="sans-serif">
          ريف دمشق
        </text>

        {/* Listing dots */}
        {dots.map((dot, dotIndex) => {
          const isHovered = hoveredDotId === dot.id;
          const showPriceBubble = dotIndex < 6 || isHovered;
          return (
            <g
              key={dot.id}
              onMouseEnter={() => onDotHover(dot.id)}
              onMouseLeave={() => onDotHover(null)}
              onClick={() => onDotClick(dot.listingId)}
              className="cursor-pointer"
              filter={isHovered ? 'url(#glow)' : undefined}
            >
              {/* Pulse ring for hovered */}
              {isHovered && (
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r="4"
                  fill="none"
                  stroke={dot.color}
                  strokeWidth="0.3"
                  opacity="0.4"
                >
                  <animate
                    attributeName="r"
                    from="2"
                    to="5"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.6"
                    to="0"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Dot shadow */}
              <circle
                cx={dot.x}
                cy={dot.y + 0.3}
                r={isHovered ? 2 : 1.3}
                fill="rgba(0,0,0,0.15)"
              />

              {/* Main dot */}
              <circle
                cx={dot.x}
                cy={dot.y}
                r={isHovered ? 2 : 1.3}
                fill={dot.color}
                stroke="#fff"
                strokeWidth="0.3"
                style={{ transition: 'r 0.2s ease' }}
              />

              {/* Price bubble — shown for first 6 dots and on hover */}
              {showPriceBubble && (
                <g>
                  <rect
                    x={dot.x - 6}
                    y={dot.y - 5.5}
                    width="12"
                    height="3.5"
                    rx="1"
                    fill={dot.color}
                    opacity={isHovered ? 1 : 0.85}
                  />
                  <text
                    x={dot.x}
                    y={dot.y - 3.2}
                    textAnchor="middle"
                    fontSize="1.8"
                    fill="#fff"
                    fontWeight="700"
                    fontFamily="sans-serif"
                  >
                    {dot.price}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* "Approximate Location" label */}
        <g>
          <rect
            x="30"
            y="93"
            width="40"
            height="5"
            rx="1.5"
            fill="rgba(255,255,255,0.9)"
            stroke="#d1d5db"
            strokeWidth="0.2"
          />
          <text
            x="50"
            y="96.5"
            textAnchor="middle"
            fontSize="2.5"
            fill="#6b7280"
            fontWeight="500"
            fontFamily="sans-serif"
          >
            الموقع التقريبي
          </text>
        </g>
      </svg>

      {/* Map legend */}
      <div className="absolute bottom-3 start-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm text-[10px] space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-600" />
          <span className="text-gray-600">عقارات</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-600" />
          <span className="text-gray-600">مطاعم</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-600" />
          <span className="text-gray-600">طبي</span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// Filter Chips Component
// ════════════════════════════════════════════════════════════════════

function FilterChips({
  activeFilters,
  onToggleFilter,
  onClearAll,
}: {
  activeFilters: Set<string>;
  onToggleFilter: (id: string) => void;
  onClearAll: () => void;
}) {
  const { language, tAr } = useLanguage();
  const isArabic = language === 'ar';

  const groups: { label: string; filters: FilterChip[] }[] = [
    { label: tAr('السعر', 'Price'), filters: PRICE_FILTERS },
    { label: tAr('النوع', 'Type'), filters: TYPE_FILTERS },
    { label: tAr('الغرف', 'Rooms'), filters: ROOMS_FILTERS },
  ];

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">
            {tAr('تصفية النتائج', 'Filter Results')}
          </span>
        </div>
        {activeFilters.size > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            {tAr('مسح الكل', 'Clear All')}
          </button>
        )}
      </div>

      {/* Filter groups */}
      <div className="space-y-1.5">
        {groups.map((group) => (
          <div key={group.label} className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-medium text-gray-400 w-12 shrink-0">
              {group.label}
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {group.filters.map((chip) => {
                const isActive = activeFilters.has(chip.id);
                return (
                  <button
                    key={chip.id}
                    onClick={() => onToggleFilter(chip.id)}
                    className={`
                      px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200
                      ${isActive
                        ? 'bg-teal-600 text-white shadow-sm scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {isArabic ? chip.labelAr : chip.labelEn}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Active count */}
      {activeFilters.size > 0 && (
        <div className="flex items-center gap-1.5 pt-1">
          <Badge variant="secondary" className="text-[10px] h-5">
            {activeFilters.size} {tAr('فلتر نشط', 'active filters')}
          </Badge>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// Listing Card Skeleton
// ════════════════════════════════════════════════════════════════════

function ListingCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[200px] sm:w-[220px]">
      <Skeleton className="aspect-square rounded-xl mb-2.5" />
      <Skeleton className="h-3.5 w-3/4 mb-1.5" />
      <Skeleton className="h-3 w-1/2 mb-1.5" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// Mobile Bottom Sheet
// ════════════════════════════════════════════════════════════════════

function MobileBottomSheet({
  children,
  isOpen,
  onClose,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { tAr } = useLanguage();
  const dragControls = useDragControls();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '70%' }}
          animate={{ y: '0%' }}
          exit={{ y: '100%' }}
          drag="y"
          dragControls={dragControls}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.y > 150) {
              onClose();
            }
          }}
          className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl"
          style={{ height: '70vh' }}
        >
          {/* Drag Handle */}
          <div
            className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Content */}
          <div className="h-full overflow-y-auto pb-20">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ════════════════════════════════════════════════════════════════════
// Main Component: MapListSplitView
// ════════════════════════════════════════════════════════════════════

export default function MapListSplitView() {
  const { language, isRTL, tAr } = useLanguage();
  const isArabic = language === 'ar';
  const navigate = useNavigationStore((s) => s.navigate);

  // ── Data ──
  const { data: listingsData, isLoading, isError } = useListings({ page: 0, size: 20 });
  const listings = listingsData?.content ?? [];

  // ── Filter State ──
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [selectedCity, setSelectedCity] = useState('all');

  const toggleFilter = useCallback((id: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters(new Set());
  }, []);

  // ── Map Hover State ──
  const [hoveredDotId, setHoveredDotId] = useState<string | null>(null);

  // ── Mobile Map Sheet State ──
  const [isMapSheetOpen, setIsMapSheetOpen] = useState(false);

  // ── Filtered Listings ──
  const filteredListings = useMemo(() => {
    // First filter by city
    const cityFilteredListings = filterByCity(listings, selectedCity);
    if (activeFilters.size === 0) return cityFilteredListings;

    const activePrice = PRICE_FILTERS.filter((f) => activeFilters.has(f.id));
    const activeType = TYPE_FILTERS.filter((f) => activeFilters.has(f.id));
    const activeRooms = ROOMS_FILTERS.filter((f) => activeFilters.has(f.id));

    return listings.filter((listing) => {
      // Price filter
      if (activePrice.length > 0) {
        const priceSYP = listing.price / 100;
        const matchesPrice = activePrice.some((f) => {
          switch (f.id) {
            case 'price-1': return priceSYP < 50_000_000;
            case 'price-2': return priceSYP >= 50_000_000 && priceSYP < 200_000_000;
            case 'price-3': return priceSYP >= 200_000_000 && priceSYP < 500_000_000;
            case 'price-4': return priceSYP >= 500_000_000;
            default: return true;
          }
        });
        if (!matchesPrice) return false;
      }

      // Type filter
      if (activeType.length > 0) {
        const cat = listing.category.toLowerCase();
        const matchesType = activeType.some((f) => {
          switch (f.id) {
            case 'type-apt': return cat.includes('apart') || cat.includes('شقة') || cat === 'real-estate';
            case 'type-villa': return cat.includes('villa') || cat.includes('فيلا');
            case 'type-land': return cat.includes('land') || cat.includes('أرض');
            case 'type-office': return cat.includes('office') || cat.includes('مكتب') || cat === 'business';
            default: return true;
          }
        });
        if (!matchesType) return false;
      }

      // Rooms filter — no room data from API, so just pass through
      if (activeRooms.length > 0) {
        // We don't have room count from the API, so we don't filter this out
        return true;
      }

      return true;
    });
  }, [listings, activeFilters, selectedCity]);

  // ── Map Dots (based on filtered listings) ──
  const mapDots = useMemo(() => generateMapDots(filteredListings), [filteredListings]);

  // ── Map dot click ──
  const handleDotClick = useCallback(
    (listingId: string) => {
      navigate('listing-detail', { id: listingId });
    },
    [navigate]
  );

  // ── Listing card hover → map dot highlight ──
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);

  // Sync: hovered listing → dot
  const effectiveHoveredDot = useMemo(() => {
    if (hoveredDotId) return hoveredDotId;
    if (hoveredListingId) return `dot-${hoveredListingId}`;
    return null;
  }, [hoveredDotId, hoveredListingId]);

  // ── Grouped listings by city ──
  const cityGroups = useMemo(() => groupByCity(filteredListings), [filteredListings]);

  // ── Listing Card Props helper ──
  const makeCardProps = useCallback((listing: { id: string; title: string; category: string; price: number; providerName?: string }, idx: number, cityNameAr: string, cityNameEn: string) => ({
    id: listing.id,
    title: listing.title,
    category: listing.category,
    price: listing.price,
    providerName: listing.providerName,
    subtitle: isArabic ? cityNameAr : cityNameEn,
    rating: 3.5 + (Math.sin(idx * 42.7) * 1.5),
    badgeText: tAr(
      ['شقة', 'فيلا', 'أرض', 'مكتب'][idx % 4],
      ['Apartment', 'Villa', 'Land', 'Office'][idx % 4]
    ),
    badgeColor: ['bg-teal-600/90 text-white', 'bg-amber-600/90 text-white', 'bg-emerald-600/90 text-white', 'bg-sky-600/90 text-white'][idx % 4],
    imageIndex: idx,
  }), [isArabic, tAr]);

  return (
    <section className="w-full">
      {/* ── Section Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
            <Map className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {tAr('استكشف على الخريطة', 'Explore on Map')}
            </h2>
            <p className="text-xs text-gray-500">
              {selectedCity !== 'all'
                ? tAr(
                    `${filteredListings.length} عقار في ${SYRIAN_CITIES.find(c => c.id === selectedCity)?.nameAr ?? ''}`,
                    `${filteredListings.length} properties in ${SYRIAN_CITIES.find(c => c.id === selectedCity)?.nameEn ?? ''}`
                  )
                : tAr(
                    `${filteredListings.length} عقار متاح`,
                    `${filteredListings.length} properties available`
                  )
              }
            </p>
          </div>
        </div>
      </div>

      {/* ── City Filter Bar ── */}
      <div className="mb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
          {SYRIAN_CITIES.map((city) => {
            const isSelected = selectedCity === city.id;
            return (
              <button
                key={city.id}
                onClick={() => setSelectedCity(city.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                <span>{isArabic ? city.nameAr : city.nameEn}</span>
                {isSelected && city.id !== 'all' && (
                  <X className="w-3 h-3 hover:scale-110" onClick={(e) => { e.stopPropagation(); setSelectedCity('all'); }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Filter Chips ── */}
      <div className="mb-4 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-100">
        <FilterChips
          activeFilters={activeFilters}
          onToggleFilter={toggleFilter}
          onClearAll={clearFilters}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          Desktop: Split Layout (Map + List)
          ══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_1.2fr] gap-4 min-h-[600px]">
        {/* Map Section — right side in RTL */}
        <div
          className={`rounded-2xl overflow-hidden border border-gray-200 shadow-sm ${
            isRTL ? 'order-2' : 'order-1'
          }`}
        >
          <MapPlaceholder
            dots={mapDots}
            hoveredDotId={effectiveHoveredDot}
            onDotHover={setHoveredDotId}
            onDotClick={handleDotClick}
          />
        </div>

        {/* List Section — left side in RTL */}
        <div
          className={`space-y-2 overflow-y-auto max-h-[600px] pr-1 ${
            isRTL ? 'order-1' : 'order-2'
          }`}
          style={{ scrollbarWidth: 'thin' }}
        >
          {/* Results count */}
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-100 mb-2">
            <span className="text-xs font-medium text-gray-500">
              {tAr(
                `عرض ${filteredListings.length} من ${listings.length} عقار`,
                `Showing ${filteredListings.length} of ${listings.length} properties`
              )}
            </span>
          </div>

          {/* Listing Grid — Grouped by City */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <MapPin className="w-8 h-8 mb-2" />
              <p className="text-sm">{tAr('خطأ في تحميل البيانات', 'Error loading data')}</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <MapPin className="w-8 h-8 mb-2" />
              <p className="text-sm">{tAr('لا توجد نتائج', 'No results found')}</p>
            </div>
          ) : selectedCity !== 'all' ? (
            /* Single city — flat grid */
            <div className="grid grid-cols-2 gap-3">
              {filteredListings.map((listing, idx) => {
                const card = makeCardProps(listing, idx, SYRIAN_CITIES.find(c => c.id === selectedCity)?.nameAr ?? '', SYRIAN_CITIES.find(c => c.id === selectedCity)?.nameEn ?? '');
                return (
                  <div key={card.id}
                    onMouseEnter={() => setHoveredListingId(card.id)}
                    onMouseLeave={() => setHoveredListingId(null)}
                    className={`rounded-xl transition-all duration-200 ${effectiveHoveredDot === `dot-${card.id}` ? 'ring-2 ring-teal-400 ring-offset-2' : ''}`}>
                    <ListingCard {...card} isScrollCard={false} widthClass="w-full" />
                  </div>
                );
              })}
            </div>
          ) : (
            /* All cities — grouped */
            <div className="space-y-4">
              {Object.entries(cityGroups).map(([cityId, group]) => {
                if (group.listings.length === 0) return null;
                const cityName = isArabic ? group.city.nameAr : group.city.nameEn;
                return (
                  <div key={cityId}>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-teal-500" />
                      <h3 className="text-xs font-bold text-gray-700">{cityName}</h3>
                      <span className="text-[10px] text-gray-400">{group.listings.length}</span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {group.listings.map((listing, idx) => {
                        const card = makeCardProps(listing, idx, group.city.nameAr, group.city.nameEn);
                        return (
                          <div key={card.id}
                            onMouseEnter={() => setHoveredListingId(card.id)}
                            onMouseLeave={() => setHoveredListingId(null)}
                            className={`rounded-xl transition-all duration-200 ${effectiveHoveredDot === `dot-${card.id}` ? 'ring-2 ring-teal-400 ring-offset-2' : ''}`}>
                            <ListingCard {...card} isScrollCard={false} widthClass="w-full" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          Mobile: List + Bottom Sheet Map
          ══════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden">
        {/* Listing Grid — Mobile, Grouped by City */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <MapPin className="w-8 h-8 mb-2" />
            <p className="text-sm">{tAr('خطأ في تحميل البيانات', 'Error loading data')}</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <MapPin className="w-8 h-8 mb-2" />
            <p className="text-sm">{tAr('لا توجد نتائج', 'No results found')}</p>
          </div>
        ) : selectedCity !== 'all' ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredListings.map((listing, idx) => {
              const card = makeCardProps(listing, idx, SYRIAN_CITIES.find(c => c.id === selectedCity)?.nameAr ?? '', SYRIAN_CITIES.find(c => c.id === selectedCity)?.nameEn ?? '');
              return (
                <div key={card.id}
                  onMouseEnter={() => setHoveredListingId(card.id)}
                  onMouseLeave={() => setHoveredListingId(null)}
                  className={`rounded-xl transition-all duration-200 ${effectiveHoveredDot === `dot-${card.id}` ? 'ring-2 ring-teal-400 ring-offset-2' : ''}`}>
                  <ListingCard {...card} isScrollCard={false} widthClass="w-full" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(cityGroups).map(([cityId, group]) => {
              if (group.listings.length === 0) return null;
              const cityName = isArabic ? group.city.nameAr : group.city.nameEn;
              return (
                <div key={cityId}>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-teal-500" />
                    <h3 className="text-xs font-bold text-gray-700">{cityName}</h3>
                    <span className="text-[10px] text-gray-400">{group.listings.length}</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {group.listings.map((listing, idx) => {
                      const card = makeCardProps(listing, idx, group.city.nameAr, group.city.nameEn);
                      return (
                        <div key={card.id}
                          onMouseEnter={() => setHoveredListingId(card.id)}
                          onMouseLeave={() => setHoveredListingId(null)}
                          className={`rounded-xl transition-all duration-200 ${effectiveHoveredDot === `dot-${card.id}` ? 'ring-2 ring-teal-400 ring-offset-2' : ''}`}>
                          <ListingCard {...card} isScrollCard={false} widthClass="w-full" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating "Show Map" Button */}
        {!isMapSheetOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40"
          >
            <Button
              onClick={() => setIsMapSheetOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg rounded-full px-5 py-2.5 flex items-center gap-2 text-sm font-semibold"
            >
              <Map className="w-4 h-4" />
              {tAr('عرض الخريطة', 'Show Map')}
            </Button>
          </motion.div>
        )}

        {/* Bottom Sheet Map */}
        <MobileBottomSheet
          isOpen={isMapSheetOpen}
          onClose={() => setIsMapSheetOpen(false)}
        >
          <div className="h-full px-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">
                {tAr('خريطة دمشق', 'Damascus Map')}
              </h3>
              <button
                onClick={() => setIsMapSheetOpen(false)}
                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-200 h-[calc(100%-40px)]">
              <MapPlaceholder
                dots={mapDots}
                hoveredDotId={effectiveHoveredDot}
                onDotHover={setHoveredDotId}
                onDotClick={handleDotClick}
              />
            </div>
          </div>
        </MobileBottomSheet>
      </div>
    </section>
  );
}
