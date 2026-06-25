import api from "./axiosConfig";

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

const TV_LIST_TTL_MS = 60 * 1000;

/** @type {{ map: Map<string, string> | null, at: number }} */
let tvCache = { map: null, at: 0 };
/** @type {Promise<Map<string, string> | null> | null} */
let tvInflight = null;

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

function mergeIntoCache(eventId, tvUrl) {
  if (!eventId || !tvUrl) return;
  const map = tvCache.map?.size ? new Map(tvCache.map) : new Map();
  map.set(String(eventId), String(tvUrl));
  tvCache = { map, at: Date.now() };
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

function getTvCacheEntry() {
  if (!tvCache.map || tvCache.map.size === 0) return null;
  if (Date.now() - tvCache.at >= TV_LIST_TTL_MS) return null;
  return tvCache;
}

async function fetchTvListFromBackend() {
  const response = await api.get("/get-all-tv");
  return response.data;
}

async function fetchTvList() {
  const cached = getTvCacheEntry();
  if (cached?.map) return cached.map;

  if (tvInflight) return tvInflight;

  tvInflight = (async () => {
    try {
      const payload = await fetchTvListFromBackend();
      if (!Array.isArray(payload)) return getTvCacheEntry()?.map ?? null;

      const map = indexTvList(payload);
      if (map.size > 0) {
        tvCache = { map, at: Date.now() };
      }
      return map.size > 0 ? map : null;
    } catch {
      return getTvCacheEntry()?.map ?? null;
    } finally {
      tvInflight = null;
    }
  })();

  return tvInflight;
}

async function fetchTvByEventFromBackend(eventId) {
  const response = await api.get("/tv/by-event", {
    params: { gameid: eventId },
  });
  return response.data?.tv ? String(response.data.tv) : null;
}

/** Warm cache while user browses match list (non-blocking). */
export function prefetchBetfairTvList(_key = DEFAULT_BULKAPI_KEY) {
  fetchTvList();
}

/** Instant lookup when cache is already warm. */
export function getBetfairTvLinkSync({ gameid, key: _key, altEventIds = [] }) {
  const entry = getTvCacheEntry();
  return lookupTvUrl(entry?.map, gameid, altEventIds);
}

/**
 * Resolve TV URL for an event — always hits backend /tv/by-event per page open.
 */
export async function getBetfairTvLinkByEventId({
  gameid,
  key: _key = DEFAULT_BULKAPI_KEY,
  altEventIds = [],
}) {
  const cached = getBetfairTvLinkSync({ gameid, altEventIds });
  if (cached) return cached;

  const ids = [gameid, ...altEventIds].filter(Boolean).map(String);
  for (const id of ids) {
    try {
      const tv = await fetchTvByEventFromBackend(id);
      if (tv) {
        mergeIntoCache(id, tv);
        return tv;
      }
    } catch {
      // 404 or network — try next id
    }
  }

  const map = await fetchTvList();
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
