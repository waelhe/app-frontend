'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Building2,
  Smartphone,
  Car,
  Briefcase,
  HardHat,
  Sofa,
  LayoutGrid,
  SlidersHorizontal,
  Star,
  MapPin,
  ChevronDown,
  Clock,
  TrendingUp,
  Stethoscope,
  UtensilsCrossed,
  GraduationCap,
  Sparkles,
  ArrowUpDown,
  Eye,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '@/store/use-language';
import { useNavigationStore } from '@/stores/navigationStore';
import { searchService, catalogService } from '@/lib/api';
import type { ListingSummary } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// ── Category data ──────────────────────────────────────────────────
interface CategoryPill {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: React.ReactNode;
  gradient: string;
}

const categories: CategoryPill[] = [
  { id: 'all', labelAr: 'الكل', labelEn: 'All', icon: <LayoutGrid className="h-3.5 w-3.5" />, gradient: 'from-gray-400 to-gray-500' },
  { id: 'real-estate', labelAr: 'عقارات', labelEn: 'Real Estate', icon: <Building2 className="h-3.5 w-3.5" />, gradient: 'from-amber-400 to-orange-500' },
  { id: 'electronics', labelAr: 'إلكترونيات', labelEn: 'Electronics', icon: <Smartphone className="h-3.5 w-3.5" />, gradient: 'from-blue-400 to-cyan-500' },
  { id: 'cars', labelAr: 'سيارات', labelEn: 'Cars', icon: <Car className="h-3.5 w-3.5" />, gradient: 'from-gray-400 to-slate-600' },
  { id: 'services', labelAr: 'خدمات', labelEn: 'Services', icon: <Briefcase className="h-3.5 w-3.5" />, gradient: 'from-emerald-400 to-teal-500' },
  { id: 'jobs', labelAr: 'وظائف', labelEn: 'Jobs', icon: <HardHat className="h-3.5 w-3.5" />, gradient: 'from-purple-400 to-violet-500' },
  { id: 'furniture', labelAr: 'أثاث', labelEn: 'Furniture', icon: <Sofa className="h-3.5 w-3.5" />, gradient: 'from-rose-400 to-pink-500' },
  { id: 'medical', labelAr: 'طبي', labelEn: 'Medical', icon: <Stethoscope className="h-3.5 w-3.5" />, gradient: 'from-red-400 to-rose-500' },
  { id: 'dining', labelAr: 'مطاعم', labelEn: 'Dining', icon: <UtensilsCrossed className="h-3.5 w-3.5" />, gradient: 'from-orange-400 to-amber-500' },
  { id: 'education', labelAr: 'تعليم', labelEn: 'Education', icon: <GraduationCap className="h-3.5 w-3.5" />, gradient: 'from-indigo-400 to-blue-500' },
  { id: 'beauty', labelAr: 'جمال', labelEn: 'Beauty', icon: <Sparkles className="h-3.5 w-3.5" />, gradient: 'from-pink-400 to-fuchsia-500' },
];

const categoryGradients: Record<string, string> = {
  'real-estate': 'from-amber-400 to-orange-500',
  electronics: 'from-blue-400 to-cyan-500',
  cars: 'from-gray-400 to-slate-600',
  services: 'from-emerald-400 to-teal-500',
  jobs: 'from-purple-400 to-violet-500',
  furniture: 'from-rose-400 to-pink-500',
  medical: 'from-red-400 to-rose-500',
  dining: 'from-orange-400 to-amber-500',
  education: 'from-indigo-400 to-blue-500',
  beauty: 'from-pink-400 to-fuchsia-500',
};

const categoryLabelsAr: Record<string, string> = {
  'real-estate': 'عقارات',
  electronics: 'إلكترونيات',
  cars: 'سيارات',
  services: 'خدمات',
  jobs: 'وظائف',
  furniture: 'أثاث',
  medical: 'طبي',
  dining: 'مطاعم',
  education: 'تعليم',
  beauty: 'جمال',
};

const categoryLabelsEn: Record<string, string> = {
  'real-estate': 'Real Estate',
  electronics: 'Electronics',
  cars: 'Cars',
  services: 'Services',
  jobs: 'Jobs',
  furniture: 'Furniture',
  medical: 'Medical',
  dining: 'Dining',
  education: 'Education',
  beauty: 'Beauty',
};

// ── Popular searches ───────────────────────────────────────────────
const popularSearches = [
  { ar: 'عقارات', en: 'Real Estate', query: 'عقارات' },
  { ar: 'سيارات', en: 'Cars', query: 'سيارات' },
  { ar: 'إلكترونيات', en: 'Electronics', query: 'إلكترونيات' },
  { ar: 'وظائف', en: 'Jobs', query: 'وظائف' },
  { ar: 'أثاث', en: 'Furniture', query: 'أثاث' },
];

// ── Recent searches key ────────────────────────────────────────────
const RECENT_SEARCHES_KEY = 'nabd_recent_searches';
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  if (typeof window === 'undefined') return;
  try {
    const current = getRecentSearches();
    const filtered = current.filter((s) => s !== query);
    const updated = [query, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // localStorage not available
  }
}

function clearRecentSearches() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // localStorage not available
  }
}

// ── Sort options ───────────────────────────────────────────────────
const sortOptions = [
  { value: 'newest', labelAr: 'الأحدث', labelEn: 'Newest' },
  { value: 'price-low', labelAr: 'السعر: من الأقل', labelEn: 'Price: Low-High' },
  { value: 'price-high', labelAr: 'السعر: من الأعلى', labelEn: 'Price: High-Low' },
  { value: 'popular', labelAr: 'الأكثر شعبية', labelEn: 'Most Popular' },
];

// ── Location options ───────────────────────────────────────────────
const locationOptions = [
  { value: 'all', labelAr: 'كل المواقع', labelEn: 'All Locations' },
  { value: 'riyadh', labelAr: 'الرياض', labelEn: 'Riyadh' },
  { value: 'jeddah', labelAr: 'جدة', labelEn: 'Jeddah' },
  { value: 'mecca', labelAr: 'مكة', labelEn: 'Mecca' },
  { value: 'dammam', labelAr: 'الدمام', labelEn: 'Dammam' },
];

// ── Enhanced Listing Card ──────────────────────────────────────────
function ListingCard({
  listing,
  onClick,
}: {
  listing: ListingSummary;
  onClick: () => void;
}) {
  const { t, isRTL } = useLanguage();
  const gradient = categoryGradients[listing.category] ?? 'from-gray-400 to-gray-600';
  const catLabel = isRTL
    ? (categoryLabelsAr[listing.category] ?? listing.category)
    : (categoryLabelsEn[listing.category] ?? listing.category);
  const rating = 3 + Math.random() * 2; // Mock rating

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="cursor-pointer overflow-hidden transition-shadow hover:shadow-lg border border-gray-100"
        onClick={onClick}
      >
        {/* Gradient header */}
        <div className={`h-20 bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
          <Badge className="absolute top-2 start-2 bg-white/90 text-gray-700 text-[10px] px-1.5 py-0 border-0">
            {catLabel}
          </Badge>
          <span className="text-white/30 text-3xl font-bold">{listing.title.charAt(0)}</span>
        </div>
        <CardContent className="p-3 space-y-2">
          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
            {listing.title}
          </h3>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-red-500" dir="ltr">
              {listing.price.toLocaleString()} {t('ر.س', 'SAR')}
            </span>
          </div>

          {/* Rating stars */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.round(rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200'
                }`}
              />
            ))}
            <span className="text-[10px] text-gray-400 ms-1">{rating.toFixed(1)}</span>
          </div>

          {/* Location chip */}
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-gray-400" />
            <span className="text-[10px] text-gray-500">{t('الرياض', 'Riyadh')}</span>
          </div>

          {/* View button */}
          <Button
            size="sm"
            className="w-full bg-red-500 text-white hover:bg-red-600 h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <Eye className="h-3 w-3 me-1" />
            {t('عرض', 'View')}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Skeleton Grid ──────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-20 w-full" />
          <CardContent className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-7 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────
function EmptyState({ isRTL, t }: { isRTL: boolean; t: (ar: string, en: string) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 py-16 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center"
      >
        <Search className="h-10 w-10 text-red-300" />
      </motion.div>
      <div>
        <h3 className="text-lg font-bold text-gray-700 mb-1">
          {t('لا توجد نتائج', 'No Results Found')}
        </h3>
        <p className="text-sm text-gray-400 max-w-xs">
          {t(
            'لم نتمكن من العثور على ما تبحث عنه. جرب كلمات بحث مختلفة أو غير الفلتر.',
            'We couldn\'t find what you\'re looking for. Try different keywords or adjust filters.'
          )}
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <TrendingUp className="h-3.5 w-3.5" />
        <span>{t('جرب البحث عن: عقارات، سيارات، إلكترونيات', 'Try searching: Real Estate, Cars, Electronics')}</span>
      </div>
    </motion.div>
  );
}

// ── Main SearchView ────────────────────────────────────────────────
export function SearchView() {
  const { t, isRTL } = useLanguage();
  const { navigate } = useNavigationStore();

  // Search state
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [conditionFilter, setConditionFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [locationFilter, setLocationFilter] = useState('all');
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);

  // Recent searches
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    return getRecentSearches();
  });

  // Sync recent searches when they change externally
  const refreshRecentSearches = useCallback(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      setSearchTerm(query.trim());
      addRecentSearch(query.trim());
      refreshRecentSearches();
    } else {
      setSearchTerm('');
    }
  }, [query, refreshRecentSearches]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handlePopularSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setSearchTerm(searchQuery);
    addRecentSearch(searchQuery);
    refreshRecentSearches();
  };

  const handleRecentSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setSearchTerm(searchQuery);
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    refreshRecentSearches();
  };

  const toggleConditionFilter = (value: string) => {
    setConditionFilter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const toggleCategoryFilter = (value: string) => {
    setCategoryFilters((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  // Active category for query - combine pill selection and filter chips
  const effectiveCategory = selectedCategory !== 'all'
    ? selectedCategory
    : categoryFilters.length === 1
      ? categoryFilters[0]
      : categoryFilters.length > 1
        ? undefined // multiple categories, let search handle
        : undefined;

  const {
    data: searchResults,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['search', searchTerm, selectedCategory, categoryFilters.join(',')],
    queryFn: () => {
      const cat = selectedCategory !== 'all' ? selectedCategory : undefined;
      return searchService.search({
        q: searchTerm || undefined,
        category: cat,
      });
    },
    enabled: searchTerm !== '' || selectedCategory !== 'all' || categoryFilters.length > 0,
  });

  // Also fetch listings for category-only filtering
  const {
    data: categoryResults,
    isLoading: isCategoryLoading,
  } = useQuery({
    queryKey: ['listings', 'category-filter', categoryFilters.join(',')],
    queryFn: async () => {
      if (categoryFilters.length === 0) return { content: [] };
      const firstCategory = categoryFilters[0];
      return catalogService.byCategory(firstCategory, 0, 20);
    },
    enabled: searchTerm === '' && selectedCategory === 'all' && categoryFilters.length > 0,
  });

  let results: ListingSummary[] = searchResults?.content ?? [];

  // If no search term but category filters, use category results
  if (searchTerm === '' && selectedCategory === 'all' && categoryFilters.length > 0) {
    results = categoryResults?.content ?? [];
  }

  // Client-side filtering
  if (priceMin) {
    results = results.filter((r) => r.price >= parseInt(priceMin));
  }
  if (priceMax) {
    results = results.filter((r) => r.price <= parseInt(priceMax));
  }
  if (categoryFilters.length > 1 && selectedCategory === 'all') {
    results = results.filter((r) => categoryFilters.includes(r.category));
  }

  // Client-side sorting
  if (sortBy === 'price-low') {
    results = [...results].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    results = [...results].sort((a, b) => b.price - a.price);
  }

  const hasActiveFilters = priceMin || priceMax || conditionFilter.length > 0 || categoryFilters.length > 0 || locationFilter !== 'all';
  const isSearching = searchTerm !== '' || selectedCategory !== 'all' || categoryFilters.length > 0;
  const isLoadingState = isLoading || isCategoryLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-4"
    >
      {/* Search Bar */}
      <div className="relative">
        <Search className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('ابحث عن خدمات ومنتجات...', 'Search for services and products...')}
          className={`${isRTL ? 'pr-10 pl-20' : 'pl-10 pr-20'} h-11 border-gray-200 focus-visible:border-red-500 focus-visible:ring-red-500/20`}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSearchTerm('');
            }}
            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRTL ? 'left-12' : 'right-12'}`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <Button
          size="sm"
          className={`absolute top-1/2 -translate-y-1/2 h-8 bg-red-500 text-white hover:bg-red-600 ${isRTL ? 'left-2' : 'right-2'}`}
          onClick={handleSearch}
        >
          {t('بحث', 'Search')}
        </Button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              if (cat.id !== 'all' && !categoryFilters.includes(cat.id)) {
                setCategoryFilters([cat.id]);
              } else if (cat.id === 'all') {
                setCategoryFilters([]);
              }
            }}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              selectedCategory === cat.id || (cat.id !== 'all' && categoryFilters.includes(cat.id))
                ? 'bg-red-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.icon}
            {isRTL ? cat.labelAr : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="font-medium">{t('فلاتر متقدمة', 'Advanced Filters')}</span>
          {hasActiveFilters && (
            <Badge className="bg-red-500 text-white text-[9px] px-1.5 py-0 border-0">
              {[priceMin || priceMax ? 1 : 0, conditionFilter.length > 0 ? 1 : 0, categoryFilters.length > 0 ? 1 : 0, locationFilter !== 'all' ? 1 : 0].reduce((a, b) => a + b, 0)}
            </Badge>
          )}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-8 w-auto text-xs border-0 shadow-none p-0 gap-1 focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {t(opt.labelAr, opt.labelEn)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="border border-gray-200">
              <CardContent className="p-4 space-y-4">
                {/* Price range */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">
                    {t('نطاق السعر', 'Price Range')}
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder={t('الحد الأدنى', 'Min')}
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="flex-1 h-9 text-sm"
                      dir="ltr"
                    />
                    <Separator className="w-4" />
                    <Input
                      type="number"
                      placeholder={t('الحد الأقصى', 'Max')}
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="flex-1 h-9 text-sm"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Category multi-select */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">
                    {t('الفئات', 'Categories')}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.filter((c) => c.id !== 'all').map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategoryFilter(cat.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                          categoryFilters.includes(cat.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cat.icon}
                        {isRTL ? cat.labelAr : cat.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Condition filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">
                    {t('الحالة', 'Condition')}
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'new', labelAr: 'جديد', labelEn: 'New' },
                      { value: 'used', labelAr: 'مستعمل', labelEn: 'Used' },
                      { value: 'refurbished', labelAr: 'مجددد', labelEn: 'Refurbished' },
                    ].map((cond) => (
                      <button
                        key={cond.value}
                        onClick={() => toggleConditionFilter(cond.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                          conditionFilter.includes(cond.value)
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {t(cond.labelAr, cond.labelEn)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">
                    {t('الموقع', 'Location')}
                  </label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locationOptions.map((loc) => (
                        <SelectItem key={loc.value} value={loc.value}>
                          {t(loc.labelAr, loc.labelEn)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear filters */}
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full"
                    onClick={() => {
                      setPriceMin('');
                      setPriceMax('');
                      setConditionFilter([]);
                      setCategoryFilters([]);
                      setLocationFilter('all');
                      setSelectedCategory('all');
                    }}
                  >
                    <X className="h-3.5 w-3.5 me-1" />
                    {t('مسح جميع الفلاتر', 'Clear All Filters')}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      {isSearching && (
        <div className="text-sm text-gray-500 flex items-center gap-2">
          {isLoadingState ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" />
              <span>{t('جاري البحث...', 'Searching...')}</span>
            </div>
          ) : (
            <span>
              {results.length}{' '}
              {isRTL ? 'نتيجة' : 'result' + (results.length !== 1 ? 's' : '')}
            </span>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoadingState && isSearching && <SkeletonGrid />}

      {/* Error State */}
      {isError && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-sm text-red-500">{t('حدث خطأ أثناء البحث', 'An error occurred while searching')}</p>
          <Button variant="outline" size="sm" onClick={handleSearch}>
            {t('إعادة المحاولة', 'Retry')}
          </Button>
        </div>
      )}

      {/* Results Grid */}
      {!isLoadingState && !isError && isSearching && (
        <AnimatePresence mode="wait">
          {results.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            >
              {results.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <ListingCard
                    listing={listing}
                    onClick={() =>
                      navigate('listing-detail', { id: listing.id })
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState isRTL={isRTL} t={t} />
          )}
        </AnimatePresence>
      )}

      {/* Initial State - Popular & Recent Searches */}
      {!isSearching && (
        <div className="space-y-6">
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700">
                    {t('عمليات البحث الأخيرة', 'Recent Searches')}
                  </span>
                </div>
                <button
                  onClick={handleClearRecent}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  {t('مسح', 'Clear')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <motion.button
                    key={`${search}-${index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleRecentSearch(search)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors"
                  >
                    <Clock className="h-3 w-3 text-gray-400" />
                    {search}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Popular searches */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-red-500" />
              <span className="text-sm font-semibold text-gray-700">
                {t('عمليات البحث الشائعة', 'Popular Searches')}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search, index) => (
                <motion.button
                  key={search.en}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                  onClick={() => handlePopularSearch(search.query)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors border border-red-100"
                >
                  <TrendingUp className="h-3 w-3" />
                  {t(search.ar, search.en)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Browse categories */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LayoutGrid className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">
                {t('تصفح حسب الفئة', 'Browse by Category')}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.filter((c) => c.id !== 'all').map((cat, index) => (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setCategoryFilters([cat.id]);
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200"
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cat.gradient} flex items-center justify-center shrink-0`}>
                    {cat.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-start">
                    {isRTL ? cat.labelAr : cat.labelEn}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Search prompt */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-8"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center mx-auto mb-4"
            >
              <Search className="h-8 w-8 text-red-400" />
            </motion.div>
            <h3 className="text-base font-bold text-gray-700 mb-1">
              {t('ابدأ البحث', 'Start Searching')}
            </h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              {t(
                'اكتب كلمة بحث أو اختر فئة لاكتشاف آلاف الخدمات والمنتجات',
                'Type a search term or pick a category to discover thousands of services and products'
              )}
            </p>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
