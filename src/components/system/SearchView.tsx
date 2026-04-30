'use client';

import { useState, useCallback } from 'react';
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
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigationStore } from '@/stores/navigationStore';
import { searchService } from '@/lib/api';
import type { ListingSummary } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryPill {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: React.ReactNode;
}

const categories: CategoryPill[] = [
  { id: 'all', labelAr: 'الكل', labelEn: 'All', icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  { id: 'real-estate', labelAr: 'عقارات', labelEn: 'Real Estate', icon: <Building2 className="h-3.5 w-3.5" /> },
  { id: 'electronics', labelAr: 'إلكترونيات', labelEn: 'Electronics', icon: <Smartphone className="h-3.5 w-3.5" /> },
  { id: 'cars', labelAr: 'سيارات', labelEn: 'Cars', icon: <Car className="h-3.5 w-3.5" /> },
  { id: 'services', labelAr: 'خدمات', labelEn: 'Services', icon: <Briefcase className="h-3.5 w-3.5" /> },
  { id: 'jobs', labelAr: 'وظائف', labelEn: 'Jobs', icon: <HardHat className="h-3.5 w-3.5" /> },
  { id: 'furniture', labelAr: 'أثاث', labelEn: 'Furniture', icon: <Sofa className="h-3.5 w-3.5" /> },
];

function ListingCard({
  listing,
  onClick,
}: {
  listing: ListingSummary;
  onClick: () => void;
}) {
  const { isRTL } = useLanguage();

  return (
    <Card
      className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-gray-900">
              {listing.title}
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              {listing.providerName}
            </p>
          </div>
          <div className="shrink-0" dir="ltr">
            <span className="text-sm font-bold text-red-500">
              {listing.price.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="mt-2">
          <Badge variant="secondary" className="text-[10px]">
            {listing.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function SearchView() {
  const { t, isRTL } = useLanguage();
  const { navigate } = useNavigationStore();

  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSearch = useCallback(() => {
    setSearchTerm(query);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const {
    data: searchResults,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['search', searchTerm, selectedCategory],
    queryFn: () =>
      searchService.search({
        q: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      }),
    enabled: searchTerm !== '' || selectedCategory !== 'all',
  });

  const results = searchResults?.content ?? [];

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
          placeholder={t('common.search')}
          className={`${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'} h-11 border-gray-200 focus-visible:border-red-500 focus-visible:ring-red-500/20`}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSearchTerm('');
            }}
            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRTL ? 'left-3' : 'right-3'}`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              if (searchTerm) {
                // Re-trigger search with new category
                setSearchTerm(searchTerm + ' ');
                setTimeout(() => setSearchTerm(searchTerm), 0);
              }
            }}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-red-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.icon}
            {isRTL ? cat.labelAr : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Results Count */}
      {(searchTerm || selectedCategory !== 'all') && (
        <div className="text-sm text-gray-500">
          {isLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <span>
              {results.length}{' '}
              {isRTL ? 'نتيجة' : 'result' + (results.length !== 1 ? 's' : '')}
            </span>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="mb-2 h-4 w-3/4" />
                <Skeleton className="mb-2 h-3 w-1/2" />
                <Skeleton className="h-5 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-sm text-red-500">{t('common.error')}</p>
          <Button variant="outline" size="sm" onClick={handleSearch}>
            {t('common.retry')}
          </Button>
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && !isError && (searchTerm || selectedCategory !== 'all') && (
        <AnimatePresence mode="wait">
          {results.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-3 sm:grid-cols-2"
            >
              {results.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onClick={() =>
                    navigate('listing-detail', { id: listing.id })
                  }
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-12 text-center"
            >
              <div className="rounded-full bg-gray-100 p-4">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">{t('common.noResults')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Initial Empty State */}
      {!searchTerm && selectedCategory === 'all' && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="rounded-full bg-red-50 p-4">
            <Search className="h-6 w-6 text-red-400" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            {isRTL ? 'ابحث عن خدمات ومنتجات' : 'Search for services and products'}
          </p>
          <p className="text-xs text-gray-400">
            {isRTL
              ? 'اكتب كلمة بحث أو اختر فئة'
              : 'Type a search term or pick a category'}
          </p>
        </div>
      )}
    </motion.div>
  );
}
