'use client';

import React from 'react';
import { Clock, Zap } from 'lucide-react';
import { formatMoney, type RailBreakdown } from '@/lib/rates';

export const RailCard: React.FC<{ rail: RailBreakdown; best: number }> = ({ rail, best }) => {
  const isRota = rail.id === 'rota';
  const isBest = Math.abs(rail.amountReceived - best) < 1e-9;
  const behind = best - rail.amountReceived;
  const digits = rail.targetCurrency === 'TRY' ? 0 : 2;

  const speedColor =
    rail.speedCategory === 'instant'
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
      : rail.speedCategory === 'hours'
        ? 'text-amber-300 border-amber-500/30 bg-amber-500/10'
        : 'text-rose-300 border-rose-500/30 bg-rose-500/10';

  return (
    <div
      className={`flex flex-col rounded-2xl border p-5 ${
        isRota ? 'border-purple-500/50 bg-purple-950/20' : 'border-white/10 bg-zinc-950/60'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white">{rail.name}</h3>
          <p className="text-[11px] text-zinc-500">{rail.tagline}</p>
        </div>
        {isBest && (
          <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
            MOST ARRIVES
          </span>
        )}
      </div>

      <div className="mt-4">
        <span className="text-[11px] text-zinc-500">Recipient gets (est.)</span>
        <div className="text-2xl font-black font-mono text-white">
          {formatMoney(rail.amountReceived, rail.targetCurrency, digits)}
        </div>
        <div className="text-[11px] text-zinc-500 mt-0.5">
          Cost ≈ {formatMoney(rail.totalCost, rail.targetCurrency, digits)} ({rail.costPercent.toFixed(1)}%)
          {!isBest && behind > 0 && (
            <span className="text-rose-400"> · {formatMoney(behind, rail.targetCurrency, digits)} less</span>
          )}
        </div>
      </div>

      <div className={`mt-4 inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${speedColor}`}>
        {rail.speedCategory === 'instant' ? <Zap className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
        {rail.speed}
      </div>

      <dl className="mt-4 space-y-1 text-[11px]">
        <div className="flex justify-between text-zinc-500">
          <dt>Flat fees</dt>
          <dd className="font-mono text-zinc-300">≈ ${rail.fixedFeeUSD < 0.01 ? '0.001' : rail.fixedFeeUSD.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between text-zinc-500">
          <dt>FX / exchange margin</dt>
          <dd className="font-mono text-zinc-300">{rail.fxMarkupPercent.toFixed(2)}%</dd>
        </div>
        <div className="flex justify-between text-zinc-500">
          <dt>Availability</dt>
          <dd className="text-zinc-300 text-right">{rail.availability}</dd>
        </div>
      </dl>

      <p className="mt-4 pt-3 border-t border-white/5 text-[11px] leading-relaxed text-zinc-500">{rail.notes}</p>
    </div>
  );
};
