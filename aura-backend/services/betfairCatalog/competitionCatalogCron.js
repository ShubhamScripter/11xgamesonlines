import cron from 'node-cron';

import { isProviderDActive } from './catalogUtils.js';
import { syncAllCompetitionCatalogs } from './competitionSync.js';

let syncing = false;

const SYNC_ENABLED = process.env.BETFAIR_COMPETITION_SYNC_ENABLED !== 'false';
const SYNC_MIN = Number(process.env.BETFAIR_COMPETITION_SYNC_MIN) || 30;

async function runCompetitionCatalogSync() {
  if (syncing) return;
  syncing = true;

  try {
    await syncAllCompetitionCatalogs();
  } finally {
    syncing = false;
  }
}

export function startCompetitionCatalogCron() {
  if (!SYNC_ENABLED) {
    console.log(
      '[BetfairCatalog] Competition sync disabled (BETFAIR_COMPETITION_SYNC_ENABLED=false)'
    );
    return;
  }

  if (!isProviderDActive()) {
    console.log('[BetfairCatalog] Skipped — API_PROVIDER is not providerD');
    return;
  }

  const cronExpr = `*/${SYNC_MIN} * * * *`;
  console.log(
    `[BetfairCatalog] Competition sync every ${SYNC_MIN} min (cricket/soccer/tennis)`
  );

  runCompetitionCatalogSync().catch((err) =>
    console.error('[BetfairCatalog] initial sync failed:', err.message)
  );

  cron.schedule(cronExpr, () => {
    runCompetitionCatalogSync().catch((err) =>
      console.error('[BetfairCatalog] cron sync failed:', err.message)
    );
  });
}

export default startCompetitionCatalogCron;
