import { useEffect, useState } from 'react';
import api from '../utils/axiosConfig';

// Admin-configured exchange rate (1 USDT = `rate` BDT), exposed via public settings.
// Cached at module level so multiple components don't refetch on every mount.
let cachedRate = null;

export default function useUsdtToBdtRate() {
  const [rate, setRate] = useState(cachedRate || 0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get('/public/app-settings');
        const r = Number(data?.data?.usdtToBdtRate) || 0;
        cachedRate = r;
        if (active) setRate(r);
      } catch {
        // Keep last known / 0 on failure.
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return rate;
}
