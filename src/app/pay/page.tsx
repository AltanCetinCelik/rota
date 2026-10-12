'use client';

import React, { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PayView } from '@/components/PayView';
import { decodeRequest } from '@/lib/solana';

function PayInner() {
  const params = useSearchParams();
  const encoded = params.get('r');
  const req = useMemo(() => (encoded ? decodeRequest(encoded) : null), [encoded]);

  if (!req) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-xl font-bold text-white">Invalid or incomplete payment link</h1>
        <p className="mt-2 text-sm text-zinc-400">Ask the sender for a new link, or create your own request.</p>
        <Link href="/#request" className="mt-6 inline-block rounded-lg bg-white px-4 py-2 text-sm font-bold text-black">
          Create a request
        </Link>
      </div>
    );
  }
  return <PayView req={req} />;
}

export default function PayPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col antialiased print:bg-white">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="py-24 text-center text-sm text-zinc-500">Loading request…</div>}>
          <PayInner />
        </Suspense>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
