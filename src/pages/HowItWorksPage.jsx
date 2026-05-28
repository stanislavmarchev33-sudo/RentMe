import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Lock, TrendingUp, Camera } from 'lucide-react';
import RenterFlow from '@/components/howitworks/RenterFlow';
import EarnerFlow from '@/components/howitworks/EarnerFlow';

export default function HowItWorksPage() {
  const { lang } = useI18n();
  const [activeFlow, setActiveFlow] = useState('renter');

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-white to-gray-50 pt-10 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-heading font-bold text-4xl md:text-5xl text-[#1e2a6e] mb-3"
          >
            Как работи RentMe
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-600"
          >
            Наемай лесно. Печели от вещите си.
          </motion.p>
        </div>

        {/* Toggle Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center gap-3 mb-12"
        >
          <button
            onClick={() => setActiveFlow('renter')}
            className={`px-6 py-3 rounded-xl font-semibold text-base transition-all ${
              activeFlow === 'renter'
                ? 'gradient-brand text-white shadow-brand'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Искам да наема
          </button>
          <button
            onClick={() => setActiveFlow('earner')}
            className={`px-6 py-3 rounded-xl font-semibold text-base transition-all ${
              activeFlow === 'earner'
                ? 'gradient-brand text-white shadow-brand'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Искам да печеля
          </button>
        </motion.div>
      </div>

      {/* Flow Content */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        {activeFlow === 'renter' ? <RenterFlow /> : <EarnerFlow />}
      </div>

      {/* Trust Section */}
      <div className="bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading font-bold text-2xl text-[#1e2a6e] text-center mb-8">
            Защитен си винаги
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Lock, title: 'Наемът се задържа', desc: 'Платиш само при потвърждение' },
              { icon: TrendingUp, title: 'Депозитът те защитава', desc: 'Покрива щети или проблеми' },
              { icon: Camera, title: 'Снимай за сигурност', desc: 'Доказателство за състоянието' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-card"
              >
                <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-heading font-semibold text-[#1e2a6e] text-base mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="bg-white py-10 px-4 text-center">
        <Link to="/browse">
          <button className="px-8 py-3 rounded-xl text-base font-semibold gradient-brand text-white shadow-brand hover:opacity-90 transition-opacity">
            {activeFlow === 'renter' ? 'Разгледай обяви' : 'Качи обява'}
          </button>
        </Link>
      </div>
    </div>
  );
}