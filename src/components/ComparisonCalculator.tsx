'use client';

import React, { useMemo, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import {
  CURRENCIES,
  CURRENCY_SYMBOL,
  calculateRails,
  formatMoney,
  midMarketRate,
  type Currency,
  type ExchangeRates,
} from '@/lib/rates';
import { RailCard } from './RailCard';

const PRESETS: { label: string; amount: number; from: Currency; to: Currency }[] = [
  { label: '€250 pocket money', amount: 250, from: 'EUR', to: 'TRY' },
  { label: '€550 Erasmus rent', amount: 550, from: 'EUR', to: 'TRY' },
  { label: '$1,200 freelance invoice', amount: 1200, from: 'USD', to: 'TRY' },
  { label: '₺20,000 family → student abroad', amount: 20000, from: 'TRY', to: 'EUR' },
];

interface Props {
  rates: ExchangeRates;
  ratesLoading: boolean;
}

export const ComparisonCalculator: React.FC<Props> = ({ rates, ratesLoading }) => {
  const [amount, setAmount] = useState(550);
  const [from, setFrom] = useState<Currency>('EUR');
  const [to, setTo] = useState<Currency>('TRY');

  const rails = useMemo(() => calculateRails(amount, from, to, rates), [amount, from, to, rates]);
  const best = Math.max(...rails.map((r) => r.amountReceived));
  const rota = rails.find((r) => r.id === 'rota')!;
  const bank = rails.find((r) => r.id === 'bank')!;
  const saving = rota.amountReceived - bank.amountReceived;
  const mid = midMarketRate(rates, from, to);

  const select =
    'bg-zinc-800 text-white font-semibold text-sm px-2.5 py-1.5 rounded-lg border border-white/10 outline-none cursor-pointer';

  return (
    <section id="compare" className="mx-auto max-w-6xl px-4 py-16 border-t border-white/10 scroll-mt-16">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Compare costs</span>
        <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">
          What actually arrives, by rail.
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Live mid-market rates. Provider costs are estimates from typical public fee schedules — real quotes vary by
          provider and day. Rota&apos;s figure includes estimated exchange costs to get into and out of USDC.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-950/80 p-5">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs text-zinc-500 mb-1">They send</label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-3 py-2">
              <span className="text-lg font-bold text-zinc-500">{CURRENCY_SYMBOL[from]}</span>
              <input
                type="number"
                min={0}
                value={Number.isFinite(amount) ? amount : ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-transparent text-2xl font-mono font-bold text-white outline-none"
              />
              <select value={from} onChange={(e) => setFrom(e.target.value as Currency)} className={select}>
                {CURRENCIES.filter((c) => c !== to).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={() => {
              setFrom(to);
              setTo(from);
            }}
            className="self-center md:mb-2 p-2.5 rounded-full border border-white/10 bg-zinc-900 text-zinc-300 hover:text-white"
            aria-label="Swap currencies"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          <div className="md:w-56">
            <label className="block text-xs text-zinc-500 mb-1">Recipient gets</label>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/50 px-3 py-2 h-[54px]">
              <span className="text-sm text-zinc-400">Currency</span>
              <select value={to} onChange={(e) => setTo(e.target.value as Currency)} className={select}>
                {CURRENCIES.filter((c) => c !== from).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setAmount(p.amount);
                setFrom(p.from);
                setTo(p.to);
              }}
              className="rounded-md border border-white/10 px-2 py-1 text-[11px] text-zinc-400 hover:text-white hover:border-white/25"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3 text-[11px] text-zinc-500">
          <span>
            Mid-market: 1 {from} = <span className="font-mono text-zinc-300">{mid.toFixed(4)}</span> {to}
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${rates.live ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {ratesLoading
              ? 'Loading live rates…'
              : rates.live
                ? `Live · ${rates.source} · updated ${new Date(rates.updatedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                : `Live rates unavailable · using ${rates.source}`}
          </span>
        </div>
      </div>

      {saving > 0 && (
        <p className="mt-6 text-sm text-zinc-300">
          On this transfer, the recipient keeps about{' '}
          <span className="font-mono font-bold text-emerald-400">{formatMoney(saving, to, to === 'TRY' ? 0 : 2)}</span> more
          than with a typical bank wire — and it settles on a weekend too.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {rails.map((rail) => (
          <RailCard key={rail.id} rail={rail} best={best} />
        ))}
      </div>
    </section>
  );
};
