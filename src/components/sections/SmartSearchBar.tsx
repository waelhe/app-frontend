'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  MapPin,
  Building2,
  MapPinned,
  Tag,
  Clock,
  X,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { useSearch } from '@/hooks/useApi';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// ── Classification Data ────────────────────────────────────────────

/** Syrian regions / major cities */
const REGIONS = [
  { ar: 'دمشق', en: 'Damascus' },
  { ar: 'حلب', en: 'Aleppo' },
  { ar: 'حمص', en: 'Homs' },
  { ar: 'حماة', en: 'Hama' },
  { ar: 'اللاذقية', en: 'Latakia' },
  { ar: 'طرطوس', en: 'Tartus' },
  { ar: 'إدلب', en: 'Idlib' },
  { ar: 'دير الزور', en: 'Deir ez-Zor' },
  { ar: 'الرقة', en: 'Raqqa' },
  { ar: 'درعا', en: 'Daraa' },
];

/** Damascus districts / neighborhoods */
const DISTRICTS = [
  { ar: 'المزة', en: 'Al-Mezzeh' },
  { ar: 'كفرسوسة', en: 'Kafr Souseh' },
  { ar: 'البرامكة', en: 'Al-Baramkeh' },
  { ar: 'أبو رمانة', en: 'Abu Rummaneh' },
  { ar: 'الميدان', en: 'Al-Midan' },
  { ar: 'المهاجرين', en: 'Al-Muhajireen' },
  { ar: 'الشعلان', en: 'Al-Shaalan' },
  { ar: 'القصور', en: 'Al-Qusour' },
  { ar: 'الروضة', en: 'Al-Rawdah' },
  { ar: 'قدسيا', en: 'Qudsaya' },
];

/** Category keywords mapping */
const CATEGORIES: Record<string, { categoryId: string; en: string }> = {
  'عقارات': { categoryId: 'real-estate', en: 'Real Estate' },
  'شقة': { categoryId: 'real-estate', en: 'Apartment' },
  'فيلا': { categoryId: 'real-estate', en: 'Villa' },
  'أرض': { categoryId: 'real-estate', en: 'Land' },
  'سيارات': { categoryId: 'cars', en: 'Cars' },
  'سيارة': { categoryId: 'cars', en: 'Car' },
  'سيدان': { categoryId: 'cars', en: 'Sedan' },
  'دفع رباعي': { categoryId: 'cars', en: 'SUV' },
  'وظائف': { categoryId: 'jobs', en: 'Jobs' },
  'عمل': { categoryId: 'jobs', en: 'Work' },
  'توظيف': { categoryId: 'jobs', en: 'Employment' },
  'خدمات': { categoryId: 'services', en: 'Services' },
  'سباكة': { categoryId: 'services', en: 'Plumbing' },
  'كهرباء': { categoryId: 'services', en: 'Electrical' },
  'دهان': { categoryId: 'services', en: 'Painting' },
};

// ── Classification Types ───────────────────────────────────────────

type ClassificationType = 'region' | 'district' | 'category' | 'keyword';

interface ClassificationResult {
  type: ClassificationType;
  label: string;
  labelEn: string;
  emoji: string;
  color: string;
  categoryId?: string;
}

// ── Classification Logic ───────────────────────────────────────────

function classifyInput(query: string, isRTL: boolean): ClassificationResult | null {
  if (!query.trim()) return null;

  const normalized = query.trim();

  // Check regions
  for (const region of REGIONS) {
    if (
      region.ar.includes(normalized) ||
      region.en.toLowerCase().includes(normalized.toLowerCase())
    ) {
      return {
        type: 'region',
        label: 'منطقة',
        labelEn: 'Region',
        emoji: '🏙️',
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      };
    }
  }

  // Check districts
  for (const district of DISTRICTS) {
    if (
      district.ar.includes(normalized) ||
      district.en.toLowerCase().includes(normalized.toLowerCase())
    ) {
      return {
        type: 'district',
        label: 'حي',
        labelEn: 'District',
        emoji: '📍',
        color: 'bg-amber-100 text-amber-700 border-amber-200',
      };
    }
  }

  // Check categories
  for (const [keyword, meta] of Object.entries(CATEGORIES)) {
    if (
      keyword.includes(normalized) ||
      normalized.includes(keyword) ||
      meta.en.toLowerCase().includes(normalized.toLowerCase())
    ) {
      return {
        type: 'category',
        label: 'فئة',
        labelEn: 'Category',
        emoji: '🏷️',
        color: 'bg-rose-100 text-rose-700 border-rose-200',
        categoryId: meta.categoryId,
      };
    }
  }

  // Default: keyword
  return {
    type: 'keyword',
    label: 'كلمة مفتاحية',
    labelEn: 'Keyword',
    emoji: '🔍',
    color: 'bg-slate-100 text-slate-600 border-slate-200',
  };
}

// ── Recent Searches Helpers ────────────────────────────────────────

const STORAGE_KEY = 'nabd_recent_searches';
const MAX_RECENT = 5;

interface RecentSearch {
  query: string;
  type: ClassificationType;
  timestamp: number;
}

function getRecentSearches(): RecentSearch[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function addRecentSearch(query: string, type: ClassificationType): void {
  try {
    const existing = getRecentSearches().filter((s) => s.query !== query);
    const updated = [{ query, type, timestamp: Date.now() }, ...existing].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

function clearRecentSearches(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}

// ── Suggestion Item Type ───────────────────────────────────────────

interface SuggestionItem {
  id: string;
  ar: string;
  en: string;
  type: ClassificationType;
  categoryId?: string;
}

// ── Main Component ─────────────────────────────────────────────────

export default function SmartSearchBar() {
  const { language, isRTL, tAr } = useLanguage();
  const navigate = useNavigationStore((s) => s.navigate);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [recentVersion, setRecentVersion] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Live search via API
  const { data: searchResults } = useSearch(
    query.trim().length >= 2 ? { q: query.trim(), page: 0, size: 5 } : undefined
  );

  // Read recent searches from localStorage (re-read when recentVersion changes or popover opens)
  const recentSearches = useMemo(
    () => getRecentSearches(),
    [recentVersion, open]
  );

  // ── Classification ──
  const classification = useMemo(
    () => classifyInput(query, isRTL),
    [query, isRTL]
  );

  // ── Filter suggestions based on query ──
  const filteredRegions = useMemo(() => {
    if (!query.trim()) return REGIONS.slice(0, 5);
    const normalized = query.trim().toLowerCase();
    return REGIONS.filter(
      (r) =>
        r.ar.includes(normalized) ||
        r.en.toLowerCase().includes(normalized)
    );
  }, [query]);

  const filteredDistricts = useMemo(() => {
    if (!query.trim()) return DISTRICTS.slice(0, 5);
    const normalized = query.trim().toLowerCase();
    return DISTRICTS.filter(
      (d) =>
        d.ar.includes(normalized) ||
        d.en.toLowerCase().includes(normalized)
    );
  }, [query]);

  const filteredCategories = useMemo(() => {
    const items: SuggestionItem[] = Object.entries(CATEGORIES).map(
      ([keyword, meta], idx) => ({
        id: `cat-${idx}`,
        ar: keyword,
        en: meta.en,
        type: 'category' as ClassificationType,
        categoryId: meta.categoryId,
      })
    );
    if (!query.trim()) return items.slice(0, 6);
    const normalized = query.trim().toLowerCase();
    return items.filter(
      (c) =>
        c.ar.includes(normalized) ||
        c.en.toLowerCase().includes(normalized)
    );
  }, [query]);

  // ── Handlers ──
  const handleSelect = useCallback(
    (value: string, type: ClassificationType, categoryId?: string) => {
      const searchQuery = value;
      addRecentSearch(searchQuery, type);
      setRecentVersion((v) => v + 1);
      setQuery('');
      setOpen(false);

      if (categoryId) {
        navigate('search', { q: searchQuery, category: categoryId });
      } else {
        navigate('search', { q: searchQuery });
      }
    },
    [navigate]
  );

  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentVersion((v) => v + 1);
  }, []);

  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (!open && value.trim()) {
        setOpen(true);
      }
    },
    [open]
  );

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setQuery('');
    }
  }, []);

  // ── API search results as suggestions ──
  const apiListings = useMemo(() => {
    if (!searchResults?.content) return [];
    return searchResults.content.slice(0, 3);
  }, [searchResults]);

  // ── Type icon helper ──
  const getTypeIcon = (type: ClassificationType) => {
    switch (type) {
      case 'region':
        return <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'district':
        return <MapPinned className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'category':
        return <Tag className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'keyword':
      default:
        return <Search className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  const getTypeLabel = (type: ClassificationType) => {
    switch (type) {
      case 'region':
        return tAr('منطقة', 'Region');
      case 'district':
        return tAr('حي', 'District');
      case 'category':
        return tAr('فئة', 'Category');
      case 'keyword':
      default:
        return tAr('كلمة مفتاحية', 'Keyword');
    }
  };

  const hasAnySuggestions =
    filteredRegions.length > 0 ||
    filteredDistricts.length > 0 ||
    filteredCategories.length > 0 ||
    recentSearches.length > 0 ||
    apiListings.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <div
            className={`
              relative flex items-center w-full rounded-2xl border bg-white shadow-sm
              transition-all duration-200
              hover:shadow-md focus-within:shadow-md focus-within:ring-2 focus-within:ring-rose-200 focus-within:border-rose-300
              ${open ? 'ring-2 ring-rose-200 border-rose-300 shadow-md' : 'border-gray-200'}
            `}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Search Icon */}
            <div className={`${isRTL ? 'pr-4' : 'pl-4'} flex items-center`}>
              <Search className="w-5 h-5 text-gray-400" />
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                if (!open) setOpen(true);
              }}
              placeholder={tAr('ابحث في نبض...', 'Search Nabd...')}
              className="
                flex-1 py-2.5 bg-transparent text-sm text-gray-900 placeholder:text-gray-400
                outline-none
              "
              aria-label={tAr('البحث', 'Search')}
              autoComplete="off"
            />

            {/* Classification Badge */}
            {classification && query.trim() && (
              <div className={`${isRTL ? 'pl-2' : 'pr-2'} flex items-center`}>
                <Badge
                  variant="outline"
                  className={`${classification.color} text-[10px] px-1.5 py-0 h-6 gap-0.5 font-medium border`}
                >
                  <span className="text-xs">{classification.emoji}</span>
                  <span>
                    {isRTL ? classification.label : classification.labelEn}
                  </span>
                </Badge>
              </div>
            )}

            {/* Clear button */}
            {query.trim() && (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className={`${isRTL ? 'pl-3' : 'pr-3'} text-gray-400 hover:text-gray-600 transition-colors`}
                aria-label={tAr('مسح', 'Clear')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="p-2 w-[var(--radix-popover-trigger-width)] rounded-2xl border border-gray-200 shadow-xl"
          align="start"
          sideOffset={8}
          onInteractOutside={(e) => {
            // Prevent closing when clicking inside the popover content
            const target = e.target as HTMLElement;
            if (target.closest('[data-popover-content]')) {
              e.preventDefault();
            }
          }}
        >
          <div className="max-h-[360px] overflow-y-auto rounded-xl" style={{ scrollbarWidth: 'thin' }}>
            {/* Empty state */}
            {!hasAnySuggestions && query.trim() && (
              <div className="py-6 text-center">
                <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {tAr('لا توجد نتائج', 'No results found')}
                </p>
              </div>
            )}

            {/* ── API Search Results ── */}
            {apiListings.length > 0 && (
              <div className="mb-1">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {tAr('نتائج البحث', 'Search Results')}
                </div>
                {apiListings.map((listing) => (
                  <button
                    key={listing.id}
                    onClick={() => handleSelect(listing.title || listing.id, 'keyword')}
                    className="flex items-center gap-2 px-3 py-2.5 w-full cursor-pointer rounded-lg hover:bg-gray-50 transition-colors text-start"
                  >
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="flex-1 text-sm truncate">
                      {listing.title}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {tAr('إعلان', 'Listing')}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* ── Regions Group ── */}
            {filteredRegions.length > 0 && (
              <div className="mb-1">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {tAr('المناطق', 'Regions')}
                </div>
                {filteredRegions.map((region, idx) => (
                  <button
                    key={`region-${idx}`}
                    onClick={() => handleSelect(region.ar, 'region')}
                    className="flex items-center gap-2 px-3 py-2.5 w-full cursor-pointer rounded-lg hover:bg-emerald-50 transition-colors text-start"
                  >
                    <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="flex-1 text-sm">
                      {isRTL ? region.ar : region.en}
                    </span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md shrink-0">
                      {tAr('منطقة', 'Region')}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* ── Districts Group ── */}
            {filteredDistricts.length > 0 && (
              <div className="mb-1">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {tAr('الأحياء', 'Districts')}
                </div>
                {filteredDistricts.map((district, idx) => (
                  <button
                    key={`district-${idx}`}
                    onClick={() => handleSelect(district.ar, 'district')}
                    className="flex items-center gap-2 px-3 py-2.5 w-full cursor-pointer rounded-lg hover:bg-amber-50 transition-colors text-start"
                  >
                    <MapPinned className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="flex-1 text-sm">
                      {isRTL ? district.ar : district.en}
                    </span>
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md shrink-0">
                      {tAr('حي', 'District')}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* ── Categories Group ── */}
            {filteredCategories.length > 0 && (
              <div className="mb-1">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {tAr('الفئات', 'Categories')}
                </div>
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelect(cat.ar, 'category', cat.categoryId)}
                    className="flex items-center gap-2 px-3 py-2.5 w-full cursor-pointer rounded-lg hover:bg-rose-50 transition-colors text-start"
                  >
                    <Tag className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="flex-1 text-sm">
                      {isRTL ? cat.ar : cat.en}
                    </span>
                    <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md shrink-0">
                      {tAr('فئة', 'Category')}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* ── Recent Searches Group ── */}
            {recentSearches.length > 0 && !query.trim() && (
              <div className="mb-1">
                <div className="flex items-center justify-between w-full px-3 py-1.5">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    {tAr('عمليات البحث الأخيرة', 'Recent Searches')}
                  </span>
                  <button
                    onClick={handleClearRecent}
                    className="text-[10px] text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    {tAr('مسح الكل', 'Clear all')}
                  </button>
                </div>
                {recentSearches.map((search, idx) => (
                  <button
                    key={`recent-${idx}`}
                    onClick={() => handleSelect(search.query, search.type)}
                    className="flex items-center gap-2 px-3 py-2.5 w-full cursor-pointer rounded-lg hover:bg-gray-50 transition-colors text-start"
                  >
                    <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="flex-1 text-sm text-gray-600">
                      {search.query}
                    </span>
                    {getTypeIcon(search.type)}
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {getTypeLabel(search.type)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* ── Quick Actions (when empty) ── */}
            {!query.trim() && recentSearches.length === 0 && (
              <div className="mb-1">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {tAr('بحث سريع', 'Quick Search')}
                </div>
                {[
                  { ar: 'عقارات دمشق', en: 'Damascus Real Estate', type: 'category' as ClassificationType, categoryId: 'real-estate' },
                  { ar: 'سيارات حلب', en: 'Aleppo Cars', type: 'category' as ClassificationType, categoryId: 'cars' },
                  { ar: 'وظائف حمص', en: 'Homs Jobs', type: 'category' as ClassificationType, categoryId: 'jobs' },
                  { ar: 'خدمات سباكة', en: 'Plumbing Services', type: 'category' as ClassificationType, categoryId: 'services' },
                ].map((quick, idx) => (
                  <button
                    key={`quick-${idx}`}
                    onClick={() => handleSelect(quick.ar, quick.type, quick.categoryId)}
                    className="flex items-center gap-2 px-3 py-2.5 w-full cursor-pointer rounded-lg hover:bg-gray-50 transition-colors text-start"
                  >
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="flex-1 text-sm">
                      {isRTL ? quick.ar : quick.en}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {tAr('بحث سريع', 'Quick')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
