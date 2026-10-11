'use client';

import React from 'react';
import { RailBreakdown } from '@/lib/rates';
import { CheckCircle2, Clock, Zap, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface RailCardProps {
  rail: RailBreakdown;
  bestAmount: number;
  onSelectRota?: () => void;
}

export const RailCard: React.FC<RailCardProps> = ({ rail, bestAmount, onSelectRota }) => {
  const diffFromBest = bestAmount - rail.amountReceived;
  const isRota = rail.id === 'rota';

  const getCurrencySymbol = (c: string) => {
    if (c === 'TRY') return '₺';
    if (c === 'EUR') return '€';
    if (c === 'USD') return '$';
    if (c === 'GBP') return '£';
    return c;
  };

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border transition-all duration-200 ${
        isRota
          ? 'border-purple-500/50 bg-gradient-to-b from-purple-950/40 via-zinc-900/60 to-black p-6 shadow-2xl shadow-purple-500/10 ring-1 ring-purple-500/30'
          : 'border-white/10 bg-zinc-900/40 p-5 hover:border-white/20'
      }`}
    >
      {/* Top Banner / Badge */}
      {rail.badge && (
        <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-0.5 text-xs font-bold text-white shadow-lg">
          <Zap className="h-3 w-3 fill-white" />
          <span>{rail.badge}</span>
        </div>
      )}

      <div>
        {/* Header: Name & Tagline */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {rail.name}
              {isRota && <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-mono">SOLANA</span>}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">{rail.tagline}</p>
          </div>

          {/* Speed Indicator */}
          <div
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              rail.speedCategory === 'instant'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : rail.speedCategory === 'hours'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
            }`}
          >
            {rail.speedCategory === 'instant' ? (
              <Zap className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            <span>{rail.speed}</span>
          </div>
        </div>

        {/* Amount Received (The Key Metric) */}
        <div className="mt-5 border-y border-white/5 py-4">
          <span className="text-xs font-medium text-zinc-400">Ele Geçecek Tutar:</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                isRota ? 'text-white' : 'text-zinc-200'
              }`}
            >
              {rail.amountReceived.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-sm font-bold text-zinc-400">
              {getCurrencySymbol(rail.targetCurrency)}
            </span>
          </div>

          {/* Difference tag */}
          {!isRota && diffFromBest > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-md">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>
                Rota&apos;ya göre <strong>-{diffFromBest.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} {getCurrencySymbol(rail.targetCurrency)}</strong> daha az teslim edilir
              </span>
            </div>
          )}

          {isRota && (
            <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Gereksiz muhabir banka ve gizli kur kaybı yok</span>
            </div>
          )}
        </div>

        {/* Detailed Breakdown */}
        <div className="mt-4 space-y-2 text-xs">
          <div className="flex justify-between text-zinc-400">
            <span>Uygulanan Efektif Kur:</span>
            <span className="font-mono text-zinc-300 font-medium">
              1 {rail.sourceCurrency} = {rail.effectiveRate.toFixed(3)} {rail.targetCurrency}
            </span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Sabit Masraf / Komisyon:</span>
            <span className="font-mono text-zinc-300">
              {rail.fixedFee > 0
                ? `${rail.fixedFee} ${rail.sourceCurrency}`
                : isRota
                ? '~$0.0006 (0 SOL)'
                : '0'}
            </span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Gizli Kur Farkı (Spread):</span>
            <span
              className={`font-mono font-medium ${
                rail.fxSpreadPercent > 2 ? 'text-rose-400' : isRota ? 'text-emerald-400' : 'text-zinc-300'
              }`}
            >
              %{rail.fxSpreadPercent.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Action / Disclaimer */}
      <div className="mt-6 pt-3 border-t border-white/5">
        {isRota ? (
          <button
            onClick={onSelectRota}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:opacity-95 hover:shadow-purple-500/40 active:scale-[0.99]"
          >
            <span>Rota ile Gönder / Talep Et</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <p className="text-[11px] text-zinc-500 leading-relaxed italic">
            {rail.disclaimer}
          </p>
        )}
      </div>
    </div>
  );
};
