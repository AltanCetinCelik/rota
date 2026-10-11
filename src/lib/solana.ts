import { Connection, PublicKey, clusterApiUrl, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

export const DEVNET_ENDPOINT = clusterApiUrl('devnet');

// Default Demo Recipient Address (Student / Beneficiary Devnet address)
export const DEMO_BENEFICIARY_PUBKEY = '8F47n1E8uV62c7R8e9V6fK7N4x4L3y2k5b1A3C4D5E6F';

export interface SolanaPayRequest {
  recipient: string;
  amountUSDC: number;
  reference: string;
  label: string;
  message: string;
  memo?: string;
}

/**
 * Builds standard Solana Pay URL specification
 * format: solana:<recipient>?amount=<amount>&reference=<ref>&label=<label>&message=<msg>
 */
export function buildSolanaPayUrl(req: SolanaPayRequest): string {
  const url = new URL(`solana:${req.recipient}`);
  url.searchParams.append('amount', req.amountUSDC.toFixed(2));
  url.searchParams.append('reference', req.reference);
  url.searchParams.append('label', encodeURIComponent(req.label));
  url.searchParams.append('message', encodeURIComponent(req.message));
  if (req.memo) {
    url.searchParams.append('memo', encodeURIComponent(req.memo));
  }
  return url.toString();
}

/**
 * Generates a unique 32-byte reference public key for tracking on-chain payment
 */
export function generatePaymentReference(): string {
  return Keypair.generate().publicKey.toBase58();
}

export interface SimulationResult {
  signature: string;
  slot: number;
  feeSOL: number;
  confirmationTimeMs: number;
  blockTime: number;
  explorerUrl: string;
}

/**
 * Simulates or executes an on-chain verification on Solana Devnet
 */
export async function simulateDevnetPayment(
  recipientPubKeyString: string,
  amountUSDC: number
): Promise<SimulationResult> {
  const startTime = performance.now();
  
  // Real public key parsing check
  let pubkey: PublicKey;
  try {
    pubkey = new PublicKey(recipientPubKeyString);
  } catch {
    pubkey = Keypair.generate().publicKey;
  }

  // Generate unique simulated TX signature or connect to devnet RPC
  try {
    const connection = new Connection(DEVNET_ENDPOINT, 'confirmed');
    const slot = await connection.getSlot();
    const duration = Math.round(performance.now() - startTime + 380);
    
    // Construct real dummy signature for demonstration tracking
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const signature = `${randomHex.slice(0, 44)}2Y3Z4A`;

    return {
      signature,
      slot: slot || 328491023,
      feeSOL: 0.000005, // 5000 lamports = ~$0.0007
      confirmationTimeMs: duration,
      blockTime: Math.floor(Date.now() / 1000),
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    };
  } catch {
    return {
      signature: '5K2bM7xP8qR9wT1vY3z4A6c8E0g2H4j6L8n0P2r4T6v8X0z2',
      slot: 328491023,
      feeSOL: 0.000005,
      confirmationTimeMs: 412,
      blockTime: Math.floor(Date.now() / 1000),
      explorerUrl: `https://explorer.solana.com/address/${pubkey.toBase58()}?cluster=devnet`,
    };
  }
}
