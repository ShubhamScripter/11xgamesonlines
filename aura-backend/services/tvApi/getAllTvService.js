import TvEvent from '../../models/tvEventModel.js';
import { bootLog } from '../../config/silenceConsole.js';

const GET_ALL_TV_URL =
  process.env.GET_ALL_TV_URL || 'http://139.59.102.137:5102/api/get-all-tv';

const TV_CACHE_TTL_MS = Number(process.env.GET_ALL_TV_CACHE_MS) || 60 * 1000;

/** @type {{ list: unknown[] | null, map: Map<string, string> | null, at: number }} */
let cache = { list: null, map: null, at: 0 };
/** @type {Promise<unknown[] | null> | null} */
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

function docToApiItem(doc) {
  return {
    eventId: doc.eventId,
    eventName: doc.eventName ?? '',
    sportName: doc.sportName ?? '',
    tv: doc.tv ?? '',
    iframeScore: doc.iframeScore ?? null,
    iframeScoreV1: doc.iframeScoreV1 ?? null,
    iframeScoreV2: doc.iframeScoreV2 ?? null,
    iframeScoreV4: doc.iframeScoreV4 ?? null,
    utcTime: doc.utcTime ?? '',
  };
}

function getFreshCache() {
  if (!cache.map || Date.now() - cache.at >= TV_CACHE_TTL_MS) return null;
  return cache;
}

function setMemoryCache(payload) {
  cache = {
    list: payload,
    map: indexTvList(payload),
    at: Date.now(),
  };
}

async function fetchRemoteTvList() {
  const startedAt = Date.now();
  bootLog(`[getAllTv] calling ${GET_ALL_TV_URL}`);

  const response = await fetch(GET_ALL_TV_URL, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    bootLog(
      `[getAllTv] ${GET_ALL_TV_URL} failed — HTTP ${response.status}`
    );
    throw new Error(`get-all-tv HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    bootLog(`[getAllTv] ${GET_ALL_TV_URL} — response is not an array`);
    throw new Error('get-all-tv response is not an array');
  }

  bootLog(
    `[getAllTv] ${GET_ALL_TV_URL} OK — ${payload.length} events (${Date.now() - startedAt}ms)`
  );
  return payload;
}

async function persistTvList(payload) {
  if (!Array.isArray(payload) || payload.length === 0) return;

  const ops = payload
    .filter((item) => item?.eventId != null)
    .map((item) => ({
      updateOne: {
        filter: { eventId: String(item.eventId) },
        update: {
          $set: {
            eventId: String(item.eventId),
            eventName: item.eventName ?? '',
            sportName: item.sportName ?? '',
            tv: item.tv ?? '',
            iframeScore: item.iframeScore ?? null,
            iframeScoreV1: item.iframeScoreV1 ?? null,
            iframeScoreV2: item.iframeScoreV2 ?? null,
            iframeScoreV4: item.iframeScoreV4 ?? null,
            utcTime: item.utcTime ?? '',
            syncedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

  if (ops.length > 0) {
    await TvEvent.bulkWrite(ops, { ordered: false });
  }

  const activeIds = payload.map((item) => String(item.eventId));
  await TvEvent.deleteMany({ eventId: { $nin: activeIds } });
}

async function loadTvListFromDb() {
  const docs = await TvEvent.find().sort({ utcTime: -1 }).lean();
  return docs.map(docToApiItem);
}

/** Fetch remote API, persist to MongoDB, refresh in-memory cache. */
export async function syncAllTvFromRemote() {
  const payload = await fetchRemoteTvList();
  await persistTvList(payload);
  setMemoryCache(payload);
  return payload;
}

export async function syncAllTvFromRemoteSafe() {
  try {
    const payload = await syncAllTvFromRemote();
    bootLog(`[getAllTv] synced ${payload.length} events to DB`);
    return payload;
  } catch (err) {
    bootLog(`[getAllTv] sync failed: ${err.message}`);
    const stale = getFreshCache()?.list ?? (await loadTvListFromDb());
    if (stale.length > 0) setMemoryCache(stale);
    return stale;
  }
}

export async function getAllTvList({ force = false } = {}) {
  if (!force) {
    const fresh = getFreshCache();
    if (fresh?.list) return fresh.list;
  }

  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const fromDb = await loadTvListFromDb();
      if (fromDb.length > 0) {
        setMemoryCache(fromDb);
        return fromDb;
      }
      return getFreshCache()?.list ?? [];
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export async function getAllTvMap({ force = false } = {}) {
  if (!force) {
    const fresh = getFreshCache();
    if (fresh?.map) return fresh.map;
  }

  const list = await getAllTvList({ force });
  const map = indexTvList(list);
  cache.map = map;
  return map;
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
