import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Image, CheckCircle2, MessageSquare, Camera, TrendingUp, Star, AlertCircle, HelpCircle, X } from 'lucide-react';

const steps = [
  {
    section: 'Създаване',
    items: [
      { num: 1, title: 'Натискаш „Качи обява"', desc: 'Начало на новия листинг', icon: Plus },
      { num: 2, title: 'Добавяш снимки и детайли', desc: '✓ Цената се изчислява автоматично', icon: Image },
      { num: 3, title: 'Избираш опции', desc: '• Застраховка\n• Промотирана обява', icon: CheckCircle2 },
      { num: 4, title: 'Потвърждаваш профила си', desc: 'Верификация с лична карта', icon: Camera },
      { num: 5, title: 'Публикуваш', desc: 'Готово! Обявата е видима', icon: TrendingUp },
    ],
  },
  {
    section: 'Заявки',
    items: [
      { num: 6, title: 'Получаваш заявки', desc: 'Хора изпращат заявки за наем', icon: CheckCircle2 },
      { num: 7, title: 'Преглеждаш и избираш', desc: 'Сравни заявките и преглеждай профили', icon: CheckCircle2 },
      { num: 8, title: 'Натискаш „Потвърди"', desc: '✓ Отваря се чат с наемателя', icon: MessageSquare },
    ],
  },
  {
    section: 'Наем',
    items: [
      { num: 9, title: 'Даваш вещта', desc: 'Снимай състоянието преди изпращане за защита при спор', icon: Camera },
      { num: 10, title: 'Наемателят потвърждава', desc: 'CHOICES_WITH_AUTO', icon: CheckCircle2 },
    ],
  },
  {
    section: 'Завършване',
    items: [
      { num: 11, title: 'Получаваш наема', desc: '✓ Ако всичко е наред', icon: TrendingUp },
      { num: 12, title: 'Получаваш вещта обратно', desc: 'Наемателят я връща', icon: CheckCircle2 },
      { num: 13, title: 'Потвърждаваш състоянието', desc: 'Проверяваш дали всичко е наред след връщане', icon: Camera },
      { num: 14, title: 'Даваш рейтинг', desc: 'Оцени наемателя ⭐', icon: Star },
    ],
  },
];

function ChoicesRow() {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="flex items-center gap-1.5 mt-1">
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-100">
        <CheckCircle2 className="w-3 h-3" /> Всичко ОК
      </span>

      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-100">
        <AlertCircle className="w-3 h-3" /> Проблем
        <div className="relative ml-0.5">
          <button
            type="button"
            onClick={() => setShowTip(v => !v)}
            className="w-4 h-4 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center hover:bg-orange-300 transition-colors"
          >
            <HelpCircle className="w-3 h-3" />
          </button>
          {showTip && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowTip(false)} />
              <div
                className="absolute left-1/2 -translate-x-1/2 top-6 z-50 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-4"
                style={{ animation: 'fadeScaleIn 0.18s ease' }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-xs font-semibold text-gray-800">⚠️ Какво става при проблем?</p>
                  <button onClick={() => setShowTip(false)} className="text-gray-300 hover:text-gray-500 shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Ако наемателят докладва проблем, случаят се преглежда и при нужда наемът се връща.
                </p>
              </div>
            </>
          )}
        </div>
      </span>

      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold border border-red-100">
        <X className="w-3 h-3" /> Отказ
      </span>
    </div>
  );
}

export default function EarnerFlow() {
  return (
    <div className="space-y-8">
      {steps.map((section, sIdx) => (
        <motion.div
          key={sIdx}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: sIdx * 0.05 }}
        >
          <h3 className="font-heading font-bold text-xl text-[#1e2a6e] mb-4">
            {section.section}
          </h3>
          <div className="space-y-3">
            {section.items.map((item, iIdx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={iIdx}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: sIdx * 0.05 + iIdx * 0.03 }}
                  className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all"
                >
                  <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-heading font-semibold text-[#1e2a6e] mb-1">
                      {item.num}. {item.title}
                    </h4>
                    {item.desc === 'CHOICES_WITH_AUTO' ? (
                      <>
                        <p className="text-sm text-gray-500 mb-1">Избираш:</p>
                        <ChoicesRow />
                        <p className="text-xs text-gray-400 mt-1.5">✓ Ако няма избор 48ч → автоматично OK</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {item.desc}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}