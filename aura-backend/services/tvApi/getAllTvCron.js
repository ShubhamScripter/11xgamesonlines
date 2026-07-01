import cron from 'node-cron';

import { bootLog } from '../../config/silenceConsole.js';
import { syncAllTvFromRemoteSafe } from './getAllTvService.js';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const CRON_ENABLED =
  IS_PRODUCTION && process.env.GET_ALL_TV_CRON_ENABLED !== 'false';
const CRON_MIN = Number(process.env.GET_ALL_TV_CRON_MIN) || 1;

let refreshing = false;

async function refreshTvCache() {
  if (refreshing) return;
  refreshing = true;
  try {
    await syncAllTvFromRemoteSafe();
  } finally {
    refreshing = false;
  }
}

export function startGetAllTvCron() {
  if (!CRON_ENABLED) {
    if (!IS_PRODUCTION) {
      bootLog('[getAllTv] cron skipped (local/dev — production only)');
    }
    return;
  }

  const expr = CRON_MIN === 1 ? '* * * * *' : `*/${CRON_MIN} * * * *`;
  cron.schedule(expr, refreshTvCache);
  refreshTvCache();
  bootLog(`[getAllTv] cron started (every ${CRON_MIN} min)`);
}
