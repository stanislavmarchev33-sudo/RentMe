import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fallbackImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop';

export default function FavoriteCard({ listing, index = 0, onUnlike }) {
  const imgSrc = listing.images?.[0] || fallbackImage;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_20px_rgba(30,42,110,0.09)] border border-gray-100 hover:shadow-[0_8px_32px_rgba(123,47,247,0.14)] transition-all duration-300 hover:-translate-y-0.5">

        {/* Image */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <Link to={`/listing/${listing.id}`} className="block w-full h-full">
            <img
              src={imgSrc}
              alt={listing.title}
              onError={e => { e.target.src = fallbackImage; }}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </Link>

          {/* Heart button — filled, removes from favorites */}
          <button
            onClick={onUnlike}
            className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/95 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all border border-gray-100 active:scale-90"
          >
            <motion.div
              whileTap={{ scale: 0.75 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
            </motion.div>
          </button>

          {/* Price pill */}
          <div className="absolute bottom-2.5 right-2.5 gradient-brand text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-brand">
            {listing.daily_price?.toFixed(0)} лв./ден
          </div>
        </div>

        {/* Content */}
        <Link to={`/listing/${listing.id}`}>
          <div className="px-3 pt-3 pb-3">
            <h3 className="font-heading font-bold text-[#1e2a6e] text-sm leading-tight line-clamp-2 mb-1.5">
              {listing.title}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <MapPin className="w-3 h-3 text-[#7b2ff7] shrink-0" />
                <span className="truncate">{listing.location_city || '—'}</span>
              </div>
              {listing.rating_avg > 0 ? (
                <div className="flex items-center gap-0.5">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-2.5 h-2.5 ${i < Math.round(listing.rating_avg) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-gray-600 ml-0.5">{listing.rating_avg.toFixed(1)}</span>
                </div>
              ) : (
                <span className="text-[9px] text-gray-300">—</span>
              )}
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}