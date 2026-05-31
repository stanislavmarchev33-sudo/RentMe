import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

const Section = ({ title, icon: Icon, children }) => (
  <div className="mb-8">
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon className="w-5 h-5 text-primary shrink-0" />}
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="text-sm text-gray-600 leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function InsuranceInfoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">Информация за защита и застраховка</h1>
        <p className="text-sm text-gray-400">Последна актуализация: 1 януари 2026 г.</p>
        <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800 flex gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            RentMe не е застрахователен доставчик. Защитата на предметите се предлага чрез
            лицензиран застрахователен партньор и подлежи на неговите общи условия.
          </span>
        </div>
      </div>

      <Section title="Как работи депозитът" icon={Shield}>
        <p>
          При всяка резервация Наемодателят може да определи сума за депозит, която се изчислява
          автоматично като 20% от оценената стойност на предмета. Депозитът <strong>не се тегли</strong> от
          сметката на Наемателя — той се блокира временно и се освобождава автоматично след
          потвърдено връщане на предмета без забележки.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Депозитът се задържа за периода на наема + 48 часа след връщане;</li>
          <li>При потвърдено добро състояние — освобождава се напълно;</li>
          <li>При констатирана щета — задържа се до разрешаване на спора;</li>
          <li>Освобождаването е видимо в раздел „Портфейл" в рамките на 3–5 работни дни.</li>
        </ul>
      </Section>

      <Section title="Какво покрива защитата" icon={CheckCircle}>
        <p>
          Платформата предлага базова защита на предметите, включена при активиране на
          застрахователната опция в обявата:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Случайна повреда</strong> по време на наема;</li>
          <li><strong>Кражба</strong> при наличие на полицейски протокол;</li>
          <li><strong>Загуба</strong> при доказани обстоятелства.</li>
        </ul>
        <p>
          Максималният размер на обезщетението е ограничен до застрахователната стойност на
          предмета, посочена в обявата. Защитата важи само за периода на активна резервация.
        </p>
      </Section>

      <Section title="Какво не е покрито" icon={AlertTriangle}>
        <ul className="list-disc pl-5 space-y-1">
          <li>Нормално износване и амортизация;</li>
          <li>Умишлена повреда или злоупотреба;</li>
          <li>Предмети, използвани извън посоченото предназначение;</li>
          <li>Косвени вреди (пропуснати ползи, загуба на доходи);</li>
          <li>Предмети без активирана застрахователна опция в обявата.</li>
        </ul>
      </Section>

      <Section title="Цена на застраховката" icon={Shield}>
        <p>
          Застрахователната опция се активира от Наемодателя при публикуване на обявата.
          Стандартната застрахователна такса е <strong>10 лв.</strong> на резервация и се включва
          автоматично в крайната цена, видима за Наемателя преди потвърждение.
        </p>
      </Section>

      <Section title="Процедура при щета или спор" icon={HelpCircle}>
        <p>При констатирана повреда или проблем при връщане:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Докладвайте проблема незабавно чрез бутона „Докладвай проблем" в страницата на резервацията;</li>
          <li>Качете снимки на повредата (минимум 3 от различни ъгли);</li>
          <li>Опишете обстоятелствата подробно в полето за описание;</li>
          <li>Екипът ни ще се свърже с двете страни в рамките на <strong>24 работни часа</strong>;</li>
          <li>При необходимост от застрахователно обезщетение — ще бъдете насочени към партньорския застраховател.</li>
        </ol>
        <p>
          Всички спорове се разглеждат обективно от екипа на RentMe. Крайното решение по
          застрахователни претенции се взема от лицензирания застрахователен партньор.
        </p>
      </Section>

      <Section title="Допълнителна информация" icon={HelpCircle}>
        <p>
          За конкретни въпроси относно покритието или за подаване на претенция се свържете с нас:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Имейл: <a href="mailto:support@rentmemarket.com" className="text-primary hover:underline">support@rentmemarket.com</a></li>
          <li>Формуляр: <Link to="/contact" className="text-primary hover:underline">страница за контакт</Link></li>
        </ul>
      </Section>
    </div>
  );
}
