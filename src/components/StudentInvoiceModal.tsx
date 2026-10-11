'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Copy, Check, Share2, FileText, Download } from 'lucide-react';
import { buildSolanaPayUrl, DEMO_BENEFICIARY_PUBKEY, generatePaymentReference } from '@/lib/solana';

interface StudentInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentInvoiceModal: React.FC<StudentInvoiceModalProps> = ({ isOpen, onClose }) => {
  const [studentName, setStudentName] = useState('Altan Çetin Çelik');
  const [university, setUniversity] = useState('Pamukkale Üniversitesi (EEE)');
  const [payerName, setPayerName] = useState('Global Client / Erasmus Aile Desteği');
  const [purpose, setPurpose] = useState('Yazılım Geliştirme & Dönemlik Yaşam Masrafları');
  const [amountUSD, setAmountUSD] = useState(500);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const invoiceNumber = `ROTA-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleDateString('tr-TR');

  const reference = generatePaymentReference();
  const solanaPayUrl = buildSolanaPayUrl({
    recipient: DEMO_BENEFICIARY_PUBKEY,
    amountUSDC: amountUSD,
    reference,
    label: `Rota Talep: ${studentName}`,
    message: `${purpose} (${amountUSD} USDC)`,
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(solanaPayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-zinc-900 p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Öğrenci & Freelancer Ödeme Fişi</h2>
            <p className="text-xs text-zinc-400">
              Yurt dışı müşteriler ve aileler için doğrulanabilir Solana Pay makbuzu
            </p>
          </div>
        </div>

        {/* Interactive Editor Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 p-4 rounded-2xl bg-black/40 border border-white/10 text-xs">
          <div>
            <label className="text-zinc-400 block mb-1">Ad Soyad / Unvan:</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="text-zinc-400 block mb-1">Üniversite / Bölüm:</label>
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="text-zinc-400 block mb-1">Ödeyecek Kişi / Kurum:</label>
            <input
              type="text"
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="text-zinc-400 block mb-1">Talep Edilen Tutar (USDC / $):</label>
            <input
              type="number"
              value={amountUSD}
              onChange={(e) => setAmountUSD(Number(e.target.value) || 0)}
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold outline-none focus:border-purple-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-zinc-400 block mb-1">Açıklama / İş Kalemi:</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* The Printable Invoice Card Preview */}
        <div className="rounded-2xl border border-white/15 bg-white text-zinc-900 p-6 shadow-xl font-sans">
          <div className="flex justify-between items-start border-b border-zinc-200 pb-4">
            <div>
              <span className="text-xs font-bold text-purple-600 tracking-wider uppercase">
                ROTA PAYFI ÖDEME MAKBUZU
              </span>
              <h3 className="text-xl font-black text-zinc-900 mt-0.5">{studentName}</h3>
              <p className="text-xs text-zinc-500">{university}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-zinc-400">Fiş No: {invoiceNumber}</span>
              <div className="text-xs text-zinc-500 mt-1">Tarih: {dateStr}</div>
              <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">
                Solana Pay Doğrulamalı
              </span>
            </div>
          </div>

          <div className="my-5 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="sm:col-span-2 space-y-2">
              <div className="text-xs text-zinc-500">
                Alıcı: <strong className="text-zinc-800">{payerName}</strong>
              </div>
              <div className="text-xs text-zinc-500">
                Kalem: <strong className="text-zinc-800">{purpose}</strong>
              </div>
              <div className="text-xs text-zinc-500">
                Ödeme Ağı:{' '}
                <strong className="text-zinc-800 font-mono">
                  Solana (SPL-Token USDC / EURC)
                </strong>
              </div>
              <div className="text-xs text-zinc-500 pt-1">
                Ağ Ücreti:{' '}
                <strong className="text-emerald-700 font-mono">&lt; 0.001 $ (Anında 400ms)</strong>
              </div>
            </div>

            {/* QR Code in Invoice */}
            <div className="flex flex-col items-center justify-center p-3 border border-zinc-200 rounded-xl bg-zinc-50">
              <QRCodeSVG value={solanaPayUrl} size={110} level="M" />
              <span className="text-[10px] text-zinc-500 mt-1 font-mono">Solana Pay ile Tara</span>
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-4 flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-600">ÖDENECEK NET TUTAR:</span>
            <div className="text-2xl font-black font-mono text-zinc-900">
              {amountUSD.toFixed(2)} USDC{' '}
              <span className="text-xs font-normal text-zinc-500">
                (~{(amountUSD * 35.85).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺)
              </span>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-white/10 hover:text-white transition-all"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Link Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Solana Pay Linkini Kopyala</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:opacity-95 transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Yazdır / PDF Olarak Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
