'use client';

import { useEffect, useState } from 'react';
import { FALLBACK_RATES, type ExchangeRates } from './rates';

export function useRates() {
  const [rates, setRates] = useState<ExchangeRates>(FALLBACK_RATES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/rates')
      .then((r) => r.json() as Promise<ExchangeRates>)
      .then((data) => {
        if (!cancelled && data?.perUSD?.TRY) setRates(data);
      })
      .catch(() => undefined)
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { rates, loading };
}
