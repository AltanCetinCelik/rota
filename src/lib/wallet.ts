'use client';

import { useCallback, useEffect, useState } from 'react';
import { PublicKey, Transaction } from '@solana/web3.js';

/**
 * Minimal injected-wallet support (Phantom, Solflare, Backpack all expose this shape).
 * We only ask the wallet to *sign*; we broadcast to devnet ourselves so the payment
 * lands on devnet regardless of which network the wallet UI is set to.
 */
interface InjectedProvider {
  isPhantom?: boolean;
  isSolflare?: boolean;
  publicKey: { toBase58(): string } | null;
  isConnected?: boolean;
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toBase58(): string } } | void>;
  disconnect(): Promise<void>;
  signTransaction(tx: Transaction): Promise<Transaction>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  off?(event: string, handler: (...args: unknown[]) => void): void;
}

declare global {
  interface Window {
    phantom?: { solana?: InjectedProvider };
    solflare?: InjectedProvider;
    backpack?: InjectedProvider;
    solana?: InjectedProvider;
  }
}

export interface DetectedWallet {
  name: string;
  provider: InjectedProvider;
}

export function detectWallet(): DetectedWallet | null {
  if (typeof window === 'undefined') return null;
  if (window.phantom?.solana?.isPhantom) return { name: 'Phantom', provider: window.phantom.solana };
  if (window.solflare?.isSolflare) return { name: 'Solflare', provider: window.solflare };
  if (window.backpack) return { name: 'Backpack', provider: window.backpack };
  if (window.solana) return { name: 'Wallet', provider: window.solana };
  return null;
}

export function useInjectedWallet() {
  const [wallet, setWallet] = useState<DetectedWallet | null>(null);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    // Wallet extensions inject asynchronously; check again shortly after load.
    const find = () => setWallet((w) => w ?? detectWallet());
    find();
    const t = setTimeout(find, 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!wallet?.provider.on) return;
    const onDisconnect = () => setPublicKey(null);
    const onAccount = (pk: unknown) => {
      if (pk && typeof (pk as { toBase58?: unknown }).toBase58 === 'function') {
        setPublicKey(new PublicKey((pk as { toBase58(): string }).toBase58()));
      } else {
        setPublicKey(null);
      }
    };
    wallet.provider.on('disconnect', onDisconnect);
    wallet.provider.on('accountChanged', onAccount);
    return () => {
      wallet.provider.off?.('disconnect', onDisconnect);
      wallet.provider.off?.('accountChanged', onAccount);
    };
  }, [wallet]);

  const connect = useCallback(async (): Promise<PublicKey | null> => {
    const w = wallet ?? detectWallet();
    if (!w) {
      window.open('https://phantom.com/download', '_blank', 'noopener,noreferrer');
      return null;
    }
    setWallet(w);
    setConnecting(true);
    try {
      const res = await w.provider.connect();
      const pkStr = (res && 'publicKey' in res ? res.publicKey : w.provider.publicKey)?.toBase58();
      if (!pkStr) return null;
      const pk = new PublicKey(pkStr);
      setPublicKey(pk);
      return pk;
    } finally {
      setConnecting(false);
    }
  }, [wallet]);

  const disconnect = useCallback(async () => {
    await wallet?.provider.disconnect().catch(() => undefined);
    setPublicKey(null);
  }, [wallet]);

  const signTransaction = useCallback(
    async (tx: Transaction) => {
      if (!wallet) throw new Error('No wallet connected');
      return wallet.provider.signTransaction(tx);
    },
    [wallet]
  );

  return {
    walletName: wallet?.name ?? null,
    hasWallet: !!wallet,
    publicKey,
    connecting,
    connect,
    disconnect,
    signTransaction,
  };
}
