'use client';

import React, { useState, useMemo } from 'react';
import { Currency, ExchangeRates, calculateRails } from '@/lib/rates';
import { RailCard } from './RailCard';
import { ArrowLeftRight, Sparkles, TrendingUp, HelpCircle, Layers } from 'lucide-react';

interface ComparisonCalculatorProps {
  rates: ExchangeRates;
  onInitiateRota: (amount: number, from: Currency, to: Currency) => void;
}

export const ComparisonCalculator: React.FC<ComparisonCalculatorProps> = ({
  rates,
  onInitiateRota,
}) => {
  const [amount, setAmount] = useState<number>(500);
  const [fromCurrency, setFromCurrency] = useState<Currency>('EUR');
  const [toCurrency, setToCurrency] = useState<Currency>('TRY');

  // Quick preset shortcuts
  const presets = [
    { label: '€250 (Erasmus Market)', amount: 250, from: 'EUR', to: 'TRY' },
    { label: '€500 (Aylık Yurt & Yaşam)', amount: 500, from: 'EUR', to: 'TRY' },
    { label: '€1.200 (Dönemlik Hibe)', amount: 1200, from: 'EUR', to: 'TRY' },
    { label: '$1.500 (Freelance Ödeme)', amount: 1500, from: 'USD', to: 'TRY' },
  ];

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const rails = useMemo(() => {
    return calculateRails(amount, fromCurrency, toCurrency, rates);
  }, [amount, fromCurrency, toCurrency, rates]);

  const rotaRail = rails.find((r) => r.id === 'rota');
  const bankRail = rails.find((r) => r.id === 'bank');
  const netSavings =
    rotaRail && bankRail ? Math.max(0, rotaRail.amountReceived - bankRail.amountReceived) : 0;

  const targetSymbol = toCurrency === 'TRY' ? '₺' : toCurrency === 'EUR' ? '€' : '$';
  const sourceSymbol = fromCurrency === 'EUR' ? '€' : fromCurrency === 'USD' ? '$' : '₺';

  return (
    <section className="relative mx-auto max-w-6xl px-4 py-8 sm:py-12">
      {/* Title & Tagline */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300 mb-4">
          <Sparkles className="h-3.5 w-3.5 text-pink-400" />
          <span>Şeffaf Sınır Ötesi Para Transferi Yönlendiricisi</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.15]">
          Bankalara ve SWIFT kesintilerine{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
            öğrenci harçlığını kaptırma.
          </span>
        </h1>
        <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          Rota; bankaların döviz kurlarındaki gizli makasları, SWIFT muhabir kesintilerini ve acente
          komisyonlarını anlık hesaplar. En ucuz rotayı Solana blokzinciri üzerinde 400 milisaniyede işletir.
        </p>
      </div>

      {/* Calculator Input Box */}
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-zinc-900/70 p-5 sm:p-7 backdrop-blur-2xl shadow-2xl shadow-purple-950/20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Amount & From Currency */}
          <div className="md:col-span-5 bg-black/40 border border-white/10 rounded-2xl p-4 focus-within:border-purple-500/50 transition-all">
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Gönderilen Tutar ({fromCurrency})
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-zinc-500">{sourceSymbol}</span>
              <input
                type="number"
                min="10"
                max="100000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="w-full bg-transparent text-2xl sm:text-3xl font-mono font-bold text-white outline-none"
                placeholder="500"
              />
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value as Currency)}
                className="bg-zinc-800 text-white font-bold text-sm px-3 py-1.5 rounded-lg border border-white/10 outline-none cursor-pointer hover:bg-zinc-700"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="TRY">TRY (₺)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-2 flex justify-center">
            <button
              onClick={handleSwap}
              className="p-3 rounded-full border border-white/10 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 hover:scale-105 transition-all shadow-md active:scale-95"
              title="Para birimlerini değiştir"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          </div>

          {/* Target Currency */}
          <div className="md:col-span-5 bg-black/40 border border-white/10 rounded-2xl p-4">
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Alıcı Para Birimi
            </label>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500">Hedef:</span>
                <div className="text-xl sm:text-2xl font-bold text-zinc-200">
                  {toCurrency === 'TRY'
                    ? 'Türk Lirası (IBAN / Nakit)'
                    : toCurrency === 'EUR'
                    ? 'Euro Bölgesi (SEPA)'
                    : 'Amerikan Doları'}
                </div>
              </div>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value as Currency)}
                className="bg-zinc-800 text-white font-bold text-sm px-3 py-1.5 rounded-lg border border-white/10 outline-none cursor-pointer hover:bg-zinc-700"
              >
                <option value="TRY">TRY (₺)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Preset Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <Layers className="h-3 w-3" /> Hazır Senaryolar:
          </span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAmount(preset.amount);
                setFromCurrency(preset.from as Currency);
                setToCurrency(preset.to as Currency);
              }}
              className="text-xs rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300 hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-white transition-all"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Honest Summary Banner */}
      {netSavings > 0 && (
        <div className="mx-auto max-w-3xl mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Şeffaf Rota Avantajı
              </span>
            </div>
            <p className="text-sm sm:text-base text-zinc-200 mt-1">
              Geleneksel banka havalesi yerine Rota kullanarak alıcının eline tam{' '}
              <strong className="text-emerald-300 font-mono text-base sm:text-lg">
                +{netSavings.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} {targetSymbol}
              </strong>{' '}
              daha fazla para geçer ve <strong>3 iş günü</strong> beklemezsiniz.
            </p>
          </div>
          <button
            onClick={() => onInitiateRota(amount, fromCurrency, toCurrency)}
            className="shrink-0 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
          >
            Hemen Başlat →
          </button>
        </div>
      )}

      {/* Comparison Rails Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {rails.map((rail) => (
          <RailCard
            key={rail.id}
            rail={rail}
            bestAmount={rotaRail?.amountReceived || 0}
            onSelectRota={() => onInitiateRota(amount, fromCurrency, toCurrency)}
          />
        ))}
      </div>
    </section>
  );
};
