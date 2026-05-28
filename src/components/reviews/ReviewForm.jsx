import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { Star, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function ReviewForm({ booking, user, onSuccess }) {
  const { lang } = useI18n();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const submitReview = useMutation({
    mutationFn: async () => {
      await base44.entities.Review.create({
        booking_id: booking.id,
        listing_id: booking.listing_id,
        reviewer_email: user.email,
        reviewer_name: user.full_name,
        reviewee_email: booking.owner_email,
        type: 'renter_to_owner',
        rating,
        comment,
      });
    },
    onSuccess: () => {
      toast.success(lang === 'bg' ? 'Отзивът е публикуван!' : 'Review posted!');
      queryClient.invalidateQueries({ queryKey: ['listing-reviews', booking.listing_id] });
      onSuccess?.();
    },
  });

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <h3 className="font-heading font-bold text-gray-900 mb-4">
        {lang === 'bg' ? 'Остави отзив' : 'Leave a review'}
      </h3>

      {/* Rating */}
      <div className="mb-5">
        <p className="text-sm text-gray-600 mb-3">{lang === 'bg' ? 'Оценка' : 'Rating'}</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">{lang === 'bg' ? 'Коментар (по избор)' : 'Comment (optional)'}</p>
        <Textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder={lang === 'bg' ? 'Раздели твоя опит...' : 'Share your experience...'}
          rows={3}
          className="resize-none"
        />
      </div>

      <button
        onClick={() => submitReview.mutate()}
        disabled={submitReview.isPending}
        className="w-full gradient-bg text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {submitReview.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        {lang === 'bg' ? 'Публикувай отзив' : 'Post Review'}
      </button>
    </div>
  );
}