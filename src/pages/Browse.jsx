import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ListingCard from '@/components/listings/ListingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, X, Package, SlidersHorizontal } from 'lucide-react';
import { subDays } from 'date-fns';
import {
  LocationFilter, CategoryFilter, PriceFilter,
  TrustFilter, DeliveryFilter, TimeFilter
} from '@/components/browse/FilterBar';
import BrowsePromoCarousel from '@/components/browse/BrowsePromoCarousel';
import PromoSection from '@/components/browse/PromoSection';

// Haversine distance in km
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Category slug → Bulgarian display name mapping
const SLUG_TO_BG = {
  photography: 'Фотография',
  music: 'Музика',
  sports: 'Спорт',
  sport: 'Спорт',
  tools: 'Инструменти',
  tech: 'Технологии',
  party: 'Парти',
  events: 'Парти',
  other: 'Друго',
};

export default function Browse() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialQ = urlParams.get('q') || '';
  const initialCat = urlParams.get('category') || '';

  const [searchQuery, setSearchQuery] = useState(initialQ);

  // Filters
  const [locationFilter, setLocationFilter] = useState([]);
  const [userCoords, setUserCoords] = useState(null); // { lat, lng }


  const [categoryFilter, setCategoryFilter] = useState(
    initialCat ? [SLUG_TO_BG[initialCat] || initialCat] : []
  );
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [trustFilter, setTrustFilter] = useState([]);
  const [deliveryFilter, setDeliveryFilter] = useState([]);
  const [timeFilter, setTimeFilter] = useState([]);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['listings-browse'],
    queryFn: () => base44.entities.Listing.filter({ status: 'active' }, '-created_date', 200),
    initialData: [],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list('sort_order', 50),
    initialData: [],
  });

  const topCategories = categories.filter(c => !c.parent_id && c.is_active);

  // Build a lookup from BG name → category id
  const bgNameToCatId = useMemo(() => {
    const map = {};
    topCategories.forEach(cat => {
      const bg = cat.name_bg || SLUG_TO_BG[cat.slug];
      if (bg) map[bg] = cat.id;
    });
    return map;
  }, [topCategories]);

  const hasFilters = locationFilter.length > 0 || categoryFilter.length > 0 ||
    sortBy !== 'newest' || minPrice || maxPrice ||
    trustFilter.length > 0 || deliveryFilter.length > 0 || timeFilter.length > 0;

  const clearAll = () => {
    setLocationFilter([]);
    setCategoryFilter([]);
    setSortBy('newest');
    setMinPrice('');
    setMaxPrice('');
    setTrustFilter([]);
    setDeliveryFilter([]);
    setTimeFilter([]);
    setSearchQuery('');
  };

  const filtered = useMemo(() => {
    let result = [...listings];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.title?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q) ||
        l.brand?.toLowerCase().includes(q)
      );
    }

    // Recommended filter (overrides all others and shows only promoted)
    if (trustFilter.includes('recommended')) {
      return result.filter(l => l.is_promoted);
    }

    // Location (cities)
    const cities = locationFilter.filter(v => v !== 'near_me');
    const useNearMe = locationFilter.includes('near_me');

    if (cities.length > 0 && !useNearMe) {
      result = result.filter(l => cities.includes(l.location_city));
    } else if (cities.length > 0 && useNearMe) {
      // both: show near_me results OR matching cities
      result = result.filter(l => {
        if (cities.includes(l.location_city)) return true;
        if (userCoords && l.location_lat && l.location_lng) {
          const dist = getDistanceKm(userCoords.lat, userCoords.lng, l.location_lat, l.location_lng);
          return dist <= 50;
        }
        return false;
      });
    } else if (useNearMe) {
      if (userCoords) {
        result = result.filter(l => {
          if (!l.location_lat || !l.location_lng) return false;
          return getDistanceKm(userCoords.lat, userCoords.lng, l.location_lat, l.location_lng) <= 50;
        });
      }
      // if coords not yet available, show all (loading state)
    }

    // Category multi-select (OR within, AND with others)
    if (categoryFilter.length > 0) {
      const catIds = categoryFilter.map(name => bgNameToCatId[name]).filter(Boolean);
      if (catIds.length > 0) {
        result = result.filter(l => catIds.includes(l.category_id));
      }
    }

    // Price range
    if (minPrice) result = result.filter(l => (l.daily_price || 0) >= parseFloat(minPrice));
    if (maxPrice) result = result.filter(l => (l.daily_price || 0) <= parseFloat(maxPrice));

    // Trust filters (AND logic between selections)
    if (trustFilter.includes('insured')) result = result.filter(l => l.is_insured);
    if (trustFilter.includes('trusted')) {
      result = result.sort((a, b) => {
        const diff = (b.rating_count || 0) - (a.rating_count || 0);
        return diff !== 0 ? diff : (b.rating_avg || 0) - (a.rating_avg || 0);
      });
    }

    // Delivery (OR logic)
    if (deliveryFilter.length > 0) {
      result = result.filter(l => {
        if (deliveryFilter.includes('pickup') && l.delivery_pickup) return true;
        if (deliveryFilter.includes('owner') && l.delivery_owner) return true;
        if (deliveryFilter.includes('courier') && l.delivery_courier) return true;
        return false;
      });
    }

    // Time filter (OR logic)
    if (timeFilter.length > 0) {
      const now = new Date();
      const cutoffs = {
        '3days': subDays(now, 3),
        'week': subDays(now, 7),
        'month': subDays(now, 30),
      };
      result = result.filter(l => {
        const created = new Date(l.created_date);
        return timeFilter.some(t => {
          if (t === 'older') return created < cutoffs['month'];
          return cutoffs[t] && created >= cutoffs[t];
        });
      });
    }

    // Sorting
    if (trustFilter.includes('top_rated')) {
      result = result.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
    } else if (sortBy === 'price_low') {
      result = result.sort((a, b) => (a.daily_price || 0) - (b.daily_price || 0));
    } else if (sortBy === 'price_high') {
      result = result.sort((a, b) => (b.daily_price || 0) - (a.daily_price || 0));
    }

    return result;
  }, [listings, searchQuery, locationFilter, userCoords, categoryFilter, sortBy, minPrice, maxPrice, trustFilter, deliveryFilter, timeFilter, bgNameToCatId]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        {/* Search bar */}
        <div className="max-w-6xl mx-auto px-4 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Търси камери, велосипеди, инструменти..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#7b2ff7]/40 focus:ring-2 focus:ring-[#7b2ff7]/8 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter pills */}
        <div className="max-w-6xl mx-auto px-4 pb-3 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 min-w-max">
            <LocationFilter value={locationFilter} onChange={setLocationFilter} onCoordsChange={setUserCoords} />
            <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />
            <PriceFilter sort={sortBy} setSort={setSortBy} minPrice={minPrice} maxPrice={maxPrice} setMinPrice={setMinPrice} setMaxPrice={setMaxPrice} />
            <TrustFilter value={trustFilter} onChange={setTrustFilter} />
            <DeliveryFilter value={deliveryFilter} onChange={setDeliveryFilter} />
            <TimeFilter value={timeFilter} onChange={setTimeFilter} />

            {hasFilters && (
              <button
                onClick={clearAll}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Изчисти всички
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Premium Promo Section - hidden when "recommended" filter is active */}
      {!trustFilter.includes('recommended') && <PromoSection />}

      {/* Results count */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">
          <span className="font-semibold text-[#1e2a6e]">{filtered.length}</span> обяви намерени
        </span>
      </div>

      {/* Grid — 2 columns on mobile, 3 on tablet, 4 on desktop */}
      <div className="max-w-6xl mx-auto px-3 pb-20 md:pb-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-card">
                <Skeleton className="aspect-[4/3]" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-xl text-[#1e2a6e] mb-2">Няма намерени обяви</h3>
            <p className="text-gray-400 text-base mb-5">Опитай с различни филтри</p>
            <button
              onClick={clearAll}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold gradient-brand text-white shadow-brand hover:opacity-90 transition-opacity"
            >
              Изчисти филтрите
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}