import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronRight, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ListingCard from '@/components/listings/ListingCard';
import PromoInlineCard from '@/components/listings/PromoInlineCard';

export default function AllListings() {
  const { lang } = useI18n();

  const { data: allListings = [], isLoading } = useQuery({
    queryKey: ['all-listings-home'],
    queryFn: () => base44.entities.Listing.filter({ status: 'active' }, '-created_date', 50),
    initialData: [],
  });

  const { data: promoListings = [] } = useQuery({
    queryKey: ['promo-listings'],
    queryFn: () => base44.entities.Listing.filter({ status: 'active', is_promoted: true }, '-created_date', 20),
    initialData: [],
  });

  // Build the feed: every 7 normal listings, insert 1 promo card
  const promoSet = new Set(promoListings.map(l => l.id));
  const normalListings = allListings.filter(l => !promoSet.has(l.id));

  const feed = [];
  let promoIdx = 0;
  normalListings.forEach((listing, i) => {
    feed.push({ type: 'normal', listing });
    if ((i + 1) % 7 === 0 && promoIdx < promoListings.length) {
      feed.push({ type: 'promo', listing: promoListings[promoIdx] });
      promoIdx++;
    }
  });

  return (
    <section className="py-10 bg-[#f8f8fb]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl md:text-2xl font-bold text-[#1e2a6e]">
            {lang === 'bg' ? 'Всички обяви' : 'All Listings'}
          </h2>
          <Link
            to="/browse"
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            {lang === 'bg' ? 'Виж всички' : 'See all'} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-card">
                <Skeleton className="aspect-[4/3]" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : normalListings.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-base">
              {lang === 'bg' ? 'Все още няма обяви. Бъди първият!' : 'No listings yet. Be the first!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {feed.map((item, i) =>
              item.type === 'promo' ? (
                <div key={`promo-${item.listing.id}-${i}`} className="col-span-2 sm:col-span-1">
                  <PromoInlineCard listing={item.listing} />
                </div>
              ) : (
                <ListingCard key={item.listing.id} listing={item.listing} index={i} />
              )
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/browse">
            <button className="px-8 py-3 rounded-2xl text-sm font-semibold gradient-brand text-white shadow-brand hover:opacity-90 transition-opacity">
              {lang === 'bg' ? 'Виж всички обяви' : 'Browse all listings'}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}