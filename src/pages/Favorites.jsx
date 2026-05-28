import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useFavorites } from '@/lib/useFavorites';
import { Heart, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import FavoriteCard from '@/components/listings/FavoriteCard';

export default function Favorites() {
  const { favorites, toggle, isFavorite } = useFavorites();

  const { data: allListings = [], isLoading } = useQuery({
    queryKey: ['favorites-listings', favorites.join(',')],
    queryFn: async () => {
      if (favorites.length === 0) return [];
      const results = await Promise.all(
        favorites.map(id =>
          base44.entities.Listing.filter({ id }).then(r => r[0]).catch(() => null)
        )
      );
      return results.filter(Boolean);
    },
    enabled: favorites.length > 0,
    initialData: [],
  });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-10">

      {/* Header */}
      <div className="mb-7">
        <h1 className="font-heading text-2xl font-bold text-gray-900">Харесани</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {favorites.length > 0 ? `${favorites.length} запазени обяви` : 'Все още няма запазени'}
        </p>
      </div>

      {/* Content */}
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-pink-50 rounded-3xl flex items-center justify-center mb-5">
            <Heart className="w-10 h-10 text-[#e91e8c]/30" />
          </div>
          <h2 className="font-heading font-bold text-gray-800 text-lg mb-2">Нямаш запазени обяви</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-xs">
            Натисни ❤️ на обява, за да я запазиш тук.
          </p>
          <Link to="/browse">
            <button className="px-6 py-3 rounded-2xl gradient-brand text-white font-semibold text-sm shadow-brand hover:opacity-90 transition-opacity flex items-center gap-2">
              <Search className="w-4 h-4" />
              Разгледай обяви
            </button>
          </Link>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden border border-gray-100">
              <Skeleton className="w-full aspect-[4/3]" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {allListings.map((listing, i) => (
            <FavoriteCard
              key={listing.id}
              listing={listing}
              index={i}
              onUnlike={() => toggle(listing.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}