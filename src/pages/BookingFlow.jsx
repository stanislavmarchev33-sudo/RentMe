import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Calendar, Loader2, ChevronLeft, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { differenceInDays, format, addDays } from 'date-fns';

const PACKAGES = [
  { days: 2, label: '2 дни', discount: 0.05, tag: 'Спести 5%' },
  { days: 3, label: '3 дни', discount: 0.08, tag: 'Най-избирано 🔥', highlight: true },
  { days: 5, label: '5 дни', discount: 0.12, tag: 'Спести 12%' },
  { days: 7, label: '7 дни', discount: 0.15, tag: 'Най-добра цена' },
];

const PLATFORM_FEE = 5;

export default function BookingFlow() {
  const { id: listingId } = useParams();
  const { lang } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [packageOpen, setPackageOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: listing } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const items = await base44.entities.Listing.filter({ id: listingId });
      return items[0];
    },
    enabled: !!listingId,
  });

  const days = startDate && endDate ? Math.max(1, differenceInDays(new Date(endDate), new Date(startDate))) : 0;
  const dailyPrice = listing?.daily_price || 0;
  const originalRentalTotal = days * dailyPrice;
  const discount = selectedPackage ? selectedPackage.discount : 0;
  const discountedRentalTotal = Math.round(originalRentalTotal * (1 - discount));
  const totalAmount = discountedRentalTotal + PLATFORM_FEE;
  const depositAmount = listing?.deposit_amount || 0;


  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        base44.auth.redirectToLogin(window.location.pathname);
        return;
      }
      if (!startDate || !endDate) {
        toast.error('Моля изберете дати');
        return;
      }
      const booking = await base44.entities.Booking.create({
        listing_id: listingId,
        listing_title: listing.title,
        listing_image: listing.images?.[0],
        owner_id: listing.owner_id,
        owner_email: listing.owner_email,
        owner_name: listing.owner_name,
        renter_id: user.id,
        renter_email: user.email,
        renter_name: user.full_name,
        start_date: startDate,
        end_date: endDate,
        daily_price: dailyPrice,
        total_days: days,
        rental_total: discountedRentalTotal,
        platform_fee: PLATFORM_FEE,
        owner_commission: discountedRentalTotal * 0.1,
        deposit_amount: depositAmount,
        insurance_amount: 0,
        total_amount: totalAmount,
        currency: 'BGN',
        status: 'requested',
        delivery_method: 'pickup',
        request_expires_at: addDays(new Date(), 1).toISOString(),
      });

      await base44.entities.Notification.create({
        user_email: listing.owner_email,
        type: 'booking_request',
        title: 'Нова заявка за наемане',
        message: `${user.full_name} иска да наеме "${listing.title}"`,
        link: `/booking/${booking.id}`,
        booking_id: booking.id,
      });

      return booking;
    },
    onSuccess: (booking) => {
      if (booking) {
        toast.success('Заявката е изпратена!');
        queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
        navigate(`/booking/${booking.id}`);
      }
    },
  });

  if (!listing) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  const minDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const today = format(new Date(), 'yyyy-MM-dd');

  // When manual dates change, auto-match package
  const handleStartDateChange = (val) => {
    setStartDate(val);
    setEndDate('');
    setSelectedPackage(null);
  };

  const handleEndDateChange = (val) => {
    setEndDate(val);
    if (startDate && val) {
      const d = Math.max(1, differenceInDays(new Date(val), new Date(startDate)));
      const match = PACKAGES.find(p => p.days === d);
      setSelectedPackage(match || null);
    }
  };

  const handleSelectPackage = (pkg) => {
    const base = startDate || today;
    const start = base < minDate ? minDate : base;
    if (!startDate) setStartDate(start);
    setEndDate(format(addDays(new Date(start), pkg.days), 'yyyy-MM-dd'));
    setSelectedPackage(pkg);
    setPackageOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-5">
        <ChevronLeft className="w-4 h-4" /> Обратно
      </button>

      {/* Listing preview */}
      <div className="flex gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-5">
        <img
          src={listing.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=150&fit=crop'}
          alt=""
          className="w-20 h-16 rounded-xl object-cover shrink-0"
        />
        <div>
          <h3 className="font-heading font-semibold text-gray-900">{listing.title}</h3>
          <p className="text-sm text-gray-400">{listing.owner_name} · {listing.location_city}</p>
          <p className="text-base font-bold text-[#7b2ff7] mt-0.5">{listing.daily_price?.toFixed(0)} €/ден</p>
        </div>
      </div>

      {/* Date selection */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
        <h3 className="font-semibold text-gray-900 mb-3">Дати на наема</h3>
        <div className="flex gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <Label className="text-sm text-gray-500">От</Label>
            <Input
              type="date"
              value={startDate}
              onChange={e => handleStartDateChange(e.target.value)}
              min={minDate}
              className="mt-1 w-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            <Label className="text-sm text-gray-500">До</Label>
            <Input
              type="date"
              value={endDate}
              onChange={e => handleEndDateChange(e.target.value)}
              min={startDate || minDate}
              className="mt-1 w-full"
            />
          </div>
        </div>

        {/* Package discount dropdown */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setPackageOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#7b2ff7] bg-purple-50 hover:bg-purple-100 transition-colors"
          >
            <span>
              {selectedPackage
                ? `Пакет: ${selectedPackage.label} (-${Math.round(selectedPackage.discount * 100)}%)`
                : 'Спести с пакет (до -15%)'}
            </span>
            {packageOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {packageOpen && (
            <div className="divide-y divide-gray-100">
              {PACKAGES.map(pkg => (
                <button
                  key={pkg.days}
                  type="button"
                  onClick={() => handleSelectPackage(pkg)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors hover:bg-gray-50 ${selectedPackage?.days === pkg.days ? 'bg-purple-50' : 'bg-white'}`}
                >
                  <span className="font-medium text-gray-800">{pkg.label}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pkg.highlight ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>
                    {pkg.tag}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
        <h3 className="font-semibold text-gray-900 mb-4">Обобщение</h3>

        {days > 0 ? (
          <div className="space-y-3">
            {/* Rental */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                Наем ({days} {days === 1 ? 'ден' : 'дни'})
              </span>
              <div className="flex items-center gap-2">
                {discount > 0 && (
                  <span className="text-gray-400 line-through text-xs">{originalRentalTotal.toFixed(0)} €</span>
                )}
                <span className={`font-semibold ${discount > 0 ? 'text-[#7b2ff7]' : 'text-gray-900'}`}>
                  {discountedRentalTotal.toFixed(0)} €
                </span>
              </div>
            </div>

            {/* Platform fee */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Такса платформа</span>
              <span className="text-gray-900 font-medium">{PLATFORM_FEE} €</span>
            </div>

            <Separator />

            {/* Total to pay */}
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900 text-sm">Ще платиш при одобрение</span>
              <span className="font-bold text-xl text-[#7b2ff7]">{totalAmount.toFixed(0)} €</span>
            </div>

            <Separator />

            {/* Deposit - separate */}
            <div className="bg-amber-50 rounded-xl p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Депозит (временно задържан)</span>
                <span className="text-sm font-bold text-gray-900">{depositAmount.toFixed(0)} €</span>
              </div>
              <p className="text-xs text-gray-500 flex items-start gap-1.5">
                <Info className="w-3 h-3 mt-0.5 shrink-0 text-amber-500" />
                Сумата не се тегли. Блокира се и се освобождава след връщане.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Изберете дати, за да видите цената</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() => bookMutation.mutate()}
        disabled={bookMutation.isPending || days === 0}
        className="w-full gradient-bg text-white font-bold py-4 rounded-2xl text-base hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mb-3"
      >
        {bookMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        Изпрати заявка
      </button>
      <p className="text-xs text-center text-gray-400">
        Няма да бъдеш таксуван, докато заявката не бъде одобрена.
      </p>
    </div>
  );
}