import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Package, CreditCard, AlertTriangle, Star, PackageCheck, RotateCcw, Clock } from 'lucide-react';
import { format } from 'date-fns';

const typeIcons = {
  booking_request: Package,
  booking_approved: Check,
  booking_rejected: AlertTriangle,
  payment_success: CreditCard,
  item_sent: PackageCheck,
  item_received: Check,
  return_initiated: RotateCcw,
  booking_completed: Star,
  auto_confirmed: Clock,
  dispute_update: AlertTriangle,
  verification: Star,
  system: Bell,
};

export default function Notifications() {
  const { lang } = useI18n();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 50),
    enabled: !!user?.email,
    initialData: [],
  });

  const markRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    for (const n of unread) await base44.entities.Notification.update(n.id, { is_read: true });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl font-bold">
          {lang === 'bg' ? 'Известия' : 'Notifications'}
        </h1>
        {notifications.some(n => !n.is_read) && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            {lang === 'bg' ? 'Маркирай всички' : 'Mark all read'}
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground">{lang === 'bg' ? 'Нямате известия' : 'No notifications'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => {
            const Icon = typeIcons[n.type] || Bell;
            return (
              <Card key={n.id} className={`transition-all hover:shadow-md cursor-pointer ${!n.is_read ? 'border-primary/30 bg-primary/5' : ''}`}
                onClick={() => { if (!n.is_read) markRead.mutate(n.id); }}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!n.is_read ? 'gradient-bg' : 'bg-muted'}`}>
                    <Icon className={`w-5 h-5 ${!n.is_read ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.is_read ? 'font-semibold' : ''}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{n.created_date ? format(new Date(n.created_date), 'dd MMM yyyy, HH:mm') : ''}</p>
                  </div>
                  {!n.is_read && <div className="w-2.5 h-2.5 rounded-full gradient-bg shrink-0 mt-1.5" />}
                  {n.link && (
                    <Link to={n.link} className="shrink-0">
                      <Button variant="ghost" size="sm" className="text-xs">{lang === 'bg' ? 'Виж' : 'View'}</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}