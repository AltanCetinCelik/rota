'use client';

import React from 'react';
import { ArrowRight, Shield, Zap, Globe, Layers, CheckCircle2, Lock, Cpu } from 'lucide-react';

export const ArchitectureSection: React.FC = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 border-t border-white/10">
      {/* Section Title */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
          Protokol Mimarisi & Çalışma Mantığı
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-white mt-4 tracking-tight">
          Geleneksel bankacılık neden yavaş ve pahalı?{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Rota bunu nasıl çözüyor?
          </span>
        </h2>
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
          Arf&apos;ın finans kurumları için geliştirdiği &ldquo;alacak destekli gerçek zamanlı likidite ve stablecoin takası&rdquo; vizyonunu,
          bireysel üniversite öğrencileri ve serbest çalışanlar için erişilebilir hale getiriyoruz.
        </p>
      </div>

      {/* 2-Column Comparison: SWIFT vs ROTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {/* SWIFT Card */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-3">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              GELENEKSEL SWIFT HAVALESİ (1970 Mimarisi)
            </div>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Her sınır ötesi havale, gönderen bankadan alıcı bankaya doğrudan gitmez. Aradaki 2-3 farklı muhabir (correspondent) banka üzerinden dolaşır:
            </p>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-zinc-300">1. Yerel Gönderici Bankası</span>
                <span className="text-rose-400 font-bold">$25-35 Sabit SWIFT Masrafı</span>
              </div>
              <div className="text-center text-zinc-600">↓</div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-zinc-300">2. Global Muhabir Banka (Aracı)</span>
                <span className="text-rose-400 font-bold">$15-20 Kesinti + 48 Saat Gecikme</span>
              </div>
              <div className="text-center text-zinc-600">↓</div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-zinc-300">3. Hedef Türk Bankası</span>
                <span className="text-rose-400 font-bold">-%3.25 Gizli Döviz Alım Makası</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-rose-500/20 text-[11px] text-zinc-400">
            <strong>Sonuç:</strong> Ortalama <strong>3-5 iş günü</strong> bekleme ve <strong>40-60 $</strong> arası gizli kayıp.
          </div>
        </div>

        {/* ROTA Solana Card */}
        <div className="rounded-2xl border border-purple-500/40 bg-purple-950/15 p-6 flex flex-col justify-between shadow-xl shadow-purple-950/30">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-3">
              <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse"></span>
              ROTA PAYFI SOLANA HATTI (Doğrudan Eşten Eşe)
            </div>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Aracı muhabir bankalar tamamen devre dışı bırakılır. Fonlar Solana blokzincirinde SPL USDC/EURC stablecoin olarak doğrudan cüzdana akar:
            </p>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-zinc-300">1. Gönderici (AB / ABD)</span>
                <span className="text-emerald-400 font-bold">1:1 USDC Çevrimi</span>
              </div>
              <div className="text-center text-purple-400">↓ (Solana Devnet / Mainnet)</div>
              <div className="p-3 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-between">
                <span className="text-white font-bold">2. 400ms Solana Blok Kesinliği</span>
                <span className="text-emerald-400 font-bold">0.000005 SOL (~$0.0006 Ağ Ücreti)</span>
              </div>
              <div className="text-center text-purple-400">↓ (Anında IBAN)</div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-zinc-300">3. Öğrenci Cüzdanı / TR IBAN</span>
                <span className="text-emerald-400 font-bold">0.15% Minimum Spread İle Net Nakit</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-purple-500/30 text-[11px] text-zinc-300">
            <strong>Sonuç:</strong> <strong>~400 milisaniye</strong> kesinlik, sıfır sürpriz kesinti, tam tutar teslimi.
          </div>
        </div>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 w-fit mb-4">
            <Cpu className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Canlı Arbitraj Motoru</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            ApexQuant kantitatif altyapımızdan türetilen motor; TCMB, BtcTurk, Binance TR ve global interbank kurlarını canlı dinler ve en avantajlı çıkış rotasını anlık hesaplar.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
          <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 w-fit mb-4">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Solana Pay Standardı</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Resmi Solana Pay URL ve QR kod spesifikasyonu ile uyumlu. Tek tıkla Phantom, Solflare ve mobil cüzdanlarla doğrudan transfer yapılabilir.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit mb-4">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Mevzuat Uyumu & Güvenlik</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Protokol tamamen emanetsizdir (non-custodial); fonlar hiçbir merkezi havuzda toplanmaz. TL çıkışları SPK ve MASAK lisanslı yerel borsalar üzerinden yürütülür.
          </p>
        </div>
      </div>
    </section>
  );
};
