'use client';

import React from 'react';
import Link from 'next/link';
import { Code2 } from 'lucide-react';
import { NetworkStatus } from './NetworkStatus';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/70 backdrop-blur-xl print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="Rota" className="h-9 w-9 rounded-lg" />
          <div className="leading-tight">
            <span className="text-base font-bold tracking-tight text-white">Rota</span>
            <p className="text-[11px] text-zinc-500">Cross-border payment requests on Solana</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400">
          <Link href="/#request" className="hover:text-white transition-colors">Request money</Link>
          <Link href="/#compare" className="hover:text-white transition-colors">Compare costs</Link>
          <Link href="/#how" className="hover:text-white transition-colors">How it works</Link>
        </nav>

        <div className="flex items-center gap-3">
          <NetworkStatus />
          <a
            href="https://github.com/AltanCetinCelik/rota"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:border-white/25 transition-colors"
          >
            <Code2 className="h-3.5 w-3.5" />
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
};
