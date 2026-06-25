const GET_ALL_TV_URL =
  process.env.GET_ALL_TV_URL || 'http://139.59.102.137:5102/api/get-all-tv';

const TV_CACHE_TTL_MS = Number(process.env.GET_ALL_TV_CACHE_MS) || 3 * 60 * 1000;

/** @type {{ list: unknown[] | null, map: Map<string, string> | null, at: number }} */
let cache = { list: null, map: null, at: 0 };
/** @type {Promise<Map<string, string> | null> | null} */
let inflight = null;

function indexTvList(payload) {
  const map = new Map();
  for (const item of payload) {
    const eventId = item?.eventId;
    const tv = item?.tv;
    if (eventId == null || tv == null) continue;
    const url = String(tv).trim();
    if (url) map.set(String(eventId), url);
  }
  return map;
}

function getFreshCache() {
  if (!cache.map || Date.now() - cache.at >= TV_CACHE_TTL_MS) return null;
  return cache;
}

async function fetchRemoteTvList() {
  const response = await fetch(GET_ALL_TV_URL, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`get-all-tv HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error('get-all-tv response is not an array');
  }

  const map = indexTvList(payload);
  cache = { list: payload, map, at: Date.now() };
  return map;
}

export async function getAllTvMap({ force = false } = {}) {
  if (!force) {
    const fresh = getFreshCache();
    if (fresh?.map) return fresh.map;
  }

  if (inflight) return inflight;

  inflight = (async () => {
    try {
      return await fetchRemoteTvList();
    } catch (err) {
      console.error('[getAllTv] fetch failed:', err.message);
      return getFreshCache()?.map ?? null;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export async function getAllTvList({ force = false } = {}) {
  await getAllTvMap({ force });
  return cache.list ?? [];
}

export function lookupTvUrl(map, gameid, altEventIds = []) {
  if (!map) return null;
  const ids = [gameid, ...altEventIds].filter(Boolean).map(String);
  for (const id of ids) {
    const tv = map.get(id);
    if (tv) return tv;
  }
  return null;
}
