export const SPORTS_MEDIA_TYPE = {
  CRICKET: "cricket",
  TENNIS: "tennis",
  FOOTBALL: "football",
};

const BASE_URL =
  import.meta.env.VITE_PROVIDER_D_API_URL || "https://winkaro.online/api/v1";

export const DEFAULT_BULKAPI_KEY =
  import.meta.env.VITE_BULKAPI_KEY ||
  "gk_db1cb19180dd6dc5657140d56d29c138099808c7a1196c52";

const BETFAIR_TV_TTL_MS = 3 * 60 * 1000;

/** @type {Map<string, { map: Map<string, string>, at: number }>} */
const betfairTvCacheByKey = new Map();
/** @type {Map<string, Promise<Map<string, string> | null>>} */
const betfairTvInflightByKey = new Map();

/** Resolve beventId from navigation state or match list (soccer/tennis). */
export function resolveBeventId({ locationState, matches, gameid }) {
  const fromState =
    locationState?.match?.beventId ?? locationState?.match?.bevent_id;
  if (fromState != null && String(fromState).trim() !== "") {
    return String(fromState);
  }
  const found = (matches || []).find((m) => String(m?.id) === String(gameid));
  const fromList = found?.beventId ?? found?.bevent_id;
  return fromList != null && String(fromList).trim() !== ""
    ? String(fromList)
    : null;
}

function indexBetfairTvList(payload) {
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

function lookupTvUrl(map, gameid, altEventIds = []) {
  if (!map) return null;
  const ids = [gameid, ...altEventIds].filter(Boolean).map(String);
  for (const id of ids) {
    const tv = map.get(id);
    if (tv) return tv;
  }
  return null;
}

function getCacheEntry(key) {
  const entry = betfairTvCacheByKey.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at >= BETFAIR_TV_TTL_MS) return null;
  return entry;
}

async function fetchBetfairTvList(key) {
  const cached = getCacheEntry(key);
  if (cached) return cached.map;

  const inflight = betfairTvInflightByKey.get(key);
  if (inflight) return inflight;

  const request = (async () => {
    try {
      const encodedKey = encodeURIComponent(key);
      const response = await fetch(`${BASE_URL}/betfair-tv?key=${encodedKey}`);
      if (!response.ok) return getCacheEntry(key)?.map ?? null;

      const payload = await response.json();
      if (!Array.isArray(payload)) return getCacheEntry(key)?.map ?? null;

      const map = indexBetfairTvList(payload);
      betfairTvCacheByKey.set(key, { map, at: Date.now() });
      return map;
    } catch {
      return getCacheEntry(key)?.map ?? null;
    } finally {
      betfairTvInflightByKey.delete(key);
    }
  })();

  betfairTvInflightByKey.set(key, request);
  return request;
}

/** Warm cache while user browses match list (non-blocking). */
export function prefetchBetfairTvList(key = DEFAULT_BULKAPI_KEY) {
  if (!key) return;
  fetchBetfairTvList(key);
}

/** Instant lookup when cache is already warm. */
export function getBetfairTvLinkSync({ gameid, key, altEventIds = [] }) {
  if (!key) return null;
  const entry = getCacheEntry(key);
  return lookupTvUrl(entry?.map, gameid, altEventIds);
}

/**
 * betfair-tv: [{ eventId, tv, ... }]
 * Returns the `tv` URL for the matching eventId.
 */
export async function getBetfairTvLinkByEventId({
  gameid,
  key = DEFAULT_BULKAPI_KEY,
  altEventIds = [],
}) {
  if (!key) return null;
  const cached = getBetfairTvLinkSync({ gameid, key, altEventIds });
  if (cached) return cached;

  const map = await fetchBetfairTvList(key);
  return lookupTvUrl(map, gameid, altEventIds);
}

export function getSportsMediaUrls({ sport, gameid, key, beventId }) {
  const useBeventForGmid =
    sport === SPORTS_MEDIA_TYPE.TENNIS ||
    sport === SPORTS_MEDIA_TYPE.FOOTBALL;
  const gmid =
    useBeventForGmid && beventId != null && String(beventId).trim() !== ""
      ? beventId
      : gameid;

  const encodedGameId = encodeURIComponent(gmid ?? "");
  const encodedKey = encodeURIComponent(key ?? "");

  const liveStreamUrl = `${BASE_URL}/live-stream?gmid=${encodedGameId}&key=${encodedKey}`;
  const scorecardUrl = `${BASE_URL}/betfair-score?key=${encodedKey}&gmid=${encodedGameId}`;

  return {
    liveStreamUrl,
    scorecardUrl,
  };
}
