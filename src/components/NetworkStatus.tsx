'use client';

import React, { useEffect, useState } from 'react';
import { getConnection } from '@/lib/solana';

/** Real devnet health: current slot and measured RPC round-trip. No hardcoded numbers. */
export const NetworkStatus: React.FC = () => {
  const [slot, setSlot] = useState<number | null>(null);
  const [rtt, setRtt] = useState<number | null>(null);
  const [down, setDown] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const t0 = performance.now();
      try {
        const s = await getConnection().getSlot('confirmed');
        if (cancelled) return;
        setSlot(s);
        setRtt(Math.round(performance.now() - t0));
        setDown(false);
      } catch {
        if (!cancelled) setDown(true);
      }
    };
    tick();
    const id = setInterval(tick, 8000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-mono text-zinc-400"
      title="Live data from the Solana devnet RPC"
    >
      <span className={`h-1.5 w-1.5 rounded-full ${down ? 'bg-rose-500' : slot ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
      <span className="text-zinc-300">devnet</span>
      {down ? (
        <span className="text-rose-400">RPC unreachable</span>
      ) : slot ? (
        <>
          <span>slot {slot.toLocaleString('en-US')}</span>
          <span className="hidden sm:inline text-zinc-500">· rpc {rtt}ms</span>
        </>
      ) : (
        <span>connecting…</span>
      )}
    </div>
  );
};
