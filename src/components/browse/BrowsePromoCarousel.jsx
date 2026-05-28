import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MapPin, Star, MessageSquare } from 'lucide-react';

const fallbackImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop';

function PromoCard({ listing }) {
  const imgSrc = listing.images?.[0] || fallbackImage;
  return (
    <div
      className="shrink-0 w-[200px] sm:w-[220px] bg-white rounded-2xl overflow-hidden border border-[#7b2ff7]/15"
      style={{ boxShadow: '0 6px 24px rgba(123,47,247,0.16)' }}
    >
      <Link to={`/listing/${listing.id}`}>
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <img
            src={imgSrc}
            alt={listing.title}
            onError={e => { e.target.src = fallbackImage; }}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/95 text-[#7b2ff7] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-[#7b2ff7]/20">
            ⭐ Препоръчана
          </div>
          <div className="absolute bottom-2 right-2 gradient-bg text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-brand">
            {listing.daily_price?.toFixed(0)} €/ден
          </div>
        </div>
      </Link>
      <div className="px-3 pt-2.5 pb-3">
        <h3 className="font-heading font-bold text-[#1e2a6e] text-[13px] leading-tight line-clamp-2 mb-1.5">
          {listing.title}
        </h3>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1 text-gray-400 text-[11px]">
            <MapPin className="w-3 h-3 text-[#7b2ff7] shrink-0" />
            <span className="truncate max-w-[80px]">{listing.location_city || '—'}</span>
          </div>
          {listing.rating_avg > 0 && (
            <div className="flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
              <span className="text-[11px] font-semibold text-gray-600">{listing.rating_avg.toFixed(1)}</span>
            </div>
          )}
        </div>
        <Link
          to={`/book/${listing.id}`}
          className="block w-full text-center py-1.5 rounded-xl gradient-bg text-white font-semibold text-xs hover:opacity-90 transition-opacity"
        >
          Наеми сега
        </Link>
      </div>
    </div>
  );
}

export default function BrowsePromoCarousel() {
  const { data: promoListings = [] } = useQuery({
    queryKey: ['promo-listings'],
    queryFn: () => base44.entities.Listing.filter({ status: 'active', is_promoted: true }, '-created_date', 20),
    initialData: [],
  });

  if (promoListings.length === 0) return null;

  return (
    <div className="bg-white border-b border-gray-100 py-4">
      <div className="max-w-6xl mx-auto px-4 mb-3">
        <h2 className="font-heading font-bold text-[#1e2a6e] text-base">
          ⭐ Препоръчани обяви
        </h2>
      </div>
      <div
        className="flex gap-3 overflow-x-auto scrollbar-hide px-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {promoListings.map(listing => (
          <div key={listing.id} style={{ scrollSnapAlign: 'start' }}>
            <PromoCard listing={listing} />
          </div>
        ))}
      </div>
    </div>
  );
}