import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { MapPin, Star, ShieldCheck, Heart, MessageSquare, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFavorites } from '@/lib/useFavorites';

const fallbackImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop';

export default function ListingCard({ listing, index = 0, compact = false }) {
  const [showInsuranceText, setShowInsuranceText] = useState(false);
  const { lang } = useI18n();
  const { toggle, isFavorite } = useFavorites();
  const liked = isFavorite(listing.id);
  const imgSrc = listing.images?.[0] || fallbackImage;
  const ownerFirstName = listing.owner_name?.split(' ')[0] || (lang === 'bg' ? 'Собственик' : 'Owner');

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.03 }}
      >
        <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(30,42,110,0.09)] border border-gray-100 hover:shadow-[0_6px_24px_rgba(123,47,247,0.14)] transition-all duration-300 hover:-translate-y-0.5">
          <Link to={`/listing/${listing.id}`} className="block">
            <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <img
                src={imgSrc}
                alt={listing.title}
                onError={e => { e.target.src = fallbackImage; }}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              {listing.is_insured && (
                <motion.button
                  type="button"
                  onClick={() => setShowInsuranceText(!showInsuranceText)}
                  className="absolute top-2 left-2 flex items-center gap-1 bg-white/95 text-[#7b2ff7] text-[10px] font-semibold px-2 py-1 rounded-full shadow-sm border border-[#7b2ff7]/20 hover:bg-white transition-colors"
                >
                  <ShieldCheck className="w-2.5 h-2.5 shrink-0" />
                  <motion.span
                    initial={false}
                    animate={{ opacity: showInsuranceText ? 1 : 0, x: showInsuranceText ? 0 : -10 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: showInsuranceText ? 'block' : 'none' }}
                  >
                    {lang === 'bg' ? 'Застрахован' : 'Insured'}
                  </motion.span>
                </motion.button>
              )}
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(listing.id); }}
                className="absolute top-2 right-2 w-7 h-7 bg-white/95 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all border border-gray-100 active:scale-90"
              >
                <Heart className={`w-3.5 h-3.5 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
              <div className="absolute bottom-2 right-2 gradient-brand text-white font-bold text-xs px-2.5 py-1.5 rounded-xl shadow-brand">
                {listing.daily_price?.toFixed(0)} €/ден
              </div>
            </div>
          </Link>

          <div className="px-3 pt-2.5 pb-3">
            <h3 className="font-heading font-bold text-[#1e2a6e] text-[13px] leading-tight mb-1.5 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.2em' }}>
              {listing.title}
            </h3>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1 text-gray-500 text-[11px]">
                <MapPin className="w-3 h-3 text-[#7b2ff7] shrink-0" />
                <span className="truncate max-w-[70px]">{listing.location_city || '—'}</span>
              </div>
              {listing.rating_avg > 0 ? (
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-[11px] font-semibold text-gray-600">{listing.rating_avg.toFixed(1)}</span>
                </div>
              ) : (
                <span className="text-[10px] text-gray-400">{lang === 'bg' ? 'Нова' : 'New'}</span>
              )}
            </div>
            <div className="flex gap-1.5">
              <Link
                to={`/listing/${listing.id}/chat`}
                state={{ ts: Date.now() }}
                onClick={e => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border border-[#7b2ff7]/25 text-[#7b2ff7] font-semibold text-[11px] hover:bg-[#7b2ff7]/5 transition-colors"
              >
                <MessageSquare className="w-3 h-3" />
                {lang === 'bg' ? 'Чат' : 'Chat'}
              </Link>
              <Link
                to={`/book/${listing.id}`}
                className="flex-1 flex items-center justify-center py-2 rounded-xl gradient-brand text-white font-semibold text-[11px] hover:opacity-90 transition-opacity shadow-brand"
              >
                {lang === 'bg' ? 'Наеми' : 'Rent'}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_20px_rgba(30,42,110,0.10)] border border-gray-100 hover:shadow-[0_8px_32px_rgba(123,47,247,0.15)] transition-all duration-300 hover:-translate-y-1">

        {/* ── Image ── */}
        <Link to={`/listing/${listing.id}`} className="block">
          <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
            <img
              src={imgSrc}
              alt={listing.title}
              onError={e => { e.target.src = fallbackImage; }}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />

            {/* Insurance badge — top left */}
            {listing.is_insured && (
              <motion.button
                type="button"
                onClick={() => setShowInsuranceText(!showInsuranceText)}
                className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 text-[#7b2ff7] text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border border-[#7b2ff7]/20 hover:bg-white transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <motion.span
                  initial={false}
                  animate={{ opacity: showInsuranceText ? 1 : 0, x: showInsuranceText ? 0 : -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: showInsuranceText ? 'block' : 'none' }}
                >
                  {lang === 'bg' ? 'Застрахован' : 'Insured'}
                </motion.span>
              </motion.button>
            )}

            {/* Heart — top right */}
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(listing.id); }}
              className="absolute top-3 right-3 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all border border-gray-100 active:scale-90"
            >
              <motion.div whileTap={{ scale: 0.7 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                <Heart className={`w-4 h-4 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </motion.div>
            </button>

            {/* Price pill — bottom right */}
            <div className="absolute bottom-4 right-4 gradient-brand text-white font-bold text-lg px-5 py-2.5 rounded-2xl shadow-brand">
              {listing.daily_price?.toFixed(0)} €/ден
            </div>
          </div>
        </Link>

        {/* ── Content ── */}
        <div className="px-5 pt-4 pb-5">

          {/* Title */}
          <h3 className="font-heading font-bold text-[#1e2a6e] text-xl leading-tight mb-3 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.5em' }}>
            {listing.title}
          </h3>

          {/* Location + Rating */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5 text-gray-500 text-base">
              <MapPin className="w-4 h-4 text-[#7b2ff7] shrink-0" />
              <span>{listing.location_city || '—'}</span>
            </div>
            <div className="flex items-center gap-1">
              {listing.rating_avg > 0 ? (
                <>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(listing.rating_avg) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 ml-1">{listing.rating_avg.toFixed(1)}</span>
                </>
              ) : (
                <span className="text-xs text-gray-400">{lang === 'bg' ? 'Нова' : 'New'}</span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 mb-4" />

          {/* Deposit + Owner */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#7b2ff7]/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#7b2ff7]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 leading-tight mb-0.5">{lang === 'bg' ? 'Депозит' : 'Deposit'}</p>
                <p className="text-base font-bold text-[#1e2a6e]">{listing.deposit_amount ? `${listing.deposit_amount.toFixed(0)} €` : '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#7b2ff7]/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-[#7b2ff7]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 leading-tight mb-0.5">{lang === 'bg' ? 'Собственик' : 'Owner'}</p>
                <p className="text-base font-bold text-[#1e2a6e]">{ownerFirstName}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Link
              to={`/listing/${listing.id}/chat`}
              state={{ ts: Date.now() }}
              onClick={e => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-[#7b2ff7]/25 text-[#7b2ff7] font-semibold text-base hover:bg-[#7b2ff7]/5 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              {lang === 'bg' ? 'Съобщение' : 'Message'}
            </Link>
            <Link
              to={`/book/${listing.id}`}
              className="flex-1 flex items-center justify-center py-3 rounded-2xl gradient-brand text-white font-semibold text-base hover:opacity-90 transition-opacity shadow-brand"
            >
              {lang === 'bg' ? 'Наеми сега' : 'Rent now'}
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}