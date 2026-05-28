import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, Shield, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const typeIcons = {
  payment: ArrowUpRight,
  payout: ArrowDownLeft,
  deposit_hold: Shield,
  deposit_release: Shield,
  refund: ArrowDownLeft,
  fee: ArrowUpRight,
  insurance: Shield,
  late_fee: Clock,
  commission: TrendingUp,
};

const typeColors = {
  payment: 'text-red-500',
  payout: 'text-green-500',
  deposit_hold: 'text-yellow-500',
  deposit_release: 'text-green-500',
  refund: 'text-green-500',
  fee: 'text-red-500',
  insurance: 'text-blue-500',
  late_fee: 'text-red-500',
  commission: 'text-red-500',
};

export default function WalletPage() {
  const { lang } = useI18n();
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: transactions = [] } = useQuery({
    queryKey: ['wallet-transactions', user?.email],
    queryFn: () => base44.entities.WalletTransaction.filter({ user_email: user.email }, '-created_date', 100),
    enabled: !!user?.email,
    initialData: [],
  });

  const balance = useMemo(() => {
    let available = 0;
    let pending = 0;
    let depositsHeld = 0;

    transactions.forEach(tx => {
      if (tx.status === 'completed') {
        if (['payout', 'refund', 'deposit_release'].includes(tx.type)) available += tx.amount;
        if (['payment', 'fee', 'commission', 'late_fee', 'insurance'].includes(tx.type)) available -= tx.amount;
      }
      if (tx.status === 'pending') pending += tx.amount;
      if (tx.type === 'deposit_hold' && tx.status === 'completed') depositsHeld += tx.amount;
      if (tx.type === 'deposit_release' && tx.status === 'completed') depositsHeld -= tx.amount;
    });

    return { available: Math.max(0, available), pending, depositsHeld: Math.max(0, depositsHeld) };
  }, [transactions]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-heading text-2xl md:text-3xl font-bold mb-8">
        {lang === 'bg' ? 'Портфейл' : 'Wallet'}
      </h1>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="gradient-bg text-white">
          <CardContent className="p-5">
            <p className="text-sm opacity-80">{lang === 'bg' ? 'Наличен баланс' : 'Available'}</p>
            <p className="text-3xl font-bold mt-1">{balance.available.toFixed(2)} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">{lang === 'bg' ? 'В очакване' : 'Pending'}</p>
            <p className="text-2xl font-bold mt-1">{balance.pending.toFixed(2)} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">{lang === 'bg' ? 'Задържани депозити' : 'Deposit Holds'}</p>
            <p className="text-2xl font-bold mt-1">{balance.depositsHeld.toFixed(2)} €</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{lang === 'bg' ? 'Транзакции' : 'Transactions'}</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">{lang === 'bg' ? 'Няма транзакции все още' : 'No transactions yet'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map(tx => {
                const Icon = typeIcons[tx.type] || ArrowUpRight;
                const color = typeColors[tx.type] || 'text-muted-foreground';
                const isCredit = ['payout', 'refund', 'deposit_release'].includes(tx.type);
                return (
                  <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? 'bg-green-100' : 'bg-red-100'}`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{tx.description || tx.type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">{tx.created_date ? format(new Date(tx.created_date), 'dd MMM yyyy, HH:mm') : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                        {isCredit ? '+' : '-'}{tx.amount?.toFixed(2)} €
                      </p>
                      <Badge variant="outline" className="text-[10px]">{tx.status}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}