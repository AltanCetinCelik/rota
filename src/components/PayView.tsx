'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Printer,
  ShieldCheck,
  Wallet,
  AlertTriangle,
  Radar,
  Info,
} from 'lucide-react';
import {
  buildSolanaPayUrl,
  buildTransferTransaction,
  explorerAddressUrl,
  explorerTxUrl,
  findPaymentSignature,
  getConnection,
  shortAddress,
  verifyPayment,
  PaymentMismatchError,
  type PaymentRequest,
  type VerifiedPayment,
} from '@/lib/solana';
import { useInjectedWallet } from '@/lib/wallet';
import { useRates } from '@/lib/useRates';

type Phase =
  | { kind: 'watching' }
  | { kind: 'signing' }
  | { kind: 'sending' }
  | { kind: 'confirming'; signature: string }
  | { kind: 'verifying'; signature: string }
  | { kind: 'paid'; payment: VerifiedPayment; confirmMs: number | null }
  | { kind: 'error'; message: string };

function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/User rejected|rejected the request|cancel/i.test(msg)) return 'You cancelled the transaction in your wallet.';
  if (/insufficient lamports|insufficient funds|0x1\b|Attempt to debit an account but found no record/i.test(msg))
    return 'Not enough devnet funds in this wallet. Get free devnet SOL at faucet.solana.com (and devnet USDC at faucet.circle.com).';
  if (/Blockhash not found|block height exceeded/i.test(msg)) return 'The transaction expired before it landed. Please try again.';
  return msg.length > 220 ? `${msg.slice(0, 220)}…` : msg;
}

export const PayView: React.FC<{ req: PaymentRequest }> = ({ req }) => {
  const wallet = useInjectedWallet();
  const { rates } = useRates();
  const [phase, setPhase] = useState<Phase>({ kind: 'watching' });
  const [copied, setCopied] = useState<'link' | 'pay' | null>(null);
  const [checks, setChecks] = useState(0);
  const paidRef = useRef(false);

  const solanaPayUrl = useMemo(() => buildSolanaPayUrl(req), [req]);

  const celebrate = () => {
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.65 }, colors: ['#a78bfa', '#34d399', '#ffffff'] });
    } catch {
      /* non-critical */
    }
  };

  const finalize = useCallback(
    async (signature: string, confirmMs: number | null) => {
      setPhase({ kind: 'verifying', signature });
      try {
        const payment = await verifyPayment(getConnection(), signature, req);
        paidRef.current = true;
        setPhase({ kind: 'paid', payment, confirmMs });
        celebrate();
      } catch (err) {
        if (err instanceof PaymentMismatchError) {
          setPhase({ kind: 'error', message: err.message });
        } else {
          setPhase({ kind: 'error', message: friendlyError(err) });
        }
      }
    },
    [req]
  );

  /* ---------------- Watch the chain for a payment carrying our reference ---------------- */
  useEffect(() => {
    if (phase.kind !== 'watching') return;
    let cancelled = false;
    const poll = async () => {
      try {
        const sig = await findPaymentSignature(getConnection(), req.reference);
        if (cancelled || paidRef.current) return;
        setChecks((c) => c + 1);
        if (sig) {
          cancelled = true;
          await finalize(sig, null);
        }
      } catch {
        /* transient RPC error: keep polling */
      }
    };
    poll();
    const id = setInterval(poll, 2500);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [phase.kind, req.reference, finalize]);

  /* ---------------- Pay directly from a browser wallet ---------------- */
  const payWithWallet = async () => {
    try {
      const payer = wallet.publicKey ?? (await wallet.connect());
      if (!payer) return;
      setPhase({ kind: 'signing' });
      const connection = getConnection();
      const tx = await buildTransferTransaction(connection, payer, req);
      const signed = await wallet.signTransaction(tx);

      setPhase({ kind: 'sending' });
      const t0 = performance.now();
      const signature = await connection.sendRawTransaction(signed.serialize(), { maxRetries: 3 });
      setPhase({ kind: 'confirming', signature });
      const res = await connection.confirmTransaction(
        { signature, blockhash: tx.recentBlockhash!, lastValidBlockHeight: tx.lastValidBlockHeight! },
        'confirmed'
      );
      const confirmMs = Math.round(performance.now() - t0);
      if (res.value.err) throw new Error('Transaction failed on-chain.');
      await finalize(signature, confirmMs);
    } catch (err) {
      setPhase({ kind: 'error', message: friendlyError(err) });
    }
  };

  const copy = (text: string, which: 'link' | 'pay') => {
    navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1800);
  };

  const fiat = req.token === 'USDC' ? req.amount * rates.perUSD.TRY : null;
  const eur = req.token === 'USDC' ? req.amount * rates.perUSD.EUR : null;
  const created = new Date(req.createdAt);
  const busy = phase.kind === 'signing' || phase.kind === 'sending' || phase.kind === 'confirming' || phase.kind === 'verifying';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ------------------------------ Invoice ------------------------------ */}
        <section className="lg:col-span-3 rounded-2xl bg-white text-zinc-900 p-6 sm:p-8 shadow-2xl print:shadow-none print:col-span-5">
          <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icon.png" alt="" className="h-6 w-6 rounded" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Payment request</span>
              </div>
              <h1 className="mt-3 text-2xl font-black tracking-tight">{req.recipientName || 'Rota payment request'}</h1>
              <a
                href={explorerAddressUrl(req.recipient)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-zinc-500 hover:text-purple-700 break-all"
              >
                {req.recipient}
              </a>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono text-xs text-zinc-500">{req.id}</div>
              <div className="text-xs text-zinc-500 mt-1">
                {created.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <div
                className={`mt-2 inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                  phase.kind === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {phase.kind === 'paid' ? 'PAID · VERIFIED ON-CHAIN' : 'AWAITING PAYMENT'}
              </div>
            </div>
          </div>

          <dl className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-zinc-500">For</dt>
              <dd className="font-semibold">{req.purpose}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Payer</dt>
              <dd className="font-semibold">{req.payerName || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Network</dt>
              <dd className="font-semibold">Solana devnet · {req.token === 'USDC' ? 'USDC (SPL)' : 'SOL'}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Payment reference</dt>
              <dd className="font-mono text-xs break-all">{req.reference}</dd>
            </div>
          </dl>

          <div className="flex items-end justify-between border-t border-zinc-200 pt-5">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Amount due</span>
            <div className="text-right">
              <div className="text-3xl font-black font-mono">
                {req.amount.toLocaleString('en-US', { maximumFractionDigits: 6 })} {req.token}
              </div>
              {fiat !== null && eur !== null && (
                <div className="text-xs text-zinc-500 mt-0.5">
                  ≈ ₺{fiat.toLocaleString('en-US', { maximumFractionDigits: 0 })} · €
                  {eur.toLocaleString('en-US', { maximumFractionDigits: 2 })} (mid-market)
                </div>
              )}
            </div>
          </div>

          {phase.kind === 'paid' && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <ShieldCheck className="h-4 w-4" /> Receipt — verified from Solana devnet data
              </div>
              <Row k="Received" v={`${phase.payment.amountReceived} ${phase.payment.token}`} />
              <Row k="Paid by" v={phase.payment.payer} mono />
              <Row k="Signature" v={phase.payment.signature} mono />
              <Row k="Slot" v={phase.payment.slot.toLocaleString('en-US')} mono />
              {phase.payment.blockTime && (
                <Row k="Block time" v={new Date(phase.payment.blockTime * 1000).toLocaleString('en-GB')} />
              )}
              <Row k="Network fee" v={`${(phase.payment.feeLamports / 1e9).toFixed(6)} SOL`} mono />
              {phase.payment.memo && <Row k="On-chain memo" v={phase.payment.memo} mono />}
              <a
                href={explorerTxUrl(phase.payment.signature)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 pt-1 font-semibold text-emerald-800 underline print:no-underline"
              >
                View on Solana Explorer <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          <p className="mt-6 text-[10px] text-zinc-400 print:block">
            Generated by Rota (rota-seven-eta.vercel.app). Payment status is derived from public Solana data using the
            reference above — anyone can independently verify it.
          </p>
        </section>

        {/* ------------------------------ Pay panel ------------------------------ */}
        <aside className="lg:col-span-2 space-y-4 print:hidden">
          {phase.kind === 'paid' ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Check className="h-5 w-5" /> Payment received
              </div>
              <p className="mt-2 text-sm text-zinc-300">
                {phase.payment.amountReceived} {phase.payment.token} landed in the recipient&apos;s wallet.
              </p>
              {phase.confirmMs !== null && (
                <p className="mt-3 text-xs text-zinc-400">
                  Broadcast → confirmed in{' '}
                  <span className="font-mono text-white">{(phase.confirmMs / 1000).toFixed(2)}s</span> (measured in your
                  browser).
                </p>
              )}
              <p className="mt-1 text-xs text-zinc-400">
                Network fee: <span className="font-mono text-white">{(phase.payment.feeLamports / 1e9).toFixed(6)} SOL</span>
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <a
                  href={explorerTxUrl(phase.payment.signature)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-white py-2.5 text-xs font-bold text-black hover:bg-zinc-200"
                >
                  Explorer <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-white/15 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-white/5"
                >
                  <Printer className="h-3.5 w-3.5" /> Save receipt
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6">
              <h2 className="text-sm font-bold text-white">Pay this request</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Scan with a Solana Pay wallet (set to devnet) or pay in the browser.</p>

              <div className="mt-4 flex justify-center">
                <div className="rounded-xl bg-white p-3">
                  <QRCodeSVG value={solanaPayUrl} size={196} level="M" />
                </div>
              </div>

              <button
                onClick={payWithWallet}
                disabled={busy}
                className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-black hover:bg-zinc-200 transition-colors disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                {phase.kind === 'signing' && 'Approve in your wallet…'}
                {phase.kind === 'sending' && 'Broadcasting to devnet…'}
                {phase.kind === 'confirming' && 'Confirming on-chain…'}
                {phase.kind === 'verifying' && 'Verifying payment…'}
                {!busy &&
                  (wallet.publicKey
                    ? `Pay ${req.amount} ${req.token} with ${wallet.walletName}`
                    : wallet.hasWallet
                      ? `Connect ${wallet.walletName} & pay`
                      : 'Install a Solana wallet')}
              </button>

              {(phase.kind === 'confirming' || phase.kind === 'verifying') && (
                <a
                  href={explorerTxUrl(phase.signature)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block text-center font-mono text-[11px] text-zinc-500 hover:text-zinc-300"
                >
                  tx {shortAddress(phase.signature, 8)} ↗
                </a>
              )}

              {phase.kind === 'error' && (
                <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300">
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{phase.message}</span>
                  </div>
                  <button onClick={() => setPhase({ kind: 'watching' })} className="mt-2 underline text-rose-200">
                    Try again
                  </button>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => copy(typeof window !== 'undefined' ? window.location.href : '', 'link')}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-[11px] font-medium text-zinc-300 hover:bg-white/5"
                >
                  {copied === 'link' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  Share link
                </button>
                <button
                  onClick={() => copy(solanaPayUrl, 'pay')}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-[11px] font-medium text-zinc-300 hover:bg-white/5"
                >
                  {copied === 'pay' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  Solana Pay URI
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-[11px] text-zinc-500">
                <Radar className={`h-3.5 w-3.5 ${phase.kind === 'watching' ? 'text-emerald-400 animate-pulse' : ''}`} />
                <span>
                  Watching devnet for reference <span className="font-mono text-zinc-400">{shortAddress(req.reference)}</span>
                  {checks > 0 && <span className="text-zinc-600"> · {checks} checks</span>}
                </span>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-300 mb-2">
              <Info className="h-3.5 w-3.5" /> Testing on devnet
            </div>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Phantom → Settings → Developer Settings → <b>Testnet mode</b> (Solana Devnet).
              </li>
              <li>
                Free devnet SOL:{' '}
                <a className="underline hover:text-white" href="https://faucet.solana.com" target="_blank" rel="noopener noreferrer">
                  faucet.solana.com
                </a>
              </li>
              <li>
                Devnet USDC:{' '}
                <a className="underline hover:text-white" href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer">
                  faucet.circle.com
                </a>{' '}
                (choose Solana Devnet)
              </li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
};

const Row: React.FC<{ k: string; v: string; mono?: boolean }> = ({ k, v, mono }) => (
  <div className="flex gap-3">
    <span className="w-24 shrink-0 text-emerald-900/60">{k}</span>
    <span className={`text-emerald-950 break-all ${mono ? 'font-mono' : ''}`}>{v}</span>
  </div>
);
