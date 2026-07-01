import cron from 'node-cron';

import { isProviderDActive } from './catalogUtils.js';
import { syncAllMarketCatalogs } from './marketSync.js';

let syncing = false;

const SYNC_ENABLED = process.env.BETFAIR_MARKET_SYNC_ENABLED !== 'false';
const SYNC_MIN = Number(process.env.BETFAIR_MARKET_SYNC_MIN) || 20;

async function runMarketCatalogSync() {
  if (syncing) return;
  syncing = true;

  try {
    await syncAllMarketCatalogs();
  } finally {
    syncing = false;
  }
}

export function startMarketCatalogCron() {
  if (!SYNC_ENABLED) {
    console.log(
      '[BetfairCatalog] Market sync disabled (BETFAIR_MARKET_SYNC_ENABLED=false)'
    );
    return;
  }

  if (!isProviderDActive()) {
    console.log(
      '[BetfairCatalog] Market sync skipped — API_PROVIDER is not providerD'
    );
    return;
  }

  const cronExpr = `*/${SYNC_MIN} * * * *`;
  console.log(
    `[BetfairCatalog] Market sync every ${SYNC_MIN} min (market-all-list per event)`
  );

  const initialDelayMin = Number(process.env.BETFAIR_MARKET_SYNC_START_DELAY_MIN) || 3;
  console.log(
    `[BetfairCatalog] Initial market sync in ${initialDelayMin} min (avoids startup burst)`
  );
  setTimeout(() => {
    runMarketCatalogSync().catch((err) =>
      console.error('[BetfairCatalog] initial market sync failed:', err.message)
    );
  }, initialDelayMin * 60 * 1000);

  cron.schedule(cronExpr, () => {
    runMarketCatalogSync().catch((err) =>
      console.error('[BetfairCatalog] market cron sync failed:', err.message)
    );
  });
}

export default startMarketCatalogCron;
