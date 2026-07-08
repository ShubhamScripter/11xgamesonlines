import { useEffect, useState } from 'react';
import api from '../utils/axiosConfig';

// Admin-configured exchange rate (1 USDT = `rate` BDT), exposed via public settings.
// Cached at module level so multiple components don't refetch on every mount.
let cachedRate = null;
let cachedAt = 0;
let inflight = null;
const CACHE_MS = 5 * 60 * 1000;

async function loadUsdtRate() {
  if (cachedRate != null && Date.now() - cachedAt < CACHE_MS) {
    return cachedRate;
  }
  if (inflight) return inflight;

  inflight = api
    .get('/public/app-settings')
    .then(({ data }) => {
      const r = Number(data?.data?.usdtToBdtRate) || 0;
      cachedRate = r;
      cachedAt = Date.now();
      return r;
    })
    .catch(() => cachedRate || 0)
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export default function useUsdtToBdtRate() {
  const [rate, setRate] = useState(cachedRate || 0);

  useEffect(() => {
    let active = true;
    if (cachedRate != null && Date.now() - cachedAt < CACHE_MS) {
      setRate(cachedRate);
      return undefined;
    }
    loadUsdtRate().then((r) => {
      if (active) setRate(r);
    });
    return () => {
      active = false;
    };
  }, []);

  return rate;
}
