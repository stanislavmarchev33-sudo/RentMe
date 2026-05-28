import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, CreditCard, PackageCheck, Shield, Camera, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const { lang } = useI18n();

  const renterSteps = [
    { icon: Search, title: lang === 'bg' ? 'Намери артикул' : 'Find an Item', desc: lang === 'bg' ? 'Разгледай категории или търси по ключова дума. Филтрирай по цена, разстояние и състояние.' : 'Browse categories or search by keyword. Filter by price, distance, and condition.' },
    { icon: CreditCard, title: lang === 'bg' ? 'Заяви и плати' : 'Request & Pay', desc: lang === 'bg' ? 'Изпрати заявка. След одобрение, плати сигурно чрез ескроу система.' : 'Send a request. Once approved, pay securely through escrow.' },
    { icon: Camera, title: lang === 'bg' ? 'Документирай' : 'Document', desc: lang === 'bg' ? 'Заснеми състоянието при получаване. Това те защитава при спор.' : 'Capture condition on receipt. This protects you in disputes.' },
    { icon: PackageCheck, title: lang === 'bg' ? 'Използвай и върни' : 'Use & Return', desc: lang === 'bg' ? 'Радвай се на артикула и го върни навреме. Депозитът се освобождава.' : 'Enjoy the item and return on time. Deposit is released.' },
  ];

  const ownerSteps = [
    { icon: PackageCheck, title: lang === 'bg' ? 'Обяви артикул' : 'List an Item', desc: lang === 'bg' ? 'Качи снимки, опиши артикула, задай цена. AI ще ти помогне.' : 'Upload photos, describe the item, set pricing. AI assists you.' },
    { icon: Shield, title: lang === 'bg' ? 'Приеми заявка' : 'Accept Request', desc: lang === 'bg' ? 'Одобри или откажи заявки. Депозитът защитава артикула ти.' : 'Approve or decline requests. Deposit protects your item.' },
    { icon: Camera, title: lang === 'bg' ? 'Документирай' : 'Document', desc: lang === 'bg' ? 'Заснеми състоянието преди изпращане и при получаване обратно.' : 'Capture condition before sending and when receiving back.' },
    { icon: Star, title: lang === 'bg' ? 'Получи плащане' : 'Get Paid', desc: lang === 'bg' ? 'Парите се освобождават след успешно завършване. Комисия: 10%.' : 'Funds release after completion. Commission: 10%.' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          {lang === 'bg' ? 'Как работи RentMe' : 'How RentMe Works'}
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {lang === 'bg' ? 'Безопасно наемане и отдаване под наем. Защитено с депозити, застраховка и система за доказателства.' : 'Safe renting and listing. Protected with deposits, insurance, and a proof system.'}
        </p>
      </div>

      {/* For Renters */}
      <div className="mb-16">
        <h2 className="font-heading text-2xl font-bold mb-8 text-center">
          {lang === 'bg' ? '🏠 За наематели' : '🏠 For Renters'}
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {renterSteps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-xs text-primary font-bold mb-1">{lang === 'bg' ? 'Стъпка' : 'Step'} {i + 1}</div>
                  <h3 className="font-heading font-semibold mb-2">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* For Owners */}
      <div className="mb-16">
        <h2 className="font-heading text-2xl font-bold mb-8 text-center">
          {lang === 'bg' ? '💰 За собственици' : '💰 For Owners'}
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {ownerSteps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-xs text-accent font-bold mb-1">{lang === 'bg' ? 'Стъпка' : 'Step'} {i + 1}</div>
                  <h3 className="font-heading font-semibold mb-2">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link to="/browse">
          <Button size="lg" className="gradient-bg text-white border-0 rounded-xl gap-2">
            {lang === 'bg' ? 'Започни сега' : 'Get Started'} <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}