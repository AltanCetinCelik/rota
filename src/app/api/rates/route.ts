import { NextResponse } from 'next/server';
import { FALLBACK_RATES, type ExchangeRates } from '@/lib/rates';

interface ErApiResponse {
  result: string;
  time_last_update_unix: number;
  rates: Record<string, number>;
}

export async function GET() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 1800 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as ErApiResponse;
    if (data.result !== 'success') throw new Error('provider error');

    const { EUR, GBP, TRY } = data.rates;
    if (!EUR || !GBP || !TRY) throw new Error('missing currency');

    const body: ExchangeRates = {
      perUSD: { USD: 1, EUR, GBP, TRY },
      source: 'open.er-api.com (ExchangeRate-API)',
      updatedAt: new Date(data.time_last_update_unix * 1000).toISOString(),
      live: true,
    };
    return NextResponse.json(body);
  } catch {
    return NextResponse.json(FALLBACK_RATES);
  }
}
