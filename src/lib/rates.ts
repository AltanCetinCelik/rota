export type Currency = 'USD' | 'EUR' | 'GBP' | 'TRY';

export const CURRENCIES: Currency[] = ['EUR', 'USD', 'GBP', 'TRY'];

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  TRY: '₺',
};

/** Mid-market rates expressed as "units of currency per 1 USD". */
export interface ExchangeRates {
  perUSD: Record<Currency, number>;
  source: string;
  updatedAt: string; // ISO timestamp from the provider
  live: boolean;
}

/** Used only if the live provider is unreachable. Clearly flagged as stale in the UI. */
export const FALLBACK_RATES: ExchangeRates = {
  perUSD: { USD: 1, EUR: 0.8926, GBP: 0.7556, TRY: 49.34 },
  source: 'fallback snapshot (12 Oct 2026)',
  updatedAt: '2026-10-12T00:02:32.000Z',
  live: false,
};

export function midMarketRate(rates: ExchangeRates, from: Currency, to: Currency): number {
  return rates.perUSD[to] / rates.perUSD[from];
}

export function formatMoney(value: number, currency: Currency, digits = 2): string {
  return `${CURRENCY_SYMBOL[currency]}${value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export type RailId = 'rota' | 'wise' | 'operator' | 'bank';

export interface RailBreakdown {
  id: RailId;
  name: string;
  tagline: string;
  amountSent: number;
  sourceCurrency: Currency;
  targetCurrency: Currency;
  amountReceived: number;
  totalCost: number; // in target currency, vs. mid-market
  costPercent: number;
  fixedFeeUSD: number;
  fxMarkupPercent: number;
  speed: string;
  speedCategory: 'instant' | 'hours' | 'days';
  availability: string;
  notes: string;
}

interface RailAssumption {
  id: RailId;
  name: string;
  tagline: string;
  fixedFeeUSD: number; // flat fees, converted from USD into the source currency
  fxMarkupPercent: number; // spread over mid-market
  speed: string;
  speedCategory: RailBreakdown['speedCategory'];
  availability: string;
  notes: string;
}

/**
 * Fee assumptions. These are ESTIMATES based on typical public fee schedules for
 * EUR/USD -> TRY retail corridors. Actual costs vary by provider, amount and day.
 * They are shown to users as estimates, not quotes.
 */
export const RAIL_ASSUMPTIONS: RailAssumption[] = [
  {
    id: 'rota',
    name: 'Rota on Solana',
    tagline: 'USDC payment request, settled on-chain',
    // Solana network fee is ~0.000005 SOL. The real cost is converting fiat <-> USDC
    // on a local exchange at each end, estimated at ~0.3% per side.
    fixedFeeUSD: 0.001,
    fxMarkupPercent: 0.6,
    speed: 'Seconds on-chain',
    speedCategory: 'instant',
    availability: '24/7, incl. weekends',
    notes: 'Includes an estimated 0.3% exchange cost on each side (fiat → USDC → fiat).',
  },
  {
    id: 'wise',
    name: 'Digital remittance',
    tagline: 'Wise-style fintech transfer',
    fixedFeeUSD: 2.5,
    fxMarkupPercent: 1.0,
    speed: 'Minutes – 1 day',
    speedCategory: 'hours',
    availability: 'Depends on local bank rails',
    notes: 'Typically the cheapest fiat option. Limits and TRY payout rules apply.',
  },
  {
    id: 'operator',
    name: 'Money transfer operator',
    tagline: 'Western Union / Ria style',
    fixedFeeUSD: 10,
    fxMarkupPercent: 2.5,
    speed: 'Minutes – 2 days',
    speedCategory: 'hours',
    availability: 'Agent opening hours',
    notes: 'Flat fee plus a wider FX margin; fast for cash pickup.',
  },
  {
    id: 'bank',
    name: 'Bank wire (SWIFT)',
    tagline: 'Correspondent banking',
    fixedFeeUSD: 30,
    fxMarkupPercent: 3.0,
    speed: '2 – 5 business days',
    speedCategory: 'days',
    availability: 'Business days only',
    notes: 'Sender fee + possible intermediary deductions + receiving bank FX margin.',
  },
];

export function calculateRails(
  amount: number,
  from: Currency,
  to: Currency,
  rates: ExchangeRates
): RailBreakdown[] {
  const safeAmount = amount > 0 ? amount : 0;
  const mid = midMarketRate(rates, from, to);
  const ideal = safeAmount * mid;

  return RAIL_ASSUMPTIONS.map((a) => {
    const fixedInSource = a.fixedFeeUSD * rates.perUSD[from];
    const received = Math.max(0, (safeAmount - fixedInSource) * mid * (1 - a.fxMarkupPercent / 100));
    const cost = ideal - received;
    return {
      id: a.id,
      name: a.name,
      tagline: a.tagline,
      amountSent: safeAmount,
      sourceCurrency: from,
      targetCurrency: to,
      amountReceived: received,
      totalCost: cost,
      costPercent: ideal > 0 ? (cost / ideal) * 100 : 0,
      fixedFeeUSD: a.fixedFeeUSD,
      fxMarkupPercent: a.fxMarkupPercent,
      speed: a.speed,
      speedCategory: a.speedCategory,
      availability: a.availability,
      notes: a.notes,
    };
  });
}
