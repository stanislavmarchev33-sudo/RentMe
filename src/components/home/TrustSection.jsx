import React from 'react';
import { useI18n } from '@/lib/i18n';
import { Shield, Lock, Eye, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrustSection() {
  const { t, lang } = useI18n();

  const features = [
    {
      icon: Lock,
      title: lang === 'bg' ? 'Ескроу плащания' : 'Escrow Payments',
      desc: lang === 'bg' ? 'Парите ви са в безопасност докато не приключи наемането.' : 'Your money is safe until the rental is complete.',
    },
    {
      icon: Shield,
      title: lang === 'bg' ? 'Задължителен депозит' : 'Mandatory Deposit',
      desc: lang === 'bg' ? '20% от стойността на артикула, автоматично изчислен.' : '20% of item value, automatically calculated.',
    },
    {
      icon: Eye,
      title: lang === 'bg' ? 'Система за доказателства' : 'Proof System',
      desc: lang === 'bg' ? 'Документирайте състоянието преди и след наемане.' : 'Document condition before and after each rental.',
    },
    {
      icon: FileCheck,
      title: t('home.insurance_title'),
      desc: t('home.insurance_desc'),
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="font-heading text-2xl md:text-3xl font-bold">{t('home.trust_title')}</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{t('home.trust_subtitle')}</p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-card rounded-xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-heading font-semibold text-sm mb-2">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}