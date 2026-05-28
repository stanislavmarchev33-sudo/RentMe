import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { MapPin, Star, MessageSquare } from 'lucide-react';

const fallbackImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop';

export default function PromoInlineCard({ listing }) {
  const { lang } = useI18n();
  const imgSrc = listing.images?.[0] || fallbackImage;

  return (
    <div
      className="bg-white rounded-3xl overflow-hidden border border-[#7b2ff7]/15 transition-all duration-300 hover:-translate-y-1"
      style={{ boxShadow: '0 8px 32px rgba(123,47,247,0.16)' }}
    >
      <Link to={`/listing/${listing.id}`} className="block">
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <img
            src={imgSrc}
            alt={listing.title}
            onError={e => { e.target.src = fallbackImage; }}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            style={{ transform: 'scale(1.03)', transformOrigin: 'center' }}
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
        <h3 className="font-heading font-bold text-[#1e2a6e] text-base leading-tight line-clamp-2 mb-2">
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