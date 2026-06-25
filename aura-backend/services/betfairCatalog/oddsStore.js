import BetfairEvent from '../../models/betfairEventModel.js';
import BetfairEventMarket from '../../models/betfairEventMarketModel.js';

const DEFAULT_STALE_MS = Number(process.env.BETFAIR_ODDS_STALE_MS) || 3000;
const memoryOdds = new Map();

function memoryKey(eventId, marketId) {
  return `${String(eventId)}:${String(marketId)}`;
}

export function setOddsInMemory(eventId, marketId, entry) {
  memoryOdds.set(memoryKey(eventId, marketId), entry);
}

export function getOddsFromMemory(eventId, marketId) {
  return memoryOdds.get(memoryKey(eventId, marketId)) || null;
}

export async function getMatchOddsSyncTargets() {
  const markets = await BetfairEventMarket.find({ isMatchOdds: true })
    .select('sportId eventId marketId runners')
    .lean();

  if (!markets.length) return [];

  const eventIds = [...new Set(markets.map((m) => String(m.eventId)))];
  const events = await BetfairEvent.find({ eventId: { $in: eventIds } })
    .select('eventId openDate name')
    .lean();
  const eventById = new Map(events.map((e) => [String(e.eventId), e]));

  return markets.map((m) => {
    const ev = eventById.get(String(m.eventId));
    return {
      ...m,
      openDate: ev?.openDate || '',
      eventName: ev?.name || '',
    };
  });
}

export function getOddsBookForEvent(eventId, marketId = null) {
  const eid = String(eventId);
  const memEntries = [...memoryOdds.values()].filter(
    (e) => String(e.eventId) === eid
  );
  if (!memEntries.length) return null;

  if (marketId) {
    const hit = memEntries.find(
      (e) => String(e.marketId) === String(marketId)
    );
    return hit?.book ?? null;
  }

  const freshest = memEntries.sort(
    (a, b) => new Date(b.syncedAt) - new Date(a.syncedAt)
  )[0];
  return freshest?.book ?? null;
}

export function getOddsBooksByEventIds(eventIds = []) {
  const ids = [...new Set(eventIds.map(String).filter(Boolean))];
  const books = new Map();
  if (!ids.length) return books;

  for (const eventId of ids) {
    const book = getOddsBookForEvent(eventId);
    if (book) books.set(eventId, book);
  }

  return books;
}

export function isOddsFreshInMemory(eventId, maxAgeMs = DEFAULT_STALE_MS) {
  const entries = [...memoryOdds.values()].filter(
    (e) => String(e.eventId) === String(eventId)
  );
  if (!entries.length) return false;

  const newest = entries.sort(
    (a, b) => new Date(b.syncedAt) - new Date(a.syncedAt)
  )[0];
  const ageMs = Date.now() - new Date(newest.syncedAt).getTime();
  return ageMs <= maxAgeMs;
}

export function hasOddsForEvent(eventId) {
  return isOddsFreshInMemory(eventId, DEFAULT_STALE_MS * 2);
}

export function getOddsMemoryStats() {
  return {
    entries: memoryOdds.size,
  };
}
