import { Buffer } from 'buffer';
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
  type ParsedTransactionWithMeta,
} from '@solana/web3.js';

/* -------------------------------------------------------------------------- */
/*                                  Network                                   */
/* -------------------------------------------------------------------------- */

export const CLUSTER = 'devnet' as const;
export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC ?? 'https://api.devnet.solana.com';

/** Circle's official USDC mint on Solana devnet (6 decimals). */
export const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
export const USDC_DECIMALS = 6;

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

let _connection: Connection | null = null;
export function getConnection(): Connection {
  if (!_connection) _connection = new Connection(RPC_ENDPOINT, 'confirmed');
  return _connection;
}

export function explorerTxUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${CLUSTER}`;
}

export function explorerAddressUrl(address: string): string {
  return `https://explorer.solana.com/address/${address}?cluster=${CLUSTER}`;
}

export function isValidAddress(value: string): boolean {
  try {
    const trimmed = value.trim();
    if (trimmed.length < 32 || trimmed.length > 44) return false;
    new PublicKey(trimmed);
    return true;
  } catch {
    return false;
  }
}

export function shortAddress(value: string, size = 4): string {
  if (value.length <= size * 2 + 3) return value;
  return `${value.slice(0, size)}…${value.slice(-size)}`;
}

/* -------------------------------------------------------------------------- */
/*                              Payment requests                              */
/* -------------------------------------------------------------------------- */

export type PayToken = 'USDC' | 'SOL';

export interface PaymentRequest {
  v: 1;
  id: string; // human-readable invoice id, also written on-chain as memo
  recipient: string; // base58 wallet that receives funds
  recipientName: string;
  payerName: string;
  purpose: string;
  amount: number; // in token units
  token: PayToken;
  reference: string; // unique base58 pubkey used to find the tx on-chain (Solana Pay spec)
  createdAt: number; // unix ms
}

export function newInvoiceId(): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ROTA-${Date.now().toString(36).toUpperCase().slice(-5)}${rand}`;
}

export function newReference(): string {
  return Keypair.generate().publicKey.toBase58();
}

function toBase64Url(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(input: string): string {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64').toString('utf8');
}

/** Requests are stateless: everything needed to pay and verify lives in the link. */
export function encodeRequest(req: PaymentRequest): string {
  return toBase64Url(JSON.stringify(req));
}

export function decodeRequest(encoded: string): PaymentRequest | null {
  try {
    const parsed = JSON.parse(fromBase64Url(encoded)) as PaymentRequest;
    if (parsed.v !== 1 || !isValidAddress(parsed.recipient) || !isValidAddress(parsed.reference)) return null;
    if (!(parsed.amount > 0) || (parsed.token !== 'USDC' && parsed.token !== 'SOL')) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Solana Pay transfer-request URL.
 * Spec: https://docs.solanapay.com/spec#specification-transfer-request
 */
export function buildSolanaPayUrl(req: PaymentRequest): string {
  const params: string[] = [`amount=${trimAmount(req.amount, req.token)}`];
  if (req.token === 'USDC') params.push(`spl-token=${USDC_MINT.toBase58()}`);
  params.push(`reference=${req.reference}`);
  params.push(`label=${encodeURIComponent(`Rota · ${req.recipientName || 'Payment request'}`)}`);
  params.push(`message=${encodeURIComponent(req.purpose || 'Payment request')}`);
  params.push(`memo=${encodeURIComponent(req.id)}`);
  return `solana:${req.recipient}?${params.join('&')}`;
}

function trimAmount(amount: number, token: PayToken): string {
  const decimals = token === 'USDC' ? USDC_DECIMALS : 9;
  return Number(amount.toFixed(decimals)).toString();
}

/* -------------------------------------------------------------------------- */
/*                          Transaction construction                          */
/* -------------------------------------------------------------------------- */

function associatedTokenAddress(owner: PublicKey, mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];
}

function createAtaIdempotentIx(payer: PublicKey, ata: PublicKey, owner: PublicKey, mint: PublicKey) {
  return new TransactionInstruction({
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: ata, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: false },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([1]), // CreateIdempotent
  });
}

function transferCheckedIx(
  source: PublicKey,
  mint: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  amountBaseUnits: bigint,
  decimals: number
) {
  const data = Buffer.alloc(10);
  data.writeUInt8(12, 0); // TransferChecked
  data.writeBigUInt64LE(amountBaseUnits, 1);
  data.writeUInt8(decimals, 9);
  return new TransactionInstruction({
    programId: TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: source, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: destination, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ],
    data,
  });
}

function memoIx(memo: string) {
  return new TransactionInstruction({
    programId: MEMO_PROGRAM_ID,
    keys: [],
    data: Buffer.from(memo, 'utf8'),
  });
}

/** Builds the same transfer a Solana Pay wallet would build from the QR code. */
export async function buildTransferTransaction(
  connection: Connection,
  payer: PublicKey,
  req: PaymentRequest
): Promise<Transaction> {
  const recipient = new PublicKey(req.recipient);
  const reference = new PublicKey(req.reference);
  const tx = new Transaction();

  tx.add(memoIx(req.id));

  let transferIx: TransactionInstruction;
  if (req.token === 'SOL') {
    transferIx = SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: recipient,
      lamports: Math.round(req.amount * LAMPORTS_PER_SOL),
    });
  } else {
    const payerAta = associatedTokenAddress(payer, USDC_MINT);
    const recipientAta = associatedTokenAddress(recipient, USDC_MINT);

    const payerAccount = await connection.getAccountInfo(payerAta);
    if (!payerAccount) {
      throw new Error('Your wallet has no devnet USDC. Get some at faucet.circle.com (Solana Devnet), or pay this request in SOL.');
    }
    tx.add(createAtaIdempotentIx(payer, recipientAta, recipient, USDC_MINT));
    transferIx = transferCheckedIx(
      payerAta,
      USDC_MINT,
      recipientAta,
      payer,
      BigInt(Math.round(req.amount * 10 ** USDC_DECIMALS)),
      USDC_DECIMALS
    );
  }

  // Solana Pay: the reference is attached as a read-only, non-signer key so the
  // payment can be located later with getSignaturesForAddress(reference).
  transferIx.keys.push({ pubkey: reference, isSigner: false, isWritable: false });
  tx.add(transferIx);

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = payer;
  return tx;
}

/* -------------------------------------------------------------------------- */
/*                         On-chain discovery & checks                        */
/* -------------------------------------------------------------------------- */

export async function findPaymentSignature(connection: Connection, reference: string): Promise<string | null> {
  const sigs = await connection.getSignaturesForAddress(new PublicKey(reference), { limit: 10 }, 'confirmed');
  const ok = sigs.filter((s) => !s.err);
  if (ok.length === 0) return null;
  return ok[ok.length - 1].signature; // oldest successful payment for this reference
}

export interface VerifiedPayment {
  signature: string;
  slot: number;
  blockTime: number | null;
  feeLamports: number;
  payer: string;
  amountReceived: number;
  token: PayToken;
  memo: string | null;
}

export class PaymentMismatchError extends Error {}

/** Re-derives the payment from chain data. Nothing here is trusted from the client. */
export async function verifyPayment(
  connection: Connection,
  signature: string,
  req: PaymentRequest
): Promise<VerifiedPayment> {
  let tx: ParsedTransactionWithMeta | null = null;
  for (let i = 0; i < 6 && !tx; i++) {
    tx = await connection.getParsedTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });
    if (!tx) await new Promise((r) => setTimeout(r, 800));
  }
  if (!tx || !tx.meta) throw new Error('Transaction not found yet.');
  if (tx.meta.err) throw new PaymentMismatchError('Transaction failed on-chain.');

  const keys = tx.transaction.message.accountKeys.map((k) => k.pubkey.toBase58());
  let received = 0;

  if (req.token === 'SOL') {
    const idx = keys.indexOf(req.recipient);
    if (idx < 0) throw new PaymentMismatchError('Recipient not found in transaction.');
    received = (tx.meta.postBalances[idx] - tx.meta.preBalances[idx]) / LAMPORTS_PER_SOL;
  } else {
    const mint = USDC_MINT.toBase58();
    const sum = (list: typeof tx.meta.postTokenBalances) =>
      (list ?? [])
        .filter((b) => b.mint === mint && b.owner === req.recipient)
        .reduce((acc, b) => acc + Number(b.uiTokenAmount.uiAmountString ?? 0), 0);
    received = sum(tx.meta.postTokenBalances) - sum(tx.meta.preTokenBalances);
  }

  const epsilon = req.token === 'SOL' ? 1e-9 : 1e-6;
  if (received + epsilon < req.amount) {
    throw new PaymentMismatchError(
      `Amount mismatch: expected ${req.amount} ${req.token}, received ${received} ${req.token}.`
    );
  }

  const memoLog = tx.meta.logMessages?.find((l) => l.startsWith('Program log: Memo'));
  const memoMatch = memoLog?.match(/Memo \(len \d+\): "(.*)"/);

  return {
    signature,
    slot: tx.slot,
    blockTime: tx.blockTime ?? null,
    feeLamports: tx.meta.fee,
    payer: keys[0],
    amountReceived: received,
    token: req.token,
    memo: memoMatch ? memoMatch[1] : null,
  };
}
