'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RequestCreator } from '@/components/RequestCreator';
import { ComparisonCalculator } from '@/components/ComparisonCalculator';
import { HowItWorks } from '@/components/HowItWorks';
import { useRates } from '@/lib/useRates';

export default function Home() {
  const { rates, loading } = useRates();

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col antialiased selection:bg-purple-600 selection:text-white">
      <Header />

      <main className="flex-1">
        {/* Hero + product */}
        <section id="request" className="mx-auto max-w-6xl px-4 py-12 sm:py-16 scroll-mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block rounded-full border border-white/10 px-3 py-1 text-[11px] text-zinc-400">
                Solana Pay · USDC · Built in Türkiye
              </span>
              <h1 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-white leading-[1.08]">
                Get paid from abroad
                <br />
                <span className="text-purple-400">in seconds, not days.</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-zinc-400">
                Rota lets students and young freelancers send a payment request to family or clients anywhere. They pay
                in USDC from any Solana wallet; you get the money in seconds and a receipt anyone can verify on-chain.
              </p>

              <ul className="mt-8 space-y-3 text-sm text-zinc-300">
                <li className="flex gap-3">
                  <span className="font-mono text-purple-400">→</span>
                  No bank cut-off times, works on weekends
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-purple-400">→</span>
                  Network fee is a fraction of a cent
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-purple-400">→</span>
                  Non-custodial: money never touches Rota
                </li>
              </ul>
            </div>

            <RequestCreator rates={rates} />
          </div>
        </section>

        <ComparisonCalculator rates={rates} ratesLoading={loading} />
        <HowItWorks />
      </main>

      <Footer />
    </div>
  );
}
