import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Tag, DollarSign, Shield, Truck, Clock, ChevronDown, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import LocationPermissionModal from '@/components/browse/LocationPermissionModal';

// ─── Global open state manager ────────────────────────────────────────────────
let globalCloseAll = null;

// ─── Chip label ───────────────────────────────────────────────────────────────
function chipLabel(base, values, nameMap) {
  if (!values || values.length === 0) return base;
  if (values.length === 1) return nameMap ? (nameMap[values[0]] || values[0]) : values[0];
  return `${base}: ${values.length}`;
}

// ─── Dropdown wrapper (portal-based, one-at-a-time) ───────────────────────────
function Dropdown({ id, label, icon: Icon, active, hasDraft, onClear, onConfirm, children, blockOutsideClose }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  // Register close handler globally
  useEffect(() => {
    const prev = globalCloseAll;
    globalCloseAll = (exceptId) => {
      if (exceptId !== id) setOpen(false);
      if (prev) prev(exceptId);
    };
    return () => {
      globalCloseAll = prev;
    };
  }, [id]);

  const updatePos = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, left: r.left });
    }
  };

  const handleOpen = (e) => {
    e.stopPropagation();
    if (!open) {
      updatePos();
      if (globalCloseAll) globalCloseAll(id);
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  // Close on outside click / scroll / resize (unless blocked e.g. modal is open)
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (blockOutsideClose) return;
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      if (panelRef.current && panelRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const closeScroll = () => { if (!blockOutsideClose) setOpen(false); };
    document.addEventListener('click', close, true);
    window.addEventListener('scroll', closeScroll, true);
    window.addEventListener('resize', closeScroll);
    return () => {
      document.removeEventListener('click', close, true);
      window.removeEventListener('scroll', closeScroll, true);
      window.removeEventListener('resize', closeScroll);
    };
  }, [open, blockOutsideClose]);

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    setOpen(false);
  };

  const handleClear = () => {
    if (onClear) onClear();
  };

  return (
    <div className="relative shrink-0">
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all whitespace-nowrap select-none ${
          active
            ? 'bg-[#7b2ff7] text-white border-[#7b2ff7] shadow-sm'
            : 'bg-white text-gray-600 border-gray-200 hover:border-[#7b2ff7]/50 hover:text-[#7b2ff7]'
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span>{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 99999 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] border border-gray-100 min-w-[230px] overflow-hidden"
        >
          {children}

          {/* Action buttons */}
          <div className="border-t border-gray-100">
            <button
              type="button"
              onClick={handleConfirm}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
                (hasDraft !== undefined ? hasDraft : active)
                  ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm'
                  : 'text-green-600 hover:bg-green-50'
              }`}
            >
              <Check className="w-3.5 h-3.5" /> Потвърди
            </button>
            {(hasDraft !== undefined ? hasDraft : active) && (
              <button
                type="button"
                onClick={handleClear}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 border-t border-gray-100 transition-colors font-medium"
              >
                <X className="w-3.5 h-3.5" /> Изчисти
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── Option row ───────────────────────────────────────────────────────────────
function Opt({ label, selected, onToggle, isAll }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left ${
        selected
          ? isAll
            ? 'bg-[#7b2ff7]/8 text-[#7b2ff7] font-semibold'
            : 'text-[#7b2ff7] font-medium bg-[#7b2ff7]/5'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <span>{label}</span>
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
        selected ? 'bg-[#7b2ff7] border-[#7b2ff7]' : 'border-gray-200'
      }`}>
        {selected && <Check className="w-3 h-3 text-white" />}
      </div>
    </button>
  );
}

function Sep() {
  return <div className="h-px bg-gray-100 mx-3 my-0.5" />;
}

// ─── LOCATION ────────────────────────────────────────────────────────────────
const CITIES = ['София', 'Пловдив', 'Варна', 'Бургас'];
const ALL_LOC_COUNT = CITIES.length + 1;

export function LocationFilter({ value, onChange, onCoordsChange }) {
  const [draft, setDraft] = useState(value);
  const [showPermModal, setShowPermModal] = useState(false);

  useEffect(() => { setDraft(value); }, [value]);

  const requestGeo = () => {
    if (!navigator.geolocation) {
      toast.error('Браузърът ти не поддържа геолокация.');
      return;
    }
    toast.loading('Определяне на местоположението...', { id: 'geo' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.success('Местоположението е определено!', { id: 'geo' });
        if (onCoordsChange) onCoordsChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        const next = [...new Set([...draft, 'near_me'])];
        setDraft(next.length >= ALL_LOC_COUNT ? [] : next);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          toast.error('Отказа достъп до местоположение. Разреши го от настройките на браузъра.', { id: 'geo' });
        } else {
          toast.error('Не можахме да определим местоположението ти.', { id: 'geo' });
        }
      },
      { timeout: 10000 }
    );
  };

  const toggle = (v) => {
    if (v === 'all') { setDraft([]); return; }
    if (v === 'near_me') {
      if (draft.includes('near_me')) { setDraft(draft.filter(x => x !== 'near_me')); return; }
      setShowPermModal(true);
      return;
    }
    const next = draft.includes(v) ? draft.filter(x => x !== v) : [...new Set([...draft, v])];
    setDraft(next.length >= ALL_LOC_COUNT ? [] : next);
  };

  const nameMap = { near_me: 'Близо до мен', ...Object.fromEntries(CITIES.map(c => [c, c])) };
  const label = chipLabel('Местоположение', value, nameMap);

  return (
    <>
      {showPermModal && createPortal(
        <LocationPermissionModal
          onAllow={() => { setShowPermModal(false); requestGeo(); }}
          onDeny={() => setShowPermModal(false)}
        />,
        document.body
      )}
      <Dropdown id="location" label={label} icon={MapPin} active={value.length > 0} hasDraft={draft.length > 0}
        onConfirm={() => onChange(draft)} onClear={() => setDraft([])} blockOutsideClose={showPermModal}>
        <div className="py-1.5">
          <Opt label="Всички" selected={draft.length === 0} onToggle={() => setDraft([])} isAll />
          <Sep />
          <Opt label="📍 Близо до мен (до 50 км)" selected={draft.includes('near_me')} onToggle={() => toggle('near_me')} />
          <Sep />
          {CITIES.map(c => (
            <Opt key={c} label={c} selected={draft.includes(c)} onToggle={() => toggle(c)} />
          ))}
        </div>
      </Dropdown>
    </>
  );
}

// ─── CATEGORY ────────────────────────────────────────────────────────────────
const CATS = [
  { v: 'Фотография', l: '📷 Фотография' },
  { v: 'Музика',     l: '🎸 Музика' },
  { v: 'Спорт',      l: '⚽ Спорт' },
  { v: 'Инструменти',l: '🔧 Инструменти' },
  { v: 'Техника',    l: '💻 Техника' },
  { v: 'Парти',      l: '🎉 Парти' },
  { v: 'Други',      l: '📦 Други' },
];

export function CategoryFilter({ value, onChange }) {
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  const toggle = (v) => {
    const next = draft.includes(v) ? draft.filter(x => x !== v) : [...draft, v];
    setDraft(next.length >= CATS.length ? [] : next);
  };

  const label = chipLabel('Категория', value);

  return (
    <Dropdown id="category" label={label} icon={Tag} active={value.length > 0} hasDraft={draft.length > 0}
      onConfirm={() => onChange(draft)} onClear={() => setDraft([])}>
      <div className="py-1.5">
        <Opt label="Всички категории" selected={draft.length === 0} onToggle={() => setDraft([])} isAll />
        <Sep />
        {CATS.map(cat => (
          <Opt key={cat.v} label={cat.l} selected={draft.includes(cat.v)} onToggle={() => toggle(cat.v)} />
        ))}
      </div>
    </Dropdown>
  );
}

// ─── PRICE ───────────────────────────────────────────────────────────────────
const SORT_OPTS = [
  { v: 'newest',     l: '✖️ Без значение' },
  { v: 'price_low',  l: '💸 Най-евтини → най-скъпи' },
  { v: 'price_high', l: '💰 Най-скъпи → най-евтини' },
];

export function PriceFilter({ sort, setSort, minPrice, maxPrice, setMinPrice, setMaxPrice }) {
  const [draftSort, setDraftSort] = useState(sort);
  const [draftMin, setDraftMin] = useState(minPrice);
  const [draftMax, setDraftMax] = useState(maxPrice);
  const [customOpen, setCustomOpen] = useState(false);

  useEffect(() => { setDraftSort(sort); setDraftMin(minPrice); setDraftMax(maxPrice); }, [sort, minPrice, maxPrice]);

  const isActive = sort !== 'newest' || !!minPrice || !!maxPrice;

  const label = sort === 'price_low' ? 'Цена ↑'
    : sort === 'price_high' ? 'Цена ↓'
    : (minPrice || maxPrice) ? 'Цена: диапазон'
    : 'Цена';

  const handleConfirm = () => {
    setSort(draftSort);
    setMinPrice(draftMin);
    setMaxPrice(draftMax);
  };

  const handleClear = () => {
    setDraftSort('newest'); setDraftMin(''); setDraftMax('');
    setCustomOpen(false);
  };

  const isDraftActive = draftSort !== 'newest' || !!draftMin || !!draftMax;

  return (
    <Dropdown id="price" label={label} icon={DollarSign} active={isActive} hasDraft={isDraftActive}
      onConfirm={handleConfirm} onClear={handleClear}>
      <div className="py-1.5">
        {SORT_OPTS.map(opt => (
          <button
            key={opt.v}
            type="button"
            onClick={() => { setDraftSort(opt.v); setCustomOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left ${
              draftSort === opt.v && !customOpen
                ? 'text-[#7b2ff7] font-semibold bg-[#7b2ff7]/8'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {opt.l}
            {draftSort === opt.v && !customOpen && <Check className="w-4 h-4 text-[#7b2ff7]" />}
          </button>
        ))}
        <Sep />
        <button
          type="button"
          onClick={() => setCustomOpen(o => !o)}
          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
            customOpen ? 'text-[#7b2ff7] font-semibold bg-[#7b2ff7]/8' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          🔧 Персонализирай
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${customOpen ? 'rotate-180' : ''}`} />
        </button>
        {customOpen && (
          <div className="px-4 pb-3 pt-1 flex items-end gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-400 block mb-1">От (лв)</label>
              <input type="number" placeholder="0" value={draftMin}
                onChange={e => setDraftMin(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#7b2ff7]/40 bg-gray-50" />
            </div>
            <span className="text-gray-300 pb-2">—</span>
            <div className="flex-1">
              <label className="text-xs text-gray-400 block mb-1">До (лв)</label>
              <input type="number" placeholder="∞" value={draftMax}
                onChange={e => setDraftMax(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#7b2ff7]/40 bg-gray-50" />
            </div>
          </div>
        )}
      </div>
    </Dropdown>
  );
}

// ─── TRUST ───────────────────────────────────────────────────────────────────
const TRUST_OPTS = [
  { v: 'insured',   l: '🛡️ Със застраховка' },
  { v: 'trusted',   l: '⭐ Trusted' },
  { v: 'top_rated', l: '🔥 Най-висок рейтинг' },
  { v: 'recommended', l: '🔥 Препоръчани' },
];
const TRUST_NAMES = { insured: 'Застраховка', trusted: 'Trusted', top_rated: 'Рейтинг', recommended: 'Препоръчани' };

export function TrustFilter({ value, onChange }) {
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  const toggle = (v) => {
    const next = draft.includes(v) ? draft.filter(x => x !== v) : [...draft, v];
    setDraft(next.length >= TRUST_OPTS.length ? [] : next);
  };

  const label = chipLabel('Доверие', value, TRUST_NAMES);

  return (
    <Dropdown id="trust" label={label} icon={Shield} active={value.length > 0} hasDraft={draft.length > 0}
      onConfirm={() => onChange(draft)} onClear={() => setDraft([])}>
      <div className="py-1.5">
        <Opt label="Всички" selected={draft.length === 0} onToggle={() => setDraft([])} isAll />
        <Sep />
        {TRUST_OPTS.map(opt => (
          <Opt key={opt.v} label={opt.l} selected={draft.includes(opt.v)} onToggle={() => toggle(opt.v)} />
        ))}
      </div>
    </Dropdown>
  );
}

// ─── DELIVERY ────────────────────────────────────────────────────────────────
const DEL_OPTS = [
  { v: 'courier', l: '📦 Куриер' },
  { v: 'pickup',  l: '🤝 Лично взимане' },
  { v: 'owner',   l: '🚗 Лично доставяне' },
];
const DEL_NAMES = { courier: 'Куриер', pickup: 'Лично взимане', owner: 'Лично доставяне' };

export function DeliveryFilter({ value, onChange }) {
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  const toggle = (v) => {
    const next = draft.includes(v) ? draft.filter(x => x !== v) : [...draft, v];
    setDraft(next.length >= DEL_OPTS.length ? [] : next);
  };

  const label = chipLabel('Получаване', value, DEL_NAMES);

  return (
    <Dropdown id="delivery" label={label} icon={Truck} active={value.length > 0} hasDraft={draft.length > 0}
      onConfirm={() => onChange(draft)} onClear={() => setDraft([])}>
      <div className="py-1.5">
        <Opt label="Всички начини" selected={draft.length === 0} onToggle={() => setDraft([])} isAll />
        <Sep />
        {DEL_OPTS.map(opt => (
          <Opt key={opt.v} label={opt.l} selected={draft.includes(opt.v)} onToggle={() => toggle(opt.v)} />
        ))}
      </div>
    </Dropdown>
  );
}

// ─── TIME ────────────────────────────────────────────────────────────────────
const TIME_OPTS = [
  { v: '3days', l: '🆕 Нова (до 3 дни)' },
  { v: 'week',  l: '📅 До 1 седмица' },
  { v: 'month', l: '📆 До 1 месец' },
  { v: 'older', l: '⏳ По-стари' },
];
const TIME_NAMES = { '3days': 'Нова', week: 'Седмица', month: 'Месец', older: 'По-стари' };

export function TimeFilter({ value, onChange }) {
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  const toggle = (v) => {
    const next = draft.includes(v) ? draft.filter(x => x !== v) : [...draft, v];
    setDraft(next.length >= TIME_OPTS.length ? [] : next);
  };

  const label = chipLabel('Кога е пусната', value, TIME_NAMES);

  return (
    <Dropdown id="time" label={label} icon={Clock} active={value.length > 0} hasDraft={draft.length > 0}
      onConfirm={() => onChange(draft)} onClear={() => setDraft([])}>
      <div className="py-1.5">
        <Opt label="Всяко време" selected={draft.length === 0} onToggle={() => setDraft([])} isAll />
        <Sep />
        {TIME_OPTS.map(opt => (
          <Opt key={opt.v} label={opt.l} selected={draft.includes(opt.v)} onToggle={() => toggle(opt.v)} />
        ))}
      </div>
    </Dropdown>
  );
}