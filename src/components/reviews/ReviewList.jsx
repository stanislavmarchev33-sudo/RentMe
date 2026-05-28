import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function ReviewList({ listingId }) {
  const { lang } = useI18n();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['listing-reviews', listingId],
    queryFn: () => base44.entities.Review.filter({ listing_id: listingId }, '-created_date', 50),
    initialData: [],
  });

  if (isLoading) {
    return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;
  }

  if (reviews.length === 0) {
    return <p className="text-center text-gray-400 py-6">{lang === 'bg' ? 'Няма отзиви още' : 'No reviews yet'}</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <div key={review.id} className="border border-gray-100 rounded-2xl p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold text-gray-900">{review.reviewer_name}</p>
              <p className="text-xs text-gray-400">{new Date(review.created_date).toLocaleDateString(lang === 'bg' ? 'bg' : 'en')}</p>
            </div>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
          {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
        </div>
      ))}
    </div>
  );
}