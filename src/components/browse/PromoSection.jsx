import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import ListingCard from '@/components/listings/ListingCard';

export default function PromoSection() {
  const { lang } = useI18n();

  const { data: promoListings = [] } = useQuery({
    queryKey: ['promo-listings-browse'],
    queryFn: () => base44.entities.Listing.filter({ status: 'active', is_promoted: true }, '-created_date', 20),
    initialData: [],
  });

  if (promoListings.length === 0) return null;

  return (
    <div className="bg-gradient-to-b from-yellow-50/40 to-transparent border-b border-yellow-100/50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="font-heading font-bold text-2xl text-[#1e2a6e] mb-4 flex items-center gap-2">
          <span>Препоръчани обяви 🔥</span>
        </h2>
        
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ scrollSnapType: 'x mandatory' }}>
          {promoListings.map((listing, i) => (
            <div
              key={listing.id}
              style={{ scrollSnapAlign: 'start' }}
              className="shrink-0 w-[280px]"
            >
              {/* Премиум златен контур */}
              <div 
                className="relative p-1 rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(217,119,6,0.4) 0%, rgba(217,119,6,0.2) 50%, rgba(217,119,6,0.05) 100%)',
                  boxShadow: 'inset 0 0 30px rgba(217,119,6,0.15), 0 8px 32px rgba(217,119,6,0.12)',
                  border: '1.5px solid rgba(217,119,6,0.35)'
                }}
              >
                <div className="bg-white rounded-3xl overflow-hidden">
                  <ListingCard listing={listing} index={i} compact />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}