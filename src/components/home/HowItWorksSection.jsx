import React from 'react';
import { useI18n } from '@/lib/i18n';
import { Search, CreditCard, PackageCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HowItWorksSection() {
  const { t } = useI18n();

  const steps = [
    { icon: Search, title: t('home.step1_title'), desc: t('home.step1_desc'), color: 'from-violet-500 to-purple-600' },
    { icon: CreditCard, title: t('home.step2_title'), desc: t('home.step2_desc'), color: 'from-pink-500 to-rose-600' },
    { icon: PackageCheck, title: t('home.step3_title'), desc: t('home.step3_desc'), color: 'from-blue-500 to-cyan-600' },
  ];

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="font-heading text-2xl md:text-3xl font-bold">{t('home.how_it_works')}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="text-center"
            >
              <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg mb-5`}>
                <step.icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
                {i + 1}.
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}