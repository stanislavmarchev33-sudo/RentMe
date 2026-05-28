import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';

export default function Footer() {
  const { t, lang } = useI18n();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <span className="text-white font-heading font-bold text-sm">R</span>
              </div>
              <span className="font-heading font-bold text-xl gradient-text">RentMe</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {lang === 'bg' 
                ? 'Използвай това, което ти трябва. Печели от това, което не ти.'
                : 'Use what you need. Earn from what you don\'t.'}
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm mb-3">
              {lang === 'bg' ? 'Платформа' : 'Platform'}
            </h4>
            <div className="space-y-2">
              <Link to="/browse" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.browse')}</Link>
              <Link to="/how-it-works" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.how_it_works')}</Link>
              <Link to="/faq" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.faq')}</Link>
              <Link to="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.contact')}</Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm mb-3">
              {lang === 'bg' ? 'Правна информация' : 'Legal'}
            </h4>
            <div className="space-y-2">
              <Link to="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                {lang === 'bg' ? 'Условия за ползване' : 'Terms of Use'}
              </Link>
              <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                {lang === 'bg' ? 'Поверителност' : 'Privacy Policy'}
              </Link>
              <Link to="/insurance-info" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                {lang === 'bg' ? 'Застраховка' : 'Insurance'}
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm mb-3">
              {lang === 'bg' ? 'Подкрепа' : 'Support'}
            </h4>
            <div className="space-y-2">
              <Link to="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                {lang === 'bg' ? 'Свържете се' : 'Contact Us'}
              </Link>
              <Link to="/faq" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                {lang === 'bg' ? 'Помощен център' : 'Help Center'}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 RentMe. {lang === 'bg' ? 'Всички права запазени.' : 'All rights reserved.'}
          </p>
          <p className="text-xs text-muted-foreground italic">
            {lang === 'bg' 
              ? 'Не сме застрахователен доставчик. Защитата се предлага чрез лицензиран партньор.'
              : 'We are not an insurance provider. Protection is offered via a licensed partner.'}
          </p>
        </div>
      </div>
    </footer>
  );
}