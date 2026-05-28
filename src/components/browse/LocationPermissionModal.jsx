import React, { useEffect, useState } from 'react';
import { MapPin, ShieldCheck } from 'lucide-react';

export default function LocationPermissionModal({ onAllow, onDeny }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleDeny = () => {
    setVisible(false);
    setTimeout(onDeny, 300);
  };

  const handleAllow = () => {
    setVisible(false);
    setTimeout(onAllow, 300);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99998,
          backgroundColor: visible ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0)',
          backdropFilter: visible ? 'blur(6px)' : 'blur(0px)',
          transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease',
        }}
        onClick={handleDeny}
      />

      {/* Modal — exactly centered in viewport */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${visible ? 1 : 0.95})`,
          opacity: visible ? 1 : 0,
          transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
          zIndex: 99999,
          width: 'calc(100% - 32px)',
          maxWidth: '360px',
        }}
      >
      <div
        style={{
          width: '100%',
        }}
      >
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Map illustration */}
          <div className="relative h-52 overflow-hidden bg-[#e8eaf0]">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=300&fit=crop"
              alt="map"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-48 h-48 rounded-full bg-purple-400/20" />
              <div className="absolute w-32 h-32 rounded-full bg-purple-400/25" />
              <div className="absolute w-16 h-16 rounded-full bg-purple-500/30" />
              <div className="relative z-10 w-14 h-14 rounded-full gradient-brand flex items-center justify-center shadow-lg">
                <MapPin className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pt-6 pb-8">
            <h2 className="font-heading font-bold text-[#1e2a6e] text-2xl text-center mb-2">
              Виж обяви около теб
            </h2>
            <p className="text-gray-500 text-sm text-center leading-relaxed mb-4">
              Позволи ни достъп до местоположението ти, за да ти покажем обяви в радиус от 50 км
            </p>

            <div className="flex items-start gap-2.5 mb-6">
              <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400 leading-relaxed">
                Достъпът се използва само за търсене и не се споделя публично.
              </p>
            </div>

            <button
              onClick={handleAllow}
              className="w-full py-4 rounded-2xl gradient-brand text-white font-semibold text-base mb-3 hover:opacity-90 transition-opacity shadow-brand"
            >
              Разреши достъп
            </button>
            <button
              onClick={handleDeny}
              className="w-full py-4 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-base hover:bg-gray-50 transition-colors"
            >
              Не разрешавай
            </button>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}