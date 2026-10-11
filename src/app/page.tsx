'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { LiveRateTicker } from '@/components/LiveRateTicker';
import { ComparisonCalculator } from '@/components/ComparisonCalculator';
import { ArchitectureSection } from '@/components/ArchitectureSection';
import { Footer } from '@/components/Footer';
import { SolanaPayModal } from '@/components/SolanaPayModal';
import { StudentInvoiceModal } from '@/components/StudentInvoiceModal';
import { DEFAULT_RATES, Currency, calculateRails } from '@/lib/rates';

export default function Home() {
  const [rates] = useState(DEFAULT_RATES);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Active transaction details for modal
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [selectedFrom, setSelectedFrom] = useState<Currency>('EUR');
  const [selectedTo, setSelectedTo] = useState<Currency>('TRY');
  const [selectedReceived, setSelectedReceived] = useState(19295);

  const handleInitiateRota = (amount: number, from: Currency, to: Currency) => {
    setSelectedAmount(amount);
    setSelectedFrom(from);
    setSelectedTo(to);

    const rails = calculateRails(amount, from, to, rates);
    const rota = rails.find((r) => r.id === 'rota');
    setSelectedReceived(rota ? rota.amountReceived : amount * 38.65);

    setIsPayModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white antialiased">
      {/* Top Header */}
      <Header onOpenInvoice={() => setIsInvoiceModalOpen(true)} />

      {/* Live Market & Speed Ticker */}
      <LiveRateTicker rates={rates} />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero & Interactive Calculator */}
        <ComparisonCalculator rates={rates} onInitiateRota={handleInitiateRota} />

        {/* Architecture & Problem/Solution Breakdown */}
        <ArchitectureSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Solana Pay Execution Modal */}
      <SolanaPayModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        amount={selectedAmount}
        fromCurrency={selectedFrom}
        toCurrency={selectedTo}
        estimatedReceived={selectedReceived}
      />

      {/* Student Invoice & PaySlip Modal */}
      <StudentInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />
    </div>
  );
}
