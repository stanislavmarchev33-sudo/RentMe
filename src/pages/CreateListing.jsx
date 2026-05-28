import React, { useState, useEffect } from 'react';

// ── Pricing constants (outside component to avoid re-creation) ──────────────
const CATEGORY_SETTINGS = {
  music:       { d: 0.12, Fc: 0.35, Kc: 0.04, minDailyRent: 8,  minDeposit: 25 },
  photography: { d: 0.12, Fc: 0.40, Kc: 0.05, minDailyRent: 8,  minDeposit: 30 },
  tools:       { d: 0.08, Fc: 0.45, Kc: 0.03, minDailyRent: 6,  minDeposit: 20 },
  sports:      { d: 0.10, Fc: 0.35, Kc: 0.035, minDailyRent: 5, minDeposit: 15 },
  sport:       { d: 0.10, Fc: 0.35, Kc: 0.035, minDailyRent: 5, minDeposit: 15 },
  events:      { d: 0.10, Fc: 0.40, Kc: 0.04, minDailyRent: 7,  minDeposit: 25 },
  party:       { d: 0.10, Fc: 0.40, Kc: 0.04, minDailyRent: 7,  minDeposit: 25 },
  tech:        { d: 0.12, Fc: 0.40, Kc: 0.05, minDailyRent: 8,  minDeposit: 30 },
  other:       { d: 0.10, Fc: 0.35, Kc: 0.03, minDailyRent: 5,  minDeposit: 15 },
};
const CONDITION_FACTORS = {
  like_new: 1.00, good: 0.85, fair: 0.70, worn: 0.55,
};
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ChevronLeft, Upload, Loader2, Camera, MapPin, ShieldCheck, HelpCircle, X } from 'lucide-react';

export default function CreateListing() {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = gear info, 2 = pricing & publish
  const [user, setUser] = useState(null);
  const [useAiPrices, setUseAiPrices] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showPhotoTip, setShowPhotoTip] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    purchase_price: '',
    year_bought: '',
    condition: '',
    images: [],
    location_city: 'София',
    location_address: '',
    daily_price: '',
    deposit_amount: '',
    is_insured: false,
    is_promoted: false,
    ai_value: 0,
  });

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list('sort_order', 50),
    initialData: [],
  });

  const topCategories = categories.filter(c => !c.parent_id && c.is_active);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(prev => ({ ...prev, images: [...prev.images, file_url] }));
    }
  };

  const handleContinue = () => {
    const purchasePrice = parseFloat(form.purchase_price) || 0;
    const yearBought = parseInt(form.year_bought) || new Date().getFullYear();
    const currentYear = new Date().getFullYear();
    const Y = Math.max(0, currentYear - yearBought);

    const cat = topCategories.find(c => c.id === form.category_id);
    const catSlug = (cat?.slug || 'other').toLowerCase();
    const settings = CATEGORY_SETTINGS[catSlug] ?? CATEGORY_SETTINGS.other;
    const { d, Fc, Kc, minDailyRent, minDeposit } = settings;
    const Cf = CONDITION_FACTORS[form.condition] ?? 0.70;

    const rawValue = purchasePrice * Math.pow(1 - d, Y) * Cf;
    const floorValue = purchasePrice * Fc;
    const currentValue = Math.max(rawValue, floorValue);

    const deposit = Math.max(Math.round(currentValue * 0.20), minDeposit);
    const dailyRent = Math.max(Math.round(currentValue * Kc), minDailyRent);

    setForm(prev => ({
      ...prev,
      ai_value: Math.round(currentValue),
      daily_price: String(dailyRent),
      deposit_amount: String(deposit),
    }));
    setStep(2);
  };

  const publishMutation = useMutation({
    mutationFn: async () => {
      const data = {
        ...form,
        daily_price: parseFloat(form.daily_price) || 0,
        deposit_amount: parseFloat(form.deposit_amount) || 0,
        insurance_price: form.is_insured ? 5 : 0,
        is_promoted: form.is_promoted,
        promoted_until: form.is_promoted
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : null,
        status: 'active',
        owner_id: user?.id,
        owner_name: user?.full_name,
        owner_email: user?.email,
        currency: 'BGN',
        last_active: new Date().toISOString(),
      };
      return base44.entities.Listing.create(data);
    },
    onSuccess: (result) => {
      toast.success(lang === 'bg' ? 'Обявата е публикувана!' : 'Listing published!');
      navigate(`/listing/${result.id}`);
    },
  });

  const handlePublish = () => {
    if (!user) {
      setShowLogin(true);
    } else {
      publishMutation.mutate();
    }
  };

  const currentCat = topCategories.find(c => c.id === form.category_id);
  const yearOptions = Array.from({ length: 20 }, (_, i) => String(new Date().getFullYear() - i));

  const conditionOptions = [
    { value: 'like_new', label: lang === 'bg' ? 'Отлично (9/10)' : 'Excellent (9/10)' },
    { value: 'good', label: lang === 'bg' ? 'Много добро (7/10)' : 'Very Good (7/10)' },
    { value: 'fair', label: lang === 'bg' ? 'Добро (5/10)' : 'Good (5/10)' },
    { value: 'worn', label: lang === 'bg' ? 'Задоволително (3/10)' : 'Fair (3/10)' },
  ];

  // Login screen
  if (showLogin) {
    return (
      <div className="min-h-screen bg-[#f5f0ff]">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-purple-100">
          <button onClick={() => setShowLogin(false)} className="text-gray-500 hover:text-gray-700">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-900">
            {lang === 'bg' ? 'Публикуване на обява' : 'Publish Listing'}
          </span>
        </div>

        <div className="max-w-md mx-auto px-4 py-6">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-1">
            {lang === 'bg' ? 'Твоята обява изглежда така' : 'Your listing looks like this'} 👋
          </h2>

          {/* Preview card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-purple-100 mb-6 mt-4">
            {form.images[0] ? (
              <img src={form.images[0]} alt="" className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                <Camera className="w-12 h-12 text-purple-400" />
              </div>
            )}
            <div className="p-4">
              {currentCat && (
                <div className="flex items-center gap-1.5 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full w-fit mb-2">
                  <Camera className="w-3 h-3" />
                  {lang === 'bg' ? currentCat.name_bg : currentCat.name_en}
                </div>
              )}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{form.title || 'Обявата ти'}</h3>
                  <p className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                    <MapPin className="w-3 h-3 text-purple-500" />
                    {form.location_city || 'София'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-lg">{form.daily_price || '—'} <span className="text-sm font-normal">€/ден</span></p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    🔒 {lang === 'bg' ? 'Депозит:' : 'Deposit:'} <span className="font-semibold">{form.deposit_amount || '—'} €</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
            <span className="text-green-500">✅</span>
            {lang === 'bg' ? 'Можеш да ' : 'You can '}
            <span className="text-purple-600 font-medium">{lang === 'bg' ? 'редактираш' : 'edit'}</span>
            {lang === 'bg' ? ' обявата след публикуване.' : ' the listing after publishing.'}
          </p>

          {/* Login card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
            <h3 className="font-heading font-bold text-gray-900 mb-1">
              {lang === 'bg' ? 'Влез, за да публикуваш' : 'Log in to publish'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {lang === 'bg' ? 'Обявата ще бъде публикувана веднага след вход' : 'Your listing will be published immediately after login'}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {lang === 'bg' ? 'Продължи с Google' : 'Continue with Google'}
              </button>

              <button
                onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors text-sm font-medium text-purple-700"
              >
                📱 {lang === 'bg' ? 'Продължи с телефон' : 'Continue with phone'}
              </button>

              <button
                onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 transition-colors text-sm font-medium text-white"
              >
                ✉️ {lang === 'bg' ? 'Вход с имейл' : 'Login with email'}
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-4 text-center">
              {lang === 'bg' ? 'С публикуването приемаш ' : 'By publishing you accept '}
              <span className="text-purple-600">{lang === 'bg' ? 'Общите условия' : 'Terms of Service'}</span>
              {lang === 'bg' ? ' и ' : ' and '}
              <span className="text-purple-600">{lang === 'bg' ? 'Политиката за поверителност' : 'Privacy Policy'}</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Pricing & Location
  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#f5f0ff]">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-purple-100">
          <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-700">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm shrink-0">2</div>
          <span className="font-semibold text-gray-900">
            {lang === 'bg' ? 'Стъпка 2: Цени и Локация' : 'Step 2: Pricing & Location'}
          </span>
        </div>

        <div className="max-w-md mx-auto px-4 py-5 space-y-4">
          {/* AI price suggestion */}
          {form.daily_price ? (
            <div className="bg-white rounded-2xl p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💼</span>
                <span className="font-semibold text-gray-900">{lang === 'bg' ? 'Предложени цени' : 'Suggested Prices'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">{lang === 'bg' ? 'Цена на ден' : 'Per day'}</p>
                  <p className="font-bold text-gray-900 text-lg">{form.daily_price} €</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1 flex items-center justify-center gap-1">🔒 {lang === 'bg' ? 'Депозит' : 'Deposit'}</p>
                  <p className="font-bold text-gray-900 text-lg">{form.deposit_amount} €</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setUseAiPrices(true)}
                  className="py-2.5 px-3 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition-colors"
                >
                  {lang === 'bg' ? 'Използвай тези цени' : 'Use these prices'}
                </button>
                <button
                  onClick={() => setUseAiPrices(false)}
                  className="py-2.5 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                >
                  ✏️ {lang === 'bg' ? 'Редактирай ръчно' : 'Edit manually'}
                </button>
              </div>
            </div>
          ) : null}

          {/* Manual price edit */}
          {(!useAiPrices || !form.daily_price) && (
            <div className="bg-white rounded-2xl p-4 border border-purple-100 space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-700">{lang === 'bg' ? 'Цена на ден (лв.)' : 'Daily price (BGN)'}</Label>
                <Input type="number" value={form.daily_price} onChange={e => update('daily_price', e.target.value)} className="mt-1" placeholder="28" />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">{lang === 'bg' ? 'Депозит (лв.)' : 'Deposit (BGN)'}</Label>
                <Input type="number" value={form.deposit_amount} onChange={e => update('deposit_amount', e.target.value)} className="mt-1" placeholder="180" />
              </div>
            </div>
          )}

          {/* Listing settings */}
          <div className="bg-white rounded-2xl p-4 border border-purple-100 space-y-3">
            <h3 className="font-semibold text-gray-900">{lang === 'bg' ? 'Настройки на обявата' : 'Listing Settings'}</h3>
            <div>
              <Label className="text-sm text-gray-600">{lang === 'bg' ? 'Име' : 'Name'}</Label>
              <Input value={form.title} onChange={e => update('title', e.target.value)} className="mt-1" placeholder={lang === 'bg' ? 'Sony Alpha a7C Camera Kit' : 'Sony Alpha a7C Camera Kit'} />
            </div>
            <div>
              <Label className="text-sm text-gray-600">{lang === 'bg' ? 'Описание (по избор)' : 'Description (optional)'}</Label>
              <Textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                rows={3}
                className="mt-1"
                placeholder={lang === 'bg' ? 'Опиши какво включва, как се използва...' : 'Describe what is included, how to use...'}
              />
            </div>
            <div>
              <Label className="text-sm text-gray-600">{lang === 'bg' ? 'Локация' : 'Location'}</Label>
              <Select value={form.location_city} onValueChange={v => update('location_city', v)}>
                <SelectTrigger className="mt-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-500" />
                    <SelectValue placeholder={lang === 'bg' ? 'Избери град' : 'Select city'} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {['София', 'Пловдив', 'Варна', 'Бургас', 'Стара Загора', 'Велико Търново', 'Русе'].map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-2 flex items-center gap-2 border border-border rounded-lg px-3 py-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <input
                  value={form.location_address}
                  onChange={e => update('location_address', e.target.value)}
                  placeholder={lang === 'bg' ? 'Добави точна локация (по избор)' : 'Add exact location (optional)'}
                  className="flex-1 text-sm bg-transparent outline-none text-gray-600 placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Insurance upsell */}
          <div className="bg-white rounded-2xl p-4 border border-purple-100">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{lang === 'bg' ? 'Защити предмета си при повреда или кражба' : 'Protect your item from damage or theft'}</h3>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {['Пълно покритие', 'Бързо обезщетение', 'Спокойствие за теб и наемателя'].map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      <span className="text-green-500">✓</span> {tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {lang === 'bg' ? 'Само за ' : 'Only '}<strong>5 €</strong>{lang === 'bg' ? ' получаваш пълна защита за целия период на наема.' : ' you get full protection for the entire rental period.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => update('is_insured', !form.is_insured)}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                form.is_insured
                  ? 'bg-green-500 text-white'
                  : 'gradient-bg text-white hover:opacity-90'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              {form.is_insured
                ? (lang === 'bg' ? '✓ Застраховката е включена' : '✓ Insurance included')
                : (lang === 'bg' ? 'Защити предмета си при повреда или кражба – 5 €' : 'Protect your item – 5 €')}
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-1.5 flex items-center justify-center gap-1">
              🔒 {lang === 'bg' ? 'Включва допълнителна защита за сериозни щети и кражба' : 'Includes additional protection for serious damage and theft'}
            </p>
          </div>

          {/* Promo option */}
          <div className="bg-white rounded-2xl p-4 border border-purple-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                <span className="text-xl">⭐</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm">{lang === 'bg' ? 'Промотирай обявата си' : 'Promote your listing'}</h3>
                  <span className="text-sm font-bold text-[#7b2ff7]">1€ / 7 дни</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 mb-3">
                  {lang === 'bg' ? 'Ще се показва най-отгоре и по-често в търсенето' : "Will appear at the top and more often in search"}
                </p>
                <button
                  type="button"
                  onClick={() => update('is_promoted', !form.is_promoted)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all border ${
                    form.is_promoted
                      ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{form.is_promoted ? '⭐' : '☆'}</span>
                  {form.is_promoted
                    ? (lang === 'bg' ? 'Промоцията е включена' : 'Promotion enabled')
                    : (lang === 'bg' ? 'Добави промоция' : 'Add promotion')}
                </button>
              </div>
            </div>
          </div>

          {/* Publish button */}
          <button
            onClick={handlePublish}
            disabled={publishMutation.isPending}
            className="w-full gradient-bg text-white font-bold py-4 rounded-2xl text-base hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {publishMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {lang === 'bg' ? 'Публикувай обявата →' : 'Publish Listing →'}
          </button>
          <p className="text-xs text-gray-400 text-center">
            {lang === 'bg' ? 'Можеш да редактираш по ' : 'You can edit at '}<strong className="text-gray-600">{lang === 'bg' ? 'всяко време' : 'any time'}</strong>
          </p>
        </div>
      </div>
    );
  }

  // Step 1: Tell us about your gear
  return (
    <div className="min-h-screen bg-[#f5f0ff]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-purple-100">
        <Link to="/browse" className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
          <ChevronLeft className="w-5 h-5" />
          {lang === 'bg' ? 'Назад към обявите' : 'Back to Browse'}
        </Link>
      </div>

      {/* Progress */}
      <div className="px-4 py-4 bg-white border-b border-purple-50">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm shrink-0">1</div>
          <div className="flex-1 h-1.5 bg-purple-100 rounded-full">
            <div className="h-full w-1/2 gradient-bg rounded-full" />
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-purple-200 flex items-center justify-center text-purple-300 font-bold text-sm shrink-0">2</div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-5">
        <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-1">
            {lang === 'bg' ? 'Разкажи ни за вещта' : 'Tell us about your gear'}
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            {lang === 'bg' ? 'Качи снимки и попълни детайлите за артикула' : 'Upload some photos and fill in the details about your item'}
          </p>

          {/* Upload zone */}
          <label className="block mb-5 cursor-pointer">
            <div className="border-2 border-dashed border-purple-200 rounded-2xl p-8 text-center hover:border-purple-400 hover:bg-purple-50 transition-all">
              {form.images.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {form.images.map((img, i) => (
                    <img key={i} src={img} alt="" className="w-full aspect-square object-cover rounded-lg" />
                  ))}
                  <div className="aspect-square bg-purple-50 rounded-lg flex items-center justify-center text-purple-400">+</div>
                </div>
              ) : (
                <>
                  <div className="text-5xl mb-3">📷</div>
                  <p className="font-semibold text-gray-700 text-sm">{lang === 'bg' ? 'Кликни за снимка' : 'Click to upload'}</p>
                </>
              )}
            </div>
            <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
          </label>

          {/* Photo quality warning */}
          <div className="flex items-start gap-2 mb-5 -mt-2">
            <p className="text-xs text-amber-700 leading-snug flex-1">
              ⚠️ Ясните снимки доказват състоянието. Неясни снимки = риск за депозит/застраховка.
            </p>
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowPhotoTip(v => !v)}
                className="w-5 h-5 rounded-full border border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Повече информация"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
              {showPhotoTip && (
                <>
                  {/* Backdrop for mobile tap-outside */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowPhotoTip(false)} />
                  <div
                    className="absolute right-0 bottom-7 z-50 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4"
                    style={{ animation: 'fadeScaleIn 0.18s ease' }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-xs font-semibold text-gray-800">📸 Защо са важни снимките?</p>
                      <button onClick={() => setShowPhotoTip(false)} className="text-gray-300 hover:text-gray-500 shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Качи ясни снимки от различни ъгли, включително отблизо на детайли и евентуални забележки. Снимките служат като доказателство за състоянието на артикула. При неясни, непълни или подвеждащи снимки може да бъде намален или отказан депозитът, както и покритието по застраховка.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Category */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                {lang === 'bg' ? 'Категория' : 'Category'} <span className="text-red-500">*</span>
              </Label>
              <Select value={form.category_id} onValueChange={v => update('category_id', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={lang === 'bg' ? 'Избери категория' : 'Select category'} />
                </SelectTrigger>
                <SelectContent>
                  {topCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {lang === 'bg' ? cat.name_bg : cat.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Purchase price */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                {lang === 'bg' ? 'Покупна цена' : 'Purchase Price'} <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Input
                  type="number"
                  value={form.purchase_price}
                  onChange={e => update('purchase_price', e.target.value)}
                  placeholder="e.g. 2000"
                  className="pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">€</span>
              </div>
            </div>

            {/* Year bought */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                {lang === 'bg' ? 'Година на покупка' : 'Year Bought'} <span className="text-red-500">*</span>
              </Label>
              <Select value={form.year_bought} onValueChange={v => update('year_bought', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={lang === 'bg' ? 'Избери година' : 'Select year'} />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Condition */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                {lang === 'bg' ? 'Състояние' : 'Condition'} <span className="text-red-500">*</span>
              </Label>
              <Select value={form.condition} onValueChange={v => update('condition', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={lang === 'bg' ? 'Избери състояние' : 'Select condition'} />
                </SelectTrigger>
                <SelectContent>
                  {conditionOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>

          <p className="text-center text-sm text-purple-600 font-medium mt-5 mb-3">
            {lang === 'bg' ? 'Стъпка 2: Цени и Локация' : 'Step 2: Pricing & Location'}
          </p>

          <button
            onClick={handleContinue}
            className="w-full gradient-bg text-white font-bold py-4 rounded-2xl text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {lang === 'bg' ? 'Продължи →' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}