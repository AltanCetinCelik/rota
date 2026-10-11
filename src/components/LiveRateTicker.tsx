'use client';

import React from 'react';
import { ArrowDownRight, ArrowUpRight, TrendingUp, Clock, Zap } from 'lucide-react';
import { ExchangeRates } from '@/lib/rates';

interface LiveRateTickerProps {
  rates: ExchangeRates;
}

export const LiveRateTicker: React.FC<LiveRateTickerProps> = ({ rates }) => {
  return (
    <div className="w-full border-b border-white/5 bg-zinc-950/70 py-2 text-xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 overflow-x-auto no-scrollbar gap-6">
        <div className="flex items-center gap-6 whitespace-nowrap">
          {/* EUR/TRY */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-400">EUR/TRY Spot:</span>
            <span className="font-mono font-bold text-white">{rates.EUR_TRY.toFixed(2)} ₺</span>
            <span className="flex items-center text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
              <ArrowDownRight className="h-3 w-3 inline" /> Banka Makası: -%3.25
            </span>
          </div>

          {/* USD/TRY */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-400">USD/TRY Spot:</span>
            <span className="font-mono font-bold text-white">{rates.USD_TRY.toFixed(2)} ₺</span>
            <span className="flex items-center text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="h-3 w-3 inline" /> USDC/TRY: {rates.USDC_TRY.toFixed(2)} ₺
            </span>
          </div>

          {/* Solana Gas & Speed */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-400">Solana Ağ Maliyeti:</span>
            <span className="font-mono font-bold text-emerald-400">~$0.0006</span>
            <span className="text-zinc-500">(0.000005 SOL)</span>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Clock className="h-3.5 w-3.5 text-purple-400" />
            <span>SWIFT: 3-5 Gün</span>
            <span className="text-zinc-600">vs</span>
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">Rota: ~400ms</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-zinc-500 whitespace-nowrap">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          <span>BtcTurk & Binance TR Spot Senkronize</span>
        </div>
      </div>
    </div>
  );
};
