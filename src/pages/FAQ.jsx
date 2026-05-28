import React from 'react';
import { useI18n } from '@/lib/i18n';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqData = {
  bg: [
    { q: 'Как работи депозитът?', a: 'Депозитът е 20% от оценената стойност на артикула. Той се задържа при плащане и се освобождава автоматично след 48 часа от успешното връщане, ако няма спор.' },
    { q: 'Какво прави застраховката?', a: 'Опционалната застраховка покрива до 80% от стойността на артикула при щета или загуба. Останалите 20% се покриват от депозита. Застраховката е валидна само при наличие на доказателства.' },
    { q: 'Как да документирам състоянието?', a: 'Използвайте вградената камера в приложението. Тя автоматично добавя дата, час и локация. Качени снимки от галерия не се приемат.' },
    { q: 'Какво да правя при проблем?', a: 'Можете да отворите спор до 48 часа от получаване/връщане. За скрити дефекти имате 24 часа от потвърждаването на получаването.' },
    { q: 'Как и кога получавам плащане?', a: 'Плащането се освобождава след успешно завършване на наемането. Комисията е 10% от наемната цена.' },
    { q: 'Мога ли да отмена резервация?', a: 'Преди одобрение - пълно възстановяване. След плащане но преди изпращане - частична неустойка. Ако собственикът не изпрати - пълно възстановяване.' },
    { q: 'Как се определя цената?', a: 'AI оценява стойността на артикула и предлага дневна цена. Вие можете да я коригирате. Депозитът (20%) е фиксиран и не може да се променя.' },
    { q: 'Какво е ескроу система?', a: 'Парите ви се задържат от платформата до успешно завършване на наемането. Нито наемателят, нито собственикът имат достъп до средствата по време на транзакцията.' },
  ],
  en: [
    { q: 'How does the deposit work?', a: 'The deposit is 20% of the AI-estimated item value. It is held during payment and released automatically 48 hours after successful return if no dispute is opened.' },
    { q: 'What does insurance cover?', a: 'Optional insurance covers up to 80% of item value in case of damage or loss. The remaining 20% is covered by the deposit. Insurance is valid only with required proof.' },
    { q: 'How do I document condition?', a: 'Use the built-in camera in the app. It automatically adds date, time, and location. Gallery uploads are not accepted.' },
    { q: 'What if there\'s an issue?', a: 'You can open a dispute within 48 hours of receiving/returning. For hidden defects, you have 24 hours from receipt confirmation.' },
    { q: 'When do I get paid?', a: 'Payment is released after successful rental completion. Platform commission is 10% of rental price.' },
    { q: 'Can I cancel a booking?', a: 'Before approval - full refund. After payment but before sending - partial penalty. If owner fails to send - full refund.' },
    { q: 'How is pricing determined?', a: 'AI estimates item value and suggests daily price. You can adjust it. Deposit (20%) is fixed and cannot be changed.' },
    { q: 'What is escrow?', a: 'Your money is held by the platform until successful completion. Neither renter nor owner has access to funds during the transaction.' },
  ],
};

export default function FAQ() {
  const { lang } = useI18n();
  const items = faqData[lang] || faqData['en'];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          {lang === 'bg' ? 'Въпроси' : 'FAQ'}
        </h1>
        <p className="text-muted-foreground">
          {lang === 'bg' ? 'Всичко, което трябва да знаете за RentMe' : 'Everything you need to know about RentMe'}
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {items.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="bg-card rounded-xl border border-border/50 px-6">
            <AccordionTrigger className="font-heading font-semibold text-left hover:no-underline">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}