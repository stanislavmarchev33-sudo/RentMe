import React from 'react';
import { useI18n } from '@/lib/i18n';
import { Shield, Lock, CheckCircle2, Scale } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrustStrip() {
  const { lang } = useI18n();

  const items = [
    { icon: Shield, label: lang === 'bg' ? 'Застраховка' : 'Insurance', desc: lang === 'bg' ? 'Пълна защита при щети' : 'Full damage protection', color: 'bg-purple-50 text-[#7b2ff7]' },
    { icon: Lock, label: lang === 'bg' ? 'Депозит' : 'Deposit', desc: lang === 'bg' ? 'Автоматично изчислен' : 'Auto-calculated security', color: 'bg-pink-50 text-[#e91e8c]' },
    { icon: CheckCircle2, label: lang === 'bg' ? 'Проверка' : 'Verification', desc: lang === 'bg' ? 'Верифицирани потребители' : 'Verified users', color: 'bg-navy/5 text-[#1e2a6e]' },
    { icon: Scale, label: lang === 'bg' ? 'Защита' : 'Legal Cover', desc: lang === 'bg' ? 'Спор & Медиация' : 'Dispute & Mediation', color: 'bg-purple-50 text-[#7b2ff7]' },
  ];

  return (
    <section className="py-8 border-y border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50/80 border border-gray-100"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-heading font-semibold text-[#1e2a6e] text-sm">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}