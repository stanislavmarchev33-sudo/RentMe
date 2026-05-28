import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Package, MessageSquare, ShoppingBag } from 'lucide-react';
import OwnerListingCard from '@/components/listings/OwnerListingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const statusColors = {
  requested: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  item_sent: 'bg-purple-100 text-purple-700',
  item_received: 'bg-blue-100 text-blue-700',
  active: 'bg-primary/10 text-primary',
  returning: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-gray-100 text-gray-700',
  disputed: 'bg-red-100 text-red-700',
  cancelled: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-700',
};

const statusLabels = {
  requested: 'Заявена',
  approved: 'Одобрена',
  paid: 'Платена',
  item_sent: 'Изпратен',
  item_received: 'Получен',
  active: 'Активна',
  returning: 'Връщане',
  completed: 'Завършена',
  disputed: 'Спор',
  cancelled: 'Отказана',
  expired: 'Изтекла',
};

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: myListings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['my-listings', user?.email],
    queryFn: () => base44.entities.Listing.filter({ owner_email: user.email }, '-created_date', 50),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: pendingBookings = [] } = useQuery({
    queryKey: ['pending-bookings-owner', user?.email],
    queryFn: () => base44.entities.Booking.filter({ owner_email: user.email, status: 'requested' }, '-created_date', 100),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: myRentals = [], isLoading: rentalsLoading } = useQuery({
    queryKey: ['my-rentals', user?.email],
    queryFn: () => base44.entities.Booking.filter({ renter_email: user.email }, '-created_date', 100),
    enabled: !!user?.email,
    initialData: [],
  });

  const pendingByListing = pendingBookings.reduce((acc, b) => {
    acc[b.listing_id] = (acc[b.listing_id] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <h1 className="font-heading text-2xl font-bold text-gray-900">Табло</h1>
        <Link to="/create-listing">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white font-semibold text-sm shadow-brand hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Качи нова вещ</span>
            <span className="sm:hidden">Нова</span>
          </button>
        </Link>
      </div>

      <Tabs defaultValue="listings">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="listings" className="flex-1">
            Моите обяви
            {myListings.length > 0 && (
              <span className="ml-2 text-xs bg-muted rounded-full px-1.5 py-0.5">{myListings.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="rentals" className="flex-1">
            Моите наема
            {myRentals.length > 0 && (
              <span className="ml-2 text-xs bg-muted rounded-full px-1.5 py-0.5">{myRentals.length}</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: My Listings */}
        <TabsContent value="listings">
          {listingsLoading ? (
            <div className="space-y-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden border border-gray-100">
                  <Skeleton className="w-full h-52" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-11 w-full rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : myListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center mb-5">
                <Package className="w-10 h-10 text-[#7b2ff7]/40" />
              </div>
              <h2 className="font-heading font-bold text-gray-800 text-lg mb-2">Нямаш качени обяви</h2>
              <p className="text-gray-400 text-sm mb-6 max-w-xs">
                Качи първата си вещ и започни да печелиш от неща, които не използваш.
              </p>
              <Link to="/create-listing">
                <button className="px-6 py-3 rounded-2xl gradient-brand text-white font-semibold text-sm shadow-brand hover:opacity-90 transition-opacity">
                  Качи първата си вещ
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {myListings.map((listing, i) => (
                <OwnerListingCard
                  key={listing.id}
                  listing={listing}
                  pendingCount={pendingByListing[listing.id] || 0}
                  index={i}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: My Rentals */}
        <TabsContent value="rentals">
          {rentalsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
                  <Skeleton className="w-20 h-16 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : myRentals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center mb-5">
                <ShoppingBag className="w-10 h-10 text-[#7b2ff7]/40" />
              </div>
              <h2 className="font-heading font-bold text-gray-800 text-lg mb-2">Нямаш активни наеми</h2>
              <p className="text-gray-400 text-sm mb-6 max-w-xs">
                Разгледай обявите и наеми нещо, което ти трябва.
              </p>
              <Link to="/browse">
                <button className="px-6 py-3 rounded-2xl gradient-brand text-white font-semibold text-sm shadow-brand hover:opacity-90 transition-opacity">
                  Разгледай обяви
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myRentals.map(booking => (
                <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 items-center hover:shadow-sm transition-shadow">
                  <Link to={`/booking/${booking.id}`} className="shrink-0">
                    <img
                      src={booking.listing_image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=150&fit=crop'}
                      alt=""
                      className="w-20 h-16 rounded-xl object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/booking/${booking.id}`}>
                      <p className="font-semibold text-gray-900 text-sm truncate hover:text-primary transition-colors">
                        {booking.listing_title}
                      </p>
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {booking.start_date} → {booking.end_date}
                    </p>
                    <Badge className={`mt-1.5 text-xs px-2 py-0.5 ${statusColors[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabels[booking.status] || booking.status}
                    </Badge>
                  </div>
                  <Link to={`/listing/${booking.listing_id}/chat`} className="shrink-0">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Чат
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
