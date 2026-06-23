const CACHE_KEY = '11x_home_sports_v1';
const TTL_MS = 3 * 60 * 1000;

export function readHomeSportsCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.ts || Date.now() - parsed.ts > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeHomeSportsCache(payload) {
  if (!payload) return;
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ts: Date.now(), ...payload })
    );
  } catch {
    // ignore quota / private mode
  }
}
