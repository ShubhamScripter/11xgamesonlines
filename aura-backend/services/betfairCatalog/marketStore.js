import BetfairEvent from '../../models/betfairEventModel.js';
import BetfairEventMarket from '../../models/betfairEventMarketModel.js';

const DEFAULT_STALE_MIN = Number(process.env.BETFAIR_MARKET_STALE_MIN) || 10;

export function isMatchOddsMarketName(marketName = '') {
  return String(marketName).toLowerCase().includes('match odds');
}

export function findMatchOddsMarket(markets = []) {
  return (
    markets.find((m) => isMatchOddsMarketName(m.marketName || m.name)) || null
  );
}

function rowToMarketShape(row) {
  if (!row) return null;
  if (row.raw && typeof row.raw === 'object') {
    return {
      ...row.raw,
      marketId: row.marketId,
      marketName: row.marketName || row.raw.marketName || '',
      runners: row.runners?.length ? row.runners : row.raw.runners || [],
    };
  }
  return {
    marketId: row.marketId,
    marketName: row.marketName || '',
    runners: row.runners || [],
  };
}

export async function getMarketsForEvent(eventId) {
  const rows = await BetfairEventMarket.find({ eventId: String(eventId) })
    .sort({ isMatchOdds: -1, marketName: 1 })
    .lean();
  return rows.map(rowToMarketShape).filter(Boolean);
}

export async function getMatchOddsMarketMeta(eventId) {
  const row = await BetfairEventMarket.findOne({
    eventId: String(eventId),
    isMatchOdds: true,
  }).lean();

  if (!row) return null;

  const market = rowToMarketShape(row);
  if (!market?.marketId) return null;

  return {
    marketId: String(market.marketId),
    runners: market.runners || [],
  };
}

export async function getMatchOddsMetaByEventIds(eventIds = []) {
  const ids = [...new Set(eventIds.map(String).filter(Boolean))];
  const meta = new Map();
  if (!ids.length) return meta;

  const rows = await BetfairEventMarket.find({
    eventId: { $in: ids },
    isMatchOdds: true,
  }).lean();

  for (const row of rows) {
    const market = rowToMarketShape(row);
    if (!market?.marketId) continue;
    meta.set(String(row.eventId), {
      marketId: String(market.marketId),
      runners: market.runners || [],
      sportId: row.sportId,
    });
  }

  return meta;
}

export async function getLatestMarketSyncAt(eventId) {
  const latest = await BetfairEventMarket.findOne({ eventId: String(eventId) })
    .sort({ syncedAt: -1 })
    .select('syncedAt')
    .lean();
  return latest?.syncedAt ?? null;
}

export async function isEventMarketsFresh(
  eventId,
  maxAgeMin = DEFAULT_STALE_MIN
) {
  const syncedAt = await getLatestMarketSyncAt(eventId);
  if (!syncedAt) return false;
  const ageMs = Date.now() - new Date(syncedAt).getTime();
  return ageMs <= maxAgeMin * 60 * 1000;
}

export async function hasMarketsForEvent(eventId) {
  const count = await BetfairEventMarket.countDocuments({
    eventId: String(eventId),
  });
  return count > 0;
}

export async function getSportIdForEvent(eventId) {
  const row = await BetfairEvent.findOne({ eventId: String(eventId) })
    .select('sportId')
    .lean();
  return row?.sportId ?? null;
}

export async function getLatestSportMarketSyncAt(sportId) {
  const latest = await BetfairEventMarket.findOne({ sportId: Number(sportId) })
    .sort({ syncedAt: -1 })
    .select('syncedAt')
    .lean();
  return latest?.syncedAt ?? null;
}

export async function isSportMarketCatalogFresh(
  sportId,
  maxAgeMin = DEFAULT_STALE_MIN
) {
  const syncedAt = await getLatestSportMarketSyncAt(sportId);
  if (!syncedAt) return false;
  const ageMs = Date.now() - new Date(syncedAt).getTime();
  return ageMs <= maxAgeMin * 60 * 1000;
}

export async function hasSportMarketCatalogEntries(sportId) {
  const count = await BetfairEventMarket.countDocuments({
    sportId: Number(sportId),
  });
  return count > 0;
}
