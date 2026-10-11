'use client';

import React from 'react';
import { ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';

interface HeaderProps {
  onOpenInvoice: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenInvoice }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-purple-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-black">
              <span className="text-lg font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                R
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">ROTA</span>
              <span className="rounded-full border border-purple-500/40 bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                PayFi
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Cross-Border Remittance Router</p>
          </div>
        </div>

        {/* Live Network & Hackathon Badges */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <Zap className="h-3 w-3" />
            <span>Solana Devnet Live (400ms)</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
            <span>Non-Custodial</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenInvoice}
            className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 transition-all hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-white"
          >
            <span>Öğrenci Fatura Linki</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
