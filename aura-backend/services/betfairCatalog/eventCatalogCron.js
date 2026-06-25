import cron from 'node-cron';

import { isProviderDActive } from './catalogUtils.js';
import { syncAllEventCatalogs } from './eventSync.js';

let syncing = false;

const SYNC_ENABLED = process.env.BETFAIR_EVENT_SYNC_ENABLED !== 'false';
const SYNC_MIN = Number(process.env.BETFAIR_EVENT_SYNC_MIN) || 15;

async function runEventCatalogSync() {
  if (syncing) return;
  syncing = true;

  try {
    await syncAllEventCatalogs();
  } finally {
    syncing = false;
  }
}

export function startEventCatalogCron() {
  if (!SYNC_ENABLED) {
    console.log(
      '[BetfairCatalog] Event sync disabled (BETFAIR_EVENT_SYNC_ENABLED=false)'
    );
    return;
  }

  if (!isProviderDActive()) {
    console.log('[BetfairCatalog] Event sync skipped — API_PROVIDER is not providerD');
    return;
  }

  const cronExpr = `*/${SYNC_MIN} * * * *`;
  console.log(
    `[BetfairCatalog] Event sync every ${SYNC_MIN} min (cricket/soccer/tennis)`
  );

  runEventCatalogSync().catch((err) =>
    console.error('[BetfairCatalog] initial event sync failed:', err.message)
  );

  cron.schedule(cronExpr, () => {
    runEventCatalogSync().catch((err) =>
      console.error('[BetfairCatalog] event cron sync failed:', err.message)
    );
  });
}

export default startEventCatalogCron;
