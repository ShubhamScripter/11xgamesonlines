import {
  buildSportPayload,
  SPORTS_CACHE_SPORTS,
} from './payloadBuilders.js';
import { applyInplayInferenceToPayload } from './inplayInference.js';
import { filterFullyDisabledFromPayload } from '../../utils/matchSectionSettings.js';
import { cacheDelete, cacheGet, cacheSet } from './cacheStore.js';
import {
  assessOddsCacheQuality,
  isOddsPayloadComplete,
} from './oddsCacheQuality.js';

const CACHE_TTL_SEC = Number(process.env.SPORTS_CACHE_TTL_SEC) || 120;

/** Internal cache key: cricket:list | cricket:odds:eligible | cricket:odds:all */
export function toSportsCacheKey(sport, withOdds, oddsScope) {
  if (!withOdds) return `${sport}:list`;
  return `${sport}:odds:${oddsScope === 'all' ? 'all' : 'eligible'}`;
}

export function parseSportsCacheKey(key) {
  const parts = key.split(':');
  if (parts.length === 2 && parts[1] === 'list') {
    return { sport: parts[0], withOdds: false, oddsScope: 'eligible' };
  }
  if (parts.length === 3 && parts[1] === 'odds') {
    return {
      sport: parts[0],
      withOdds: true,
      oddsScope: parts[2] === 'all' ? 'all' : 'eligible',
    };
  }
  return null;
}

/** Jobs refreshed by cron (list + eligible + full odds for all sports). */
export const CRON_CACHE_JOBS = [
  ...SPORTS_CACHE_SPORTS.map((sport) => ({
    sport,
    withOdds: false,
    oddsScope: 'eligible',
  })),
  ...SPORTS_CACHE_SPORTS.map((sport) => ({
    sport,
    withOdds: true,
    oddsScope: 'eligible',
  })),
  ...SPORTS_CACHE_SPORTS.map((sport) => ({
    sport,
    withOdds: true,
    oddsScope: 'all',
  })),
];

/** Odds-only jobs — scanned by repair cron when Redis has empty odds. */
export const ODDS_CACHE_JOBS = CRON_CACHE_JOBS.filter((j) => j.withOdds);

export async function getCachedSportsPayload(sport, withOdds, oddsScope) {
  const key = toSportsCacheKey(sport, withOdds, oddsScope);
  const entry = await cacheGet(key);
  if (!entry?.payload) return null;
  return entry.payload;
}

export async function invalidateSportsCacheEntry(sport, withOdds, oddsScope) {
  const key = toSportsCacheKey(sport, withOdds, oddsScope);
  await cacheDelete(key);
}

async function maybePersistOddsPayload(sport, withOdds, oddsScope, payload) {
  const key = toSportsCacheKey(sport, withOdds, oddsScope);

  if (!withOdds) {
    await setCachedSportsPayload(sport, withOdds, oddsScope, payload);
    return { stored: true, payload };
  }

  const quality = assessOddsCacheQuality(payload, oddsScope);
  if (quality.complete) {
    await setCachedSportsPayload(sport, withOdds, oddsScope, payload);
    return { stored: true, payload, quality };
  }

  const existing = await getCachedSportsPayload(sport, withOdds, oddsScope);
  if (existing && isOddsPayloadComplete(existing, oddsScope)) {
    console.warn(
      `[SportsCache] skip write ${key} — new data has weak odds (${quality.withOdds}/${quality.total}), keeping previous cache`
    );
    return { stored: false, payload: existing, quality };
  }

  console.warn(
    `[SportsCache] drop incomplete ${key} from Redis (${quality.withOdds}/${quality.total} with odds)`
  );
  await cacheDelete(key);
  return { stored: false, payload, quality };
}

export async function setCachedSportsPayload(
  sport,
  withOdds,
  oddsScope,
  payload
) {
  const key = toSportsCacheKey(sport, withOdds, oddsScope);
  await cacheSet(key, payload, CACHE_TTL_SEC);
}

export async function refreshSportsCacheEntry(sport, withOdds, oddsScope) {
  const started = Date.now();
  const key = toSportsCacheKey(sport, withOdds, oddsScope);

  let payload = await buildSportPayload(sport, withOdds, oddsScope);
  payload = applyInplayInferenceToPayload(payload, sport);

  const { stored, quality } = await maybePersistOddsPayload(
    sport,
    withOdds,
    oddsScope,
    payload
  );

  const ms = Date.now() - started;
  const count = payload?.matches?.length ?? 0;
  const oddsNote =
    withOdds && quality
      ? ` odds=${quality.withOdds}/${quality.total}${stored ? '' : ' (not stored)'}`
      : '';
  console.log(`[SportsCache] refreshed ${key} (${count} matches, ${ms}ms${oddsNote})`);
  return payload;
}

/**
 * Scan Redis odds keys — delete incomplete entries and force provider refresh.
 */
export async function repairIncompleteOddsCache() {
  const repaired = [];

  for (const job of ODDS_CACHE_JOBS) {
    const key = toSportsCacheKey(job.sport, job.withOdds, job.oddsScope);
    const cached = await getCachedSportsPayload(
      job.sport,
      job.withOdds,
      job.oddsScope
    );

    if (!cached?.matches?.length) continue;

    const quality = assessOddsCacheQuality(cached, job.oddsScope);
    if (quality.complete) continue;

    console.log(
      `[SportsCache] repair ${key} — incomplete odds ${quality.withOdds}/${quality.total} (featured ${quality.featuredWithOdds}/${quality.featured})`
    );
    await invalidateSportsCacheEntry(job.sport, job.withOdds, job.oddsScope);

    try {
      await refreshSportsCacheEntry(job.sport, job.withOdds, job.oddsScope);
      repaired.push(key);
    } catch (err) {
      console.error(`[SportsCache] repair failed ${key}:`, err.message);
    }
  }

  return repaired;
}

/**
 * Serve listing API: cache first, live provider fetch on miss.
 * Incomplete odds cache is treated as a miss (no stale empty odds).
 */
export async function serveSportsListRequest(sport, withOdds, oddsScope) {
  let cached = await getCachedSportsPayload(sport, withOdds, oddsScope);

  if (cached && withOdds && !isOddsPayloadComplete(cached, oddsScope)) {
    const key = toSportsCacheKey(sport, withOdds, oddsScope);
    const q = assessOddsCacheQuality(cached, oddsScope);
    console.warn(
      `[SportsCache] reject incomplete cache ${key} (${q.withOdds}/${q.total}) — live fetch`
    );
    await invalidateSportsCacheEntry(sport, withOdds, oddsScope);
    cached = null;
  }

  if (cached) {
    return filterFullyDisabledFromPayload(cached, sport);
  }

  // Cold start: eligible odds while full odds cache warms (only if complete)
  if (withOdds && oddsScope === 'all') {
    const eligible = await getCachedSportsPayload(sport, true, 'eligible');
    if (eligible?.matches?.length && isOddsPayloadComplete(eligible, 'eligible')) {
      return filterFullyDisabledFromPayload(eligible, sport);
    }
  }

  console.warn(
    `[SportsCache] miss ${toSportsCacheKey(sport, withOdds, oddsScope)} — live fetch`
  );
  let payload = await buildSportPayload(sport, withOdds, oddsScope);
  payload = applyInplayInferenceToPayload(payload, sport);
  await maybePersistOddsPayload(sport, withOdds, oddsScope, payload);
  return filterFullyDisabledFromPayload(payload, sport);
}

/** Stale cache for error fallback — prefer complete odds over list-only. */
export async function getAnyCachedSportPayload(sport) {
  const jobs = [
    { sport, withOdds: true, oddsScope: 'all' },
    { sport, withOdds: true, oddsScope: 'eligible' },
    { sport, withOdds: false, oddsScope: 'eligible' },
  ];
  for (const job of jobs) {
    const hit = await getCachedSportsPayload(
      job.sport,
      job.withOdds,
      job.oddsScope
    );
    if (!hit?.matches?.length) continue;
    if (job.withOdds && !isOddsPayloadComplete(hit, job.oddsScope)) continue;
    return hit;
  }
  return null;
}
