import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Copy, Share2, Gift, Users, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ReferralSection({ user }) {
  const [copied, setCopied] = useState(false);

  // Generate a stable referral code from user id
  const referralCode = user?.id ? `ref_${user.id.slice(-8)}` : null;
  const referralLink = referralCode ? `${window.location.origin}/browse?ref=${referralCode}` : '';

  const { data: referrals = [] } = useQuery({
    queryKey: ['referrals', user?.email],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const converted = referrals.filter(r => r.converted);
  const rewardsEarned = referrals.filter(r => r.reward_granted);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Линкът е копиран!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'RentMe — Покана',
        text: 'Регистрирай се и публикувай обява в RentMe!',
        url: referralLink,
      });
    } else {
      // fallback: WhatsApp
      window.open(`https://wa.me/?text=${encodeURIComponent(`Покана за RentMe: ${referralLink}`)}`, '_blank');
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/15 p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shrink-0">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-[#1e2a6e] text-base">Покани приятел и спечели</h3>
          <p className="text-xs text-gray-500">За всеки приятел, който публикува обява → получаваш Featured обява безплатно за 7 дни</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-lg font-bold text-[#1e2a6e]">{referrals.length}</span>
          </div>
          <p className="text-xs text-gray-500">Поканени приятели</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Gift className="w-4 h-4 text-accent" />
            <span className="text-lg font-bold text-[#1e2a6e]">{rewardsEarned.length}</span>
          </div>
          <p className="text-xs text-gray-500">Спечелени бонуси</p>
        </div>
      </div>

      {/* Referral link */}
      <p className="text-xs font-medium text-gray-600 mb-1.5">Твоят личен линк:</p>
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 mb-3">
        <span className="flex-1 text-xs text-gray-600 truncate font-mono">{referralLink}</span>
        <button
          onClick={handleCopy}
          className="shrink-0 flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Копирано!' : 'Копирай'}
        </button>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Copy className="w-4 h-4" /> Копирай линк
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors"
        >
          <Share2 className="w-4 h-4" /> Сподели
        </button>
      </div>
    </div>
  );
}