import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import ReviewForm from '@/components/bookings/ReviewForm';
import {
  ChevronLeft, Check, X, CreditCard, PackageCheck, AlertTriangle,
  MessageSquare, Loader2, Flag, Clock
} from 'lucide-react';
import { differenceInHours, differenceInMinutes } from 'date-fns';

const AUTO_CONFIRM_HOURS = 48;
const PAYMENT_MINUTES = 30;

const statusColors = {
  requested: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  payment_pending: 'bg-orange-100 text-orange-700',
  paid: 'bg-green-100 text-green-700',
  item_sent: 'bg-purple-100 text-purple-700',
  item_received: 'bg-blue-100 text-blue-700',
  active: 'bg-primary/10 text-primary',
  returning: 'bg-yellow-100 text-yellow-700',
  returned: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-700',
  disputed: 'bg-red-100 text-red-700',
  cancelled: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-700',
};

export default function BookingDetail() {
  const { id } = useParams();
  const { t, lang } = useI18n();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  // Tick every minute so countdown displays stay current
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const { data: booking, isLoading, refetch: refetchBooking } = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const bookings = await base44.entities.Booking.filter({ id });
      return bookings[0];
    },
    enabled: !!id,
  });

  const { data: existingReview } = useQuery({
    queryKey: ['booking-review', id, user?.email],
    queryFn: async () => {
      const reviews = await base44.entities.Review.filter({ booking_id: id, reviewer_email: user?.email });
      return reviews[0];
    },
    enabled: !!id && !!user?.email,
  });

  const sendNotification = useCallback(async ({ to_email, type, title, message }) => {
    await base44.entities.Notification.create({
      user_email: to_email,
      type,
      title,
      message,
      link: `/booking/${id}`,
      booking_id: id,
    });
  }, [id]);

  const updateBooking = useMutation({
    mutationFn: ({ status, extra }) => base44.entities.Booking.update(id, { status, ...extra }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      toast.success(lang === 'bg' ? 'Обновено!' : 'Updated!');
    },
  });

  // Auto-confirm: runs on load for any user viewing the booking
  useEffect(() => {
    if (!booking || !user) return;

    const checkAutoConfirm = async () => {
      // item_sent → item_received after 48h if renter hasn't confirmed
      if (booking.status === 'item_sent' && booking.item_sent_at) {
        const hoursElapsed = differenceInHours(new Date(), new Date(booking.item_sent_at));
        if (hoursElapsed >= AUTO_CONFIRM_HOURS) {
          await base44.entities.Booking.update(id, { status: 'item_received', renter_receipt_status: 'auto_confirmed' });
          await sendNotification({
            to_email: booking.renter_email,
            type: 'auto_confirmed',
            title: lang === 'bg' ? 'Получаването е потвърдено автоматично' : 'Receipt auto-confirmed',
            message: lang === 'bg'
              ? `48 часа изтекоха — получаването на "${booking.listing_title}" е потвърдено автоматично.`
              : `48 hours passed — receipt of "${booking.listing_title}" was auto-confirmed.`,
          });
          await sendNotification({
            to_email: booking.owner_email,
            type: 'auto_confirmed',
            title: lang === 'bg' ? 'Получаването е потвърдено автоматично' : 'Receipt auto-confirmed',
            message: lang === 'bg'
              ? `Наемателят не потвърди в срок — "${booking.listing_title}" е маркиран като получен.`
              : `Renter didn't confirm in time — "${booking.listing_title}" was marked as received.`,
          });
          queryClient.invalidateQueries({ queryKey: ['booking', id] });
          return;
        }
      }

      // returning → completed after 48h if owner hasn't confirmed
      if (booking.status === 'returning' && booking.returning_initiated_at) {
        const hoursElapsed = differenceInHours(new Date(), new Date(booking.returning_initiated_at));
        if (hoursElapsed >= AUTO_CONFIRM_HOURS) {
          await base44.entities.Booking.update(id, { status: 'completed', owner_return_status: 'auto_confirmed' });
          await sendNotification({
            to_email: booking.renter_email,
            type: 'booking_completed',
            title: lang === 'bg' ? 'Наемането е завършено' : 'Rental completed',
            message: lang === 'bg'
              ? `Връщането на "${booking.listing_title}" е потвърдено автоматично.`
              : `Return of "${booking.listing_title}" was auto-confirmed.`,
          });
          await sendNotification({
            to_email: booking.owner_email,
            type: 'auto_confirmed',
            title: lang === 'bg' ? 'Връщането е потвърдено автоматично' : 'Return auto-confirmed',
            message: lang === 'bg'
              ? `48 часа изтекоха — "${booking.listing_title}" е маркиран като върнат.`
              : `48 hours passed — "${booking.listing_title}" was marked as returned.`,
          });
          queryClient.invalidateQueries({ queryKey: ['booking', id] });
        }
      }
    };

    checkAutoConfirm();
  }, [booking, user, id, lang, sendNotification, queryClient]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <p className="text-lg font-semibold text-foreground">{lang === 'bg' ? 'Резервацията не е намерена' : 'Booking not found'}</p>
        <Link to="/dashboard" className="text-sm text-primary hover:underline">{lang === 'bg' ? 'Обратно към таблото' : 'Back to dashboard'}</Link>
      </div>
    );
  }

  const isOwner = user?.email === booking.owner_email;
  const isRenter = user?.email === booking.renter_email;

  const paymentMinutesLeft = booking.approved_at
    ? Math.max(0, PAYMENT_MINUTES - differenceInMinutes(now, new Date(booking.approved_at)))
    : null;
  const itemSentHoursLeft = booking.item_sent_at
    ? Math.max(0, AUTO_CONFIRM_HOURS - differenceInHours(now, new Date(booking.item_sent_at)))
    : null;
  const returningHoursLeft = booking.returning_initiated_at
    ? Math.max(0, AUTO_CONFIRM_HOURS - differenceInHours(now, new Date(booking.returning_initiated_at)))
    : null;

  const isDisputed = booking.status === 'disputed';

  const statusSteps = [
    { key: 'requested', label: lang === 'bg' ? 'Заявена' : 'Requested' },
    { key: 'approved', label: lang === 'bg' ? 'Одобрена' : 'Approved' },
    { key: 'paid', label: lang === 'bg' ? 'Платена' : 'Paid' },
    { key: 'item_sent', label: lang === 'bg' ? 'Изпратен' : 'Sent' },
    { key: 'active', label: lang === 'bg' ? 'Активна' : 'Active' },
    { key: 'returned', label: lang === 'bg' ? 'Върнат' : 'Returned' },
    { key: 'completed', label: lang === 'bg' ? 'Завършена' : 'Completed' },
    ...(isDisputed ? [{ key: 'disputed', label: lang === 'bg' ? 'Спор' : 'Disputed', isError: true }] : []),
  ];

  const currentStepIdx = isDisputed
    ? statusSteps.length - 1
    : statusSteps.findIndex(s => s.key === booking.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="w-4 h-4" /> {lang === 'bg' ? 'Обратно' : 'Back'}
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">{booking.listing_title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {booking.start_date} → {booking.end_date} • {booking.total_days} {lang === 'bg' ? 'дни' : 'days'}
          </p>
        </div>
        <Badge className={`${statusColors[booking.status]} text-sm px-3 py-1`}>
          {t(`status.${booking.status}`)}
        </Badge>
      </div>

      {/* Progress stepper */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex items-center min-w-[500px]">
          {statusSteps.map((step, i) => (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step.isError ? 'bg-red-500 text-white'
                  : i <= currentStepIdx ? 'gradient-bg text-white'
                  : 'bg-muted text-muted-foreground'
                }`}>
                  {step.isError ? <X className="w-4 h-4" /> : i < currentStepIdx ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[10px] mt-1 whitespace-nowrap ${
                  step.isError ? 'text-red-500 font-medium'
                  : i <= currentStepIdx ? 'text-foreground font-medium'
                  : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </div>
              {i < statusSteps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  statusSteps[i + 1]?.isError ? 'bg-red-300'
                  : i < currentStepIdx ? 'gradient-bg'
                  : 'bg-muted'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">

          {/* Listing info */}
          <Card>
            <CardContent className="p-4 flex gap-4">
              <img
                src={booking.listing_image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=150&fit=crop'}
                alt=""
                className="w-24 h-20 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-semibold">{booking.listing_title}</h3>
                <p className="text-sm text-muted-foreground">
                  {isOwner
                    ? `${lang === 'bg' ? 'Наемател' : 'Renter'}: ${booking.renter_name}`
                    : `${lang === 'bg' ? 'Собственик' : 'Owner'}: ${booking.owner_name}`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Owner: approve or reject */}
          {booking.status === 'requested' && isOwner && (
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1">{lang === 'bg' ? 'Имате нова заявка!' : 'You have a new request!'}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {lang === 'bg' ? `от ${booking.renter_name} · ${booking.total_days} дни` : `from ${booking.renter_name} · ${booking.total_days} days`}
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={async () => {
                      await updateBooking.mutateAsync({ status: 'approved', extra: { approved_at: new Date().toISOString() } });
                      await sendNotification({
                        to_email: booking.renter_email,
                        type: 'booking_approved',
                        title: lang === 'bg' ? 'Заявката ти е одобрена!' : 'Your request was approved!',
                        message: lang === 'bg'
                          ? `${booking.owner_name} одобри наема на "${booking.listing_title}". Завърши плащането в рамките на 30 минути.`
                          : `${booking.owner_name} approved "${booking.listing_title}". Complete payment within 30 minutes.`,
                      });
                    }}
                    className="gradient-bg text-white border-0 gap-1"
                    disabled={updateBooking.isPending}
                  >
                    <Check className="w-4 h-4" /> {lang === 'bg' ? 'Одобри' : 'Approve'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await updateBooking.mutateAsync({ status: 'cancelled', extra: { cancelled_by: user.email, cancellation_reason: 'Owner rejected' } });
                      await sendNotification({
                        to_email: booking.renter_email,
                        type: 'booking_rejected',
                        title: lang === 'bg' ? 'Заявката ти е отказана' : 'Your request was declined',
                        message: lang === 'bg'
                          ? `${booking.owner_name} отказа наема на "${booking.listing_title}".`
                          : `${booking.owner_name} declined your request for "${booking.listing_title}".`,
                      });
                    }}
                    disabled={updateBooking.isPending}
                  >
                    <X className="w-4 h-4 mr-1" /> {lang === 'bg' ? 'Откажи' : 'Reject'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Renter: pay */}
          {booking.status === 'approved' && isRenter && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{lang === 'bg' ? 'Заявката е одобрена!' : 'Request approved!'}</h3>
                  {paymentMinutesLeft !== null && (
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      paymentMinutesLeft < 10 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      <Clock className="w-3 h-3" />
                      {paymentMinutesLeft} {lang === 'bg' ? 'мин.' : 'min'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {lang === 'bg' ? 'Моля, завършете плащането в рамките на 30 минути.' : 'Please complete payment within 30 minutes.'}
                </p>
                <Button
                  onClick={async () => {
                    await updateBooking.mutateAsync({ status: 'paid' });
                    await sendNotification({
                      to_email: booking.owner_email,
                      type: 'payment_success',
                      title: lang === 'bg' ? 'Плащането е получено!' : 'Payment received!',
                      message: lang === 'bg'
                        ? `${booking.renter_name} плати за наема на "${booking.listing_title}". Подгответе и изпратете артикула.`
                        : `${booking.renter_name} paid for "${booking.listing_title}". Please prepare and send the item.`,
                    });
                  }}
                  className="gradient-bg text-white border-0 gap-1"
                  disabled={updateBooking.isPending}
                >
                  <CreditCard className="w-4 h-4" /> {lang === 'bg' ? 'Плати' : 'Pay'} {booking.total_amount?.toFixed(0)} €
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Owner: mark item as sent */}
          {booking.status === 'paid' && isOwner && (
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{lang === 'bg' ? 'Плащането е получено!' : 'Payment received!'}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {lang === 'bg' ? 'Подгответе и изпратете артикула на наемателя.' : 'Prepare and send the item to the renter.'}
                </p>
                <Button
                  onClick={async () => {
                    await updateBooking.mutateAsync({ status: 'item_sent', extra: { item_sent_at: new Date().toISOString() } });
                    await sendNotification({
                      to_email: booking.renter_email,
                      type: 'item_sent',
                      title: lang === 'bg' ? 'Артикулът е изпратен!' : 'Item is on its way!',
                      message: lang === 'bg'
                        ? `${booking.owner_name} изпрати "${booking.listing_title}". Потвърдете получаването в рамките на 48 часа.`
                        : `${booking.owner_name} sent "${booking.listing_title}". Confirm receipt within 48 hours.`,
                    });
                  }}
                  className="gradient-bg text-white border-0 gap-1"
                  disabled={updateBooking.isPending}
                >
                  <PackageCheck className="w-4 h-4" /> {lang === 'bg' ? 'Маркирай като изпратен' : 'Mark as Sent'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Renter: confirm receipt or dispute */}
          {booking.status === 'item_sent' && isRenter && (
            <Card className="border-purple-200 bg-purple-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{lang === 'bg' ? 'Артикулът е изпратен!' : 'Item shipped!'}</h3>
                  {itemSentHoursLeft !== null && (
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      itemSentHoursLeft < 6 ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-700'
                    }`}>
                      <Clock className="w-3 h-3" />
                      {lang === 'bg' ? `Авто-потвърждение след ${itemSentHoursLeft}ч` : `Auto-confirms in ${itemSentHoursLeft}h`}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {lang === 'bg' ? 'Получихте ли артикула в добро състояние?' : 'Did you receive the item in good condition?'}
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={async () => {
                      await updateBooking.mutateAsync({ status: 'item_received', extra: { renter_receipt_status: 'all_good' } });
                      await sendNotification({
                        to_email: booking.owner_email,
                        type: 'item_received',
                        title: lang === 'bg' ? 'Артикулът е получен!' : 'Item received!',
                        message: lang === 'bg'
                          ? `${booking.renter_name} потвърди получаването на "${booking.listing_title}". Наемането е активно.`
                          : `${booking.renter_name} confirmed receipt of "${booking.listing_title}". Rental is now active.`,
                      });
                    }}
                    className="gradient-bg text-white border-0 gap-1"
                    disabled={updateBooking.isPending}
                  >
                    <Check className="w-4 h-4" /> {lang === 'bg' ? 'Всичко е наред' : 'All Good'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await updateBooking.mutateAsync({ status: 'disputed', extra: { renter_receipt_status: 'issue_reported' } });
                      await sendNotification({
                        to_email: booking.owner_email,
                        type: 'dispute_update',
                        title: lang === 'bg' ? 'Докладван е проблем!' : 'Issue reported!',
                        message: lang === 'bg'
                          ? `${booking.renter_name} докладва проблем с "${booking.listing_title}" при получаване.`
                          : `${booking.renter_name} reported an issue with "${booking.listing_title}" on receipt.`,
                      });
                    }}
                    disabled={updateBooking.isPending}
                  >
                    <AlertTriangle className="w-4 h-4 mr-1" /> {lang === 'bg' ? 'Докладвай проблем' : 'Report Issue'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Renter: initiate return */}
          {booking.status === 'active' && isRenter && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{lang === 'bg' ? 'Наемането е активно' : 'Rental is active'}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {lang === 'bg' ? 'Готови ли сте да върнете артикула?' : 'Ready to return the item?'}
                </p>
                <Button
                  onClick={async () => {
                    await updateBooking.mutateAsync({ status: 'returning', extra: { returning_initiated_at: new Date().toISOString() } });
                    await sendNotification({
                      to_email: booking.owner_email,
                      type: 'return_initiated',
                      title: lang === 'bg' ? 'Започнато е връщане' : 'Return initiated',
                      message: lang === 'bg'
                        ? `${booking.renter_name} започна връщане на "${booking.listing_title}". Потвърдете получаването в рамките на 48 часа.`
                        : `${booking.renter_name} initiated return of "${booking.listing_title}". Confirm receipt within 48 hours.`,
                    });
                  }}
                  variant="outline"
                  className="gap-1"
                  disabled={updateBooking.isPending}
                >
                  {lang === 'bg' ? 'Започни връщане' : 'Initiate Return'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Owner: confirm return or dispute */}
          {booking.status === 'returning' && isOwner && (
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{lang === 'bg' ? 'Артикулът се връща' : 'Item is being returned'}</h3>
                  {returningHoursLeft !== null && (
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      returningHoursLeft < 6 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                    }`}>
                      <Clock className="w-3 h-3" />
                      {lang === 'bg' ? `Авто-потвърждение след ${returningHoursLeft}ч` : `Auto-confirms in ${returningHoursLeft}h`}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {lang === 'bg' ? 'Получихте ли артикула обратно в добро състояние?' : 'Did you receive the item back in good condition?'}
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={async () => {
                      await updateBooking.mutateAsync({ status: 'completed', extra: { owner_return_status: 'all_good' } });
                      await sendNotification({
                        to_email: booking.renter_email,
                        type: 'booking_completed',
                        title: lang === 'bg' ? 'Наемането е завършено!' : 'Rental completed!',
                        message: lang === 'bg'
                          ? `${booking.owner_name} потвърди връщането на "${booking.listing_title}". Благодарим ти!`
                          : `${booking.owner_name} confirmed return of "${booking.listing_title}". Thanks for using RentMe!`,
                      });
                    }}
                    className="gradient-bg text-white border-0 gap-1"
                    disabled={updateBooking.isPending}
                  >
                    <Check className="w-4 h-4" /> {lang === 'bg' ? 'Потвърди връщане' : 'Confirm Return'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await updateBooking.mutateAsync({ status: 'disputed', extra: { owner_return_status: 'issue_reported' } });
                      await sendNotification({
                        to_email: booking.renter_email,
                        type: 'dispute_update',
                        title: lang === 'bg' ? 'Докладван е проблем при връщане' : 'Issue reported on return',
                        message: lang === 'bg'
                          ? `${booking.owner_name} докладва проблем с "${booking.listing_title}" при връщане.`
                          : `${booking.owner_name} reported an issue with "${booking.listing_title}" on return.`,
                      });
                    }}
                    disabled={updateBooking.isPending}
                  >
                    <AlertTriangle className="w-4 h-4 mr-1" /> {lang === 'bg' ? 'Докладвай проблем' : 'Report Issue'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">{t('booking.summary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{booking.daily_price?.toFixed(0)} € × {booking.total_days} {lang === 'bg' ? 'дни' : 'days'}</span>
                <span>{booking.rental_total?.toFixed(0)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('booking.platform_fee')}</span>
                <span>{booking.platform_fee?.toFixed(0)} €</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t('booking.deposit_held')}</span>
                <span>{booking.deposit_amount?.toFixed(0)} €</span>
              </div>
              {booking.insurance_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{t('booking.insurance')}</span>
                  <span>{booking.insurance_amount?.toFixed(0)} €</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>{t('booking.total')}</span>
                <span className="gradient-text">{booking.total_amount?.toFixed(0)} €</span>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 flex flex-col gap-2">
            <Link to={`/listing/${booking.listing_id}/chat`}>
              <Button variant="outline" className="w-full gap-2">
                <MessageSquare className="w-4 h-4" /> {lang === 'bg' ? 'Чат' : 'Chat'}
              </Button>
            </Link>
            {['active', 'returning', 'returned'].includes(booking.status) && (
              <Link to={`/dispute/${booking.id}`}>
                <Button variant="ghost" className="w-full gap-2 text-destructive">
                  <Flag className="w-4 h-4" /> {lang === 'bg' ? 'Отвори спор' : 'Open Dispute'}
                </Button>
              </Link>
            )}
          </div>

          {booking.status === 'completed' && isRenter && !existingReview && (
            <ReviewForm booking={booking} onSuccess={refetchBooking} />
          )}

          {existingReview && (
            <Card className="bg-green-50/50 border-green-200 mt-4">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-green-700 mb-2">✓ {lang === 'bg' ? 'Вече си оставил рецензия' : 'You already left a review'}</p>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-lg">{i < existingReview.rating ? '⭐' : '☆'}</span>
                  ))}
                </div>
                {existingReview.comment && <p className="text-sm text-gray-600 mt-2">{existingReview.comment}</p>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
