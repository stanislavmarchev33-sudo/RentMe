import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronRight, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ListingCard from '@/components/listings/ListingCard';

export default function FeaturedListings() {
  const { lang } = useI18n();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['featured-listings'],
    queryFn: () => base44.entities.Listing.filter({ status: 'active' }, '-created_date', 6),
    initialData: [],
  });

  return (
    <section className="py-14 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#1e2a6e]">
              {lang === 'bg' ? '🔥 Най-добрите оферти' : '🔥 Best Deals'}
            </h2>
            <p className="text-gray-500 mt-1 text-base">
              {lang === 'bg' ? 'Популярни артикули за наем наблизо' : 'Popular items available near you'}
            </p>
          </div>
          <Link
            to="/browse"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/8 text-sm font-semibold text-primary hover:bg-primary/15 transition-colors"
          >
            {lang === 'bg' ? 'Всички обяви' : 'All listings'} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-card">
                <Skeleton className="aspect-[4/3]" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-base">
              {lang === 'bg' ? 'Все още няма обяви. Бъди първият!' : 'No listings yet. Be the first!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        )}

        <div className="sm:hidden mt-6 text-center">
          <Link to="/browse">
            <button className="px-6 py-3 rounded-2xl text-sm font-semibold gradient-brand text-white shadow-brand">
              {lang === 'bg' ? 'Виж всички обяви' : 'View all listings'}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}