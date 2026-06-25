import { isProviderDActive } from './catalogUtils.js';
import { syncAllMatchOdds } from './oddsSync.js';

let syncing = false;
let intervalRef = null;
let tickCount = 0;

const SYNC_ENABLED = process.env.BETFAIR_ODDS_SYNC_ENABLED !== 'false';
const SYNC_MS = Number(process.env.BETFAIR_ODDS_SYNC_MS) || 1000;
const LOG_EVERY_TICKS = Number(process.env.BETFAIR_ODDS_LOG_EVERY) || 60;

async function runOddsSyncTick() {
  if (syncing) return;
  syncing = true;
  tickCount += 1;

  try {
    const summary = await syncAllMatchOdds();
    if (tickCount % LOG_EVERY_TICKS === 0 && summary.total > 0) {
      console.log(
        `[BetfairCatalog] odds heartbeat — ${summary.success}/${summary.total} markets, ${summary.ms}ms`
      );
    }
  } catch (err) {
    console.error('[BetfairCatalog] odds sync tick failed:', err.message);
  } finally {
    syncing = false;
  }
}

export function startOddsSyncCron() {
  if (!SYNC_ENABLED) {
    console.log(
      '[BetfairCatalog] Odds sync disabled (BETFAIR_ODDS_SYNC_ENABLED=false)'
    );
    return;
  }

  if (!isProviderDActive()) {
    console.log('[BetfairCatalog] Odds sync skipped — API_PROVIDER is not providerD');
    return;
  }

  console.log(
    `[BetfairCatalog] Match odds sync every ${SYNC_MS}ms via /betfair/market-odds`
  );

  runOddsSyncTick().catch((err) =>
    console.error('[BetfairCatalog] initial odds sync failed:', err.message)
  );

  intervalRef = setInterval(() => {
    runOddsSyncTick().catch((err) =>
      console.error('[BetfairCatalog] odds interval failed:', err.message)
    );
  }, SYNC_MS);
}

export function stopOddsSyncCron() {
  if (intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
  }
}

export default startOddsSyncCron;
