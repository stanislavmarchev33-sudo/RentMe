import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Package, ShoppingBag, AlertTriangle, TrendingUp, DollarSign, BarChart3, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { lang } = useI18n();

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list('-created_date', 100),
    initialData: [],
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: () => base44.entities.Listing.list('-created_date', 100),
    initialData: [],
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date', 100),
    initialData: [],
  });

  const { data: disputes = [] } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: () => base44.entities.Dispute.list('-created_date', 50),
    initialData: [],
  });

  const activeListings = listings.filter(l => l.status === 'active');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const gmv = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const revenue = bookings.reduce((sum, b) => sum + (b.platform_fee || 0) + (b.owner_commission || 0), 0);

  const chartData = [
    { name: lang === 'bg' ? 'Обяви' : 'Listings', value: listings.length },
    { name: lang === 'bg' ? 'Активни' : 'Active', value: activeListings.length },
    { name: lang === 'bg' ? 'Резервации' : 'Bookings', value: bookings.length },
    { name: lang === 'bg' ? 'Завършени' : 'Completed', value: completedBookings.length },
    { name: lang === 'bg' ? 'Спорове' : 'Disputes', value: disputes.length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">
        {lang === 'bg' ? 'Админ панел' : 'Admin Dashboard'}
      </h1>
      <p className="text-muted-foreground text-sm mb-8">{lang === 'bg' ? 'Обзор на платформата' : 'Platform overview'}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center"><Users className="w-5 h-5 text-blue-700" /></div>
            <div><p className="text-2xl font-bold">{users.length}</p><p className="text-xs text-muted-foreground">{lang === 'bg' ? 'Потребители' : 'Users'}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center"><Package className="w-5 h-5 text-purple-700" /></div>
            <div><p className="text-2xl font-bold">{activeListings.length}</p><p className="text-xs text-muted-foreground">{lang === 'bg' ? 'Активни обяви' : 'Active Listings'}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center"><DollarSign className="w-5 h-5 text-green-700" /></div>
            <div><p className="text-2xl font-bold">{gmv.toFixed(0)} лв.</p><p className="text-xs text-muted-foreground">GMV</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-700" /></div>
            <div><p className="text-2xl font-bold">{disputes.filter(d => d.status === 'open').length}</p><p className="text-xs text-muted-foreground">{lang === 'bg' ? 'Отворени спорове' : 'Open Disputes'}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="mb-8">
        <CardHeader><CardTitle>{lang === 'bg' ? 'Обзор' : 'Overview'}</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(252, 85%, 60%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">{lang === 'bg' ? 'Потребители' : 'Users'}</TabsTrigger>
          <TabsTrigger value="listings">{lang === 'bg' ? 'Обяви' : 'Listings'}</TabsTrigger>
          <TabsTrigger value="disputes">{lang === 'bg' ? 'Спорове' : 'Disputes'}</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">{lang === 'bg' ? 'Име' : 'Name'}</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">{lang === 'bg' ? 'Роля' : 'Role'}</th>
                    <th className="text-left p-3 font-medium">{lang === 'bg' ? 'Дата' : 'Date'}</th>
                  </tr></thead>
                  <tbody>
                    {users.slice(0, 20).map(u => (
                      <tr key={u.id} className="border-b hover:bg-muted/30">
                        <td className="p-3">{u.full_name || '-'}</td>
                        <td className="p-3 text-muted-foreground">{u.email}</td>
                        <td className="p-3"><Badge variant="outline">{u.role || 'user'}</Badge></td>
                        <td className="p-3 text-muted-foreground text-xs">{u.created_date?.slice(0, 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">{lang === 'bg' ? 'Заглавие' : 'Title'}</th>
                    <th className="text-left p-3 font-medium">{lang === 'bg' ? 'Собственик' : 'Owner'}</th>
                    <th className="text-left p-3 font-medium">{lang === 'bg' ? 'Цена' : 'Price'}</th>
                    <th className="text-left p-3 font-medium">{lang === 'bg' ? 'Статус' : 'Status'}</th>
                  </tr></thead>
                  <tbody>
                    {listings.slice(0, 20).map(l => (
                      <tr key={l.id} className="border-b hover:bg-muted/30">
                        <td className="p-3 font-medium">{l.title}</td>
                        <td className="p-3 text-muted-foreground">{l.owner_name}</td>
                        <td className="p-3">{l.daily_price?.toFixed(0)} лв./ден</td>
                        <td className="p-3"><Badge variant="outline">{l.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">{lang === 'bg' ? 'Тип' : 'Type'}</th>
                    <th className="text-left p-3 font-medium">{lang === 'bg' ? 'Отворен от' : 'Opened By'}</th>
                    <th className="text-left p-3 font-medium">{lang === 'bg' ? 'Статус' : 'Status'}</th>
                    <th className="text-left p-3 font-medium">{lang === 'bg' ? 'Дата' : 'Date'}</th>
                  </tr></thead>
                  <tbody>
                    {disputes.map(d => (
                      <tr key={d.id} className="border-b hover:bg-muted/30">
                        <td className="p-3">{d.type?.replace(/_/g, ' ')}</td>
                        <td className="p-3 text-muted-foreground">{d.opened_by_name || d.opened_by}</td>
                        <td className="p-3"><Badge variant={d.status === 'open' ? 'destructive' : 'outline'}>{d.status}</Badge></td>
                        <td className="p-3 text-muted-foreground text-xs">{d.created_date?.slice(0, 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}