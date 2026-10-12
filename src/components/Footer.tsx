'use client';

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 py-10 text-xs text-zinc-500 print:hidden">
      <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-md space-y-1.5">
          <div className="text-sm font-bold text-white">Rota</div>
          <p>
            Built by Altan Çetin Çelik (Electrical &amp; Electronics Engineering, Pamukkale University) for the Colosseum
            Crypto World&apos;s Fair — Superteam Türkiye × Arf University Track.
          </p>
          <p className="text-zinc-600">
            Runs on Solana devnet. Rota is non-custodial software, not a financial institution; it never holds funds.
          </p>
        </div>
        <div className="flex flex-wrap gap-5 text-zinc-400">
          <a href="https://github.com/AltanCetinCelik/rota" target="_blank" rel="noopener noreferrer" className="hover:text-white">
            GitHub
          </a>
          <a href="https://docs.solanapay.com/spec" target="_blank" rel="noopener noreferrer" className="hover:text-white">
            Solana Pay spec
          </a>
          <a href="https://altancelik.dev" target="_blank" rel="noopener noreferrer" className="hover:text-white">
            altancelik.dev
          </a>
        </div>
      </div>
    </footer>
  );
};
