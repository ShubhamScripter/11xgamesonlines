import crypto from 'crypto';

import BetfairEvent from '../../models/betfairEventModel.js';
import BetfairEventMarket from '../../models/betfairEventMarketModel.js';
import { extractBetfairArray, mapPool } from '../matchApi/providerDHelpers.js';
import { BETFAIR_CATALOG_SPORT_IDS } from './competitionStore.js';
import { isMatchOddsMarketName } from './marketStore.js';
import { syncEventsForSport } from './eventSync.js';
import { winkaroGet } from './winkaroClient.js';

const MARKET_FETCH_CONCURRENCY =
  Number(process.env.BETFAIR_MARKET_FETCH_CONCURRENCY) || 2;

function makeMarketContentHash(market) {
  const payload = JSON.stringify({
    marketId: String(market.marketId),
    marketName: String(market.marketName || ''),
    runners: (market.runners || []).map((r) => ({
      selectionId: r.selectionId,
      runnerName: r.runnerName,
    })),
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

export function normalizeMarketItem(meta) {
  const marketId = String(meta?.marketId ?? meta?.id ?? '').trim();
  if (!marketId) return null;

  const marketName = String(meta?.marketName ?? meta?.name ?? '').trim();
  const runners = Array.isArray(meta?.runners) ? meta.runners : [];

  return {
    marketId,
    marketName,
    isMatchOdds: isMatchOddsMarketName(marketName),
    runners,
    raw: meta,
  };
}

async function fetchMarketsFromApi(eventId) {
  const data = await winkaroGet(`/betfair/market-all-list/${eventId}`);
  return extractBetfairArray(data).map(normalizeMarketItem).filter(Boolean);
}

/**
 * Sync market-all-list for one event.
 */
export async function syncMarketsForEvent(eventId, sportId, options = {}) {
  const eid = String(eventId);
  const sid = Number(sportId);
  const freshList = Array.isArray(options.preloaded)
    ? options.preloaded.map(normalizeMarketItem).filter(Boolean)
    : await fetchMarketsFromApi(eid);

  const now = new Date();
  const freshMarketIds = freshList.map((m) => m.marketId);

  let inserted = 0;
  let updated = 0;
  let unchanged = 0;

  for (const market of freshList) {
    const hash = makeMarketContentHash(market);
    const existing = await BetfairEventMarket.findOne({
      eventId: eid,
      marketId: market.marketId,
    })
      .select('contentHash')
      .lean();

    if (existing?.contentHash === hash) {
      unchanged += 1;
      continue;
    }

    await BetfairEventMarket.updateOne(
      { eventId: eid, marketId: market.marketId },
      {
        $set: {
          sportId: sid,
          marketName: market.marketName,
          isMatchOdds: market.isMatchOdds,
          runners: market.runners,
          contentHash: hash,
          raw: market.raw,
          syncedAt: now,
        },
      },
      { upsert: true }
    );

    if (existing) updated += 1;
    else inserted += 1;
  }

  let deleted = 0;
  if (freshMarketIds.length > 0) {
    const deleteResult = await BetfairEventMarket.deleteMany({
      eventId: eid,
      marketId: { $nin: freshMarketIds },
    });
    deleted = deleteResult.deletedCount ?? 0;
  } else {
    console.warn(
      `[BetfairCatalog] event ${eid}: empty market list — skipping stale delete`
    );
  }

  return {
    eventId: eid,
    sportId: sid,
    total: freshList.length,
    inserted,
    updated,
    unchanged,
    deleted,
  };
}

export async function syncMarketsForSport(sportId) {
  const sid = Number(sportId);
  let events = await BetfairEvent.find({ sportId: sid })
    .select('eventId sportId')
    .lean();

  if (!events.length) {
    await syncEventsForSport(sid);
    events = await BetfairEvent.find({ sportId: sid })
      .select('eventId sportId')
      .lean();
  }

  if (!events.length) {
    console.warn(`[BetfairCatalog] sport ${sid}: no events — skip market sync`);
    return {
      sportId: sid,
      events: 0,
      total: 0,
      inserted: 0,
      updated: 0,
      unchanged: 0,
      deleted: 0,
    };
  }

  const eventIds = events.map((e) => String(e.eventId));
  let total = 0;
  let inserted = 0;
  let updated = 0;
  let unchanged = 0;
  let deleted = 0;

  await mapPool(
    events,
    async (eventRow) => {
      try {
        const summary = await syncMarketsForEvent(
          eventRow.eventId,
          eventRow.sportId
        );
        total += summary.total;
        inserted += summary.inserted;
        updated += summary.updated;
        unchanged += summary.unchanged;
        deleted += summary.deleted;
      } catch (err) {
        console.warn(
          `[BetfairCatalog] market sync failed event=${eventRow.eventId}:`,
          err.message
        );
      }
    },
    MARKET_FETCH_CONCURRENCY
  );

  if (eventIds.length > 0) {
    const orphanResult = await BetfairEventMarket.deleteMany({
      sportId: sid,
      eventId: { $nin: eventIds },
    });
    deleted += orphanResult.deletedCount ?? 0;
  }

  const summary = {
    sportId: sid,
    events: events.length,
    total,
    inserted,
    updated,
    unchanged,
    deleted,
  };

  console.log(
    `[BetfairCatalog] synced markets sport ${sid}: ${summary.total} markets ` +
      `for ${summary.events} events ` +
      `(${summary.inserted} new, ${summary.updated} updated, ` +
      `${summary.unchanged} unchanged, ${summary.deleted} deleted)`
  );

  return summary;
}

export async function syncAllMarketCatalogs() {
  const results = [];
  for (const sportId of BETFAIR_CATALOG_SPORT_IDS) {
    try {
      results.push(await syncMarketsForSport(sportId));
    } catch (err) {
      console.error(
        `[BetfairCatalog] market sync failed for sport ${sportId}:`,
        err.message
      );
    }
  }
  return results;
}
