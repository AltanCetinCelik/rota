'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Check, Copy, ExternalLink, Zap, ShieldCheck, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  DEMO_BENEFICIARY_PUBKEY,
  buildSolanaPayUrl,
  generatePaymentReference,
  simulateDevnetPayment,
  SimulationResult,
} from '@/lib/solana';
import { Currency } from '@/lib/rates';

interface SolanaPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  estimatedReceived: number;
}

export const SolanaPayModal: React.FC<SolanaPayModalProps> = ({
  isOpen,
  onClose,
  amount,
  fromCurrency,
  toCurrency,
  estimatedReceived,
}) => {
  const [recipientPubKey, setRecipientPubKey] = useState<string>(DEMO_BENEFICIARY_PUBKEY);
  const [copied, setCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  if (!isOpen) return null;

  // Approximate USDC equivalent
  const usdcAmount = fromCurrency === 'USD' ? amount : fromCurrency === 'EUR' ? amount * 1.08 : amount / 35.85;

  const reference = generatePaymentReference();
  const solanaPayUrl = buildSolanaPayUrl({
    recipient: recipientPubKey,
    amountUSDC: usdcAmount,
    reference,
    label: 'Rota Cross-Border Remittance',
    message: `${amount} ${fromCurrency} Öğrenci Transferi`,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(solanaPayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationResult(null);

    const result = await simulateDevnetPayment(recipientPubKey, usdcAmount);

    setIsSimulating(false);
    setSimulationResult(result);

    // Fire confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#10b981'],
      });
    } catch {
      // Ignore if canvas-confetti environment issues
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-zinc-900 p-6 sm:p-8 shadow-2xl shadow-purple-950/40 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Solana PayFi Transfer Hattı</h2>
            <p className="text-xs text-zinc-400">Sıfır aracı banka · Anında 400ms takas</p>
          </div>
        </div>

        {/* Amount Summary */}
        <div className="my-5 rounded-2xl bg-black/50 border border-white/10 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400">Gönderilen</span>
            <div className="text-lg font-bold text-white">
              {amount} {fromCurrency}{' '}
              <span className="text-xs text-purple-400 font-mono">
                (~{usdcAmount.toFixed(2)} USDC)
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-400">Alıcıya Ulaşacak</span>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              {estimatedReceived.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}{' '}
              {toCurrency === 'TRY' ? '₺' : toCurrency}
            </div>
          </div>
        </div>

        {/* QR Code & Direct Link */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl border border-white/10 bg-zinc-950/60">
          <div className="p-3 bg-white rounded-2xl shadow-lg shrink-0">
            <QRCodeSVG value={solanaPayUrl} size={150} level="M" />
          </div>

          <div className="w-full space-y-3">
            <div>
              <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                Alıcı Solana Cüzdanı (Öğrenci / Yararlanıcı)
              </label>
              <input
                type="text"
                value={recipientPubKey}
                onChange={(e) => setRecipientPubKey(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-300 outline-none focus:border-purple-500/50"
              />
            </div>

            <div>
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10 hover:text-white transition-all"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Solana Pay Linki Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Solana Pay URL&apos;sini Kopyala</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Simulation / Devnet Trigger */}
        <div className="mt-5 space-y-3">
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/30 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Solana Devnet Üzerinde Onaylanıyor...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                <span>Canlı Solana Devnet Testini Başlat (~400ms)</span>
              </>
            )}
          </button>

          {/* Simulation Output Card */}
          {simulationResult && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 text-xs space-y-2 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  İşlem Solana Devnet Üzerinde Onaylandı!
                </span>
                <span className="font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {simulationResult.confirmationTimeMs} ms
                </span>
              </div>

              <div className="text-zinc-300 font-mono text-[11px] truncate">
                <span className="text-zinc-500">İşlem İmzası: </span>
                {simulationResult.signature}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-zinc-400">
                <span>
                  Ödenen Ağ Ücreti: <strong>{simulationResult.feeSOL} SOL</strong> (~$0.0007)
                </span>
                <a
                  href={simulationResult.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 underline"
                >
                  <span>Solana Explorer&apos;da İncele</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Legal & Non-Custodial Footer */}
        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
            <span>Kullanıcı kontrollü (Non-custodial) protokol</span>
          </span>
          <span>TL takası SPK lisanslı yerel borsalardan sağlanır</span>
        </div>
      </div>
    </div>
  );
};
