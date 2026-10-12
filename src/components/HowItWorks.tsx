'use client';

import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const STEPS = [
  {
    n: '01',
    title: 'Request',
    body: 'The student or freelancer creates a request: their wallet, the amount in USDC, and what it is for. Rota turns it into a link and a Solana Pay QR. No account, no backend.',
  },
  {
    n: '02',
    title: 'Pay',
    body: 'The payer scans the QR with any Solana Pay wallet or pays in the browser. Funds move wallet-to-wallet in USDC. A unique reference key and the invoice ID are written into the transaction.',
  },
  {
    n: '03',
    title: 'Verify',
    body: 'The request page finds the transaction on-chain by its reference, checks the recipient and amount from chain data, and turns into a receipt anyone can verify on Solana Explorer.',
  },
];

const LIVE = [
  'Solana Pay transfer requests (USDC + SOL) with reference keys',
  'In-browser payment via Phantom / Solflare / Backpack',
  'On-chain payment detection and amount verification',
  'Shareable, printable receipts with signature, slot, fee and memo',
  'Live mid-market FX rates and transparent cost comparison',
];

const NEXT = [
  'Mainnet launch with USDC + EURC',
  'TRY on/off-ramp integration with a licensed Turkish exchange',
  'Recurring allowances (monthly family → student payments)',
  'Request history and notifications for recipients',
  'Pilot with student clubs at Pamukkale University',
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how" className="mx-auto max-w-6xl px-4 py-16 border-t border-white/10 scroll-mt-16">
      <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">How it works</span>
      <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">Request. Pay. Verify.</h2>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
            <span className="font-mono text-xs text-purple-400">{s.n}</span>
            <h3 className="mt-2 text-base font-bold text-white">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h3 className="text-sm font-bold text-white">Working today (devnet)</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-zinc-300">
            {LIVE.map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h3 className="text-sm font-bold text-white">Next</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-zinc-400">
            {NEXT.map((item) => (
              <li key={item} className="flex gap-2">
                <Circle className="h-4 w-4 mt-0.5 shrink-0 text-zinc-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-white/10 bg-zinc-950/60 p-6 text-sm leading-relaxed text-zinc-400">
        <h3 className="text-sm font-bold text-white mb-2">Why this matters in Türkiye</h3>
        <p>
          PayPal has not operated in Türkiye since 2016. Students going abroad on Erasmus and young developers paid by
          foreign clients rely on bank wires that take days, close on weekends and lose a few percent to fees and FX
          margins. Rota uses Solana for what it is good at — near-instant, near-free settlement of dollar stablecoins —
          and adds the piece people actually need: a request they can send, and a receipt they can prove.
        </p>
      </div>
    </section>
  );
};
