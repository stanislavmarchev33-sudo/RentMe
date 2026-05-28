import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { Search, Plus, ShieldCheck, Lock, UserCheck, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const trustBadgesBg = [
  { Icon: ShieldCheck, label: 'Застраховано' },
  { Icon: Lock, label: 'Депозит защита' },
  { Icon: UserCheck, label: 'Потвърдена самоличност' },
  { Icon: CreditCard, label: 'Сигурни плащания' },
];
const trustBadgesEn = [
  { Icon: ShieldCheck, label: 'Insured' },
  { Icon: Lock, label: 'Deposit protection' },
  { Icon: UserCheck, label: 'Verified identity' },
  { Icon: CreditCard, label: 'Secure payments' },
];

export default function HeroSection() {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/browse${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
  };

  const badges = lang === 'bg' ? trustBadgesBg : trustBadgesEn;

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 gradient-brand" />
      {/* Subtle bg */}
      <div className="absolute inset-0 gradient-bg-subtle" />
      {/* Blobs */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, #7b2ff7, transparent 70%)' }} />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, #e91e8c, transparent 70%)' }} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-14 pb-6 md:pt-24 md:pb-8">
        <div className="text-center">

          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-white shadow-sm mb-7"
          >
            <span className="w-2 h-2 rounded-full gradient-brand inline-block" />
            <span className="text-sm font-medium text-primary">
              {lang === 'bg' ? '🇧🇬 Над 10,000 успешни наема в България' : '🇧🇬 Over 10,000 successful rentals'}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="font-heading font-extrabold text-[#1e2a6e] leading-tight mb-5 text-4xl sm:text-5xl md:text-6xl"
          >
            <span className="gradient-text">НАЕМИ</span> нужното,<br />
            <span className="gradient-text">ПЕЧЕЛИ</span> от излишното
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="text-lg text-gray-600 max-w-lg mx-auto mb-9 leading-relaxed"
          >
            {lang === 'bg'
              ? 'Доверената платформа за наем в България. Хиляди артикули — без да ги купуваш.'
              : "Bulgaria's trusted rental platform. Thousands of items — without buying them."}
          </motion.p>

          {/* Search bar */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-2 max-w-lg mx-auto mb-7"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={lang === 'bg' ? 'Опиши какво ти трябва...' : 'Describe what you need...'}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 bg-white text-base text-gray-800 placeholder-gray-400 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/8 transition-all shadow-card"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-4 rounded-2xl text-base font-semibold gradient-brand text-white shadow-brand hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              {lang === 'bg' ? 'Търси' : 'Search'}
            </button>
          </motion.form>

          {/* CTA buttons — both equal gradient */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="flex flex-row items-center justify-center gap-3 mb-12"
          >
            <Link to="/browse">
              <button className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-base font-semibold gradient-brand text-white shadow-brand hover:opacity-90 transition-all">
                <Search className="w-5 h-5" />
                {lang === 'bg' ? 'Разгледай обяви' : 'Browse Listings'}
              </button>
            </Link>
            <Link to="/create-listing">
              <button className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-base font-semibold gradient-brand text-white shadow-brand hover:opacity-90 transition-all">
                <Plus className="w-5 h-5" />
                {lang === 'bg' ? 'Качи и печели' : 'List Your Item'}
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Trust cards — full width strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative max-w-4xl mx-auto px-4 sm:px-6 pb-14 md:pb-20"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {badges.map((b, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center gap-2 px-4 py-5 bg-white rounded-2xl border border-gray-100 shadow-card"
            >
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                <b.Icon className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-semibold text-[#1e2a6e] text-sm leading-tight">{b.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </section>
  );
}