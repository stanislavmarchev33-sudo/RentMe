import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Star, Send, Loader2 } from 'lucide-react';

export default function ReviewForm({ booking, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Review.create({
        booking_id: booking.id,
        listing_id: booking.listing_id,
        reviewer_email: booking.renter_email,
        reviewer_name: booking.renter_name,
        reviewee_email: booking.owner_email,
        type: 'renter_to_owner',
        rating,
        comment: comment.trim(),
      });
    },
    onSuccess: () => {
      toast.success('Рецензията беше изпратена!');
      setRating(0);
      setComment('');
      onSuccess?.();
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Моля изберете оценка');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="font-heading font-semibold text-gray-900 mb-4">Оцени наема</h3>

      {/* Star rating */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-200'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Comment */}
      <Textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Какво мислиш за артикула и собственика? (по избор)"
        rows={3}
        className="mb-4"
      />

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={mutation.isPending}
        className="w-full gradient-bg text-white border-0 h-11 rounded-xl font-semibold flex items-center justify-center gap-2"
      >
        {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        <Send className="w-4 h-4" />
        Изпрати рецензия
      </Button>
    </div>
  );
}