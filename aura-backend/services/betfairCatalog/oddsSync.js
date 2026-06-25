import BetfairEventMarket from '../../models/betfairEventMarketModel.js';
import { mapPool } from '../matchApi/providerDHelpers.js';
import { broadcastListOddsUpdate } from './oddsBroadcast.js';
import { makeOddsContentHash, normalizeMarketOddsToBook } from './oddsHelpers.js';
import { formatListOddsUpdate, sportIdToName } from './listOddsFormat.js';
import {
  getMatchOddsSyncTargets,
  getOddsFromMemory,
  setOddsInMemory,
} from './oddsStore.js';
import { winkaroGet } from './winkaroClient.js';

const SYNC_CONCURRENCY =
  Number(process.env.BETFAIR_ODDS_SYNC_CONCURRENCY) || 8;

function storeMarketOddsInMemory(row, book) {
  const hash = makeOddsContentHash(book);
  const now = new Date();
  const existing = getOddsFromMemory(row.eventId, row.marketId);
  const changed = !existing || existing.contentHash !== hash;

  setOddsInMemory(row.eventId, row.marketId, {
    eventId: String(row.eventId),
    marketId: String(row.marketId),
    sportId: Number(row.sportId),
    runners: row.runners || [],
    book,
    contentHash: hash,
    syncedAt: now,
  });

  return { changed };
}

async function syncOddsForMarketRow(row, broadcastBySport) {
  const eventId = String(row.eventId);
  const marketId = String(row.marketId);
  const raw = await winkaroGet(`/betfair/market-odds/${eventId}/${marketId}`);
  const book = normalizeMarketOddsToBook(raw, marketId);

  if (!book.runners?.length) {
    return { ok: false, reason: 'no_runners' };
  }

  const { changed } = storeMarketOddsInMemory(row, book);
  if (changed) {
    const sport = sportIdToName(row.sportId);
    if (!broadcastBySport.has(sport)) broadcastBySport.set(sport, []);
    broadcastBySport.get(sport).push(formatListOddsUpdate(row, book));
  }

  return { ok: true, changed };
}

export async function syncAllMatchOdds() {
  const targets = await getMatchOddsSyncTargets();
  if (!targets.length) {
    return {
      total: 0,
      success: 0,
      failed: 0,
      changed: 0,
      ms: 0,
    };
  }

  const started = Date.now();
  let success = 0;
  let failed = 0;
  let changed = 0;
  const broadcastBySport = new Map();

  await mapPool(
    targets,
    async (row) => {
      try {
        const result = await syncOddsForMarketRow(row, broadcastBySport);
        if (result.ok) {
          success += 1;
          if (result.changed) changed += 1;
        } else {
          failed += 1;
        }
      } catch (err) {
        failed += 1;
        console.warn(
          `[BetfairCatalog] market-odds failed event=${row.eventId} market=${row.marketId}:`,
          err.message
        );
      }
    },
    SYNC_CONCURRENCY
  );

  for (const [sport, updates] of broadcastBySport) {
    broadcastListOddsUpdate(sport, updates);
  }

  const summary = {
    total: targets.length,
    success,
    failed,
    changed,
    ms: Date.now() - started,
  };

  if (summary.failed > 0 || summary.changed > 0) {
    console.log(
      `[BetfairCatalog] odds sync: ${summary.success}/${summary.total} ok, ` +
        `${summary.changed} changed, ${summary.failed} failed (${summary.ms}ms)`
    );
  }

  return summary;
}

export async function fetchAndStoreMarketOdds(
  eventId,
  marketId,
  sportId,
  runners = []
) {
  let resolvedRunners = runners;
  let resolvedSportId = sportId;

  if (!resolvedRunners.length || resolvedSportId == null) {
    const marketRow = await BetfairEventMarket.findOne({
      eventId: String(eventId),
      marketId: String(marketId),
      isMatchOdds: true,
    })
      .select('runners sportId')
      .lean();
    if (marketRow) {
      resolvedRunners = marketRow.runners || resolvedRunners;
      resolvedSportId = marketRow.sportId ?? resolvedSportId;
    }
  }

  const row = {
    eventId: String(eventId),
    marketId: String(marketId),
    sportId: Number(resolvedSportId),
    runners: resolvedRunners,
  };

  const broadcastBySport = new Map();
  const result = await syncOddsForMarketRow(row, broadcastBySport);
  for (const [sport, updates] of broadcastBySport) {
    broadcastListOddsUpdate(sport, updates);
  }
  return result;
}
