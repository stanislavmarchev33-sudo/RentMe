import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MapPin, Star, MessageSquare } from 'lucide-react';
import { useFavorites } from '@/lib/useFavorites';

const fallbackImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop';

function PromoCard({ listing }) {
  const { lang } = useI18n();
  const { toggle, isFavorite } = useFavorites();
  const liked = isFavorite(listing.id);
  const imgSrc = listing.images?.[0] || fallbackImage;

  return (
    <div className="shrink-0 w-[260px] bg-white rounded-3xl overflow-hidden border border-gray-100"
      style={{ boxShadow: '0 8px 32px rgba(123,47,247,0.18)' }}>
      <Link to={`/listing/${listing.id}`} className="block">
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <img
            src={imgSrc}
            alt={listing.title}
            onError={e => { e.target.src = fallbackImage; }}
            className="w-full h-full object-cover"
            style={{ transform: 'scale(1.04)', transformOrigin: 'center' }}
            loading="lazy"
          />
          {/* Promo badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-white/95 text-[#7b2ff7] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-[#7b2ff7]/20">
            ⭐ {lang === 'bg' ? 'Препоръчана' : 'Featured'}
          </div>
          {/* Price */}
          <div className="absolute bottom-3 right-3 gradient-bg text-white font-bold text-base px-4 py-2 rounded-xl shadow-brand">
            {listing.daily_price?.toFixed(0)} €/ден
          </div>
        </div>
      </Link>

      <div className="px-4 pt-3 pb-4">
        <h3 className="font-heading font-bold text-[#1e2a6e] text-base leading-tight line-clamp-1 mb-1.5">
          {listing.title}
        </h3>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <MapPin className="w-3 h-3 text-[#7b2ff7] shrink-0" />
            <span>{listing.location_city || '—'}</span>
          </div>
          {listing.rating_avg > 0 && (
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold text-gray-700">{listing.rating_avg.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            to={`/listing/${listing.id}/chat`}
            onClick={e => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#7b2ff7]/25 text-[#7b2ff7] font-semibold text-xs hover:bg-[#7b2ff7]/5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {lang === 'bg' ? 'Съобщение' : 'Message'}
          </Link>
          <Link
            to={`/book/${listing.id}`}
            className="flex-1 flex items-center justify-center py-2 rounded-xl gradient-bg text-white font-semibold text-xs hover:opacity-90 transition-opacity"
          >
            {lang === 'bg' ? 'Наеми' : 'Rent'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PromoCarousel() {
  const { lang } = useI18n();
  const scrollRef = useRef(null);

  const { data: promoListings = [] } = useQuery({
    queryKey: ['promo-listings'],
    queryFn: () => base44.entities.Listing.filter({ status: 'active', is_promoted: true }, '-created_date', 20),
    initialData: [],
  });

  if (promoListings.length === 0) return null;

  return (
    <section className="py-8 bg-white">
      <div className="px-4 sm:px-6 mb-4">
        <h2 className="font-heading text-xl md:text-2xl font-bold text-[#1e2a6e]">
          ⭐ {lang === 'bg' ? 'Препоръчани обяви' : 'Featured Listings'}
        </h2>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {promoListings.map(listing => (
          <div key={listing.id} style={{ scrollSnapAlign: 'start' }}>
            <PromoCard listing={listing} />
          </div>
        ))}
      </div>
    </section>
  );
}