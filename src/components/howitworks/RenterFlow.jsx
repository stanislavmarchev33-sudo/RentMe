import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MessageSquare, CreditCard, Camera, AlertCircle, CheckCircle2, Star, HelpCircle, X, BadgeCheck } from 'lucide-react';

const steps = [
  {
    section: 'Намери и заяви',
    items: [
      { num: 1, title: 'Намираш вещ', desc: 'Разглеждаш обяви и използваш филтри', icon: Search },
      { num: 2, title: 'Натискаш „Наеми"', desc: 'Избираш дати за наемане', icon: CreditCard },
      { num: 3, title: 'Изпращаш заявка', desc: 'Собственикът я преглежда и отговаря', icon: MessageSquare },
    ],
  },
  {
    section: 'Уговорка и плащане',
    items: [
      { num: 4, title: 'При одобрение → отваря се чат', desc: 'Уточнявате детайли (вземане, връщане, час и място)', icon: MessageSquare },
      { num: 5, title: 'Минаваш верификация', desc: 'Потвърждаваш самоличността си', icon: BadgeCheck },
      { num: 6, title: 'Натискаш „Плати"', desc: 'PAYMENT_DETAILS', icon: CreditCard },
    ],
  },
  {
    section: 'Ползване',
    items: [
      { num: 7, title: 'Получаваш вещта', desc: 'CHOICES_WITH_AUTO', icon: CheckCircle2 },
      { num: 8, title: 'Ползваш вещта', desc: 'Наслади се на наемането', icon: Star },
    ],
  },
  {
    section: 'Връщане и защита',
    items: [
      { num: 9, title: 'Връщаш вещта', desc: 'Снимай състоянието преди връщане\nза защита при спор', icon: Camera },
      { num: 10, title: 'Депозитът се отключва', desc: '✓ При потвърждение ИЛИ\n✓ Автоматично след 48ч', icon: CreditCard },
      { num: 11, title: 'Даваш рейтинг', desc: 'Оцени собственика ⭐', icon: Star },
    ],
  },
];

function InfoTooltip({ id, color, label, title, children }) {
  const [open, setOpen] = useState(false);
  const colors = {
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', btn: 'bg-purple-200 hover:bg-purple-300 text-purple-700' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', btn: 'bg-blue-200 hover:bg-blue-300 text-blue-700' },
  };
  const c = colors[color] || colors.purple;
  return (
    <div className="relative inline-flex items-center">
      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${c.bg} ${c.text} text-xs font-semibold border ${c.border}`}>
        {label}
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className={`w-4 h-4 rounded-full ${c.btn} flex items-center justify-center transition-colors ml-0.5`}
        >
          <HelpCircle className="w-3 h-3" />
        </button>
      </span>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute left-1/2 -translate-x-1/2 top-8 z-50 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4"
            style={{ animation: 'fadeScaleIn 0.18s ease' }}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <p className="text-xs font-bold text-gray-800">{title}</p>
              <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-gray-500 shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-xs text-gray-600 leading-relaxed space-y-2">{children}</div>
          </div>
        </>
      )}
    </div>
  );
}

function PaymentDetails() {
  return (
    <div className="flex flex-col gap-2 mt-1">
      <InfoTooltip color="purple" label="✓ Наемът се задържа" title="🔒 Как работи задържането на наема?">
        <p>Плащането не отива веднага при собственика. Парите се задържат от платформата, докато потвърдиш, че всичко е наред с вещта.</p>
        <p>👉 Ако има проблем → наемът може да ти бъде върнат</p>
        <p>👉 Ако не отговориш до 48 часа → автоматично се приема, че всичко е наред</p>
      </InfoTooltip>
      <InfoTooltip color="blue" label="✓ Депозитът се блокира" title="🛡️ Как работи депозитът?">
        <p>Депозитът служи като гаранция за собственика. Сумата се блокира от картата ти, но не се взима, освен ако няма проблем.</p>
        <p>👉 При повреда, липса или закъснение → може да се удържи част или целият депозит</p>
        <p>👉 Ако всичко е наред → депозитът се отключва</p>
        <p>👉 Ако няма действие до 48 часа → отключва се автоматично</p>
      </InfoTooltip>
    </div>
  );
}

function ChoicesRow() {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="flex items-center gap-1.5 mt-1">
      {/* Всичко ОК */}
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-100">
        <CheckCircle2 className="w-3 h-3" /> Всичко ОК
      </span>

      {/* Проблем + tooltip */}
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
                  Ако вещта не отговаря на описанието или има проблем, направи снимки и го отбележи.
                  Наемът може да ти бъде възстановен след преглед.
                </p>
              </div>
            </>
          )}
        </div>
      </span>

      {/* Отказ */}
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold border border-red-100">
        <X className="w-3 h-3" /> Отказ
      </span>
    </div>
  );
}

export default function RenterFlow() {
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
                    {(item.desc === 'CHOICES' || item.desc === 'CHOICES_WITH_AUTO') ? (
                      <>
                        <p className="text-sm text-gray-500 mb-1">Избираш:</p>
                        <ChoicesRow />
                        {item.desc === 'CHOICES_WITH_AUTO' && (
                          <p className="text-xs text-gray-400 mt-1.5">✓ Ако няма избор 48ч → автоматично OK</p>
                        )}
                      </>
                    ) : item.desc === 'PAYMENT_DETAILS' ? (
                      <PaymentDetails />
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