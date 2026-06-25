import cron from 'node-cron';

import { getAllTvMap } from './getAllTvService.js';

const CRON_ENABLED = process.env.GET_ALL_TV_CRON_ENABLED !== 'false';
const CRON_MIN = Number(process.env.GET_ALL_TV_CRON_MIN) || 3;

let refreshing = false;

async function refreshTvCache() {
  if (refreshing) return;
  refreshing = true;
  try {
    await getAllTvMap({ force: true });
    console.log('[getAllTv] cache refreshed');
  } catch (err) {
    console.error('[getAllTv] cron refresh failed:', err.message);
  } finally {
    refreshing = false;
  }
}

export function startGetAllTvCron() {
  if (!CRON_ENABLED) return;

  const expr = `*/${CRON_MIN} * * * *`;
  cron.schedule(expr, refreshTvCache);
  refreshTvCache();
  console.log(`[getAllTv] cron started (every ${CRON_MIN} min)`);
}
