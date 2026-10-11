'use client';

import React from 'react';
import { ShieldCheck, Heart, ExternalLink, Code2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-black/80 py-12 text-xs text-zinc-500">
      <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold text-sm">
            <span>ROTA PayFi Protocol</span>
            <span className="text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
              v1.0.0-devnet
            </span>
          </div>
          <p className="max-w-md text-zinc-400">
            Pamukkale Üniversitesi Elektrik-Elektronik Mühendisliği öğrencisi Altan Çetin Çelik tarafından
            <strong> Crypto World&apos;s Fair 2026 — Superteam Türkiye x Arf University Track</strong> için geliştirilmiştir.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-400">
          <a
            href="https://github.com/AltanCetinCelik/rota"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Code2 className="h-4 w-4" />
            <span>GitHub Repository</span>
          </a>

          <a
            href="https://superteam.fun/earn/listing/arf-superteam-turkiye-university-track"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-purple-400 transition-colors"
          >
            <span>Arf x Superteam Listing</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <a
            href="https://altancelik.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            altancelik.dev
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-600">
        <p>
          Yasal Uyarı: Rota finansal bir kuruluş veya emanetçi (custodian) değildir. Açık kaynak kodlu yönlendirici arayüzdür.
        </p>
        <p className="flex items-center gap-1">
          Built with Solana Devnet & Next.js
        </p>
      </div>
    </footer>
  );
};
