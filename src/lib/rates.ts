export interface ExchangeRates {
  USD_TRY: number;
  EUR_TRY: number;
  EUR_USD: number;
  GBP_TRY: number;
  USDC_TRY: number; // typically slightly closer to interbank or spot
  SOL_USD: number;
  lastUpdated: string;
}

export type Currency = 'EUR' | 'USD' | 'GBP' | 'TRY';

export interface RailBreakdown {
  id: 'rota' | 'bank' | 'operator' | 'wise';
  name: string;
  tagline: string;
  badge?: string;
  isBest: boolean;
  amountSent: number;
  sourceCurrency: Currency;
  targetCurrency: Currency;
  amountReceived: number;
  effectiveRate: number;
  totalFeesCost: number; // in target currency
  fixedFee: number; // in source currency
  fxSpreadPercent: number;
  speed: string;
  speedCategory: 'instant' | 'hours' | 'days';
  steps: string[];
  disclaimer: string;
}

// Baseline realistic rates (fallback & live anchor)
export const DEFAULT_RATES: ExchangeRates = {
  USD_TRY: 35.85,
  EUR_TRY: 38.65,
  EUR_USD: 1.078,
  GBP_TRY: 45.40,
  USDC_TRY: 35.82,
  SOL_USD: 148.50,
  lastUpdated: new Date().toISOString(),
};

/**
 * Calculates net received amounts across 4 rails:
 * 1. Rota (Solana USDC / PayFi): 0.15% spread, $0.001 network fee, instant
 * 2. Traditional Bank SWIFT: $30 fixed fee + 3.2% hidden FX markup, 3-5 days
 * 3. Remittance Operator (Western Union/Ria): $12 fee + 2.6% markup, 1-2 days
 * 4. Wise / Traditional Fintech: 1.4% total fee, 6-24 hours
 */
export function calculateRails(
  amount: number,
  from: Currency,
  to: Currency,
  rates: ExchangeRates = DEFAULT_RATES
): RailBreakdown[] {
  if (amount <= 0) amount = 100;

  // Compute baseline mid-market rate
  let midMarketRate = 1;
  if (from === 'EUR' && to === 'TRY') midMarketRate = rates.EUR_TRY;
  else if (from === 'USD' && to === 'TRY') midMarketRate = rates.USD_TRY;
  else if (from === 'GBP' && to === 'TRY') midMarketRate = rates.GBP_TRY;
  else if (from === 'TRY' && to === 'EUR') midMarketRate = 1 / rates.EUR_TRY;
  else if (from === 'TRY' && to === 'USD') midMarketRate = 1 / rates.USD_TRY;
  else if (from === 'EUR' && to === 'USD') midMarketRate = rates.EUR_USD;
  else if (from === 'USD' && to === 'EUR') midMarketRate = 1 / rates.EUR_USD;
  else midMarketRate = 1;

  const theoreticalMax = amount * midMarketRate;

  // 1. ROTA (Solana USDC Rail)
  // Network fee = ~$0.001 (negligible)
  // VASP exchange fee = 0.15%
  const rotaFixedFee = from === 'TRY' ? 1.0 : 0.05;
  const rotaFxSpread = 0.15; // 0.15%
  const rotaEffectiveRate = midMarketRate * (1 - rotaFxSpread / 100);
  const rotaReceived = Math.max(0, (amount - rotaFixedFee) * rotaEffectiveRate);
  const rotaCost = theoreticalMax - rotaReceived;

  // 2. TRADITIONAL BANK (SWIFT + Intermediary)
  // Fixed fee: ~€25 / $30 / 850 TL
  // Hidden FX markup: ~3.2%
  const bankFixedFee = from === 'EUR' ? 28 : from === 'USD' ? 30 : from === 'GBP' ? 25 : 950;
  const bankFxSpread = 3.25; // 3.25% hidden bank spread
  const bankEffectiveRate = midMarketRate * (1 - bankFxSpread / 100);
  const bankDeductible = Math.max(0, amount - bankFixedFee);
  const bankReceived = bankDeductible * bankEffectiveRate;
  const bankCost = theoreticalMax - bankReceived;

  // 3. REMITTANCE OPERATOR (Western Union / MoneyGram)
  // Fixed fee: ~€8-15 / 350 TL
  // FX markup: ~2.5%
  const opFixedFee = from === 'EUR' ? 9 : from === 'USD' ? 10 : from === 'GBP' ? 8 : 400;
  const opFxSpread = 2.45;
  const opEffectiveRate = midMarketRate * (1 - opFxSpread / 100);
  const opReceived = Math.max(0, (amount - opFixedFee) * opEffectiveRate);
  const opCost = theoreticalMax - opReceived;

  // 4. DIGITAL FINTECH (Wise / Remitly style)
  const wiseFixedFee = from === 'EUR' ? 2.5 : from === 'USD' ? 3.0 : 90;
  const wiseFxSpread = 1.35;
  const wiseEffectiveRate = midMarketRate * (1 - wiseFxSpread / 100);
  const wiseReceived = Math.max(0, (amount - wiseFixedFee) * wiseEffectiveRate);
  const wiseCost = theoreticalMax - wiseReceived;

  const rails: RailBreakdown[] = [
    {
      id: 'rota',
      name: 'Rota (Solana PayFi)',
      tagline: 'Zero hidden spread, on-chain finality',
      badge: 'En Avantajlı & Anında',
      isBest: true,
      amountSent: amount,
      sourceCurrency: from,
      targetCurrency: to,
      amountReceived: Number(rotaReceived.toFixed(2)),
      effectiveRate: Number(rotaEffectiveRate.toFixed(4)),
      totalFeesCost: Number(rotaCost.toFixed(2)),
      fixedFee: rotaFixedFee,
      fxSpreadPercent: rotaFxSpread,
      speed: '~400 ms (Anında)',
      speedCategory: 'instant',
      steps: [
        'Yerel VASP üzerinden sıfır komisyonlu USDC temini',
        'Solana Devnet/Mainnet üzerinden 400ms transfer',
        'Hedef IBAN veya cüzdana anında kayıpsız teslimat',
      ],
      disclaimer: 'Solana blokzincirinde teyit edilir, fonlar aracı banka olmadan doğrudan cüzdana geçer.',
    },
    {
      id: 'wise',
      name: 'Dijital Havale (Wise / Fintech)',
      tagline: 'Geleneksel fintech kanalı',
      isBest: false,
      amountSent: amount,
      sourceCurrency: from,
      targetCurrency: to,
      amountReceived: Number(wiseReceived.toFixed(2)),
      effectiveRate: Number(wiseEffectiveRate.toFixed(4)),
      totalFeesCost: Number(wiseCost.toFixed(2)),
      fixedFee: wiseFixedFee,
      fxSpreadPercent: wiseFxSpread,
      speed: '6 - 24 Saat',
      speedCategory: 'hours',
      steps: [
        'Fintech havuzuna yerel havale',
        'İç takas eşleşmesi',
        'Alıcı banka hesabına aktarım',
      ],
      disclaimer: 'TR tarafında limitlere ve iş günlerine tabidir.',
    },
    {
      id: 'operator',
      name: 'Acente Havalesi (Western Union vb.)',
      tagline: 'Nakit acente ağı',
      isBest: false,
      amountSent: amount,
      sourceCurrency: from,
      targetCurrency: to,
      amountReceived: Number(opReceived.toFixed(2)),
      effectiveRate: Number(opEffectiveRate.toFixed(4)),
      totalFeesCost: Number(opCost.toFixed(2)),
      fixedFee: opFixedFee,
      fxSpreadPercent: opFxSpread,
      speed: '1 - 2 İş Günü',
      speedCategory: 'days',
      steps: [
        'Acente komisyonu kesintisi',
        'Geniş döviz makası uygulanması',
        'Nakit gişe veya banka teslimatı',
      ],
      disclaimer: 'Yüksek kur marjı ve acente işlem komisyonu içerir.',
    },
    {
      id: 'bank',
      name: 'Geleneksel Banka (SWIFT)',
      tagline: 'Muhabir banka ağı',
      isBest: false,
      amountSent: amount,
      sourceCurrency: from,
      targetCurrency: to,
      amountReceived: Number(bankReceived.toFixed(2)),
      effectiveRate: Number(bankEffectiveRate.toFixed(4)),
      totalFeesCost: Number(bankCost.toFixed(2)),
      fixedFee: bankFixedFee,
      fxSpreadPercent: bankFxSpread,
      speed: '2 - 4 İş Günü',
      speedCategory: 'days',
      steps: [
        'Gönderen banka SWIFT işlem ücreti ($25+)',
        '1-2 Muhabir banka aracılık kesintisi ($15-20)',
        'Hedef bankanın uyguladığı %3+ döviz makası',
      ],
      disclaimer: 'Hafta sonu takas kapalıdır, muhabir banka kesintileri önceden bilinemez.',
    },
  ];

  return rails;
}
