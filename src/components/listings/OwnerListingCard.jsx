import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Pencil, Eye, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const fallbackImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop';

const statusConfig = {
  active:         { label: 'Активна',    color: 'bg-green-100 text-green-700' },
  draft:          { label: 'Чернова',    color: 'bg-gray-100 text-gray-500' },
  pending_review: { label: 'На преглед', color: 'bg-yellow-100 text-yellow-700' },
  archived:       { label: 'Архивирана', color: 'bg-gray-100 text-gray-500' },
  suspended:      { label: 'Спряна',     color: 'bg-red-100 text-red-600' },
};

export default function OwnerListingCard({ listing, pendingCount = 0, index = 0 }) {
  const imgSrc = listing.images?.[0] || fallbackImage;
  const status = statusConfig[listing.status] || { label: listing.status, color: 'bg-gray-100 text-gray-500' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05 }}
    >
      <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_20px_rgba(30,42,110,0.09)] border border-gray-100 hover:shadow-[0_8px_32px_rgba(123,47,247,0.14)] transition-all duration-300 hover:-translate-y-0.5">

        {/* Image */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <img
            src={imgSrc}
            alt={listing.title}
            onError={e => { e.target.src = fallbackImage; }}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Insurance badge */}
          {listing.is_insured && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 text-[#7b2ff7] text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border border-[#7b2ff7]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Застрахован
            </div>
          )}

          {/* Price pill */}
          <div className="absolute bottom-4 right-4 gradient-brand text-white font-bold text-lg px-5 py-2.5 rounded-2xl shadow-brand">
            {listing.daily_price?.toFixed(0)} €/ден
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pt-4 pb-5">

          {/* Title + status row */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-heading font-bold text-[#1e2a6e] text-lg leading-tight line-clamp-2 flex-1">
              {listing.title}
            </h3>
            <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
              {status.label}
            </span>
          </div>

          {/* Location + rating + pending */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5 text-gray-500 text-sm">
              <MapPin className="w-3.5 h-3.5 text-[#7b2ff7] shrink-0" />
              <span>{listing.location_city || '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              {listing.rating_avg > 0 ? (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-gray-700">{listing.rating_avg.toFixed(1)}</span>
                </div>
              ) : (
                <span className="text-xs text-gray-400">Нова</span>
              )}
              {pendingCount > 0 && (
                <span className="text-xs font-bold bg-[#e91e8c]/10 text-[#e91e8c] px-2 py-0.5 rounded-full">
                  {pendingCount} заявки
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 mb-4" />

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              to={`/listing/${listing.id}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-[#7b2ff7]/25 text-[#7b2ff7] font-semibold text-sm hover:bg-[#7b2ff7]/5 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Редактирай
            </Link>
            <Link
              to={`/listing/${listing.id}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl gradient-brand text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-brand"
            >
              <Eye className="w-4 h-4" />
              Виж обявата
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}