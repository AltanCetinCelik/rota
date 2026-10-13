'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Wallet, AlertCircle } from 'lucide-react';
import {
  encodeRequest,
  isValidAddress,
  newInvoiceId,
  newReference,
  type PayToken,
  type PaymentRequest,
} from '@/lib/solana';
import { useInjectedWallet } from '@/lib/wallet';
import { type ExchangeRates } from '@/lib/rates';

const PRESETS: { label: string; amount: number; purpose: string }[] = [
  { label: 'Monthly allowance', amount: 400, purpose: 'Monthly living allowance' },
  { label: 'Erasmus rent', amount: 550, purpose: 'Erasmus dorm rent' },
  { label: 'Freelance invoice', amount: 1200, purpose: 'Frontend development, milestone 1' },
];

interface Props {
  rates: ExchangeRates;
}

export const RequestCreator: React.FC<Props> = ({ rates }) => {
  const router = useRouter();
  const wallet = useInjectedWallet();

  const [recipient, setRecipient] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [payerName, setPayerName] = useState('');
  const [purpose, setPurpose] = useState('Monthly living allowance');
  const [amount, setAmount] = useState<number>(400);
  const [token, setToken] = useState<PayToken>('USDC');
  const [touched, setTouched] = useState(false);

  const addressOk = isValidAddress(recipient);
  const amountOk = amount > 0 && amount <= 1_000_000;
  const canSubmit = addressOk && amountOk && purpose.trim().length > 0;

  const tryEquivalent = useMemo(() => {
    if (token !== 'USDC') return null;
    return amount * rates.perUSD.TRY;
  }, [amount, token, rates]);

  const useMyWallet = async () => {
    const pk = await wallet.connect();
    if (pk) setRecipient(pk.toBase58());
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    const req: PaymentRequest = {
      v: 1,
      id: newInvoiceId(),
      recipient: recipient.trim(),
      recipientName: recipientName.trim(),
      payerName: payerName.trim(),
      purpose: purpose.trim(),
      amount,
      token,
      reference: newReference(),
      createdAt: Date.now(),
    };
    router.push(`/pay?r=${encodeRequest(req)}`);
  };

  const input =
    'w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-purple-500/60 transition-colors';

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5 sm:p-6 shadow-2xl shadow-purple-950/20"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-white">Create a payment request</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Get a link + QR anyone can pay from any Solana wallet.</p>
        </div>
        <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
          DEVNET
        </span>
      </div>

      {/* Recipient wallet */}
      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Your Solana wallet (receives the money)</label>
      <div className="flex gap-2">
        <input
          className={`${input} font-mono text-xs`}
          placeholder="e.g. 7xKX…your address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          spellCheck={false}
        />
        <button
          type="button"
          onClick={useMyWallet}
          disabled={wallet.connecting}
          className="shrink-0 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-medium text-zinc-200 hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <Wallet className="h-3.5 w-3.5" />
          {wallet.connecting ? 'Connecting…' : wallet.hasWallet ? `Use ${wallet.walletName}` : 'Get a wallet'}
        </button>
      </div>
      <div className="mt-1 flex items-center justify-between text-[11px]">
        {touched && !addressOk ? (
          <p className="flex items-center gap-1 text-rose-400">
            <AlertCircle className="h-3 w-3" /> Enter a valid Solana address.
          </p>
        ) : (
          <span className="text-zinc-500">Base58 Solana public key</span>
        )}
        <button
          type="button"
          onClick={() => setRecipient('8F47n1E8uV62c7R8e9V6fK7N4x4L3y2k5b1A3C4D5E6F')}
          className="text-purple-400 hover:text-purple-300 underline font-mono"
        >
          Fill demo address
        </button>
      </div>

      {/* Amount + token */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Amount</label>
          <input
            type="number"
            min={0}
            step="any"
            className={`${input} font-mono text-lg font-bold`}
            value={Number.isFinite(amount) ? amount : ''}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Token</label>
          <div className="grid grid-cols-2 rounded-lg border border-white/10 bg-black/50 p-1 h-[46px]">
            {(['USDC', 'SOL'] as PayToken[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setToken(t)}
                className={`rounded-md text-xs font-semibold transition-colors ${
                  token === t ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-1.5 text-[11px] text-zinc-500">
        {tryEquivalent !== null
          ? `≈ ₺${tryEquivalent.toLocaleString('en-US', { maximumFractionDigits: 0 })} at the ${rates.live ? 'live' : 'last known'} mid-market rate`
          : 'SOL option is for testing with free devnet SOL.'}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setAmount(p.amount);
              setPurpose(p.purpose);
              setToken('USDC');
            }}
            className="rounded-md border border-white/10 px-2 py-1 text-[11px] text-zinc-400 hover:text-white hover:border-white/25 transition-colors"
          >
            {p.label} · {p.amount} USDC
          </button>
        ))}
      </div>

      {/* Details */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Your name (optional)</label>
          <input className={input} placeholder="Ayşe Yılmaz" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Who pays (optional)</label>
          <input className={input} placeholder="Mom / Client GmbH" value={payerName} onChange={(e) => setPayerName(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">What is it for</label>
          <input className={input} value={purpose} maxLength={80} onChange={(e) => setPurpose(e.target.value)} />
        </div>
      </div>

      <button
        type="submit"
        className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-black hover:bg-zinc-200 transition-colors disabled:opacity-40"
      >
        Create request link
        <ArrowRight className="h-4 w-4" />
      </button>
      <p className="mt-2 text-center text-[11px] text-zinc-600">
        Non-custodial: funds go straight from the payer&apos;s wallet to yours. Rota never holds money.
      </p>
    </form>
  );
};
