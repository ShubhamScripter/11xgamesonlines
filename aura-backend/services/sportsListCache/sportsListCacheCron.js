import cron from 'node-cron';

import { tryAcquireCronLock } from './cacheStore.js';
import {
  CRON_CACHE_JOBS,
  refreshSportsCacheEntry,
  repairIncompleteOddsCache,
} from './sportsListCacheService.js';

let refreshing = false;
let repairing = false;

const CRON_SEC = Number(process.env.SPORTS_CACHE_CRON_SEC) || 15;
const REPAIR_SEC = Number(process.env.SPORTS_CACHE_REPAIR_SEC) || 20;
const CRON_ENABLED = process.env.SPORTS_CACHE_CRON_ENABLED !== 'false';
const REPAIR_ENABLED = process.env.SPORTS_CACHE_REPAIR_ENABLED !== 'false';

async function runSportsCacheRefresh() {
  if (refreshing) return;

  const hasLock = await tryAcquireCronLock(CRON_SEC + 5);
  if (!hasLock) return;

  refreshing = true;
  const batchStart = Date.now();

  try {
    for (const job of CRON_CACHE_JOBS) {
      try {
        await refreshSportsCacheEntry(
          job.sport,
          job.withOdds,
          job.oddsScope
        );
      } catch (err) {
        console.error(
          `[SportsCache] refresh failed ${job.sport} withOdds=${job.withOdds} scope=${job.oddsScope}:`,
          err.message
        );
      }
    }
    console.log(
      `[SportsCache] batch done in ${Date.now() - batchStart}ms`
    );
  } finally {
    refreshing = false;
  }
}

/** Re-fetch odds keys when Redis has matches but missing prices. */
async function runOddsCacheRepair() {
  if (repairing || refreshing) return;

  const hasLock = await tryAcquireCronLock(REPAIR_SEC + 5);
  if (!hasLock) return;

  repairing = true;
  const started = Date.now();

  try {
    const repaired = await repairIncompleteOddsCache();
    if (repaired.length > 0) {
      console.log(
        `[SportsCache] repair done in ${Date.now() - started}ms — fixed: ${repaired.join(', ')}`
      );
    }
  } catch (err) {
    console.error('[SportsCache] repair tick failed:', err.message);
  } finally {
    repairing = false;
  }
}

export function startSportsListCacheCron() {
  if (!CRON_ENABLED) {
    console.log('[SportsCache] Cron disabled (SPORTS_CACHE_CRON_ENABLED=false)');
    return;
  }

  const expr = `*/${CRON_SEC} * * * * *`;
  console.log(
    `[SportsCache] Cron every ${CRON_SEC}s — list + odds (eligible + all) for cricket / soccer / tennis`
  );

  runSportsCacheRefresh().catch((err) =>
    console.error('[SportsCache] initial warm failed:', err.message)
  );

  cron.schedule(expr, () => {
    runSportsCacheRefresh().catch((err) =>
      console.error('[SportsCache] cron tick failed:', err.message)
    );
  });

  if (REPAIR_ENABLED) {
    const repairExpr = `*/${REPAIR_SEC} * * * * *`;
    console.log(
      `[SportsCache] Odds repair cron every ${REPAIR_SEC}s — refreshes Redis when odds missing`
    );

    setTimeout(() => {
      runOddsCacheRepair().catch((err) =>
        console.error('[SportsCache] initial repair failed:', err.message)
      );
    }, 8000);

    cron.schedule(repairExpr, () => {
      runOddsCacheRepair().catch((err) =>
        console.error('[SportsCache] repair cron failed:', err.message)
      );
    });
  }
}

export default startSportsListCacheCron;
