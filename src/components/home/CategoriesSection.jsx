import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const CATEGORIES = [
  {
    slug: 'photography',
    name_bg: 'Фотография',
    name_en: 'Photography',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop',
  },
  {
    slug: 'music',
    name_bg: 'Музика',
    name_en: 'Music',
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=400&fit=crop',
  },
  {
    slug: 'sports',
    name_bg: 'Спорт',
    name_en: 'Sports',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=400&fit=crop',
  },
  {
    slug: 'tools',
    name_bg: 'Инструменти',
    name_en: 'Tools',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop',
  },
  {
    slug: 'tech',
    name_bg: 'Техника',
    name_en: 'Tech',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=400&fit=crop',
  },
  {
    slug: 'party',
    name_bg: 'Парти',
    name_en: 'Party',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop',
  },
  {
    slug: 'other',
    name_bg: 'Други',
    name_en: 'Other',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
  },
];

export default function CategoriesSection() {
  const { lang } = useI18n();

  return (
    <section className="py-14 bg-gray-50/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#1e2a6e]">
              {lang === 'bg' ? 'Категории' : 'Browse Categories'}
            </h2>
            <p className="text-gray-500 mt-1 text-base">
              {lang === 'bg' ? 'Избери какво ти трябва' : 'Find exactly what you need'}
            </p>
          </div>
          <Link to="/browse" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            {lang === 'bg' ? 'Всички' : 'View all'} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 2-column grid */}
        <div className="grid grid-cols-2 gap-4">
          {CATEGORIES.map((cat, i) => {
            const name = lang === 'bg' ? cat.name_bg : cat.name_en;
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
              >
                <Link to={`/browse?category=${cat.slug}`} className="group block">
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/9] shadow-card hover:shadow-card-hover transition-all duration-300 group-hover:-translate-y-1">
                    <img
                      src={cat.image}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Gradient overlay: top lighter, bottom darker */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    {/* Text bottom-left */}
                    <div className="absolute bottom-0 left-0 p-4">
                      <span className="text-white font-heading font-bold text-xl leading-tight block drop-shadow-lg">
                        {name}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}