import axios from 'axios';

import TvEvent from '../../models/tvEventModel.js';
import { bootLog } from '../../config/silenceConsole.js';

const GET_ALL_TV_URL =
  process.env.GET_ALL_TV_URL || 'http://139.59.102.137:5102/api/get-all-tv';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const TV_CACHE_TTL_MS = Number(process.env.GET_ALL_TV_CACHE_MS) || 60 * 1000;
const TV_FETCH_TIMEOUT_MS =
  Number(process.env.GET_ALL_TV_FETCH_TIMEOUT_MS) || 30_000;
const TV_FETCH_RETRIES = Number(process.env.GET_ALL_TV_FETCH_RETRIES) || 3;
const TV_FETCH_RETRY_DELAY_MS =
  Number(process.env.GET_ALL_TV_FETCH_RETRY_DELAY_MS) || 2000;
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

function formatTvFetchError(err) {
  const parts = [err?.message || String(err)];
  if (err?.code) parts.push(`code=${err.code}`);
  if (err?.cause) {
    const c = err.cause;
    parts.push(
      `cause=${c?.message || c}${c?.code ? ` (${c.code})` : ''}`
    );
  }
  if (err?.errno != null) parts.push(`errno=${err.errno}`);
  if (err?.syscall) parts.push(`syscall=${err.syscall}`);
  if (err?.address) parts.push(`address=${err.address}`);
  if (err?.port) parts.push(`port=${err.port}`);
  return parts.join(' | ');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatAxiosTvError(err) {
  if (err?.response) {
    const status = err.response.status;
    const body =
      typeof err.response.data === 'string'
        ? err.response.data.slice(0, 200)
        : JSON.stringify(err.response.data ?? '').slice(0, 200);
    return `HTTP ${status}${body ? ` — body: ${body}` : ''}`;
  }
  return formatTvFetchError(err);
}

/** Log public egress IP so TV API provider can whitelist the server. */
async function logServerEgressIpForWhitelist() {
  try {
    const { data } = await axios.get('https://api.ipify.org?format=json', {
      timeout: 5000,
    });
    if (data?.ip) {
      bootLog(
        `[getAllTv] whitelist this server IP on TV API: ${data.ip}`
      );
    }
  } catch {
    bootLog('[getAllTv] could not detect server outbound IP for whitelist');
  }
}

async function fetchRemoteTvListOnce() {
  const response = await axios.get(GET_ALL_TV_URL, {
    timeout: TV_FETCH_TIMEOUT_MS,
    headers: { Accept: 'application/json' },
    validateStatus: () => true,
  });

  if (response.status < 200 || response.status >= 300) {
    const err = new Error(`get-all-tv HTTP ${response.status}`);
    err.response = response;
    throw err;
  }

  const data = response.data;
  if (data == null || typeof data !== 'object') {
    throw new Error('get-all-tv response is empty or invalid');
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  throw new Error('get-all-tv response is not an array');
}

async function fetchRemoteTvList() {
  if (!IS_PRODUCTION) {
    throw new Error('get-all-tv remote fetch is production-only');
  }

  const startedAt = Date.now();
  bootLog(
    `[getAllTv] calling ${GET_ALL_TV_URL} (timeout=${TV_FETCH_TIMEOUT_MS}ms, retries=${TV_FETCH_RETRIES})`
  );

  let lastErr;
  for (let attempt = 1; attempt <= TV_FETCH_RETRIES; attempt++) {
    try {
      const payload = await fetchRemoteTvListOnce();
      bootLog(
        `[getAllTv] ${GET_ALL_TV_URL} OK — ${payload.length} events (${Date.now() - startedAt}ms, attempt ${attempt})`
      );
      return payload;
    } catch (err) {
      lastErr = err;
      const detail = formatAxiosTvError(err);
      bootLog(
        `[getAllTv] attempt ${attempt}/${TV_FETCH_RETRIES} failed: ${detail}`
      );
      if (attempt < TV_FETCH_RETRIES) {
        await sleep(TV_FETCH_RETRY_DELAY_MS * attempt);
      }
    }
  }

  await logServerEgressIpForWhitelist();
  throw lastErr ?? new Error('get-all-tv fetch failed');
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
    bootLog(`[getAllTv] sync failed: ${formatAxiosTvError(err)}`);
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
