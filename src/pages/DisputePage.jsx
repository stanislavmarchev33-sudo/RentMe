import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ChevronLeft, AlertTriangle, Loader2 } from 'lucide-react';

const REASONS = [
  { value: 'item_damaged', labelBg: 'Артикулът е повреден', labelEn: 'Item is damaged' },
  { value: 'item_not_received', labelBg: 'Не получих артикула', labelEn: 'Item not received' },
  { value: 'item_not_as_described', labelBg: 'Артикулът не отговаря на описанието', labelEn: 'Item not as described' },
  { value: 'item_not_returned', labelBg: 'Артикулът не е върнат', labelEn: 'Item not returned' },
  { value: 'payment_issue', labelBg: 'Проблем с плащане', labelEn: 'Payment issue' },
  { value: 'other', labelBg: 'Друго', labelEn: 'Other' },
];

export default function DisputePage() {
  const { id: bookingId } = useParams();
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const bookings = await base44.entities.Booking.filter({ id: bookingId });
      return bookings[0];
    },
    enabled: !!bookingId,
  });

  const submitDispute = useMutation({
    mutationFn: async () => {
      await base44.entities.Booking.update(bookingId, {
        status: 'disputed',
        dispute_reason: reason,
        dispute_description: description,
        dispute_opened_by: user.email,
        dispute_opened_at: new Date().toISOString(),
      });

      const otherPartyEmail = user.email === booking.owner_email
        ? booking.renter_email
        : booking.owner_email;

      await base44.entities.Notification.create({
        user_email: otherPartyEmail,
        type: 'dispute_update',
        title: lang === 'bg' ? 'Отворен е спор за резервация' : 'A dispute has been opened',
        message: lang === 'bg'
          ? `Отворен е спор за "${booking.listing_title}". Екипът ни ще се свърже с вас.`
          : `A dispute was opened for "${booking.listing_title}". Our team will be in touch.`,
        link: `/booking/${bookingId}`,
        booking_id: bookingId,
      });
    },
    onSuccess: () => {
      toast.success(lang === 'bg' ? 'Спорът е подаден успешно.' : 'Dispute submitted successfully.');
      navigate(`/booking/${bookingId}`);
    },
    onError: () => {
      toast.error(lang === 'bg' ? 'Грешка при подаване. Опитайте отново.' : 'Submission failed. Please try again.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error(lang === 'bg' ? 'Моля изберете причина.' : 'Please select a reason.');
      return;
    }
    if (description.trim().length < 20) {
      toast.error(lang === 'bg' ? 'Описанието трябва да е поне 20 символа.' : 'Description must be at least 20 characters.');
      return;
    }
    submitDispute.mutate();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <p className="text-lg font-semibold">{lang === 'bg' ? 'Резервацията не е намерена' : 'Booking not found'}</p>
        <Link to="/dashboard" className="text-sm text-primary hover:underline">
          {lang === 'bg' ? 'Обратно към таблото' : 'Back to dashboard'}
        </Link>
      </div>
    );
  }

  if (booking.status === 'disputed') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="font-heading text-xl font-bold mb-2">
          {lang === 'bg' ? 'Вече е отворен спор' : 'Dispute already open'}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {lang === 'bg' ? 'Екипът ни разглежда случая.' : 'Our team is reviewing this case.'}
        </p>
        <Link to={`/booking/${bookingId}`}>
          <Button variant="outline">{lang === 'bg' ? 'Виж резервацията' : 'View booking'}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <Link to={`/booking/${bookingId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="w-4 h-4" /> {lang === 'bg' ? 'Обратно' : 'Back'}
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h1 className="font-heading text-xl font-bold">{lang === 'bg' ? 'Отвори спор' : 'Open Dispute'}</h1>
          <p className="text-sm text-muted-foreground">{booking.listing_title}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {lang === 'bg' ? 'Опишете проблема' : 'Describe the problem'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>{lang === 'bg' ? 'Причина' : 'Reason'}</Label>
              <div className="grid gap-2">
                {REASONS.map(r => (
                  <label
                    key={r.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      reason === r.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                      className="accent-primary"
                    />
                    <span className="text-sm">{lang === 'bg' ? r.labelBg : r.labelEn}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {lang === 'bg' ? 'Подробно описание' : 'Detailed description'}
              </Label>
              <Textarea
                id="description"
                rows={5}
                placeholder={lang === 'bg' ? 'Опишете какво се е случило...' : 'Describe what happened...'}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {description.length} / 20 {lang === 'bg' ? 'символа минимум' : 'characters minimum'}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              {lang === 'bg'
                ? 'След подаване, резервацията ще бъде маркирана като спорна и екипът ни ще се свърже с двете страни в рамките на 24 часа.'
                : 'After submission, the booking will be marked as disputed and our team will contact both parties within 24 hours.'}
            </div>

            <Button
              type="submit"
              variant="destructive"
              className="w-full"
              disabled={submitDispute.isPending}
            >
              {submitDispute.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {lang === 'bg' ? 'Подай спор' : 'Submit Dispute'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
